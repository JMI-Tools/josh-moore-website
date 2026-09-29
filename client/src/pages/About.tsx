import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Building2,
  Check,
  Coins,
  Layers,
  Lightbulb,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CtaBand,
  PageHero,
  Reveal,
  Section,
  SectionHeading,
  SiteLayout,
} from "@/components/site";
import { useRouteSeo } from "@/hooks/useSeo";

const values = [
  {
    icon: Target,
    title: "Win-win solutions",
    description:
      "Every deal I structure has to work for everyone involved: sellers, buyers, and the community around the property.",
  },
  {
    icon: Lightbulb,
    title: "Creative thinking",
    description:
      "Traditional financing doesn't work for every situation. I find a structure where others see a dead end.",
  },
  {
    icon: Users,
    title: "Relationship focused",
    description:
      "Real estate is about people, not just properties. I build lasting relationships on trust and on doing what I said I would do.",
  },
  {
    icon: Award,
    title: "Proven results",
    description:
      "Years of closed transactions across residential, multifamily, and commercial property in Michigan.",
  },
];

const expertise = [
  {
    icon: Coins,
    title: "Creative financing",
    items: ["Seller financing", "Subject-to deals", "Lease options", "Wrap-around mortgages"],
  },
  {
    icon: Building2,
    title: "Property types",
    items: [
      "Single-family homes",
      "Multifamily (2-20 units)",
      "Commercial properties",
      "RV parks & mobile home parks",
    ],
  },
  {
    icon: Layers,
    title: "Deal structures",
    items: [
      "Cash purchases",
      "Terms & owner carry",
      "Joint deals with other operators",
      "Value-add repositioning",
    ],
  },
];

export default function About() {
  useRouteSeo("/about");

  return (
    <SiteLayout>
      <PageHero
        tone="navy"
        eyebrow="About"
        title="Investor. Operator. Dad."
        lede="Creative real estate investor, problem solver, and deal maker in Michigan. I use creative finance to close deals the usual route walks away from, and I was building toward this long before the first closing."
        actions={
          <>
            <Button asChild variant="light" size="lg">
              <Link href="/mediakit">
                Read my full story
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="/submit-deal">Submit a deal</Link>
            </Button>
          </>
        }
        aside={
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-[2rem] shadow-lift">
              <img
                src="/media-kit/assets/josh-moore-yellow-shirt.jpg"
                alt="Josh Moore"
                width={1279}
                height={1280}
                fetchPriority="high"
                className="aspect-[4/5] w-full object-cover object-[22%_50%]"
              />
            </div>
            <div className="absolute -bottom-5 -left-3 max-w-[240px] rounded-2xl bg-white p-5 text-navy shadow-lift sm:-left-6">
              <p className="eyebrow">Home base</p>
              <p className="mt-1.5 font-display text-lg font-semibold leading-tight">
                West Michigan. Houses, multifamily, mobile home parks and RV parks.
              </p>
            </div>
          </div>
        }
      />

      {/* Story */}
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="My story"
              title="Nothing went to plan. All of it got me here."
            />
            <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-ink-soft">
              <p>
                I'm Josh Moore, a creative real estate investor based in Michigan. I turn
                complicated situations into deals that close, and I do it with creative
                finance more often than with a bank.
              </p>
              <p>
                I didn't start here. I sold vacuums door to door in Arizona. I managed a
                rapper, opened a studio, and made my own music for a few years. I bought and
                sold rare sneakers. I co-founded a software startup that spent nine months
                building for a client who ran out of money and couldn't pay. None of it
                worked the way I planned. All of it taught me something.
              </p>
              <p>
                Real estate came out of that fallout. No mentor, no network, not much money.
                I was a stay-at-home dad at the time, so I taught myself between naps and
                episodes of Miss Rachel. It took nine months to get a first property under
                contract, and I had to walk away from that one. Not long after, I walked out
                of my first closing without having put a dollar of my own money into the
                deal.
              </p>
              <p>
                My approach is simple: find the financing structure that works for everyone
                involved. A homeowner facing foreclosure, an owner who wants out of a
                property, a commercial building that needs creative structuring. I
                specialize in making deals happen when traditional financing falls short.
              </p>
              <p>
                Over the years I've closed on single-family homes, multifamily properties,
                commercial buildings, RV parks, and mobile home communities. Every deal is
                different, and I build the structure around the situation instead of forcing
                the situation into a template.
              </p>
              <p className="font-semibold text-navy">
                My mission is to find opportunities where others see obstacles, and to solve
                real problems through creative real estate investing.
              </p>
            </div>
            <Link
              href="/mediakit"
              className="mt-8 inline-flex items-center gap-2 text-[15px] font-semibold text-navy underline-offset-4 hover:text-brand-600 hover:underline"
            >
              The long version, with the music years and the sneaker years, is in my story and press kit
              <ArrowUpRight className="size-4 shrink-0" />
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="lg:pt-24">
            <aside className="rounded-[2rem] bg-navy p-8 text-white glow-brand md:p-10 lg:sticky lg:top-28">
              <p className="eyebrow eyebrow-line text-brand-100">How I think about it</p>
              <p className="mt-6 font-display text-2xl font-semibold leading-snug tracking-tight md:text-[1.75rem]">
                You fail your way to success. Every wrong turn you find and correct is a
                path you never have to walk again.
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-white/75">
                Most people quit before they run out of wrong options. I didn't, and what
                was left is what works. That is the whole method, in real estate and
                everywhere else.
              </p>
              <Link
                href="/mediakit"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline"
              >
                Read the long version
                <ArrowUpRight className="size-4" />
              </Link>
            </aside>
          </Reveal>
        </div>
      </Section>

      {/* Values */}
      <Section tone="paper" className="dots-paper">
        <Reveal>
          <SectionHeading
            eyebrow="Core values"
            title="The principles behind every deal."
            lede="The principles that guide every deal I make, whether it is a single house or a fifty-pad park."
            align="center"
          />
        </Reveal>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
          {values.map((value, i) => {
            const Icon = value.icon;
            return (
              <Reveal key={value.title} delay={0.05 * i}>
                <div className="surface flex h-full gap-5 p-7">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white">
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="text-2xl">{value.title}</h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">
                      {value.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Expertise */}
      <Section tone="white">
        <Reveal>
          <SectionHeading
            eyebrow="Areas of expertise"
            title="What I know how to do."
            lede="The tools, the property types, and the ways a deal can be put together."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {expertise.map((group, i) => {
            const Icon = group.icon;
            return (
              <Reveal key={group.title} delay={0.05 * i}>
                <div className="surface flex h-full flex-col p-7">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-navy text-white">
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-6 text-2xl">{group.title}</h3>
                  <ul className="mt-5 space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-ink-soft">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/buy-box">
                See what I'm buying
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/collaborate">Work with me</Link>
            </Button>
          </div>
        </Reveal>
      </Section>

      <CtaBand />
    </SiteLayout>
  );
}
