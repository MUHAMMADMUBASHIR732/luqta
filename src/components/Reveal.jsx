import { motion } from "motion/react";
import { EASE } from "../lib/motion.js";

/** Fades and lifts its children into view once, when they scroll on screen. */
export default function Reveal({ children, delay = 0, y = 28, className, as = "div" }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={className}
    >
      {children}
    </Tag>
  );
}
