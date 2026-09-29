import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-brand/40 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Navy fill. The main action on light surfaces.
        default: "bg-navy text-white hover:bg-navy-700 active:translate-y-px",
        // Brand blue fill. For the one action that should pop.
        brand: "bg-brand text-white hover:bg-brand-600 active:translate-y-px",
        // White fill. The main action on navy surfaces.
        light: "bg-white text-navy hover:bg-paper active:translate-y-px",
        // Hairline outline on light surfaces.
        outline: "border border-navy/20 bg-transparent text-navy hover:border-navy hover:bg-navy/5",
        // Hairline outline on navy surfaces.
        "outline-light": "border border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        secondary: "bg-paper text-navy hover:bg-paper-2",
        ghost: "hover:bg-navy/5 text-navy",
        link: "text-brand-600 underline-offset-4 hover:underline rounded-none",
      },
      size: {
        default: "h-11 px-6 text-[15px]",
        sm: "h-9 px-4 text-sm",
        lg: "h-13 px-8 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
