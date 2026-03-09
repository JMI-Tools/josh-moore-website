import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, DollarSign, Landmark, GraduationCap, Bot, Video, Mic, Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Resources() {
  const sections = [
    {
      title: "Financial & Lending Resources",
      resources: [
        {
          icon: Briefcase,
          title: "Creative Finance-Friendly Insurance",
          description: "National coverage for investors using creative strategies",
          buttonText: "Get Quote",
          url: "http://joshmoore.steadilypartner.com",
        },
        {
          icon: DollarSign,
          title: "Construction & Hard Money Loans",
          description: "90% LTV | 100% Construction/LTC | Fast closings for fix & flips",
          buttonText: "Learn More",
          url: "https://www.investorloandirect.com",
        },
        {
          icon: Landmark,
          title: "Investment Loans",
          description: "Flexible financing for fix and flip projects",
          buttonText: "Apply Now",
          url: "https://www.investorloandirect.com",
        },
      ],
    },

    {
      title: "Free Education & Community",
      resources: [
        {
          icon: GraduationCap,
          title: "Free Training - West Michigan Deal Finder Academy",
          description: "Free training to teach aspiring West Michigan entrepreneurs how they can make thousands of dollars for free working to help me find houses to buy",
          buttonText: "Join Free",
          url: "https://insiders.itsjoshmoore.com/courses/offers/3f5a5bf0-ec56-4752-ba1f-db9a1a4ab985",
        },
      ],
    },

    {
      title: "AI Resources",
      resources: [
        {
          icon: Bot,
          title: "Free Manus AI Invite & Credits",
          description: "Do and automate anything with this futuristic AI agent.",
          buttonText: "Get Free Access",
          url: "https://manus.im/invitation/BNVT5F5DQEDYM",
        },
        {
          icon: Video,
          title: "OpusClip AI Editor",
          description: "Use AI to turn your long form video into a treasure trove of short form content.",
          buttonText: "Try OpusClip",
          url: "https://www.opus.pro/?via=26834d",
        },
        {
          icon: Mic,
          title: "ElevenLabs AI",
          description: "Create custom voices or clone your own and have them say anything.",
          buttonText: "Try ElevenLabs",
          url: "https://try.elevenlabs.io/joshmooreinvests",
        },
      ],
    },

    {
      title: "Housing Resources",
      resources: [
        {
          icon: Home,
          title: "Padsplit",
          description: "Level up your cashflow through Co-Living with Padsplit.",
          buttonText: "Get Started",
          url: "https://www.padsplit.com/hosts?referral=041351CD&ref_source=link&ref_device=desktop&ref_role=af",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20">
        <div className="container space-y-16">
          {/* Page Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold">Resources</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Curated tools, services, and educational resources to help you succeed in real estate investing
            </p>
          </div>

          {/* Resource Sections */}
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-8">
              <h2 className="text-3xl font-bold">{section.title}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.resources.map((resource, ridx) => {
                  const Icon = resource.icon;
                  return (
                    <Card 
                      key={ridx} 
                      className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 overflow-hidden relative"
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-br from-primary to-blue-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <CardTitle className="text-xl">{resource.title}</CardTitle>
                        <CardDescription className="text-base">{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                          {resource.buttonText}
                        </a>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
