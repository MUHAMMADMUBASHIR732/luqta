import { cn } from "../lib/cn.js";

const SIZES = {
  sm: { arabic: "text-[1.6rem]", latin: "text-[0.6rem] tracking-[0.22em]", mark: "h-7 w-7", gap: "gap-2" },
  md: { arabic: "text-[2.1rem]", latin: "text-[0.68rem] tracking-[0.24em]", mark: "h-9 w-9", gap: "gap-2.5" },
  lg: { arabic: "text-[3.6rem]", latin: "text-sm tracking-[0.3em]", mark: "h-14 w-14", gap: "gap-3" },
  hero: {
    arabic: "text-[clamp(5.5rem,22vw,11rem)]",
    latin: "text-base tracking-[0.5em] sm:text-lg",
    mark: "h-16 w-16 sm:h-24 sm:w-24",
    gap: "gap-4",
  },
};

/** The camera viewfinder mark: four corners and a focus point. */
export function ViewfinderMark({ className, tone = "light" }) {
  const outer = tone === "dark" ? "stroke-ember" : "stroke-brand";
  const accent = tone === "dark" ? "stroke-cream" : "stroke-ember";
  const dot = tone === "dark" ? "fill-ember" : "fill-ember";
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 18V11a3 3 0 0 1 3-3h7" className={outer} />
      <path d="M30 8h7a3 3 0 0 1 3 3v7" className={accent} />
      <path d="M40 30v7a3 3 0 0 1-3 3h-7" className={outer} />
      <path d="M18 40h-7a3 3 0 0 1-3-3v-7" className={accent} />
      <circle cx="24" cy="24" r="4.5" className={dot} stroke="none" />
    </svg>
  );
}

/**
 * Luqta wordmark. The Arabic name is the major mark, the English name the minor one.
 * variant "dark" = text for light backgrounds, "light" = text for ink backgrounds.
 */
export default function Logo({ size = "md", variant = "dark", stacked = true, mark = true, className }) {
  const s = SIZES[size] || SIZES.md;
  const arabicColor = variant === "light" ? "text-cream" : "text-ink";
  const latinColor = variant === "light" ? "text-ember" : "text-brand";
  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      {mark && <ViewfinderMark className={cn(s.mark, "shrink-0")} tone={variant === "light" ? "dark" : "light"} />}
      <span className={cn("flex leading-none", stacked ? "flex-col items-start gap-1" : "items-baseline gap-2")}>
        <span lang="ar" dir="rtl" className={cn("font-wordmark font-bold leading-[1.05]", s.arabic, arabicColor)}>
          لقطة
        </span>
        <span className={cn("font-semibold leading-none", s.latin, latinColor)}>Luqta</span>
      </span>
      <span className="sr-only">Luqta</span>
    </span>
  );
}
