import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Binoculars,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  Handshake,
  Landmark,
  Percent,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand, PageHero, Reveal, Section, SiteLayout } from "@/components/site";
import { useRouteSeo } from "@/hooks/useSeo";
import { cn } from "@/lib/utils";

/*
  The Collaborate intake. Five steps: contact, lane, a note from Josh, the
  questions for that lane, wrap up. Everything the visitor answers is keyed by
  the same snake_case names the server and the Supabase `collaborations` table
  use, so a field added here is one line on the server.

  Category ids, tags and required fields must match api/submit-collaboration.js.
*/

type CategoryId =
  | "bird-dog"
  | "wholesaler"
  | "hard-money"
  | "dscr"
  | "commercial-lender"
  | "mortgage-broker"
  | "commercial-broker"
  | "industry-partner";

type Category = {
  id: CategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** The note from Josh the visitor reads before the questions. */
  intro: string;
};

const CATEGORIES: Category[] = [
  {
    id: "bird-dog",
    label: "Bird dog",
    description: "You spot properties and send me the lead.",
    icon: Binoculars,
    intro:
      "I appreciate you taking a second to connect and start bringing me deals. I'd love to work with you. Tell me a little about yourself and what you expect out of it, so we both know what a win looks like.",
  },
  {
    id: "wholesaler",
    label: "Wholesaler",
    description: "You have deals under contract to assign or co-wholesale.",
    icon: Handshake,
    intro:
      "I appreciate you taking a second to connect. I'd love to co-wholesale or buy a deal from you. Tell me a little about you and where you operate, and let's find a win together.",
  },
  {
    id: "hard-money",
    label: "Hard money lender",
    description: "Short-term, asset-based loans on investment property.",
    icon: Banknote,
    intro:
      "Thanks for taking a second to connect. I'm always looking for hard money lenders to use on my own projects and to recommend to friends. Tell me a little about yourself and the products you offer.",
  },
  {
    id: "dscr",
    label: "DSCR lender",
    description: "Rental loans underwritten on the property's cash flow.",
    icon: Percent,
    intro:
      "Thanks for connecting. I'm always looking for DSCR lenders to work with. Tell me about you and your products so we can see where the fit is.",
  },
  {
    id: "commercial-lender",
    label: "Commercial lender",
    description: "Debt on multifamily, parks, storage and commercial.",
    icon: Landmark,
    intro:
      "I appreciate you taking a moment. I'm always glad to meet commercial lenders. Whether it's a laundromat, an RV park, or anything in between, tell me what you lend on and let's see where we line up.",
  },
  {
    id: "mortgage-broker",
    label: "Mortgage broker",
    description: "You place loans with lenders for investors.",
    icon: Briefcase,
    intro:
      "I appreciate you connecting. I'm always looking to work with sharp brokers who can place more than one kind of loan. Tell me about the products you offer and let's see if there's a win in it for both of us.",
  },
  {
    id: "commercial-broker",
    label: "Commercial broker",
    description: "You list, source and sell commercial property.",
    icon: Building2,
    intro:
      "I appreciate you taking the time to connect. I'd love to have you putting deals in front of me. Tell me a little about your focus in commercial real estate.",
  },
  {
    id: "industry-partner",
    label: "Industry partner",
    description: "Property managers, contractors, title, attorneys and more.",
    icon: Users,
    intro:
      "Thanks for taking a second to connect. Tell me what you do and how you like to work, and let's figure out where we can help each other.",
  },
];

/* ---------- Option lists ---------- */

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
  "Single family", "Multifamily", "Mobile home park", "RV park / campground",
  "Self storage", "Land", "Commercial", "Other",
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
const BROKER_PRODUCTS = ["Conventional", "FHA", "DSCR", "Hard money", "Commercial", "Other"];
const PARTNER_ROLES = [
  "Property manager", "Contractor / rehab crew", "Disposition partner", "Title company",
  "Real estate attorney", "Virtual assistant", "Acquisitions support", "Other",
];
const HEAR_ABOUT = [
  "Instagram", "Facebook", "Referral", "Google search", "Meetup / event",
  "SubTo / Pace Morby community", "Other",
];

type Option = { value: string; label: string };
const YES_NO: Option[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];
const YES_NO_CASE: Option[] = [...YES_NO, { value: "case", label: "Case by case" }];
const YES_NO_SOMETIMES: Option[] = [...YES_NO, { value: "sometimes", label: "Sometimes" }];

/* ---------- Field definitions ---------- */

type Answers = Record<string, string | string[] | undefined>;

