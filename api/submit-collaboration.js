// /api/submit-collaboration
//
// Takes the Collaborate form (client/src/pages/Collaborate.tsx), writes the contact,
// a formatted note and an opportunity to GoHighLevel (Moore Success Systems), archives
// a row in the Supabase `collaborations` table, and emails Josh.
//
// The page and this function share a host, so there is no CORS header: same-origin only.

import { clean, looksLikeBot, notifyJosh } from "./_lib/notify.js";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const SOURCE = "Website Collaboration Form";
const UNAVAILABLE =
  "Could not save your submission right now. Please try again in a minute, or reach out through the contact page.";

// Where each category lands in GHL.
// Bird dogs and wholesalers go to their stages in the Subto Members pipeline. Every
// other category lands in Owners Club Members / New Contact for now, because the lender
// pipeline the old code pointed at does not exist. Lenders and brokers should get their
// own pipeline later; when they do, change the ids here and nothing else.
const SUBTO_MEMBERS = "8fMXoEMiATod88FFvE6U";
const OWNERS_CLUB_NEW_CONTACT = {
  pipelineId: "NTEoDxtGGx7u71MYj7k8",
  stageId: "ea3feb22-df4e-4574-a7f4-03461e23815a",
};
const PIPELINE_MAP = {
  "bird-dog": { pipelineId: SUBTO_MEMBERS, stageId: "47206dfc-6f00-4237-9556-b22fed5e55a9" },
  wholesaler: { pipelineId: SUBTO_MEMBERS, stageId: "b80d7cfe-7f05-450b-91de-d92c69b7ccad" },
  "hard-money": OWNERS_CLUB_NEW_CONTACT,
  dscr: OWNERS_CLUB_NEW_CONTACT,
  "commercial-lender": OWNERS_CLUB_NEW_CONTACT,
  "mortgage-broker": OWNERS_CLUB_NEW_CONTACT,
  "commercial-broker": OWNERS_CLUB_NEW_CONTACT,
  "industry-partner": OWNERS_CLUB_NEW_CONTACT,
};

// Category ids and labels. Must match CATEGORIES in client/src/pages/Collaborate.tsx.
const CATEGORIES = {
  "bird-dog": { label: "Bird Dog", tag: "bird-dog" },
  wholesaler: { label: "Wholesaler", tag: "wholesaler" },
  "hard-money": { label: "Hard Money Lender", tag: "hard-money-lender" },
  dscr: { label: "DSCR Lender", tag: "dscr-lender" },
  "commercial-lender": { label: "Commercial Lender", tag: "commercial-lender" },
  "mortgage-broker": { label: "Mortgage Broker", tag: "mortgage-broker" },
  "commercial-broker": { label: "Commercial Broker", tag: "commercial-broker" },
  "industry-partner": { label: "Industry Partner", tag: "industry-partner" },
};

/* ---------- Option lists (same strings the form offers) ---------- */

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
];
const ASSET_CLASSES = [
  "Single Family", "Multifamily", "Mobile Home Park", "RV Park / Campground",
  "Self Storage", "Land", "Commercial", "Other",
];
const LEND_ASSETS = ASSET_CLASSES.filter((a) => a !== "Other");
const LOAN_TERMS = ["6 months", "12 months", "24 months", "Longer", "Flexible"];
const LEAD_SOURCES = ["Driving for dollars", "Cold calling", "Direct mail", "Door knocking", "MLS", "Other"];
const LOAN_MINIMUMS = [
  "Under $100,000", "$100,000 to $250,000", "$250,000 to $500,000",
  "$500,000 to $1,000,000", "$1,000,000+",
];
const DEAL_SIZES = [
  "Under $500,000", "$500,000 to $1,000,000", "$1,000,000 to $5,000,000",
  "$5,000,000 to $10,000,000", "$10,000,000+",
];
const BROKER_PRODUCTS = ["Conventional", "FHA", "DSCR", "Hard Money", "Commercial", "Other"];
const PARTNER_ROLES = [
  "Property Manager", "Contractor / Rehab Crew", "Disposition Partner", "Title Company",
  "Real Estate Attorney", "Virtual Assistant", "Acquisitions Support", "Other",
];
const HEAR_ABOUT = [
  "Instagram", "Facebook", "Referral", "Google search", "Meetup / event",
  "SubTo / Pace Morby community", "Other",
];

