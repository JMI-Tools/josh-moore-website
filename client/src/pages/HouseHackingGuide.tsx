import { BookOpen, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand, PageHero, Reveal, Section, SectionHeading, SiteLayout } from "@/components/site";
import { useRouteSeo } from "@/hooks/useSeo";

const GUIDE_PDF = "/house-hacking-guide.pdf";
const GUIDE_FILENAME = "Live-In-Rent-Smart-House-Hacking-Guide.pdf";
const KIT_PDF = "/house-hacking-starter-kit.pdf";
const KIT_FILENAME = "Josh-Moore-House-Hacking-Starter-Kit.pdf";

const chapters = [
  {
    number: "01",
    title: "A home with an income stream",
    description: "Understand the idea and the tradeoffs.",
    page: 4,
  },
  {
    number: "02",
    title: "Pick the version you can live with",
    description: "Rooms, small multifamily, ADUs, and furnished stays.",
    page: 6,
  },
  {
    number: "03",
    title: "Make the numbers tell the truth",
    description: "Full costs, reserves, financing, and stress tests.",
    page: 12,
  },
  {
    number: "04",
    title: "Buy a property that works in real life",
    description: "Legal use, inspections, rent research, and closing.",
    page: 20,
  },
  {
    number: "05",
    title: "Operate it like someone's home",
    description: "Fair housing, screening, leases, safety, and taxes.",
    page: 26,
  },
  {
    number: "06",
    title: "Put the plan into motion",
    description: "A 90-day plan plus two reusable worksheets.",
    page: 32,
  },
];

const highlights = [
  "Lower your housing cost, potentially to $0",
  "Learn the numbers before you buy",
  "Understand every strategy: rooms, ADUs, small multifamily, furnished stays",
  "Run real stress tests on any deal",
  "Navigate fair housing, leases, and landlord basics",
  "90-day action plan included",
];

const kitTools = ["Lender questions", "90-day plan", "Property scorecard", "Deal analyzer"];

/** The guide's cover, drawn in the site's own type so it matches the PDF. */
function GuideCover() {
  return (
    <div className="mx-auto w-full max-w-[22rem]">
      <div className="overflow-hidden rounded-[2rem] bg-white text-navy shadow-lift">
        <div className="p-8 md:p-10">
          <p className="eyebrow">A practical guide for first-time buyers</p>
          <p className="mt-6 font-display text-4xl font-bold leading-[1.02] tracking-tight md:text-5xl">
            Live In,
            <br />
            Rent Smart
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            The friendly beginner's guide to house hacking
          </p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
            By Josh Moore
          </p>
        </div>
        <div className="border-t border-line bg-paper px-8 py-3.5">
          <p className="text-center text-xs text-ink-muted">
            Lower your housing cost. Learn the numbers. Buy with a plan.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HouseHackingGuide() {
  useRouteSeo("/househackingguide");

  return (
    <SiteLayout>
      <PageHero
        tone="navy"
        eyebrow="Free guide"
        title={
          <>
            Live In, <span className="text-brand">Rent Smart</span>
          </>
        }
        lede={
          <>
            The friendly beginner's guide to house hacking. A practical guide for
            first-time buyers who want to lower their housing cost, learn the numbers,
            and buy with a plan.
          </>
        }
        actions={
          <>
            <Button asChild variant="light" size="lg">
              <a href={GUIDE_PDF} download={GUIDE_FILENAME}>
                <Download />
                Download the free PDF
              </a>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <a href="#read-online">
                <BookOpen />
                Read online
              </a>
            </Button>
          </>
        }
        aside={<GuideCover />}
      />

      {/* What's inside */}
      <Section tone="white">
        <Reveal>
          <SectionHeading
            eyebrow="What's inside"
            title="Everything a first-time buyer needs to run the numbers."
            lede="No theory for the sake of theory. Each chapter ends with something you can use on the next house you look at."
          />
        </Reveal>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, i) => (
            <li key={item} className="h-full">
              <Reveal delay={0.05 * i} className="surface flex h-full items-start gap-4 p-6">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                <span className="text-[15px] leading-relaxed text-ink">{item}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* Table of contents */}
      <Section tone="paper" className="dots-paper">
        <Reveal>
          <SectionHeading
            eyebrow="Table of contents"
            title="Six chapters, start to finish."
            lede="From the first idea to the day you hand over keys."
          />
        </Reveal>
        <ol className="mt-12 grid gap-4 md:grid-cols-2">
          {chapters.map((chapter, i) => (
            <li key={chapter.number} className="h-full">
              <Reveal delay={0.05 * i} className="surface flex h-full gap-5 p-6 md:p-7">
                <span
                  className="font-display text-3xl font-bold leading-none tracking-tight text-brand-600 md:text-4xl"
                  aria-hidden="true"
                >
                  {chapter.number}
                </span>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl">
                    <span className="sr-only">Chapter {chapter.number}: </span>
                    {chapter.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{chapter.description}</p>
                  <p className="mt-3 text-sm font-medium text-ink-muted">Page {chapter.page}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      {/* Starter kit */}
      <Section tone="white">
        <Reveal>
          <div className="glow-brand grid gap-10 overflow-hidden rounded-[2rem] bg-navy p-8 text-white md:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-14">
            <div>
              <span className="eyebrow eyebrow-line text-brand-100">Free companion resource</span>
              <h2 className="display-md mt-5 text-white">House Hacking Starter Kit</h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/78">
                Four tools. One clearer buy box. The worksheets from the guide, pulled out so
                you can print them and take them to a showing.
              </p>
              <div className="mt-8">
                <Button asChild variant="light" size="lg">
                  <a href={KIT_PDF} download={KIT_FILENAME}>
                    <Download />
                    Download the starter kit
                  </a>
                </Button>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {kitTools.map((tool) => (
                <li
                  key={tool}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-[15px] font-medium"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/25 text-brand-100">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      {/* Read online */}
      <Section tone="paper" id="read-online" className="scroll-mt-20">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Read online"
              title="The whole guide, right here."
              lede="Scroll through it in the browser, or grab the PDF for later."
            />
            <Button asChild variant="outline" className="shrink-0">
              <a href={GUIDE_PDF} download={GUIDE_FILENAME}>
                <Download />
                Download PDF
              </a>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="surface mt-10 overflow-hidden bg-navy">
            <iframe
              src={GUIDE_PDF}
              className="block w-full"
              style={{ height: "85vh", minHeight: "600px" }}
              title="Live In, Rent Smart: the house hacking guide by Josh Moore"
            />
          </div>
          <p className="mt-4 text-center text-sm text-ink-muted">
            If the PDF does not load in your browser,{" "}
            <a
              href={GUIDE_PDF}
              download={GUIDE_FILENAME}
              className="font-semibold text-brand-600 underline-offset-4 hover:underline"
            >
              download it here
            </a>
            .
          </p>
        </Reveal>
      </Section>

      <CtaBand primaryHref="/resources" primaryLabel="More free resources" />
    </SiteLayout>
  );
}
