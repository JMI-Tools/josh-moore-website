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
  ToolLink,
  ToolPage,
  money,
  percent,
  queryNumber,
  type Row,
} from "@/components/tools/ToolKit";
import { flipMaxOffer, keepMaxOffer } from "@shared/calculators";

type Mode = "flip" | "keep";
type ProfitMode = "dollars" | "percent";

interface Inputs {
  arv: number | null;
  repairs: number | null;
  months: number | null;
  holdingMonthly: number | null;
  buyClosingPct: number | null;
  sellCostPct: number | null;
  profit: number | null;
  profitMode: ProfitMode;
  refiLtvPct: number | null;
  refiClosingPct: number | null;
  leaveIn: number | null;
  borrow: boolean;
  pctOfPrice: number | null;
  pctOfRepairs: number | null;
  ratePct: number | null;
  pointsPct: number | null;
}

/** Example numbers only. Every one of them should be replaced with the deal's own. */
const EXAMPLE: Inputs = {
  arv: 250_000,
  repairs: 40_000,
  months: 6,
  holdingMonthly: 600,
  buyClosingPct: 2,
  sellCostPct: 8,
  profit: 15,
  profitMode: "percent",
  refiLtvPct: 75,
  refiClosingPct: 3,
  leaveIn: 0,
  borrow: true,
  pctOfPrice: 90,
  pctOfRepairs: 100,
  ratePct: 11,
  pointsPct: 2,
};