const YES_NO = ["yes", "no"];
const YES_NO_CASE = ["yes", "no", "case"];
const YES_NO_SOMETIMES = ["yes", "no", "sometimes"];

// How single-choice values read in the note.
const VALUE_LABELS = {
  yes: "Yes",
  no: "No",
  case: "Case by case",
  sometimes: "Sometimes",
  agency: "Agency",
  portfolio: "Portfolio",
  both: "Both",
  direct: "Direct to buyer",
  network: "Broker network",
  buyers: "Buyers",
  sellers: "Sellers",
  talk: "Let's talk",
};

/* ---------- Questions per category ---------- */
// kind: "text" (one line), "long" (paragraph), "one" (single choice from options),
// "many" (several choices from options). `required` mirrors the client validation.

const TEXT = "text";
const LONG = "long";
const ONE = "one";
const MANY = "many";

const q = (key, label, kind, options, required = false) => ({ key, label, kind, options, required });

const dealFinderShared = [
  q("bd_deal_types", "Deal types they find", MANY, ASSET_CLASSES),
  q("bd_markets", "Markets", MANY, STATES),
  q("bd_communities", "Real estate communities", TEXT),
  q("bd_goal", "What they want out of this", LONG),
];

const lendsNationally = (prefix, verb) => [
  q(`${prefix}_national`, `${verb[0].toUpperCase()}${verb.slice(1)}s nationally`, ONE, YES_NO, true),
  q(`${prefix}_excluded_states`, `States they don't ${verb} in`, MANY, STATES),
];

