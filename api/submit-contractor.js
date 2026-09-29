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
//
// After the writes land, Josh gets an email through api/_lib/notify.js. The alert
// never fails the submission; if it cannot send, it logs and the row still stands.
//
// Same origin only. The site posts to its own /api path, so there are no CORS
// headers here and no preflight branch; a cross-origin page cannot read the reply.

import { notifyJosh, looksLikeBot } from './_lib/notify.js';

const DB_URL = process.env.TURSO_CONTRACTOR_URL;
const DB_TOKEN = process.env.TURSO_CONTRACTOR_TOKEN;

// The raw payload is stored as typed. A real submission is a few thousand
// characters; anything past this is not a contractor filling in a form.
const MAX_PAYLOAD_CHARS = 32_000;

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

// Multi-line text. clean() would glue the lines together, so clean each line and
// put the breaks back. Used for the notes box in both the email and the row.
function cleanLines(s, max) {
  if (s === null || s === undefined) return null;
  return String(s).split(/\r?\n/).map((l) => clean(l, max)).filter(Boolean).join('\n').slice(0, max) || null;
}

// Plain labeled summary for the alert email. Blank answers are left out so the
// email reads as a list of what the contractor actually said.
function summarize(d, ctx) {
  const yn = (v) => (v ? 'yes' : 'no');
  const list = (arr) => (arr && arr.length ? arr.join(', ') : null);
  const row = (label, value) => (value === null || value === undefined || value === '' ? null : label + ': ' + value);
  const lic = d.license || {};
  const ins = d.insurance || {};
  const avail = d.availability || {};
  const links = d.links || {};
  const refs = ctx.refs
    .filter((r) => r.name || r.phone)
    .map((r, i) => 'Reference ' + (i + 1) + ': ' + [r.name, r.phone].filter(Boolean).join(', '));

  const lines = [
    row('Name', ctx.name),
    row('Company', clean(d.company, 160)),
    row('Phone', ctx.phone),
    row('Number takes texts', yn(d.smsCapable)),
    row('SMS consent', ctx.smsConsent),
    row('Email', ctx.email),
    row('Best way to reach', clean(d.contactPref, 20)),
    '',
    row('Trades', list(ctx.trades)),
    row('Main trade', ctx.primaryTrade),
    row('Years doing this', clean(d.years, 40)),
    row('Crew', clean(d.crew, 40)),
    row('Jobs at once', clean(d.capacity, 10)),
    '',
    row('How they work', clean(d.licenseType, 40)),
    row('License', d.licensed
      ? [clean(lic.kind, 120), clean(lic.number, 80), clean(lic.state, 10), lic.expires ? 'expires ' + clean(lic.expires, 20) : null].filter(Boolean).join(', ') || 'yes'
      : null),
    row('General liability', d.insured
      ? [clean(ins.carrier, 120), clean(ins.coverage, 40), ins.expires ? 'expires ' + clean(ins.expires, 20) : null, 'COI on request: ' + yn(ins.coiAvailable)].filter(Boolean).join(', ')
      : 'no'),
    row('Workers comp', clean(d.workersComp, 20)),
    '',
    row('Counties', list(ctx.areas)),
    row('Travel', clean(d.radius, 60)),
    row('Would rather not go', clean(d.areasAvoid, 200)),
    '',
    row('Pricing', clean(d.pricingModel, 20)),
    row('Rate', clean(d.rate, 120)),
    row('1099 ready', clean(d.accepts1099, 20)),
    row('Lead time', clean(avail.leadTime, 40)),
    row('Weekends', clean(avail.weekends, 20)),
    '',
    row('Website', clean(links.website, 300)),
    row('Facebook', clean(links.facebook, 300)),
    row('Instagram', clean(links.instagram, 300)),
    row('Google listing', clean(links.google, 300)),
    row('Photos', clean(links.photos, 500)),
    ...refs,
    '',
    row('Notes', cleanLines(d.notes, 2000)),
    '',
    row('Source', clean(d.source, 120)),
    row('Record', ctx.id + (ctx.partial ? ' (raw submission saved, contractor row failed)' : '')),
  ];

  // Drop empty rows and collapse repeated blank lines.
  return lines
    .filter((l) => l !== null)
    .filter((l, i, arr) => !(l === '' && (i === 0 || arr[i - 1] === '' || i === arr.length - 1)))
    .join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!DB_URL || !DB_TOKEN) {
    console.error('[submit-contractor] TURSO_CONTRACTOR_URL or TURSO_CONTRACTOR_TOKEN is not set');
    return res.status(500).json({ success: false, error: 'Intake is not configured yet.' });
  }

  // Vercel pre-parses application/json. Anything else arrives as a string and
  // may not be JSON at all, so never let JSON.parse throw out of the handler.
  let d;
  try {
    d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    return res.status(400).json({ success: false, error: 'Could not read the form. Please refresh and try again.' });
  }
  if (!d || typeof d !== 'object' || Array.isArray(d)) {
    return res.status(400).json({ success: false, error: 'Could not read the form. Please refresh and try again.' });
  }

  // Bot check. A filled honeypot or a post within seconds of page load gets a
  // quiet success so the script moves on. Nothing is written and nothing is sent.
  if (looksLikeBot(d)) {
    const at = typeof d.email === 'string' ? d.email.indexOf('@') : -1;
    console.warn('[submit-contractor] dropped as bot', at >= 0 ? d.email.slice(at + 1, at + 80) : 'no email');
    return res.status(200).json({ success: true, id: 'ctr_' + Date.now().toString(36) });
  }

  // The two bot-check keys are not part of the submission and never get stored.
  delete d.company_website;
  delete d.started_at;

  const raw = JSON.stringify(d);
  if (raw.length > MAX_PAYLOAD_CHARS) {
    return res.status(413).json({ success: false, error: 'That is too much text. Please shorten your answers.' });
  }

  // Only the fields the form actually sends. Anything else on the wire is ignored.
  const name = clean(d.name, 120);
  const phone = clean(d.phone, 40);
  const email = clean(d.email, 200);
  if (!name || !phone || !email) {
    return res.status(400).json({ success: false, error: 'Name, phone and email are required.' });
  }
  if (phone.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ success: false, error: 'Enter a mobile number with the area code.' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'That email address does not look right.' });
  }

  const trades = Array.isArray(d.trades) ? d.trades.map((t) => clean(t, 60)).filter(Boolean).slice(0, 60) : [];
  const areas = Array.isArray(d.areas) ? d.areas.map((a) => clean(a, 60)).filter(Boolean).slice(0, 40) : [];
  const primaryTrade = clean(d.primaryTrade, 60);
  if (!trades.length) {
    return res.status(400).json({ success: false, error: 'Pick at least one trade.' });
  }
  if (!primaryTrade) {
    return res.status(400).json({ success: false, error: 'Pick your main trade.' });
  }
  if (!areas.length) {
    return res.status(400).json({ success: false, error: 'Pick at least one county.' });
  }

  const refs = Array.isArray(d.references)
    ? d.references.map((r) => ({ name: clean(r && r.name, 120), phone: clean(r && r.phone, 40) })).slice(0, 4)
    : [];
  const lic = d.license || {};
  const ins = d.insurance || {};
  const avail = d.availability || {};
  const links = d.links || {};

  // SMS consent. The contractors table has a fixed 41 column shape, so it rides as
  // the last line of notes instead of a column of its own. "no" unless they ticked it.
  const smsConsent = d.smsConsent === 'yes' ? 'yes' : 'no';
  const notesTyped = cleanLines(d.notes, 2000);
  const notes = (notesTyped ? notesTyped + '\n\n' : '') + 'SMS consent: ' + smsConsent;

  const id = 'ctr_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const alertSubject = 'Website contractor intake: ' + name + ', ' + primaryTrade;
  const alertCtx = { id, name, phone, email, trades, areas, refs, smsConsent, primaryTrade };

  try {
    await pipeline([
      {
        sql: 'INSERT INTO submissions (contractor_id, user_agent, payload) VALUES (?, ?, ?)',
        args: [text(id), text(clean(req.headers['user-agent'], 400)), text(raw)],
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
          json(trades), text(primaryTrade),
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
          json(refs), text(notes),
        ],
      },
    ]);

    await notifyJosh({ subject: alertSubject, text: summarize(d, alertCtx), replyTo: email });

    return res.status(200).json({ success: true, id });
  } catch (err) {
    // The raw submission is the thing we cannot afford to lose, so try it alone.
    console.error('[submit-contractor]', err && err.message);
    try {
      await pipeline([
        {
          sql: 'INSERT INTO submissions (contractor_id, user_agent, payload) VALUES (?, ?, ?)',
          args: [text(id + '_partial'), text(clean(req.headers['user-agent'], 400)), text(raw)],
        },
      ]);
    } catch (e2) {
      console.error('[submit-contractor] raw save also failed:', e2 && e2.message);
      return res.status(500).json({ success: false, error: 'We could not save that. Please try again.' });
    }
    await notifyJosh({
      subject: alertSubject + ' (partial save)',
      text: summarize(d, { ...alertCtx, partial: true }),
      replyTo: email,
    });
    return res.status(200).json({ success: true, id, partial: true });
  }
}
