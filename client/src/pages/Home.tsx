import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home as HomeIcon, Building, Tent, Factory, ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { data: settings } = trpc.admin.getSettings.useQuery();
  const showEvents = settings?.events_section_visible === "true";

  const assetClasses = [
    {
      icon: HomeIcon,
      title: "Single Family",
      description: "2+ bed, 1+ bath properties in West Michigan markets",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      icon: Building2,
      title: "Multifamily",
      description: "2-4 unit residential properties, any condition considered",
      gradient: "from-blue-500/20 to-blue-500/5",
    },
    {
      icon: Building,
      title: "Commercial MF",
      description: "5-20 units with value-add opportunities",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      icon: Tent,
      title: "RV Parks",
      description: "10%+ cap rate campgrounds and RV communities",
      gradient: "from-blue-500/20 to-blue-500/5",
    },
    {
      icon: Factory,
      title: "Mobile Home Parks",
      description: "8%+ cap rate manufactured housing communities",
      gradient: "from-primary/20 to-primary/5",
    },
  ];

  const benefits = [
    "Creative finance solutions that work",
    "Fast closings with flexible terms",
    "Win-win deals for all parties",
    "Proven track record in Michigan",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50/30 to-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Advanced Design */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-primary/90 text-white">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* Geometric Shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-10 w-32 h-32 border-4 border-primary/30 rotate-45 animate-spin-slow"></div>
            <div className="absolute bottom-40 left-20 w-24 h-24 border-4 border-blue-400/30 rounded-full animate-bounce-slow"></div>
          </div>

          <div className="container relative z-10 py-20 md:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8 animate-fade-in">
                <div className="inline-block">
                  <span className="px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-primary/30">
                    Michigan's Creative Finance Expert
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Creative Finance Solutions for{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">
                    Impossible
                  </span>{" "}
                  Real Estate Deals
                </h1>
                
                <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                  I'm Josh Moore, a creative real estate investor in Michigan. I use creative finance to provide solutions for homeowners and investors on both residential and commercial scales—turning seemingly impossible deals into win-win opportunities.
                </p>

                {/* Benefits List */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                      <CheckCircle2 className="h-6 w-6 text-blue-300 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/submit-deal">
                    <Button size="lg" className="bg-white text-secondary hover:bg-blue-50 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                      Submit a Deal
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/buy-box">
                    <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 backdrop-blur-sm">
                      View My Buy Box
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Image - Full Body Visible */}
              <div className="relative lg:h-[600px] flex items-end justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent z-10"></div>
                <img 
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663274333910/BDvsG8QwM5MRn7rkKqLxFL/josh-photo_c93c4e34.png" 
                  alt="Josh Moore" 
                  className="relative z-0 h-full w-auto object-contain object-bottom drop-shadow-2xl animate-fade-in-up"
                />
                {/* Accent Circle Behind Photo */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-t from-primary/30 to-transparent rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
          </div>

          {/* Bottom Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248, 250, 252)"/>
            </svg>
          </div>
        </section>

        {/* Asset Classes Section */}
        <section className="py-20 relative">
          <div className="container space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Investment Criteria Across 5 Asset Classes
              </h2>
              <p className="text-xl text-muted-foreground">
                I'm actively acquiring properties in these categories with creative financing solutions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assetClasses.map((asset, idx) => {
                const Icon = asset.icon;
                return (
                  <Card 
                    key={idx} 
                    className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 overflow-hidden relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${asset.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    <CardHeader className="relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">{asset.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base pt-2">{asset.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <Button asChild variant="ghost" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                        <Link href="/buy-box">
                          View Criteria
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Work With Me Section */}
        <section className="py-20 bg-gradient-to-br from-secondary/5 via-primary/5 to-blue-50/50 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234D92D0' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="container relative z-10 space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Why Work With Me?
              </h2>
              <p className="text-xl text-muted-foreground">
                Experience, creativity, and a commitment to win-win solutions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  title: "Creative Solutions",
                  description: "I specialize in finding creative financing options that traditional buyers can't offer, making deals work when others say no.",
                  icon: "💡",
                },
                {
                  title: "Fast & Flexible",
                  description: "Quick closings with flexible terms tailored to your situation. No cookie-cutter approaches—every deal is unique.",
                  icon: "⚡",
                },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-transparent hover:border-primary/30"
                >
                  <div className="text-5xl">{item.icon}</div>
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section (Conditional) */}
        {showEvents && (
          <section className="py-20">
            <div className="container space-y-12">
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  Upcoming Events
                </h2>
                <p className="text-xl text-muted-foreground">
                  Join me at these upcoming events and workshops
                </p>
              </div>

              <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-blue-50 rounded-2xl p-12 text-center border-2 border-primary/20">
                <p className="text-lg text-muted-foreground">
                  Events coming soon. Check back or follow on social media for updates.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-secondary via-primary to-secondary text-white relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container relative z-10 text-center space-y-8 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Make Your Deal Happen?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100">
              Whether you're a homeowner looking for a creative solution or an investor with a property to sell, let's explore how we can work together.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/submit-deal">
                <Button size="lg" className="bg-white text-secondary hover:bg-blue-50 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  Submit Your Deal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 backdrop-blur-sm">
                  Schedule a Call
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1.2s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