type FieldBase = {
  key: string;
  label: string;
  required?: boolean;
  /** Sits in one column of the two-column grid on wider screens. */
  half?: boolean;
  /** Hide the field (and skip it in the payload) unless this returns true. */
  showIf?: (answers: Answers) => boolean;
};

type Field =
  | (FieldBase & { kind: "text"; placeholder?: string; inputType?: "text" | "email" | "tel" | "url"; autoComplete?: string })
  | (FieldBase & { kind: "textarea"; placeholder?: string })
  | (FieldBase & { kind: "select"; options: string[]; placeholder?: string })
  | (FieldBase & { kind: "pills"; options: string[] })
  | (FieldBase & { kind: "radio"; options: Option[] })
  | (FieldBase & { kind: "states" })
  | (FieldBase & { kind: "checks"; options: string[] });

const isMulti = (f: Field) => f.kind === "pills" || f.kind === "states" || f.kind === "checks";

const strOf = (answers: Answers, key: string): string => {
  const v = answers[key];
  return typeof v === "string" ? v : "";
};
const listOf = (answers: Answers, key: string): string[] => {
  const v = answers[key];
  return Array.isArray(v) ? v : [];
};

const GOAL_PLACEHOLDER = "Tell me what a win looks like for you...";
const goal = (key: string): Field => ({
  key,
  kind: "textarea",
  label: "What are you looking for out of this relationship?",
  placeholder: GOAL_PLACEHOLDER,
});

const CONTACT_FIELDS: Field[] = [
  { key: "name", kind: "text", label: "Full name", required: true, placeholder: "John Smith", autoComplete: "name" },
  { key: "email", kind: "text", label: "Email address", required: true, inputType: "email", placeholder: "john@example.com", autoComplete: "email", half: true },
  { key: "phone", kind: "text", label: "Phone number", required: true, inputType: "tel", placeholder: "(616) 555-0100", autoComplete: "tel", half: true },
  { key: "website", kind: "text", label: "Company or website", placeholder: "yourcompany.com", autoComplete: "url" },
];

const DEAL_FINDER_SHARED: Field[] = [
  { key: "bd_deal_types", kind: "pills", label: "Deal types you find", options: ASSET_CLASSES },
  { key: "bd_markets", kind: "states", label: "Markets you work in" },
  { key: "bd_communities", kind: "text", label: "Part of any real estate communities?", placeholder: "SubTo, Pace Morby, BiggerPockets..." },
  goal("bd_goal"),
];

const lendsNationally = (prefix: string, verb: "lend" | "work"): Field[] => [
  { key: `${prefix}_national`, kind: "radio", label: `Do you ${verb} nationally?`, required: true, options: YES_NO },
  {
    key: `${prefix}_excluded_states`,
    kind: "states",
    label: `States you don't ${verb} in`,
    showIf: (a) => strOf(a, `${prefix}_national`) === "no",
  },
];

