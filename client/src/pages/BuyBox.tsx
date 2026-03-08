import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin, DollarSign, Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BuyBox() {
  const criteria = [
    {
      title: "Single Family Residential",
      icon: Home,
      gradient: "from-primary/20 to-blue-500/20",
      requirements: [
        "Minimum 2 bed, 1 bath",
        "Light rehab to light repairs welcome",
        "No fire damage",
        "No foundation issues",
      ],
      markets: [
        "Muskegon County",
        "Kent County",
        "Ottawa County",
      ],
      cities: [
        "Muskegon",
        "Grand Rapids",
        "Spring Lake",
        "Holland",
        "Grand Haven",
      ],
      structure: [
        "Cash",
        "Creative finance with seller incentives",
      ],
    },
    {
      title: "Residential Multifamily (2-4 Units)",
      icon: Home,
      gradient: "from-blue-500/20 to-primary/20",
      requirements: [
        "2-4 units",
        "Minimum 1 bed, 1 bath per unit",
        "Any condition considered",
        "No fire damage",
      ],
      markets: [
        "Michigan (West Michigan preferred)",
      ],
      structure: [
        "Cash",
        "Creative finance",
        "Seller carry terms",
      ],
    },
    {
      title: "Commercial Multifamily (5-20 Units)",
      icon: Home,
      gradient: "from-primary/20 to-blue-500/20",
      requirements: [
        "5-20 units",
        "Heavy value-add opportunities with upside through:",
        "  - Improved operations",
        "  - Construction/repositioning",
      ],
      markets: [
        "Open to various markets",
      ],
      structure: [
        "Creative finance preferred",
        "Cash considered",
      ],
    },
    {
      title: "RV Parks / Campgrounds / Mobile Home Parks",
      icon: Home,
      gradient: "from-blue-500/20 to-primary/20",
      requirements: [
        "Preferred NOI: $200K+",
        "Mobile Home Park: Minimum 8% cap rate",
        "RV Park/Campground: Minimum 10% cap rate",
      ],
      markets: [
        "Reviewing parks nationally",
      ],
      structure: [
        "Creative finance preferred",
        "Open to cash",
      ],
    },
  ];

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

        {/* Criteria Cards */}
        <section className="py-20">
          <div className="container max-w-6xl space-y-12">
            {criteria.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="overflow-hidden border-2 hover:border-primary/50 hover:shadow-2xl transition-all group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  
                  <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-3xl">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-8 pb-8 relative z-10">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Home className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-bold text-lg">Property Requirements</h3>
                        </div>
                        <ul className="space-y-3">
                          {item.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-3 group/item">
                              <span className="text-primary mt-1 text-xl group-hover/item:scale-125 transition-transform">•</span>
                              <span className="text-muted-foreground">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-bold text-lg">
                            {item.cities ? "Target Markets" : "Markets"}
                          </h3>
                        </div>
                        <ul className="space-y-3">
                          {item.markets.map((market, i) => (
                            <li key={i} className="flex items-start gap-3 group/item">
                              <span className="text-primary mt-1 text-xl group-hover/item:scale-125 transition-transform">•</span>
                              <span className="text-muted-foreground">{market}</span>
                            </li>
                          ))}
                        </ul>
                        {item.cities && (
                          <>
                            <h4 className="font-bold text-base mt-6 mb-3">Focus Cities</h4>
                            <ul className="space-y-3">
                              {item.cities.map((city, i) => (
                                <li key={i} className="flex items-start gap-3 group/item">
                                  <span className="text-primary mt-1 text-xl group-hover/item:scale-125 transition-transform">•</span>
                                  <span className="text-muted-foreground">{city}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <DollarSign className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-bold text-lg">Deal Structure</h3>
                        </div>
                        <ul className="space-y-3">
                          {item.structure.map((str, i) => (
                            <li key={i} className="flex items-start gap-3 group/item">
                              <span className="text-primary mt-1 text-xl group-hover/item:scale-125 transition-transform">•</span>
                              <span className="text-muted-foreground">{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA */}
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
