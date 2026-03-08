import { Instagram, Linkedin } from "lucide-react";
import { TikTokIcon } from "@/components/TikTokIcon";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Contact() {
  const socialLinks = [
    { platform: "instagram", url: "https://www.instagram.com/joshmooreinvests", icon: Instagram, label: "Instagram" },
    { platform: "linkedin", url: "https://www.linkedin.com/in/joshmooreinvests", icon: Linkedin, label: "LinkedIn" },
    { platform: "tiktok", url: "https://www.tiktok.com/@joshmooreinvests", icon: TikTokIcon, label: "TikTok" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl space-y-12">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Let's Connect</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Ready to discuss a deal or explore working together? Schedule a time that works for you.
            </p>
          </div>

          {/* Calendar Booking Widget */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <iframe 
              src="https://api.robonurture.com/widget/booking/AMXLElNg9ITea67HZMPw" 
              style={{width: "100%", height: "700px", border: "none"}}
              frameBorder="0"
              id="NSge8QwJ9emndXiMbRER_1772926901115"
            />
            <script src="https://api.robonurture.com/js/form_embed.js" type="text/javascript"></script>
          </div>

          {/* Social Media */}
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Follow Me</h2>
            <div className="flex justify-center gap-6">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                    aria-label={link.label}
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
