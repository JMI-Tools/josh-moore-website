import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Note,
  NumberField,
  ResultHero,
  Segmented,
  ToolPage,
  money,
  percent,
  queryNumber,
} from "@/components/tools/ToolKit";
import { compareDeals, dealReturn, type DealResult } from "@shared/calculators";

interface Deal {
  profit: number | null;
  allIn: number | null;
  cashIn: number | null;
  months: number | null;
}

/**
 * Deal A is the example from the Real Estate Pros Show (07:15): 20 or 30k on a flip that
 * took five or six hundred thousand. Deal B is an example: the same profit on a smaller deal.
 */
const EXAMPLE_A: Deal = { profit: 25_000, allIn: 550_000, cashIn: null, months: 6 };
const EXAMPLE_B: Deal = { profit: 25_000, allIn: 150_000, cashIn: null, months: 6 };

function fromQuery(): Deal | null {
  const profit = queryNumber("profit");
  const allIn = queryNumber("allin");
  if (profit === null || allIn === null) return null;
  return { profit, allIn, cashIn: queryNumber("cash"), months: queryNumber("months") };
}

function DealFields({ title, deal, onChange }: { title: string; deal: Deal; onChange: (deal: Deal) => void }) {
  const set = (key: keyof Deal) => (value: number | null) => onChange({ ...deal, [key]: value });
  return (
    <FieldGroup title={title}>
      <NumberField
        label="Profit"
        prefix="$"
        value={deal.profit}
        onChange={set("profit")}
        decimals={0}
        allowNegative
        help="What you walked away with."
      />
      <NumberField
        label="What the deal took"
        prefix="$"
        value={deal.allIn}
        onChange={set("allIn")}
        decimals={0}
        help="Everything, start to finish: price, closing, repairs, holding, selling."
      />
      <NumberField
        label="Your own cash in it"
        prefix="$"
        value={deal.cashIn}
        onChange={set("cashIn")}
        decimals={0}
        placeholder="Same as above"
        help="Leave it empty if you paid for all of it."
      />
      <NumberField
        label="Months, buy to sale"
        suffix="months"
        value={deal.months}
        onChange={set("months")}
        decimals={1}
      />
    </FieldGroup>
  );
}

function Line({ label, a, b, two }: { label: string; a: string; b: string; two: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-2 sm:grid-cols-[1fr_7rem_7rem]">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right tabular-nums">
        {two && <span className="mr-2 text-xs font-semibold text-ink-muted sm:hidden">A</span>}
        {a}
      </dd>
      {two && (
        <dd className="col-start-2 text-right tabular-nums sm:col-start-auto">
          <span className="mr-2 text-xs font-semibold text-ink-muted sm:hidden">B</span>
          {b}
        </dd>
      )}
    </div>
  );
}

function rows(d: DealResult, months: number | null) {
  return {
    profit: money(d.profit),
    cash: money(d.cashUsed),
    onAll: percent(d.returnOnAllIn),
    onCash: percent(d.cashOnCash),
    perYear: percent(d.perYear),
    perMonth: d.profitPerMonth === null ? "-" : money(d.profitPerMonth),
    months: months ? `${months}` : "-",
  };
}

