// Vercel Serverless Function: /api/submit-deal
//
// Takes a submission from the /submit-deal form and writes it three places:
//   1. GoHighLevel: the contact (upsert), an opportunity in the pipeline for
//      that asset class, and a note holding every answer the visitor gave.
//   2. Supabase: one row in the table for that asset class. Answers with no
//      column of their own ride along in additional_notes so nothing is lost.
//   3. Josh's inbox, through notifyJosh.
//
// The GHL contact is the one write that has to succeed. If it fails the
// visitor gets a 502 and can try again. Everything after it logs and carries
// on, so a Supabase or email hiccup never turns a real lead into an error.

import { notifyJosh, clean, looksLikeBot } from "./_lib/notify.js";

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const GHL_API = "https://services.leadconnectorhq.com";
const UPSTREAM_TIMEOUT_MS = 15_000;

// Pipeline and stage IDs per asset class
const GHL_PIPELINES = {
  sfr: {
    pipelineId: "fw2bWzHMY1kdgvLzTEzC",
    stageId: "116cf167-1828-44a7-b52e-d28e4a904828",
    name: "Residential Submissions",
  },
  multifamily: {
    pipelineId: "vQV1Qpm8neG7pZwQe8JJ",
    stageId: "9bac5e1d-ae4c-4b19-8611-a56e93c5bc1b",
    name: "Multifamily Submissions",
  },
  mhp: {
    pipelineId: "9p5e7M3mJAvJtJw10HSo",
    stageId: "ba0e90d2-299c-4a16-9e1e-04edafcc95b1",
    name: "MHP Submissions",
  },
  rv_park: {
    pipelineId: "FvqZh68JrsHgXbHkae9N",
    stageId: "d4a07849-02ad-4820-b7e2-31edb8322cfd",
    name: "RV Park Submissions",
  },
};

// Supabase table per asset class
const SUPABASE_TABLES = {
  sfr: "sfr_deals",
  multifamily: "multifamily_deals",
  mhp: "mhp_deals",
  rv_park: "rv_park_deals",
};

const PROPERTY_TYPES = Object.keys(GHL_PIPELINES);

const TYPE_LABELS = {
  sfr: "Single family",
  multifamily: "Multifamily",
  mhp: "Mobile home park",
  rv_park: "RV park / campground",
};

const ASSET_TAGS = {
  sfr: "asset-class-sfr",
  multifamily: "asset-class-multifamily",
  mhp: "asset-class-mhp",
  rv_park: "asset-class-rv-park",
};

// ── Input handling ───────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KEY_RE = /^[A-Za-z][A-Za-z0-9_]{0,48}$/;
const MAX_KEYS = 120;
const LONG_TEXT_KEYS = new Set([
  "additionalNotes",
  "repairDescription",
  "t12Available",
  "violationsDesc",
  "environmentalDesc",
]);
// Never written anywhere. The honeypot and the timing stamp are read by
// looksLikeBot() and then dropped.
const INTERNAL_KEYS = new Set(["company_website", "started_at"]);

/**
 * Run clean() over every string the visitor sent, keep booleans, keep string
 * arrays, drop everything else. Keys are capped in number and shape so a
 * hand-built payload cannot flood the note.
 */
function sanitize(body) {
  const out = {};
  let count = 0;
  for (const [key, raw] of Object.entries(body)) {
    if (++count > MAX_KEYS) break;
    if (!KEY_RE.test(key) || INTERNAL_KEYS.has(key)) continue;
    if (typeof raw === "string") {
      const value = clean(raw, LONG_TEXT_KEYS.has(key) ? 4000 : 500);
      if (value !== "") out[key] = value;
    } else if (typeof raw === "boolean") {
      out[key] = raw;
    } else if (typeof raw === "number" && Number.isFinite(raw)) {
      out[key] = String(raw);
    } else if (Array.isArray(raw)) {
      const items = raw
        .filter((item) => typeof item === "string")
        .map((item) => clean(item, 200))
        .filter((item) => item !== "")
        .slice(0, 30);
      if (items.length) out[key] = items;
    }
  }
  return out;
}

/**
 * The one number parser. Finds the first number in the text and strips
 * everything except digits and a decimal point, so "$120,000" is 120000,
 * "1,400 sqft" is 1400, "3.5% / I don't know" is 3.5 and "I don't know" is
 * null. A trailing k or m ("$78k", "1.2M") is expanded.
 */
