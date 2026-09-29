import { Link } from "wouter";
import {
  ArrowRight,
  Building,
  Check,
  Factory,
  Home as HomeIcon,
  Tent,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand, PageHero, Reveal, Section, SiteLayout } from "@/components/site";
import { useRouteSeo } from "@/hooks/useSeo";

interface BuyBoxCard {
  id: string;
  title: string;
  shortTitle: string;
  icon: LucideIcon;
  investmentGoal: string;
  criteria: { label: string; value: string }[];
  dealKillers?: string[];
  valueAddFocus: string[];
  ctaText: string;
}

const cards: BuyBoxCard[] = [
  {
    id: "single-family",
    title: "Single Family Residential",
    shortTitle: "Single family",
    icon: HomeIcon,
    investmentGoal: "Fix & Flip",
    criteria: [
      { label: "Max Purchase Price", value: "$400,000" },
      { label: "Offer Formula", value: "70% of ARV minus repairs" },
      { label: "Condition", value: "All conditions accepted. No fire damage, no foundation damage" },
      { label: "Minimum", value: "2 bed / 1 bath" },
      { label: "Financing", value: "Cash or seller financing" },
      { label: "Target Counties", value: "Muskegon, Kent, Ottawa, Kalamazoo, Genesee" },
      { label: "Focus Cities", value: "Muskegon, Grand Rapids, Grand Haven, Spring Lake, Holland, Flint, Lapeer" },
    ],
    valueAddFocus: ["Renovations to maximize ARV", "Fast turnaround for resale"],
    ctaText: "Have a house deal? Submit it here",
  },
  {
    id: "commercial-multifamily",
    title: "Commercial Multifamily",
    shortTitle: "Commercial multifamily",
    icon: Building,
    investmentGoal: "Value-Add Acquisitions",
    criteria: [
      { label: "Unit Count", value: "10 to 50 units" },
      { label: "Markets", value: "Midwest primary; strong deals considered nationally" },
      { label: "Financing", value: "Creative financing only" },
    ],
    dealKillers: ["Motel conversions", "Failed condo conversions"],
    valueAddFocus: ["Rent growth via renovations", "Operational improvements to increase NOI"],
    ctaText: "Have a multifamily deal? Submit it here",
  },
  {
    id: "mobile-home-park",
    title: "Mobile Home Park",
    shortTitle: "Mobile home parks",
    icon: Factory,
    investmentGoal: "Value-Add and Cash Flow",
    criteria: [
      { label: "Min Park Size", value: "30 pads" },
      { label: "Home Type", value: "Tenant-owned preferred; park-owned considered" },
      { label: "Markets", value: "Nationwide" },
      { label: "Financing", value: "Creative financing and seller financing only" },
    ],
    dealKillers: ["On-site waste treatment plants", "Lagoon systems"],
    valueAddFocus: ["Rent growth", "Operational improvements"],
    ctaText: "Have an MHP deal? Submit it here",
  },
  {
    id: "rv-park",
    title: "RV Park",
    shortTitle: "RV parks",
    icon: Tent,
    investmentGoal: "Acquire Underperforming or Established Parks",
    criteria: [
      {
        label: "Park Types",
        value: "Transient (near tourism) and long-term (near population centers); mixed-use accepted",
      },
      { label: "Min Park Size", value: "30 pads" },
      { label: "Markets", value: "Nationwide. No flood zone properties" },
      { label: "Financing", value: "Creative financing and seller financing only" },
    ],
    valueAddFocus: ["Operational improvements", "Enhanced amenities", "Rent growth"],
    ctaText: "Have an RV park deal? Submit it here",
  },
];

export default function BuyBox() {
  useRouteSeo("/buy-box");

  return (
    <SiteLayout>
      <PageHero
        tone="paper"
        eyebrow="Buy box"
        title="What I'm buying right now."
        lede="Here's what I'm actively looking for. If you have a deal that matches these criteria, submit it and let's make it work for everyone at the table."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/submit-deal">
                Submit a deal
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Book a call</Link>
            </Button>
          </>
        }
      />

      {/* Jump links */}
      <div className="border-b border-line bg-white">
        <nav
          aria-label="Buying criteria by asset class"
          className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:gap-6"
        >
          <p className="eyebrow eyebrow-line shrink-0">Buying criteria</p>
          <ul className="flex flex-wrap gap-2">
            {cards.map((card) => (
              <li key={card.id}>
                <a
                  href={`#${card.id}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-navy/15 bg-white px-4 text-sm font-medium text-navy transition-colors hover:border-navy hover:bg-navy/5"
                >
                  {card.shortTitle}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Cards */}
      <Section tone="paper" containerClassName="max-w-6xl space-y-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Reveal key={card.id} delay={0.05 * i}>
              <article id={card.id} className="surface scroll-mt-28 overflow-hidden">
                {/* Card header */}
                <header className="flex flex-col gap-5 border-b border-line p-7 sm:flex-row sm:items-center md:px-9">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-navy text-white">
                    <Icon className="size-7" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h2 className="text-3xl md:text-[2rem]">{card.title}</h2>
                    <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="eyebrow">Goal</span>
                      <span className="text-[15px] font-medium text-navy">{card.investmentGoal}</span>
                    </p>
                  </div>
                </header>

                <div className="grid gap-10 p-7 md:grid-cols-[1.15fr_0.85fr] md:px-9 md:py-8">
                  {/* Criteria */}
                  <div>
                    <h3 className="text-lg">Buying criteria</h3>
                    <dl className="mt-4 divide-y divide-line border-y border-line">
                      {card.criteria.map((item) => (
                        <div key={item.label} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                          <dt className="text-sm font-semibold text-ink-muted">{item.label}</dt>
                          <dd className="text-[15px] leading-relaxed text-navy">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="space-y-5">
                    {/* Deal killers */}
                    {card.dealKillers && (
                      <div className="rounded-2xl border border-destructive/15 bg-destructive/5 p-5">
                        <h3 className="flex items-center gap-2 text-base text-destructive">
                          <XCircle className="size-5" strokeWidth={2} />
                          Deal killers
                        </h3>
                        <ul className="mt-3 space-y-2">
                          {card.dealKillers.map((killer) => (
                            <li key={killer} className="flex items-start gap-2.5 text-[15px] leading-snug text-ink">
                              <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                              {killer}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Value-add focus */}
                    <div className="rounded-2xl border border-line bg-paper p-5">
                      <h3 className="text-base">Value-add focus</h3>
                      <ul className="mt-3 space-y-2">
                        {card.valueAddFocus.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-[15px] leading-snug text-ink">
                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                              <Check className="size-3" strokeWidth={3} />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="border-t border-line p-7 md:px-9 md:py-6">
                  <Button asChild className="w-full sm:w-auto">
                    <Link href="/submit-deal">
                      {card.ctaText}
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </article>
            </Reveal>
          );
        })}
      </Section>

      <CtaBand
        title="Have a deal that fits?"
        lede="If your property matches any of these criteria, I want to hear from you."
        primaryLabel="Submit a deal"
      />
    </SiteLayout>
  );
}
