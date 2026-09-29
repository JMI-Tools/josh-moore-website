import { Link } from "wouter";
import { LEGAL_LINE, NAV_LINKS, SOCIAL_LINKS } from "@/components/site/siteData";
import { SocialIcon } from "@/components/site/SocialIcon";

const EXPLORE = NAV_LINKS.filter((l) => !["/", "/submit-deal", "/collaborate"].includes(l.href));

const WORK_LINKS = [
  { href: "/submit-deal", label: "Submit a deal" },
  { href: "/collaborate", label: "Collaborate" },
  { href: "/contractors", label: "Contractors and trades" },
  { href: "/contact", label: "Book a call" },
  { href: "/mediakit", label: "Press kit" },
];

const FREE_LINKS = [
  { href: "/househackingguide", label: "House hacking guide" },
  { href: "/resources", label: "Tools I use" },
  { href: "https://insiders.itsjoshmoore.com/courses/offers/3f5a5bf0-ec56-4752-ba1f-db9a1a4ab985", label: "Deal Finder Academy" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" aria-label="Josh Moore, home" className="inline-block">
              <img
                src="/logo-lockup-480.webp"
                alt="Josh Moore"
                className="h-16 w-auto"
                width={166}
                height={64}
                loading="lazy"
              />
            </Link>
            <p className="mt-5 text-[15px] leading-relaxed text-white/70">
              Real estate investor and creative finance operator in West Michigan.
              Buying houses, multifamily, mobile home parks and RV parks, and
              showing the work along the way.
            </p>
            <ul className="mt-6 flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <SocialIcon platform={s.platform} className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title="Explore" links={EXPLORE} />
          <FooterColumn title="Work together" links={WORK_LINKS} />
          <FooterColumn title="Free" links={FREE_LINKS} />
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="max-w-4xl text-sm leading-relaxed text-white/65">{LEGAL_LINE}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-white/65">
            <span className="py-2">© {new Date().getFullYear()} Josh Moore. All rights reserved.</span>
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-white">
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  const linkClass = "inline-flex min-h-11 items-center text-[15px] text-white/80 transition-colors hover:text-white";
  return (
    <div>
      <p className="eyebrow text-brand-100">{title}</p>
      <ul className="mt-2 flex flex-col">
        {links.map((l) => (
          <li key={l.href}>
            {l.href.startsWith("http") ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className={linkClass}>
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
