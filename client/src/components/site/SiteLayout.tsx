import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

/** Header, page body, footer. Every routed page except the media kit uses it. */
export function SiteLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-white text-ink", className)}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default SiteLayout;
