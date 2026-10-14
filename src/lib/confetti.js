import confetti from "canvas-confetti";

const cssColor = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** One short burst in brand colors. Skipped for people who prefer reduced motion. */
export function celebrate() {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["--color-brand", "--color-rose", "--color-ember", "--color-ink", "--color-cream"].map(cssColor).filter(Boolean);
  confetti({ particleCount: 90, spread: 72, origin: { y: 0.62 }, colors, disableForReducedMotion: true });
  setTimeout(() => {
    confetti({ particleCount: 45, angle: 60, spread: 55, origin: { x: 0, y: 0.72 }, colors, disableForReducedMotion: true });
    confetti({ particleCount: 45, angle: 120, spread: 55, origin: { x: 1, y: 0.72 }, colors, disableForReducedMotion: true });
  }, 200);
}
