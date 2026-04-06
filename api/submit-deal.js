// Vercel Serverless Function: /api/submit-deal
// Routes deal form submissions to GoHighLevel (correct pipeline) + Supabase (correct table)

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

function buildDealTags(data) {
  const tags = ["deal-submission", "website-submission"];

  // Asset class tag
  const assetTagMap = {
    sfr: "asset-class-sfr",
    multifamily: "asset-class-multifamily",
    mhp: "asset-class-mhp",
    rv_park: "asset-class-rv-park",
  };
  if (assetTagMap[data.propertyType]) tags.push(assetTagMap[data.propertyType]);

  // Submitter role / source tag
  if (data.submitterRole === "owner") tags.push("deal-source-owner");
  if (data.submitterRole === "wholesaler") {
    tags.push("deal-source-wholesaler");
    tags.push("wholesaler");
  }
  if (data.submitterRole === "agent") tags.push("commercial-broker");

  return tags;
}

async function createOrUpdateGHLContact(data, opportunityNoteText) {
  const contactPayload = {
    locationId: GHL_LOCATION_ID,
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    email: data.email || "",
    phone: data.phone || "",
    source: "Website Deal Submission",
    tags: buildDealTags(data),
    customFields: [
      { key: "preferred_contact_method", field_value: data.preferredContact || "" },
      { key: "submitter_role", field_value: data.submitterRole || "" },
      { key: "opportunity_notes", field_value: opportunityNoteText || "" },
    ],
  };

  const res = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify(contactPayload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GHL contact upsert failed: ${err}`);
  }

  const result = await res.json();
  return result.contact?.id || result.id;
}

function buildDealNoteText(data) {
  const assetLabels = { sfr: "Single Family Residential", multifamily: "Multifamily", mhp: "Mobile Home Park", rv_park: "RV Park" };
  const roleLabels = { owner: "Property Owner", wholesaler: "Wholesaler", agent: "Real Estate Agent", other: "Other" };
  const submitted = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" });

  const line = (label, value) => value ? `${label}: ${value}` : null;
  const section = (title, lines) => [`\n[ ${title} ]`, ...lines.filter(Boolean)].join("\n");

  const noteLines = [
    `DEAL SUBMISSION — ${(assetLabels[data.propertyType] || data.propertyType).toUpperCase()}`,
    `Submitted: ${submitted} ET`,
    section("SUBMITTED BY",
      [
        line("Role", roleLabels[data.submitterRole] || data.submitterRole),
        line("Name", `${data.firstName} ${data.lastName}`),
        line("Email", data.email),
        line("Phone", data.phone),
        line("Preferred Contact", data.preferredContact),
        data.wholesalerCompany ? line("Company", data.wholesalerCompany) : null,
      ]
    ),
    section("PROPERTY LOCATION",
      [
        line("Address", data.propertyAddress),
        line("City", data.city),
        line("State", data.state),
        line("ZIP", data.zip),
        line("County", data.county),
      ]
    ),
  ];

  // Asset-class-specific details section
  if (data.propertyType === "sfr") {
    noteLines.push(section("PROPERTY DETAILS",
      [
        line("Bedrooms", data.bedrooms),
        line("Bathrooms", data.bathrooms),
        line("Square Footage", data.squareFootage ? `${data.squareFootage} sq ft` : null),
        line("Year Built", data.yearBuilt),
        line("Condition", data.condition),
        line("Occupancy", data.occupancyStatus),
        line("Utilities On", data.utilitiesOn ? "Yes" : "No"),
        line("HOA", data.hasHoa ? `Yes — $${data.hoaAmount || "?"}/mo` : "No"),
        line("Liens / Judgments", data.liensOrJudgments || "None"),
        line("Seller Motivation", data.motivation),
      ]
    ));
    noteLines.push(section("FINANCIALS",
      [
        line("Asking Price", data.askingPrice ? `$${Number(data.askingPrice).toLocaleString()}` : null),
        line("ARV", data.arv ? `$${Number(data.arv).toLocaleString()}` : null),
        line("Est. Repairs", data.estimatedRepairs ? `$${Number(data.estimatedRepairs).toLocaleString()}` : null),
        line("Financing Terms", data.financingTerms),
      ]
    ));
  } else if (data.propertyType === "multifamily") {
    noteLines.push(section("PROPERTY DETAILS",
      [
        line("Total Units", data.unitCount),
        line("Unit Mix", data.unitMix),
        line("Square Footage", data.squareFootage ? `${data.squareFootage} sq ft` : null),
        line("Year Built", data.yearBuilt),
        line("Condition", data.condition),
        line("Occupancy Status", data.occupancyStatus),
        line("Vacancy Rate", data.vacancyRate ? `${data.vacancyRate}%` : null),
        line("Value-Add Opportunities", data.valueAddOpportunities),
      ]
    ));
    noteLines.push(section("FINANCIALS",
      [
        line("Asking Price", data.askingPrice ? `$${Number(data.askingPrice).toLocaleString()}` : null),
        line("Gross Rents", data.grossRents ? `$${Number(data.grossRents).toLocaleString()}/mo` : null),
        line("Current NOI", data.currentNoi ? `$${Number(data.currentNoi).toLocaleString()}/yr` : null),
        line("Financing Terms", data.financingTerms),
      ]
    ));
  } else if (data.propertyType === "mhp") {
    noteLines.push(section("PROPERTY DETAILS",
      [
        line("Total Pads", data.totalPads),
        line("Occupied Pads", data.occupiedPads),
        line("Park-Owned Homes", data.parkOwnedHomes),
        line("Tenant-Owned Homes", data.tenantOwnedHomes),
        line("Water / Sewer", data.waterSewerType),
        line("Utilities Billed Back", data.utilitiesBilledBack ? "Yes" : "No"),
        line("Year Established", data.yearEstablished),
        line("Condition", data.condition),
        line("Value-Add Opportunities", data.valueAddOpportunities),
      ]
    ));
    noteLines.push(section("FINANCIALS",
      [
        line("Asking Price", data.askingPrice ? `$${Number(data.askingPrice).toLocaleString()}` : null),
        line("Lot Rent", data.lotRent ? `$${Number(data.lotRent).toLocaleString()}/mo` : null),
        line("Gross Rents", data.grossRents ? `$${Number(data.grossRents).toLocaleString()}/mo` : null),
        line("Current NOI", data.currentNoi ? `$${Number(data.currentNoi).toLocaleString()}/yr` : null),
        line("Financing Terms", data.financingTerms),
      ]
    ));
  } else if (data.propertyType === "rv_park") {
    noteLines.push(section("PROPERTY DETAILS",
      [
        line("Total Pads", data.totalPads),
        line("Occupied Pads", data.occupiedPads),
        line("Hookup Types", data.hookupTypes),
        line("Amenities", data.amenities),
        line("Year Established", data.yearEstablished),
        line("Condition", data.condition),
        line("Value-Add Opportunities", data.valueAddOpportunities),
      ]
    ));
    noteLines.push(section("FINANCIALS",
      [
        line("Asking Price", data.askingPrice ? `$${Number(data.askingPrice).toLocaleString()}` : null),
        line("Nightly Rate", data.nightlyRate ? `$${Number(data.nightlyRate).toLocaleString()}` : null),
        line("Monthly Rate", data.monthlyRate ? `$${Number(data.monthlyRate).toLocaleString()}` : null),
        line("Gross Rents", data.grossRents ? `$${Number(data.grossRents).toLocaleString()}/mo` : null),
        line("Current NOI", data.currentNoi ? `$${Number(data.currentNoi).toLocaleString()}/yr` : null),
        line("Financing Terms", data.financingTerms),
      ]
    ));
  }

  // Wholesaler/agent deal terms
  if (data.submitterRole === "wholesaler" || data.submitterRole === "agent") {
    noteLines.push(section("DEAL TERMS",
      [
        line("Assignment Fee", data.assignmentFee ? `$${Number(data.assignmentFee).toLocaleString()}` : null),
      ]
    ));
  }

  // Additional info
  noteLines.push(section("ADDITIONAL INFO",
    [
      line("Notes", data.additionalNotes || "None provided"),
      line("How They Heard About Josh", data.howHeard),
      line("Consent Given", data.consent ? "Yes" : "No"),
    ]
  ));

  return noteLines.join("\n");
}

async function createGHLOpportunity(contactId, data, pipeline, noteText) {
  const address = data.propertyAddress
    ? `${data.propertyAddress}, ${data.city || ""} ${data.state || ""}`
    : "Address not provided";

  const opportunityName = `${data.firstName} ${data.lastName} - ${address}`;

  const opportunityPayload = {
    pipelineId: pipeline.pipelineId,
    pipelineStageId: pipeline.stageId,
    locationId: GHL_LOCATION_ID,
    contactId: contactId,
    name: opportunityName,
    status: "open",
    monetaryValue: parseFloat(data.askingPrice) || 0,
  };

  const res = await fetch("https://services.leadconnectorhq.com/opportunities/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify(opportunityPayload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GHL opportunity creation failed: ${err}`);
  }

  const oppResult = await res.json();
  const opportunityId = oppResult.opportunity?.id || oppResult.id;

  // Add a note with full deal details
  if (opportunityId) {
    await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify({ body: noteText }),
    });
  }

  return opportunityId;
}