const CATEGORY_FIELDS: Record<CategoryId, Field[]> = {
  "bird-dog": [
    { key: "bd_fee", kind: "text", label: "Desired average bird dog fee", placeholder: "$500 / I don't know", half: true },
    { key: "bd_leads_per_month", kind: "text", label: "Leads per month", placeholder: "5 / I don't know", half: true },
    { key: "bd_find_leads", kind: "pills", label: "How do you find your leads?", options: LEAD_SOURCES },
    ...DEAL_FINDER_SHARED,
  ],
  wholesaler: [
    { key: "ws_under_contract", kind: "radio", label: "Do you currently have deals under contract?", options: YES_NO_SOMETIMES },
    { key: "ws_find_deals", kind: "pills", label: "How do you find your deals?", options: LEAD_SOURCES },
    ...DEAL_FINDER_SHARED,
  ],
  "hard-money": [
    { key: "hm_company", kind: "text", label: "Company name", required: true, placeholder: "ABC Capital", autoComplete: "organization" },
    { key: "hm_asset_classes", kind: "pills", label: "Asset classes you lend on", required: true, options: LEND_ASSETS },
    ...lendsNationally("hm", "lend"),
    { key: "hm_rural", kind: "radio", label: "Do you lend in rural areas?", required: true, options: YES_NO_CASE },
    { key: "hm_ltv", kind: "text", label: "Typical LTV", required: true, placeholder: "65% / up to 75%", half: true },
    { key: "hm_rates", kind: "text", label: "Typical rates", required: true, placeholder: "10 to 13%", half: true },
    { key: "hm_min_loan", kind: "select", label: "Minimum loan amount", required: true, options: LOAN_MINIMUMS },
    { key: "hm_loan_terms", kind: "pills", label: "Typical loan terms", required: true, options: LOAN_TERMS },
    { key: "hm_close_timeline", kind: "text", label: "Typical close timeline", placeholder: "7 to 14 days / I don't know" },
    { key: "hm_distressed", kind: "radio", label: "Lend on distressed or value-add assets?", options: YES_NO_CASE },
    { key: "hm_personal_guarantee", kind: "radio", label: "Personal guarantee required?", options: YES_NO_CASE },
    { key: "hm_referral_program", kind: "radio", label: "Broker or referral program?", options: YES_NO },
    goal("hm_goal"),
  ],
  dscr: [
    { key: "dscr_company", kind: "text", label: "Company name", required: true, placeholder: "ABC Capital", autoComplete: "organization" },
    { key: "dscr_asset_classes", kind: "pills", label: "Asset classes you lend on", required: true, options: LEND_ASSETS },
    ...lendsNationally("dscr", "lend"),
    { key: "dscr_rural", kind: "radio", label: "Do you lend in rural areas?", required: true, options: YES_NO_CASE },
    { key: "dscr_ratio", kind: "text", label: "Minimum DSCR ratio", required: true, placeholder: "1.1 / 1.25", half: true },
    { key: "dscr_ltv", kind: "text", label: "Typical LTV", required: true, placeholder: "75% / up to 80%", half: true },
    { key: "dscr_rates", kind: "text", label: "Typical rates", required: true, placeholder: "7 to 9%", half: true },
    { key: "dscr_min_loan", kind: "select", label: "Minimum loan amount", required: true, options: LOAN_MINIMUMS, half: true },
    { key: "dscr_loan_terms", kind: "pills", label: "Typical loan terms", required: true, options: LOAN_TERMS },
    { key: "dscr_personal_guarantee", kind: "radio", label: "Personal guarantee required?", options: YES_NO_CASE },
    { key: "dscr_referral_program", kind: "radio", label: "Broker or referral program?", options: YES_NO },
    goal("dscr_goal"),
  ],
  "commercial-lender": [
    { key: "cl_company", kind: "text", label: "Company name", required: true, placeholder: "ABC Capital", autoComplete: "organization" },
    { key: "cl_asset_classes", kind: "pills", label: "Asset classes you lend on", required: true, options: LEND_ASSETS },
    ...lendsNationally("cl", "lend"),
    { key: "cl_rural", kind: "radio", label: "Do you lend in rural areas?", required: true, options: YES_NO_CASE },
    { key: "cl_ltv", kind: "text", label: "Typical LTV", required: true, placeholder: "70% / up to 80%", half: true },
    { key: "cl_rates", kind: "text", label: "Typical rates", required: true, placeholder: "6 to 9%", half: true },
    { key: "cl_min_loan", kind: "select", label: "Minimum loan amount", required: true, options: LOAN_MINIMUMS },
    { key: "cl_loan_terms", kind: "pills", label: "Typical loan terms", required: true, options: LOAN_TERMS },
    {
      key: "cl_agency_portfolio",
      kind: "radio",
      label: "Agency or portfolio loans?",
      options: [
        { value: "agency", label: "Agency" },
        { value: "portfolio", label: "Portfolio" },
        { value: "both", label: "Both" },
      ],
    },
    { key: "cl_prepayment_penalty", kind: "radio", label: "Prepayment penalty?", options: YES_NO_CASE },
    { key: "cl_personal_guarantee", kind: "radio", label: "Personal guarantee required?", options: YES_NO_CASE },
    { key: "cl_referral_program", kind: "radio", label: "Broker or referral program?", options: YES_NO },
    goal("cl_goal"),
  ],
  "mortgage-broker": [
    { key: "mb_company", kind: "text", label: "Company name", required: true, placeholder: "ABC Lending", autoComplete: "organization" },
    { key: "mb_products", kind: "pills", label: "Products you offer", required: true, options: BROKER_PRODUCTS },
    { key: "mb_asset_classes", kind: "pills", label: "Asset classes you work with", required: true, options: LEND_ASSETS },
    ...lendsNationally("mb", "work"),
    { key: "mb_min_loan", kind: "select", label: "Minimum loan amount", required: true, options: LOAN_MINIMUMS },
    { key: "mb_referral_program", kind: "radio", label: "Broker or referral program?", options: YES_NO },
    goal("mb_goal"),
  ],
  "commercial-broker": [
    { key: "cb_company", kind: "text", label: "Company name", required: true, placeholder: "ABC Realty", autoComplete: "organization" },
    { key: "cb_asset_classes", kind: "pills", label: "Asset classes you specialize in", required: true, options: LEND_ASSETS },
    ...lendsNationally("cb", "work"),
    { key: "cb_offmarket", kind: "radio", label: "Do you have access to off-market deals?", required: true, options: YES_NO_SOMETIMES },
    {
      key: "cb_method",
      kind: "radio",
      label: "How do you typically bring deals to buyers?",
      required: true,
      options: [
        { value: "direct", label: "Direct to buyer" },
        { value: "network", label: "Broker network" },
        { value: "both", label: "Both" },
      ],
    },
    { key: "cb_deal_size", kind: "select", label: "Average deal size", required: true, options: DEAL_SIZES, half: true },
    { key: "cb_deals_per_year", kind: "text", label: "Deals closed per year", placeholder: "10 / I don't know", half: true },
    { key: "cb_cobroker", kind: "radio", label: "Do you work with co-brokers?", options: YES_NO_CASE },
    {
      key: "cb_represent",
      kind: "radio",
      label: "You represent",
      options: [
        { value: "buyers", label: "Buyers" },
        { value: "sellers", label: "Sellers" },
        { value: "both", label: "Both" },
      ],
    },
    {
      key: "cb_referral",
      kind: "radio",
      label: "Open to referral fee arrangements outside traditional commission?",
      options: [...YES_NO, { value: "talk", label: "Let's talk" }],
    },
    goal("cb_goal"),
  ],
  "industry-partner": [
    { key: "ip_roles", kind: "checks", label: "What best describes your role?", required: true, options: PARTNER_ROLES },
    {
      key: "ip_other_role",
      kind: "text",
      label: "Tell me what you do",
      placeholder: "Describe your role...",
      showIf: (a) => listOf(a, "ip_roles").includes("Other"),
    },
    {
      key: "ip_other_more",
      kind: "textarea",
      label: "How could we work together in that role?",
      placeholder: "The more detail the better...",
      showIf: (a) => listOf(a, "ip_roles").includes("Other") && strOf(a, "ip_other_role").trim().length > 0,
    },
    {
      key: "ip_standard_more",
      kind: "textarea",
      label: "Tell me more about how we can work together",
      placeholder: "The more detail the better...",
      showIf: (a) => listOf(a, "ip_roles").some((r) => r !== "Other"),
    },
    goal("ip_goal"),
  ],
};

