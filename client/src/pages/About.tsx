import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, Users, Award } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Win-Win Solutions",
      description: "Every deal I structure is designed to benefit all parties involved—sellers, buyers, and communities.",
    },
    {
      icon: TrendingUp,
      title: "Creative Thinking",
      description: "Traditional financing doesn't work for every situation. I find innovative solutions where others see dead ends.",
    },
    {
      icon: Users,
      title: "Relationship-Focused",
      description: "Real estate is about people, not just properties. I build lasting relationships based on trust and integrity.",
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "Years of successful transactions across residential, multifamily, and commercial properties in Michigan.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50/30 to-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-primary/90 text-white py-20">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container relative z-10 text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold">About Josh Moore</h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Creative Real Estate Investor | Problem Solver | Deal Maker
            </p>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248, 250, 252)"/>
            </svg>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-3xl blur-2xl"></div>
                <img 
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663274333910/BDvsG8QwM5MRn7rkKqLxFL/josh_photo_5f8c9e1a.jpg" 
                  alt="Josh Moore" 
                  className="relative z-10 w-full h-auto rounded-2xl shadow-2xl border-4 border-white"
                />
              </div>
              
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  My Story
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    I'm Josh Moore, a creative real estate investor based in Michigan with a passion for turning complex situations into profitable opportunities.
                  </p>
                  <p>
                    My approach is simple: find creative financing solutions that work for everyone involved. Whether it's a homeowner facing foreclosure, an investor looking to exit a property, or a commercial opportunity that needs creative structuring, I specialize in making deals happen when traditional financing falls short.
                  </p>
                  <p>
                    Over the years, I've successfully completed transactions across single-family homes, multifamily properties, commercial buildings, RV parks, and mobile home communities. Each deal is unique, and I pride myself on crafting custom solutions that create win-win outcomes.
                  </p>
                  <p className="font-semibold text-foreground">
                    My mission is to provide opportunities where others see obstacles, building wealth and solving problems through creative real estate investing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-br from-secondary/5 via-primary/5 to-blue-50/50">
          <div className="container space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                My Core Values
              </h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide every deal I make
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <Card 
                    key={idx} 
                    className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="p-4 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">{value.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Expertise Section */}
        <section className="py-20">
          <div className="container max-w-5xl space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Areas of Expertise
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Creative Financing",
                  items: ["Seller financing", "Subject-to deals", "Lease options", "Wrap-around mortgages"],
                },
                {
                  title: "Property Types",
                  items: ["Single-family homes", "Multifamily (2-20 units)", "Commercial properties", "RV parks & mobile home parks"],
                },
                {
                  title: "Deal Structures",
                  items: ["Cash purchases", "Terms & owner carry", "Partnership opportunities", "Value-add repositioning"],
                },
              ].map((section, idx) => (
                <div 
                  key={idx} 
                  className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-transparent hover:border-primary/30"
                >
                  <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1 flex-shrink-0">✓</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
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
