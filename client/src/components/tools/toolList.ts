import { Calculator, Compass, Hammer, Home, Landmark, Scale } from "lucide-react";

/** Every free tool, in the order the hub and the "next tool" cards show them. */
export const TOOLS = [
  {
    path: "/house-hack-calculator",
    title: "House hack calculator",
    blurb:
      "What it costs you to live there once the rent comes in, with the guide's three stress tests.",
    icon: Home,
  },
  {
    path: "/mao-calculator",
    title: "Max offer calculator",
    blurb:
      "Work back from the after-repair value to the most you can pay for a flip or a rental you refinance.",
    icon: Calculator,
  },
  {
    path: "/did-you-really-win",
    title: "Did you really win?",
    blurb:
      "Profit next to the money it took and the months it took it. Put two deals side by side.",
    icon: Scale,
  },
  {
    path: "/rehab-estimator",
    title: "Rehab estimator",
    blurb: "A line-by-line rehab budget with quantities from the house and a contingency.",
    icon: Hammer,
  },
  {
    path: "/dscr-calculator",
    title: "DSCR quick check",
    blurb:
      "Does the rent cover the loan? See the ratio, the rent it takes and the loan the rent supports.",
    icon: Landmark,
  },
  {
    path: "/what-you-are-sitting-on",
    title: "What are you sitting on?",
    blurb: "Count the equity, cash, retirement money, credit, people and time you already have.",
    icon: Compass,
  },
] as const;
