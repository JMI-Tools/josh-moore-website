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

async function createOrUpdateGHLContact(data) {
  const contactPayload = {
    locationId: GHL_LOCATION_ID,
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    email: data.email || "",
    phone: data.phone || "",
    source: "Website Deal Submission",
    tags: [`deal-submission`, `asset-class-${data.propertyType}`],
    customFields: [
      { key: "preferred_contact_method", field_value: data.preferredContact || "" },
      { key: "submitter_role", field_value: data.submitterRole || "" },
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

async function createGHLOpportunity(contactId, data, pipeline) {
  // Build a deal summary for the opportunity name
  const address = data.propertyAddress
    ? `${data.propertyAddress}, ${data.city || ""} ${data.state || ""}`
    : "Address not provided";

  const opportunityName = `${data.firstName} ${data.lastName} - ${address}`;

  // Build notes with all deal details
  const noteLines = [
    `=== DEAL SUBMISSION ===`,
    `Submitted: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET`,
    `Asset Class: ${data.propertyType?.toUpperCase()}`,
    `Submitter Role: ${data.submitterRole}`,
    ``,
    `--- CONTACT INFO ---`,
    `Name: ${data.firstName} ${data.lastName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Preferred Contact: ${data.preferredContact}`,
    ``,
    `--- PROPERTY INFO ---`,
    `Address: ${data.propertyAddress || "N/A"}`,
    `City: ${data.city || "N/A"}`,
    `State: ${data.state || "N/A"}`,
    `ZIP: ${data.zip || "N/A"}`,
    `County: ${data.county || "N/A"}`,
  ];

  // Add asset-class-specific fields
  if (data.propertyType === "sfr") {
    noteLines.push(
      ``,
      `--- SFR DETAILS ---`,
      `Bedrooms: ${data.bedrooms || "N/A"}`,
      `Bathrooms: ${data.bathrooms || "N/A"}`,
      `Sq Ft: ${data.squareFootage || "N/A"}`,
      `Year Built: ${data.yearBuilt || "N/A"}`,
      `Asking Price: $${data.askingPrice || "N/A"}`,
      `ARV: $${data.arv || "N/A"}`,
      `Est. Repairs: $${data.estimatedRepairs || "N/A"}`,
      `Condition: ${data.condition || "N/A"}`,
      `Occupancy: ${data.occupancyStatus || "N/A"}`,
      `Utilities On: ${data.utilitiesOn || "N/A"}`,
      `HOA: ${data.hasHoa ? `Yes - $${data.hoaAmount}/mo` : "No"}`,
      `Liens/Judgments: ${data.liensOrJudgments || "None"}`,
      `Motivation: ${data.motivation || "N/A"}`,
      `Financing Terms: ${data.financingTerms || "N/A"}`
    );
  } else if (data.propertyType === "multifamily") {
    noteLines.push(
      ``,
      `--- MULTIFAMILY DETAILS ---`,
      `Units: ${data.unitCount || "N/A"}`,
      `Unit Mix: ${data.unitMix || "N/A"}`,
      `Sq Ft: ${data.squareFootage || "N/A"}`,
      `Year Built: ${data.yearBuilt || "N/A"}`,
      `Asking Price: $${data.askingPrice || "N/A"}`,
      `Gross Rents: $${data.grossRents || "N/A"}/mo`,
      `Current NOI: $${data.currentNoi || "N/A"}/yr`,
      `Vacancy Rate: ${data.vacancyRate || "N/A"}%`,
      `Occupancy: ${data.occupancyStatus || "N/A"}`,
      `Condition: ${data.condition || "N/A"}`,
      `Value-Add Opportunities: ${data.valueAddOpportunities || "N/A"}`,
      `Financing Terms: ${data.financingTerms || "N/A"}`
    );
  } else if (data.propertyType === "mhp") {
    noteLines.push(
      ``,
      `--- MHP DETAILS ---`,
      `Total Pads: ${data.totalPads || "N/A"}`,
      `Occupied Pads: ${data.occupiedPads || "N/A"}`,
      `Park-Owned Homes: ${data.parkOwnedHomes || "N/A"}`,
      `Tenant-Owned Homes: ${data.tenantOwnedHomes || "N/A"}`,
      `Water/Sewer: ${data.waterSewerType || "N/A"}`,
      `Utilities Billed Back: ${data.utilitiesBilledBack || "N/A"}`,
      `Asking Price: $${data.askingPrice || "N/A"}`,
      `Gross Rents: $${data.grossRents || "N/A"}/mo`,
      `Current NOI: $${data.currentNoi || "N/A"}/yr`,
      `Lot Rent: $${data.lotRent || "N/A"}/mo`,
      `Year Established: ${data.yearEstablished || "N/A"}`,
      `Condition: ${data.condition || "N/A"}`,
      `Value-Add Opportunities: ${data.valueAddOpportunities || "N/A"}`,
      `Financing Terms: ${data.financingTerms || "N/A"}`
    );
  } else if (data.propertyType === "rv_park") {
    noteLines.push(
      ``,
      `--- RV PARK DETAILS ---`,
      `Total Pads: ${data.totalPads || "N/A"}`,
      `Occupied Pads: ${data.occupiedPads || "N/A"}`,
      `Hookup Types: ${data.hookupTypes || "N/A"}`,
      `Amenities: ${data.amenities || "N/A"}`,
      `Asking Price: $${data.askingPrice || "N/A"}`,
      `Gross Rents: $${data.grossRents || "N/A"}/mo`,
      `Current NOI: $${data.currentNoi || "N/A"}/yr`,
      `Nightly Rate: $${data.nightlyRate || "N/A"}`,
      `Monthly Rate: $${data.monthlyRate || "N/A"}`,
      `Year Established: ${data.yearEstablished || "N/A"}`,
      `Condition: ${data.condition || "N/A"}`,
      `Value-Add Opportunities: ${data.valueAddOpportunities || "N/A"}`,
      `Financing Terms: ${data.financingTerms || "N/A"}`
    );
  }

  // Wholesaler fields
  if (data.submitterRole === "wholesaler" || data.submitterRole === "agent") {
    noteLines.push(
      ``,
      `--- WHOLESALER/AGENT INFO ---`,
      `Company: ${data.wholesalerCompany || "N/A"}`,
      `Assignment Fee: $${data.assignmentFee || "N/A"}`
    );
  }

  noteLines.push(
    ``,
    `--- ADDITIONAL ---`,
    `Notes: ${data.additionalNotes || "None"}`,
    `How Heard: ${data.howHeard || "N/A"}`,
    `Consent: ${data.consent ? "Yes" : "No"}`
  );

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
      body: JSON.stringify({ body: noteLines.join("\n") }),
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
      const contactId = await createOrUpdateGHLContact(data);
      const opportunityId = await createGHLOpportunity(contactId, data, pipeline);
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
