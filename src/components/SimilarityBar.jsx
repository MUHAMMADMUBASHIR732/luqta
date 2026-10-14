import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn.js";
import { DUR, EASE } from "../lib/motion.js";

export const scoreLabel = (score) => (score >= 80 ? "Strong match" : score >= 60 ? "Possible match" : "Weak match");

const FILL = (score) =>
  score >= 80 ? "bg-gradient-to-r from-brand to-ember" : score >= 60 ? "bg-rose" : "bg-rose/45";

/** Animated 0-100 bar. The label and the number carry the meaning, the color only supports it. */
export default function SimilarityBar({ score, basis = "photo", className }) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setShown(value);
      return undefined;
    }
    const controls = animate(0, value, {
      duration: DUR.bar,
      delay: 0.2,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-muted">{basis === "description" ? "Match (from description)" : "Match"}</span>
        <span className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-ink">{scoreLabel(value)}</span>
          <span className="text-xl font-bold tabular-nums text-ink" aria-label={`${value} percent`}>
            {shown}%
          </span>
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-sand"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={`${scoreLabel(value)}, ${value} percent`}
      >
        <motion.div
          className={cn("h-full rounded-full", FILL(value))}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: DUR.bar, delay: 0.2, ease: EASE }}
        />
      </div>
    </div>
  );
}
