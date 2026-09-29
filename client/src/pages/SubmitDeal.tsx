import { useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Factory,
  Home as HomeIcon,
  Tent,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand, PageHero, Reveal, Section, SiteLayout } from "@/components/site";
import { cn } from "@/lib/utils";
import { useRouteSeo } from "@/hooks/useSeo";

type Asset = "sfh" | "mf" | "mhp" | "rv" | "";
type Step = 0 | 1 | 2 | 3;
type Option = { value: string; label: string; help?: string };
type Errors = Record<string, string>;

const STEP_NAMES = ["About you", "Property type", "Deal details", "Final step"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const YES_NO: Option[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];
const YES_NO_IDK: Option[] = [...YES_NO, { value: "idk", label: "I don't know" }];
const YES_NO_UNSURE: Option[] = [...YES_NO, { value: "unsure", label: "Not sure" }];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_OPTIONS: Option[] = MONTHS.map((m) => ({ value: m, label: m }));

const PROPERTY_TYPES: { value: Asset; icon: LucideIcon; name: string; desc: string }[] = [
  { value: "sfh", icon: HomeIcon, name: "Single family", desc: "House, townhome or condo" },
  { value: "mf", icon: Building2, name: "Multifamily", desc: "Duplex through large apartment" },
  { value: "mhp", icon: Factory, name: "Mobile home park", desc: "MHP or land-lease community" },
  { value: "rv", icon: Tent, name: "RV park / campground", desc: "RV, campground or glamping" },
];

const NEXT_STEPS = [
  {
    title: "You send the property",
    text: "Address, price, condition and whatever numbers you have. Rough is fine. I can work with an honest guess.",
  },
  {
    title: "I run it myself",
    text: "I read every submission and run the numbers within 24 to 48 hours.",
  },
  {
    title: "You hear back",
    text: "If it's a fit, I reach out with an offer or the terms that would make it work.",
  },
];

// ── Form primitives ──────────────────────────────────────────────────────────
// Every control uses the site's field, field-label, field-help, field-error,
// pill and choice utilities so the deal form matches every other form.

function Mark({ required, optional }: { required?: boolean; optional?: boolean }) {
  if (required) {
    return (
      <span aria-hidden="true" className="ml-1 text-destructive">
        *
      </span>
    );
  }
  if (optional) {
    return (
      <span className="ml-1.5 font-normal normal-case tracking-normal text-ink-muted">(optional)</span>
    );
  }
  return null;
}

function Hint({ id, help, error }: { id: string; help?: string; error?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="field-error" role="alert">
        {error}
      </p>
    );
  }
  if (help) {
    return (
      <p id={`${id}-help`} className="field-help">
        {help}
      </p>
    );
  }
  return null;
}

function describedBy(id: string, help?: string, error?: string) {
  if (error) return `${id}-error`;
  if (help) return `${id}-help`;
  return undefined;
}

type ControlProps = {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  help?: string;
  error?: string;
};

function TextField({
  id,
  label,
  required,
  optional,
  help,
  error,
  value,
  onChange,
  type = "text",
  placeholder,
  inputMode,
  autoComplete,
}: ControlProps & {
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email" | "tel" | "number" | "date";
  placeholder?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email";
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        <Mark required={required} optional={optional} />
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className="field"
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        onChange={(e) => onChange(e.target.value)}
      />
      <Hint id={id} help={help} error={error} />
    </div>
  );
}

function SelectField({
  id,
  label,
  required,
  optional,
  help,
  error,
  value,
  onChange,
  options,
  placeholder = "Select",
}: ControlProps & {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        <Mark required={required} optional={optional} />
      </label>
      <div className="relative">
        <select
          id={id}
          name={id}
          className="field appearance-none pr-11"
          value={value}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, help, error)}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        />
      </div>
      <Hint id={id} help={help} error={error} />
    </div>
  );
}

function TextAreaField({
  id,
  label,
  required,
  optional,
  help,
  error,
  value,
  onChange,
  placeholder,
}: ControlProps & { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        <Mark required={required} optional={optional} />
      </label>
      <textarea
        id={id}
        name={id}
        rows={4}
        className="field min-h-28 resize-y"
        value={value}
        placeholder={placeholder}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        onChange={(e) => onChange(e.target.value)}
      />
      <Hint id={id} help={help} error={error} />
    </div>
  );
}

/** Single choice as radio tiles. The `choice` utility styles :has(input:checked). */
function RadioTiles({
  id,
  label,
  required,
  optional,
  help,
  error,
  value,
  onChange,
  options,
  columns = "auto",
}: ControlProps & {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  columns?: "auto" | 2 | 3;
}) {
  return (
    <fieldset className="min-w-0" aria-describedby={describedBy(id, help, error)}>
      <legend className="field-label">
        {label}
        <Mark required={required} optional={optional} />
      </legend>
      <div
        className={cn(
          "grid gap-2.5",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
          columns === "auto" && "sm:flex sm:flex-wrap",
        )}
      >
        {options.map((o) => (
          <label key={o.value} className={cn("choice", columns === "auto" && "sm:w-auto sm:min-w-36")}>
            <input
              type="radio"
              name={id}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-navy/30 bg-white transition-colors peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/30"
            >
              <span className="size-2 rounded-full bg-white" />
            </span>
            <span className="text-[15px] font-medium leading-snug">
              {o.label}
              {o.help && <span className="mt-0.5 block text-sm font-normal text-ink-muted">{o.help}</span>}
            </span>
          </label>
        ))}
      </div>
      <Hint id={id} help={help} error={error} />
    </fieldset>
  );
}

/** Multi-select for longer options, as checkbox tiles. */
function CheckTiles({
  id,
  label,
  optional,
  help,
  options,
  selected,
  onChange,
}: {
  id: string;
  label: string;
  optional?: boolean;
  help?: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <fieldset className="min-w-0" aria-describedby={describedBy(id, help)}>
      <legend className="field-label">
        {label}
        <Mark optional={optional} />
      </legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o} className="choice">
            <input
              type="checkbox"
              name={id}
              value={o}
              checked={selected.includes(o)}
              onChange={() => toggle(o)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-navy/30 bg-white text-white transition-colors peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/30"
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <span className="text-[15px] font-medium leading-snug">{o}</span>
          </label>
        ))}
      </div>
      <Hint id={id} help={help} />
    </fieldset>
  );
}

