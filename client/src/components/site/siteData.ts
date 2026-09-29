/** Shared site facts. Edit here, not in the header, footer or contact page. */

export const SOCIAL_LINKS = [
  { platform: "instagram", url: "https://www.instagram.com/joshmooreinvests", icon: "/social-icons/instagram.png", label: "Instagram" },
  { platform: "tiktok", url: "https://www.tiktok.com/@joshmooreinvests", icon: "/social-icons/tiktok.png", label: "TikTok" },
  { platform: "x", url: "https://x.com/joshmooreinvest", icon: "/social-icons/x.png", label: "X" },
  { platform: "threads", url: "https://www.threads.com/@joshmooreinvests", icon: "/social-icons/threads.png", label: "Threads" },
  { platform: "linkedin", url: "https://www.linkedin.com/in/joshmooreinvests", icon: "/social-icons/linkedin.png", label: "LinkedIn" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/mediakit", label: "Story & Press" },
  { href: "/buy-box", label: "Buy Box" },
  { href: "/submit-deal", label: "Submit a Deal" },
  { href: "/resources", label: "Resources" },
  { href: "/collaborate", label: "Collaborate" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * General legal footing for every page. It describes what the site is not.
 * It does not describe any investment, fund or offering; nothing about those
 * goes public before securities counsel has set the structure.
 */
export const LEGAL_LINE =
  "Nothing on this website is an offer to sell, or a solicitation of an offer to buy, any security or investment. Josh Moore is a real estate investor, not a financial, legal or tax advisor. Talk to your own professionals before making decisions.";
