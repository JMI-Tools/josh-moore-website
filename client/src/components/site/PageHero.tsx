import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

/**
 * The top band of an inner page. Navy by default (paper for quieter pages),
 * eyebrow, a display headline, a lede, and optional actions or a side slot.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  actions,
  aside,
  tone = "navy",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  tone?: "navy" | "paper";
  align?: "left" | "center";
  className?: string;
}) {
  const dark = tone === "navy";
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        dark ? "bg-navy text-white glow-brand" : "bg-paper text-ink dots-paper",
        className,
      )}
    >
      <div
        className={cn(
          "container relative py-16 md:py-24",
          aside && "grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]",
        )}
      >
        <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
          {eyebrow && (
            <span
              className={cn(
                "eyebrow mb-5",
                align === "left" && "eyebrow-line",
                dark ? "text-brand-100" : "text-brand-600",
              )}
            >
              {eyebrow}
            </span>
          )}
          <h1 className={cn("display-xl", dark ? "text-white" : "text-navy")}>{title}</h1>
          {lede && (
            <p
              className={cn(
                "mt-6 max-w-2xl text-lg leading-relaxed md:text-xl",
                align === "center" && "mx-auto",
                dark ? "text-white/78" : "text-ink-soft",
              )}
            >
              {lede}
            </p>
          )}
          {actions && (
            <div
              className={cn(
                "mt-8 flex flex-wrap gap-3",
                align === "center" && "justify-center",
              )}
            >
              {actions}
            </div>
          )}
        </Reveal>
        {aside && <Reveal delay={0.1}>{aside}</Reveal>}
      </div>
    </section>
  );
}

export default PageHero;
