import { Calculator, Compass, Hammer, Home, Landmark, Scale } from "lucide-react";

/** Every free tool, in the order the hub and the "next tool" cards show them. */
export const TOOLS = [
  {
    path: "/house-hack-calculator",
    points: ["Your real monthly housing cost", "The guide's three stress tests", "Cash to close and reserves"],
    title: "House hack calculator",
    blurb:
      "What it costs you to live there once the rent comes in, with the guide's three stress tests.",
    icon: Home,
  },
  {
    path: "/mao-calculator",
    points: ["Fix and sell, or rent and refinance", "Every cost counted, solved exactly", "Your cash in and your return"],
    title: "Max offer calculator",
    blurb:
      "Work back from the after-repair value to the most you can pay for a flip or a rental you refinance.",
    icon: Calculator,
  },
  {
    path: "/did-you-really-win",
    points: ["Return on the money it took", "Per year, not just per deal", "Two deals side by side"],
    title: "Did you really win?",
    blurb:
      "Profit next to the money it took and the months it took it. Put two deals side by side.",
    icon: Scale,
  },
  {
    path: "/rehab-estimator",
    points: ["Line by line, area by area", "2026 cost ranges to start from", "Contingency built in"],
    title: "Rehab estimator",
    blurb: "A line-by-line rehab budget with quantities from the house and a contingency.",
    icon: Hammer,
  },
  {
    path: "/dscr-calculator",
    points: ["The ratio a DSCR lender checks", "Rent needed for 1.00 and 1.25", "The biggest loan the rent supports"],
    title: "DSCR quick check",
    blurb:
      "Does the rent cover the loan? See the ratio, the rent it takes and the loan the rent supports.",
    icon: Landmark,
  },
  {
    path: "/what-you-are-sitting-on",
    points: ["Equity, cash and retirement in one count", "What is within reach, and what has rules", "Your credit, your people and your time"],
    title: "What are you sitting on?",
    blurb: "Count the equity, cash, retirement money, credit, people and time you already have.",
    icon: Compass,
  },
] as const;
