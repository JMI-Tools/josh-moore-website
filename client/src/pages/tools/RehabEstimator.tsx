import { useMemo, useState, type ReactNode } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Note,
  NumberField,
  ResultHero,
  ResultRows,
  Segmented,
  ToolLink,
  ToolPage,
  money,
  type Row,
} from "@/components/tools/ToolKit";
import { rehabTotals } from "@shared/calculators";
import { cn } from "@/lib/utils";

type Level = "low" | "mid" | "high";
type QtyFrom = "sqft" | "baths" | "windows" | null;

interface Item {
  id: string;
  group: string;
  label: string;
  unit: string;
  qtyFrom: QtyFrom;
  /** Quantity when it does not come from the house. */
  qty?: number;
  /** Starting unit costs: low end, middle and high end of the source's range. Null: no figure. */
  cost: Record<Level, number> | null;
  range: string;
  source: { title: string; url: string; updated: string };
  on: boolean;
}

const TOH = "https://www.thisoldhouse.com";
const RENOVATION = { title: "Home renovation cost", url: `${TOH}/home-finances/reviews/home-renovation-cost`, updated: "Mar 31, 2026" };

/**
 * Starting costs from This Old House cost guides (national figures, 2026). They are a
 * place to start. Local prices differ, and a contractor's quote replaces any of them.
 */
const ITEMS: Item[] = [
  {
    id: "paint-int",
    group: "Interior",
    label: "Interior paint",
    unit: "sq ft of floor",
    qtyFrom: "sqft",
    cost: { low: 1, mid: 2.5, high: 4 },
    range: "$1 to $4 per sq ft of floor",
    source: { title: "Interior painting cost", url: `${TOH}/painting/interior-painting-cost`, updated: "Apr 20, 2026" },
    on: true,
  },
  {
    id: "lvp",
    group: "Interior",
    label: "Vinyl plank flooring",
    unit: "sq ft",
    qtyFrom: "sqft",
    cost: { low: 5, mid: 11, high: 17 },
    range: "$2 to $7 a sq ft for standard plank, plus $3 to $10 to install",
    source: { title: "Vinyl plank flooring cost", url: `${TOH}/flooring/cost-to-install-vinyl-plank-flooring`, updated: "Jun 5, 2026" },
    on: true,
  },
  {
    id: "carpet",
    group: "Interior",
    label: "Carpet",
    unit: "sq ft",
    qtyFrom: null,
    qty: 0,
    cost: { low: 3, mid: 7, high: 11 },
    range: "$3 to $11 per sq ft installed. Split the floor with the plank line.",
    source: { title: "Carpet installation cost", url: `${TOH}/flooring/carpet-installation-cost`, updated: "Jun 8, 2026" },
    on: false,
  },
  {
    id: "kitchen",
    group: "Kitchen and bath",
    label: "Kitchen remodel",
    unit: "kitchen",
    qtyFrom: null,
    qty: 1,
    cost: { low: 14_550, mid: 27_475, high: 40_400 },
    range: "$14,550 to $40,400",
    source: RENOVATION,
    on: true,
  },
  {
    id: "bath",
    group: "Kitchen and bath",
    label: "Bathroom remodel",
    unit: "bathroom",
    qtyFrom: "baths",
    cost: { low: 6600, mid: 17_300, high: 28_000 },
    range: "$6,600 to $28,000 each",
    source: RENOVATION,
    on: true,
  },
  {
    id: "roof",
    group: "Exterior",
    label: "Roof, asphalt shingles",
    unit: "sq ft of roof",
    qtyFrom: "sqft",
    cost: { low: 5.16, mid: 5.16, high: 5.16 },
    range: "$5.16 per sq ft. A two-story's roof is closer to half its living area.",
    source: { title: "New roof cost", url: `${TOH}/roofing/new-roof-cost`, updated: "Oct 7, 2026" },
    on: false,
  },
  {
    id: "windows",
    group: "Exterior",
    label: "Replacement windows",
    unit: "window",
    qtyFrom: "windows",
    cost: { low: 472, mid: 517, high: 564 },
    range: "$517 average; vinyl $472, fiberglass $564",
    source: { title: "Window replacement cost", url: `${TOH}/windows/window-replacement-cost`, updated: "Aug 11, 2026" },
    on: false,
  },
  {
    id: "siding",
    group: "Exterior",
    label: "Vinyl siding",
    unit: "sq ft of house",
    qtyFrom: "sqft",
    cost: { low: 2, mid: 6, high: 10 },
    range: "$2,000 to $10,000 for a 1,000 sq ft house",
    source: { title: "Vinyl siding cost", url: `${TOH}/siding/vinyl-siding-cost`, updated: "Jun 11, 2026" },
    on: false,
  },
  {
    id: "paint-ext",
    group: "Exterior",
    label: "Exterior paint",
    unit: "sq ft of wall",
    qtyFrom: "sqft",
    cost: { low: 2.2, mid: 3.3, high: 4.4 },
    range: "$2.20 to $4.40 per sq ft of paintable area",
    source: { title: "Exterior painting cost", url: `${TOH}/painting/exterior-painting-cost`, updated: "Mar 6, 2026" },
    on: false,
  },
  {
    id: "furnace",
    group: "Systems",
    label: "Gas furnace",
    unit: "furnace",
    qtyFrom: null,
    qty: 1,
    cost: { low: 3800, mid: 6900, high: 10_000 },
    range: "$3,800 to $10,000, ductwork not included",
    source: { title: "HVAC installation cost", url: `${TOH}/heating-cooling/hvac-installation-cost`, updated: "Jun 12, 2026" },
    on: false,
  },
  {
    id: "ac",
    group: "Systems",
    label: "Central air conditioner",
    unit: "system",
    qtyFrom: null,
    qty: 1,
    cost: { low: 4000, mid: 6000, high: 8000 },
    range: "$4,000 to $8,000, ductwork not included",
    source: { title: "HVAC installation cost", url: `${TOH}/heating-cooling/hvac-installation-cost`, updated: "Jun 12, 2026" },
    on: false,
  },
  {
    id: "panel",
    group: "Systems",
    label: "Electrical panel, 200 amp",
    unit: "panel",
    qtyFrom: null,
    qty: 1,
    cost: { low: 1300, mid: 2150, high: 3000 },
    range: "$1,300 low, $2,150 average, $3,000 high",
    source: { title: "Electrical panel upgrade cost", url: `${TOH}/electrical/cost-to-upgrade-electrical-panel`, updated: "Mar 31, 2026" },
    on: false,
  },
  {
    id: "water-heater",
    group: "Systems",
    label: "Water heater",
    unit: "water heater",
    qtyFrom: null,
    qty: 1,
    cost: null,
    range: "No figure in our source. Add your quote.",
    source: { title: "No figure found", url: "", updated: "" },
    on: false,
  },
  {
    id: "dumpster",
    group: "Site and paperwork",
    label: "Dumpster, 30 yard",
    unit: "dumpster",
    qtyFrom: null,
    qty: 1,
    cost: { low: 360, mid: 585, high: 809 },
    range: "$360 to $809 all-inclusive at one national company",
    source: { title: "Dumpster rental companies", url: `${TOH}/moving/best-dumpster-rental-companies`, updated: "Jun 9, 2026" },
    on: true,
  },
  {
    id: "permits",
    group: "Site and paperwork",
    label: "Permits and inspections",
    unit: "project",
    qtyFrom: null,
    qty: 1,
    cost: { low: 500, mid: 1500, high: 2500 },
    range: "$500 to $2,500",
    source: RENOVATION,
    on: true,
  },
];

