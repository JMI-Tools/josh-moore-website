import { Link } from "wouter";
import { Instagram, Linkedin } from "lucide-react";
import { TikTokIcon } from "./TikTokIcon";

export default function Footer() {
  const socialLinks = [
    { platform: "instagram", url: "https://www.instagram.com/joshmooreinvests", icon: Instagram, label: "Instagram" },
    { platform: "linkedin", url: "https://www.linkedin.com/in/joshmooreinvests", icon: Linkedin, label: "LinkedIn" },
    { platform: "tiktok", url: "https://www.tiktok.com/@joshmooreinvests", icon: TikTokIcon, label: "TikTok" },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663274333910/BDvsG8QwM5MRn7rkKqLxFL/logo_f73ce9e0.png" alt="Josh Moore" className="h-20 w-auto" />

          {/* Social Media Icons */}
          <div className="flex items-center gap-6">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  aria-label={link.label}
                >
                  <Icon className="h-6 w-6" />
                </a>
              );
            })}
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy">
              <a className="hover:text-primary transition-colors">Privacy Policy</a>
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-center">
            © {new Date().getFullYear()} Josh Moore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
