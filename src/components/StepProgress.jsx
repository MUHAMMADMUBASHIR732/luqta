import { motion } from "motion/react";
import { DUR, EASE } from "../lib/motion.js";

/** Segmented progress for the 3-step report forms. `current` is zero-based. */
export default function StepProgress({ steps, current }) {
  return (
    <div className="mb-6" aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current]}`} role="group">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-lg font-bold text-ink">{steps[current]}</p>
        <p className="text-sm font-medium text-muted">
          Step {current + 1} of {steps.length}
        </p>
      </div>
      <ol className="flex gap-2">
        {steps.map((label, i) => (
          <li key={label} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" aria-current={i === current ? "step" : undefined}>
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand to-ember"
              initial={false}
              animate={{ width: i < current ? "100%" : i === current ? "100%" : "0%", opacity: i <= current ? 1 : 0 }}
              transition={{ duration: DUR.enter, ease: EASE }}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
