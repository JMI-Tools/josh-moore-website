import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Asset = "sfh" | "mf" | "mhp" | "rv" | "";
type Step = 0 | 1 | 2 | 3;

const STEP_NAMES = ["About You", "Property Type", "Deal Details", "Final Step"];

// ── Reusable UI primitives ────────────────────────────────────────────────────

function FieldError({ msg, show }: { msg: string; show: boolean }) {
  if (!show) return null;
  return <p className="text-red-400 text-sm mt-1">{msg}</p>;
}

function Label({ children, required, optional }: { children: React.ReactNode; required?: boolean; optional?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-200 mb-1">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
      {optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
    </label>
  );
}

function Input({ id, type = "text", placeholder, value, onChange, hasError }: {
  id?: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; hasError?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-[#0f2035] border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${hasError ? "border-red-400" : "border-gray-600"}`}
    />
  );
}

function Select({ id, value, onChange, options, hasError }: {
  id?: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; hasError?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-[#0f2035] border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${hasError ? "border-red-400" : "border-gray-600"}`}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Textarea({ placeholder, value, onChange }: { placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={3}
      className="w-full bg-[#0f2035] border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
    />
  );
}

function RadioGroup({ name, options, value, onChange }: {
  name: string; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <label key={o.value} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition text-sm font-medium ${value === o.value ? "border-blue-500 bg-blue-500/20 text-blue-300" : "border-gray-600 bg-[#0f2035] text-gray-300 hover:border-gray-400"}`}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({ options, selected, onChange }: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) => selected.includes(v) ? onChange(selected.filter(x => x !== v)) : onChange([...selected, v]);
  return (
    <div className="flex flex-col gap-2">
      {options.map(o => (
        <label key={o} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition text-sm ${selected.includes(o) ? "border-blue-500 bg-blue-500/10 text-blue-200" : "border-gray-600 bg-[#0f2035] text-gray-300 hover:border-gray-400"}`}>
          <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} className="accent-blue-500 w-4 h-4 flex-shrink-0" />
          {o}
        </label>
      ))}
    </div>
  );
}