const QUESTIONS = {
  "bird-dog": [
    q("bd_fee", "Desired average bird dog fee", TEXT),
    q("bd_leads_per_month", "Leads per month", TEXT),
    q("bd_find_leads", "How they find leads", MANY, LEAD_SOURCES),
    ...dealFinderShared,
  ],
  wholesaler: [
    q("ws_under_contract", "Deals under contract now", ONE, YES_NO_SOMETIMES),
    q("ws_find_deals", "How they find deals", MANY, LEAD_SOURCES),
    ...dealFinderShared,
  ],
  "hard-money": [
    q("hm_company", "Company", TEXT, undefined, true),
    q("hm_asset_classes", "Asset classes", MANY, LEND_ASSETS, true),
    ...lendsNationally("hm", "lend"),
    q("hm_rural", "Lends rural", ONE, YES_NO_CASE, true),
    q("hm_ltv", "Typical LTV", TEXT, undefined, true),
    q("hm_rates", "Typical rates", TEXT, undefined, true),
    q("hm_min_loan", "Minimum loan", ONE, LOAN_MINIMUMS, true),
    q("hm_loan_terms", "Loan terms", MANY, LOAN_TERMS, true),
    q("hm_close_timeline", "Close timeline", TEXT),
    q("hm_distressed", "Lends on distressed or value-add", ONE, YES_NO_CASE),
    q("hm_personal_guarantee", "Personal guarantee required", ONE, YES_NO_CASE),
    q("hm_referral_program", "Broker or referral program", ONE, YES_NO),
    q("hm_goal", "What they want out of this", LONG),
  ],
  dscr: [
    q("dscr_company", "Company", TEXT, undefined, true),
    q("dscr_asset_classes", "Asset classes", MANY, LEND_ASSETS, true),
    ...lendsNationally("dscr", "lend"),
    q("dscr_rural", "Lends rural", ONE, YES_NO_CASE, true),
    q("dscr_ratio", "Minimum DSCR ratio", TEXT, undefined, true),
    q("dscr_ltv", "Typical LTV", TEXT, undefined, true),
    q("dscr_rates", "Typical rates", TEXT, undefined, true),
    q("dscr_min_loan", "Minimum loan", ONE, LOAN_MINIMUMS, true),
    q("dscr_loan_terms", "Loan terms", MANY, LOAN_TERMS, true),
    q("dscr_personal_guarantee", "Personal guarantee required", ONE, YES_NO_CASE),
    q("dscr_referral_program", "Broker or referral program", ONE, YES_NO),
    q("dscr_goal", "What they want out of this", LONG),
  ],
  "commercial-lender": [
    q("cl_company", "Company", TEXT, undefined, true),
    q("cl_asset_classes", "Asset classes", MANY, LEND_ASSETS, true),
    ...lendsNationally("cl", "lend"),
    q("cl_rural", "Lends rural", ONE, YES_NO_CASE, true),
    q("cl_ltv", "Typical LTV", TEXT, undefined, true),
    q("cl_rates", "Typical rates", TEXT, undefined, true),
    q("cl_min_loan", "Minimum loan", ONE, LOAN_MINIMUMS, true),
    q("cl_loan_terms", "Loan terms", MANY, LOAN_TERMS, true),
    q("cl_agency_portfolio", "Agency or portfolio", ONE, ["agency", "portfolio", "both"]),
    q("cl_prepayment_penalty", "Prepayment penalty", ONE, YES_NO_CASE),
    q("cl_personal_guarantee", "Personal guarantee required", ONE, YES_NO_CASE),
    q("cl_referral_program", "Broker or referral program", ONE, YES_NO),
    q("cl_goal", "What they want out of this", LONG),
  ],
  "mortgage-broker": [
    q("mb_company", "Company", TEXT, undefined, true),
    q("mb_products", "Products", MANY, BROKER_PRODUCTS, true),
    q("mb_asset_classes", "Asset classes", MANY, LEND_ASSETS, true),
    ...lendsNationally("mb", "work"),
    q("mb_min_loan", "Minimum loan", ONE, LOAN_MINIMUMS, true),
    q("mb_referral_program", "Broker or referral program", ONE, YES_NO),
    q("mb_goal", "What they want out of this", LONG),
  ],
  "commercial-broker": [
    q("cb_company", "Company", TEXT, undefined, true),
    q("cb_asset_classes", "Asset classes", MANY, LEND_ASSETS, true),
    ...lendsNationally("cb", "work"),
    q("cb_offmarket", "Access to off-market deals", ONE, YES_NO_SOMETIMES, true),
    q("cb_method", "How they bring deals to buyers", ONE, ["direct", "network", "both"], true),
    q("cb_deal_size", "Average deal size", ONE, DEAL_SIZES, true),
    q("cb_deals_per_year", "Deals closed per year", TEXT),
    q("cb_cobroker", "Works with co-brokers", ONE, YES_NO_CASE),
    q("cb_represent", "Represents", ONE, ["buyers", "sellers", "both"]),
    q("cb_referral", "Open to referral fees outside commission", ONE, ["yes", "no", "talk"]),
    q("cb_goal", "What they want out of this", LONG),
  ],
  "industry-partner": [
    q("ip_roles", "Roles", MANY, PARTNER_ROLES, true),
    q("ip_other_role", "Other role", TEXT),
    q("ip_other_more", "How we could work together (other role)", LONG),
    q("ip_standard_more", "How we could work together", LONG),
    q("ip_goal", "What they want out of this", LONG),
  ],
};

// Columns the Supabase `collaborations` table already has. Anything else on the wire
// stays out of the insert. Add sms_consent and source_page here once those columns exist.
const SUPABASE_KEYS = new Set([
  "name", "email", "phone", "website", "category",
  "additional_notes", "hear_about", "consent",
  ...Object.values(QUESTIONS).flat().map((question) => question.key),
]);

