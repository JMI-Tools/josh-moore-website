import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

/**
 * The closing call to action that ends most pages. Navy, one line, two doors.
 */
export function CtaBand({
  title = "Ready to make your deal happen?",
  lede = "Bring me the property, the problem, or the way you want to work together. If there is a way to make it work, we will find it.",
  primaryHref = "/submit-deal",
  primaryLabel = "Submit a deal",
  secondaryHref = "/contact",
  secondaryLabel = "Book a call",
}: {
  title?: string;
  lede?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-white glow-brand">
      <div className="container py-20 md:py-28">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="display-lg">{title}</h2>
          <p className="mt-5 text-lg text-white/75 md:text-xl">{lede}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild variant="light" size="lg">
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default CtaBand;