function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const match = value.match(/(\d[\d,]*(?:\.\d+)?|\.\d+)\s*([kKmM])?(?![A-Za-z])/);
  if (!match) return null;
  const n = parseFloat(match[1].replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return null;
  const unit = (match[2] || "").toLowerCase();
  if (unit === "k") return n * 1_000;
  if (unit === "m") return n * 1_000_000;
  return n;
}

function toInt(value) {
  const n = toNumber(value);
  return n === null ? null : Math.round(n);
}

function toYear(value) {
  const n = toInt(value);
  return n !== null && n >= 1600 && n <= 2100 ? n : null;
}

/** Whole-number count, or null when the visitor answered with a percentage. */
function toCount(value) {
  if (typeof value === "string" && value.includes("%")) return null;
  return toInt(value);
}

function digitsOf(value) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

/**
 * Money for the note. A plain number prints as "$120,000" plus any unit
 * suffix. Text the visitor wrote around it ("negotiable", "I don't know",
 * "50% of spread") is kept as written so meaning is never lost.
 */
function fmtMoney(value, suffix = "") {
  const n = toNumber(value);
  if (n === null) return typeof value === "string" ? value : null;
  const hasWords = typeof value === "string" && /[a-jln-zA-JLN-Z\/]/.test(value);
  if (hasWords) return value;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}${suffix}`;
}

// ── Labels ───────────────────────────────────────────────────────────────────

const LABELS = {
  propertyType: "Property type",
  submitterRole: "Role",
  isOwner: "Owns the property",
  email: "Email",
  phone: "Phone",
  preferredContact: "Preferred contact",
  smsConsent: "Text message consent",
  propertyAddress: "Address",
  askingPrice: "Asking price",
  arv: "ARV",
  unitCount: "Total units",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  squareFootage: "Square footage",
  yearBuilt: "Year built",
  condition: "Condition",
  estimatedRepairs: "Estimated repairs",
  repairDescription: "Repairs described",
  occupancyStatus: "Occupancy",
  currentRent: "Monthly rent",
  hasLease: "Lease",
  leaseExpiry: "Lease expires",
  grossRents: "Gross monthly rents",
  currentNoi: "NOI",
  capRate: "Cap rate",
  t12Available: "T12 / rent roll notes",
  hasMortgage: "Existing mortgage",
  mortgageBalance: "Mortgage balance",
  mortgageRate: "Mortgage rate",
  mortgagePayment: "Mortgage payment",
  assumable: "Assumable",
  creativeFinancing: "Open to creative financing",
  creativeFinancingOptions: "Creative finance options",
  sellerFinancing: "Open to seller financing",
  motivation: "Seller motivation",
  totalPads: "Total pads",
  occupiedPads: "Occupied pads",
  waterSewerType: "Water and sewer",
  hasParkOwnedHomes: "Home ownership",
  parkOwnedHomes: "Park-owned homes",
  parkOwnedCondition: "Park-owned home condition",
  lotRent: "Lot rent",
  infrastructureIssues: "Infrastructure condition",
  violations: "City or county violations",
  violationsDesc: "Violations described",
  environmentalIssues: "Environmental issues",
  environmentalDesc: "Environmental issues described",
  seasonal: "Season",
  seasonOpen: "Season opens",
  seasonClose: "Season closes",
  peakOccupancy: "Peak season occupancy",
  yearRoundOccupancy: "Current occupancy",
  longTermTenants: "Long-term residents",
  longTermCount: "Long-term resident count",
  siteTypes: "Site types",
  managementType: "Management",
  bookingPlatform: "Booking platform",
  amenities: "Amenities",
  dealStatus: "Status on this deal",
  assignmentFee: "Referral fee expectation",
  additionalNotes: "Notes",
  howHeard: "How they heard about Josh",
  consent: "Confirmed accurate",
};

// Labels that read differently for one asset class.
const LABEL_OVERRIDES = {
  multifamily: { occupancyStatus: "Occupancy" },
  mhp: {
    totalPads: "Total lots",
    occupiedPads: "Occupied lots / occupancy",
    grossRents: "Gross monthly income",
  },
  rv_park: {
    totalPads: "Total sites",
    grossRents: "Gross annual revenue",
  },
};

const YES_NO = { yes: "Yes", no: "No", idk: "I don't know", unsure: "Not sure" };
const CONDITION = {
  turnkey: "Turnkey",
  light: "Light updates",
  moderate: "Moderate rehab",
  full: "Full gut",
  tear: "Tear down",
  "value-add": "Significant value-add",
  idk: "I don't know",
};

// Coded answers, spelled out per key so "full" reads as a gut rehab under
// condition and as fully occupied under occupancy.
const VALUES = {
  propertyType: TYPE_LABELS,
  submitterRole: {
    owner: "Property owner",
    birddog: "Bird dog",
    wholesaler: "Wholesaler / investor",
    agent: "Agent / broker",
    other: "Other",
  },
  preferredContact: { call: "Call", text: "Text", email: "Email" },
  condition: CONDITION,
  occupancyStatus: {
    vacant: "Vacant",
    owner: "Owner occupied",
    tenant: "Tenant occupied",
    partial: "Partially occupied",
    full: "Fully occupied",
    idk: "I don't know",
  },
  hasLease: { mtm: "Month to month", fixed: "Fixed term", idk: "I don't know" },
  hasMortgage: YES_NO,
  assumable: YES_NO,
  creativeFinancing: YES_NO,
  sellerFinancing: YES_NO,
  violations: YES_NO,
  environmentalIssues: YES_NO,
  longTermTenants: YES_NO,
  waterSewerType: {
    "city-city": "City water + city sewer",
    "well-septic": "Well + septic",
    "city-septic": "City water + septic",
    "well-city": "Well + city sewer",
    idk: "I don't know",
  },
  hasParkOwnedHomes: { toh: "Tenant-owned (TOH)", poh: "Park-owned (POH)", mixed: "Mixed" },
  parkOwnedCondition: { good: "Good", fair: "Fair", poor: "Poor", idk: "I don't know" },
  infrastructureIssues: { good: "Good", fair: "Fair", poor: "Poor / aging", idk: "I don't know" },
  seasonal: { seasonal: "Seasonal", yearround: "Year-round" },
  managementType: { self: "Self-managed", third: "Third-party management" },
  dealStatus: { contract: "Has it under contract", referring: "Referring the lead", other: "Other" },
  howHeard: {
    instagram: "Instagram",
    facebook: "Facebook",
    referral: "Referral",
    google: "Google search",
    meetup: "Meetup / event",
    subto: "SubTo / Pace Morby community",
    other: "Other",
  },
};

// Money keys and the unit that follows a plain number. Some depend on the
// asset class: gross rents are monthly for apartments and parks, annual for
// RV parks.
const MONEY_SUFFIX = {
  askingPrice: "",
  arv: "",
  estimatedRepairs: "",
  currentRent: "/mo",
  mortgageBalance: "",
  mortgagePayment: "/mo",
  currentNoi: "",
  lotRent: "/lot/mo",
  assignmentFee: "",
  grossRents: { multifamily: "/mo", mhp: "/mo", rv_park: "/yr", sfr: "" },
};

function labelFor(key, propertyType) {
  const override = LABEL_OVERRIDES[propertyType];
  if (override && override[key]) return override[key];
  if (LABELS[key]) return LABELS[key];
  // Unknown key: "someNewField" reads as "Some new field".
  const words = key.replace(/_/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatValue(key, value, propertyType) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : null;
  const text = String(value);
  const coded = VALUES[key];
  if (coded && coded[text]) return coded[text];
  if (key in MONEY_SUFFIX) {
    const suffix = MONEY_SUFFIX[key];
    return fmtMoney(text, typeof suffix === "string" ? suffix : suffix[propertyType] || "");
  }
  return text;
}

/** "Label: value" lines for the given keys, skipping anything unanswered. */
function linesFor(data, keys, propertyType) {
  const lines = [];
  for (const key of keys) {
    const value = formatValue(key, data[key], propertyType);
    if (value !== null) lines.push(`${labelFor(key, propertyType)}: ${value}`);
  }
  return lines;
}

// ── The note ─────────────────────────────────────────────────────────────────

const NOTE_SECTIONS = [
  {
    title: "SUBMITTED BY",
    keys: ["submitterRole", "isOwner", "email", "phone", "preferredContact", "smsConsent"],
  },
  {
    title: "PROPERTY",
    keys: [
      "propertyType",
      "propertyAddress",
      "askingPrice",
      "arv",
      "unitCount",
      "bedrooms",
      "bathrooms",
      "squareFootage",
      "yearBuilt",
      "condition",
      "estimatedRepairs",
      "repairDescription",
      "totalPads",
      "occupiedPads",
      "waterSewerType",
      "hasParkOwnedHomes",
      "parkOwnedHomes",
      "parkOwnedCondition",
      "infrastructureIssues",
      "violations",
      "violationsDesc",
      "environmentalIssues",
      "environmentalDesc",
      "seasonal",
      "seasonOpen",
      "seasonClose",
      "siteTypes",
      "amenities",
      "managementType",
      "bookingPlatform",
    ],
  },
  {
    title: "OCCUPANCY AND INCOME",
    keys: [
      "occupancyStatus",
      "peakOccupancy",
      "yearRoundOccupancy",
      "longTermTenants",
      "longTermCount",
      "currentRent",
      "hasLease",
      "leaseExpiry",
      "grossRents",
      "lotRent",
      "currentNoi",
      "capRate",
      "t12Available",
    ],
  },
  {
    title: "FINANCING",
    keys: [
      "hasMortgage",
      "mortgageBalance",
      "mortgageRate",
      "mortgagePayment",
      "assumable",
      "creativeFinancing",
      "creativeFinancingOptions",
      "sellerFinancing",
    ],
  },
  {
    title: "DEAL TERMS",
    keys: ["dealStatus", "assignmentFee", "motivation"],
  },
  {
    title: "ADDITIONAL INFO",
    keys: ["additionalNotes", "howHeard", "consent"],
  },
];

const FINANCING_KEYS = NOTE_SECTIONS.find((s) => s.title === "FINANCING").keys;

function fullName(data) {
  return [data.firstName, data.lastName].filter(Boolean).join(" ");
}

/**
 * Every answer the visitor gave, grouped and labeled. Keys the sections do
 * not know about land in a final "OTHER ANSWERS" block, so a new question on
 * the form shows up here before anyone remembers to add it to a section.
 */
function buildNote(data) {
  const type = data.propertyType;
  const submitted = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const parts = [
    `DEAL SUBMISSION: ${(TYPE_LABELS[type] || type).toUpperCase()}`,
    `Submitted: ${submitted} ET`,
  ];

  const written = new Set(["firstName", "lastName"]);
  for (const section of NOTE_SECTIONS) {
    const lines = linesFor(data, section.keys, type);
    section.keys.forEach((k) => written.add(k));
    if (section.title === "SUBMITTED BY") {
      const name = fullName(data);
      if (name) lines.unshift(`Name: ${name}`);
    }
    if (lines.length) parts.push("", `[ ${section.title} ]`, ...lines);
  }

  const leftover = Object.keys(data).filter((k) => !written.has(k));
  const otherLines = linesFor(data, leftover, type);
  if (otherLines.length) parts.push("", "[ OTHER ANSWERS ]", ...otherLines);

  return parts.join("\n");
}

// ── GoHighLevel ──────────────────────────────────────────────────────────────

function buildDealTags(data) {
  const tags = ["deal-submission", "website-submission"];
  if (ASSET_TAGS[data.propertyType]) tags.push(ASSET_TAGS[data.propertyType]);
  switch (data.submitterRole) {
    case "owner":
      tags.push("deal-source-owner");
      break;
    case "wholesaler":
      tags.push("deal-source-wholesaler", "wholesaler");
      break;
    case "agent":
      tags.push("commercial-broker");
      break;
    case "birddog":
      tags.push("deal-source-bird-dog");
      break;
    default:
      break;
  }
  if (data.smsConsent === true) tags.push("sms-consent");
  return tags;
}

/**
 * POST to GHL. Returns the parsed body, or null after logging the status and
 * response when the call fails. The response body never reaches the browser.
 */
async function ghlPost(path, payload) {
  try {
    const res = await fetch(`${GHL_API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`submit-deal: GHL ${path} returned ${res.status}:`, text.slice(0, 2000));
      return null;
    }
    return await res.json().catch(() => ({}));
  } catch (err) {
    console.error(`submit-deal: GHL ${path} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function upsertContact(data, note) {
  const result = await ghlPost("/contacts/upsert", {
    locationId: GHL_LOCATION_ID,
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    email: data.email,
    phone: data.phone,
    source: "Website Deal Submission",
    tags: buildDealTags(data),
    customFields: [{ key: "opportunity_notes", field_value: note }],
  });
  const id = result && (result.contact?.id || result.id);
  if (!id) {
    console.error("submit-deal: GHL upsert returned no contact id");
    return null;
  }
  return id;
}

async function createOpportunity(contactId, data, pipeline) {
  const result = await ghlPost("/opportunities/", {
    pipelineId: pipeline.pipelineId,
    pipelineStageId: pipeline.stageId,
    locationId: GHL_LOCATION_ID,
    contactId,
    name: `${fullName(data) || data.email} - ${data.propertyAddress}`,
    status: "open",
    monetaryValue: toNumber(data.askingPrice) || 0,
  });
  return result ? result.opportunity?.id || result.id || null : null;
}

async function addContactNote(contactId, note) {
  const result = await ghlPost(`/contacts/${contactId}/notes`, { body: note });
  return result !== null;
}

// ── Supabase ─────────────────────────────────────────────────────────────────

// Form keys that have a column of their own (or ride in financing_terms) in
// each table. Anything else the visitor answered is appended to
// additional_notes so the row is as complete as the GHL note.
const COMMON_COLUMN_KEYS = [
  "propertyType",
  "submitterRole",
  "firstName",
  "lastName",
  "email",
  "phone",
  "preferredContact",
  "isOwner",
  "propertyAddress",
  "condition",
  "assignmentFee",
  "additionalNotes",
  "howHeard",
  "consent",
  "askingPrice",
  ...FINANCING_KEYS,
];

const TABLE_COLUMN_KEYS = {
  sfr_deals: ["bedrooms", "bathrooms", "squareFootage", "yearBuilt", "arv", "estimatedRepairs", "occupancyStatus", "motivation"],
  multifamily_deals: ["unitCount", "squareFootage", "yearBuilt", "currentNoi", "grossRents", "occupancyStatus"],
  mhp_deals: ["totalPads", "occupiedPads", "parkOwnedHomes", "waterSewerType", "grossRents", "currentNoi", "lotRent"],
  rv_park_deals: ["totalPads", "siteTypes", "amenities", "grossRents", "currentNoi"],
};

function buildSupabaseRecord(data, table) {
  const type = data.propertyType;
  const financingTerms = linesFor(data, FINANCING_KEYS, type).join("; ");

  const columnKeys = new Set([...COMMON_COLUMN_KEYS, ...(TABLE_COLUMN_KEYS[table] || [])]);
  const extraKeys = Object.keys(data).filter((k) => !columnKeys.has(k));
  const extraLines = linesFor(data, extraKeys, type);
  const additionalNotes = [
    data.additionalNotes || null,
    extraLines.length ? ["Other answers from the form:", ...extraLines].join("\n") : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const record = {
    submitter_role: data.submitterRole || null,
    first_name: data.firstName || null,
    last_name: data.lastName || null,
    email: data.email,
    phone: data.phone,
    preferred_contact: data.preferredContact || null,
    is_owner: typeof data.isOwner === "boolean" ? data.isOwner : null,
    property_address: data.propertyAddress,
    condition: data.condition || null,
    financing_terms: financingTerms || null,
    assignment_fee: toNumber(data.assignmentFee),
    additional_notes: additionalNotes || null,
    how_heard: data.howHeard || null,
    consent: data.consent === true,
    asking_price: toNumber(data.askingPrice),
  };

  if (table === "sfr_deals") {
    Object.assign(record, {
      bedrooms: toInt(data.bedrooms),
      bathrooms: toNumber(data.bathrooms),
      square_footage: toInt(data.squareFootage),
      year_built: toYear(data.yearBuilt),
      arv: toNumber(data.arv),
      estimated_repairs: toNumber(data.estimatedRepairs),
      occupancy_status: data.occupancyStatus || null,
      motivation: Array.isArray(data.motivation) && data.motivation.length ? data.motivation : null,
    });
  } else if (table === "multifamily_deals") {
    Object.assign(record, {
      unit_count: toInt(data.unitCount),
      square_footage: toInt(data.squareFootage),
      year_built: toYear(data.yearBuilt),
      current_noi: toNumber(data.currentNoi),
      gross_rents: toNumber(data.grossRents),
      occupancy_status: data.occupancyStatus || null,
    });
  } else if (table === "mhp_deals") {
    Object.assign(record, {
      total_pads: toInt(data.totalPads),
      occupied_pads: toCount(data.occupiedPads),
      park_owned_homes: toInt(data.parkOwnedHomes),
      water_sewer_type: data.waterSewerType || null,
      gross_rents: toNumber(data.grossRents),
      current_noi: toNumber(data.currentNoi),
      lot_rent: toNumber(data.lotRent),
    });
  } else if (table === "rv_park_deals") {
    Object.assign(record, {
      total_pads: toInt(data.totalPads),
      hookup_types: Array.isArray(data.siteTypes) && data.siteTypes.length ? data.siteTypes : null,
      amenities: Array.isArray(data.amenities) && data.amenities.length ? data.amenities : null,
      gross_rents: toNumber(data.grossRents),
      current_noi: toNumber(data.currentNoi),
    });
  }

  return record;
}

async function insertSupabaseRecord(data, table) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("submit-deal: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set; row skipped");
    return false;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(buildSupabaseRecord(data, table)),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`submit-deal: Supabase insert into ${table} returned ${res.status}:`, text.slice(0, 2000));
      return false;
    }
    return true;
  } catch (err) {
    console.error(`submit-deal: Supabase insert into ${table} failed:`, err instanceof Error ? err.message : err);
    return false;
  }
}

// ── Handler ──────────────────────────────────────────────────────────────────

function parseBody(req) {
  const body = req.body;
  if (body && typeof body === "object" && !Array.isArray(body)) return body;
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function validate(data) {
  const problems = [];
  if (!PROPERTY_TYPES.includes(data.propertyType)) problems.push("Choose a property type.");
  if (!data.firstName) problems.push("Enter your name.");
  if (!EMAIL_RE.test(data.email || "")) problems.push("Enter a valid email address.");
  if (digitsOf(data.phone).length < 10) problems.push("Enter a phone number with at least 10 digits.");
  if (!data.propertyAddress) problems.push("Enter the property address.");
  if (data.consent !== true) problems.push("Confirm the information is accurate.");
  return problems;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);

    if (looksLikeBot(body)) {
      console.warn("submit-deal: honeypot tripped, submission dropped");
      return res.status(200).json({ success: true });
    }

    const data = sanitize(body);
    const problems = validate(data);
    if (problems.length) {
      return res.status(400).json({ error: problems.join(" ") });
    }

    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      console.error("submit-deal: GHL_API_KEY or GHL_LOCATION_ID is not set");
      return res.status(502).json({ error: "Your submission could not be saved right now. Please try again in a minute." });
    }

    const type = data.propertyType;
    const pipeline = GHL_PIPELINES[type];
    const table = SUPABASE_TABLES[type];
    const note = buildNote(data);

    // 1. The contact. This is the write that must land.
    const contactId = await upsertContact(data, note);
    if (!contactId) {
      return res.status(502).json({
        error: "Your submission could not be saved right now. Please try again in a minute, or reach out through the contact page.",
      });
    }

    // 2. Opportunity, note, Supabase row and the email. Each logs its own
    //    failure and none of them can turn the response into an error.
    const opportunityId = await createOpportunity(contactId, data, pipeline);
    if (!opportunityId) console.error(`submit-deal: no opportunity created in ${pipeline.name} for contact ${contactId}`);

    const noted = await addContactNote(contactId, note);
    if (!noted) console.error(`submit-deal: note not written for contact ${contactId}`);

    await insertSupabaseRecord(data, table);

    await notifyJosh({
      subject: `Website deal: ${TYPE_LABELS[type]} at ${data.propertyAddress}`,
      text: note,
      replyTo: data.email,
    });

    return res.status(200).json({ success: true, message: "Deal received." });
  } catch (err) {
    console.error("submit-deal: unexpected error:", err instanceof Error ? err.stack || err.message : err);
    return res.status(500).json({ error: "Something went wrong on our end. Please try again." });
  }
}
