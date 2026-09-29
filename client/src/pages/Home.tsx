import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  Building,
  Building2,
  Check,
  Factory,
  Home as HomeIcon,
  Tent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand, Reveal, Section, SectionHeading, SiteLayout } from "@/components/site";
import { useRouteSeo } from "@/hooks/useSeo";

const assetClasses = [
  {
    icon: HomeIcon,
    title: "Single family",
    description: "2+ bed, 1+ bath houses in West Michigan and the Flint area. Most conditions, cash or terms.",
  },
  {
    icon: Building2,
    title: "Multifamily",
    description: "2 to 4 unit residential properties. Tired landlords welcome.",
  },
  {
    icon: Building,
    title: "Commercial multifamily",
    description: "10 to 50 units with room to raise rents or fix operations.",
  },
  {
    icon: Tent,
    title: "RV parks",
    description: "Campgrounds and RV communities at a 10% cap rate or better.",
  },
  {
    icon: Factory,
    title: "Mobile home parks",
    description: "Manufactured housing communities at an 8% cap rate or better.",
  },
];

const benefits = [
  "Creative finance structures that actually close",
  "Fast closings with terms built around your situation",
  "Every deal has to work for everyone at the table",
  "Active buyer with a track record in Michigan",
];

const reasons = [
  {
    title: "Creative solutions",
    description:
      "Seller financing, subject-to, lease options, wraps. When the bank says no, there is usually still a way to make the deal work, and I know how to build it.",
  },
  {
    title: "Fast and flexible",
    description:
      "No cookie-cutter offers. I look at what you actually need, whether that is speed, price, a clean exit or time, and I build the terms around it.",
  },
];

export default function Home() {
  useRouteSeo("/");

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white glow-brand">
        <div className="container relative grid items-end gap-10 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:py-0">
          <Reveal className="relative z-10 max-w-2xl lg:py-28">
            <span className="eyebrow eyebrow-line mb-6 text-brand-100">
              West Michigan creative finance
            </span>
            <h1 className="display-xl">
              Creative finance solutions for{" "}
              <span className="text-brand">impossible</span> real estate deals.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/78 md:text-xl">
              I'm Josh Moore, a real estate investor in Michigan. I use creative
              finance to solve problems for homeowners and investors, on houses
              and on commercial property, and turn deals that look impossible
              into wins for everyone involved.
            </p>

            <ul className="mt-9 grid gap-3 sm:grid-cols-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[15px] leading-snug text-white/90">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/25 text-brand-100">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="light" size="lg">
                <Link href="/submit-deal">
                  Submit a deal
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <Link href="/buy-box">View my buy box</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative flex items-end justify-center self-end lg:h-[620px]">
            <div
              aria-hidden="true"
              className="absolute inset-x-6 bottom-0 top-10 rounded-[2.5rem] bg-gradient-to-b from-brand/30 via-brand/10 to-transparent blur-2xl"
            />
            <img
              src="/josh-photo-900.webp"
              alt="Josh Moore"
              width={900}
              height={900}
              fetchPriority="high"
              className="relative z-10 max-h-[440px] w-auto object-contain object-bottom drop-shadow-[0_30px_50px_rgba(0,0,0,0.45)] sm:max-h-[520px] lg:max-h-[600px]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-navy to-transparent"
            />
          </Reveal>
        </div>
      </section>

      {/* Story strip */}
      <section className="border-b border-line bg-paper">
        <div className="container flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow mb-1.5">The story behind the deals</p>
            <p className="font-display text-xl font-semibold tracking-tight text-navy md:text-2xl">
              Sales. Music. Sneakers. And a promise that changed everything.
            </p>
          </div>
          <Link
            href="/mediakit"
            className="inline-flex shrink-0 items-center gap-2 text-[15px] font-semibold text-navy underline-offset-4 hover:text-brand-600 hover:underline"
          >
            See my story and press kit
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Buy box */}
      <Section tone="white">
        <Reveal>
          <SectionHeading
            eyebrow="What I'm buying"
            title="Five asset classes. One way of working."
            lede="I'm actively acquiring in each of these categories, almost always with creative financing. Here is the short version. The full criteria are on the buy box page."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {assetClasses.map((asset, i) => {
            const Icon = asset.icon;
            return (
              <Reveal key={asset.title} delay={0.05 * i}>
                <Link
                  href="/buy-box"
                  className="surface surface-hover group flex h-full flex-col p-7"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-navy text-white">
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-6 text-2xl">{asset.title}</h3>
                  <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-ink-soft">
                    {asset.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
                    View criteria
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
          <Reveal delay={0.25}>
            <Link
              href="/submit-deal"
              className="group flex h-full flex-col justify-between rounded-[1.25rem] bg-navy p-7 text-white transition-transform hover:-translate-y-[3px]"
            >
              <div>
                <p className="eyebrow text-brand-100">Not sure where it fits?</p>
                <h3 className="mt-4 text-2xl">Send it anyway.</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-white/75">
                  If it's real estate and the numbers are honest, I will take a look and tell you straight.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                Submit a deal
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Why work with me */}
      <Section tone="paper" className="dots-paper">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-lift">
              <img
                src="/media-kit/assets/josh-moore-outdoor-fence.jpg"
                alt="Josh Moore on the Lake Michigan shoreline"
                width={960}
                height={1280}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover object-[50%_20%]"
              />
            </div>
            <div className="absolute -bottom-5 -right-3 hidden max-w-[240px] rounded-2xl bg-white p-5 shadow-lift sm:block lg:-right-8">
              <p className="font-display text-lg font-semibold leading-tight text-navy">
                Built from a couch, a one year old, and a promise.
              </p>
              <Link href="/mediakit" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                Read the story <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <SectionHeading
              eyebrow="Why work with me"
              title="Experience, creativity, and deals that work for everyone."
              lede="I'm not an agent and I'm not a bank. I'm the buyer, and I structure every deal myself."
            />
            <ul className="mt-10 space-y-8">
              {reasons.map((r) => (
                <li key={r.title} className="flex gap-5">
                  <span className="mt-1 h-px w-8 shrink-0 bg-brand" aria-hidden="true" />
                  <div>
                    <h3 className="text-xl">{r.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{r.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/about">
                  More about me
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/collaborate">Work with me</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      <CtaBand />
    </SiteLayout>
  );
}