export default function MaoCalculator() {
  const [mode, setMode] = useState<Mode>("flip");
  const [v, setV] = useState<Inputs>(() => {
    const repairs = queryNumber("repairs");
    return repairs !== null ? { ...EXAMPLE, repairs } : EXAMPLE;
  });
  const set = (key: keyof Inputs) => (value: number | null) => setV((prev) => ({ ...prev, [key]: value }));

  const financing = {
    use: v.borrow,
    pctOfPrice: v.pctOfPrice,
    pctOfRepairs: v.pctOfRepairs,
    ratePct: v.ratePct,
    pointsPct: v.pointsPct,
  };
  const common = {
    arv: v.arv,
    repairs: v.repairs,
    months: v.months,
    holdingMonthly: v.holdingMonthly,
    buyClosingPct: v.buyClosingPct,
    financing,
  };

  const flip = useMemo(
    () => flipMaxOffer({ ...common, sellCostPct: v.sellCostPct, profit: v.profit, profitMode: v.profitMode }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [v],
  );
  const keep = useMemo(
    () => keepMaxOffer({ ...common, refiLtvPct: v.refiLtvPct, refiClosingPct: v.refiClosingPct, leaveIn: v.leaveIn }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [v],
  );

  /** Switch between a dollar profit and a percent of ARV without losing the number. */
  const setProfitMode = (next: ProfitMode) =>
    setV((prev) => {
      if (prev.profitMode === next) return prev;
      const arv = prev.arv ?? 0;
      const profit = prev.profit ?? 0;
      const converted =
        next === "dollars" ? Math.round((arv * profit) / 100) : arv > 0 ? Math.round((profit / arv) * 1000) / 10 : 0;
      return { ...prev, profitMode: next, profit: converted };
    });

  const result = mode === "flip" ? flip : keep;
  const loanCosts = result.points + result.interest;
  const months = v.months ?? 0;

  const flipRows: Row[] = [
    { label: "After-repair value", value: money(v.arv ?? 0) },
    { label: `Selling costs (${v.sellCostPct ?? 0}%)`, value: money(flip.sellingCosts), kind: "minus" },
    { label: "Repairs", value: money(v.repairs ?? 0), kind: "minus" },
    { label: `Holding, ${months} months`, value: money(flip.holdingCosts), kind: "minus" },
    ...(v.borrow ? [{ label: "Loan points and interest", value: money(loanCosts), kind: "minus" } as Row] : []),
    { label: `Buying closing costs (${v.buyClosingPct ?? 0}%)`, value: money(flip.buyClosingCosts), kind: "minus" },
    { label: "Your profit", value: money(flip.profit), kind: "minus" },
    { label: "Max offer", value: money(flip.maxOffer), kind: "total" },
  ];

  const keepRows: Row[] = [
    { label: `New loan at refinance (${v.refiLtvPct ?? 0}% of ARV)`, value: money(keep.newLoan) },
    { label: `Refinance closing costs (${v.refiClosingPct ?? 0}%)`, value: money(keep.refiCosts), kind: "minus" },
    ...((v.leaveIn ?? 0) > 0 ? [{ label: "Cash you'll leave in", value: `+ ${money(v.leaveIn ?? 0)}` } as Row] : []),
    { label: "Repairs", value: money(v.repairs ?? 0), kind: "minus" },
    { label: `Holding, ${months} months`, value: money(keep.holdingCosts), kind: "minus" },
    ...(v.borrow ? [{ label: "Loan points and interest", value: money(loanCosts), kind: "minus" } as Row] : []),
    { label: `Buying closing costs (${v.buyClosingPct ?? 0}%)`, value: money(keep.buyClosingCosts), kind: "minus" },
    { label: "Max offer", value: money(keep.maxOffer), kind: "total" },
  ];

  const cashCheckHref = `/did-you-really-win?profit=${Math.round(flip.profit)}&allin=${Math.round(
    flip.allIn,
  )}&cash=${Math.round(flip.cashIn)}&months=${months}`;
  const dscrHref = `/dscr-calculator?value=${Math.round(v.arv ?? 0)}&ltv=${v.refiLtvPct ?? 0}`;

  const heroValue = result.ok ? money(result.maxOffer) : "No price works";

  return (
    <ToolPage
      path="/mao-calculator"
      title="Max offer calculator"
      lede="Work back from what the house is worth fixed to the most you can pay for it. Every cost is counted, including the ones that grow with the price."
      mobileBar={{ label: "Your max offer", value: heroValue }}
      inputs={
        <>
          <div className="surface flex flex-col gap-5 p-5 md:p-7">
            <Segmented
              label="What's the plan?"
              value={mode}
              onChange={setMode}
              options={[
                { value: "flip", label: "Fix and sell it" },
                { value: "keep", label: "Fix, rent and refinance" },
              ]}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[15px] text-ink-soft">Example numbers. Put in your deal's.</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setV(EXAMPLE)}>
                <RotateCcw />
                Reset
              </Button>
            </div>
          </div>

          <FieldGroup title="The house">
            <NumberField
              label="After-repair value (ARV)"
              prefix="$"
              value={v.arv}
              onChange={set("arv")}
              decimals={0}
              help="What it sells for fixed, from sold comps, not list prices."
            />
            <NumberField
              label="Repairs"
              prefix="$"
              value={v.repairs}
              onChange={set("repairs")}
              decimals={0}
              help={<ToolLink href="/rehab-estimator">Estimate them line by line</ToolLink>}
            />
            <NumberField
              label={mode === "flip" ? "Months until it sells" : "Months until you refinance"}
              suffix="months"
              value={v.months}
              onChange={set("months")}
              decimals={1}
            />
            <NumberField
              label="Holding costs"
              prefix="$"
              suffix="/mo"
              value={v.holdingMonthly}
              onChange={set("holdingMonthly")}
              help="Taxes, insurance, utilities and lawn while you own it."
            />
            <NumberField
              label="Buying closing costs"
              suffix="% of price"
              value={v.buyClosingPct}
              onChange={set("buyClosingPct")}
            />
          </FieldGroup>

          {mode === "flip" ? (
            <FieldGroup title="The sale">
              <NumberField
                label="Selling costs"
                suffix="% of ARV"
                value={v.sellCostPct}
                onChange={set("sellCostPct")}
                help="Agent fees and your closing costs when you sell."
              />
              <div className="space-y-3">
                <Segmented
                  label="Profit you want"
                  value={v.profitMode}
                  onChange={setProfitMode}
                  options={[
                    { value: "percent", label: "% of ARV" },
                    { value: "dollars", label: "Dollars" },
                  ]}
                />
                <NumberField
                  label={v.profitMode === "percent" ? "Profit, % of ARV" : "Profit, dollars"}
                  prefix={v.profitMode === "dollars" ? "$" : undefined}
                  suffix={v.profitMode === "percent" ? "%" : undefined}
                  value={v.profit}
                  onChange={set("profit")}
                  decimals={v.profitMode === "percent" ? 1 : 0}
                  help={v.profitMode === "percent" ? `${money(flip.profit)} on this ARV.` : undefined}
                />
              </div>
            </FieldGroup>
          ) : (
            <FieldGroup title="The refinance">
              <NumberField
                label="New loan"
                suffix="% of ARV"
                value={v.refiLtvPct}
                onChange={set("refiLtvPct")}
                help="The loan-to-value your lender will refinance at."
              />
              <NumberField
                label="Refinance closing costs"
                suffix="% of loan"
                value={v.refiClosingPct}
                onChange={set("refiClosingPct")}
              />
              <NumberField
                label="Cash you're fine leaving in"
                prefix="$"
                value={v.leaveIn}
                onChange={set("leaveIn")}
                decimals={0}
                help="0 means you want every dollar back at the refinance."
              />
            </FieldGroup>
          )}

          <div className="surface space-y-5 p-5 md:p-7">
            <h2 className="text-xl text-navy md:text-2xl">Paying for it</h2>
            <Segmented
              label="How are you buying it?"
              value={v.borrow ? "borrow" : "cash"}
              onChange={(next) => setV((prev) => ({ ...prev, borrow: next === "borrow" }))}
              options={[
                { value: "cash", label: "All cash" },
                { value: "borrow", label: "With a loan" },
              ]}
            />
            {v.borrow && (
              <div className="grid gap-5 sm:grid-cols-2">
                <NumberField label="Loan covers" suffix="% of price" value={v.pctOfPrice} onChange={set("pctOfPrice")} />
                <NumberField label="Loan covers" suffix="% of repairs" value={v.pctOfRepairs} onChange={set("pctOfRepairs")} />
                <NumberField label="Interest rate" suffix="%" value={v.ratePct} onChange={set("ratePct")} decimals={3} />
                <NumberField label="Points" suffix="%" value={v.pointsPct} onChange={set("pointsPct")} />
              </div>
            )}
          </div>
        </>
      }
      results={
        <>
          <ResultHero
            label="Your max offer"
            value={heroValue}
            sub={
              !result.ok
                ? "At these numbers there is nothing left for the purchase. The ARV has to be higher, or the repairs, holding time or profit lower."
                : mode === "flip"
                  ? `The most you can pay and still make ${money(flip.profit)} after every cost.`
                  : (v.leaveIn ?? 0) > 0
                    ? `The most you can pay and leave ${money(v.leaveIn ?? 0)} of your cash in the deal after the refinance.`
                    : "The most you can pay and get all of your cash back at the refinance."
            }
          />

          {result.ok && (
            <>
              <ResultRows title="How it works back" rows={mode === "flip" ? flipRows : keepRows} />

              {mode === "flip" ? (
                <div className="surface space-y-4 p-5 md:p-7">
                  <h3 className="text-lg text-navy md:text-xl">Your cash in the deal</h3>
                  <StatGrid
                    items={[
                      { label: "Cash you'd need", value: money(flip.cashIn), note: "Paid before the sale" },
                      { label: "Return on it", value: percent(flip.cashOnCash), note: "Profit / your cash" },
                      { label: "Per year", value: percent(flip.perYear), note: `Over ${months} months`, strong: true },
                    ]}
                  />
                  <ToolLink href={cashCheckHref}>Did you really win? Check this deal</ToolLink>
                </div>
              ) : (
                <div className="surface space-y-4 p-5 md:p-7">
                  <h3 className="text-lg text-navy md:text-xl">At the refinance</h3>
                  <StatGrid
                    items={[
                      { label: "Cash in before", value: money(keep.cashIn), note: "What you put in to get there" },
                      { label: "Cash back", value: money(keep.cashBack), note: "After paying off the first loan" },
                      { label: "Equity after", value: money(keep.equityAfter), note: "ARV minus the new loan", strong: true },
                    ]}
                  />
                  <ToolLink href={dscrHref}>Will the rent cover the {money(keep.newLoan)} loan? Check the DSCR</ToolLink>
                </div>
              )}
            </>
          )}

          {v.borrow && (
            <Note>
              Interest is figured on the full loan for every month you hold it, so it runs a little
              high on purpose. Loan terms here are examples, not a quote.
            </Note>
          )}
          {mode === "keep" && (
            <Note>
              Each lender sets its own refinance loan-to-value and how long you need to own the house
              first. Ask before you count on the new loan.
            </Note>
          )}
        </>
      }
      how={{
        title: "Start at the end and work back.",
        steps: [
          "Start with the after-repair value: what the house is worth fixed, from sold comps.",
          "Fix and sell: take off selling costs, repairs, holding costs, loan costs, your buying closing costs and the profit you want. What is left is the most you can pay.",
          "Fix, rent and refinance: start from the new loan, the ARV times the lender's loan-to-value. Take off refinance costs, repairs, holding and loan costs, and add any cash you are fine leaving in.",
          "Closing costs, points and interest grow with the price you pay, so the price is solved for exactly instead of guessed.",
          "Your cash is everything you pay before the sale or refinance, minus what the loan covers. Your return is the profit divided by that cash.",
          "This is a buyer's number for a house you will own, fix and sell or keep.",
        ],
      }}
    />
  );
}
