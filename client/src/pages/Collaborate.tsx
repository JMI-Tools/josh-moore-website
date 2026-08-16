import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouteSeo } from "@/hooks/useSeo";

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming"
];

const ASSET_CLASSES = [
  "Single Family","Multifamily","Mobile Home Park","RV Park / Campground",
  "Self Storage","Land","Commercial","Other"
];

const LOAN_TERMS = ["6 months","12 months","24 months","Longer","Flexible"];
const FUND_SOURCES = ["Personal funds","IRA","SDIRA","Life insurance policy","Combination"];

const CATEGORIES = [
  { id: "bird-dog", label: "Bird Dog" },
  { id: "wholesaler", label: "Wholesaler" },
  { id: "pml", label: "Private Money Lender" },
  { id: "capital-raiser", label: "Capital Raiser" },
  { id: "capital-partner", label: "Capital Partner" },
  { id: "hard-money", label: "Hard Money Lender" },
  { id: "dscr", label: "DSCR Lender" },
  { id: "commercial-lender", label: "Commercial Lender" },
  { id: "mortgage-broker", label: "Mortgage Broker" },
  { id: "commercial-broker", label: "Commercial Broker" },
  { id: "industry-partner", label: "Industry Partner" },
];

const INTRO_MESSAGES: Record<string, string> = {
  "bird-dog": "I appreciate you taking a second to connect with me and start bringing me deals. I'd love to work with you — tell me a little bit about yourself and what your expectations are.",
  "wholesaler": "Hey, I appreciate you taking a second to connect. I'd love to JV or buy a deal from you. Tell me a little bit about you and where you operate, and let's find a win together.",
  "pml": "I appreciate you taking a second to connect and collaborate with me. Tell me a little bit about you as a private money lender and your expectations, and let's put some good returns together.",
  "capital-raiser": "Hey there, thanks for doing what capital raisers do best — connecting and collaborating. I would love to find some synergy between us and have plenty of opportunities that you can raise on. Tell me a little bit more about you and let's find a win together.",
  "capital-partner": "I appreciate you taking a second and I look forward to collaborating with you on some great deals and awesome adventures. Whether you have active liquid capital, a 401K, SDIRA, Roth IRA, or just funds that you need to put to work — I would love to partner with you on some amazing returns and awesome adventures. Tell me a little more about you.",
  "hard-money": "Thanks for taking a second to connect and collaborate with me. I'm always looking for new hard money lenders to connect with, use on projects, and recommend to my friends. Tell me a little bit more about yourself and the products that you offer.",
  "dscr": "Hey, thanks — I appreciate you taking a few to connect and collaborate with me. I'm always looking for new DSCR lenders to connect with. Tell me a little bit about you and your products so we can find a good fit between us.",
  "commercial-lender": "I really appreciate you taking a moment — I love connecting with new commercial lenders to embark on new adventures with. Whether it's a laundromat, RV park, or anything else in between, I'm sure there's some synergy we can find between us.",
  "mortgage-broker": "Hey, I appreciate you taking a minute and connecting. I'm always looking to connect with more savvy and multifaceted brokers. Tell me a little bit about the products you offer and let's see if we can find some synergy and a win together.",
  "commercial-broker": "Hey, I appreciate you taking the time to connect and collaborate with me. I would love for you to get some awesome deals in front of me. Tell me a little bit more about what your focus is in commercial real estate.",
  "industry-partner": "Hey there, thanks for taking a second to connect and collaborate with me. Tell me more about what you do and let's connect and find some synergy.",
};

// Reusable components
function PillGroup({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            selected.includes(opt)
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white/5 border-white/20 text-white/70 hover:border-blue-400 hover:text-white"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function RadioGroup({ name, options, value, onChange }: { name: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
            value === opt.value
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white/5 border-white/20 text-white/70 hover:border-blue-400 hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StateMultiSelect({ selected, onChange, label }: { selected: string[]; onChange: (v: string[]) => void; label?: string }) {
  const toggle = (s: string) => {
    onChange(selected.includes(s) ? selected.filter(x => x !== s) : [...selected, s]);
  };
  return (
    <div>
      {label && <p className="text-white/60 text-sm mb-2">{label}</p>}
      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-white/5 rounded-lg border border-white/10">
        {STATES.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
              selected.includes(s)
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-transparent border-white/20 text-white/60 hover:border-blue-400 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <p className="text-blue-400 text-xs mt-1">{selected.length} state{selected.length !== 1 ? "s" : ""} selected</p>
      )}
    </div>
  );
}

function FormField({ label, required, children, error }: { label: string; required?: boolean; children: React.ReactNode; error?: string }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-white/90 mb-1">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
        {!required && <span className="text-white/40 ml-1 text-xs">(optional)</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
    />
  );
}

function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
    />
  );
}

