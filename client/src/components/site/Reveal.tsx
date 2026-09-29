import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  /** Seconds to wait before this block animates. Stagger siblings with 0.08 steps. */
  delay?: number;
  /** Pixels the block rises as it fades in. */
  distance?: number;
};

/**
 * Fade-and-rise on first scroll into view. One motion, once, and none at all
 * for visitors who asked for reduced motion. Wrap a block, not every line.
 */
export function Reveal({ children, delay = 0, distance = 16, ...rest }: RevealProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    const { className, style } = rest;
    return (
      <div className={className as string | undefined} style={style as React.CSSProperties | undefined}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
