import { motion } from "motion/react";
import { CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { EASE } from "../lib/motion.js";
import Button from "./Button.jsx";
import { ViewfinderMark } from "./Logo.jsx";

const FOUND_STEPS = ["Reading your photo", "Comparing with lost reports", "Choosing the best matches"];
const LOST_STEPS = ["Reading your description", "Saving your report", "Watching for finders"];

/** "Analyzing your report…" shown until the backend says analyzed. Steps are reassurance, not real progress. */
export default function AnalyzingScreen({ type = "found", imageUrl, slow = false, onRetry }) {
  const steps = type === "found" ? FOUND_STEPS : LOST_STEPS;
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1600);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
      <div className="viewfinder relative grid h-56 w-56 place-items-center overflow-hidden rounded-3xl bg-ink [--vf-color:var(--color-ember)] [--vf-inset:12px] [--vf-len:28px] sm:h-64 sm:w-64">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        ) : (
          <ViewfinderMark className="h-24 w-24 animate-float" tone="dark" />
        )}
        <div className="animate-scan pointer-events-none absolute inset-x-4 top-0 h-0.5 rounded-full bg-ember shadow-[0_0_18px_4px_rgba(231,123,73,0.7)]" aria-hidden="true" />
      </div>
      <h1 className="mt-8 text-2xl font-bold text-ink sm:text-3xl">Analyzing your report…</h1>
      <p className="mt-2 max-w-sm text-muted">{type === "found" ? "We're looking for owners who reported something like this." : "We're getting your report ready for finders."}</p>
      <ul className="mt-6 space-y-2 text-start">
        {steps.map((label, i) => (
          <motion.li
            key={label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: i <= step ? 1 : 0.35, x: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex items-center gap-2.5 font-medium text-ink"
          >
            <CircleCheck className={i < step ? "h-5 w-5 text-success" : "h-5 w-5 text-line"} strokeWidth={2} aria-hidden="true" />
            {label}
          </motion.li>
        ))}
      </ul>
      {slow && (
        <div className="mt-8 rounded-2xl bg-sand p-5">
          <p className="font-semibold text-ink">This is taking longer than usual.</p>
          <p className="mt-1 text-sm text-muted">Your report is saved. You can wait here, check again, or come back later.</p>
          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={onRetry}>Check again</Button>
            <Button variant="outline" to="/my-reports">
              Go to my reports
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
