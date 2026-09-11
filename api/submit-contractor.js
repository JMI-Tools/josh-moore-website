// Contractor intake handler for /contractors.
//
// Writes to the Turso database `contractor-intake` and nothing else. That database is
// deliberately isolated from the flip business data, and TURSO_CONTRACTOR_TOKEN is
// scoped to it alone, so a compromise here reaches a contractor list and stops.
//
// Two writes per submission:
//   submissions  the raw payload, immutable, never rewritten
//   contractors  the working row
// If the form changes later, nothing already collected is lost or reshaped.

const DB_URL = process.env.TURSO_CONTRACTOR_URL;
const DB_TOKEN = process.env.TURSO_CONTRACTOR_TOKEN;

async function pipeline(statements) {
  const res = await fetch(`${DB_URL}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${DB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: statements
        .map((s) => ({ type: 'execute', stmt: s }))
        .concat([{ type: 'close' }]),
    }),
  });
  if (!res.ok) throw new Error(`database returned ${res.status}`);
  const out = await res.json();
  const failed = (out.results || []).find((r) => r.type === 'error');
  if (failed) throw new Error(failed.error && failed.error.message ? failed.error.message : 'database write failed');
  return out;
}

const text = (v) => (v === null || v === undefined || v === '' ? { type: 'null' } : { type: 'text', value: String(v) });
const int = (v) => (v === null || v === undefined ? { type: 'null' } : { type: 'integer', value: v ? '1' : '0' });
const json = (v) => ({ type: 'text', value: JSON.stringify(v == null ? null : v) });

// Strip control characters only. Spaces, hyphens and parentheses are real content
// here: "Battle Creek" and "(269) 555-0188" have to survive intact.
function clean(s, max) {
  if (s === null || s === undefined) return null;
  var kept = '';
  var str = String(s);
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);
    if (code >= 32 && code !== 127) kept += str[i];
  }
  return kept.trim().slice(0, max) || null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  if (!DB_URL || !DB_TOKEN) {
    console.error('[submit-contractor] TURSO_CONTRACTOR_URL or TURSO_CONTRACTOR_TOKEN is not set');
    return res.status(500).json({ success: false, error: 'Intake is not configured yet.' });
  }

  const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  // Only the fields the form actually sends. Anything else on the wire is ignored.
  const name = clean(d.name, 120);
  const phone = clean(d.phone, 40);
  const email = clean(d.email, 200);
  if (!name || !phone || !email) {
    return res.status(400).json({ success: false, error: 'Name, phone and email are required.' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'That email address does not look right.' });
  }

  const trades = Array.isArray(d.trades) ? d.trades.map((t) => clean(t, 60)).filter(Boolean).slice(0, 60) : [];
  const areas = Array.isArray(d.areas) ? d.areas.map((a) => clean(a, 60)).filter(Boolean).slice(0, 40) : [];
  const refs = Array.isArray(d.references)
    ? d.references.map((r) => ({ name: clean(r && r.name, 120), phone: clean(r && r.phone, 40) })).slice(0, 4)
    : [];
  const lic = d.license || {};
  const ins = d.insurance || {};
  const avail = d.availability || {};
  const links = d.links || {};

  const id = 'ctr_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  try {
    await pipeline([
      {
        sql: 'INSERT INTO submissions (contractor_id, user_agent, payload) VALUES (?, ?, ?)',
        args: [text(id), text(clean(req.headers['user-agent'], 400)), json(d)],
      },
      {
        sql: `INSERT INTO contractors (
          id,status,source,name,company,phone,sms_capable,email,contact_pref,trades,primary_trade,
          years,crew,capacity,licensed,license_type,license_kind,license_number,license_state,license_expires,
          insured,ins_carrier,ins_coverage,ins_expires,ins_coi_available,workers_comp,areas,radius,areas_avoid,
          pricing_model,rate,accepts_1099,lead_time,weekends,link_website,link_facebook,link_instagram,
          link_google,link_photos,refs,notes
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          text(id), text('new'), text(clean(d.source, 120)),
          text(name), text(clean(d.company, 160)), text(phone), int(d.smsCapable),
          text(email), text(clean(d.contactPref, 20)),
          json(trades), text(clean(d.primaryTrade, 60)),
          text(clean(d.years, 40)), text(clean(d.crew, 40)), text(clean(d.capacity, 10)),
          int(d.licensed), text(clean(d.licenseType, 40)),
          text(clean(lic.kind, 120)), text(clean(lic.number, 80)), text(clean(lic.state, 10)), text(clean(lic.expires, 20)),
          int(d.insured), text(clean(ins.carrier, 120)), text(clean(ins.coverage, 40)), text(clean(ins.expires, 20)), int(ins.coiAvailable),
          text(clean(d.workersComp, 20)),
          json(areas), text(clean(d.radius, 60)), text(clean(d.areasAvoid, 200)),
          text(clean(d.pricingModel, 20)), text(clean(d.rate, 120)), text(clean(d.accepts1099, 20)),
          text(clean(avail.leadTime, 40)), text(clean(avail.weekends, 20)),
          text(clean(links.website, 300)), text(clean(links.facebook, 300)), text(clean(links.instagram, 300)),
          text(clean(links.google, 300)), text(clean(links.photos, 500)),
          json(refs), text(clean(d.notes, 2000)),
        ],
      },
    ]);

    return res.status(200).json({ success: true, id });
  } catch (err) {
    // The raw submission is the thing we cannot afford to lose, so try it alone.
    console.error('[submit-contractor]', err && err.message);
    try {
      await pipeline([
        {
          sql: 'INSERT INTO submissions (contractor_id, user_agent, payload) VALUES (?, ?, ?)',
          args: [text(id + '_partial'), text(clean(req.headers['user-agent'], 400)), json(d)],
        },
      ]);
    } catch (e2) {
      console.error('[submit-contractor] raw save also failed:', e2 && e2.message);
      return res.status(500).json({ success: false, error: 'We could not save that. Please try again.' });
    }
    return res.status(200).json({ success: true, id, partial: true });
  }
}