/* ---------- Parsing and validation ---------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseBody(req) {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return null;
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  return body;
}

function oneOf(raw, options) {
  const value = clean(raw, 120);
  return options.includes(value) ? value : "";
}

function readAnswer(raw, question) {
  if (question.kind === MANY) {
    if (!Array.isArray(raw)) return [];
    const allowed = new Set(question.options);
    const picked = raw
      .filter((v) => typeof v === "string")
      .map((v) => clean(v, 80))
      .filter((v) => allowed.has(v));
    return [...new Set(picked)].slice(0, 60);
  }
  if (question.kind === ONE) return oneOf(raw, question.options);
  return clean(raw, question.kind === LONG ? 2000 : 200);
}

const isEmpty = (value) => (Array.isArray(value) ? value.length === 0 : !value);

/** Returns { data } with clean, typed answers, or { error } with a plain message. */
function normalize(body) {
  const category = typeof body.category === "string" ? body.category : "";
  if (!CATEGORIES[category]) return { error: "Pick the option that fits you best." };

  const data = { category };

  data.name = clean(body.name, 120);
  if (!data.name) return { error: "Your name is required." };

  data.email = clean(body.email, 200).toLowerCase();
  if (!EMAIL_RE.test(data.email)) return { error: "Enter a valid email address." };

  data.phone = clean(body.phone, 40);
  if (data.phone.replace(/\D/g, "").length < 10) return { error: "Enter a phone number with the area code." };

  data.website = clean(body.website, 200);

  for (const question of QUESTIONS[category]) {
    const value = readAnswer(body[question.key], question);
    if (question.required && isEmpty(value)) return { error: `${question.label} is required.` };
    data[question.key] = value;
  }

  data.additional_notes = clean(body.additional_notes, 2000);
  data.hear_about = oneOf(body.hear_about, HEAR_ABOUT);

  if (body.consent !== true) {
    return { error: "Please confirm your information is accurate before you submit." };
  }
  data.consent = true;
  data.sms_consent = body.sms_consent === true;
  data.source_page = clean(body.sourcePage, 200) || "/collaborate";

  return { data };
}

/* ---------- Formatting ---------- */

function buildTags(data) {
  const tags = ["website-submission", CATEGORIES[data.category].tag];
  if (data.sms_consent) tags.push("sms-consent");
  return tags;
}

function display(value, question) {
  if (Array.isArray(value)) return value.join(", ");
  if (!value) return "";
  if (question.kind === ONE) return VALUE_LABELS[value] || value;
  return value;
}

function buildNote(data) {
  const { label } = CATEGORIES[data.category];
  const when = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines = [
    `COLLABORATION SUBMISSION: ${label.toUpperCase()}`,
    `Submitted: ${when} ET`,
    `Source page: ${data.source_page}`,
    "",
    "[ CONTACT ]",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
  ];
  if (data.website) lines.push(`Company / website: ${data.website}`);

  lines.push("", `[ ${label.toUpperCase()} ]`);
  for (const question of QUESTIONS[data.category]) {
    const shown = display(data[question.key], question);
    if (shown) lines.push(`${question.label}: ${shown}`);
  }

  lines.push("", "[ WRAP UP ]");
  if (data.additional_notes) lines.push(`Anything else: ${data.additional_notes}`);
  if (data.hear_about) lines.push(`How they heard about Josh: ${data.hear_about}`);
  lines.push("Confirmed accurate: Yes");
  lines.push(`Text message consent: ${data.sms_consent ? "Yes" : "No"}`);

  return lines.join("\n");
}

/* ---------- GoHighLevel ---------- */