const GROUPS = ["Interior", "Kitchen and bath", "Exterior", "Systems", "Site and paperwork"];

interface LineState {
  enabled: boolean;
  /** Null: the quantity follows the house. */
  qty: number | null;
  unitCost: number | null;
}

interface CustomLine extends LineState {
  key: number;
  label: string;
}

interface House {
  sqft: number | null;
  baths: number | null;
  windows: number | null;
}

const EXAMPLE_HOUSE: House = { sqft: 1400, baths: 1, windows: 12 };

function startingLines(level: Level): Record<string, LineState> {
  return Object.fromEntries(
    ITEMS.map((item) => [item.id, { enabled: item.on, qty: null, unitCost: item.cost ? item.cost[level] : null }]),
  );
}

function autoQty(item: Item, house: House): number {
  if (item.qtyFrom === "sqft") return house.sqft ?? 0;
  if (item.qtyFrom === "baths") return house.baths ?? 0;
  if (item.qtyFrom === "windows") return house.windows ?? 0;
  return item.qty ?? 1;
}

function LineRow({
  label,
  detail,
  unit,
  state,
  qty,
  onChange,
  labelSlot,
  action,
}: {
  label: string;
  detail?: string;
  unit: string;
  state: LineState;
  qty: number;
  onChange: (next: LineState) => void;
  labelSlot?: ReactNode;
  action?: ReactNode;
}) {
  const total = state.enabled ? Math.max(0, qty) * Math.max(0, state.unitCost ?? 0) : 0;
  return (
    <div className="grid gap-3 border-t border-line py-4 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_6.5rem_8.5rem] sm:items-start">
      <div className="flex items-start gap-3 sm:col-span-3">
        <input
          type="checkbox"
          checked={state.enabled}
          onChange={(e) => onChange({ ...state, enabled: e.target.checked })}
          aria-label={`Include ${label || "this line"}`}
          className="mt-1 size-5 shrink-0 accent-navy"
        />
        <div className="min-w-0 flex-1">
          {labelSlot ?? <p className="font-semibold text-navy">{label}</p>}
          {detail && <p className="mt-0.5 text-sm leading-snug text-ink-muted">{detail}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn("font-semibold tabular-nums", state.enabled ? "text-navy" : "text-ink-muted line-through")}>
            {money(total)}
          </span>
          {action}
        </div>
      </div>
      <div className={cn("grid grid-cols-2 items-end gap-3 sm:col-span-3 sm:grid-cols-[6.5rem_10rem] sm:pl-8", !state.enabled && "opacity-60")}>
        <NumberField label="Quantity" value={qty} onChange={(next) => onChange({ ...state, qty: next })} decimals={1} />
        <NumberField
          label={`Per ${unit}`}
          prefix="$"
          value={state.unitCost}
          onChange={(next) => onChange({ ...state, unitCost: next })}
          placeholder="Quote"
        />
      </div>
    </div>
  );
}

