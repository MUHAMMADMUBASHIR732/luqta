import { CircleCheck, CircleDashed, CircleHelp, CircleX, Hourglass, MessageCircleQuestion } from "lucide-react";
import { cn } from "../lib/cn.js";
import { STATE_LABEL, STATE_TONE } from "../lib/status.js";

const TONE = {
  neutral: "bg-sand text-ink",
  attention: "bg-ember text-ink-950",
  info: "bg-rose text-white",
  success: "bg-success-bg text-success",
  muted: "bg-line/70 text-muted",
};

const ICON = {
  open: CircleDashed,
  pending: Hourglass,
  answered: MessageCircleQuestion,
  accepted: CircleCheck,
  rejected: CircleX,
  returned: CircleCheck,
};

/** State pill. The icon and the word carry the meaning, color only supports it. */
export default function StatusBadge({ state = "open", label, className }) {
  const Icon = ICON[state] || CircleHelp;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", TONE[STATE_TONE[state]], className)}>
      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      {label || STATE_LABEL[state]}
    </span>
  );
}
