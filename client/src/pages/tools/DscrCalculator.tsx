import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Note,
  NumberField,
  ResultHero,
  ResultRows,
  Segmented,
  StatGrid,
  ToolPage,
  money,
  queryNumber,
  type Row,
} from "@/components/tools/ToolKit";
import { dscr } from "@shared/calculators";

interface Inputs {
  rent: number | null;
  value: number | null;
  ltvPct: number | null;
  ratePct: number | null;
  termYears: number | null;
  interestOnly: boolean;
  taxesYearly: number | null;
  insuranceYearly: number | null;
  hoaMonthly: number | null;
}

/** Example numbers only, not a quote. */
const EXAMPLE: Inputs = {
  rent: 1900,
  value: 200_000,
  ltvPct: 80,
  ratePct: 7.25,
  termYears: 30,
  interestOnly: false,
  taxesYearly: 3600,
  insuranceYearly: 1500,
  hoaMonthly: null,
};

function band(ratio: number | null): { text: string } {
  if (ratio === null) return { text: "Put in the rent and the loan to see the ratio." };
  if (ratio < 1) return { text: "The rent does not cover the payment." };
  if (ratio < 1.25) return { text: "The rent covers the payment with a thin cushion." };
  return { text: "The rent covers the payment with room to spare." };
}

/** A simple scale from 0.50 to 2.00 with marks at 1.00 and 1.25. */
function Gauge({ ratio }: { ratio: number | null }) {
  const min = 0.5;
  const max = 2;
  const pos = (x: number) => `${((Math.min(Math.max(x, min), max) - min) / (max - min)) * 100}%`;
  return (
    <div className="mt-6" aria-hidden="true">
      <div className="relative h-2 rounded-full bg-white/15">
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: ratio === null ? 0 : pos(ratio) }} />
        {[1, 1.25].map((mark) => (
          <span key={mark} className="absolute -top-1.5 h-5 w-px bg-white/70" style={{ left: pos(mark) }} />
        ))}
      </div>
      <div className="relative mt-2 h-4 text-xs text-white/70">
        <span className="absolute left-0">0.50</span>
        <span className="absolute -translate-x-1/2" style={{ left: pos(1) }}>1.00</span>
        <span className="absolute -translate-x-1/2" style={{ left: pos(1.25) }}>1.25</span>
        <span className="absolute right-0">2.00</span>
      </div>
    </div>
  );
}

export default function DscrCalculator() {
  const [v, setV] = useState<Inputs>(() => {
    const value = queryNumber("value");
    const ltv = queryNumber("ltv");
    return {
      ...EXAMPLE,
      ...(value !== null ? { value } : {}),
      ...(ltv !== null ? { ltvPct: ltv } : {}),
    };
  });
  const set = (key: keyof Inputs) => (value: number | null) => setV((prev) => ({ ...prev, [key]: value }));
  const r = useMemo(() => dscr(v), [v]);
  const b = band(r.dscr);
  const ratio = r.dscr === null ? "-" : r.dscr.toFixed(2);

  const rows: Row[] = [
    { label: v.interestOnly ? "Interest only" : "Principal and interest", value: money(r.payment) },
    { label: "Taxes", value: money(r.taxes) },
    { label: "Insurance", value: money(r.insurance) },
    ...(r.hoa > 0 ? [{ label: "HOA", value: money(r.hoa) } as Row] : []),
    { label: "Full payment (PITIA)", value: money(r.pitia), kind: "total" },
    { label: "Monthly rent", value: money(v.rent ?? 0) },
    { label: "DSCR, rent / payment", value: ratio, kind: "total" },
  ];

  return (
    <ToolPage
      path="/dscr-calculator"
      title="DSCR quick check"
      lede="Does the rent cover the loan? See the ratio a DSCR lender looks at, the rent it takes to hit a target and the biggest loan the rent supports."
      mobileBar={{ label: "DSCR", value: ratio }}
      inputs={
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-ink-soft">Example numbers, not a quote. Put in yours.</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setV(EXAMPLE)}>
              <RotateCcw />
              Reset
            </Button>
          </div>

          <FieldGroup title="The property">
            <NumberField
              label="Monthly rent"
              prefix="$"
              suffix="/mo"
              value={v.rent}
              onChange={set("rent")}
              help="Rent you can prove, from a lease or rent comps."
            />
            <NumberField label="Price or value" prefix="$" value={v.value} onChange={set("value")} decimals={0} />
            <NumberField label="Property taxes" prefix="$" suffix="/yr" value={v.taxesYearly} onChange={set("taxesYearly")} decimals={0} />
            <NumberField label="Insurance" prefix="$" suffix="/yr" value={v.insuranceYearly} onChange={set("insuranceYearly")} decimals={0} />
            <NumberField label="HOA" prefix="$" suffix="/mo" value={v.hoaMonthly} onChange={set("hoaMonthly")} placeholder="0" />
          </FieldGroup>

          <FieldGroup title="The loan">
            <NumberField
              label="Loan-to-value"
              suffix="%"
              value={v.ltvPct}
              onChange={set("ltvPct")}
              help={`A ${money(r.loanAmount)} loan.`}
            />
            <NumberField label="Interest rate" suffix="%" value={v.ratePct} onChange={set("ratePct")} decimals={3} />
            <NumberField label="Term" suffix="years" value={v.termYears} onChange={set("termYears")} decimals={0} />
            <Segmented
              label="Payment"
              value={v.interestOnly ? "io" : "pi"}
              onChange={(next) => setV((prev) => ({ ...prev, interestOnly: next === "io" }))}
              options={[
                { value: "pi", label: "Principal and interest" },
                { value: "io", label: "Interest only" },
              ]}
            />
          </FieldGroup>
        </>
      }
      results={
        <>
          <ResultHero label="DSCR" value={ratio} sub={b.text}>
            <Gauge ratio={r.dscr} />
          </ResultHero>
          <ResultRows title="The payment a DSCR lender divides by" rows={rows} />
          <div className="surface p-5 md:p-7">
            <h3 className="text-lg text-navy md:text-xl">Targets</h3>
            <div className="mt-4">
              <StatGrid
                items={[
                  { label: "Rent for 1.00", value: money(r.rentFor100), note: "Covers the payment exactly" },
                  { label: "Rent for 1.25", value: money(r.rentFor125), note: "25% more rent than payment" },
                  {
                    label: "Loan at 1.25",
                    value: money(r.maxLoanAt125),
                    note: "The biggest loan this rent supports",
                    strong: true,
                  },
                ]}
              />
            </div>
          </div>
          <Note>
            Each lender sets its own minimum. Many DSCR programs start at 1.00, and some ask for more,
            for example on a cash-out refinance. Ask before you count on a number.
          </Note>
        </>
      }
      how={{
        title: "Rent divided by the full payment.",
        steps: [
          "DSCR is the monthly rent divided by the full monthly payment: principal and interest (or interest only), taxes, insurance and association dues, called PITIA.",
          "At 1.00 the rent exactly covers the payment. At 1.25 there is 25% more rent than payment.",
          "Rent for a target is the payment times the ratio you want.",
          "The loan at 1.25 takes the payment this rent supports at 1.25, subtracts taxes, insurance and dues, and turns what is left back into a loan at your rate and term.",
          "DSCR leaves out vacancy, repairs and management. Your own numbers should not.",
        ],
      }}
    />
  );
}
