import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin, DollarSign, Home, Building2, Caravan, Target, XCircle, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";

interface BuyBoxCard {
  title: string;
  icon: React.ElementType;
  gradient: string;
  investmentGoal: string;
  criteria: { label: string; value: string }[];
  dealKillers?: string[];
  valueAddFocus: string[];
  ctaText: string;
}

const cards: BuyBoxCard[] = [
  {
    title: "Single Family Residential",
    icon: Home,
    gradient: "from-primary/20 to-blue-500/20",
    investmentGoal: "Fix & Flip",
    criteria: [
      { label: "Max Purchase Price", value: "$400,000" },
      { label: "Offer Formula", value: "70% of ARV minus repairs" },
      { label: "Condition", value: "All conditions accepted — no fire damage, no foundation damage" },
      { label: "Minimum", value: "2 bed / 1 bath" },
      { label: "Financing", value: "Cash or seller financing" },
      { label: "Target Counties", value: "Muskegon, Kent, Ottawa, Kalamazoo, Genesee" },
      { label: "Focus Cities", value: "Muskegon, Grand Rapids, Grand Haven, Spring Lake, Holland, Flint, Lapeer" },
    ],
    valueAddFocus: ["Renovations to maximize ARV", "Fast turnaround for resale"],
    ctaText: "Have a house deal? Submit it here",
  },
  {
    title: "Commercial Multifamily",
    icon: Building2,
    gradient: "from-blue-500/20 to-primary/20",
    investmentGoal: "Value-Add Acquisitions",
    criteria: [
      { label: "Unit Count", value: "10–50 units" },
      { label: "Markets", value: "Midwest primary; strong deals considered nationally" },
      { label: "Financing", value: "Creative financing only" },
    ],
    dealKillers: ["Motel conversions", "Failed condo conversions"],
    valueAddFocus: ["Rent growth via renovations", "Operational improvements to increase NOI"],
    ctaText: "Have a multifamily deal? Submit it here",
  },
  {
    title: "Mobile Home Park",
    icon: Home,
    gradient: "from-primary/20 to-blue-500/20",
    investmentGoal: "Value-Add and Cash Flow",
    criteria: [
      { label: "Min Park Size", value: "30 pads" },
      { label: "Home Type", value: "Tenant-owned preferred; park-owned considered" },
      { label: "Markets", value: "Nationwide" },
      { label: "Financing", value: "Creative financing and seller financing only" },
    ],
    dealKillers: ["On-site waste treatment plants", "Lagoon systems"],
    valueAddFocus: ["Rent growth", "Operational improvements"],
    ctaText: "Have an MHP deal? Submit it here",
  },
  {
    title: "RV Park",
    icon: Caravan,
    gradient: "from-blue-500/20 to-primary/20",
    investmentGoal: "Acquire Underperforming or Established Parks",
    criteria: [
      { label: "Park Types", value: "Transient (near tourism) and long-term (near population centers); mixed-use accepted" },
      { label: "Min Park Size", value: "30 pads" },
      { label: "Markets", value: "Nationwide — no flood zone properties" },
      { label: "Financing", value: "Creative financing and seller financing only" },
    ],
    valueAddFocus: ["Operational improvements", "Enhanced amenities", "Rent growth"],
    ctaText: "Have an RV park deal? Submit it here",
  },
];

export default function BuyBox() {
  useSeo({
    title: "Buy Box | What Josh Moore Is Buying",
    description:
      "Investment criteria for single family, commercial multifamily, mobile home park and RV park deals: price caps, unit counts, markets, financing and deal killers.",
    path: "/buy-box",
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50/30 to-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-primary/90 text-white py-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container relative z-10 text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-block">
              <span className="px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-primary/30">
                Investment Criteria
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">My Buy Box</h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Here's what I'm actively looking for. If you have a deal that matches these criteria, submit it and let's create a win-win situation.
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248, 250, 252)"/>
            </svg>
          </div>
        </section>

        {/* Buy Box Cards */}
        <section className="py-20">
          <div className="container max-w-6xl space-y-12">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Card key={idx} className="overflow-hidden border-2 hover:border-primary/50 hover:shadow-2xl transition-all group relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>

                  {/* Card Header */}
                  <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg w-fit">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl">{card.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                            Investment Goal: {card.investmentGoal}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-8 pb-8 relative z-10 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">

                      {/* Key Criteria */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-bold text-lg">Key Criteria</h3>
                        </div>
                        <dl className="space-y-3">
                          {card.criteria.map((item, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:gap-2">
                              <dt className="font-semibold text-foreground min-w-[160px] shrink-0">{item.label}:</dt>
                              <dd className="text-muted-foreground">{item.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      <div className="space-y-8">
                        {/* Deal Killers */}
                        {card.dealKillers && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-500" />
                              </div>
                              <h3 className="font-bold text-lg text-red-600">Deal Killers</h3>
                            </div>
                            <ul className="space-y-2">
                              {card.dealKillers.map((killer, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <span className="text-red-500 mt-1 text-xl">✕</span>
                                  <span className="text-muted-foreground">{killer}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Value-Add Focus */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-bold text-lg text-green-700">Value-Add Focus</h3>
                          </div>
                          <ul className="space-y-2">
                            {card.valueAddFocus.map((item, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <span className="text-green-600 mt-1 text-xl">✓</span>
                                <span className="text-muted-foreground">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4 border-t border-border">
                      <Link href="/submit-deal">
                        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-base px-6 py-3 shadow-md hover:shadow-lg transition-all hover:scale-105">
                          {card.ctaText}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 bg-gradient-to-br from-secondary via-primary to-secondary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container relative z-10 text-center space-y-8 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Submit Your Deal?</h2>
            <p className="text-xl md:text-2xl text-blue-100">
              If your property matches any of these criteria, I want to hear from you.
            </p>
            <Link href="/submit-deal">
              <Button size="lg" className="bg-white text-secondary hover:bg-blue-50 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                Submit a Deal Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-1000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
