import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Note,
  NumberField,
  ResultHero,
  ResultRows,
  StatGrid,
  ToolPage,
  money,
  type Row,
} from "@/components/tools/ToolKit";
import { inventory, type InventoryInput } from "@shared/calculators";

type Money = { [K in keyof InventoryInput]: number | null };

/** Example numbers only. */
const EXAMPLE: Money = {
  homeValue: 300_000,
  owedOnHome: 180_000,
  borrowPct: 80,
  savings: 30_000,
  monthlyBills: 4000,
  safetyMonths: 6,
  retirementWork: 50_000,
  retirementIra: 10_000,
  retirementOther: null,
  brokerage: null,
  lifeInsuranceCash: null,
  ownedOutright: 15_000,
  otherPropertyEquity: null,
};

/** The team from the starter kit's 90-day plan: lenders, agent, inspector, insurance, legal and tax help. */
const TEAM = ["A lender", "An agent", "An inspector", "An insurance agent", "An attorney", "Tax help (a CPA)"];

export default function SittingOn() {
  const [v, setV] = useState<Money>(EXAMPLE);
  const [credit, setCredit] = useState<number | null>(null);
  const [hours, setHours] = useState<number | null>(null);
  const [team, setTeam] = useState<string[]>([]);
  const set = (key: keyof Money) => (value: number | null) => setV((prev) => ({ ...prev, [key]: value }));
  const r = useMemo(() => inventory(v), [v]);

  const toggle = (person: string) =>
    setTeam((prev) => (prev.includes(person) ? prev.filter((p) => p !== person) : [...prev, person]));

  const mapRows: Row[] = [
    { label: "Home equity", value: money(r.equity) },
    { label: "Savings and checking", value: money(r.savings) },
    { label: "Retirement accounts", value: money(r.retirement) },
    { label: "Other things you own", value: money(r.otherAssets) },
    { label: "Everything you counted", value: money(r.total), kind: "total" },
  ];

  const reachRows: Row[] = [
    { label: `Safety net, ${v.safetyMonths ?? 0} months of bills`, value: money(r.safetyNet) },
    { label: "Cash above your safety net", value: money(r.cashAboveSafetyNet) },
    { label: `Equity at ${v.borrowPct ?? 0}% of value, minus what you owe`, value: money(r.borrowable) },
    { label: "Within reach", value: money(r.reachable), kind: "total" },
  ];

  const creditValid = credit !== null && credit >= 300 && credit <= 850;

  return (
    <ToolPage
      path="/what-you-are-sitting-on"
      title="Most people are sitting on more than they think."
      lede="Count what you already have: your home, your cash, your retirement accounts, your credit, your people and your time. It's a count, not advice, and nothing you type leaves your browser."
      mobileBar={{ label: "Everything you counted", value: money(r.total) }}
      inputs={
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-ink-soft">Example numbers. Put in yours, or skip what doesn't apply.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setV(EXAMPLE);
                setCredit(null);
                setHours(null);
                setTeam([]);
              }}
            >
              <RotateCcw />
              Reset
            </Button>
          </div>

          <FieldGroup title="Your home">
            <NumberField label="What it's worth" prefix="$" value={v.homeValue} onChange={set("homeValue")} decimals={0} />
            <NumberField label="What you owe on it" prefix="$" value={v.owedOnHome} onChange={set("owedOnHome")} decimals={0} help="Every loan against it." />
            <NumberField
              label="Share a lender might lend against"
              suffix="% of value"
              value={v.borrowPct}
              onChange={set("borrowPct")}
              help="Lenders set this. Use the number yours gives you."
            />
          </FieldGroup>

          <FieldGroup title="Your cash">
            <NumberField label="Savings and checking" prefix="$" value={v.savings} onChange={set("savings")} decimals={0} />
            <NumberField label="Household bills" prefix="$" suffix="/mo" value={v.monthlyBills} onChange={set("monthlyBills")} decimals={0} />
            <NumberField
              label="Months of bills to keep untouched"
              suffix="months"
              value={v.safetyMonths}
              onChange={set("safetyMonths")}
              decimals={1}
              help="Your safety net. Only cash above it counts as within reach."
            />
          </FieldGroup>

          <FieldGroup
            title="Your retirement accounts"
            note="Retirement money has its own rules, taxes and penalties. Count it here, then ask a CPA what applies to you."
          >
            <NumberField label="401(k), 403(b) or TSP" prefix="$" value={v.retirementWork} onChange={set("retirementWork")} decimals={0} />
            <NumberField label="IRA or Roth IRA" prefix="$" value={v.retirementIra} onChange={set("retirementIra")} decimals={0} />
            <NumberField label="Other retirement money" prefix="$" value={v.retirementOther} onChange={set("retirementOther")} decimals={0} placeholder="0" />
          </FieldGroup>

          <FieldGroup title="Other things you own">
            <NumberField label="Brokerage or stock accounts" prefix="$" value={v.brokerage} onChange={set("brokerage")} decimals={0} placeholder="0" />
            <NumberField label="Cash value in life insurance" prefix="$" value={v.lifeInsuranceCash} onChange={set("lifeInsuranceCash")} decimals={0} placeholder="0" />
            <NumberField label="Vehicles or equipment, paid off" prefix="$" value={v.ownedOutright} onChange={set("ownedOutright")} decimals={0} placeholder="0" />
            <NumberField label="Equity in other property" prefix="$" value={v.otherPropertyEquity} onChange={set("otherPropertyEquity")} decimals={0} placeholder="0" />
          </FieldGroup>

          <FieldGroup title="Your credit and your time">
            <NumberField
              label="Credit score"
              value={credit}
              onChange={setCredit}
              decimals={0}
              placeholder="If you know it"
              help="Lenders price loans off this number. Know it before you call one."
            />
            <NumberField label="Hours a week you could give this" suffix="hrs" value={hours} onChange={setHours} decimals={0} placeholder="0" />
          </FieldGroup>

          <div className="surface p-5 md:p-7">
            <h2 className="text-xl text-navy md:text-2xl">Your people</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">Tap everyone you could call this week.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {TEAM.map((person) => {
                const on = team.includes(person);
                return (
                  <button key={person} type="button" className="pill" aria-pressed={on} onClick={() => toggle(person)}>
                    {person}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      }
      results={
        <>
          <ResultHero
            label="Everything you counted"
            value={money(r.total)}
            sub="Home equity, cash, retirement money and the other things you own."
          />
          <StatGrid
            items={[
              { label: "Within reach", value: money(r.reachable), note: "Cash above your safety net, plus borrowing room", strong: true },
              { label: "Rules attached", value: money(r.retirement), note: "Retirement money" },
              { label: "Other assets", value: money(r.otherAssets), note: "Accounts, policies, things you own" },
            ]}
          />
          <ResultRows title="The count" rows={mapRows} />
          <ResultRows title="What's within reach" rows={reachRows} />
          <ResultRows
            title="Not dollars, still yours"
            rows={[
              { label: "Credit score", value: creditValid ? String(credit) : credit === null ? "Not entered" : "Check the number" },
              { label: "Your people", value: `${team.length} of ${TEAM.length}` },
              { label: "Time", value: hours ? `${hours} hrs a week` : "Not entered" },
            ]}
          />
          <Note>
            This is a count, not a recommendation. Before you move any of it, talk to a CPA and a
            lender about what fits your situation.
          </Note>
        </>
      }
      how={{
        title: "A count of what is already yours.",
        steps: [
          "Home equity is what your home is worth minus everything you owe on it.",
          "Borrowing room is the share of the value a lender might lend against, minus what you owe. Lenders set that share, so use the number yours gives you.",
          "Your safety net is your monthly bills times the months you want to keep untouched. Only cash above it counts as within reach.",
          "Retirement money is counted, but not as within reach. It comes with rules, taxes and penalties.",
          "Credit, your people and your time are not added to the dollars. They are listed so the picture is complete.",
        ],
      }}
    />
  );
}
