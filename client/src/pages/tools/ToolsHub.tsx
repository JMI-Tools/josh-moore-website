import { CtaBand, PageHero, Reveal, Section, SiteLayout } from "@/components/site";
import { EDUCATIONAL_LINE, ToolCard, useScrollTopOnOpen } from "@/components/tools/ToolKit";
import { TOOLS } from "@/components/tools/toolList";
import { useRouteSeo } from "@/hooks/useSeo";

export default function ToolsHub() {
  useRouteSeo("/tools");
  useScrollTopOnOpen();

  return (
    <SiteLayout>
      <PageHero
        tone="navy"
        eyebrow="Free tools"
        title="Free real estate calculators"
        lede="Six calculators for buying, fixing and holding property. They run in your browser, and nothing you type is saved."
      />

      <Section tone="paper" className="dots-paper">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <li key={tool.path} className="h-full">
              <Reveal delay={0.05 * i} className="h-full">
                <ToolCard tool={tool} />
              </Reveal>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-ink-muted">{EDUCATIONAL_LINE}</p>
      </Section>

      <CtaBand primaryHref="/resources" primaryLabel="More free resources" />
    </SiteLayout>
  );
}
