import { Check, ImageOff } from "lucide-react";
import { cn } from "../lib/cn.js";

/** Small tag explaining a match, for example "Same color: black". tone="note" is for caveats. */
export default function ReasonChip({ children, tone = "reason", className }) {
  const Icon = tone === "note" ? ImageOff : tone === "plain" ? null : Check;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm leading-snug transition-transform duration-200 ease-[var(--ease-luqta)] hover:-translate-y-0.5",
        tone === "reason" && "bg-sand text-ink",
        tone === "plain" && "border border-line bg-white text-muted",
        tone === "note" && "bg-line/60 text-muted",
        className
      )}
    >
      {Icon && <Icon className={cn("h-3.5 w-3.5 shrink-0", tone === "reason" && "text-brand")} strokeWidth={2.25} aria-hidden="true" />}
      {children}
    </span>
  );
}
