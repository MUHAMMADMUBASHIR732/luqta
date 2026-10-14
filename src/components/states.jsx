import { Inbox, TriangleAlert } from "lucide-react";
import { cn } from "../lib/cn.js";
import { messageOf } from "../lib/errors.js";
import Button from "./Button.jsx";

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-xl bg-sand", className)} aria-hidden="true" />;
}

export function CardSkeleton({ lines = 3, photo = true }) {
  return (
    <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-soft" aria-hidden="true">
      <div className="flex gap-4">
        {photo && <Skeleton className="h-24 w-24 shrink-0" />}
        <div className="flex-1 space-y-3 pt-1">
          <Skeleton className="h-5 w-2/3" />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <Skeleton key={i} className={cn("h-4", i % 2 ? "w-1/2" : "w-5/6")} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10" role="status" aria-label="Loading">
      <Skeleton className="mb-6 h-9 w-56" />
      <ListSkeleton count={2} />
    </div>
  );
}

/** An empty screen is an invitation: say what is missing and offer the next step. */
export function EmptyState({ icon: Icon = Inbox, title, text, action, className }) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center", className)}>
      <div className="viewfinder mb-5 grid h-20 w-20 place-items-center text-brand [--vf-inset:0px] [--vf-len:14px] [--vf-thick:2px] [--vf-color:var(--color-rose)]">
        <Icon className="h-8 w-8 animate-bob" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {text && <p className="mt-1.5 max-w-sm text-balance text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Plain-language failure with a way to try again. Never shows the raw error. */
export function ErrorState({ error, title = "We couldn't load this", onRetry, className }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center rounded-2xl border border-line bg-white px-6 py-12 text-center shadow-soft", className)}>
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
        <TriangleAlert className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-sm text-muted">{messageOf(error)}</p>
      {onRetry && (
        <Button className="mt-6" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
