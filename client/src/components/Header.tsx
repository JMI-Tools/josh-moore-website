import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/components/site/siteData";
import { cn } from "@/lib/utils";

export default function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the sheet on navigation or Escape, and lock the page behind it while open.
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-white/95 transition-shadow",
          scrolled ? "shadow-[0_1px_0_0_#dce2e6,0_8px_24px_-16px_rgb(10_30_50/0.25)]" : "shadow-[0_1px_0_0_#dce2e6]",
        )}
      >
        <div className="container flex h-[72px] items-center justify-between gap-6">
          <Link href="/" aria-label="Josh Moore, home" className="flex shrink-0 items-center gap-2.5">
            <img src="/logo-mark-256.webp" alt="" className="h-9 w-auto" width={54} height={36} />
            <span className="font-display text-[19px] font-bold tracking-tight text-navy">Josh Moore</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.filter((l) => l.href !== "/submit-deal").map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors",
                  isActive(link.href)
                    ? "text-navy after:absolute after:inset-x-3.5 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand"
                    : "text-ink-soft hover:bg-navy/5 hover:text-navy",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button asChild size="sm">
              <Link href="/submit-deal">
                Submit a deal
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </Button>
        </div>
      </header>

      {/* The sheet lives outside <header>: a sticky, blurred header would become
          the containing block for a fixed child and collapse it to 0px tall. */}
      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto bg-white lg:hidden"
        >
          <nav className="container flex flex-col py-4" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-between border-b border-line py-4 font-display text-2xl font-semibold tracking-tight",
                  isActive(link.href) ? "text-brand-600" : "text-navy",
                )}
              >
                {link.label}
                <ArrowRight className="size-5 opacity-40" />
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3 pb-8">
              <Button asChild size="lg">
                <Link href="/submit-deal">Submit a deal</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Book a call</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
