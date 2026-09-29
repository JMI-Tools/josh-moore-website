import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/useSeo";

export default function NotFound() {
  // No canonical: this URL must never be presented as the preferred version of
  // anything. noindex keeps client-rendered 404s out of the index.
  useSeo({
    title: "Page Not Found | Josh Moore",
    description:
      "The page you are looking for doesn't exist. It may have been moved or deleted.",
    path: null,
    noindex: true,
  });

  return (
    <main className="glow-brand flex min-h-screen w-full flex-col items-center justify-center bg-navy px-5 py-16 text-center text-white">
      <Link href="/" aria-label="Josh Moore, home" className="mb-12">
        <img
          src="/logo-lockup-480.webp"
          alt="Josh Moore"
          className="h-14 w-auto"
          width={224}
          height={56}
        />
      </Link>
      <p className="eyebrow text-brand-100">Error</p>
      <h1 className="display-xl mt-4">404</h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-white/78 md:text-xl">
        That page is not here.
      </p>
      <div className="mt-9">
        <Button asChild variant="light" size="lg">
          <Link href="/">
            Back to the homepage
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </main>
  );
}
