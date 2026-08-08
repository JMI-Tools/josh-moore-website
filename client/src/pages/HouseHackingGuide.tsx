import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, CheckCircle2 } from "lucide-react";

export default function HouseHackingGuide() {
  const chapters = [
    {
      number: "01",
      title: "A home with an income stream",
      description: "Understand the idea and the tradeoffs.",
      page: 4,
    },
    {
      number: "02",
      title: "Pick the version you can live with",
      description: "Rooms, small multifamily, ADUs, and furnished stays.",
      page: 6,
    },
    {
      number: "03",
      title: "Make the numbers tell the truth",
      description: "Full costs, reserves, financing, and stress tests.",
      page: 12,
    },
    {
      number: "04",
      title: "Buy a property that works in real life",
      description: "Legal use, inspections, rent research, and closing.",
      page: 20,
    },
    {
      number: "05",
      title: "Operate it like someone's home",
      description: "Fair housing, screening, leases, safety, and taxes.",
      page: 26,
    },
    {
      number: "06",
      title: "Put the plan into motion",
      description: "A 90-day plan plus two reusable worksheets.",
      page: 32,
    },
  ];

  const highlights = [
    "Lower your housing cost — potentially to $0",
    "Learn the numbers before you buy",
    "Understand every strategy: rooms, ADUs, small multifamily, furnished stays",
    "Run real stress tests on any deal",
    "Navigate fair housing, leases, and landlord basics",
    "90-day action plan included",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-blue-900/10" />
        <div className="relative max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
                Free Guide by Josh Moore
              </p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Live In,{" "}
                <span className="text-primary">Rent Smart</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                The friendly beginner's guide to house hacking
              </p>
              <p className="text-muted-foreground mb-8">
                A practical guide for first-time buyers who want to lower their housing cost,
                learn the numbers, and buy with a plan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/house-hacking-guide.pdf" download="Live-In-Rent-Smart-House-Hacking-Guide.pdf">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    <Download className="h-5 w-5" />
                    Download Free PDF
                  </Button>
                </a>
                <a href="#read-online">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                    <BookOpen className="h-5 w-5" />
                    Read Online
                  </Button>
                </a>
              </div>
            </div>

            {/* Right: Cover preview */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 rounded-2xl blur-2xl" />
                <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-2xl max-w-xs">
                  <div className="bg-[#1a3a4a] p-8 text-white">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-4">
                      A Practical Guide for First-Time Buyers
                    </p>
                    <h2 className="text-3xl font-bold leading-tight mb-3">
                      Live In,<br />Rent Smart
                    </h2>
                    <p className="text-blue-200 text-sm mb-6">
                      The friendly beginner's guide to house hacking
                    </p>
                    <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                      By Josh Moore
                    </p>
                  </div>
                  <div className="bg-[#1a3a4a]/80 px-8 py-3 border-t border-white/10">
                    <p className="text-xs text-blue-300 text-center">
                      Lower your housing cost. Learn the numbers. Buy with a plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">What's inside</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter List */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Table of Contents</h2>
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <div
                key={chapter.number}
                className="flex items-center gap-6 p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
              >
                <div className="text-2xl font-bold text-primary/40 w-10 shrink-0">
                  {chapter.number}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{chapter.title}</p>
                  <p className="text-sm text-muted-foreground">{chapter.description}</p>
                </div>
                <div className="text-sm text-muted-foreground shrink-0">
                  p. {chapter.page}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Starter Kit Download */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-blue-900/10 p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
                  Free Companion Resource
                </p>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  House Hacking Starter Kit
                </h2>
                <p className="text-muted-foreground mb-2">
                  Four tools. One clearer buy box.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Lender questions</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> 90-day plan</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Property scorecard</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Deal analyzer</li>
                </ul>
                <a href="/house-hacking-starter-kit.pdf" download="Josh-Moore-House-Hacking-Starter-Kit.pdf">
                  <Button size="lg" className="gap-2">
                    <Download className="h-5 w-5" />
                    Download Starter Kit — Free
                  </Button>
                </a>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 rounded-2xl blur-2xl" />
                  <div className="relative bg-[#0d2d3a] rounded-xl overflow-hidden shadow-2xl max-w-xs p-8 text-white">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-4">Free Companion Resource</p>
                    <h3 className="text-2xl font-bold leading-tight mb-3">House Hacking<br />Starter Kit</h3>
                    <p className="text-blue-200 text-sm mb-4">Four tools. One clearer buy box.</p>
                    <p className="text-xs text-primary font-semibold uppercase tracking-widest">By Josh Moore</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inline PDF Viewer */}
      <section id="read-online" className="py-16 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Read Online</h2>
            <a href="/house-hacking-guide.pdf" download="Live-In-Rent-Smart-House-Hacking-Guide.pdf">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </a>
          </div>
          <div className="rounded-xl overflow-hidden border border-border shadow-xl bg-black">
            <iframe
              src="/house-hacking-guide.pdf"
              className="w-full"
              style={{ height: "85vh", minHeight: "600px" }}
              title="Live In, Rent Smart — House Hacking Guide by Josh Moore"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            If the PDF doesn't load in your browser,{" "}
            <a href="/house-hacking-guide.pdf" download className="text-primary underline">
              download it here
            </a>
            .
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
