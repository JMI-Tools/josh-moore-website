import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

export default function Media() {
  const { data: socialLinks } = trpc.admin.getSocialLinks.useQuery();

  const socialIcons = {
    facebook: { icon: Facebook, label: "Facebook" },
    instagram: { icon: Instagram, label: "Instagram" },
    linkedin: { icon: Linkedin, label: "LinkedIn" },
    youtube: { icon: Youtube, label: "YouTube" },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl space-y-12">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Media & Insights</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Coming soon - videos, podcasts, and insights from Josh Moore
            </p>
          </div>

          {/* Placeholder Content */}
          <div className="bg-muted/30 rounded-lg p-12 text-center">
            <p className="text-lg text-muted-foreground mb-8">
              This section will feature video content, podcast appearances, and other media featuring Josh Moore's insights on creative real estate investing.
            </p>
            <p className="text-muted-foreground">
              Check back soon or follow on social media for updates.
            </p>
          </div>

          {/* Social Links */}
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Follow for Updates</h2>
            <div className="flex justify-center gap-6">
              {socialLinks?.map((link) => {
                const social = socialIcons[link.platform as keyof typeof socialIcons];
                if (!social || !link.url) return null;
                const Icon = social.icon;
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
