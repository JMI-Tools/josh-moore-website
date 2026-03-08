import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/buy-box", label: "Buy Box" },
    { href: "/submit-deal", label: "Submit a Deal" },
    { href: "/resources", label: "Resources" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/">
          <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663274333910/BDvsG8QwM5MRn7rkKqLxFL/logo_f73ce9e0.png" alt="Josh Moore" className="h-16 w-auto cursor-pointer" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className={`text-sm font-semibold transition-colors hover:text-primary ${
                  isActive(link.href)
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-foreground"
                }`}
              >
                {link.label}
              </a>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container flex flex-col py-4 space-y-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={`text-base font-medium transition-all hover:text-primary hover:scale-105 ${
                location === link.href ? "text-primary font-bold" : "text-foreground"
              }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