async function insertSupabaseRecord(data, table) {
  // Map form data to table columns
  const record = {
    submitter_role: data.submitterRole,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    preferred_contact: data.preferredContact,
    is_owner: data.isOwner === true || data.isOwner === "true",
    property_address: data.propertyAddress,
    city: data.city,
    state: data.state,
    zip: data.zip,
    county: data.county,
    condition: data.condition,
    financing_terms: data.financingTerms,
    assignment_fee: data.assignmentFee ? parseFloat(data.assignmentFee) : null,
    wholesaler_company: data.wholesalerCompany,
    additional_notes: data.additionalNotes,
    how_heard: data.howHeard,
    consent: data.consent === true || data.consent === "true",
    asking_price: data.askingPrice ? parseFloat(data.askingPrice) : null,
  };

  // Asset-class specific fields
  if (table === "sfr_deals") {
    Object.assign(record, {
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
      bathrooms: data.bathrooms ? parseFloat(data.bathrooms) : null,
      square_footage: data.squareFootage ? parseInt(data.squareFootage) : null,
      year_built: data.yearBuilt ? parseInt(data.yearBuilt) : null,
      arv: data.arv ? parseFloat(data.arv) : null,
      estimated_repairs: data.estimatedRepairs ? parseFloat(data.estimatedRepairs) : null,
      occupancy_status: data.occupancyStatus,
      utilities_on: data.utilitiesOn === true || data.utilitiesOn === "true",
      has_hoa: data.hasHoa === true || data.hasHoa === "true",
      hoa_amount: data.hoaAmount ? parseFloat(data.hoaAmount) : null,
      liens_or_judgments: data.liensOrJudgments,
      motivation: data.motivation,
    });
  } else if (table === "multifamily_deals") {
    Object.assign(record, {
      unit_count: data.unitCount ? parseInt(data.unitCount) : null,
      unit_mix: data.unitMix,
      square_footage: data.squareFootage ? parseInt(data.squareFootage) : null,
      year_built: data.yearBuilt ? parseInt(data.yearBuilt) : null,
      current_noi: data.currentNoi ? parseFloat(data.currentNoi) : null,
      gross_rents: data.grossRents ? parseFloat(data.grossRents) : null,
      vacancy_rate: data.vacancyRate ? parseFloat(data.vacancyRate) : null,
      occupancy_status: data.occupancyStatus,
      value_add_opportunities: data.valueAddOpportunities,
    });
  } else if (table === "mhp_deals") {
    Object.assign(record, {
      total_pads: data.totalPads ? parseInt(data.totalPads) : null,
      occupied_pads: data.occupiedPads ? parseInt(data.occupiedPads) : null,
      park_owned_homes: data.parkOwnedHomes ? parseInt(data.parkOwnedHomes) : null,
      tenant_owned_homes: data.tenantOwnedHomes ? parseInt(data.tenantOwnedHomes) : null,
      water_sewer_type: data.waterSewerType,
      utilities_billed_back: data.utilitiesBilledBack === true || data.utilitiesBilledBack === "true",
      gross_rents: data.grossRents ? parseFloat(data.grossRents) : null,
      current_noi: data.currentNoi ? parseFloat(data.currentNoi) : null,
      lot_rent: data.lotRent ? parseFloat(data.lotRent) : null,
      year_established: data.yearEstablished ? parseInt(data.yearEstablished) : null,
      value_add_opportunities: data.valueAddOpportunities,
    });
  } else if (table === "rv_park_deals") {
    Object.assign(record, {
      total_pads: data.totalPads ? parseInt(data.totalPads) : null,
      occupied_pads: data.occupiedPads ? parseInt(data.occupiedPads) : null,
      hookup_types: data.hookupTypes,
      amenities: data.amenities,
      gross_rents: data.grossRents ? parseFloat(data.grossRents) : null,
      current_noi: data.currentNoi ? parseFloat(data.currentNoi) : null,
      nightly_rate: data.nightlyRate ? parseFloat(data.nightlyRate) : null,
      monthly_rate: data.monthlyRate ? parseFloat(data.monthlyRate) : null,
      year_established: data.yearEstablished ? parseInt(data.yearEstablished) : null,
      value_add_opportunities: data.valueAddOpportunities,
    });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(record),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase insert failed (${table}): ${err}`);
  }

  const result = await res.json();
  return result[0]?.id;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    // Validate required fields
    if (!data.propertyType || !data.email) {
      return res.status(400).json({ error: "Missing required fields: propertyType, email" });
    }

    const propertyType = data.propertyType; // sfr | multifamily | mhp | rv_park
    const pipeline = GHL_PIPELINES[propertyType];
    const table = SUPABASE_TABLES[propertyType];

    if (!pipeline || !table) {
      return res.status(400).json({ error: `Unknown property type: ${propertyType}` });
    }

    const results = { ghl: null, supabase: null, errors: [] };

    // 1. Create/update GHL contact and opportunity
    try {
      // Build the note text once so it can be written to both the custom field AND the opportunity note
      const noteText = buildDealNoteText(data);
      const contactId = await createOrUpdateGHLContact(data, noteText);
      const opportunityId = await createGHLOpportunity(contactId, data, pipeline, noteText);
      results.ghl = { contactId, opportunityId, pipeline: pipeline.name };
    } catch (err) {
      console.error("GHL error:", err.message);
      results.errors.push(`GHL: ${err.message}`);
    }

    // 2. Insert full record into Supabase
    try {
      const recordId = await insertSupabaseRecord(data, table);
      results.supabase = { recordId, table };
    } catch (err) {
      console.error("Supabase error:", err.message);
      results.errors.push(`Supabase: ${err.message}`);
    }

    // Return success even if one destination had an error (partial success)
    const statusCode = results.errors.length === 2 ? 500 : 200;
    return res.status(statusCode).json({
      success: results.errors.length < 2,
      message:
        results.errors.length === 0
          ? "Deal submitted successfully to all destinations."
          : `Deal submitted with some issues: ${results.errors.join("; ")}`,
      results,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