export default function RehabEstimator() {
  const [house, setHouse] = useState<House>(EXAMPLE_HOUSE);
  const [level, setLevel] = useState<Level>("low");
  const [lines, setLines] = useState<Record<string, LineState>>(() => startingLines("low"));
  const [custom, setCustom] = useState<CustomLine[]>([]);
  const [nextKey, setNextKey] = useState(1);
  const [contingency, setContingency] = useState<number | null>(10);

  const changeLevel = (next: Level) => {
    setLevel(next);
    setLines((prev) =>
      Object.fromEntries(
        ITEMS.map((item) => [item.id, { ...prev[item.id], unitCost: item.cost ? item.cost[next] : prev[item.id].unitCost }]),
      ),
    );
  };

  const reset = () => {
    setHouse(EXAMPLE_HOUSE);
    setLevel("low");
    setLines(startingLines("low"));
    setCustom([]);
    setContingency(10);
  };

  const resolved = ITEMS.map((item) => {
    const s = lines[item.id];
    return { item, state: s, qty: s.qty ?? autoQty(item, house) };
  });

  const totals = useMemo(
    () =>
      rehabTotals(
        [
          ...resolved.map((l) => ({ enabled: l.state.enabled, qty: l.qty, unitCost: l.state.unitCost })),
          ...custom.map((c) => ({ enabled: c.enabled, qty: c.qty, unitCost: c.unitCost })),
        ],
        contingency,
        house.sqft,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines, custom, contingency, house],
  );

  const lineTotal = (enabled: boolean, qty: number | null, unitCost: number | null) =>
    enabled ? Math.max(0, qty ?? 0) * Math.max(0, unitCost ?? 0) : 0;

  const groupRows: Row[] = [
    ...GROUPS.map((group) => ({
      label: group,
      value: money(
        resolved.filter((l) => l.item.group === group).reduce((sum, l) => sum + lineTotal(l.state.enabled, l.qty, l.state.unitCost), 0),
      ),
    })),
    ...(custom.length
      ? [{ label: "Your own lines", value: money(custom.reduce((sum, c) => sum + lineTotal(c.enabled, c.qty, c.unitCost), 0)) }]
      : []),
    { label: "Subtotal", value: money(totals.subtotal), kind: "total" },
    { label: `Contingency (${contingency ?? 0}%)`, value: money(totals.contingency) },
    { label: "Rehab budget", value: money(totals.total), kind: "total" },
  ];

  const sources = Array.from(
    new Map(ITEMS.filter((i) => i.source.url).map((i) => [i.source.url, i.source])).values(),
  );

  return (
    <ToolPage
      path="/rehab-estimator"
      title="Rehab estimator"
      lede="Check off what the house needs and get a line-by-line rehab budget. Every starting cost is a national figure you can overwrite with your contractor's number."
      mobileBar={{ label: "Rehab budget", value: money(totals.total) }}
      inputs={
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-ink-soft">Example house. Put in yours.</p>
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              <RotateCcw />
              Reset
            </Button>
          </div>

          <FieldGroup title="The house" note="Quantities that depend on size fill in from here. Change any of them below.">
            <NumberField
              label="Living area"
              suffix="sq ft"
              value={house.sqft}
              onChange={(sqft) => setHouse((h) => ({ ...h, sqft }))}
              decimals={0}
            />
            <NumberField
              label="Bathrooms"
              value={house.baths}
              onChange={(baths) => setHouse((h) => ({ ...h, baths }))}
              decimals={1}
            />
            <NumberField
              label="Windows"
              value={house.windows}
              onChange={(windows) => setHouse((h) => ({ ...h, windows }))}
              decimals={0}
            />
            <NumberField
              label="Contingency"
              suffix="%"
              value={contingency}
              onChange={setContingency}
              decimals={1}
              help="The same source suggests adding 10% to 15% to contractor estimates."
            />
            <Segmented
              className="sm:col-span-2"
              label="Starting costs"
              value={level}
              onChange={changeLevel}
              options={[
                { value: "low", label: "Low end" },
                { value: "mid", label: "Middle" },
                { value: "high", label: "High end" },
              ]}
            />
          </FieldGroup>

          {GROUPS.map((group) => (
            <section key={group} className="surface p-5 md:p-7" aria-label={group}>
              <h2 className="mb-5 text-xl text-navy md:text-2xl">{group}</h2>
              {resolved
                .filter((l) => l.item.group === group)
                .map(({ item, state, qty }) => (
                  <LineRow
                    key={item.id}
                    label={item.label}
                    detail={item.range}
                    unit={item.unit}
                    state={state}
                    qty={qty}
                    onChange={(next) => setLines((prev) => ({ ...prev, [item.id]: next }))}
                  />
                ))}
            </section>
          ))}

          <section className="surface p-5 md:p-7" aria-label="Your own lines">
            <h2 className="mb-2 text-xl text-navy md:text-2xl">Your own lines</h2>
            <p className="mb-5 text-[15px] text-ink-soft">Appliances, landscaping, anything the list misses.</p>
            {custom.map((c) => (
              <LineRow
                key={c.key}
                label={c.label}
                unit="unit"
                state={c}
                qty={c.qty ?? 0}
                onChange={(next) => setCustom((prev) => prev.map((x) => (x.key === c.key ? { ...x, ...next } : x)))}
                labelSlot={
                  <input
                    type="text"
                    value={c.label}
                    placeholder="What is it?"
                    aria-label="Line name"
                    className="field min-h-10 py-2"
                    onChange={(e) =>
                      setCustom((prev) => prev.map((x) => (x.key === c.key ? { ...x, label: e.target.value } : x)))
                    }
                  />
                }
                action={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove this line"
                    onClick={() => setCustom((prev) => prev.filter((x) => x.key !== c.key))}
                  >
                    <Trash2 />
                  </Button>
                }
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(custom.length > 0 && "mt-4")}
              onClick={() => {
                setCustom((prev) => [...prev, { key: nextKey, label: "", enabled: true, qty: 1, unitCost: null }]);
                setNextKey((k) => k + 1);
              }}
            >
              <Plus />
              Add a line
            </Button>
          </section>
        </>
      }
      results={
        <>
          <ResultHero
            label="Rehab budget"
            value={money(totals.total)}
            sub={
              totals.perSquareFoot !== null
                ? `${money(totals.perSquareFoot, true)} a square foot, with a ${contingency ?? 0}% contingency.`
                : `Includes a ${contingency ?? 0}% contingency.`
            }
          />
          <ResultRows title="By area" rows={groupRows} />
          <div className="surface p-5 md:p-7">
            <ToolLink href={`/mao-calculator?repairs=${Math.round(totals.total)}`}>
              Use this budget in the max offer calculator
            </ToolLink>
          </div>
          <Note>
            Starting costs are national figures from This Old House cost guides updated in 2026.
            Prices where you buy will differ. Replace them with quotes from your contractors.
          </Note>
        </>
      }
      how={{
        title: "Quantity times cost, line by line.",
        steps: [
          "Check the work the house needs. Lines that depend on size fill in from the living area, bathrooms and windows. Change any quantity.",
          "Starting costs come from the low end, middle or high end of national 2026 ranges. Overwrite any of them with your contractor's number.",
          "Each line is quantity times cost. The subtotal adds the checked lines.",
          "Contingency covers what you cannot see yet. It is added on top of the subtotal.",
        ],
      }}
      footnote={
        <details className="rounded-2xl border border-line bg-white p-4">
          <summary className="cursor-pointer font-semibold text-navy">Where the starting costs come from</summary>
          <ul className="mt-3 space-y-1.5">
            {sources.map((s) => (
              <li key={s.url}>
                This Old House,{" "}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline-offset-4 hover:underline">
                  {s.title}
                </a>
                , updated {s.updated}.
              </li>
            ))}
            <li>Middle values are the midpoint of each range. Water heaters had no figure, so that line waits for your quote.</li>
          </ul>
        </details>
      }
    />
  );
}
