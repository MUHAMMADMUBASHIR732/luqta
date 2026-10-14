import { useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "../lib/cn.js";
import { DUR, EASE } from "../lib/motion.js";

/** Route wrapper: fade and slide in, sets the tab title, provides the single <main> landmark. */
export default function Page({ title, children, className, wide = false, flush = false }) {
  useEffect(() => {
    document.title = title ? `${title} · Luqta` : "لقطة · Luqta";
  }, [title]);

  return (
    <motion.main
      id="main"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: DUR.ui, ease: EASE }}
      className={cn(!flush && "mx-auto w-full px-4 pb-16 pt-8 sm:pt-12", !flush && (wide ? "max-w-[1100px]" : "max-w-[720px]"), className)}
    >
      {children}
    </motion.main>
  );
}
