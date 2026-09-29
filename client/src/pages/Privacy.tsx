import type { ReactNode } from "react";
import { PageHero, Reveal, Section, SiteLayout } from "@/components/site";
import { useRouteSeo } from "@/hooks/useSeo";

const PRIVACY_EMAIL = "J.Moore@itsjoshmoore.com";

/** One policy section: a display-md heading and a few short paragraphs or a list. */
function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal className="py-10 first:pt-0">
      <section>
        <h2 className="display-md text-navy">{title}</h2>
        <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-ink-soft">{children}</div>
      </section>
    </Reveal>
  );
}

export default function Privacy() {
  useRouteSeo("/privacy");

  return (
    <SiteLayout>
      <PageHero
        tone="paper"
        eyebrow="Privacy"
        title="Privacy policy"
        lede="Plain answers about what this site collects and where it goes."
      />

      <Section tone="white">
        <div className="mx-auto max-w-3xl divide-y divide-line">
          <Clause title="What this site collects">
            <p>
              Most of what I have about you is what you typed. Three forms on this site
              send me information: the deal submission form, the collaborate form and the
              contractor form. Each one collects your name, email and phone, plus the
              answers you give to the questions on it, which can include a company name,
              property details, numbers, and anything you put in a notes box.
            </p>
            <p>
              The booking calendar on the contact page collects your name, email and phone
              along with the time you pick, so the appointment can be confirmed.
            </p>
            <p>
              The site also uses Google Analytics to count page views. That records which
              pages were opened, roughly where a visitor came from, and the type of device
              and browser. It does not tell me who you are.
            </p>
          </Clause>

          <Clause title="Where it goes">
            <p>When you submit a form or book a call, the information lands in a few places:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-brand">
              <li>
                My CRM at GoHighLevel, where it becomes a contact record with the deal or
                note attached, and where the booking calendar lives.
              </li>
              <li>A database I use to store form submissions, so nothing is lost if the CRM has a bad day.</li>
              <li>An email alert to me, so I see it quickly.</li>
              <li>Google Analytics, for the page view counts described above.</li>
            </ul>
            <p>Nobody else gets it. See the sharing section below.</p>
          </Clause>

          <Clause title="Why I collect it">
            <p>
              Four reasons. To review the deals people send me. To respond to the people
              who reach out. To schedule and keep the calls people book. And to see which
              pages get used so I can make the site better.
            </p>
          </Clause>

          <Clause title="Texting">
            <p>
              I only send text messages to a number when the SMS consent box on a form was
              checked, or when you book a call and I need to confirm or reschedule it. Reply
              STOP at any time to opt out and HELP for help. Message and data rates may
              apply, and how often I text depends on what we are working on together.
            </p>
          </Clause>

          <Clause title="Sharing">
            <p>
              I do not sell your information, and I do not rent it, trade it or hand it to
              anyone for their own marketing. The only companies that touch it are the
              services listed above that run this site, and they handle it on my behalf. I
              would also share it if the law required me to.
            </p>
          </Clause>

          <Clause title="Links to other sites">
            <p>
              The resources page and a few other spots link to companies I do not control.
              Some of those are referral links. Once you click through, their privacy policy
              applies, not this one, so read it before you sign up for anything.
            </p>
          </Clause>

          <Clause title="Cookies and analytics">
            <p>
              Google Analytics sets cookies to tell repeat visitors from new ones. You can
              block or clear cookies in your browser settings, or install Google's opt-out
              browser add-on, and the site will still work. The booking calendar may set its
              own cookies so your appointment loads properly.
            </p>
          </Clause>

          <Clause title="Your information">
            <p>
              If you want to see what I have on you, fix something that is wrong, or have it
              deleted, email{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="font-semibold text-brand-600 underline-offset-4 hover:underline">
                {PRIVACY_EMAIL}
              </a>{" "}
              and tell me which form or call it came from. I will take care of it and let
              you know when it is done.
            </p>
          </Clause>

          <Clause title="Children">
            <p>
              This site is for adults doing business. I do not knowingly collect information
              from anyone under 18. If you think a minor has sent me something, email me at
              the address above and I will delete it.
            </p>
          </Clause>

          <Clause title="Changes">
            <p>
              If the way this site handles information changes, I will update this page and
              change the date below. Anything you send after that date is covered by the new
              version.
            </p>
          </Clause>

          <Reveal className="pt-8">
            <p className="text-sm text-ink-muted">Last updated September 28, 2026</p>
          </Reveal>
        </div>
      </Section>
    </SiteLayout>
  );
}
