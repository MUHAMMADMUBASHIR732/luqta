import { motion } from "motion/react";
import { DUR, EASE } from "../lib/motion.js";

/** Drawn-on checkmark for accepted and returned moments. */
export default function AnimatedCheck({ size = 88, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" className={className} role="img" aria-label="Done">
      <motion.circle
        cx="48"
        cy="48"
        r="42"
        className="fill-success-bg stroke-success"
        strokeWidth="4"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: DUR.enter + 0.2, ease: EASE }}
      />
      <motion.path
        d="M30 50l13 13 24-28"
        className="stroke-success"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: DUR.enter, delay: 0.35, ease: EASE }}
      />
    </svg>
  );
}
