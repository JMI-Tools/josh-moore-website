import { useEffect, useId, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { CtaBand, PageHero, Reveal, Section, SectionHeading, SiteLayout } from "@/components/site";
import { useRouteSeo, type RoutePath } from "@/hooks/useSeo";
import { cn } from "@/lib/utils";
import { TOOLS } from "./toolList";

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole dollars, e.g. $1,814 or -$420. */
export function money(value: number | null | undefined, cents = false): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";
  const rounded = cents ? value : Math.round(value);
  if (Object.is(rounded, -0) || rounded === 0) return cents ? usd2.format(0) : usd0.format(0);
  return cents ? usd2.format(value) : usd0.format(rounded);
}

/** A ratio as a percent, e.g. 0.1667 -> 16.7%. */
export function percent(ratio: number | null | undefined, digits = 1): string {
  if (ratio === null || ratio === undefined || !Number.isFinite(ratio)) return "-";
  return `${(ratio * 100).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

function toText(value: number | null, decimals: number): string {
  if (value === null || !Number.isFinite(value)) return "";
  return value.toLocaleString("en-US", { maximumFractionDigits: decimals });
}

function toNumber(text: string, allowNegative: boolean): number | null {
  let cleaned = text.replace(/[^0-9.\-]/g, "");
  if (!allowNegative) cleaned = cleaned.replace(/-/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * A number box that shows commas while you read it and plain digits while you
 * type. Empty is null, not zero, so a tool can tell "not entered" from 0.
 */
export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  help,
  decimals = 2,
  allowNegative = false,
  placeholder,
  className,
}: {
  label: ReactNode;
  value: number | null;
  onChange: (value: number | null) => void;
  prefix?: string;
  suffix?: string;
  help?: ReactNode;
  decimals?: number;
  allowNegative?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(() => toText(value, decimals));

  // Keep the box in step when the value changes from outside (a reset, a mode switch).
  useEffect(() => {
    if (!focused) setText(toText(value, decimals));
  }, [value, decimals, focused]);

  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-muted"
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          aria-describedby={help ? helpId : undefined}
          className={cn("field tabular-nums", prefix && "pl-8")}
          style={suffix ? { paddingRight: `calc(1.75rem + ${suffix.length * 0.55}em)` } : undefined}
          value={text}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setText(toText(value, decimals));
          }}
          onChange={(e) => {
            setText(e.target.value);
            onChange(toNumber(e.target.value, allowNegative));
          }}
        />
        {suffix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-ink-muted"
          >
            {suffix}
          </span>
        )}
      </div>
      {help && (
        <p id={helpId} className="field-help">
          {help}
        </p>
      )}
    </div>
  );
}

/** A row of pills that acts as a radio group. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="field-label">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={on}
              data-on={on}
              className="pill"
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A titled block of inputs on a white card. */
export function FieldGroup({
  title,
  note,
  children,
  className,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("surface p-5 md:p-7", className)}>
      <legend className="sr-only">{title}</legend>
      <h2 aria-hidden="true" className="text-xl text-navy md:text-2xl">
        {title}
      </h2>
      {note && <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{note}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

/** The one big number, on navy. */
export function ResultHero({
  label,
  value,
  sub,
  children,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="glow-brand overflow-hidden rounded-[1.5rem] bg-navy p-6 text-white shadow-lift md:p-8">
      <p className="eyebrow text-brand-100">{label}</p>
      <p
        className="mt-3 font-display text-5xl font-bold leading-none tracking-tight tabular-nums md:text-6xl"
        aria-live="polite"
      >
        {value}
      </p>
      {sub && <p className="mt-3 text-[15px] leading-relaxed text-white/78">{sub}</p>}
      {children}
    </div>
  );
}

export type Row = {
  label: ReactNode;
  value: ReactNode;
  /** "minus" prints a leading minus sign; "total" draws a rule and bolds the row. */
  kind?: "plus" | "minus" | "total" | "note";
};

/** A ledger: label on the left, amount on the right. */
export function ResultRows({ title, rows }: { title?: string; rows: Row[] }) {
  return (
    <div className="surface p-5 md:p-7">
      {title && <h3 className="text-lg text-navy md:text-xl">{title}</h3>}
      <dl className={cn("text-[15px]", title && "mt-4")}>
        {rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              "flex items-baseline justify-between gap-4 py-2",
              row.kind === "total" && "mt-1 border-t border-line pt-3 font-semibold text-navy",
              row.kind === "note" && "text-ink-muted",
            )}
          >
            <dt className={cn(row.kind !== "total" && row.kind !== "note" && "text-ink-soft")}>
              {row.label}
            </dt>
            <dd className="shrink-0 text-right tabular-nums">
              {row.kind === "minus" ? <span aria-label="minus">- </span> : null}
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Small stat tiles in a row. */
export function StatGrid({
  items,
}: {
  items: { label: string; value: ReactNode; note?: ReactNode; strong?: boolean }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-2xl border p-4",
            item.strong ? "border-navy bg-navy text-white" : "border-line bg-white",
          )}
        >
          <p className={cn("text-xs font-semibold tracking-[0.12em] uppercase", item.strong ? "text-brand-100" : "text-ink-muted")}>
            {item.label}
          </p>
          <p className="mt-1.5 font-display text-2xl font-bold tabular-nums">{item.value}</p>
          {item.note && (
            <p className={cn("mt-1 text-sm leading-snug", item.strong ? "text-white/75" : "text-ink-muted")}>
              {item.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/** A quiet callout for context, never a sales line. */
export function Note({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-brand/30 bg-brand-100/60 p-4 text-[15px] leading-relaxed text-ink", className)}>
      {children}
    </div>
  );
}

/** A link to another tool, carrying numbers across in the query string. */
export function ToolLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 font-semibold text-brand-600 underline-offset-4 hover:underline"
    >
      {children}
      <ArrowRight className="size-4" />
    </Link>
  );
}

/** Read a number from the query string, for numbers handed over by another tool. */
export function queryNumber(key: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get(key);
  if (raw === null || raw.trim() === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/* ------------------------------------------------------------------ */
/* Page shell                                                          */
/* ------------------------------------------------------------------ */

/**
 * In-app links keep the old scroll position, so a tool opened from the bottom of
 * another page would open at its bottom. Start every tool at the top.
 */
export function useScrollTopOnOpen() {
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);
}

export const EDUCATIONAL_LINE =
  "Educational use only. Verify property, financing, legal, tax, and insurance details with licensed professionals.";

export function ToolPage({
  path,
  title,
  lede,
  inputs,
  results,
  mobileBar,
  how,
  footnote,
}: {
  path: RoutePath;
  title: ReactNode;
  lede: ReactNode;
  inputs: ReactNode;
  results: ReactNode;
  /** The key number, pinned to the bottom of the screen on phones. */
  mobileBar: { label: string; value: ReactNode };
  how: { title: string; steps: ReactNode[] };
  footnote?: ReactNode;
}) {
  useRouteSeo(path);
  useScrollTopOnOpen();
  return (
    <SiteLayout className="pb-20 lg:pb-0">
      <PageHero tone="navy" eyebrow="Free tool" title={title} lede={lede} />

      <Section tone="paper" className="dots-paper">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
          <div className="space-y-6">{inputs}</div>
          <div id="results" className="scroll-mt-24 space-y-6 lg:sticky lg:top-24">
            {results}
          </div>
        </div>
        <div className="mt-10 max-w-3xl space-y-2 text-sm leading-relaxed text-ink-muted">
          {footnote}
          <p>{EDUCATIONAL_LINE} Nothing you type here is saved or sent anywhere.</p>
        </div>
      </Section>

      <Section tone="white">
        <Reveal>
          <SectionHeading eyebrow="How the math works" title={how.title} />
        </Reveal>
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {how.steps.map((step, i) => (
            <li key={i} className="h-full">
              <Reveal delay={0.04 * i} className="surface flex h-full gap-5 p-6">
                <span
                  aria-hidden="true"
                  className="font-display text-3xl leading-none font-bold tracking-tight text-brand-600"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 text-[15px] leading-relaxed text-ink-soft">{step}</div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      <MoreTools current={path} />
      <CtaBand primaryHref="/resources" primaryLabel="More free resources" />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy text-white lg:hidden">
        <a
          href="#results"
          className="container flex min-h-16 items-center justify-between gap-4 py-2"
        >
          <span className="text-xs font-semibold tracking-[0.12em] text-brand-100 uppercase">
            {mobileBar.label}
          </span>
          <span className="flex items-center gap-2 font-display text-2xl font-bold tabular-nums">
            {mobileBar.value}
            <ArrowRight className="size-4 rotate-90 text-brand-100" aria-hidden="true" />
          </span>
        </a>
      </div>
    </SiteLayout>
  );
}

/** Cards for the other tools, so one tool leads to the next. */
export function MoreTools({ current }: { current?: string }) {
  const others = TOOLS.filter((tool) => tool.path !== current);
  return (
    <Section tone="paper">
      <Reveal>
        <SectionHeading eyebrow="Free tools" title={current ? "Run the next number." : "Pick a tool."} />
      </Reveal>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((tool, i) => (
          <li key={tool.path} className="h-full">
            <Reveal delay={0.04 * i} className="h-full">
              <ToolCard tool={tool} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.path}
      className="surface surface-hover group flex h-full flex-col gap-4 p-6 text-ink"
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-navy text-white">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <span className="font-display text-xl leading-tight font-bold text-navy">{tool.title}</span>
      <span className="flex-1 text-[15px] leading-relaxed text-ink-soft">{tool.blurb}</span>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
        Open the tool
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
