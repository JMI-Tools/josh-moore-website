import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "white" | "paper" | "navy";

const toneClass: Record<Tone, string> = {
  white: "bg-white text-ink",
  paper: "bg-paper text-ink",
  navy: "bg-navy text-white glow-brand",
};

/**
 * A page band. Every section on the site is one of three tones, so the page
 * reads as a rhythm (white, paper, white, navy) instead of a stack of cards.
 */
export function Section({
  tone = "white",
  className,
  containerClassName,
  children,
  ...rest
}: ComponentProps<"section"> & {
  tone?: Tone;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("relative py-16 md:py-24", toneClass[tone], className)} {...rest}>
      <div className={cn("container relative", containerClassName)}>{children}</div>
    </section>
  );
}

/** Eyebrow + heading + optional lede, left or centered. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "eyebrow mb-4",
            align === "left" && "eyebrow-line",
            dark && "text-brand-100",
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2 className={cn("display-lg", dark ? "text-white" : "text-navy")}>{title}</h2>
      {lede && (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed md:text-xl",
            dark ? "text-white/75" : "text-ink-soft",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

export default Section;
