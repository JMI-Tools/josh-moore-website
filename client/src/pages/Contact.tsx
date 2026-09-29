import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, Reveal, Section, SectionHeading, SiteLayout } from "@/components/site";
import { SOCIAL_LINKS } from "@/components/site/siteData";
import { useRouteSeo } from "@/hooks/useSeo";

const PRESS_EMAIL = "J.Moore@itsjoshmoore.com";

/** "instagram.com/joshmooreinvests" from a full profile URL. */
function shortUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "");
}

export default function Contact() {
  useRouteSeo("/contact");

  // GoHighLevel sizes its booking iframe through this script. Rendering a
  // <script> tag in JSX does nothing, so it is loaded here instead.
  useEffect(() => {
    const id = "ghl-form-embed";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://api.robonurture.com/js/form_embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <SiteLayout>
      <PageHero
        tone="navy"
        eyebrow="Contact"
        title="Let's talk."
        lede="Got a deal, a question, or an idea for working together? Pick a time below and we will get on a call. No pitch, just a straight conversation about what you have."
        aside={
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] shadow-lift lg:max-w-none">
            <img
              src="/media-kit/josh-current.jpg"
              alt="Josh Moore"
              width={976}
              height={1280}
              className="aspect-[4/5] w-full object-cover object-[50%_20%]"
            />
          </div>
        }
      />

      {/* Booking */}
      <Section tone="white">
        <Reveal className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Book a call"
            title="Pick a time that works."
          />
          <p className="mt-6 text-sm text-ink-muted">
            Booking a call means Josh may text or email you about the appointment.
          </p>
          <div className="surface mt-4 overflow-hidden" style={{ minHeight: "700px" }}>
            <iframe
              src="https://api.robonurture.com/widget/booking/AMXLElNg9ITea67HZMPw"
              style={{ width: "100%", height: "700px", border: "none" }}
              frameBorder="0"
              id="NSge8QwJ9emndXiMbRER_1772926901115"
              title="Book a call with Josh Moore"
            />
          </div>
        </Reveal>
      </Section>

      {/* Follow along */}
      <Section tone="paper" className="dots-paper">
        <Reveal>
          <SectionHeading
            eyebrow="Follow along"
            title="Deals, lessons and the day to day."
            lede="I show the work as it happens. Pick the platform you already open."
          />
        </Reveal>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SOCIAL_LINKS.map((social, i) => (
            <li key={social.platform} className="h-full">
              <Reveal delay={0.05 * i} className="h-full">
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="surface surface-hover group flex h-full flex-col p-6"
                >
                  <img
                    src={social.icon}
                    alt=""
                    className="size-12 rounded-full object-contain"
                    width={48}
                    height={48}
                    loading="lazy"
                  />
                  <span className="mt-5 flex items-center gap-1.5 font-display text-xl font-bold tracking-tight text-navy">
                    {social.label}
                    <ArrowUpRight className="size-4 text-brand-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  <span className="mt-1 break-all text-[13px] text-ink-muted">{shortUrl(social.url)}</span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={0.2}>
          <div className="glow-brand mt-8 flex flex-col gap-6 rounded-[2rem] bg-navy p-8 text-white md:flex-row md:items-center md:justify-between md:p-10">
            <div className="flex items-start gap-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-100">
                <Mail className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <p className="eyebrow text-brand-100">Press and media</p>
                <h3 className="mt-2 text-2xl text-white">Interviews, podcasts and speaking</h3>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/75">
                  Email{" "}
                  <a
                    href={`mailto:${PRESS_EMAIL}`}
                    className="font-semibold text-white underline-offset-4 hover:underline"
                  >
                    {PRESS_EMAIL}
                  </a>{" "}
                  and grab the bio, photos and story from the press kit.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 md:shrink-0">
              <Button asChild variant="light">
                <a href={`mailto:${PRESS_EMAIL}`}>Email for press</a>
              </Button>
              <Button asChild variant="outline-light">
                <Link href="/mediakit">Press kit</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </SiteLayout>
  );
}
