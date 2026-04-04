import { Link } from "wouter";

const socialLinks = [
  {
    platform: "instagram",
    url: "https://www.instagram.com/joshmooreinvests",
    icon: "/social-icons/instagram.png",
    label: "Instagram",
  },
  {
    platform: "tiktok",
    url: "https://www.tiktok.com/@joshmooreinvests",
    icon: "/social-icons/tiktok.png",
    label: "TikTok",
  },
  {
    platform: "x",
    url: "https://x.com/joshmooreinvest",
    icon: "/social-icons/x.png",
    label: "X (Twitter)",
  },
  {
    platform: "threads",
    url: "https://www.threads.com/@joshmooreinvests",
    icon: "/social-icons/threads.png",
    label: "Threads",
  },
  {
    platform: "linkedin",
    url: "https://www.linkedin.com/in/joshmooreinvests",
    icon: "/social-icons/linkedin.png",
    label: "LinkedIn",
  },
];

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663274333910/BDvsG8QwM5MRn7rkKqLxFL/logo_f73ce9e0.png"
            alt="Josh Moore"
            className="h-20 w-auto"
          />

          {/* Social Media Icons */}
          <div className="flex items-center gap-5 flex-wrap justify-center">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="hover:opacity-80 hover:scale-110 transition-all duration-200"
              >
                <img
                  src={link.icon}
                  alt={link.label}
                  className="h-10 w-10 object-contain rounded-full"
                />
              </a>
            ))}
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