const FINAL_FIELDS: Field[] = [
  { key: "additional_notes", kind: "textarea", label: "Anything else you want me to know?", placeholder: "Timeline, context, or anything else..." },
  { key: "hear_about", kind: "select", label: "How did you hear about Josh?", options: HEAR_ABOUT },
];

/* ---------- Validation ---------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digitsIn = (s: string) => s.replace(/\D/g, "");

const visibleFields = (fields: Field[], answers: Answers) =>
  fields.filter((f) => !f.showIf || f.showIf(answers));

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** The short sentence shown when a required question is left empty. */
const missingMessage = (f: Field): string => {
  if (isMulti(f)) return "Please select at least one.";
  if (f.kind === "radio" || f.kind === "select") return "Please pick one.";
  return `Please enter your ${lowerFirst(f.label)}.`;
};

function validateFields(fields: Field[], answers: Answers): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const f of fields) {
    if (isMulti(f)) {
      if (f.required && listOf(answers, f.key).length === 0) errs[f.key] = missingMessage(f);
      continue;
    }
    const v = strOf(answers, f.key).trim();
    if (f.required && !v) {
      errs[f.key] = missingMessage(f);
      continue;
    }
    if (v && f.kind === "text" && f.inputType === "email" && !EMAIL_RE.test(v)) {
      errs[f.key] = "Please enter a valid email address.";
    }
    if (v && f.kind === "text" && f.inputType === "tel" && digitsIn(v).length < 10) {
      errs[f.key] = "Please enter a phone number with the area code.";
    }
  }
  return errs;
}

/* ---------- Small pieces ---------- */

const STEP_COUNT = 5;
const STEP_NAMES = ["Contact", "Your lane", "From Josh", "About you", "Wrap up"];
const LAST_STEP = STEP_COUNT - 1;
const GENERIC_ERROR =
  "Something went wrong on our end. Please try again in a minute, or reach out through the contact page.";
const THANK_YOU =
  "Thanks for reaching out. I'll review your submission and be in touch if there's a fit. Let's find a win together.";

/** The asterisk after a required label. Optional questions carry no marker. */
function Mark() {
  return (
    <span aria-hidden="true" className="ml-1 text-destructive">
      *
    </span>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error" role="alert">
      {message}
    </p>
  );
}