/** Multi-select for short options, as pills. */
function Pills({
  label,
  optional,
  options,
  selected,
  onChange,
}: {
  label: string;
  optional?: boolean;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <fieldset className="min-w-0">
      <legend className="field-label">
        {label}
        <Mark optional={optional} />
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            className="pill"
            aria-pressed={selected.includes(o)}
            onClick={() => toggle(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** One checkbox with a sentence next to it, for consent lines. */
function ConsentBox({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="choice">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-navy/30 bg-white text-white transition-colors peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/30"
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
        <span className="text-[15px] leading-relaxed text-ink">{children}</span>
      </label>
      <Hint id={id} error={error} />
    </div>
  );
}

/** A paper inset for questions that only appear after an answer. */
function Subsection({ show = true, title, children }: { show?: boolean; title?: string; children: ReactNode }) {
  if (!show) return null;
  return (
    <div className="rounded-2xl border border-line bg-paper p-5 sm:p-6">
      {title && <p className="eyebrow mb-4">{title}</p>}
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Divider() {
  return <hr className="border-line" />;
}

function Pair({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

function StepHeading({ step, title, lede }: { step: Step; title: ReactNode; lede?: string }) {
  return (
    <div className="mb-8 border-b border-line pb-6">
      <p className="eyebrow eyebrow-line mb-3">
        Step {step + 1} of {STEP_NAMES.length}
      </p>
      <h2 className="text-2xl text-navy md:text-3xl">{title}</h2>
      {lede && <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{lede}</p>}
    </div>
  );
}

/** Back never validates. Next and Submit are the form's submit button. */
function StepNav({
  onBack,
  nextLabel = "Next",
  submit = false,
  busy = false,
}: {
  onBack?: () => void;
  nextLabel?: string;
  submit?: boolean;
  busy?: boolean;
}) {
  return (
    <div className="mt-9 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={onBack} disabled={busy}>
          <ArrowLeft />
          Back
        </Button>
      ) : (
        <span className="hidden sm:block" />
      )}
      <Button type="submit" variant={submit ? "brand" : "default"} size="lg" className="w-full sm:w-auto" disabled={busy}>
        {nextLabel}
        <ArrowRight />
      </Button>
    </div>
  );
}

function Progress({ step }: { step: Step }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between text-sm">
        <span className="font-semibold text-navy">
          Step {step + 1} of {STEP_NAMES.length}
        </span>
        <span className="text-ink-muted">{STEP_NAMES[step]}</span>
      </div>
      <ol className="grid grid-cols-4 gap-2" aria-label="Progress">
        {STEP_NAMES.map((name, i) => (
          <li key={name} aria-current={i === step ? "step" : undefined}>
            <span
              className={cn(
                "block h-1.5 rounded-full transition-colors duration-300",
                i <= step ? "bg-brand" : "bg-line",
              )}
            />
            <span
              className={cn(
                "mt-2 hidden text-[11px] font-semibold uppercase tracking-[0.12em] sm:block",
                i === step ? "text-navy" : "text-ink-muted",
              )}
            >
              {name}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function NextSteps() {
  return (
    <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.06] p-6 sm:p-8">
      <p className="eyebrow text-brand-100">What happens next</p>
      <ol className="mt-5 space-y-5">
        {NEXT_STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/25 font-display text-sm font-bold text-brand-100">
              {i + 1}
            </span>
            <div>
              <p className="font-semibold text-white">{s.title}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-white/70">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SubmitDeal() {
  useRouteSeo("/submit-deal");

  const topRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Bot checks. The honeypot stays empty for people; started_at lets the
  // server drop anything posted within a few seconds of the page loading.
  const [startedAt] = useState(() => Date.now());
  const [honeypot, setHoneypot] = useState("");

  // Step 1: about you
  const [isOwner, setIsOwner] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPref, setContactPref] = useState("");

  // Step 2: property type
  const [asset, setAsset] = useState<Asset>("");

  // Step 3: single family
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

  // Step 3: multifamily
  const [mfAddr, setMfAddr] = useState("");
  const [mfPrice, setMfPrice] = useState("");
  const [mfUnits, setMfUnits] = useState("");
  // 2 to 4 units
  const [mf24Occ, setMf24Occ] = useState("");
  const [mf24Rents, setMf24Rents] = useState("");
  const [mf24Cond, setMf24Cond] = useState("");
  const [mf24Mort, setMf24Mort] = useState("");
  const [mf24MortBal, setMf24MortBal] = useState("");
  const [mf24MortRate, setMf24MortRate] = useState("");
  const [mf24Assume, setMf24Assume] = useState("");
  const [mf24Cf, setMf24Cf] = useState("");
  // 5 to 19 units
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
  // 20+ units
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

  // Step 3: mobile home park
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

  // Step 3: RV park / campground
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

  // Step 4: final
  const [notes, setNotes] = useState("");
  const [hearAbout, setHearAbout] = useState("");
  const [referralFee, setReferralFee] = useState("");
  const [dealStatus, setDealStatus] = useState("");
  const [consent, setConsent] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);

  const isWholesaler = isOwner === "no";
  const mfUnitCount = parseInt(mfUnits, 10) || 0;
  const mfIs24 = mfUnitCount >= 2 && mfUnitCount <= 4;
  const mfIs5 = mfUnitCount >= 5 && mfUnitCount <= 19;
  const mfIs20 = mfUnitCount >= 20;

  function clearErr(key: string) {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  /** Wrap a setter so typing in a field clears its error as you go. */
  function bind<T>(setter: (v: T) => void, key: string) {
    return (v: T) => {
      setter(v);
      clearErr(key);
    };
  }

  // Every required marker on the form has a matching rule here, and nothing
  // is checked that is not marked. The server repeats the checks that matter.
  function validateStep(s: Step): Errors {
    const e: Errors = {};

    if (s === 0) {
      if (!isOwner) e.isOwner = "Let me know whether you own the property.";
      if (!name.trim()) e.name = "Please enter your name.";
      if (!EMAIL_RE.test(email.trim())) e.email = "Please enter a valid email address.";
      if (phone.replace(/\D/g, "").length < 10) e.phone = "Please enter a phone number with the area code.";
    }

    if (s === 1 && !asset) e.asset = "Pick the property type that fits best.";

    if (s === 2) {
      if (asset === "sfh") {
        if (!sfhAddr.trim()) e.sfhAddr = "Please enter the property address.";
        if (!sfhPrice.trim()) e.sfhPrice = "Please enter the asking price.";
        if (!sfhBeds) e.sfhBeds = "Please pick the number of bedrooms.";
        if (!sfhBaths) e.sfhBaths = "Please pick the number of bathrooms.";
        if (!sfhCond) e.sfhCond = "Please pick the condition.";
        if (isWholesaler && !sfhArv.trim()) e.sfhArv = "Wholesalers and agents need to include an ARV.";
        if (isWholesaler && !sfhMort) e.sfhMort = "Wholesalers and agents need to answer this one.";
      }
      if (asset === "mf") {
        if (!mfAddr.trim()) e.mfAddr = "Please enter the property address.";
        if (!mfPrice.trim()) e.mfPrice = "Please enter the asking price.";
        if (!mfUnits.trim() || mfUnitCount < 2) e.mfUnits = "Please enter the total number of units (2 or more).";
        if (mfIs5) {
          if (!mf5Occ.trim()) e.mf5Occ = "Please enter the occupancy percentage.";
          if (!mf5Rents.trim()) e.mf5Rents = "Please enter the gross monthly rents.";
        }
        if (mfIs20) {
          if (!mf20Occ.trim()) e.mf20Occ = "Please enter the occupancy percentage.";
          if (!mf20Rents.trim()) e.mf20Rents = "Please enter the gross monthly rents.";
          if (!mf20Mort) e.mf20Mort = "Please answer whether there is an existing mortgage.";
        }
      }
      if (asset === "mhp") {
        if (!mhpAddr.trim()) e.mhpAddr = "Please enter the property address.";
        if (!mhpPrice.trim()) e.mhpPrice = "Please enter the asking price.";
        if (!mhpLots.trim()) e.mhpLots = "Please enter the total number of lots.";
        if (!mhpOcc.trim()) e.mhpOcc = "Please enter the occupied lots or occupancy.";
        if (!mhpWater) e.mhpWater = "Please pick the water and sewer type.";
        if (!mhpPoh) e.mhpPoh = "Please pick the home ownership type.";
        if (isWholesaler && !mhpInc.trim()) e.mhpInc = "Wholesalers and agents need to include the gross monthly income.";
      }
      if (asset === "rv") {
        if (!rvAddr.trim()) e.rvAddr = "Please enter the property address.";
        if (!rvPrice.trim()) e.rvPrice = "Please enter the asking price.";
        if (!rvSites.trim()) e.rvSites = "Please enter the total number of sites.";
        if (!rvSeason) e.rvSeason = "Please pick seasonal or year-round.";
        if (rvSeason === "seasonal") {
          if (!rvSeasonOpen) e.rvSeasonOpen = "Please pick the month the season opens.";
          if (!rvSeasonClose) e.rvSeasonClose = "Please pick the month the season closes.";
        }
        if (rvSeason === "yearround" && !rvYrOcc.trim()) e.rvYrOcc = "Please enter the current occupancy.";
        if (isWholesaler && !rvRev.trim()) e.rvRev = "Wholesalers and agents need to include the gross annual revenue.";
        if (isWholesaler && !rvMort) e.rvMort = "Wholesalers and agents need to answer this one.";
      }
    }

    if (s === 3 && !consent) e.consent = "Please confirm the information is accurate before submitting.";

    return e;
  }

  function scrollToTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function next() {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep((step + 1) as Step);
    scrollToTop();
  }

  function back() {
    setErrors({});
    setSubmitError("");
    setStep((step - 1) as Step);
    scrollToTop();
  }

  function buildPayload(): Record<string, unknown> {
    const propertyTypeMap: Record<string, string> = {
      sfh: "sfr",
      mf: "multifamily",
      mhp: "mhp",
      rv: "rv_park",
    };

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ");

    const payload: Record<string, unknown> = {
      propertyType: propertyTypeMap[asset] || asset,
      submitterRole: isOwner === "yes" ? "owner" : role || "wholesaler",
      isOwner: isOwner === "yes",
      firstName,
      lastName,
      email: email.trim(),
      phone: phone.trim(),
      preferredContact: contactPref,
      additionalNotes: notes,
      howHeard: hearAbout,
      consent,
      smsConsent,
      company_website: honeypot,
      started_at: startedAt,
    };

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
      Object.assign(payload, {
        propertyAddress: mfAddr,
        askingPrice: mfPrice,
        unitCount: mfUnits,
        assignmentFee: referralFee,
        dealStatus,
        ...(mfIs24
          ? {
              occupancyStatus: mf24Occ,
              grossRents: mf24Rents,
              condition: mf24Cond,
              hasMortgage: mf24Mort,
              mortgageBalance: mf24MortBal,
              mortgageRate: mf24MortRate,
              assumable: mf24Assume,
              creativeFinancing: mf24Cf,
            }
          : mfIs5
            ? {
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
              }
            : {
                occupancyStatus: mf20Occ,
                grossRents: mf20Rents,
                hasMortgage: mf20Mort,
                mortgageBalance: mf20MortBal,
                mortgageRate: mf20MortRate,
                assumable: mf20Assume,
                currentNoi: mf20Noi,
                capRate: mf20Cap,
                t12Available: mf20T12,
                sellerFinancing: mf20Sf,
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
        sellerFinancing: mhpSf,
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
        sellerFinancing: rvSf,
        assignmentFee: referralFee,
        dealStatus,
      });
    }

    return payload;
  }

  async function submit() {
    const e = validateStep(3);
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/submit-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const body: { error?: unknown } = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.error === "string" && body.error
            ? body.error
            : "Something went wrong sending your deal. Please try again.",
        );
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong sending your deal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (step < 3) next();
    else void submit();
  }

  if (submitted) {
    return (
      <SiteLayout>
        <Section tone="paper" className="dots-paper flex min-h-[60vh] items-center">
          <Reveal className="mx-auto max-w-xl">
            <div className="surface p-8 text-center sm:p-12">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-navy text-white">
                <Check className="size-8" strokeWidth={2.5} />
              </span>
              <h1 className="display-md mt-7 text-navy">Deal received.</h1>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                I review every submission and will reach out within 24 to 48 hours if it's a fit.
                Thanks for sending it over.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/">
                    Back to home
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/buy-box">See my buy box</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHero
        tone="navy"
        eyebrow="Submit a deal"
        title={
          <>
            Submit your <span className="text-brand">deal</span>.
          </>
        }
        lede="Four short steps: who you are, what the property is, the numbers you have, and anything else I should know. I review every submission within 24 to 48 hours."
        aside={<NextSteps />}
      />

      <Section tone="paper" className="dots-paper">
        <div ref={topRef} className="mx-auto max-w-3xl scroll-mt-24">
          <Progress step={step} />

          <Reveal delay={0.05}>
            <form noValidate onSubmit={onSubmit} className="surface relative mt-6 p-5 sm:p-8 md:p-10">
              {/* Honeypot. Off screen, out of the tab order, and left empty by people. */}
              <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
                <label htmlFor="company_website">Company website</label>
                <input
                  id="company_website"
                  name="company_website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Step 1: about you */}
              {step === 0 && (
                <>
                  <StepHeading step={0} title="About you" lede="Who I'm talking to and the best way to reach you." />
                  <div className="space-y-6">
                    <RadioTiles
                      id="isOwner"
                      label="Are you the property owner?"
                      required
                      columns={2}
                      value={isOwner}
                      onChange={bind(setIsOwner, "isOwner")}
                      error={errors.isOwner}
                      options={[
                        { value: "yes", label: "Yes, I own it" },
                        { value: "no", label: "No, I'm a wholesaler / agent / bird dog" },
                      ]}
                    />

                    <Subsection show={isWholesaler} title="Your role">
                      <RadioTiles
                        id="role"
                        label="Which fits best?"
                        optional
                        columns={2}
                        value={role}
                        onChange={setRole}
                        options={[
                          { value: "birddog", label: "Bird dog" },
                          { value: "wholesaler", label: "Wholesaler / investor" },
                          { value: "agent", label: "Agent / broker" },
                          { value: "other", label: "Other" },
                        ]}
                      />
                    </Subsection>

                    <Divider />

                    <TextField
                      id="name"
                      label="Full name"
                      required
                      autoComplete="name"
                      placeholder="Jane Smith"
                      value={name}
                      onChange={bind(setName, "name")}
                      error={errors.name}
                    />

                    <Pair>
                      <TextField
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        label="Email"
                        required
                        placeholder="jane@email.com"
                        value={email}
                        onChange={bind(setEmail, "email")}
                        error={errors.email}
                      />
                      <TextField
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        label="Phone"
                        required
                        placeholder="(616) 555-0100"
                        value={phone}
                        onChange={bind(setPhone, "phone")}
                        error={errors.phone}
                      />
                    </Pair>

                    <RadioTiles
                      id="contactPref"
                      label="Preferred contact method"
                      optional
                      columns={3}
                      value={contactPref}
                      onChange={setContactPref}
                      options={[
                        { value: "call", label: "Call" },
                        { value: "text", label: "Text" },
                        { value: "email", label: "Email" },
                      ]}
                    />
                  </div>
                  <StepNav />
                </>
              )}

              {/* Step 2: property type */}
              {step === 1 && (
                <>
                  <StepHeading
                    step={1}
                    title="Property type"
                    lede="Pick the one that fits best. If it's in between, pick the closest and explain in the notes at the end."
                  />
                  <fieldset className="min-w-0" aria-describedby={errors.asset ? "asset-error" : undefined}>
                    <legend className="sr-only">Property type</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {PROPERTY_TYPES.map((t) => {
                        const Icon = t.icon;
                        return (
                          <label key={t.value} className="choice items-center gap-4 p-5">
                            <input
                              type="radio"
                              name="asset"
                              value={t.value}
                              checked={asset === t.value}
                              onChange={() => {
                                setAsset(t.value);
                                clearErr("asset");
                              }}
                              className="peer sr-only"
                            />
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand/30">
                              <Icon className="size-6" strokeWidth={1.75} />
                            </span>
                            <span>
                              <span className="block font-display text-lg font-semibold leading-tight text-navy">
                                {t.name}
                              </span>
                              <span className="mt-1 block text-sm text-ink-muted">{t.desc}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <Hint id="asset" error={errors.asset} />
                  </fieldset>
                  <StepNav onBack={back} />
                </>
              )}

              {/* Step 3: deal details */}
              {step === 2 && (
                <>
                  {asset === "sfh" && (
                    <>
                      <StepHeading
                        step={2}
                        title="Single family details"
                        lede="The basics first, then condition, occupancy and financing. Skip what you don't know."
                      />
                      <div className="space-y-6">
                        <TextField
                          id="sfhAddr"
                          label="Property address"
                          required
                          autoComplete="street-address"
                          placeholder="123 Main St, Grand Haven, MI 49417"
                          value={sfhAddr}
                          onChange={bind(setSfhAddr, "sfhAddr")}
                          error={errors.sfhAddr}
                        />

                        <Pair>
                          <TextField
                            id="sfhPrice"
                            label="Asking price"
                            required
                            inputMode="decimal"
                            placeholder="$120,000"
                            value={sfhPrice}
                            onChange={bind(setSfhPrice, "sfhPrice")}
                            error={errors.sfhPrice}
                          />
                          <TextField
                            id="sfhArv"
                            label="Estimated ARV"
                            required={isWholesaler}
                            optional={!isWholesaler}
                            inputMode="decimal"
                            placeholder="$185,000"
                            help="What's it worth fully fixed up?"
                            value={sfhArv}
                            onChange={bind(setSfhArv, "sfhArv")}
                            error={errors.sfhArv}
                          />
                        </Pair>

                        <Pair>
                          <SelectField
                            id="sfhBeds"
                            label="Bedrooms"
                            required
                            value={sfhBeds}
                            onChange={bind(setSfhBeds, "sfhBeds")}
                            error={errors.sfhBeds}
                            options={["1", "2", "3", "4", "5+"].map((v) => ({ value: v, label: v }))}
                          />
                          <SelectField
                            id="sfhBaths"
                            label="Bathrooms"
                            required
                            value={sfhBaths}
                            onChange={bind(setSfhBaths, "sfhBaths")}
                            error={errors.sfhBaths}
                            options={["1", "1.5", "2", "2.5", "3+"].map((v) => ({ value: v, label: v }))}
                          />
                        </Pair>

                        <Pair>
                          <TextField
                            id="sfhSqft"
                            label="Square footage"
                            optional
                            placeholder="1,400 sqft / I don't know"
                            value={sfhSqft}
                            onChange={setSfhSqft}
                          />
                          <TextField
                            id="sfhYear"
                            label="Year built"
                            optional
                            placeholder="1978 / I don't know"
                            value={sfhYear}
                            onChange={setSfhYear}
                          />
                        </Pair>

                        <RadioTiles
                          id="sfhCond"
                          label="Property condition"
                          required
                          value={sfhCond}
                          onChange={bind(setSfhCond, "sfhCond")}
                          error={errors.sfhCond}
                          options={[
                            { value: "turnkey", label: "Turnkey" },
                            { value: "light", label: "Light updates" },
                            { value: "moderate", label: "Moderate rehab" },
                            { value: "full", label: "Full gut" },
                            { value: "tear", label: "Tear down" },
                          ]}
                        />

                        <Subsection show={["moderate", "full", "tear"].includes(sfhCond)} title="Repair details">
                          <TextField
                            id="sfhRepairCost"
                            label="Estimated repair cost"
                            optional
                            inputMode="decimal"
                            placeholder="$45,000 / I don't know yet"
                            value={sfhRepairCost}
                            onChange={setSfhRepairCost}
                          />
                          <TextAreaField
                            id="sfhRepairDesc"
                            label="Describe the repairs"
                            optional
                            placeholder="Roof, HVAC, kitchen and bath gut..."
                            value={sfhRepairDesc}
                            onChange={setSfhRepairDesc}
                          />
                        </Subsection>

                        <Divider />

                        <RadioTiles
                          id="sfhOcc"
                          label="Occupancy status"
                          optional
                          value={sfhOcc}
                          onChange={setSfhOcc}
                          options={[
                            { value: "vacant", label: "Vacant" },
                            { value: "owner", label: "Owner occupied" },
                            { value: "tenant", label: "Tenant occupied" },
                            { value: "idk", label: "I don't know" },
                          ]}
                        />

                        <Subsection show={sfhOcc === "tenant"} title="Tenant info">
                          <Pair>
                            <TextField
                              id="sfhRent"
                              label="Monthly rent"
                              optional
                              inputMode="decimal"
                              placeholder="$1,100 / I don't know"
                              value={sfhRent}
                              onChange={setSfhRent}
                            />
                            <SelectField
                              id="sfhLease"
                              label="Lease status"
                              optional
                              placeholder="Select or skip"
                              value={sfhLease}
                              onChange={setSfhLease}
                              options={[
                                { value: "mtm", label: "Month to month" },
                                { value: "fixed", label: "Fixed term" },
                                { value: "idk", label: "I don't know" },
                              ]}
                            />
                          </Pair>
                          {sfhLease === "fixed" && (
                            <TextField
                              id="sfhLeaseExp"
                              label="Lease expiration"
                              optional
                              type="date"
                              value={sfhLeaseExp}
                              onChange={setSfhLeaseExp}
                            />
                          )}
                        </Subsection>

                        <Divider />

                        <RadioTiles
                          id="sfhMort"
                          label="Existing mortgage?"
                          required={isWholesaler}
                          optional={!isWholesaler}
                          columns={3}
                          value={sfhMort}
                          onChange={bind(setSfhMort, "sfhMort")}
                          error={errors.sfhMort}
                          options={YES_NO_IDK}
                        />

                        <Subsection show={sfhMort === "yes"} title="Mortgage details">
                          <Pair>
                            <TextField
                              id="sfhMortBal"
                              label="Approximate balance"
                              optional
                              inputMode="decimal"
                              placeholder="$78,000 / I don't know"
                              value={sfhMortBal}
                              onChange={setSfhMortBal}
                            />
                            <TextField
                              id="sfhMortRate"
                              label="Interest rate"
                              optional
                              inputMode="decimal"
                              placeholder="3.5% / I don't know"
                              value={sfhMortRate}
                              onChange={setSfhMortRate}
                            />
                          </Pair>
                          <TextField
                            id="sfhMortPmt"
                            label="Monthly payment"
                            optional
                            inputMode="decimal"
                            placeholder="$610 / I don't know"
                            value={sfhMortPmt}
                            onChange={setSfhMortPmt}
                          />
                        </Subsection>

                        <RadioTiles
                          id="sfhCf"
                          label="Open to creative financing?"
                          optional
                          columns={3}
                          value={sfhCf}
                          onChange={setSfhCf}
                          options={YES_NO_UNSURE}
                        />

                        <Subsection show={["yes", "unsure"].includes(sfhCf)} title="Creative finance options">
                          <CheckTiles
                            id="sfhCfOptions"
                            label="Check all that apply"
                            optional
                            options={[
                              "Subject-To (buyer takes over existing mortgage)",
                              "Seller Financing (you hold the note)",
                              "Lease Option",
                              "Other",
                            ]}
                            selected={sfhCfOptions}
                            onChange={setSfhCfOptions}
                          />
                        </Subsection>

                        <Divider />

                        <Pills
                          label="Seller motivation, pick all that apply"
                          optional
                          options={[
                            "Divorce / Separation",
                            "Probate / Estate",
                            "Financial Hardship",
                            "Relocating",
                            "Tired Landlord",
                            "Downsizing",
                            "Pre-Foreclosure",
                            "Code Violations",
                            "Health / Life Change",
                            "Just Want to Sell Fast",
                          ]}
                          selected={sfhMotivation}
                          onChange={setSfhMotivation}
                        />
                      </div>
                    </>
                  )}

                  {asset === "mf" && (
                    <>
                      <StepHeading
                        step={2}
                        title="Multifamily details"
                        lede="Enter the unit count and the right questions for that size will appear."
                      />
                      <div className="space-y-6">
                        <TextField
                          id="mfAddr"
                          label="Property address"
                          required
                          autoComplete="street-address"
                          placeholder="123 Main St, City, State ZIP"
                          value={mfAddr}
                          onChange={bind(setMfAddr, "mfAddr")}
                          error={errors.mfAddr}
                        />

                        <Pair>
                          <TextField
                            id="mfPrice"
                            label="Asking price"
                            required
                            inputMode="decimal"
                            placeholder="$850,000"
                            value={mfPrice}
                            onChange={bind(setMfPrice, "mfPrice")}
                            error={errors.mfPrice}
                          />
                          <TextField
                            id="mfUnits"
                            label="Total units"
                            required
                            type="number"
                            inputMode="numeric"
                            placeholder="24"
                            value={mfUnits}
                            onChange={bind(setMfUnits, "mfUnits")}
                            error={errors.mfUnits}
                          />
                        </Pair>

                        <Subsection show={mfIs24} title="Small multifamily (2 to 4 units)">
                          <RadioTiles
                            id="mf24Occ"
                            label="Occupancy"
                            optional
                            value={mf24Occ}
                            onChange={setMf24Occ}
                            options={[
                              { value: "vacant", label: "Vacant" },
                              { value: "partial", label: "Partial" },
                              { value: "full", label: "Fully occupied" },
                              { value: "idk", label: "I don't know" },
                            ]}
                          />
                          <TextField
                            id="mf24Rents"
                            label="Gross monthly rents"
                            optional
                            inputMode="decimal"
                            placeholder="$3,200 / I don't know"
                            value={mf24Rents}
                            onChange={setMf24Rents}
                          />
                          <SelectField
                            id="mf24Cond"
                            label="Property condition"
                            optional
                            placeholder="Select or skip"
                            value={mf24Cond}
                            onChange={setMf24Cond}
                            options={[
                              { value: "turnkey", label: "Turnkey" },
                              { value: "light", label: "Light updates" },
                              { value: "moderate", label: "Moderate rehab" },
                              { value: "full", label: "Full gut" },
                              { value: "idk", label: "I don't know" },
                            ]}
                          />
                          <RadioTiles
                            id="mf24Mort"
                            label="Existing mortgage?"
                            optional
                            columns={3}
                            value={mf24Mort}
                            onChange={setMf24Mort}
                            options={YES_NO_IDK}
                          />
                          {mf24Mort === "yes" && (
                            <>
                              <Pair>
                                <TextField
                                  id="mf24MortBal"
                                  label="Balance"
                                  optional
                                  inputMode="decimal"
                                  placeholder="$320,000 / I don't know"
                                  value={mf24MortBal}
                                  onChange={setMf24MortBal}
                                />
                                <TextField
                                  id="mf24MortRate"
                                  label="Rate"
                                  optional
                                  inputMode="decimal"
                                  placeholder="5% / I don't know"
                                  value={mf24MortRate}
                                  onChange={setMf24MortRate}
                                />
                              </Pair>
                              <RadioTiles
                                id="mf24Assume"
                                label="Assumable?"
                                optional
                                columns={3}
                                value={mf24Assume}
                                onChange={setMf24Assume}
                                options={YES_NO_IDK}
                              />
                            </>
                          )}
                          <RadioTiles
                            id="mf24Cf"
                            label="Open to creative finance?"
                            optional
                            columns={3}
                            value={mf24Cf}
                            onChange={setMf24Cf}
                            options={YES_NO_UNSURE}
                          />
                        </Subsection>

                        <Subsection show={mfIs5} title="Midsize commercial (5 to 19 units)">
                          <Pair>
                            <TextField
                              id="mf5Occ"
                              label="Occupancy %"
                              required
                              inputMode="decimal"
                              placeholder="85"
                              value={mf5Occ}
                              onChange={bind(setMf5Occ, "mf5Occ")}
                              error={errors.mf5Occ}
                            />
                            <TextField
                              id="mf5Rents"
                              label="Gross monthly rents"
                              required
                              inputMode="decimal"
                              placeholder="$14,500"
                              value={mf5Rents}
                              onChange={bind(setMf5Rents, "mf5Rents")}
                              error={errors.mf5Rents}
                            />
                          </Pair>
                          <TextField
                            id="mf5Noi"
                            label="NOI"
                            optional
                            inputMode="decimal"
                            placeholder="$8,200 / I don't know"
                            value={mf5Noi}
                            onChange={setMf5Noi}
                          />
                          <Pair>
                            <TextField
                              id="mf5Year"
                              label="Year built"
                              optional
                              placeholder="1988 / I don't know"
                              value={mf5Year}
                              onChange={setMf5Year}
                            />
                            <SelectField
                              id="mf5Cond"
                              label="Condition"
                              optional
                              placeholder="Select or skip"
                              value={mf5Cond}
                              onChange={setMf5Cond}
                              options={[
                                { value: "turnkey", label: "Turnkey" },
                                { value: "light", label: "Light updates" },
                                { value: "moderate", label: "Moderate rehab" },
                                { value: "value-add", label: "Significant value-add" },
                                { value: "idk", label: "I don't know" },
                              ]}
                            />
                          </Pair>
                          <RadioTiles
                            id="mf5Mort"
                            label="Existing mortgage?"
                            optional
                            columns={3}
                            value={mf5Mort}
                            onChange={setMf5Mort}
                            options={YES_NO_IDK}
                          />
                          {mf5Mort === "yes" && (
                            <>
                              <Pair>
                                <TextField
                                  id="mf5MortBal"
                                  label="Balance"
                                  optional
                                  inputMode="decimal"
                                  placeholder="$600,000 / I don't know"
                                  value={mf5MortBal}
                                  onChange={setMf5MortBal}
                                />
                                <TextField
                                  id="mf5MortRate"
                                  label="Rate"
                                  optional
                                  inputMode="decimal"
                                  placeholder="5.5% / I don't know"
                                  value={mf5MortRate}
                                  onChange={setMf5MortRate}
                                />
                              </Pair>
                              <RadioTiles
                                id="mf5Assume"
                                label="Assumable?"
                                optional
                                columns={3}
                                value={mf5Assume}
                                onChange={setMf5Assume}
                                options={YES_NO_IDK}
                              />
                            </>
                          )}
                          <TextAreaField
                            id="mf5T12"
                            label="T12 / rent roll notes"
                            optional
                            placeholder="Available on request, or a summary here..."
                            value={mf5T12}
                            onChange={setMf5T12}
                          />
                        </Subsection>

                        <Subsection show={mfIs20} title="Large commercial (20+ units)">
                          <Pair>
                            <TextField
                              id="mf20Occ"
                              label="Occupancy %"
                              required
                              inputMode="decimal"
                              placeholder="88"
                              value={mf20Occ}
                              onChange={bind(setMf20Occ, "mf20Occ")}
                              error={errors.mf20Occ}
                            />
                            <TextField
                              id="mf20Rents"
                              label="Gross monthly rents"
                              required
                              inputMode="decimal"
                              placeholder="$42,000"
                              value={mf20Rents}
                              onChange={bind(setMf20Rents, "mf20Rents")}
                              error={errors.mf20Rents}
                            />
                          </Pair>
                          <RadioTiles
                            id="mf20Mort"
                            label="Existing mortgage?"
                            required
                            columns={3}
                            value={mf20Mort}
                            onChange={bind(setMf20Mort, "mf20Mort")}
                            error={errors.mf20Mort}
                            options={YES_NO_IDK}
                          />
                          {mf20Mort === "yes" && (
                            <>
                              <Pair>
                                <TextField
                                  id="mf20MortBal"
                                  label="Balance"
                                  optional
                                  inputMode="decimal"
                                  placeholder="$2,100,000 / I don't know"
                                  value={mf20MortBal}
                                  onChange={setMf20MortBal}
                                />
                                <TextField
                                  id="mf20MortRate"
                                  label="Rate"
                                  optional
                                  inputMode="decimal"
                                  placeholder="5.75% / I don't know"
                                  value={mf20MortRate}
                                  onChange={setMf20MortRate}
                                />
                              </Pair>
                              <RadioTiles
                                id="mf20Assume"
                                label="Assumable?"
                                optional
                                columns={3}
                                value={mf20Assume}
                                onChange={setMf20Assume}
                                options={YES_NO_IDK}
                              />
                            </>
                          )}
                          <Pair>
                            <TextField
                              id="mf20Noi"
                              label="NOI"
                              optional
                              inputMode="decimal"
                              placeholder="$24,000 / I don't know"
                              value={mf20Noi}
                              onChange={setMf20Noi}
                            />
                            <TextField
                              id="mf20Cap"
                              label="Cap rate"
                              optional
                              inputMode="decimal"
                              placeholder="6.5% / I don't know"
                              value={mf20Cap}
                              onChange={setMf20Cap}
                            />
                          </Pair>
                          <TextAreaField
                            id="mf20T12"
                            label="T12 / rent roll / CapEx notes"
                            optional
                            placeholder="Available on request, or a summary here..."
                            value={mf20T12}
                            onChange={setMf20T12}
                          />
                          <RadioTiles
                            id="mf20Sf"
                            label="Open to seller financing?"
                            optional
                            columns={3}
                            value={mf20Sf}
                            onChange={setMf20Sf}
                            options={YES_NO_UNSURE}
                          />
                        </Subsection>
                      </div>
                    </>
                  )}

                  {asset === "mhp" && (
                    <>
                      <StepHeading
                        step={2}
                        title="Mobile home park details"
                        lede="Lots, utilities and who owns the homes tell me most of what I need. Skip what you don't know."
                      />
                      <div className="space-y-6">
                        <TextField
                          id="mhpAddr"
                          label="Property address"
                          required
                          autoComplete="street-address"
                          placeholder="123 Park Rd, City, State ZIP"
                          value={mhpAddr}
                          onChange={bind(setMhpAddr, "mhpAddr")}
                          error={errors.mhpAddr}
                        />

                        <Pair>
                          <TextField
                            id="mhpPrice"
                            label="Asking price"
                            required
                            inputMode="decimal"
                            placeholder="$1,200,000"
                            value={mhpPrice}
                            onChange={bind(setMhpPrice, "mhpPrice")}
                            error={errors.mhpPrice}
                          />
                          <TextField
                            id="mhpLots"
                            label="Total lots"
                            required
                            type="number"
                            inputMode="numeric"
                            placeholder="48"
                            value={mhpLots}
                            onChange={bind(setMhpLots, "mhpLots")}
                            error={errors.mhpLots}
                          />
                        </Pair>

                        <TextField
                          id="mhpOcc"
                          label="Occupied lots / occupancy %"
                          required
                          placeholder="38 lots / 79% / I don't know"
                          value={mhpOcc}
                          onChange={bind(setMhpOcc, "mhpOcc")}
                          error={errors.mhpOcc}
                        />

                        <SelectField
                          id="mhpWater"
                          label="Water and sewer type"
                          required
                          value={mhpWater}
                          onChange={bind(setMhpWater, "mhpWater")}
                          error={errors.mhpWater}
                          options={[
                            { value: "city-city", label: "City water + city sewer" },
                            { value: "well-septic", label: "Well + septic" },
                            { value: "city-septic", label: "City water + septic" },
                            { value: "well-city", label: "Well + city sewer" },
                            { value: "idk", label: "I don't know" },
                          ]}
                        />

                        <RadioTiles
                          id="mhpPoh"
                          label="Home ownership type"
                          required
                          columns={3}
                          value={mhpPoh}
                          onChange={bind(setMhpPoh, "mhpPoh")}
                          error={errors.mhpPoh}
                          options={[
                            { value: "toh", label: "Tenant-owned (TOH)" },
                            { value: "poh", label: "Park-owned (POH)" },
                            { value: "mixed", label: "Mixed" },
                          ]}
                        />

                        <Subsection show={["poh", "mixed"].includes(mhpPoh)} title="Park-owned home details">
                          <Pair>
                            <TextField
                              id="mhpPohUnits"
                              label="Number of POH units"
                              optional
                              type="number"
                              inputMode="numeric"
                              placeholder="12"
                              value={mhpPohUnits}
                              onChange={setMhpPohUnits}
                            />
                            <SelectField
                              id="mhpPohCond"
                              label="POH condition"
                              optional
                              placeholder="Select or skip"
                              value={mhpPohCond}
                              onChange={setMhpPohCond}
                              options={[
                                { value: "good", label: "Good" },
                                { value: "fair", label: "Fair" },
                                { value: "poor", label: "Poor" },
                                { value: "idk", label: "I don't know" },
                              ]}
                            />
                          </Pair>
                        </Subsection>

                        <Divider />

                        <Pair>
                          <TextField
                            id="mhpInc"
                            label="Gross monthly income"
                            required={isWholesaler}
                            optional={!isWholesaler}
                            inputMode="decimal"
                            placeholder="$19,200 / I don't know"
                            value={mhpInc}
                            onChange={bind(setMhpInc, "mhpInc")}
                            error={errors.mhpInc}
                          />
                          <TextField
                            id="mhpLotRent"
                            label="Lot rent (per lot, per month)"
                            optional
                            inputMode="decimal"
                            placeholder="$400 / I don't know"
                            value={mhpLotRent}
                            onChange={setMhpLotRent}
                          />
                        </Pair>

                        <RadioTiles
                          id="mhpInfra"
                          label="Infrastructure age and condition"
                          optional
                          value={mhpInfra}
                          onChange={setMhpInfra}
                          options={[
                            { value: "good", label: "Good" },
                            { value: "fair", label: "Fair" },
                            { value: "poor", label: "Poor / aging" },
                            { value: "idk", label: "I don't know" },
                          ]}
                        />

                        <RadioTiles
                          id="mhpMort"
                          label="Existing financing?"
                          optional
                          columns={3}
                          value={mhpMort}
                          onChange={setMhpMort}
                          options={YES_NO_IDK}
                        />

                        <Subsection show={mhpMort === "yes"} title="Financing details">
                          <Pair>
                            <TextField
                              id="mhpMortBal"
                              label="Balance"
                              optional
                              inputMode="decimal"
                              placeholder="$650,000 / I don't know"
                              value={mhpMortBal}
                              onChange={setMhpMortBal}
                            />
                            <TextField
                              id="mhpMortRate"
                              label="Rate"
                              optional
                              inputMode="decimal"
                              placeholder="5% / I don't know"
                              value={mhpMortRate}
                              onChange={setMhpMortRate}
                            />
                          </Pair>
                          <RadioTiles
                            id="mhpAssume"
                            label="Assumable?"
                            optional
                            columns={3}
                            value={mhpAssume}
                            onChange={setMhpAssume}
                            options={YES_NO_IDK}
                          />
                        </Subsection>

                        <RadioTiles
                          id="mhpViol"
                          label="Any city or county violations?"
                          optional
                          columns={2}
                          value={mhpViol}
                          onChange={setMhpViol}
                          options={YES_NO}
                        />
                        <Subsection show={mhpViol === "yes"} title="Describe the violations">
                          <TextAreaField
                            id="mhpViolDesc"
                            label="Violations"
                            optional
                            placeholder="Describe any known violations or compliance issues..."
                            value={mhpViolDesc}
                            onChange={setMhpViolDesc}
                          />
                        </Subsection>

                        <RadioTiles
                          id="mhpEnv"
                          label="Known environmental issues?"
                          optional
                          columns={2}
                          value={mhpEnv}
                          onChange={setMhpEnv}
                          options={YES_NO}
                        />
                        <Subsection show={mhpEnv === "yes"} title="Describe the environmental issues">
                          <TextAreaField
                            id="mhpEnvDesc"
                            label="Environmental issues"
                            optional
                            placeholder="Describe any known environmental concerns..."
                            value={mhpEnvDesc}
                            onChange={setMhpEnvDesc}
                          />
                        </Subsection>

                        <RadioTiles
                          id="mhpSf"
                          label="Open to seller financing?"
                          optional
                          columns={3}
                          value={mhpSf}
                          onChange={setMhpSf}
                          options={YES_NO_UNSURE}
                        />
                      </div>
                    </>
                  )}

                  {asset === "rv" && (
                    <>
                      <StepHeading
                        step={2}
                        title="RV park / campground details"
                        lede="Sites, season and revenue. Skip what you don't know."
                      />
                      <div className="space-y-6">
                        <TextField
                          id="rvAddr"
                          label="Property address"
                          required
                          autoComplete="street-address"
                          placeholder="123 Camp Rd, City, State ZIP"
                          value={rvAddr}
                          onChange={bind(setRvAddr, "rvAddr")}
                          error={errors.rvAddr}
                        />

                        <Pair>
                          <TextField
                            id="rvPrice"
                            label="Asking price"
                            required
                            inputMode="decimal"
                            placeholder="$2,400,000"
                            value={rvPrice}
                            onChange={bind(setRvPrice, "rvPrice")}
                            error={errors.rvPrice}
                          />
                          <TextField
                            id="rvSites"
                            label="Total sites"
                            required
                            type="number"
                            inputMode="numeric"
                            placeholder="85"
                            value={rvSites}
                            onChange={bind(setRvSites, "rvSites")}
                            error={errors.rvSites}
                          />
                        </Pair>

                        <RadioTiles
                          id="rvSeason"
                          label="Seasonal or year-round?"
                          required
                          columns={2}
                          value={rvSeason}
                          onChange={bind(setRvSeason, "rvSeason")}
                          error={errors.rvSeason}
                          options={[
                            { value: "seasonal", label: "Seasonal" },
                            { value: "yearround", label: "Year-round" },
                          ]}
                        />

                        <Subsection show={rvSeason === "seasonal"} title="Seasonal details">
                          <Pair>
                            <SelectField
                              id="rvSeasonOpen"
                              label="Season opens"
                              required
                              placeholder="Select month"
                              value={rvSeasonOpen}
                              onChange={bind(setRvSeasonOpen, "rvSeasonOpen")}
                              error={errors.rvSeasonOpen}
                              options={MONTH_OPTIONS}
                            />
                            <SelectField
                              id="rvSeasonClose"
                              label="Season closes"
                              required
                              placeholder="Select month"
                              value={rvSeasonClose}
                              onChange={bind(setRvSeasonClose, "rvSeasonClose")}
                              error={errors.rvSeasonClose}
                              options={MONTH_OPTIONS}
                            />
                          </Pair>
                          <TextField
                            id="rvPeakOcc"
                            label="Peak season average occupancy"
                            optional
                            placeholder="90% / I don't know"
                            value={rvPeakOcc}
                            onChange={setRvPeakOcc}
                          />
                        </Subsection>

                        <Subsection show={rvSeason === "yearround"} title="Year-round details">
                          <TextField
                            id="rvYrOcc"
                            label="Current occupancy %"
                            required
                            placeholder="75%"
                            value={rvYrOcc}
                            onChange={bind(setRvYrOcc, "rvYrOcc")}
                            error={errors.rvYrOcc}
                          />
                          <RadioTiles
                            id="rvLt"
                            label="Long-term or permanent residents?"
                            optional
                            columns={2}
                            value={rvLt}
                            onChange={setRvLt}
                            options={YES_NO}
                          />
                          {rvLt === "yes" && (
                            <TextField
                              id="rvLtCount"
                              label="Approximately how many?"
                              optional
                              type="number"
                              inputMode="numeric"
                              placeholder="12"
                              value={rvLtCount}
                              onChange={setRvLtCount}
                            />
                          )}
                        </Subsection>

                        <Divider />

                        <CheckTiles
                          id="rvSiteTypes"
                          label="Site type breakdown, check all that apply"
                          optional
                          options={[
                            "Full hookup (water, electric, sewer)",
                            "Water & electric only",
                            "Electric only",
                            "Dry camping / primitive",
                            "Cabin / glamping units",
                          ]}
                          selected={rvSiteTypes}
                          onChange={setRvSiteTypes}
                        />

                        <Pair>
                          <TextField
                            id="rvRev"
                            label="Gross annual revenue"
                            required={isWholesaler}
                            optional={!isWholesaler}
                            inputMode="decimal"
                            placeholder="$320,000 / I don't know"
                            value={rvRev}
                            onChange={bind(setRvRev, "rvRev")}
                            error={errors.rvRev}
                          />
                          <SelectField
                            id="rvMgmt"
                            label="Management type"
                            optional
                            placeholder="Select or skip"
                            value={rvMgmt}
                            onChange={setRvMgmt}
                            options={[
                              { value: "self", label: "Self-managed" },
                              { value: "third", label: "Third-party management" },
                            ]}
                          />
                        </Pair>

                        <TextField
                          id="rvBooking"
                          label="Booking platform"
                          optional
                          placeholder="Campspot, Hipcamp, direct, none, I don't know..."
                          value={rvBooking}
                          onChange={setRvBooking}
                        />

                        <Pills
                          label="Amenities, check all that apply"
                          optional
                          options={[
                            "Pool",
                            "Bathhouse",
                            "Laundry",
                            "Playground",
                            "Camp Store",
                            "Boat Launch",
                            "WiFi",
                            "Fishing",
                            "Mini Golf",
                          ]}
                          selected={rvAmenities}
                          onChange={setRvAmenities}
                        />

                        <RadioTiles
                          id="rvMort"
                          label="Existing financing?"
                          required={isWholesaler}
                          optional={!isWholesaler}
                          columns={3}
                          value={rvMort}
                          onChange={bind(setRvMort, "rvMort")}
                          error={errors.rvMort}
                          options={YES_NO_IDK}
                        />

                        <Subsection show={rvMort === "yes"} title="Financing details">
                          <Pair>
                            <TextField
                              id="rvMortBal"
                              label="Balance"
                              optional
                              inputMode="decimal"
                              placeholder="$900,000 / I don't know"
                              value={rvMortBal}
                              onChange={setRvMortBal}
                            />
                            <TextField
                              id="rvMortRate"
                              label="Rate"
                              optional
                              inputMode="decimal"
                              placeholder="5.25% / I don't know"
                              value={rvMortRate}
                              onChange={setRvMortRate}
                            />
                          </Pair>
                          <RadioTiles
                            id="rvAssume"
                            label="Assumable?"
                            optional
                            columns={3}
                            value={rvAssume}
                            onChange={setRvAssume}
                            options={YES_NO_IDK}
                          />
                        </Subsection>

                        <RadioTiles
                          id="rvSf"
                          label="Open to seller financing?"
                          optional
                          columns={3}
                          value={rvSf}
                          onChange={setRvSf}
                          options={YES_NO_UNSURE}
                        />
                      </div>
                    </>
                  )}

                  <StepNav onBack={back} />
                </>
              )}

              {/* Step 4: final */}
              {step === 3 && (
                <>
                  <StepHeading step={3} title="Almost done." lede="Anything else, then confirm and send it over." />
                  <div className="space-y-6">
                    <TextAreaField
                      id="notes"
                      label="Anything else I should know?"
                      optional
                      placeholder="Timeline, additional context, or anything else..."
                      value={notes}
                      onChange={setNotes}
                    />

                    <SelectField
                      id="hearAbout"
                      label="How did you hear about me?"
                      optional
                      value={hearAbout}
                      onChange={setHearAbout}
                      options={[
                        { value: "instagram", label: "Instagram" },
                        { value: "facebook", label: "Facebook" },
                        { value: "referral", label: "Referral" },
                        { value: "google", label: "Google search" },
                        { value: "meetup", label: "Meetup / event" },
                        { value: "subto", label: "SubTo / Pace Morby community" },
                        { value: "other", label: "Other" },
                      ]}
                    />

                    <Subsection show={isWholesaler} title="Referral and assignment">
                      <TextField
                        id="referralFee"
                        label="Referral fee expectation"
                        optional
                        placeholder="$2,500 flat / 50% of spread / negotiable..."
                        value={referralFee}
                        onChange={setReferralFee}
                      />
                      <RadioTiles
                        id="dealStatus"
                        label="Your status on this deal"
                        optional
                        columns={3}
                        value={dealStatus}
                        onChange={setDealStatus}
                        options={[
                          { value: "contract", label: "I have it under contract" },
                          { value: "referring", label: "I'm referring the lead" },
                          { value: "other", label: "Other" },
                        ]}
                      />
                    </Subsection>

                    <Divider />

                    <div className="space-y-3">
                      <ConsentBox id="consent" checked={consent} onChange={bind(setConsent, "consent")} error={errors.consent}>
                        I confirm this information is accurate to the best of my knowledge.
                        <Mark required />
                      </ConsentBox>
                      <ConsentBox id="smsConsent" checked={smsConsent} onChange={setSmsConsent}>
                        Text me about this. I agree to receive text messages from Josh Moore about my
                        submission. Message frequency varies. Message and data rates may apply. Reply
                        STOP to opt out, HELP for help.
                      </ConsentBox>
                    </div>

                    {submitError && (
                      <p
                        role="alert"
                        className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
                      >
                        {submitError}
                      </p>
                    )}
                  </div>

                  <StepNav onBack={back} submit nextLabel={submitting ? "Sending..." : "Submit deal"} busy={submitting} />
                  <p className="mt-4 text-center text-sm text-ink-muted">
                    By submitting you agree to the{" "}
                    <Link href="/privacy" className="font-semibold text-brand-600 underline-offset-4 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </>
              )}
            </form>
          </Reveal>
        </div>
      </Section>

      <CtaBand
        title="Rather talk it through?"
        lede="If the form doesn't fit your situation, book a call and walk me through the property instead."
        primaryHref="/contact"
        primaryLabel="Book a call"
        secondaryHref="/buy-box"
        secondaryLabel="View my buy box"
      />
    </SiteLayout>
  );
}