/** POST to GHL. Returns the parsed body, or null after logging a non-ok response. */
async function ghlPost(path, payload, timeoutMs) {
  try {
    const res = await fetch(`${GHL_API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        Version: GHL_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[submit-collaboration] GHL ${path} returned ${res.status}:`, text.slice(0, 1000));
      return null;
    }
    return await res.json().catch(() => ({}));
  } catch (err) {
    console.error(`[submit-collaboration] GHL ${path} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function upsertContact(data, note) {
  const [firstName, ...rest] = data.name.split(/\s+/);
  const out = await ghlPost(
    "/contacts/upsert",
    {
      locationId: process.env.GHL_LOCATION_ID,
      firstName,
      lastName: rest.join(" "),
      email: data.email,
      phone: data.phone,
      source: SOURCE,
      tags: buildTags(data),
      customFields: [{ key: "opportunity_notes", field_value: note }],
    },
    8_000,
  );
  const id = out && out.contact && out.contact.id;
  return typeof id === "string" && id ? id : null;
}

async function addContactNote(contactId, note) {
  const out = await ghlPost(`/contacts/${encodeURIComponent(contactId)}/notes`, { body: note }, 6_000);
  return out !== null;
}

async function createOpportunity(contactId, data) {
  const pipeline = PIPELINE_MAP[data.category];
  const out = await ghlPost(
    "/opportunities/",
    {
      pipelineId: pipeline.pipelineId,
      pipelineStageId: pipeline.stageId,
      locationId: process.env.GHL_LOCATION_ID,
      contactId,
      name: `${CATEGORIES[data.category].label} - ${data.name}`,
      status: "open",
      source: SOURCE,
    },
    6_000,
  );
  const id = out && out.opportunity && out.opportunity.id;
  return typeof id === "string" && id ? id : null;
}

/* ---------- Supabase archive ---------- */

async function archiveRow(data, contactId, opportunityId) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("[submit-collaboration] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set; archive skipped");
    return;
  }

  const row = {};
  for (const k of SUPABASE_KEYS) if (k in data) row[k] = data[k];
  // The tile already says which, so the old "bird dog or wholesaler" question is gone.
  // Keep the column filled for anything that reads it.
  if (data.category === "bird-dog" || data.category === "wholesaler") row.bd_type = data.category;
  row.ghl_contact_id = contactId;
  row.ghl_opportunity_id = opportunityId;

  try {
    const res = await fetch(`${url}/rest/v1/collaborations`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(6_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[submit-collaboration] Supabase insert returned ${res.status}:`, text.slice(0, 1000));
    }
  } catch (err) {
    console.error("[submit-collaboration] Supabase insert failed:", err instanceof Error ? err.message : err);
  }
}

/* ---------- Handler ---------- */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "Could not read the form. Please refresh and try again." });

  // Bots get a quiet 200 so they have nothing to learn from.
  if (looksLikeBot(body)) return res.status(200).json({ ok: true });

  const { error, data } = normalize(body);
  if (error) return res.status(400).json({ error });

  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    console.error("[submit-collaboration] GHL_API_KEY or GHL_LOCATION_ID is not set");
    return res.status(502).json({ error: UNAVAILABLE });
  }

  const note = buildNote(data);

  // 1. Contact. Nothing else is worth doing if this fails, and we do not claim success.
  const contactId = await upsertContact(data, note);
  if (!contactId) return res.status(502).json({ error: UNAVAILABLE });

  // 2. Tell Josh. Runs alongside the rest; its result never changes the response.
  const notify = notifyJosh({
    subject: `Website collaboration: ${CATEGORIES[data.category].label} from ${data.name}`,
    text: note,
    replyTo: data.email,
  });

  // 3. Note and opportunity on the contact, then the archive row.
  const [, opportunityId] = await Promise.all([
    addContactNote(contactId, note),
    createOpportunity(contactId, data),
  ]);
  await archiveRow(data, contactId, opportunityId);
  await notify;

  return res.status(200).json({ ok: true });
}
