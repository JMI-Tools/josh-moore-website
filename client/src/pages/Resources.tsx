import {
  ArrowUpRight,
  Bot,
  Briefcase,
  GraduationCap,
  Home,
  Mic,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand, PageHero, Reveal, Section, SectionHeading, SiteLayout } from "@/components/site";
import { useRouteSeo } from "@/hooks/useSeo";

type Resource = {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  url: string;
};

const DEAL_FINDER_URL =
  "https://insiders.itsjoshmoore.com/courses/offers/3f5a5bf0-ec56-4752-ba1f-db9a1a4ab985";

const lendingResources: Resource[] = [
  {
    icon: Briefcase,
    title: "Creative finance-friendly insurance",
    description: "National coverage for investors using creative strategies.",
    buttonText: "Get a quote",
    url: "https://joshmoore.steadilypartner.com",
  },
  // The two Investor Loan Direct cards (construction and hard money loans, and
  // fix and flip loans) come back here when investorloandirect.com is live.
  // The site returned 404 on both www and apex at review time, so they are out
  // rather than shipping two dead buttons. When they return, write the loan
  // line as "Up to 90% LTV, up to 100% of construction costs, and fast
  // closings for fix and flips." and give each card its own URL.
];

const aiResources: Resource[] = [
  {
    icon: Bot,
    title: "Manus AI invite and credits",
    description: "An AI agent that can do and automate work for you. My invite comes with free credits.",
    buttonText: "Get free access",
    url: "https://manus.im/invitation/BNVT5F5DQEDYM",
  },
  {
    icon: Video,
    title: "OpusClip AI editor",
    description: "Turn one long form video into a pile of short form clips, cut by AI.",
    buttonText: "Try OpusClip",
    url: "https://www.opus.pro/?via=26834d",
  },
  {
    icon: Mic,
    title: "ElevenLabs AI",
    description: "Create custom voices or clone your own and have them say anything.",
    buttonText: "Try ElevenLabs",
    url: "https://try.elevenlabs.io/joshmooreinvests",
  },
];

const housingResources: Resource[] = [
  {
    icon: Home,
    title: "Padsplit",
    description: "Raise the cash flow on a house by renting it room by room, with co-living through Padsplit.",
    buttonText: "Get started",
    url: "https://www.padsplit.com/hosts?referral=041351CD&ref_source=link&ref_device=desktop&ref_role=af",
  },
];

/** External link button, always a new tab. */
function ExternalButton({
  href,
  children,
  variant = "outline",
}: {
  href: string;
  children: string;
  variant?: "outline" | "light" | "default";
}) {
  return (
    <Button asChild variant={variant}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <ArrowUpRight />
      </a>
    </Button>
  );
}

/** One resource in a grid: navy icon square, title, one line, one button. */
function ResourceCard({ resource }: { resource: Resource }) {
  const Icon = resource.icon;
  return (
    <article className="surface flex h-full flex-col p-7">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-navy text-white">
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <h3 className="mt-6 text-2xl">{resource.title}</h3>
      <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-ink-soft">{resource.description}</p>
      <div className="mt-6">
        <ExternalButton href={resource.url}>{resource.buttonText}</ExternalButton>
      </div>
    </article>
  );
}

/** A single resource that gets the whole row: icon and copy left, button right. */
function ResourceRow({ resource }: { resource: Resource }) {
  const Icon = resource.icon;
  return (
    <article className="surface flex flex-col gap-6 p-7 md:flex-row md:items-center md:gap-8 md:p-9">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white">
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <div className="flex-1">
        <h3 className="text-2xl">{resource.title}</h3>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{resource.description}</p>
      </div>
      <div className="shrink-0">
        <ExternalButton href={resource.url}>{resource.buttonText}</ExternalButton>
      </div>
    </article>
  );
}

export default function Resources() {
  useRouteSeo("/resources");

  return (
    <SiteLayout>
      <PageHero
        tone="paper"
        eyebrow="Resources"
        title="Tools and services I actually use."
        lede="The insurance, training and software I point people to when they ask. Some of these are referral links, so I may get a credit or a commission if you sign up through them."
      />

      {/* Insurance and lending */}
      <Section tone="white">
        <Reveal>
          <SectionHeading
            eyebrow="Insurance"
            title="Coverage that understands creative deals."
            lede="Landlord and flip policies that do not flinch at seller financing or subject-to. Lending links come back when Investor Loan Direct is live."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {lendingResources.map((resource, i) => (
            <Reveal key={resource.title} delay={0.05 * i}>
              <ResourceCard resource={resource} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Free education and community */}
      <Section tone="paper" className="dots-paper">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] shadow-lift">
              <img
                src="/media-kit/assets/josh-moore-yellow-shirt.jpg"
                alt="Josh Moore"
                width={1279}
                height={1280}
                loading="lazy"
                className="aspect-square w-full object-cover object-[50%_25%]"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-navy text-white">
              <GraduationCap className="size-6" strokeWidth={1.75} />
            </span>
            <SectionHeading
              className="mt-6"
              eyebrow="Free education and community"
              title="West Michigan Deal Finder Academy"
              lede="Free training for West Michigan locals who want to learn how to find off-market houses and get paid a finder's fee when I buy one."
            />
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              No experience needed, no money down and no license. If you know your
              neighborhood and can hold a conversation, you can do this.
            </p>
            <div className="mt-8">
              <ExternalButton href={DEAL_FINDER_URL} variant="default">
                Join free
              </ExternalButton>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* AI tools */}
      <Section tone="white">
        <Reveal>
          <SectionHeading
            eyebrow="AI tools"
            title="The software behind the content."
            lede="What I use to edit, voice and automate the work that goes out under my name."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {aiResources.map((resource, i) => (
            <Reveal key={resource.title} delay={0.05 * i}>
              <ResourceCard resource={resource} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Housing */}
      <Section tone="paper">
        <Reveal>
          <SectionHeading
            eyebrow="Housing"
            title="More cash flow from the same house."
          />
        </Reveal>
        <div className="mt-10 space-y-5">
          {housingResources.map((resource, i) => (
            <Reveal key={resource.title} delay={0.05 * i}>
              <ResourceRow resource={resource} />
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand />
    </SiteLayout>
  );
}