export default function DidYouReallyWin() {
  const [seed] = useState(fromQuery);
  const [a, setA] = useState<Deal>(seed ?? EXAMPLE_A);
  const [b, setB] = useState<Deal>(EXAMPLE_B);
  const [count, setCount] = useState<"one" | "two">(seed ? "one" : "two");
  const two = count === "two";

  const ra = useMemo(() => dealReturn(a), [a]);
  const rb = useMemo(() => dealReturn(b), [b]);
  const cmp = useMemo(() => compareDeals(ra, rb), [ra, rb]);
  const A = rows(ra, a.months);
  const B = rows(rb, b.months);

  const heroSub =
    ra.cashOnCash === null
      ? "Put in what the deal took to see the return."
      : `${money(ra.profit)} on ${money(ra.cashUsed)}${a.months ? ` over ${a.months} months` : ""}.${
          ra.perYear !== null ? ` That's ${percent(ra.perYear)} a year.` : ""
        }`;

  return (
    <ToolPage
      path="/did-you-really-win"
      title="Did you really win?"
      lede="Profit is only half the story. Put what a deal made next to the money it took and how long it took it."
      mobileBar={{ label: "Return on the money", value: percent(ra.cashOnCash) }}
      inputs={
        <>
          <figure className="surface p-6 md:p-8">
            <blockquote className="font-display text-xl leading-snug font-semibold text-navy md:text-2xl">
              “Hey, I'll make 20 or 30k off of this fix and flip.” All right, cool. But, what if it
              cost you five, six hundred thousand dollars to do that when it's said and done? Did you
              really win?
            </blockquote>
            <figcaption className="mt-4 text-sm font-medium text-ink-muted">
              Josh Moore on the Real Estate Pros Show
            </figcaption>
          </figure>

          <div className="surface flex flex-col gap-5 p-5 md:p-7">
            <Segmented
              label="How many deals?"
              value={count}
              onChange={setCount}
              options={[
                { value: "one", label: "One deal" },
                { value: "two", label: "Compare two" },
              ]}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[15px] text-ink-soft">Example numbers. Put in your own deals.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setA(EXAMPLE_A);
                  setB(EXAMPLE_B);
                }}
              >
                <RotateCcw />
                Reset
              </Button>
            </div>
          </div>

          <DealFields title={two ? "Deal A" : "The deal"} deal={a} onChange={setA} />
          {two && <DealFields title="Deal B" deal={b} onChange={setB} />}
        </>
      }
      results={
        <>
          <ResultHero
            label={two ? "Deal A: return on the money" : "Return on the money it took"}
            value={percent(ra.cashOnCash)}
            sub={heroSub}
          />

          <div className="surface p-5 md:p-7">
            <h3 className="text-lg text-navy md:text-xl">{two ? "Side by side" : "The numbers"}</h3>
            {two && (
              <div className="mt-4 hidden grid-cols-[1fr_7rem_7rem] gap-4 border-b border-line pb-2 text-xs font-semibold tracking-[0.12em] text-ink-muted uppercase sm:grid">
                <span />
                <span className="text-right">Deal A</span>
                <span className="text-right">Deal B</span>
              </div>
            )}
            <dl className="mt-2 text-[15px]">
              <Line label="Profit" a={A.profit} b={B.profit} two={two} />
              <Line label="Your cash in it" a={A.cash} b={B.cash} two={two} />
              <Line label="Months" a={A.months} b={B.months} two={two} />
              <Line label="Return on everything it took" a={A.onAll} b={B.onAll} two={two} />
              <Line label="Return on your cash" a={A.onCash} b={B.onCash} two={two} />
              <Line label="Per year" a={A.perYear} b={B.perYear} two={two} />
              <Line label="Profit per month" a={A.perMonth} b={B.perMonth} two={two} />
            </dl>
          </div>

          {two && cmp.multiple !== null && (
            <Note>
              {cmp.multiple >= 1.005 ? (
                <>
                  Deal B made <strong>{cmp.multiple.toFixed(1)}x</strong> as much for every dollar it
                  took.
                </>
              ) : cmp.multiple <= 0.995 ? (
                <>
                  Deal A made <strong>{(1 / cmp.multiple).toFixed(1)}x</strong> as much for every
                  dollar it took.
                </>
              ) : (
                <>Both deals made the same for every dollar they took.</>
              )}
              {cmp.dealsFunded >= 2 && (
                <>
                  {" "}
                  The {money(ra.cashUsed)} Deal A tied up could fund {cmp.dealsFunded} deals like Deal
                  B. At Deal B's numbers, that's {money(cmp.profitIfFunded)} of profit instead of{" "}
                  {money(ra.profit)}.
                </>
              )}
            </Note>
          )}
        </>
      }
      how={{
        title: "Profit, measured against the money and the time.",
        steps: [
          "Return on your cash: the profit divided by your own money in the deal. If a lender paid for part of it, the return is on your share.",
          "Return on everything it took: the profit divided by the whole cost of the deal, borrowed or not.",
          "Per year: the return scaled to twelve months. A 10% return in six months is 20% a year, if you could do it again right away.",
          "Same money, more deals: the cash one big deal ties up, divided by what a smaller deal takes, times the smaller deal's profit.",
        ],
      }}
      footnote={
        <p>
          Deal A starts with the example from the Real Estate Pros Show. Deal B is an example of the
          same profit on a smaller deal.
        </p>
      }
    />
  );
}