/** One question. Renders whichever control the field kind asks for. */
function FieldView({
  field,
  answers,
  error,
  onChange,
}: {
  field: Field;
  answers: Answers;
  error?: string;
  onChange: (key: string, value: string | string[]) => void;
}) {
  const id = `collab-${field.key}`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;
  const invalid = error ? true : undefined;

  if (field.kind === "text" || field.kind === "textarea" || field.kind === "select") {
    const value = strOf(answers, field.key);
    return (
      <div data-field={field.key}>
        <label htmlFor={id} className="field-label">
          {field.label}
          {field.required && <Mark />}
        </label>
        {field.kind === "text" && (
          <input
            id={id}
            name={field.key}
            type={field.inputType ?? "text"}
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            inputMode={field.inputType === "tel" ? "tel" : field.inputType === "email" ? "email" : undefined}
            className="field"
            aria-required={field.required || undefined}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
        )}
        {field.kind === "textarea" && (
          <textarea
            id={id}
            name={field.key}
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="field resize-y"
            aria-required={field.required || undefined}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
        )}
        {field.kind === "select" && (
          <div className="relative">
            <select
              id={id}
              name={field.key}
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={cn("field appearance-none pr-11", !value && "text-ink-muted")}
              aria-required={field.required || undefined}
              aria-invalid={invalid}
              aria-describedby={describedBy}
            >
              <option value="">{field.placeholder ?? "Select one"}</option>
              {field.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            />
          </div>
        )}
        <FieldError id={errorId} message={error} />
      </div>
    );
  }

  if (field.kind === "radio") {
    const value = strOf(answers, field.key);
    return (
      <div
        role="radiogroup"
        aria-labelledby={id}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        data-field={field.key}
      >
        <span id={id} className="field-label">
          {field.label}
          {field.required && <Mark />}
        </span>
        <div className={cn("grid gap-2.5", field.options.length > 2 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2")}>
          {field.options.map((opt) => (
            <label
              key={opt.value}
              className="choice items-center px-4 py-3 has-focus-visible:ring-[3px] has-focus-visible:ring-brand/40"
            >
              <input
                type="radio"
                name={field.key}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(field.key, opt.value)}
                className="peer sr-only"
                aria-invalid={invalid}
                aria-describedby={describedBy}
              />
              <span
                aria-hidden="true"
                className="size-5 shrink-0 rounded-full border-2 border-input bg-white transition-all peer-checked:border-[6px] peer-checked:border-brand"
              />
              <span className="text-[15px] font-medium leading-snug">{opt.label}</span>
            </label>
          ))}
        </div>
        <FieldError id={errorId} message={error} />
      </div>
    );
  }

  // Multi-select kinds: pills, states, checks.
  const selected = listOf(answers, field.key);
  const toggle = (opt: string) =>
    onChange(field.key, selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]);

  if (field.kind === "checks") {
    return (
      <div role="group" aria-labelledby={id} aria-describedby={describedBy} data-field={field.key}>
        <span id={id} className="field-label">
          {field.label}
          {field.required && <Mark />}
        </span>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {field.options.map((opt) => (
            <label
              key={opt}
              className="choice items-center px-4 py-3 has-focus-visible:ring-[3px] has-focus-visible:ring-brand/40"
            >
              <input
                type="checkbox"
                name={field.key}
                value={opt}
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="peer sr-only"
                aria-invalid={invalid}
                aria-describedby={describedBy}
              />
              <span
                aria-hidden="true"
                className="flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-input bg-white text-transparent transition-colors peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white"
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span className="text-[15px] font-medium leading-snug">{opt}</span>
            </label>
          ))}
        </div>
        <FieldError id={errorId} message={error} />
      </div>
    );
  }

  const options = field.kind === "states" ? STATES : field.options;
  const pills = (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={cn("pill", field.kind === "states" && "px-3.5 text-sm")}
          aria-pressed={selected.includes(opt)}
          aria-describedby={describedBy}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div role="group" aria-labelledby={id} aria-describedby={describedBy} data-field={field.key}>
      <span id={id} className="field-label">
        {field.label}
        {field.required && <Mark />}
      </span>
      {field.kind === "states" ? (
        <>
          <div className="max-h-60 overflow-y-auto rounded-2xl border border-line bg-paper p-3">{pills}</div>
          <p className="field-help">
            {selected.length > 0
              ? `${selected.length} state${selected.length === 1 ? "" : "s"} selected`
              : "Tap every state that applies."}
          </p>
        </>
      ) : (
        pills
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function FieldGrid({
  fields,
  answers,
  errors,
  onChange,
}: {
  fields: Field[];
  answers: Answers;
  errors: Record<string, string>;
  onChange: (key: string, value: string | string[]) => void;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-5">
      {fields.map((f) => (
        <div key={f.key} className={cn("min-w-0", !f.half && "sm:col-span-2")}>
          <FieldView field={f} answers={answers} error={errors[f.key]} onChange={onChange} />
        </div>
      ))}
    </div>
  );
}

/** A consent checkbox with its own error line. `name` is the key the error is filed under. */
function CheckRow({
  id,
  name,
  checked,
  onChange,
  error,
  required,
  children,
}: {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div data-field={name}>
      <label
        htmlFor={id}
        className={cn(
          "choice items-start has-focus-visible:ring-[3px] has-focus-visible:ring-brand/40",
          error && "border-destructive",
        )}
      >
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-input bg-white text-transparent transition-colors peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white"
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
        <span className="text-[15px] leading-relaxed text-ink">
          {children}
          {required && <Mark />}
        </span>
      </label>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function StepHeading({
  headingRef,
  title,
  lede,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mb-8">
      <h2 ref={headingRef} tabIndex={-1} className="display-md text-navy outline-none">
        {title}
      </h2>
      {lede && <p className="mt-3 text-[15px] leading-relaxed text-ink-soft md:text-base">{lede}</p>}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Pick your lane", body: "Deal finder, lender, broker or industry partner." },
    { title: "Tell me how you work", body: "Markets, products, terms. The things that decide whether a deal closes." },
    { title: "I follow up if there's a fit", body: "You'll hear from me directly." },
  ];
  return (
    <div className="rounded-[2rem] border border-white/12 bg-white/[0.06] p-7 sm:p-8">
      <p className="eyebrow text-brand-100">How this works</p>
      <ol className="mt-6 space-y-6">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/25 font-display text-sm font-bold text-brand-100">
              {i + 1}
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-white">{s.title}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-white/72">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-7 border-t border-white/12 pt-5 text-sm text-white/65">
        About three minutes, and your answers come straight to me.
      </p>
    </div>
  );
}

/* ---------- Page ---------- */

export default function Collaborate() {
  useRouteSeo("/collaborate");

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<CategoryId | "">("");
  const [answers, setAnswers] = useState<Answers>({});
  const [consent, setConsent] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [sourcePage, setSourcePage] = useState("/collaborate");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    setSourcePage(window.location.pathname || "/collaborate");
  }, []);

  // On every step change, bring the card back into view and hand focus to the
  // new heading so keyboard and screen reader users land in the right place.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    headingRef.current?.focus({ preventScroll: true });
  }, [step, submitted]);

  const current = category ? CATEGORIES.find((c) => c.id === category) : undefined;
  const categoryFields = category ? visibleFields(CATEGORY_FIELDS[category], answers) : [];

  const setAnswer = (key: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // After a failed Next, take the visitor to the first problem: bring that
  // question into view and focus its control so the error is read out with it.
  const focusField = (key: string) => {
    const wrap = formRef.current?.querySelector<HTMLElement>(`[data-field="${key}"]`);
    if (!wrap) return;
    const control = wrap.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea, button');
    wrap.scrollIntoView({ behavior: "smooth", block: "center" });
    control?.focus({ preventScroll: true });
  };

  const validateStep = (s: number): boolean => {
    let errs: Record<string, string> = {};
    if (s === 0) errs = validateFields(CONTACT_FIELDS, answers);
    if (s === 1 && !category) errs.category = "Please pick the lane that fits you best.";
    if (s === 3) errs = validateFields(categoryFields, answers);
    if (s === LAST_STEP && !consent) errs.consent = "Please confirm before you submit.";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) window.requestAnimationFrame(() => focusField(first));
    return !first;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setSubmitError("");
    setStep((s) => Math.min(s + 1, LAST_STEP));
  };

  // Back never validates. Whatever is half filled stays in state.
  const back = () => {
    setErrors({});
    setSubmitError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const buildPayload = () => {
    if (!category) return null;
    const payload: Record<string, unknown> = {
      category,
      consent,
      sms_consent: smsConsent,
      company_website: honeypot,
      started_at: startedAt,
      sourcePage,
    };
    const fields = [...CONTACT_FIELDS, ...categoryFields, ...FINAL_FIELDS];
    for (const f of fields) {
      payload[f.key] = isMulti(f) ? listOf(answers, f.key) : strOf(answers, f.key).trim();
    }
    return payload;
  };

  const handleSubmit = async () => {
    if (!validateStep(LAST_STEP)) return;
    const payload = buildPayload();
    if (!payload) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/submit-collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);
      if (!res) throw new Error(GENERIC_ERROR);
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: unknown } | null;
        const message = data && typeof data.error === "string" ? data.error : "";
        throw new Error(message || GENERIC_ERROR);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error && err.message ? err.message : GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const clearConsentError = () =>
    setErrors((prev) => {
      if (!prev.consent) return prev;
      const rest = { ...prev };
      delete rest.consent;
      return rest;
    });

  const progress = Math.round(((step + 1) / STEP_COUNT) * 100);

  return (
    <SiteLayout>
      <PageHero
        tone="navy"
        eyebrow="Collaborate"
        title="Let's find a win together."
        lede="If you find deals, lend on deals, place loans, or make deals run smoother, I want to know you. Pick the lane that fits, tell me how you work, and if there's a fit I'll be in touch."
        aside={<HowItWorks />}
      />

      <Section tone="paper" className="dots-paper">
        <Reveal className="mx-auto max-w-3xl">
          <div ref={cardRef} className="surface scroll-mt-28 p-5 sm:p-8 md:p-10">
            {submitted ? (
              <div className="py-6 text-center sm:py-10">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-navy text-white">
                  <Check className="size-8" strokeWidth={2.5} />
                </span>
                <h2 ref={headingRef} tabIndex={-1} className="display-md mt-7 text-navy outline-none">
                  You're in.
                </h2>
                <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-ink-soft">{THANK_YOU}</p>
                <Button asChild className="mt-8">
                  <Link href="/">
                    Back to home
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            ) : (
              <form
                ref={formRef}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step === LAST_STEP) void handleSubmit();
                  else next();
                }}
                onKeyDown={(e) => {
                  // On the last step only the Submit button sends the form. Enter on a
                  // checkbox, select or text control must not submit by accident.
                  if (e.key !== "Enter" || step !== LAST_STEP) return;
                  const target = e.target as HTMLElement;
                  const type = (target as HTMLInputElement).type;
                  if (target.tagName !== "TEXTAREA" && type !== "submit" && type !== "button") {
                    e.preventDefault();
                  }
                }}
              >
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-navy">
                      Step {step + 1} of {STEP_COUNT}
                    </span>
                    <span className="text-ink-muted">{STEP_NAMES[step]}</span>
                  </div>
                  <div
                    className="mt-2.5 h-1 overflow-hidden rounded-full bg-line"
                    role="progressbar"
                    aria-label="Form progress"
                    aria-valuemin={1}
                    aria-valuemax={STEP_COUNT}
                    aria-valuenow={step + 1}
                    aria-valuetext={`Step ${step + 1} of ${STEP_COUNT}: ${STEP_NAMES[step]}`}
                  >
                    <div
                      className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Bot traps. A person never sees or fills these. The trap's DOM name
                    carries no autofill meaning; it still posts as company_website. */}
                <input type="hidden" name="started_at" value={startedAt} />
                <input type="hidden" name="sourcePage" value={sourcePage} />
                <div aria-hidden="true" className="sr-only">
                  <span>Leave this blank</span>
                  <input
                    id="ref_code_2"
                    name="ref_code_2"
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />
                </div>

                {step === 0 && (
                  <>
                    <StepHeading
                      headingRef={headingRef}
                      title="Let's connect."
                      lede="A little about you before we get into it."
                    />
                    <FieldGrid fields={CONTACT_FIELDS} answers={answers} errors={errors} onChange={setAnswer} />
                  </>
                )}

                {step === 1 && (
                  <>
                    <StepHeading
                      headingRef={headingRef}
                      title="How do you want to work together?"
                      lede="Pick the one that fits best. The questions change based on your answer."
                    />
                    <div
                      role="radiogroup"
                      aria-label="How you want to collaborate"
                      aria-invalid={errors.category ? true : undefined}
                      aria-describedby={errors.category ? "collab-category-error" : undefined}
                      data-field="category"
                      className="grid gap-3 sm:grid-cols-2"
                    >
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const on = category === cat.id;
                        return (
                          <label
                            key={cat.id}
                            className="choice has-focus-visible:ring-[3px] has-focus-visible:ring-brand/40"
                          >
                            <input
                              type="radio"
                              name="category"
                              value={cat.id}
                              checked={on}
                              onChange={() => {
                                setCategory(cat.id);
                                setErrors({});
                              }}
                              className="peer sr-only"
                              aria-invalid={errors.category ? true : undefined}
                              aria-describedby={errors.category ? "collab-category-error" : undefined}
                            />
                            <span
                              aria-hidden="true"
                              className={cn(
                                "flex size-11 shrink-0 items-center justify-center rounded-2xl text-white transition-colors",
                                on ? "bg-brand" : "bg-navy",
                              )}
                            >
                              <Icon className="size-5" strokeWidth={1.75} />
                            </span>
                            <span className="min-w-0">
                              <span className="block font-display text-lg font-bold leading-tight text-navy">
                                {cat.label}
                              </span>
                              <span className="mt-1 block text-sm leading-snug text-ink-soft">
                                {cat.description}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <FieldError id="collab-category-error" message={errors.category} />
                  </>
                )}

                {step === 2 && current && (
                  <>
                    <StepHeading headingRef={headingRef} title={current.label} />
                    <div className="rounded-2xl bg-paper p-6 sm:p-7">
                      <div className="flex items-center gap-3">
                        <img
                          src="/media-kit/assets/josh-moore-headshot-close.png"
                          alt=""
                          width={48}
                          height={48}
                          loading="lazy"
                          className="size-12 shrink-0 rounded-full object-cover shadow-card"
                        />
                        <div>
                          <p className="font-semibold leading-tight text-navy">Josh Moore</p>
                          <p className="mt-0.5 text-sm text-ink-muted">A quick note before the questions</p>
                        </div>
                      </div>
                      <p className="mt-5 text-lg leading-relaxed text-ink">{current.intro}</p>
                    </div>
                  </>
                )}

                {step === 3 && current && (
                  <>
                    <StepHeading
                      headingRef={headingRef}
                      title="About you"
                      lede="The more specific you are, the faster I can tell whether there's a fit."
                    />
                    <FieldGrid fields={categoryFields} answers={answers} errors={errors} onChange={setAnswer} />
                  </>
                )}

                {step === LAST_STEP && (
                  <>
                    <StepHeading
                      headingRef={headingRef}
                      title="Almost done."
                      lede="A couple more things and you're in."
                    />
                    <FieldGrid fields={FINAL_FIELDS} answers={answers} errors={errors} onChange={setAnswer} />
                    <div className="mt-6 space-y-3">
                      <CheckRow
                        id="collab-consent"
                        name="consent"
                        required
                        checked={consent}
                        onChange={(v) => {
                          setConsent(v);
                          if (v) clearConsentError();
                        }}
                        error={errors.consent}
                      >
                        I confirm this information is accurate to the best of my knowledge.
                      </CheckRow>
                      <CheckRow id="collab-sms" name="smsConsent" checked={smsConsent} onChange={setSmsConsent}>
                        <span className="font-medium">Text me about this.</span> I agree to receive text
                        messages from Josh Moore about my submission. Message frequency varies. Message and
                        data rates may apply. Reply STOP to opt out, HELP for help.
                      </CheckRow>
                    </div>
                  </>
                )}

                {submitError && (
                  <p
                    className="field-error mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
                    role="alert"
                  >
                    {submitError}
                    {submitError === GENERIC_ERROR && (
                      <>
                        {" "}
                        <Link href="/contact" className="font-semibold underline underline-offset-4">
                          Contact page
                        </Link>
                      </>
                    )}
                  </p>
                )}

                {/* Back and Next. Back never validates. */}
                <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
                  {step > 0 ? (
                    <Button type="button" variant="outline" onClick={back} disabled={submitting}>
                      <ArrowLeft />
                      Back
                    </Button>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  {step < LAST_STEP ? (
                    <Button type="submit">
                      {step === 2 ? "Get started" : "Next"}
                      <ArrowRight />
                    </Button>
                  ) : (
                    <Button type="submit" variant="brand" disabled={submitting}>
                      {submitting ? "Sending..." : "Submit"}
                      {!submitting && <ArrowRight />}
                    </Button>
                  )}
                </div>

                {step === LAST_STEP && (
                  <div className="mt-5 space-y-2 text-ink-muted">
                    <p className="text-sm">
                      By submitting you agree to the{" "}
                      <Link
                        href="/privacy"
                        className="font-medium text-navy underline underline-offset-4 hover:text-brand-600"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                    <p className="text-xs leading-relaxed">
                      Nothing on this page is an offer to sell, or a solicitation of an offer to buy, any
                      security or investment.
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </Reveal>
      </Section>

      <CtaBand
        title="Have a property instead?"
        lede="If you own it or have it under contract, the deal form is the fastest way to get it in front of me."
        primaryHref="/submit-deal"
        primaryLabel="Submit a deal"
        secondaryHref="/contact"
        secondaryLabel="Get in touch"
      />
    </SiteLayout>
  );
}