function PillGroup({ options, selected, onChange }: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) => selected.includes(v) ? onChange(selected.filter(x => x !== v)) : onChange([...selected, v]);
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(o => (
        <button key={o} type="button" onClick={() => toggle(o)} className={`px-3 py-1.5 rounded-full border text-sm font-medium transition ${selected.includes(o) ? "border-blue-500 bg-blue-500/20 text-blue-300" : "border-gray-600 bg-[#0f2035] text-gray-400 hover:border-gray-400"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function ConditionalBlock({ show, title, children }: { show: boolean; title?: string; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="mt-4 p-4 bg-[#0a1828] border border-blue-900/40 rounded-xl">
      {title && <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">{title}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SectionDivider() {
  return <hr className="border-gray-700/50 my-2" />;
}

function NavButtons({ onBack, onNext, backLabel = "← Back", nextLabel = "Next →", isSubmit = false, disabled = false }: {
  onBack?: () => void; onNext: () => void; backLabel?: string; nextLabel?: string; isSubmit?: boolean; disabled?: boolean;
}) {
  return (
    <div className={`flex mt-8 ${onBack ? "justify-between" : "justify-end"}`}>
      {onBack && (
        <button type="button" onClick={onBack} className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition font-medium text-sm">
          {backLabel}
        </button>
      )}
      <button type="button" onClick={onNext} disabled={disabled} className={`px-8 py-2.5 rounded-lg font-semibold text-sm transition ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${isSubmit ? "bg-green-600 hover:bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}`}>
        {nextLabel}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SubmitDeal() {
  const [step, setStep] = useState<Step>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Step 1 — Submitter info
  const [isOwner, setIsOwner] = useState<string>("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPref, setContactPref] = useState("");

  // Step 2 — Asset class
  const [asset, setAsset] = useState<Asset>("");

  // Step 3 — SFH
  const [sfhAddr, setSfhAddr] = useState("");
  const [sfhPrice, setSfhPrice] = useState("");
  const [sfhArv, setSfhArv] = useState("");
  const [sfhBeds, setSfhBeds] = useState("");
  const [sfhBaths, setSfhBaths] = useState("");
  const [sfhSqft, setSfhSqft] = useState("");
  const [sfhYear, setSfhYear] = useState("");
  const [sfhCond, setSfhCond] = useState("");
  const [sfhRepairCost, setSfhRepairCost] = useState("");
  const [sfhRepairDesc, setSfhRepairDesc] = useState("");
  const [sfhOcc, setSfhOcc] = useState("");
  const [sfhRent, setSfhRent] = useState("");
  const [sfhLease, setSfhLease] = useState("");
  const [sfhLeaseExp, setSfhLeaseExp] = useState("");
  const [sfhMort, setSfhMort] = useState("");
  const [sfhMortBal, setSfhMortBal] = useState("");
  const [sfhMortRate, setSfhMortRate] = useState("");
  const [sfhMortPmt, setSfhMortPmt] = useState("");
  const [sfhCf, setSfhCf] = useState("");
  const [sfhCfOptions, setSfhCfOptions] = useState<string[]>([]);
  const [sfhMotivation, setSfhMotivation] = useState<string[]>([]);

  // Step 3 — MF
  const [mfAddr, setMfAddr] = useState("");
  const [mfPrice, setMfPrice] = useState("");
  const [mfUnits, setMfUnits] = useState("");
  // 2-4 sub-track
  const [mf24Occ, setMf24Occ] = useState("");
  const [mf24Rents, setMf24Rents] = useState("");
  const [mf24Cond, setMf24Cond] = useState("");
  const [mf24Mort, setMf24Mort] = useState("");
  const [mf24MortBal, setMf24MortBal] = useState("");
  const [mf24MortRate, setMf24MortRate] = useState("");
  const [mf24Assume, setMf24Assume] = useState("");
  const [mf24Cf, setMf24Cf] = useState("");
  // 5-19 sub-track
  const [mf5Occ, setMf5Occ] = useState("");
  const [mf5Rents, setMf5Rents] = useState("");
  const [mf5Noi, setMf5Noi] = useState("");
  const [mf5Mort, setMf5Mort] = useState("");
  const [mf5MortBal, setMf5MortBal] = useState("");
  const [mf5MortRate, setMf5MortRate] = useState("");
  const [mf5Assume, setMf5Assume] = useState("");
  const [mf5Year, setMf5Year] = useState("");
  const [mf5Cond, setMf5Cond] = useState("");
  const [mf5T12, setMf5T12] = useState("");
  // 20+ sub-track
  const [mf20Occ, setMf20Occ] = useState("");
  const [mf20Rents, setMf20Rents] = useState("");
  const [mf20Mort, setMf20Mort] = useState("");
  const [mf20MortBal, setMf20MortBal] = useState("");
  const [mf20MortRate, setMf20MortRate] = useState("");
  const [mf20Assume, setMf20Assume] = useState("");
  const [mf20Noi, setMf20Noi] = useState("");
  const [mf20Cap, setMf20Cap] = useState("");
  const [mf20T12, setMf20T12] = useState("");
  const [mf20Sf, setMf20Sf] = useState("");

  // Step 3 — MHP
  const [mhpAddr, setMhpAddr] = useState("");
  const [mhpPrice, setMhpPrice] = useState("");
  const [mhpLots, setMhpLots] = useState("");
  const [mhpOcc, setMhpOcc] = useState("");
  const [mhpWater, setMhpWater] = useState("");
  const [mhpPoh, setMhpPoh] = useState("");
  const [mhpPohUnits, setMhpPohUnits] = useState("");
  const [mhpPohCond, setMhpPohCond] = useState("");
  const [mhpInc, setMhpInc] = useState("");
  const [mhpLotRent, setMhpLotRent] = useState("");
  const [mhpInfra, setMhpInfra] = useState("");
  const [mhpMort, setMhpMort] = useState("");
  const [mhpMortBal, setMhpMortBal] = useState("");
  const [mhpMortRate, setMhpMortRate] = useState("");
  const [mhpAssume, setMhpAssume] = useState("");
  const [mhpViol, setMhpViol] = useState("");
  const [mhpViolDesc, setMhpViolDesc] = useState("");
  const [mhpEnv, setMhpEnv] = useState("");
  const [mhpEnvDesc, setMhpEnvDesc] = useState("");
  const [mhpSf, setMhpSf] = useState("");

  // Step 3 — RV
  const [rvAddr, setRvAddr] = useState("");
  const [rvPrice, setRvPrice] = useState("");
  const [rvSites, setRvSites] = useState("");
  const [rvSeason, setRvSeason] = useState("");
  const [rvSeasonOpen, setRvSeasonOpen] = useState("");
  const [rvSeasonClose, setRvSeasonClose] = useState("");
  const [rvPeakOcc, setRvPeakOcc] = useState("");
  const [rvYrOcc, setRvYrOcc] = useState("");
  const [rvLt, setRvLt] = useState("");
  const [rvLtCount, setRvLtCount] = useState("");
  const [rvSiteTypes, setRvSiteTypes] = useState<string[]>([]);
  const [rvRev, setRvRev] = useState("");
  const [rvMgmt, setRvMgmt] = useState("");
  const [rvBooking, setRvBooking] = useState("");
  const [rvAmenities, setRvAmenities] = useState<string[]>([]);
  const [rvMort, setRvMort] = useState("");
  const [rvMortBal, setRvMortBal] = useState("");
  const [rvMortRate, setRvMortRate] = useState("");
  const [rvAssume, setRvAssume] = useState("");
  const [rvSf, setRvSf] = useState("");

  // Step 4 — Final
  const [notes, setNotes] = useState("");
  const [hearAbout, setHearAbout] = useState("");
  const [referralFee, setReferralFee] = useState("");
  const [dealStatus, setDealStatus] = useState("");
  const [consent, setConsent] = useState(false);

  const isWholesaler = isOwner === "no";
  const mfUnitCount = parseInt(mfUnits) || 0;

  function err(field: string, msg: string) {
    setErrors(prev => ({ ...prev, [field]: msg }));
  }
  function clearErr(field: string) {
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  function validateStep(s: Step): boolean {
    const newErrors: Record<string, string> = {};

    if (s === 0) {
      if (!isOwner) newErrors["isOwner"] = "Please select an option.";
      if (!name.trim()) newErrors["name"] = "Please enter your name.";
      if (!email.trim() || !email.includes("@")) newErrors["email"] = "Please enter a valid email.";
      if (!phone.trim()) newErrors["phone"] = "Please enter your phone number.";
    }

    if (s === 1) {
      if (!asset) newErrors["asset"] = "Please select a property type.";
    }

    if (s === 2) {
      if (asset === "sfh") {
        if (!sfhAddr.trim()) newErrors["sfhAddr"] = "Required.";
        if (!sfhPrice.trim()) newErrors["sfhPrice"] = "Required.";
        if (!sfhBeds) newErrors["sfhBeds"] = "Required.";
        if (!sfhBaths) newErrors["sfhBaths"] = "Required.";
        if (!sfhCond) newErrors["sfhCond"] = "Required.";
        if (isWholesaler && !sfhArv.trim()) newErrors["sfhArv"] = "Required for wholesalers.";
        if (isWholesaler && !sfhMort) newErrors["sfhMort"] = "Required for wholesalers.";
      }
      if (asset === "mf") {
        if (!mfAddr.trim()) newErrors["mfAddr"] = "Required.";
        if (!mfPrice.trim()) newErrors["mfPrice"] = "Required.";
        if (!mfUnits.trim()) newErrors["mfUnits"] = "Required.";
      }
      if (asset === "mhp") {
        if (!mhpAddr.trim()) newErrors["mhpAddr"] = "Required.";
        if (!mhpPrice.trim()) newErrors["mhpPrice"] = "Required.";
        if (!mhpLots.trim()) newErrors["mhpLots"] = "Required.";
        if (!mhpOcc.trim()) newErrors["mhpOcc"] = "Required.";
        if (!mhpWater) newErrors["mhpWater"] = "Required.";
        if (!mhpPoh) newErrors["mhpPoh"] = "Required.";
        if (isWholesaler && !mhpInc.trim()) newErrors["mhpInc"] = "Required for wholesalers.";
      }
      if (asset === "rv") {
        if (!rvAddr.trim()) newErrors["rvAddr"] = "Required.";
        if (!rvPrice.trim()) newErrors["rvPrice"] = "Required.";
        if (!rvSites.trim()) newErrors["rvSites"] = "Required.";
        if (!rvSeason) newErrors["rvSeason"] = "Required.";
        if (isWholesaler && !rvRev.trim()) newErrors["rvRev"] = "Required for wholesalers.";
        if (isWholesaler && !rvMort) newErrors["rvMort"] = "Required for wholesalers.";
      }
    }

    if (s === 3) {
      if (!consent) newErrors["consent"] = "Please confirm before submitting.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function goTo(s: Step) {
    if (!validateStep(step)) return;
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setSubmitError("");

    // Map asset code to API property type
    const propertyTypeMap: Record<string, string> = {
      sfh: "sfr",
      mf: "multifamily",
      mhp: "mhp",
      rv: "rv_park",
    };

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payload: Record<string, unknown> = {
      propertyType: propertyTypeMap[asset] || asset,
      submitterRole: isOwner === "yes" ? "owner" : (role || "wholesaler"),
      isOwner: isOwner === "yes",
      firstName,
      lastName,
      email,
      phone,
      preferredContact: contactPref,
      additionalNotes: notes,
      howHeard: hearAbout,
      consent,
    };

    // Asset-class specific fields
    if (asset === "sfh") {
      Object.assign(payload, {
        propertyAddress: sfhAddr,
        askingPrice: sfhPrice,
        arv: sfhArv,
        bedrooms: sfhBeds,
        bathrooms: sfhBaths,
        squareFootage: sfhSqft,
        yearBuilt: sfhYear,
        condition: sfhCond,
        estimatedRepairs: sfhRepairCost,
        repairDescription: sfhRepairDesc,
        occupancyStatus: sfhOcc,
        currentRent: sfhRent,
        hasLease: sfhLease,
        leaseExpiry: sfhLeaseExp,
        hasMortgage: sfhMort,
        mortgageBalance: sfhMortBal,
        mortgageRate: sfhMortRate,
        mortgagePayment: sfhMortPmt,
        creativeFinancing: sfhCf,
        creativeFinancingOptions: sfhCfOptions,
        motivation: sfhMotivation,
        assignmentFee: referralFee,
        dealStatus,
      });
    } else if (asset === "mf") {
      const unitCount = parseInt(mfUnits) || 0;
      Object.assign(payload, {
        propertyAddress: mfAddr,
        askingPrice: mfPrice,
        unitCount: mfUnits,
        assignmentFee: referralFee,
        dealStatus,
        ...(unitCount >= 2 && unitCount <= 4 ? {
          occupancyStatus: mf24Occ,
          grossRents: mf24Rents,
          condition: mf24Cond,
          hasMortgage: mf24Mort,
          mortgageBalance: mf24MortBal,
          mortgageRate: mf24MortRate,
          assumable: mf24Assume,
          creativeFinancing: mf24Cf,
        } : unitCount >= 5 && unitCount <= 19 ? {
          occupancyStatus: mf5Occ,
          grossRents: mf5Rents,
          currentNoi: mf5Noi,
          hasMortgage: mf5Mort,
          mortgageBalance: mf5MortBal,
          mortgageRate: mf5MortRate,
          assumable: mf5Assume,
          yearBuilt: mf5Year,
          condition: mf5Cond,
          t12Available: mf5T12,
        } : {
          occupancyStatus: mf20Occ,
          grossRents: mf20Rents,
          hasMortgage: mf20Mort,
          mortgageBalance: mf20MortBal,
          mortgageRate: mf20MortRate,
          assumable: mf20Assume,
          currentNoi: mf20Noi,
          capRate: mf20Cap,
          t12Available: mf20T12,
          squareFootage: mf20Sf,
        }),
      });
    } else if (asset === "mhp") {
      Object.assign(payload, {
        propertyAddress: mhpAddr,
        askingPrice: mhpPrice,
        totalPads: mhpLots,
        occupiedPads: mhpOcc,
        waterSewerType: mhpWater,
        hasParkOwnedHomes: mhpPoh,
        parkOwnedHomes: mhpPohUnits,
        parkOwnedCondition: mhpPohCond,
        grossRents: mhpInc,
        lotRent: mhpLotRent,
        infrastructureIssues: mhpInfra,
        hasMortgage: mhpMort,
        mortgageBalance: mhpMortBal,
        mortgageRate: mhpMortRate,
        assumable: mhpAssume,
        violations: mhpViol,
        violationsDesc: mhpViolDesc,
        environmentalIssues: mhpEnv,
        environmentalDesc: mhpEnvDesc,
        squareFootage: mhpSf,
        assignmentFee: referralFee,
        dealStatus,
      });
    } else if (asset === "rv") {
      Object.assign(payload, {
        propertyAddress: rvAddr,
        askingPrice: rvPrice,
        totalPads: rvSites,
        seasonal: rvSeason,
        seasonOpen: rvSeasonOpen,
        seasonClose: rvSeasonClose,
        peakOccupancy: rvPeakOcc,
        yearRoundOccupancy: rvYrOcc,
        longTermTenants: rvLt,
        longTermCount: rvLtCount,
        siteTypes: rvSiteTypes,
        grossRents: rvRev,
        managementType: rvMgmt,
        bookingPlatform: rvBooking,
        amenities: rvAmenities,
        hasMortgage: rvMort,
        mortgageBalance: rvMortBal,
        mortgageRate: rvMortRate,
        assumable: rvAssume,
        squareFootage: rvSf,
        assignmentFee: referralFee,
        dealStatus,
      });
    }

    try {
      const res = await fetch("/api/submit-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#071525]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center space-y-6 max-w-lg mx-auto px-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Deal Received.</h2>
            <p className="text-gray-400 text-lg">We review every submission and will reach out within 24–48 hours if it's a fit. Thanks for sending it over.</p>
            <a href="/" className="inline-block mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition">Back to Home</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#071525]">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Logo + Header */}
          <div className="text-center mb-10">
            <div className="inline-block bg-[#0a1828] rounded-2xl px-8 py-6 mb-4 border border-gray-700/40">
              <img src="/logo-jm.png" alt="Josh Moore" className="h-20 mx-auto" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Submit Your Deal</h1>
            <p className="text-gray-400 mt-2">Fill out the form below and I'll review it within 24–48 hours.</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400 font-medium">Step {step + 1} of 4</span>
              <span className="text-xs text-blue-400 font-semibold">{STEP_NAMES[step]}</span>
            </div>
            <div className="flex gap-1.5">
              {[0,1,2,3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-blue-500" : "bg-gray-700"}`} />
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-[#0a1828] border border-gray-700/40 rounded-2xl p-6 md:p-8 space-y-5">

            {/* ── STEP 1: About You ── */}
            {step === 0 && (
              <>
                <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3">About You</h2>

                <div>
                  <Label required>Are you the property owner?</Label>
                  <RadioGroup name="is_owner" value={isOwner} onChange={setIsOwner}
                    options={[{ value: "yes", label: "Yes, I own it" }, { value: "no", label: "No, I'm a wholesaler / agent / bird dog" }]} />
                  <FieldError msg={errors["isOwner"] || ""} show={!!errors["isOwner"]} />
                </div>

                <ConditionalBlock show={isOwner === "no"} title="Your Role">
                  <div>
                    <Label>Role</Label>
                    <RadioGroup name="role" value={role} onChange={setRole}
                      options={[
                        { value: "birddog", label: "Bird Dog" },
                        { value: "wholesaler", label: "Wholesaler / Investor" },
                        { value: "agent", label: "Agent / Broker" },
                        { value: "other", label: "Other" },
                      ]} />
                  </div>
                </ConditionalBlock>

                <SectionDivider />

                <div>
                  <Label required>Full Name</Label>
                  <Input placeholder="Jane Smith" value={name} onChange={setName} hasError={!!errors["name"]} />
                  <FieldError msg={errors["name"] || ""} show={!!errors["name"]} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label required>Email</Label>
                    <Input type="email" placeholder="jane@email.com" value={email} onChange={setEmail} hasError={!!errors["email"]} />
                    <FieldError msg={errors["email"] || ""} show={!!errors["email"]} />
                  </div>
                  <div>
                    <Label required>Phone</Label>
                    <Input type="tel" placeholder="(616) 555-0100" value={phone} onChange={setPhone} hasError={!!errors["phone"]} />
                    <FieldError msg={errors["phone"] || ""} show={!!errors["phone"]} />
                  </div>
                </div>

                <div>
                  <Label optional>Preferred Contact Method</Label>
                  <RadioGroup name="contact_pref" value={contactPref} onChange={setContactPref}
                    options={[{ value: "call", label: "Call" }, { value: "text", label: "Text" }, { value: "email", label: "Email" }]} />
                </div>

                <NavButtons onNext={() => goTo(1)} nextLabel="Next →" />
              </>
            )}

            {/* ── STEP 2: Property Type ── */}
            {step === 1 && (
              <>
                <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3">Property Type</h2>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "sfh", icon: "🏠", name: "Single Family", desc: "SFH, townhome, condo" },
                    { value: "mf", icon: "🏢", name: "Multifamily", desc: "Duplex through large apartment" },
                    { value: "mhp", icon: "🏡", name: "Mobile Home Park", desc: "MHP / land-lease community" },
                    { value: "rv", icon: "🚐", name: "RV Park / Campground", desc: "RV, campground, glamping" },
                  ].map(a => (
                    <label key={a.value} className={`flex flex-col items-center text-center p-4 rounded-xl border cursor-pointer transition ${asset === a.value ? "border-blue-500 bg-blue-500/10" : "border-gray-600 bg-[#0f2035] hover:border-gray-400"}`}>
                      <input type="radio" name="asset" value={a.value} checked={asset === a.value} onChange={() => setAsset(a.value as Asset)} className="sr-only" />
                      <span className="text-3xl mb-2">{a.icon}</span>
                      <span className="font-semibold text-white text-sm">{a.name}</span>
                      <span className="text-gray-400 text-xs mt-1">{a.desc}</span>
                    </label>
                  ))}
                </div>
                <FieldError msg={errors["asset"] || ""} show={!!errors["asset"]} />

                <NavButtons onBack={() => goTo(0)} onNext={() => goTo(2)} />
              </>
            )}

            {/* ── STEP 3: Deal Details ── */}
            {step === 2 && (
              <>
                {/* SFH */}
                {asset === "sfh" && (
                  <>
                    <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3">Single Family <span className="text-blue-400">Details</span></h2>

                    <div>
                      <Label required>Property Address</Label>
                      <Input placeholder="123 Main St, Grand Haven, MI 49417" value={sfhAddr} onChange={setSfhAddr} hasError={!!errors["sfhAddr"]} />
                      <FieldError msg={errors["sfhAddr"] || ""} show={!!errors["sfhAddr"]} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label required>Asking Price</Label>
                        <Input placeholder="$120,000" value={sfhPrice} onChange={setSfhPrice} hasError={!!errors["sfhPrice"]} />
                        <FieldError msg={errors["sfhPrice"] || ""} show={!!errors["sfhPrice"]} />
                      </div>
                      <div>
                        <Label required={isWholesaler} optional={!isWholesaler}>Est. ARV</Label>
                        <Input placeholder="$185,000" value={sfhArv} onChange={setSfhArv} hasError={!!errors["sfhArv"]} />
                        <p className="text-xs text-gray-500 mt-1">What's it worth fully fixed up?</p>
                        <FieldError msg={errors["sfhArv"] || ""} show={!!errors["sfhArv"]} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label required>Bedrooms</Label>
                        <Select value={sfhBeds} onChange={setSfhBeds} hasError={!!errors["sfhBeds"]}
                          options={[{value:"",label:"Select"},{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"},{value:"5+",label:"5+"}]} />
                        <FieldError msg={errors["sfhBeds"] || ""} show={!!errors["sfhBeds"]} />
                      </div>
                      <div>
                        <Label required>Bathrooms</Label>
                        <Select value={sfhBaths} onChange={setSfhBaths} hasError={!!errors["sfhBaths"]}
                          options={[{value:"",label:"Select"},{value:"1",label:"1"},{value:"1.5",label:"1.5"},{value:"2",label:"2"},{value:"2.5",label:"2.5"},{value:"3+",label:"3+"}]} />
                        <FieldError msg={errors["sfhBaths"] || ""} show={!!errors["sfhBaths"]} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label optional>Sq Footage</Label>
                        <Input placeholder="1,400 sqft / I don't know" value={sfhSqft} onChange={setSfhSqft} />
                      </div>
                      <div>
                        <Label optional>Year Built</Label>
                        <Input placeholder="1978 / I don't know" value={sfhYear} onChange={setSfhYear} />
                      </div>
                    </div>

                    <div>
                      <Label required>Property Condition</Label>
                      <RadioGroup name="sfh-cond" value={sfhCond} onChange={setSfhCond}
                        options={[{value:"turnkey",label:"Turnkey"},{value:"light",label:"Light Updates"},{value:"moderate",label:"Moderate Rehab"},{value:"full",label:"Full Gut"},{value:"tear",label:"Tear Down"}]} />
                      <FieldError msg={errors["sfhCond"] || ""} show={!!errors["sfhCond"]} />
                    </div>

                    <ConditionalBlock show={["moderate","full","tear"].includes(sfhCond)} title="Repair Details">
                      <div>
                        <Label optional>Est. Repair Cost</Label>
                        <Input placeholder="$45,000 / I don't know yet" value={sfhRepairCost} onChange={setSfhRepairCost} />
                      </div>
                      <div>
                        <Label optional>Describe Repairs</Label>
                        <Textarea placeholder="Roof, HVAC, kitchen/bath gut..." value={sfhRepairDesc} onChange={setSfhRepairDesc} />
                      </div>
                    </ConditionalBlock>

                    <SectionDivider />

                    <div>
                      <Label optional>Occupancy Status</Label>
                      <RadioGroup name="sfh-occ" value={sfhOcc} onChange={setSfhOcc}
                        options={[{value:"vacant",label:"Vacant"},{value:"owner",label:"Owner Occupied"},{value:"tenant",label:"Tenant Occupied"},{value:"idk",label:"I don't know"}]} />
                    </div>

                    <ConditionalBlock show={sfhOcc === "tenant"} title="Tenant Info">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label optional>Monthly Rent</Label>
                          <Input placeholder="$1,100 / I don't know" value={sfhRent} onChange={setSfhRent} />
                        </div>
                        <div>
                          <Label optional>Lease Status</Label>
                          <Select value={sfhLease} onChange={setSfhLease}
                            options={[{value:"",label:"Select or skip"},{value:"mtm",label:"Month-to-Month"},{value:"fixed",label:"Fixed Term"},{value:"idk",label:"I don't know"}]} />
                        </div>
                      </div>
                      <ConditionalBlock show={sfhLease === "fixed"}>
                        <div>
                          <Label optional>Lease Expiration</Label>
                          <Input type="date" value={sfhLeaseExp} onChange={setSfhLeaseExp} />
                        </div>
                      </ConditionalBlock>
                    </ConditionalBlock>

                    <SectionDivider />

                    <div>
                      <Label required={isWholesaler} optional={!isWholesaler}>Existing Mortgage?</Label>
                      <RadioGroup name="sfh-mort" value={sfhMort} onChange={setSfhMort}
                        options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"idk",label:"I don't know"}]} />
                      <FieldError msg={errors["sfhMort"] || ""} show={!!errors["sfhMort"]} />
                    </div>

                    <ConditionalBlock show={sfhMort === "yes"} title="Mortgage Details">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label optional>Approx. Balance</Label>
                          <Input placeholder="$78,000 / I don't know" value={sfhMortBal} onChange={setSfhMortBal} />
                        </div>
                        <div>
                          <Label optional>Interest Rate</Label>
                          <Input placeholder="3.5% / I don't know" value={sfhMortRate} onChange={setSfhMortRate} />
                        </div>
                      </div>
                      <div>
                        <Label optional>Monthly Payment</Label>
                        <Input placeholder="$610 / I don't know" value={sfhMortPmt} onChange={setSfhMortPmt} />
                      </div>
                    </ConditionalBlock>

                    <div>
                      <Label optional>Open to Creative Financing?</Label>
                      <RadioGroup name="sfh-cf" value={sfhCf} onChange={setSfhCf}
                        options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"unsure",label:"Not Sure"}]} />
                    </div>

                    <ConditionalBlock show={["yes","unsure"].includes(sfhCf)} title="Creative Finance Options — Check All That Apply">
                      <CheckboxGroup
                        options={["Subject-To (buyer takes over existing mortgage)","Seller Financing (you hold the note)","Lease Option","Other"]}
                        selected={sfhCfOptions} onChange={setSfhCfOptions} />
                    </ConditionalBlock>

                    <SectionDivider />

                    <div>
                      <Label optional>Seller Motivation — pick all that apply</Label>
                      <PillGroup
                        options={["Divorce / Separation","Probate / Estate","Financial Hardship","Relocating","Tired Landlord","Downsizing","Pre-Foreclosure","Code Violations","Health / Life Change","Just Want to Sell Fast"]}
                        selected={sfhMotivation} onChange={setSfhMotivation} />
                    </div>
                  </>
                )}

                {/* MULTIFAMILY */}
                {asset === "mf" && (
                  <>
                    <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3">Multifamily <span className="text-blue-400">Details</span></h2>

                    <div>
                      <Label required>Property Address</Label>
                      <Input placeholder="123 Main St, City, State ZIP" value={mfAddr} onChange={setMfAddr} hasError={!!errors["mfAddr"]} />
                      <FieldError msg={errors["mfAddr"] || ""} show={!!errors["mfAddr"]} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label required>Asking Price</Label>
                        <Input placeholder="$850,000" value={mfPrice} onChange={setMfPrice} hasError={!!errors["mfPrice"]} />
                        <FieldError msg={errors["mfPrice"] || ""} show={!!errors["mfPrice"]} />
                      </div>
                      <div>
                        <Label required>Total Units</Label>
                        <Input type="number" placeholder="24" value={mfUnits} onChange={setMfUnits} hasError={!!errors["mfUnits"]} />
                        <FieldError msg={errors["mfUnits"] || ""} show={!!errors["mfUnits"]} />
                      </div>
                    </div>

                    {/* 2-4 units */}
                    <ConditionalBlock show={mfUnitCount >= 2 && mfUnitCount <= 4} title="Small Multifamily (2–4 Units)">
                      <div>
                        <Label optional>Occupancy</Label>
                        <RadioGroup name="mf24-occ" value={mf24Occ} onChange={setMf24Occ}
                          options={[{value:"vacant",label:"Vacant"},{value:"partial",label:"Partial"},{value:"full",label:"Fully Occupied"},{value:"idk",label:"I don't know"}]} />
                      </div>
                      <div>
                        <Label optional>Gross Monthly Rents</Label>
                        <Input placeholder="$3,200 / I don't know" value={mf24Rents} onChange={setMf24Rents} />
                      </div>
                      <div>
                        <Label optional>Property Condition</Label>
                        <Select value={mf24Cond} onChange={setMf24Cond}
                          options={[{value:"",label:"Select or skip"},{value:"turnkey",label:"Turnkey"},{value:"light",label:"Light Updates"},{value:"moderate",label:"Moderate Rehab"},{value:"full",label:"Full Gut"},{value:"idk",label:"I don't know"}]} />
                      </div>
                      <div>
                        <Label optional>Existing Mortgage?</Label>
                        <RadioGroup name="mf24-mort" value={mf24Mort} onChange={setMf24Mort}
                          options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"idk",label:"I don't know"}]} />
                      </div>
                      <ConditionalBlock show={mf24Mort === "yes"} title="Financing Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label optional>Balance</Label><Input placeholder="$320,000 / I don't know" value={mf24MortBal} onChange={setMf24MortBal} /></div>
                          <div><Label optional>Rate</Label><Input placeholder="5% / I don't know" value={mf24MortRate} onChange={setMf24MortRate} /></div>
                        </div>
                        <div>
                          <Label optional>Assumable?</Label>
                          <RadioGroup name="mf24-assume" value={mf24Assume} onChange={setMf24Assume}
                            options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"idk",label:"I don't know"}]} />
                        </div>
                      </ConditionalBlock>
                      <div>
                        <Label optional>Open to Creative Finance?</Label>
                        <RadioGroup name="mf24-cf" value={mf24Cf} onChange={setMf24Cf}
                          options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"unsure",label:"Not Sure"}]} />
                      </div>
                    </ConditionalBlock>

                    {/* 5-19 units */}
                    <ConditionalBlock show={mfUnitCount >= 5 && mfUnitCount <= 19} title="Midsize Commercial (5–19 Units)">
                      <div>
                        <Label required>Occupancy %</Label>
                        <Input type="number" placeholder="85" value={mf5Occ} onChange={setMf5Occ} />
                      </div>
                      <div>
                        <Label required>Gross Monthly Rents</Label>
                        <Input placeholder="$14,500 / I don't know" value={mf5Rents} onChange={setMf5Rents} />
                      </div>
                      <div>
                        <Label optional>NOI</Label>
                        <Input placeholder="$8,200 / I don't know" value={mf5Noi} onChange={setMf5Noi} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label optional>Year Built</Label><Input placeholder="1988 / I don't know" value={mf5Year} onChange={setMf5Year} /></div>
                        <div>
                          <Label optional>Condition</Label>
                          <Select value={mf5Cond} onChange={setMf5Cond}
                            options={[{value:"",label:"Select or skip"},{value:"turnkey",label:"Turnkey"},{value:"light",label:"Light Updates"},{value:"moderate",label:"Moderate Rehab"},{value:"value-add",label:"Significant Value-Add"},{value:"idk",label:"I don't know"}]} />
                        </div>
                      </div>
                      <div>
                        <Label optional>Existing Mortgage?</Label>
                        <RadioGroup name="mf5-mort" value={mf5Mort} onChange={setMf5Mort}
                          options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"idk",label:"I don't know"}]} />
                      </div>
                      <ConditionalBlock show={mf5Mort === "yes"} title="Financing Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label optional>Balance</Label><Input placeholder="$600,000 / I don't know" value={mf5MortBal} onChange={setMf5MortBal} /></div>
                          <div><Label optional>Rate</Label><Input placeholder="5.5% / I don't know" value={mf5MortRate} onChange={setMf5MortRate} /></div>
                        </div>
                        <div>
                          <Label optional>Assumable?</Label>
                          <RadioGroup name="mf5-assume" value={mf5Assume} onChange={setMf5Assume}
                            options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"idk",label:"I don't know"}]} />
                        </div>
                      </ConditionalBlock>
                      <div>
                        <Label optional>T12 / Rent Roll Notes</Label>
                        <Textarea placeholder="Available on request / summary here..." value={mf5T12} onChange={setMf5T12} />
                      </div>
                    </ConditionalBlock>

                    {/* 20+ units */}
                    <ConditionalBlock show={mfUnitCount >= 20} title="Large Commercial (20+ Units)">
                      <div>
                        <Label required>Occupancy %</Label>
                        <Input type="number" placeholder="88" value={mf20Occ} onChange={setMf20Occ} />
                      </div>
                      <div>
                        <Label required>Gross Monthly Rents</Label>
                        <Input placeholder="$42,000 / I don't know" value={mf20Rents} onChange={setMf20Rents} />
                      </div>
                      <div>
                        <Label required>Existing Mortgage?</Label>
                        <RadioGroup name="mf20-mort" value={mf20Mort} onChange={setMf20Mort}
                          options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"idk",label:"I don't know"}]} />
                      </div>
                      <ConditionalBlock show={mf20Mort === "yes"} title="Financing Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label optional>Balance</Label><Input placeholder="$2,100,000 / I don't know" value={mf20MortBal} onChange={setMf20MortBal} /></div>
                          <div><Label optional>Rate</Label><Input placeholder="5.75% / I don't know" value={mf20MortRate} onChange={setMf20MortRate} /></div>
                        </div>
                        <div>
                          <Label optional>Assumable?</Label>
                          <RadioGroup name="mf20-assume" value={mf20Assume} onChange={setMf20Assume}
                            options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"idk",label:"I don't know"}]} />
                        </div>
                      </ConditionalBlock>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label optional>NOI</Label><Input placeholder="$24,000 / I don't know" value={mf20Noi} onChange={setMf20Noi} /></div>
                        <div><Label optional>Cap Rate</Label><Input placeholder="6.5% / I don't know" value={mf20Cap} onChange={setMf20Cap} /></div>
                      </div>
                      <div>
                        <Label optional>T12 / Rent Roll / CapEx Notes</Label>
                        <Textarea placeholder="Available on request / summary here..." value={mf20T12} onChange={setMf20T12} />
                      </div>
                      <div>
                        <Label optional>Open to Seller Financing?</Label>
                        <RadioGroup name="mf20-sf" value={mf20Sf} onChange={setMf20Sf}
                          options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"unsure",label:"Not Sure"}]} />
                      </div>
                    </ConditionalBlock>
                  </>
                )}

                {/* MHP */}
                {asset === "mhp" && (
                  <>
                    <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3">Mobile Home Park <span className="text-blue-400">Details</span></h2>

                    <div>
                      <Label required>Property Address</Label>
                      <Input placeholder="123 Park Rd, City, State ZIP" value={mhpAddr} onChange={setMhpAddr} hasError={!!errors["mhpAddr"]} />
                      <FieldError msg={errors["mhpAddr"] || ""} show={!!errors["mhpAddr"]} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label required>Asking Price</Label>
                        <Input placeholder="$1,200,000" value={mhpPrice} onChange={setMhpPrice} hasError={!!errors["mhpPrice"]} />
                        <FieldError msg={errors["mhpPrice"] || ""} show={!!errors["mhpPrice"]} />
                      </div>
                      <div>
                        <Label required>Total Lots</Label>
                        <Input type="number" placeholder="48" value={mhpLots} onChange={setMhpLots} hasError={!!errors["mhpLots"]} />
                        <FieldError msg={errors["mhpLots"] || ""} show={!!errors["mhpLots"]} />
                      </div>
                    </div>

                    <div>
                      <Label required>Occupied Lots / Occupancy %</Label>
                      <Input placeholder="38 lots / 79% / I don't know" value={mhpOcc} onChange={setMhpOcc} hasError={!!errors["mhpOcc"]} />
                      <FieldError msg={errors["mhpOcc"] || ""} show={!!errors["mhpOcc"]} />
                    </div>

                    <div>
                      <Label required>Water & Sewer Type</Label>
                      <Select value={mhpWater} onChange={setMhpWater} hasError={!!errors["mhpWater"]}
                        options={[
                          {value:"",label:"Select"},
                          {value:"city-city",label:"City Water + City Sewer"},
                          {value:"well-septic",label:"Well + Septic"},
                          {value:"city-septic",label:"City Water + Septic"},
                          {value:"well-city",label:"Well + City Sewer"},
                          {value:"idk",label:"I don't know"},
                        ]} />
                      <FieldError msg={errors["mhpWater"] || ""} show={!!errors["mhpWater"]} />
                    </div>

                    <div>
                      <Label required>Home Ownership Type</Label>
                      <RadioGroup name="mhp-poh" value={mhpPoh} onChange={setMhpPoh}
                        options={[{value:"toh",label:"Tenant-Owned (TOH)"},{value:"poh",label:"Park-Owned (POH)"},{value:"mixed",label:"Mixed"}]} />
                      <FieldError msg={errors["mhpPoh"] || ""} show={!!errors["mhpPoh"]} />
                    </div>

                    <ConditionalBlock show={["poh","mixed"].includes(mhpPoh)} title="Park-Owned Home Details">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label optional>Number of POH Units</Label><Input type="number" placeholder="12" value={mhpPohUnits} onChange={setMhpPohUnits} /></div>
                        <div>
                          <Label optional>POH Condition</Label>
                          <Select value={mhpPohCond} onChange={setMhpPohCond}
                            options={[{value:"",label:"Select or skip"},{value:"good",label:"Good"},{value:"fair",label:"Fair"},{value:"poor",label:"Poor"},{value:"idk",label:"I don't know"}]} />
                        </div>
                      </div>
                    </ConditionalBlock>

                    <SectionDivider />

                    <div>
                      <Label required={isWholesaler} optional={!isWholesaler}>Gross Monthly Income</Label>
                      <Input placeholder="$19,200 / I don't know" value={mhpInc} onChange={setMhpInc} hasError={!!errors["mhpInc"]} />
                      <FieldError msg={errors["mhpInc"] || ""} show={!!errors["mhpInc"]} />
                    </div>

                    <div>
                      <Label optional>Lot Rent Amount (per lot/mo)</Label>
                      <Input placeholder="$400/mo / I don't know" value={mhpLotRent} onChange={setMhpLotRent} />
                    </div>

                    <div>
                      <Label optional>Infrastructure Age / Condition</Label>
                      <RadioGroup name="mhp-infra" value={mhpInfra} onChange={setMhpInfra}
                        options={[{value:"good",label:"Good"},{value:"fair",label:"Fair"},{value:"poor",label:"Poor / Aging"},{value:"idk",label:"I don't know"}]} />
                    </div>

                    <div>
                      <Label optional>Existing Financing?</Label>
                      <RadioGroup name="mhp-mort" value={mhpMort} onChange={setMhpMort}
                        options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"idk",label:"I don't know"}]} />
                    </div>

                    <ConditionalBlock show={mhpMort === "yes"} title="Financing Details">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label optional>Balance</Label><Input placeholder="$650,000 / I don't know" value={mhpMortBal} onChange={setMhpMortBal} /></div>
                        <div><Label optional>Rate</Label><Input placeholder="5% / I don't know" value={mhpMortRate} onChange={setMhpMortRate} /></div>
                      </div>
                      <div>
                        <Label optional>Assumable?</Label>
                        <RadioGroup name="mhp-assume" value={mhpAssume} onChange={setMhpAssume}
                          options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"idk",label:"I don't know"}]} />
                      </div>
                    </ConditionalBlock>

                    <div>
                      <Label optional>Any City / County Violations?</Label>
                      <RadioGroup name="mhp-viol" value={mhpViol} onChange={setMhpViol}
                        options={[{value:"yes",label:"Yes"},{value:"no",label:"No"}]} />
                    </div>
                    <ConditionalBlock show={mhpViol === "yes"} title="Describe Violations">
                      <Textarea placeholder="Describe any known violations or compliance issues..." value={mhpViolDesc} onChange={setMhpViolDesc} />
                    </ConditionalBlock>

                    <div>
                      <Label optional>Known Environmental Issues?</Label>
                      <RadioGroup name="mhp-env" value={mhpEnv} onChange={setMhpEnv}
                        options={[{value:"yes",label:"Yes"},{value:"no",label:"No"}]} />
                    </div>
                    <ConditionalBlock show={mhpEnv === "yes"} title="Describe Environmental Issues">
                      <Textarea placeholder="Describe any known environmental concerns..." value={mhpEnvDesc} onChange={setMhpEnvDesc} />
                    </ConditionalBlock>

                    <div>
                      <Label optional>Open to Seller Financing?</Label>
                      <RadioGroup name="mhp-sf" value={mhpSf} onChange={setMhpSf}
                        options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"unsure",label:"Not Sure"}]} />
                    </div>
                  </>
                )}

                {/* RV PARK */}
                {asset === "rv" && (
                  <>
                    <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3">RV Park / Campground <span className="text-blue-400">Details</span></h2>

                    <div>
                      <Label required>Property Address</Label>
                      <Input placeholder="123 Camp Rd, City, State ZIP" value={rvAddr} onChange={setRvAddr} hasError={!!errors["rvAddr"]} />
                      <FieldError msg={errors["rvAddr"] || ""} show={!!errors["rvAddr"]} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label required>Asking Price</Label>
                        <Input placeholder="$2,400,000" value={rvPrice} onChange={setRvPrice} hasError={!!errors["rvPrice"]} />
                        <FieldError msg={errors["rvPrice"] || ""} show={!!errors["rvPrice"]} />
                      </div>
                      <div>
                        <Label required>Total Sites</Label>
                        <Input type="number" placeholder="85" value={rvSites} onChange={setRvSites} hasError={!!errors["rvSites"]} />
                        <FieldError msg={errors["rvSites"] || ""} show={!!errors["rvSites"]} />
                      </div>
                    </div>

                    <div>
                      <Label required>Seasonal or Year-Round?</Label>
                      <RadioGroup name="rv-season" value={rvSeason} onChange={setRvSeason}
                        options={[{value:"seasonal",label:"Seasonal"},{value:"yearround",label:"Year-Round"}]} />
                      <FieldError msg={errors["rvSeason"] || ""} show={!!errors["rvSeason"]} />
                    </div>

                    <ConditionalBlock show={rvSeason === "seasonal"} title="Seasonal Details">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label required>Season Opens</Label>
                          <Select value={rvSeasonOpen} onChange={setRvSeasonOpen}
                            options={[{value:"",label:"Select month"},...months.map(m=>({value:m,label:m}))]} />
                        </div>
                        <div>
                          <Label required>Season Closes</Label>
                          <Select value={rvSeasonClose} onChange={setRvSeasonClose}
                            options={[{value:"",label:"Select month"},...months.map(m=>({value:m,label:m}))]} />
                        </div>
                      </div>
                      <div>
                        <Label optional>Peak Season Avg Occupancy</Label>
                        <Input placeholder="90% / I don't know" value={rvPeakOcc} onChange={setRvPeakOcc} />
                      </div>
                    </ConditionalBlock>

                    <ConditionalBlock show={rvSeason === "yearround"} title="Year-Round Details">
                      <div>
                        <Label required>Current Occupancy %</Label>
                        <Input placeholder="75%" value={rvYrOcc} onChange={setRvYrOcc} />
                      </div>
                      <div>
                        <Label optional>Long-Term / Permanent Residents?</Label>
                        <RadioGroup name="rv-lt" value={rvLt} onChange={setRvLt}
                          options={[{value:"yes",label:"Yes"},{value:"no",label:"No"}]} />
                      </div>
                      <ConditionalBlock show={rvLt === "yes"}>
                        <div>
                          <Label optional>Approx. How Many?</Label>
                          <Input type="number" placeholder="12" value={rvLtCount} onChange={setRvLtCount} />
                        </div>
                      </ConditionalBlock>
                    </ConditionalBlock>

                    <SectionDivider />

                    <div>
                      <Label optional>Site Type Breakdown — check all that apply</Label>
                      <CheckboxGroup
                        options={["Full hookup (water, electric, sewer)","Water & electric only","Electric only","Dry camping / primitive","Cabin / glamping units"]}
                        selected={rvSiteTypes} onChange={setRvSiteTypes} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label required={isWholesaler} optional={!isWholesaler}>Gross Annual Revenue</Label>
                        <Input placeholder="$320,000 / I don't know" value={rvRev} onChange={setRvRev} hasError={!!errors["rvRev"]} />
                        <FieldError msg={errors["rvRev"] || ""} show={!!errors["rvRev"]} />
                      </div>
                      <div>
                        <Label optional>Management Type</Label>
                        <Select value={rvMgmt} onChange={setRvMgmt}
                          options={[{value:"",label:"Select or skip"},{value:"self",label:"Self-managed"},{value:"third",label:"Third-party management"}]} />
                      </div>
                    </div>

                    <div>
                      <Label optional>Booking Platform</Label>
                      <Input placeholder="Campspot, Hipcamp, direct, none, I don't know..." value={rvBooking} onChange={setRvBooking} />
                    </div>

                    <div>
                      <Label optional>Amenities — check all that apply</Label>
                      <PillGroup
                        options={["Pool","Bathhouse","Laundry","Playground","Camp Store","Boat Launch","WiFi","Fishing","Mini Golf"]}
                        selected={rvAmenities} onChange={setRvAmenities} />
                    </div>

                    <div>
                      <Label required={isWholesaler} optional={!isWholesaler}>Existing Financing?</Label>
                      <RadioGroup name="rv-mort" value={rvMort} onChange={setRvMort}
                        options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"idk",label:"I don't know"}]} />
                      <FieldError msg={errors["rvMort"] || ""} show={!!errors["rvMort"]} />
                    </div>

                    <ConditionalBlock show={rvMort === "yes"} title="Financing Details">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label optional>Balance</Label><Input placeholder="$900,000 / I don't know" value={rvMortBal} onChange={setRvMortBal} /></div>
                        <div><Label optional>Rate</Label><Input placeholder="5.25% / I don't know" value={rvMortRate} onChange={setRvMortRate} /></div>
                      </div>
                      <div>
                        <Label optional>Assumable?</Label>
                        <RadioGroup name="rv-assume" value={rvAssume} onChange={setRvAssume}
                          options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"idk",label:"I don't know"}]} />
                      </div>
                    </ConditionalBlock>

                    <div>
                      <Label optional>Open to Seller Financing?</Label>
                      <RadioGroup name="rv-sf" value={rvSf} onChange={setRvSf}
                        options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"unsure",label:"Not Sure"}]} />
                    </div>
                  </>
                )}

                <NavButtons onBack={() => goTo(1)} onNext={() => goTo(3)} />
              </>
            )}

            {/* ── STEP 4: Final ── */}
            {step === 3 && (
              <>
                <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3">Almost <span className="text-blue-400">Done.</span></h2>

                <div>
                  <Label optional>Anything else we should know?</Label>
                  <Textarea placeholder="Timeline, additional context, or anything else..." value={notes} onChange={setNotes} />
                </div>

                <div>
                  <Label optional>How did you hear about us?</Label>
                  <Select value={hearAbout} onChange={setHearAbout}
                    options={[
                      {value:"",label:"Select"},
                      {value:"instagram",label:"Instagram"},
                      {value:"facebook",label:"Facebook"},
                      {value:"referral",label:"Referral"},
                      {value:"google",label:"Google Search"},
                      {value:"meetup",label:"Meetup / Event"},
                      {value:"subto",label:"SubTo / Pace Morby Community"},
                      {value:"other",label:"Other"},
                    ]} />
                </div>

                {/* Referral block — non-owners only */}
                {isWholesaler && (
                  <ConditionalBlock show title="Referral & Assignment">
                    <div>
                      <Label optional>Referral Fee Expectation</Label>
                      <Input placeholder="$2,500 flat / 50% of spread / negotiable..." value={referralFee} onChange={setReferralFee} />
                    </div>
                    <div>
                      <Label>Your Status on This Deal</Label>
                      <RadioGroup name="deal-status" value={dealStatus} onChange={setDealStatus}
                        options={[{value:"contract",label:"I have it under contract"},{value:"referring",label:"I'm referring the lead"},{value:"other",label:"Other"}]} />
                    </div>
                  </ConditionalBlock>
                )}

                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={e => setConsent(e.target.checked)}
                      className="accent-blue-500 w-4 h-4 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-300">I confirm this information is accurate to the best of my knowledge.</span>
                  </label>
                  <FieldError msg={errors["consent"] || ""} show={!!errors["consent"]} />
                </div>

                {submitError && (
                  <div className="bg-red-900/40 border border-red-500 text-red-300 rounded-lg px-4 py-3 text-sm mb-4">
                    {submitError}
                  </div>
                )}
                <NavButtons onBack={() => goTo(2)} onNext={handleSubmit} nextLabel={submitting ? "Submitting…" : "Submit Deal →"} isSubmit disabled={submitting} />
              </>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
