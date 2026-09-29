import { Link } from "wouter";
import { LEGAL_LINE, NAV_LINKS, SOCIAL_LINKS } from "@/components/site/siteData";

const WORK_LINKS = [
  { href: "/submit-deal", label: "Submit a deal" },
  { href: "/collaborate", label: "Collaborate" },
  { href: "/contractors", label: "Contractors and trades" },
  { href: "/contact", label: "Book a call" },
  { href: "/mediakit", label: "Press kit" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" aria-label="Josh Moore, home">
              <img
                src="/logo-jm-480.webp"
                alt="Josh Moore"
                className="h-16 w-auto"
                width={96}
                height={64}
                loading="lazy"
              />
            </Link>
            <p className="mt-5 text-[15px] leading-relaxed text-white/70">
              Real estate investor and creative finance operator in West Michigan.
              Buying houses, multifamily, mobile home parks and RV parks, and
              showing the work along the way.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="rounded-full transition-transform hover:-translate-y-0.5"
                >
                  <img src={s.icon} alt="" className="size-9 rounded-full object-contain" loading="lazy" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Explore" links={NAV_LINKS.filter((l) => l.href !== "/")} />
          <FooterColumn title="Work together" links={WORK_LINKS} />
          <FooterColumn
            title="Free"
            links={[
              { href: "/househackingguide", label: "House hacking guide" },
              { href: "/resources", label: "Tools I use" },
              { href: "https://insiders.itsjoshmoore.com/courses/offers/3f5a5bf0-ec56-4752-ba1f-db9a1a4ab985", label: "Deal Finder Academy" },
            ]}
          />
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="max-w-4xl text-[13px] leading-relaxed text-white/50">{LEGAL_LINE}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/60">
            <span>© {new Date().getFullYear()} Josh Moore. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-white">
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
  return (
    <div>
      <p className="eyebrow text-brand-100">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) =>
          l.href.startsWith("http") ? (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] text-white/80 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ) : (
            <li key={l.href}>
              <Link href={l.href} className="text-[15px] text-white/80 transition-colors hover:text-white">
                {l.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
