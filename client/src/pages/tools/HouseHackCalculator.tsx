import { useMemo, useState } from "react";
import { Link } from "wouter";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Note,
  NumberField,
  ResultHero,
  ResultRows,
  StatGrid,
  ToolLink,
  ToolPage,
  money,
  type Row,
} from "@/components/tools/ToolKit";
import { houseHack, type HouseHackInput } from "@shared/calculators";

type Inputs = { [K in keyof HouseHackInput]: number | null };

/** Lena's duplex: the guide's fictional teaching example (Live In, Rent Smart, page 14). */
const EXAMPLE: Inputs = {
  price: 350_000,
  downPaymentPct: 5,
  closingCosts: null,
  setupRepairs: null,
  cashOnHand: null,
  ratePct: 6.5,
  termYears: 30,
  taxes: 350,
  insurance: 150,
  mortgageInsurance: 140,
  hoa: null,
  ownerUtilities: 180,
  maintenance: 292,
  capitalReserve: 150,
  vacancy: 100,
  other: null,
  rent: 1650,
  firstYearRepair: 5000,
  currentHousing: null,
};

export default function HouseHackCalculator() {
  const [v, setV] = useState<Inputs>(EXAMPLE);
  const set = (key: keyof Inputs) => (value: number | null) => setV((prev) => ({ ...prev, [key]: value }));
  const r = useMemo(() => houseHack(v), [v]);

  const price = v.price ?? 0;
  const rent = v.rent ?? 0;
  const perMonth = (amount: number) => `${money(amount)}/mo`;

  const outflowRows: Row[] = [
    { label: "Principal and interest", value: money(r.principalAndInterest) },
    { label: "Taxes", value: money(v.taxes ?? 0) },
    { label: "Insurance", value: money(v.insurance ?? 0) },
    { label: "Mortgage insurance", value: money(v.mortgageInsurance ?? 0) },
    ...((v.hoa ?? 0) > 0 ? [{ label: "HOA", value: money(v.hoa ?? 0) }] : []),
    { label: "Owner-paid utilities", value: money(v.ownerUtilities ?? 0) },
    { label: "Maintenance reserve", value: money(v.maintenance ?? 0) },
    { label: "Capital replacement reserve", value: money(v.capitalReserve ?? 0) },
    { label: "Vacancy allowance", value: money(v.vacancy ?? 0) },
    ...((v.other ?? 0) > 0 ? [{ label: "Other", value: money(v.other ?? 0) }] : []),
    { label: "Total planned outflow", value: money(r.totalOutflow), kind: "total" },
    { label: "Rent collected", value: money(rent), kind: "minus" },
    { label: "Your housing cost", value: perMonth(r.housingCost), kind: "total" },
  ];

  const cashRows: Row[] = [
    { label: "Down payment", value: money(r.downPayment) },
    { label: "Closing costs", value: money(v.closingCosts ?? 0) },
    { label: "Immediate repairs and setup", value: money(v.setupRepairs ?? 0) },
    { label: "Cash to close and move in", value: money(r.cashToClose), kind: "total" },
    ...(r.cashRemaining !== null
      ? ([
          { label: "Cash you have for this", value: money(v.cashOnHand ?? 0) },
          { label: "Cash remaining after closing", value: money(r.cashRemaining), kind: "total" },
        ] as Row[])
      : []),
  ];

  const covered = r.housingCost < 0;

  return (
    <ToolPage
      path="/house-hack-calculator"
      title="House hack calculator"
      lede="Your payment is not your housing cost. Put in a property and see what it costs you to live there once the rent comes in, then try to break the deal before you buy it."
      mobileBar={{ label: "Your housing cost", value: perMonth(r.housingCost) }}
      inputs={
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-ink-soft">
              Starts with Lena's duplex from the guide. Put in your own numbers.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => setV(EXAMPLE)}>
              <RotateCcw />
              Back to the example
            </Button>
          </div>

          <FieldGroup title="The purchase">
            <NumberField label="Purchase price" prefix="$" value={v.price} onChange={set("price")} decimals={0} />
            <NumberField
              label="Down payment"
              suffix="%"
              value={v.downPaymentPct}
              onChange={set("downPaymentPct")}
              help={`${money(r.downPayment)} down, a ${money(r.loanAmount)} loan.`}
            />
            <NumberField
              label="Interest rate"
              suffix="%"
              value={v.ratePct}
              onChange={set("ratePct")}
              decimals={3}
              help="Ask each lender to price the same property and occupancy."
            />
            <NumberField label="Loan term" suffix="years" value={v.termYears} onChange={set("termYears")} decimals={0} />
          </FieldGroup>

          <FieldGroup
            title="Monthly costs"
            note="Everything that leaves the account each month, not just the mortgage."
          >
            <NumberField label="Property taxes" prefix="$" suffix="/mo" value={v.taxes} onChange={set("taxes")} />
            <NumberField label="Insurance" prefix="$" suffix="/mo" value={v.insurance} onChange={set("insurance")} />
            <NumberField
              label="Mortgage insurance"
              prefix="$"
              suffix="/mo"
              value={v.mortgageInsurance}
              onChange={set("mortgageInsurance")}
            />
            <NumberField label="HOA" prefix="$" suffix="/mo" value={v.hoa} onChange={set("hoa")} placeholder="0" />
            <NumberField
              label="Owner-paid utilities"
              prefix="$"
              suffix="/mo"
              value={v.ownerUtilities}
              onChange={set("ownerUtilities")}
            />
            <NumberField
              label="Maintenance reserve"
              prefix="$"
              suffix="/mo"
              value={v.maintenance}
              onChange={set("maintenance")}
              help={`The guide's example uses about 1% of the price a year: ${money((price * 0.01) / 12)} a month here.`}
            />
            <NumberField
              label="Capital replacement reserve"
              prefix="$"
              suffix="/mo"
              value={v.capitalReserve}
              onChange={set("capitalReserve")}
              help="Money set aside for the big replacements: roof, furnace, water heater."
            />
            <NumberField
              label="Vacancy allowance"
              prefix="$"
              suffix="/mo"
              value={v.vacancy}
              onChange={set("vacancy")}
              help={`The guide's example sets aside about 6% of the rent: ${money(rent * 0.06)} a month here.`}
            />
            <NumberField label="Other monthly costs" prefix="$" suffix="/mo" value={v.other} onChange={set("other")} placeholder="0" />
          </FieldGroup>

          <FieldGroup title="Rent and the stress test">
            <NumberField
              label="Rent from the parts you rent out"
              prefix="$"
              suffix="/mo"
              value={v.rent}
              onChange={set("rent")}
              help="A conservative number you can back up with rent comps."
            />
            <NumberField
              label="Largest likely first-year repair"
              prefix="$"
              value={v.firstYearRepair}
              onChange={set("firstYearRepair")}
              decimals={0}
              help="The guide's repair-year test uses $5,000."
            />
            <NumberField
              label="What you pay to live now"
              prefix="$"
              suffix="/mo"
              value={v.currentHousing}
              onChange={set("currentHousing")}
              placeholder="Optional"
              help="Your rent or mortgage today, to compare."
            />
          </FieldGroup>

          <FieldGroup title="Cash to close" note="Keep these separate. They are not the same pile of money.">
            <NumberField
              label="Closing costs"
              prefix="$"
              value={v.closingCosts}
              onChange={set("closingCosts")}
              decimals={0}
              placeholder="From your Loan Estimate"
            />
            <NumberField
              label="Immediate repairs and setup"
              prefix="$"
              value={v.setupRepairs}
              onChange={set("setupRepairs")}
              decimals={0}
              placeholder="Locks, paint, cleaning"
            />
            <NumberField
              label="Cash you have for this"
              prefix="$"
              value={v.cashOnHand}
              onChange={set("cashOnHand")}
              decimals={0}
              placeholder="Optional"
              help="Shows what is left after closing."
            />
          </FieldGroup>
        </>
      }
      results={
        <>
          <ResultHero
            label="Your housing cost"
            value={perMonth(r.housingCost)}
            sub={
              covered
                ? `The rent covers every cost and leaves ${money(-r.housingCost)} a month.`
                : "What it costs you to live there each month after the rent comes in."
            }
          >
            {r.vsCurrentHousing !== null && (
              <p className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-[15px] text-white">
                {r.vsCurrentHousing >= 0
                  ? `${money(r.vsCurrentHousing)} a month less than you pay now.`
                  : `${money(-r.vsCurrentHousing)} a month more than you pay now.`}
              </p>
            )}
          </ResultHero>

          <div className="surface p-5 md:p-7">
            <h3 className="text-lg text-navy md:text-xl">Try to break the deal</h3>
            <div className="mt-4">
              <StatGrid
                items={[
                  { label: "Expected", value: money(r.housingCost), note: "Your rent and normal reserves" },
                  { label: "Soft", value: money(r.softCase), note: "Rent down 10% plus one vacant month" },
                  {
                    label: "Repair year",
                    value: money(r.repairYearCase),
                    note: `Soft case plus a ${money(v.firstYearRepair ?? 0)} repair`,
                    strong: true,
                  },
                ]}
              />
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
              <strong className="text-navy">The question to answer:</strong> could your income
              carry about {money(r.repairYearCase)} a month for a while without adding credit-card
              debt? If not, change the price, savings target, rent assumptions, or property.
            </p>
          </div>

          <ResultRows title="Where the money goes each month" rows={outflowRows} />
          <ResultRows title="Cash" rows={cashRows} />

          <Note>
            <strong>Property reserve:</strong> the guide suggests a beginner keep at least three
            months of full property expenses ({money(r.reserveLow)}), and six months gives more
            room ({money(r.reserveHigh)}). Keep a personal reserve on top of that.
          </Note>
          <Note>
            <strong>The lender may not count rent the way you do.</strong> Fannie Mae guidance, for
            example, generally applies a 75% factor to qualifying rent: {money(r.lenderCountedRent)}{" "}
            of your {money(rent)}. Ask each lender how much they will use for your file.
          </Note>
        </>
      }
      how={{
        title: "The guide's method, step by step.",
        steps: [
          "Add up everything that leaves the account each month: principal and interest, taxes, insurance, mortgage insurance, HOA, the utilities you pay, and reserves for maintenance, big replacements and vacancy. That is your total planned outflow.",
          "Subtract the rent you collect. What is left is your housing cost: what it costs you to live there.",
          "Soft case: the rent comes in 10% lower and one month sits empty. Both get added back, spread over the year.",
          "Repair year: the soft case plus your largest likely first-year repair, spread over twelve months.",
          "Cash is separate from the monthly math: down payment, closing costs and move-in work, then a property reserve and a personal one.",
          <>
            Principal and interest uses standard monthly amortization, rounded to the dollar. The
            method and the example come from{" "}
            <Link href="/househackingguide" className="font-semibold text-brand-600 underline-offset-4 hover:underline">
              Live In, Rent Smart
            </Link>
            .
          </>,
        ],
      }}
      footnote={
        <>
          <p>
            The starting numbers are Lena's duplex, a fictional teaching example from the guide. They
            are not a current loan quote.
          </p>
          <p>
            <ToolLink href="/househackingguide">Get the free guide and starter kit</ToolLink>
          </p>
        </>
      }
    />
  );
}