function SelectInput({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[#0A1628] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
    >
      <option value="">{placeholder || "Select..."}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

const STEP_NAMES = ["Contact Info", "How to Collaborate", "About You", "Details", "Final"];

export default function Collaborate() {
  useRouteSeo("/collaborate");

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Step 1 — Contact
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Step 4 — Bird Dog / Wholesaler
  const [bdType, setBdType] = useState("");
  const [bdFee, setBdFee] = useState("");
  const [bdLeads, setBdLeads] = useState("");
  const [bdFindLeads, setBdFindLeads] = useState<string[]>([]);
  const [wsUnderContract, setWsUnderContract] = useState("");
  const [wsFindDeals, setWsFindDeals] = useState<string[]>([]);
  const [bdDealTypes, setBdDealTypes] = useState<string[]>([]);
  const [bdMarkets, setBdMarkets] = useState<string[]>([]);
  const [bdCommunities, setBdCommunities] = useState("");
  const [bdGoal, setBdGoal] = useState("");

  // Step 4 — PML
  const [pmlType, setPmlType] = useState("");
  const [pmlCapital, setPmlCapital] = useState("");
  const [pmlAssets, setPmlAssets] = useState<string[]>([]);
  const [pmlExp, setPmlExp] = useState("");
  const [pmlDealCount, setPmlDealCount] = useState("");
  const [pmlExcluded, setPmlExcluded] = useState("");
  const [pmlTerms, setPmlTerms] = useState<string[]>([]);
  const [pmlRate, setPmlRate] = useState("");
  const [pmlFundSource, setPmlFundSource] = useState<string[]>([]);
  const [pmlGoal, setPmlGoal] = useState("");

  // Step 4 — Capital Raiser
  const [crNetwork, setCrNetwork] = useState("");
  const [crInvestorTypes, setCrInvestorTypes] = useState<string[]>([]);
  const [crAssets, setCrAssets] = useState<string[]>([]);
  const [crExp, setCrExp] = useState("");
  const [crAmountRaised, setCrAmountRaised] = useState("");
  const [crStructures, setCrStructures] = useState<string[]>([]);
  const [crCompensation, setCrCompensation] = useState("");
  const [crGoal, setCrGoal] = useState("");

  // Step 4 — Capital Partner
  const [cpAccredited, setCpAccredited] = useState("");
  const [cpCapital, setCpCapital] = useState("");
  const [cpAssets, setCpAssets] = useState<string[]>([]);
  const [cpInvolve, setCpInvolve] = useState("");
  const [cpReturn, setCpReturn] = useState("");
  const [cpHoldPeriod, setCpHoldPeriod] = useState<string[]>([]);
  const [cpExp, setCpExp] = useState("");
  const [cpPriorAssets, setCpPriorAssets] = useState<string[]>([]);
  const [cpFundSource, setCpFundSource] = useState<string[]>([]);
  const [cpGoal, setCpGoal] = useState("");

  // Step 4 — Hard Money Lender
  const [hmCompany, setHmCompany] = useState("");
  const [hmAssets, setHmAssets] = useState<string[]>([]);
  const [hmNational, setHmNational] = useState("");
  const [hmExcludedStates, setHmExcludedStates] = useState<string[]>([]);
  const [hmRural, setHmRural] = useState("");
  const [hmLtv, setHmLtv] = useState("");
  const [hmRates, setHmRates] = useState("");
  const [hmMin, setHmMin] = useState("");
  const [hmTerms, setHmTerms] = useState<string[]>([]);
  const [hmTimeline, setHmTimeline] = useState("");
  const [hmDistressed, setHmDistressed] = useState("");
  const [hmPg, setHmPg] = useState("");
  const [hmReferral, setHmReferral] = useState("");
  const [hmGoal, setHmGoal] = useState("");

  // Step 4 — DSCR Lender
  const [dscrCompany, setDscrCompany] = useState("");
  const [dscrAssets, setDscrAssets] = useState<string[]>([]);
  const [dscrNational, setDscrNational] = useState("");
  const [dscrExcludedStates, setDscrExcludedStates] = useState<string[]>([]);
  const [dscrRural, setDscrRural] = useState("");
  const [dscrRatio, setDscrRatio] = useState("");
  const [dscrLtv, setDscrLtv] = useState("");
  const [dscrRates, setDscrRates] = useState("");
  const [dscrMin, setDscrMin] = useState("");
  const [dscrTerms, setDscrTerms] = useState<string[]>([]);
  const [dscrPg, setDscrPg] = useState("");
  const [dscrReferral, setDscrReferral] = useState("");
  const [dscrGoal, setDscrGoal] = useState("");

  // Step 4 — Commercial Lender
  const [clCompany, setClCompany] = useState("");
  const [clAssets, setClAssets] = useState<string[]>([]);
  const [clNational, setClNational] = useState("");
  const [clExcludedStates, setClExcludedStates] = useState<string[]>([]);
  const [clRural, setClRural] = useState("");
  const [clLtv, setClLtv] = useState("");
  const [clRates, setClRates] = useState("");
  const [clMin, setClMin] = useState("");
  const [clTerms, setClTerms] = useState<string[]>([]);
  const [clAgency, setClAgency] = useState("");
  const [clPrepay, setClPrepay] = useState("");
  const [clPg, setClPg] = useState("");
  const [clReferral, setClReferral] = useState("");
  const [clGoal, setClGoal] = useState("");

  // Step 4 — Mortgage Broker
  const [mbCompany, setMbCompany] = useState("");
  const [mbProducts, setMbProducts] = useState<string[]>([]);
  const [mbAssets, setMbAssets] = useState<string[]>([]);
  const [mbNational, setMbNational] = useState("");
  const [mbExcludedStates, setMbExcludedStates] = useState<string[]>([]);
  const [mbMin, setMbMin] = useState("");
  const [mbReferral, setMbReferral] = useState("");
  const [mbGoal, setMbGoal] = useState("");

  // Step 4 — Commercial Broker
  const [cbCompany, setCbCompany] = useState("");
  const [cbAssets, setCbAssets] = useState<string[]>([]);
  const [cbNational, setCbNational] = useState("");
  const [cbExcludedStates, setCbExcludedStates] = useState<string[]>([]);
  const [cbOffmarket, setCbOffmarket] = useState("");
  const [cbMethod, setCbMethod] = useState("");
  const [cbDealSize, setCbDealSize] = useState("");
  const [cbDealsPerYear, setCbDealsPerYear] = useState("");
  const [cbCobroker, setCbCobroker] = useState("");
  const [cbRepresent, setCbRepresent] = useState("");
  const [cbReferral, setCbReferral] = useState("");
  const [cbGoal, setCbGoal] = useState("");

  // Step 4 — Industry Partner
  const [ipRoles, setIpRoles] = useState<string[]>([]);
  const [ipOtherText, setIpOtherText] = useState("");
  const [ipOtherMore, setIpOtherMore] = useState("");
  const [ipStandardMore, setIpStandardMore] = useState("");
  const [ipGoal, setIpGoal] = useState("");

  // Step 5 — Final
  const [finalNotes, setFinalNotes] = useState("");
  const [hearAbout, setHearAbout] = useState("");
  const [consent, setConsent] = useState(false);

  const validate = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!name.trim()) errs.name = "Required.";
      if (!email.trim() || !email.includes("@")) errs.email = "Valid email required.";
      if (!phone.trim()) errs.phone = "Required.";
    }
    if (s === 1) {
      if (!category) errs.category = "Please select a collaboration type.";
    }
    if (s === 3) {
      if (category === "bird-dog" || category === "wholesaler") {
        if (!bdType) errs.bdType = "Required.";
      }
      if (category === "pml") {
        if (!pmlType) errs.pmlType = "Required.";
        if (pmlType === "direct") {
          if (!pmlCapital) errs.pmlCapital = "Required.";
          if (pmlAssets.length === 0) errs.pmlAssets = "Select at least one.";
          if (!pmlExp) errs.pmlExp = "Required.";
          if (pmlTerms.length === 0) errs.pmlTerms = "Select at least one.";
        }
      }
      if (category === "capital-raiser") {
        if (!crNetwork) errs.crNetwork = "Required.";
        if (crInvestorTypes.length === 0) errs.crInvestorTypes = "Select at least one.";
        if (crAssets.length === 0) errs.crAssets = "Select at least one.";
        if (!crExp) errs.crExp = "Required.";
      }
      if (category === "capital-partner") {
        if (!cpAccredited) errs.cpAccredited = "Required.";
        if (!cpCapital) errs.cpCapital = "Required.";
        if (cpAssets.length === 0) errs.cpAssets = "Select at least one.";
        if (!cpInvolve) errs.cpInvolve = "Required.";
      }
      if (category === "hard-money") {
        if (!hmCompany.trim()) errs.hmCompany = "Required.";
        if (hmAssets.length === 0) errs.hmAssets = "Select at least one.";
        if (!hmNational) errs.hmNational = "Required.";
        if (!hmRural) errs.hmRural = "Required.";
        if (!hmLtv.trim()) errs.hmLtv = "Required.";
        if (!hmRates.trim()) errs.hmRates = "Required.";
        if (!hmMin) errs.hmMin = "Required.";
        if (hmTerms.length === 0) errs.hmTerms = "Select at least one.";
      }
      if (category === "dscr") {
        if (!dscrCompany.trim()) errs.dscrCompany = "Required.";
        if (dscrAssets.length === 0) errs.dscrAssets = "Select at least one.";
        if (!dscrNational) errs.dscrNational = "Required.";
        if (!dscrRural) errs.dscrRural = "Required.";
        if (!dscrRatio.trim()) errs.dscrRatio = "Required.";
        if (!dscrLtv.trim()) errs.dscrLtv = "Required.";
        if (!dscrRates.trim()) errs.dscrRates = "Required.";
        if (!dscrMin) errs.dscrMin = "Required.";
        if (dscrTerms.length === 0) errs.dscrTerms = "Select at least one.";
      }
      if (category === "commercial-lender") {
        if (!clCompany.trim()) errs.clCompany = "Required.";
        if (clAssets.length === 0) errs.clAssets = "Select at least one.";
        if (!clNational) errs.clNational = "Required.";
        if (!clRural) errs.clRural = "Required.";
        if (!clLtv.trim()) errs.clLtv = "Required.";
        if (!clRates.trim()) errs.clRates = "Required.";
        if (!clMin) errs.clMin = "Required.";
        if (clTerms.length === 0) errs.clTerms = "Select at least one.";
      }
      if (category === "mortgage-broker") {
        if (!mbCompany.trim()) errs.mbCompany = "Required.";
        if (mbProducts.length === 0) errs.mbProducts = "Select at least one.";
        if (mbAssets.length === 0) errs.mbAssets = "Select at least one.";
        if (!mbNational) errs.mbNational = "Required.";
        if (!mbMin) errs.mbMin = "Required.";
      }
      if (category === "commercial-broker") {
        if (!cbCompany.trim()) errs.cbCompany = "Required.";
        if (cbAssets.length === 0) errs.cbAssets = "Select at least one.";
        if (!cbNational) errs.cbNational = "Required.";
        if (!cbOffmarket) errs.cbOffmarket = "Required.";
        if (!cbMethod) errs.cbMethod = "Required.";
        if (!cbDealSize) errs.cbDealSize = "Required.";
      }
      if (category === "industry-partner") {
        if (ipRoles.length === 0) errs.ipRoles = "Select at least one.";
      }
    }
    if (s === 4) {
      if (!consent) errs.consent = "Please confirm before submitting.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goTo = (s: number) => {
    if (!validate(step)) return;
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = () => ({
    // Contact
    name, email, phone, website,
    category,
    // Bird Dog / Wholesaler
    bd_type: bdType, bd_fee: bdFee, bd_leads_per_month: bdLeads,
    bd_find_leads: bdFindLeads, ws_under_contract: wsUnderContract,
    ws_find_deals: wsFindDeals, bd_deal_types: bdDealTypes,
    bd_markets: bdMarkets, bd_communities: bdCommunities, bd_goal: bdGoal,
    // PML
    pml_type: pmlType, pml_capital: pmlCapital, pml_asset_classes: pmlAssets,
    pml_experience: pmlExp, pml_deal_count: pmlDealCount,
    pml_excluded_assets: pmlExcluded, pml_loan_terms: pmlTerms,
    pml_rate: pmlRate, pml_fund_source: pmlFundSource, pml_goal: pmlGoal,
    // Capital Raiser
    cr_network_size: crNetwork, cr_investor_types: crInvestorTypes,
    cr_asset_classes: crAssets, cr_experience: crExp,
    cr_amount_raised: crAmountRaised, cr_structures: crStructures,
    cr_compensation: crCompensation, cr_goal: crGoal,
    // Capital Partner
    cp_accredited: cpAccredited, cp_capital: cpCapital,
    cp_asset_classes: cpAssets, cp_involvement: cpInvolve,
    cp_expected_return: cpReturn, cp_hold_period: cpHoldPeriod,
    cp_prior_experience: cpExp, cp_prior_assets: cpPriorAssets,
    cp_fund_source: cpFundSource, cp_goal: cpGoal,
    // Hard Money
    hm_company: hmCompany, hm_asset_classes: hmAssets,
    hm_national: hmNational, hm_excluded_states: hmExcludedStates,
    hm_rural: hmRural, hm_ltv: hmLtv, hm_rates: hmRates,
    hm_min_loan: hmMin, hm_loan_terms: hmTerms,
    hm_close_timeline: hmTimeline, hm_distressed: hmDistressed,
    hm_personal_guarantee: hmPg, hm_referral_program: hmReferral, hm_goal: hmGoal,
    // DSCR
    dscr_company: dscrCompany, dscr_asset_classes: dscrAssets,
    dscr_national: dscrNational, dscr_excluded_states: dscrExcludedStates,
    dscr_rural: dscrRural, dscr_ratio: dscrRatio, dscr_ltv: dscrLtv,
    dscr_rates: dscrRates, dscr_min_loan: dscrMin, dscr_loan_terms: dscrTerms,
    dscr_personal_guarantee: dscrPg, dscr_referral_program: dscrReferral, dscr_goal: dscrGoal,
    // Commercial Lender
    cl_company: clCompany, cl_asset_classes: clAssets,
    cl_national: clNational, cl_excluded_states: clExcludedStates,
    cl_rural: clRural, cl_ltv: clLtv, cl_rates: clRates,
    cl_min_loan: clMin, cl_loan_terms: clTerms, cl_agency_portfolio: clAgency,
    cl_prepayment_penalty: clPrepay, cl_personal_guarantee: clPg,
    cl_referral_program: clReferral, cl_goal: clGoal,
    // Mortgage Broker
    mb_company: mbCompany, mb_products: mbProducts, mb_asset_classes: mbAssets,
    mb_national: mbNational, mb_excluded_states: mbExcludedStates,
    mb_min_loan: mbMin, mb_referral_program: mbReferral, mb_goal: mbGoal,
    // Commercial Broker
    cb_company: cbCompany, cb_asset_classes: cbAssets,
    cb_national: cbNational, cb_excluded_states: cbExcludedStates,
    cb_offmarket: cbOffmarket, cb_method: cbMethod, cb_deal_size: cbDealSize,
    cb_deals_per_year: cbDealsPerYear, cb_cobroker: cbCobroker,
    cb_represent: cbRepresent, cb_referral: cbReferral, cb_goal: cbGoal,
    // Industry Partner
    ip_roles: ipRoles, ip_other_role: ipOtherText,
    ip_other_more: ipOtherMore, ip_standard_more: ipStandardMore, ip_goal: ipGoal,
    // Final
    additional_notes: finalNotes, hear_about: hearAbout, consent: consent,
  });

  const handleSubmit = async () => {
    if (!validate(4)) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/submit-collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setSubmitError("Something went wrong. Please try again or contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const progressPct = ((step + 1) / 5) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A1628]">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center mb-6">
            <span className="text-green-400 text-3xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">You're In.</h2>
          <p className="text-white/70 text-lg max-w-md">Thanks for reaching out. I'll review your submission and be in touch if there's a fit. Let's find a win together.</p>
          <Link href="/">
            <button className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Logo Card */}
        <div className="bg-[#0D1F3C] rounded-2xl p-6 mb-8 flex flex-col items-center border border-white/10">
          <img src="/logo-jm.png" alt="Josh Moore" className="h-24 w-auto mb-2" />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-400 text-sm font-medium">Step {step + 1} of 5</span>
            <span className="text-white/50 text-sm">{STEP_NAMES[step]}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEP_NAMES.map((name, i) => (
              <div key={i} className={`text-xs ${i <= step ? "text-blue-400" : "text-white/30"}`}>
                {i < step ? "✓" : i === step ? "●" : "○"}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 0 — Contact Info */}
        {step === 0 && (
          <div className="bg-[#0D1F3C] rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-1">Let's Connect</h2>
            <p className="text-white/50 text-sm mb-6">Tell me a little about yourself before we dive in.</p>
            <FormField label="Full Name" required error={errors.name}>
              <TextInput value={name} onChange={setName} placeholder="John Smith" />
            </FormField>
            <FormField label="Email Address" required error={errors.email}>
              <TextInput value={email} onChange={setEmail} placeholder="john@example.com" type="email" />
            </FormField>
            <FormField label="Phone Number" required error={errors.phone}>
              <TextInput value={phone} onChange={setPhone} placeholder="(616) 555-0000" type="tel" />
            </FormField>
            <FormField label="Company / Website">
              <TextInput value={website} onChange={setWebsite} placeholder="yourcompany.com" />
            </FormField>
            <div className="flex justify-end mt-6">
              <button onClick={() => goTo(1)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 1 — Category Selection */}
        {step === 1 && (
          <div className="bg-[#0D1F3C] rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-1">How Would You Like to Collaborate?</h2>
            <p className="text-white/50 text-sm mb-6">Pick the option that best describes you.</p>
            {errors.category && <p className="text-red-400 text-sm mb-4">{errors.category}</p>}
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    category === cat.id
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-white/5 border-white/15 text-white/70 hover:border-blue-400 hover:text-white"
                  }`}
                >
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => goTo(0)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
                ← Back
              </button>
              <button onClick={() => goTo(2)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Intro Message */}
        {step === 2 && category && (
          <div className="bg-[#0D1F3C] rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {CATEGORIES.find(c => c.id === category)?.label}
            </h2>
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-5 mb-6">
              <p className="text-white/80 leading-relaxed">{INTRO_MESSAGES[category]}</p>
            </div>
            <div className="flex justify-between">
              <button onClick={() => goTo(1)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
                ← Back
              </button>
              <button onClick={() => goTo(3)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Get Started →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Category Details */}
        {step === 3 && (
          <div className="bg-[#0D1F3C] rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">About You</h2>

            {/* Bird Dog / Wholesaler */}
            {(category === "bird-dog" || category === "wholesaler") && (
              <>
                <FormField label="Are You a Bird Dog or Wholesaler?" required error={errors.bdType}>
                  <RadioGroup name="bdType" value={bdType} onChange={setBdType} options={[
                    { value: "bird-dog", label: "Bird Dog" },
                    { value: "wholesaler", label: "Wholesaler" },
                  ]} />
                </FormField>
                {bdType === "bird-dog" && (
                  <>
                    <FormField label="Desired Average Bird Dog Fee">
                      <TextInput value={bdFee} onChange={setBdFee} placeholder="I don't know" />
                    </FormField>
                    <FormField label="Leads Per Month">
                      <TextInput value={bdLeads} onChange={setBdLeads} placeholder="I don't know" />
                    </FormField>
                    <FormField label="How Do You Find Your Leads?">
                      <PillGroup options={["Driving for dollars","Cold calling","Direct mail","Door knocking","MLS","Other"]} selected={bdFindLeads} onChange={setBdFindLeads} />
                    </FormField>
                  </>
                )}
                {bdType === "wholesaler" && (
                  <>
                    <FormField label="Do You Currently Have Deals Under Contract?">
                      <RadioGroup name="wsContract" value={wsUnderContract} onChange={setWsUnderContract} options={[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                        { value: "sometimes", label: "Sometimes" },
                      ]} />
                    </FormField>
                    <FormField label="How Do You Find Your Deals?">
                      <PillGroup options={["Driving for dollars","Cold calling","Direct mail","Door knocking","MLS","Other"]} selected={wsFindDeals} onChange={setWsFindDeals} />
                    </FormField>
                  </>
                )}
                <FormField label="Deal Types You Find">
                  <PillGroup options={ASSET_CLASSES} selected={bdDealTypes} onChange={setBdDealTypes} />
                </FormField>
                <FormField label="Markets You Work In">
                  <StateMultiSelect selected={bdMarkets} onChange={setBdMarkets} />
                </FormField>
                <FormField label="Part of Any Real Estate Communities?">
                  <TextInput value={bdCommunities} onChange={setBdCommunities} placeholder="SubTo, Pace Morby, BiggerPockets..." />
                </FormField>
                <FormField label="What Are You Looking for Out of This Relationship?">
                  <TextArea value={bdGoal} onChange={setBdGoal} placeholder="Tell me what a win looks like for you..." />
                </FormField>
              </>
            )}

            {/* Private Money Lender */}
            {category === "pml" && (
              <>
                <FormField label="Are You Lending Directly or Connecting Others to Capital?" required error={errors.pmlType}>
                  <RadioGroup name="pmlType" value={pmlType} onChange={setPmlType} options={[
                    { value: "direct", label: "Lending Directly" },
                    { value: "connecting", label: "Connecting Others" },
                  ]} />
                </FormField>
                {pmlType === "connecting" && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                    <p className="text-yellow-200 text-sm">If you're raising capital on behalf of others, you'd be a better fit as a Capital Raiser.</p>
                    <button type="button" onClick={() => { setCategory("capital-raiser"); setPmlType(""); }} className="mt-2 text-blue-400 text-sm underline">
                      Switch to Capital Raiser →
                    </button>
                  </div>
                )}
                {pmlType === "direct" && (
                  <>
                    <FormField label="Capital Available to Deploy" required error={errors.pmlCapital}>
                      <SelectInput value={pmlCapital} onChange={setPmlCapital} placeholder="Select range" options={["Under $50,000","$50,000 – $100,000","$100,000 – $250,000","$250,000 – $500,000","$500,000 – $1,000,000","$1,000,000+"]} />
                    </FormField>
                    <FormField label="Asset Classes You'll Lend On" required error={errors.pmlAssets}>
                      <PillGroup options={ASSET_CLASSES.filter(a => a !== "Other")} selected={pmlAssets} onChange={setPmlAssets} />
                    </FormField>
                    <FormField label="Have You Lent Privately Before?" required error={errors.pmlExp}>
                      <RadioGroup name="pmlExp" value={pmlExp} onChange={setPmlExp} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                    </FormField>
                    {pmlExp === "yes" && (
                      <>
                        <FormField label="How Many Deals Have You Lent On?">
                          <TextInput value={pmlDealCount} onChange={setPmlDealCount} placeholder="5 / I don't know" />
                        </FormField>
                        <FormField label="Any Asset Classes You Won't Lend On?">
                          <TextInput value={pmlExcluded} onChange={setPmlExcluded} placeholder="Land, raw commercial, etc." />
                        </FormField>
                        <FormField label="Loan Terms You're Comfortable With" required error={errors.pmlTerms}>
                          <PillGroup options={LOAN_TERMS} selected={pmlTerms} onChange={setPmlTerms} />
                        </FormField>
                        <FormField label="Expected Interest Rate">
                          <TextInput value={pmlRate} onChange={setPmlRate} placeholder="8% / I don't know yet" />
                        </FormField>
                      </>
                    )}
                    {pmlExp === "no" && (
                      <>
                        <FormField label="Any Asset Classes You Won't Lend On?">
                          <TextInput value={pmlExcluded} onChange={setPmlExcluded} placeholder="Land, raw commercial, etc." />
                        </FormField>
                        <FormField label="Expected Interest Rate">
                          <TextInput value={pmlRate} onChange={setPmlRate} placeholder="8% / I don't know yet" />
                        </FormField>
                        <FormField label="Loan Terms You're Comfortable With" required error={errors.pmlTerms}>
                          <PillGroup options={LOAN_TERMS} selected={pmlTerms} onChange={setPmlTerms} />
                        </FormField>
                      </>
                    )}
                    <FormField label="Fund Source">
                      <PillGroup options={FUND_SOURCES} selected={pmlFundSource} onChange={setPmlFundSource} />
                    </FormField>
                    <FormField label="What Are You Looking for Out of This Relationship?">
                      <TextArea value={pmlGoal} onChange={setPmlGoal} placeholder="Tell me what a win looks like for you..." />
                    </FormField>
                  </>
                )}
              </>
            )}

            {/* Capital Raiser */}
            {category === "capital-raiser" && (
              <>
                <FormField label="How Many Investors Are in Your Network?" required error={errors.crNetwork}>
                  <SelectInput value={crNetwork} onChange={setCrNetwork} placeholder="Select range" options={["1 – 10","10 – 50","50 – 100","100 – 500","500+"]} />
                </FormField>
                <FormField label="What Type of Investors Are in Your Network?" required error={errors.crInvestorTypes}>
                  <PillGroup options={["High net worth individuals","Family offices","SDIRA holders","Accredited investors","General public","Other"]} selected={crInvestorTypes} onChange={setCrInvestorTypes} />
                </FormField>
                <FormField label="Asset Classes You've Raised For" required error={errors.crAssets}>
                  <PillGroup options={ASSET_CLASSES.filter(a => a !== "Other")} selected={crAssets} onChange={setCrAssets} />
                </FormField>
                <FormField label="Have You Raised Capital for Someone Else's Deals Before?" required error={errors.crExp}>
                  <RadioGroup name="crExp" value={crExp} onChange={setCrExp} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </FormField>
                {crExp === "yes" && (
                  <>
                    <FormField label="How Much Have You Raised Total?">
                      <SelectInput value={crAmountRaised} onChange={setCrAmountRaised} placeholder="Select range" options={["Under $500,000","$500,000 – $1,000,000","$1,000,000 – $5,000,000","$5,000,000+"]} />
                    </FormField>
                    <FormField label="Structures You've Worked With">
                      <PillGroup options={["Syndication","Fund","JV","Reg D","Other"]} selected={crStructures} onChange={setCrStructures} />
                    </FormField>
                  </>
                )}
                <FormField label="Compensation Structure You're Looking For">
                  <TextInput value={crCompensation} onChange={setCrCompensation} placeholder="% of raise / finder's fee / equity / other" />
                </FormField>
                <FormField label="What Are You Looking for Out of This Relationship?">
                  <TextArea value={crGoal} onChange={setCrGoal} placeholder="Tell me what a win looks like for you..." />
                </FormField>
              </>
            )}

            {/* Capital Partner */}
            {category === "capital-partner" && (
              <>
                <FormField label="Are You an Accredited Investor?" required error={errors.cpAccredited}>
                  <RadioGroup name="cpAccredited" value={cpAccredited} onChange={setCpAccredited} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unsure", label: "Not Sure" }]} />
                </FormField>
                <FormField label="Capital You're Looking to Deploy" required error={errors.cpCapital}>
                  <SelectInput value={cpCapital} onChange={setCpCapital} placeholder="Select range" options={["Under $50,000","$50,000 – $100,000","$100,000 – $250,000","$250,000 – $500,000","$500,000 – $1,000,000","$1,000,000+"]} />
                </FormField>
                <FormField label="Asset Classes of Interest" required error={errors.cpAssets}>
                  <PillGroup options={ASSET_CLASSES.filter(a => a !== "Other")} selected={cpAssets} onChange={setCpAssets} />
                </FormField>
                <FormField label="Type of Involvement" required error={errors.cpInvolve}>
                  <RadioGroup name="cpInvolve" value={cpInvolve} onChange={setCpInvolve} options={[
                    { value: "passive", label: "Passive LP" },
                    { value: "jv", label: "JV Partner" },
                    { value: "either", label: "Either" },
                    { value: "unsure", label: "Not Sure" },
                  ]} />
                </FormField>
                <FormField label="Expected Annual Return">
                  <TextInput value={cpReturn} onChange={setCpReturn} placeholder="8–12% / I don't know yet" />
                </FormField>
                <FormField label="Preferred Hold Period">
                  <PillGroup options={["6 months – 1 year","1 – 2 years","3 – 5 years","5+ years","Flexible"]} selected={cpHoldPeriod} onChange={setCpHoldPeriod} />
                </FormField>
                <FormField label="Invested Passively in Real Estate Before?">
                  <RadioGroup name="cpExp" value={cpExp} onChange={setCpExp} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </FormField>
                {cpExp === "yes" && (
                  <FormField label="Asset Classes Invested in Before">
                    <PillGroup options={ASSET_CLASSES.filter(a => a !== "Other")} selected={cpPriorAssets} onChange={setCpPriorAssets} />
                  </FormField>
                )}
                <FormField label="Fund Source">
                  <PillGroup options={FUND_SOURCES} selected={cpFundSource} onChange={setCpFundSource} />
                </FormField>
                <FormField label="What Are You Looking for Out of This Relationship?">
                  <TextArea value={cpGoal} onChange={setCpGoal} placeholder="Tell me what a win looks like for you..." />
                </FormField>
              </>
            )}

            {/* Hard Money Lender */}
            {category === "hard-money" && (
              <>
                <FormField label="Company Name" required error={errors.hmCompany}>
                  <TextInput value={hmCompany} onChange={setHmCompany} placeholder="ABC Capital" />
                </FormField>
                <FormField label="Asset Classes You Lend On" required error={errors.hmAssets}>
                  <PillGroup options={ASSET_CLASSES.filter(a => a !== "Other")} selected={hmAssets} onChange={setHmAssets} />
                </FormField>
                <FormField label="Do You Lend Nationally?" required error={errors.hmNational}>
                  <RadioGroup name="hmNational" value={hmNational} onChange={setHmNational} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </FormField>
                {hmNational === "no" && (
                  <FormField label="States You Don't Lend In">
                    <StateMultiSelect selected={hmExcludedStates} onChange={setHmExcludedStates} />
                  </FormField>
                )}
                <FormField label="Do You Lend in Rural Areas?" required error={errors.hmRural}>
                  <RadioGroup name="hmRural" value={hmRural} onChange={setHmRural} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "case", label: "Case by Case" }]} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Typical LTV" required error={errors.hmLtv}>
                    <TextInput value={hmLtv} onChange={setHmLtv} placeholder="65% / up to 75%" />
                  </FormField>
                  <FormField label="Typical Rates" required error={errors.hmRates}>
                    <TextInput value={hmRates} onChange={setHmRates} placeholder="10–13%" />
                  </FormField>
                </div>
                <FormField label="Minimum Loan Amount" required error={errors.hmMin}>
                  <SelectInput value={hmMin} onChange={setHmMin} placeholder="Select" options={["Under $100,000","$100,000 – $250,000","$250,000 – $500,000","$500,000 – $1,000,000","$1,000,000+"]} />
                </FormField>
                <FormField label="Typical Loan Terms" required error={errors.hmTerms}>
                  <PillGroup options={LOAN_TERMS} selected={hmTerms} onChange={setHmTerms} />
                </FormField>
                <FormField label="Typical Close Timeline">
                  <TextInput value={hmTimeline} onChange={setHmTimeline} placeholder="7–14 days / I don't know" />
                </FormField>
                <FormField label="Lend on Distressed / Value-Add Assets?">
                  <RadioGroup name="hmDistressed" value={hmDistressed} onChange={setHmDistressed} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "case", label: "Case by Case" }]} />
                </FormField>
                <FormField label="Personal Guarantee Required?">
                  <RadioGroup name="hmPg" value={hmPg} onChange={setHmPg} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "case", label: "Case by Case" }]} />
                </FormField>
                <FormField label="Broker / Referral Program?">
                  <RadioGroup name="hmReferral" value={hmReferral} onChange={setHmReferral} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </FormField>
                <FormField label="What Are You Looking for Out of This Relationship?">
                  <TextArea value={hmGoal} onChange={setHmGoal} placeholder="Tell me what a win looks like for you..." />
                </FormField>
              </>
            )}

            {/* DSCR Lender */}
            {category === "dscr" && (
              <>
                <FormField label="Company Name" required error={errors.dscrCompany}>
                  <TextInput value={dscrCompany} onChange={setDscrCompany} placeholder="ABC Capital" />
                </FormField>
                <FormField label="Asset Classes You Lend On" required error={errors.dscrAssets}>
                  <PillGroup options={ASSET_CLASSES.filter(a => a !== "Other")} selected={dscrAssets} onChange={setDscrAssets} />
                </FormField>
                <FormField label="Do You Lend Nationally?" required error={errors.dscrNational}>
                  <RadioGroup name="dscrNational" value={dscrNational} onChange={setDscrNational} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </FormField>
                {dscrNational === "no" && (
                  <FormField label="States You Don't Lend In">
                    <StateMultiSelect selected={dscrExcludedStates} onChange={setDscrExcludedStates} />
                  </FormField>
                )}
                <FormField label="Do You Lend in Rural Areas?" required error={errors.dscrRural}>
                  <RadioGroup name="dscrRural" value={dscrRural} onChange={setDscrRural} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "case", label: "Case by Case" }]} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Minimum DSCR Ratio" required error={errors.dscrRatio}>
                    <TextInput value={dscrRatio} onChange={setDscrRatio} placeholder="1.1 / 1.25" />
                  </FormField>
                  <FormField label="Typical LTV" required error={errors.dscrLtv}>
                    <TextInput value={dscrLtv} onChange={setDscrLtv} placeholder="75% / up to 80%" />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Typical Rates" required error={errors.dscrRates}>
                    <TextInput value={dscrRates} onChange={setDscrRates} placeholder="7–9%" />
                  </FormField>
                  <FormField label="Minimum Loan Amount" required error={errors.dscrMin}>
                    <SelectInput value={dscrMin} onChange={setDscrMin} placeholder="Select" options={["Under $100,000","$100,000 – $250,000","$250,000 – $500,000","$500,000 – $1,000,000","$1,000,000+"]} />
                  </FormField>
                </div>
                <FormField label="Typical Loan Terms" required error={errors.dscrTerms}>
                  <PillGroup options={LOAN_TERMS} selected={dscrTerms} onChange={setDscrTerms} />
                </FormField>
                <FormField label="Personal Guarantee Required?">
                  <RadioGroup name="dscrPg" value={dscrPg} onChange={setDscrPg} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "case", label: "Case by Case" }]} />
                </FormField>
                <FormField label="Broker / Referral Program?">
                  <RadioGroup name="dscrReferral" value={dscrReferral} onChange={setDscrReferral} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </FormField>
                <FormField label="What Are You Looking for Out of This Relationship?">
                  <TextArea value={dscrGoal} onChange={setDscrGoal} placeholder="Tell me what a win looks like for you..." />
                </FormField>
              </>
            )}

            {/* Commercial Lender */}
            {category === "commercial-lender" && (
              <>
                <FormField label="Company Name" required error={errors.clCompany}>
                  <TextInput value={clCompany} onChange={setClCompany} placeholder="ABC Capital" />
                </FormField>
                <FormField label="Asset Classes You Lend On" required error={errors.clAssets}>
                  <PillGroup options={ASSET_CLASSES.filter(a => a !== "Other")} selected={clAssets} onChange={setClAssets} />
                </FormField>
                <FormField label="Do You Lend Nationally?" required error={errors.clNational}>
                  <RadioGroup name="clNational" value={clNational} onChange={setClNational} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </FormField>
                {clNational === "no" && (
                  <FormField label="States You Don't Lend In">
                    <StateMultiSelect selected={clExcludedStates} onChange={setClExcludedStates} />
                  </FormField>
                )}
                <FormField label="Do You Lend in Rural Areas?" required error={errors.clRural}>
                  <RadioGroup name="clRural" value={clRural} onChange={setClRural} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "case", label: "Case by Case" }]} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Typical LTV" required error={errors.clLtv}>
                    <TextInput value={clLtv} onChange={setClLtv} placeholder="70% / up to 80%" />
                  </FormField>
                  <FormField label="Typical Rates" required error={errors.clRates}>
                    <TextInput value={clRates} onChange={setClRates} placeholder="6–9%" />
                  </FormField>
                </div>
                <FormField label="Minimum Loan Amount" required error={errors.clMin}>
                  <SelectInput value={clMin} onChange={setClMin} placeholder="Select" options={["Under $100,000","$100,000 – $250,000","$250,000 – $500,000","$500,000 – $1,000,000","$1,000,000+"]} />
                </FormField>
                <FormField label="Typical Loan Terms" required error={errors.clTerms}>
                  <PillGroup options={LOAN_TERMS} selected={clTerms} onChange={setClTerms} />
                </FormField>
                <FormField label="Agency vs Portfolio Loans?">
                  <RadioGroup name="clAgency" value={clAgency} onChange={setClAgency} options={[{ value: "agency", label: "Agency" }, { value: "portfolio", label: "Portfolio" }, { value: "both", label: "Both" }]} />
                </FormField>
                <FormField label="Prepayment Penalty?">
                  <RadioGroup name="clPrepay" value={clPrepay} onChange={setClPrepay} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "case", label: "Case by Case" }]} />
                </FormField>
                <FormField label="Personal Guarantee Required?">
                  <RadioGroup name="clPg" value={clPg} onChange={setClPg} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "case", label: "Case by Case" }]} />
                </FormField>
                <FormField label="Broker / Referral Program?">
                  <RadioGroup name="clReferral" value={clReferral} onChange={setClReferral} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </FormField>
                <FormField label="What Are You Looking for Out of This Relationship?">
                  <TextArea value={clGoal} onChange={setClGoal} placeholder="Tell me what a win looks like for you..." />
                </FormField>
              </>
            )}

            {/* Mortgage Broker */}
            {category === "mortgage-broker" && (
              <>
                <FormField label="Company Name" required error={errors.mbCompany}>
                  <TextInput value={mbCompany} onChange={setMbCompany} placeholder="ABC Lending" />
                </FormField>
                <FormField label="Products You Offer" required error={errors.mbProducts}>
                  <PillGroup options={["Conventional","FHA","DSCR","Hard Money","Commercial","Other"]} selected={mbProducts} onChange={setMbProducts} />
                </FormField>
                <FormField label="Asset Classes You Work With" required error={errors.mbAssets}>
                  <PillGroup options={ASSET_CLASSES.filter(a => a !== "Other")} selected={mbAssets} onChange={setMbAssets} />
                </FormField>
                <FormField label="Do You Work Nationally?" required error={errors.mbNational}>
                  <RadioGroup name="mbNational" value={mbNational} onChange={setMbNational} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </FormField>
                {mbNational === "no" && (
                  <FormField label="States You Don't Work In">
                    <StateMultiSelect selected={mbExcludedStates} onChange={setMbExcludedStates} />
                  </FormField>
                )}
                <FormField label="Minimum Loan Amount" required error={errors.mbMin}>
                  <SelectInput value={mbMin} onChange={setMbMin} placeholder="Select" options={["Under $100,000","$100,000 – $250,000","$250,000 – $500,000","$500,000 – $1,000,000","$1,000,000+"]} />
                </FormField>
                <FormField label="Broker / Referral Program?">
                  <RadioGroup name="mbReferral" value={mbReferral} onChange={setMbReferral} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </FormField>
                <FormField label="What Are You Looking for Out of This Relationship?">
                  <TextArea value={mbGoal} onChange={setMbGoal} placeholder="Tell me what a win looks like for you..." />
                </FormField>
              </>
            )}

            {/* Commercial Broker */}
            {category === "commercial-broker" && (
              <>
                <FormField label="Company Name" required error={errors.cbCompany}>
                  <TextInput value={cbCompany} onChange={setCbCompany} placeholder="ABC Realty" />
                </FormField>
                <FormField label="Asset Classes You Specialize In" required error={errors.cbAssets}>
                  <PillGroup options={ASSET_CLASSES.filter(a => a !== "Other")} selected={cbAssets} onChange={setCbAssets} />
                </FormField>
                <FormField label="Do You Work Nationally?" required error={errors.cbNational}>
                  <RadioGroup name="cbNational" value={cbNational} onChange={setCbNational} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </FormField>
                {cbNational === "no" && (
                  <FormField label="States You Don't Work In">
                    <StateMultiSelect selected={cbExcludedStates} onChange={setCbExcludedStates} />
                  </FormField>
                )}
                <FormField label="Do You Have Access to Off-Market Deals?" required error={errors.cbOffmarket}>
                  <RadioGroup name="cbOffmarket" value={cbOffmarket} onChange={setCbOffmarket} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "sometimes", label: "Sometimes" }]} />
                </FormField>
                <FormField label="How Do You Typically Bring Deals to Buyers?" required error={errors.cbMethod}>
                  <RadioGroup name="cbMethod" value={cbMethod} onChange={setCbMethod} options={[{ value: "direct", label: "Direct to Buyer" }, { value: "network", label: "Broker Network" }, { value: "both", label: "Both" }]} />
                </FormField>
                <FormField label="Average Deal Size" required error={errors.cbDealSize}>
                  <SelectInput value={cbDealSize} onChange={setCbDealSize} placeholder="Select range" options={["Under $500,000","$500,000 – $1,000,000","$1,000,000 – $5,000,000","$5,000,000 – $10,000,000","$10,000,000+"]} />
                </FormField>
                <FormField label="Deals Closed Per Year">
                  <TextInput value={cbDealsPerYear} onChange={setCbDealsPerYear} placeholder="10 / I don't know" />
                </FormField>
                <FormField label="Do You Work With Co-Brokers?">
                  <RadioGroup name="cbCobroker" value={cbCobroker} onChange={setCbCobroker} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "case", label: "Case by Case" }]} />
                </FormField>
                <FormField label="You Represent?">
                  <RadioGroup name="cbRepresent" value={cbRepresent} onChange={setCbRepresent} options={[{ value: "buyers", label: "Buyers" }, { value: "sellers", label: "Sellers" }, { value: "both", label: "Both" }]} />
                </FormField>
                <FormField label="Open to Referral Fee Arrangements Outside Traditional Commission?">
                  <RadioGroup name="cbReferral" value={cbReferral} onChange={setCbReferral} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "talk", label: "Let's Talk" }]} />
                </FormField>
                <FormField label="What Are You Looking for Out of This Relationship?">
                  <TextArea value={cbGoal} onChange={setCbGoal} placeholder="Tell me what a win looks like for you..." />
                </FormField>
              </>
            )}

            {/* Industry Partner */}
            {category === "industry-partner" && (
              <>
                <FormField label="What Best Describes Your Role?" required error={errors.ipRoles}>
                  <div className="flex flex-col gap-2 mt-2">
                    {["Property Manager","Contractor / Rehab Crew","Disposition Partner","Title Company","Real Estate Attorney","Virtual Assistant","Acquisitions Support","Other"].map(role => (
                      <label key={role} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ipRoles.includes(role)}
                          onChange={e => {
                            if (e.target.checked) setIpRoles([...ipRoles, role]);
                            else setIpRoles(ipRoles.filter(r => r !== role));
                          }}
                          className="w-4 h-4 accent-blue-500"
                        />
                        <span className="text-white/80 text-sm">{role}</span>
                      </label>
                    ))}
                  </div>
                </FormField>
                {ipRoles.includes("Other") && (
                  <>
                    <FormField label="Tell Me What You Do">
                      <TextInput value={ipOtherText} onChange={setIpOtherText} placeholder="Describe your role..." />
                    </FormField>
                    {ipOtherText.length > 0 && (
                      <FormField label="Tell Me More About How We Can Work Together">
                        <TextArea value={ipOtherMore} onChange={setIpOtherMore} placeholder="The more detail the better..." />
                      </FormField>
                    )}
                  </>
                )}
                {ipRoles.some(r => r !== "Other") && (
                  <FormField label="Tell Me More About How We Can Work Together">
                    <TextArea value={ipStandardMore} onChange={setIpStandardMore} placeholder="The more detail the better..." />
                  </FormField>
                )}
                <FormField label="What Are You Looking for Out of This Relationship?">
                  <TextArea value={ipGoal} onChange={setIpGoal} placeholder="Tell me what a win looks like for you..." />
                </FormField>
              </>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => goTo(2)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
                ← Back
              </button>
              <button onClick={() => goTo(4)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Final */}
        {step === 4 && (
          <div className="bg-[#0D1F3C] rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-1">Almost Done.</h2>
            <p className="text-white/50 text-sm mb-6">Just a couple more things before we wrap up.</p>
            <FormField label="Anything Else You Want Me to Know?">
              <TextArea value={finalNotes} onChange={setFinalNotes} placeholder="Timeline, context, or anything else..." />
            </FormField>
            <FormField label="How Did You Hear About Josh?">
              <SelectInput value={hearAbout} onChange={setHearAbout} placeholder="Select" options={["Instagram","Facebook","Referral","Google search","Meetup / event","SubTo / Pace Morby community","Other"]} />
            </FormField>
            <div className="mb-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="w-4 h-4 mt-1 accent-blue-500 flex-shrink-0"
                />
                <span className="text-white/65 text-sm">I confirm this information is accurate to the best of my knowledge.</span>
              </label>
              {errors.consent && <p className="text-red-400 text-xs mt-1">{errors.consent}</p>}
            </div>
            {submitError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}
            <div className="flex justify-between mt-6">
              <button onClick={() => goTo(3)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {submitting ? "Submitting..." : "Submit →"}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
