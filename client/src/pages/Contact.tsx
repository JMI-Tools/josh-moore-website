import Header from "@/components/Header";
import Footer from "@/components/Footer";

const socialLinks = [
  {
    platform: "instagram",
    url: "https://www.instagram.com/joshmooreinvests",
    icon: "/social-icons/instagram.png",
    label: "Instagram",
  },
  {
    platform: "tiktok",
    url: "https://www.tiktok.com/@joshmooreinvests",
    icon: "/social-icons/tiktok.png",
    label: "TikTok",
  },
  {
    platform: "x",
    url: "https://x.com/joshmooreinvest",
    icon: "/social-icons/x.png",
    label: "X (Twitter)",
  },
  {
    platform: "threads",
    url: "https://www.threads.com/@joshmooreinvests",
    icon: "/social-icons/threads.png",
    label: "Threads",
  },
  {
    platform: "linkedin",
    url: "https://www.linkedin.com/in/joshmooreinvests",
    icon: "/social-icons/linkedin.png",
    label: "LinkedIn",
  },
];

export default function Contact() {
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
              style={{ width: "100%", height: "700px", border: "none" }}
              frameBorder="0"
              id="NSge8QwJ9emndXiMbRER_1772926901115"
            />
            <script
              src="https://api.robonurture.com/js/form_embed.js"
              type="text/javascript"
            ></script>
          </div>

          {/* Social Media Block */}
          <div
            className="rounded-2xl px-8 py-10 text-center space-y-6"
            style={{ backgroundColor: "#0A1628" }}
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Follow Along
              </h2>
              <p className="text-gray-400 text-base md:text-lg">
                Stay connected — deals, insights, and behind-the-scenes on all platforms.
              </p>
            </div>

            <div className="flex justify-center items-center gap-6 flex-wrap">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="transition-transform hover:scale-110"
                >
                  <img
                    src={link.icon}
                    alt={link.label}
                    className="w-14 h-14 object-contain"
                  />
                </a>
              ))}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
