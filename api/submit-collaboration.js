// Collaboration Form Submission Handler
// Routes to GHL pipelines + Supabase collaborations table

function buildCollabTags(data) {
  const tags = ['website-submission'];

  // Map category to its specific GHL tag
  const categoryTagMap = {
    bird_dog: 'bird-dog',
    wholesaler: 'wholesaler',
    private_money_lender: 'private-money-lender',
    capital_raiser: 'capital-raiser',
    capital_partner: 'capital-partner',
    hard_money_lender: 'hard-money-lender',
    dscr_lender: 'dscr-lender',
    commercial_lender: 'commercial-lender',
    mortgage_broker: 'mortgage-broker',
    commercial_broker: 'commercial-broker',
    industry_partner: 'industry-partner',
  };

  const categoryTag = categoryTagMap[data.category];
  if (categoryTag) tags.push(categoryTag);

  return tags;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const data = req.body;
  const { category } = data;

  const GHL_API_KEY = process.env.GHL_API_KEY;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Pipeline routing based on collaboration category
  const PIPELINE_MAP = {
    'bird_dog': { pipelineId: '8fMXoEMiATod88FFvE6U', stageId: '47206dfc-6f00-4237-9556-b22fed5e55a9' }, // Subto Members - Bird dog
    'wholesaler': { pipelineId: '8fMXoEMiATod88FFvE6U', stageId: 'b80d7cfe-7f05-450b-91de-d92c69b7ccad' }, // Subto Members - Wholesaler
    'private_money_lender': { pipelineId: '95jWfav1cje7KE5x3Up5', stageId: '102c563c-75cb-4769-a36a-cede5a714f70' }, // Private Money Lenders Direct - New Relationship
    'capital_raiser': { pipelineId: 'RqJRpBjQ5DWIUiGKq1mP', stageId: 'd3ac1bf6-c0d9-4b5d-924a-a537a409bf6e' }, // Private Money Partners - New Relationship
    'capital_partner': { pipelineId: 'RqJRpBjQ5DWIUiGKq1mP', stageId: 'd3ac1bf6-c0d9-4b5d-924a-a537a409bf6e' }, // Private Money Partners - New Relationship
    'hard_money_lender': { pipelineId: '1bf8f4d4-2ba6-418a-8f64-fcf62cc64fa5', stageId: '34460345-0a2e-46f4-9493-d3987c18c590' }, // Loan Broker - Perspective Investor (reuse as lender)
    'dscr_lender': { pipelineId: '1bf8f4d4-2ba6-418a-8f64-fcf62cc64fa5', stageId: '34460345-0a2e-46f4-9493-d3987c18c590' },
    'commercial_lender': { pipelineId: '1bf8f4d4-2ba6-418a-8f64-fcf62cc64fa5', stageId: '34460345-0a2e-46f4-9493-d3987c18c590' },
    'mortgage_broker': { pipelineId: '1bf8f4d4-2ba6-418a-8f64-fcf62cc64fa5', stageId: '34460345-0a2e-46f4-9493-d3987c18c590' },
    'commercial_broker': { pipelineId: 'kKwjvaZgsKO7cyEZAWOW', stageId: '32e4b69b-1777-4807-98d3-bc6a3522cce4' }, // Local Lead Magnet - Fresh
    'industry_partner': { pipelineId: 'NTEoDxtGGx7u71MYj7k8', stageId: 'ea3feb22-df4e-4574-a7f4-03461e23815a' }, // Owners Club Members - New Contact
  };

  const pipeline = PIPELINE_MAP[category] || PIPELINE_MAP['industry_partner'];

  const categoryLabels = {
    bird_dog: 'Bird Dog',
    wholesaler: 'Wholesaler',
    private_money_lender: 'Private Money Lender',
    capital_raiser: 'Capital Raiser',
    capital_partner: 'Capital Partner',
    hard_money_lender: 'Hard Money Lender',
    dscr_lender: 'DSCR Lender',
    commercial_lender: 'Commercial Lender',
    mortgage_broker: 'Mortgage Broker',
    commercial_broker: 'Commercial Broker / Agent',
    industry_partner: 'Industry Partner',
  };

  const label = categoryLabels[category] || category;

  // Build clean formatted note for GHL
  function buildNote(d) {
    const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' });
    const arr = (v) => Array.isArray(v) && v.length > 0 ? v.join(', ') : null;
    const val = (v) => v && v !== '' ? v : null;
    const line = (label, value) => value ? `${label}: ${value}\n` : '';

    let note = `COLLABORATION SUBMISSION — ${label.toUpperCase()}\n`;
    note += `Submitted: ${now}\n\n`;

    note += `[ CONTACT INFO ]\n`;
    note += line('Name', val(d.name));
    note += line('Email', val(d.email));
    note += line('Phone', val(d.phone));
    note += line('Website', val(d.website));
    note += '\n';

    if (['bird_dog', 'wholesaler'].includes(d.category)) {
      note += `[ DEAL FINDER DETAILS ]\n`;
      note += line('Type', val(d.bd_type));
      note += line('Assignment Fee / Finder Fee', val(d.bd_fee));
      note += line('Leads Per Month', val(d.bd_leads_per_month));
      note += line('How They Find Leads', arr(d.bd_find_leads));
      if (d.category === 'wholesaler') {
        note += line('Currently Under Contract', val(d.ws_under_contract));
        note += line('How They Find Deals', arr(d.ws_find_deals));
      }
      note += line('Deal Types', arr(d.bd_deal_types));
      note += line('Markets', arr(d.bd_markets));
      note += line('Communities / Niches', val(d.bd_communities));
      note += line('Goal', val(d.bd_goal));
    }

    if (d.category === 'private_money_lender') {
      note += `[ PRIVATE MONEY LENDER DETAILS ]\n`;
      note += line('Lender Type', val(d.pml_type));
      note += line('Available Capital', val(d.pml_capital));
      note += line('Asset Classes', arr(d.pml_asset_classes));
      note += line('RE Investing Experience', val(d.pml_experience));
      note += line('Deals Funded', val(d.pml_deal_count));
      note += line('Excluded Asset Classes', val(d.pml_excluded_assets));
      note += line('Preferred Loan Terms', arr(d.pml_loan_terms));
      note += line('Expected Rate of Return', val(d.pml_rate));
      note += line('Fund Source', arr(d.pml_fund_source));
      note += line('Goal', val(d.pml_goal));
    }

    if (d.category === 'capital_raiser') {
      note += `[ CAPITAL RAISER DETAILS ]\n`;
      note += line('Network Size', val(d.cr_network_size));
      note += line('Investor Types', arr(d.cr_investor_types));
      note += line('Asset Classes', arr(d.cr_asset_classes));
      note += line('Experience', val(d.cr_experience));
      note += line('Capital Raised to Date', val(d.cr_amount_raised));
      note += line('Deal Structures', arr(d.cr_structures));
      note += line('Compensation Preference', val(d.cr_compensation));
      note += line('Goal', val(d.cr_goal));
    }

    if (d.category === 'capital_partner') {
      note += `[ CAPITAL PARTNER DETAILS ]\n`;
      note += line('Accredited Investor', val(d.cp_accredited));
      note += line('Available Capital', val(d.cp_capital));
      note += line('Asset Classes', arr(d.cp_asset_classes));
      note += line('Involvement Level', val(d.cp_involvement));
      note += line('Expected Return', val(d.cp_expected_return));
      note += line('Hold Period', arr(d.cp_hold_period));
      note += line('Prior RE Experience', val(d.cp_prior_experience));
      note += line('Prior Asset Classes', arr(d.cp_prior_assets));
      note += line('Fund Source', arr(d.cp_fund_source));
      note += line('Goal', val(d.cp_goal));
    }

    if (d.category === 'hard_money_lender') {
      note += `[ HARD MONEY LENDER DETAILS ]\n`;
      note += line('Company', val(d.hm_company));
      note += line('Asset Classes', arr(d.hm_asset_classes));
      note += line('Lends Nationally', val(d.hm_national));
      note += line('Excluded States', arr(d.hm_excluded_states));
      note += line('Lends Rural', val(d.hm_rural));
      note += line('Max LTV', val(d.hm_ltv));
      note += line('Rates', val(d.hm_rates));
      note += line('Min Loan Amount', val(d.hm_min_loan));
      note += line('Loan Terms', arr(d.hm_loan_terms));
      note += line('Close Timeline', val(d.hm_close_timeline));
      note += line('Lends on Distressed', val(d.hm_distressed));
      note += line('Personal Guarantee Required', val(d.hm_personal_guarantee));
      note += line('Referral Program', val(d.hm_referral_program));
      note += line('Goal', val(d.hm_goal));
    }

    if (d.category === 'dscr_lender') {
      note += `[ DSCR LENDER DETAILS ]\n`;
      note += line('Company', val(d.dscr_company));
      note += line('Asset Classes', arr(d.dscr_asset_classes));
      note += line('Lends Nationally', val(d.dscr_national));
      note += line('Excluded States', arr(d.dscr_excluded_states));
      note += line('Lends Rural', val(d.dscr_rural));
      note += line('Min DSCR Ratio', val(d.dscr_ratio));
      note += line('Max LTV', val(d.dscr_ltv));
      note += line('Rates', val(d.dscr_rates));
      note += line('Min Loan Amount', val(d.dscr_min_loan));
      note += line('Loan Terms', arr(d.dscr_loan_terms));
      note += line('Personal Guarantee Required', val(d.dscr_personal_guarantee));
      note += line('Referral Program', val(d.dscr_referral_program));
      note += line('Goal', val(d.dscr_goal));
    }

    if (d.category === 'commercial_lender') {
      note += `[ COMMERCIAL LENDER DETAILS ]\n`;
      note += line('Company', val(d.cl_company));
      note += line('Asset Classes', arr(d.cl_asset_classes));
      note += line('Lends Nationally', val(d.cl_national));
      note += line('Excluded States', arr(d.cl_excluded_states));
      note += line('Lends Rural', val(d.cl_rural));
      note += line('Max LTV', val(d.cl_ltv));
      note += line('Rates', val(d.cl_rates));
      note += line('Min Loan Amount', val(d.cl_min_loan));
      note += line('Loan Terms', arr(d.cl_loan_terms));
      note += line('Agency / Portfolio', val(d.cl_agency_portfolio));
      note += line('Prepayment Penalty', val(d.cl_prepayment_penalty));
      note += line('Personal Guarantee Required', val(d.cl_personal_guarantee));
      note += line('Referral Program', val(d.cl_referral_program));
      note += line('Goal', val(d.cl_goal));
    }

    if (d.category === 'mortgage_broker') {
      note += `[ MORTGAGE BROKER DETAILS ]\n`;
      note += line('Company', val(d.mb_company));
      note += line('Products', arr(d.mb_products));
      note += line('Asset Classes', arr(d.mb_asset_classes));
      note += line('Works Nationally', val(d.mb_national));
      note += line('Excluded States', arr(d.mb_excluded_states));
      note += line('Min Loan Amount', val(d.mb_min_loan));
      note += line('Referral Program', val(d.mb_referral_program));
      note += line('Goal', val(d.mb_goal));
    }

    if (d.category === 'commercial_broker') {
      note += `[ COMMERCIAL BROKER / AGENT DETAILS ]\n`;
      note += line('Company', val(d.cb_company));
      note += line('Asset Classes', arr(d.cb_asset_classes));
      note += line('Works Nationally', val(d.cb_national));
      note += line('Excluded States', arr(d.cb_excluded_states));
      note += line('Has Off-Market Inventory', val(d.cb_offmarket));
      note += line('Sourcing Method', val(d.cb_method));
      note += line('Typical Deal Size', val(d.cb_deal_size));
      note += line('Deals Per Year', val(d.cb_deals_per_year));
      note += line('Open to Co-Broker', val(d.cb_cobroker));
      note += line('Represents', val(d.cb_represent));
      note += line('Referral Program', val(d.cb_referral));
      note += line('Goal', val(d.cb_goal));
    }

    if (d.category === 'industry_partner') {
      note += `[ INDUSTRY PARTNER DETAILS ]\n`;
      note += line('Roles', arr(d.ip_roles));
      note += line('Other Role', val(d.ip_other_role));
      note += line('More Details', val(d.ip_other_more) || val(d.ip_standard_more));
      note += line('Goal', val(d.ip_goal));
    }

    note += '\n[ ADDITIONAL INFO ]\n';
    note += line('Additional Notes', val(d.additional_notes));
    note += line('How They Heard About Josh', val(d.hear_about));
    note += line('Consent Given', d.consent ? 'Yes' : 'No');

    return note;
  }

  const results = { ghl: null, supabase: null, errors: [] };

  // Build note text once — used for both the custom field (overwrites on every submission) and the contact note
  const noteText = buildNote(data);

  // 1. Create/update GHL contact
  let contactId = null;
  try {
    const contactRes = await fetch(`https://services.leadconnectorhq.com/contacts/upsert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        firstName: data.name ? data.name.split(' ')[0] : '',
        lastName: data.name ? data.name.split(' ').slice(1).join(' ') : '',
        email: data.email || '',
        phone: data.phone || '',
        source: 'Website Collaboration Form',
        tags: buildCollabTags(data),
        customFields: [
          { key: 'opportunity_notes', field_value: noteText },
        ],
      }),
    });
    const contactData = await contactRes.json();
    contactId = contactData?.contact?.id;
    results.ghl = { contactId };
  } catch (e) {
    results.errors.push(`GHL contact: ${e.message}`);
  }

  // 2. Create GHL opportunity
  let opportunityId = null;
  if (contactId) {
    try {
      const oppRes = await fetch(`https://services.leadconnectorhq.com/opportunities/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipelineId: pipeline.pipelineId,
          pipelineStageId: pipeline.stageId,
          locationId: GHL_LOCATION_ID,
          contactId,
          name: `${label} — ${data.name || 'Unknown'}`,
          status: 'open',
        }),
      });
      const oppData = await oppRes.json();
      opportunityId = oppData?.opportunity?.id;
      results.ghl.opportunityId = opportunityId;
    } catch (e) {
      results.errors.push(`GHL opportunity: ${e.message}`);
    }
  }

  // 3. Add formatted note to GHL contact
  if (opportunityId) {
    try {
      await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: noteText }),
      });
    } catch (e) {
      results.errors.push(`GHL note: ${e.message}`);
    }
  }

  // 4. Insert into Supabase collaborations table
  try {
    const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/collaborations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        ...data,
        ghl_contact_id: contactId,
        ghl_opportunity_id: opportunityId,
      }),
    });
    const supaData = await supaRes.json();
    results.supabase = { id: supaData?.[0]?.id };
  } catch (e) {
    results.errors.push(`Supabase: ${e.message}`);
  }

  return res.status(200).json({
    success: true,
    message: 'Collaboration submission received',
    ...results,
  });
}
