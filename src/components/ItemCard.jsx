import { Clock, MapPin, PackageCheck, PackageSearch, Trash2 } from "lucide-react";
import { cn } from "../lib/cn.js";
import { formatWhen } from "../lib/format.js";
import { categoryLabel } from "../lib/schemas.js";
import Button from "./Button.jsx";
import Card from "./Card.jsx";
import MatchPhoto from "./MatchPhoto.jsx";
import StatusBadge from "./StatusBadge.jsx";

const titleOf = (item) => {
  const parts = [item.color, item.brand, categoryLabel(item.category).toLowerCase()].filter(Boolean);
  const text = item.category || item.color || item.brand ? parts.join(" ") : "Item";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** One of my reports: photo (or the no-photo box), what it is, where and when, and where it stands. */
export default function ItemCard({ item, role, state, sentence, action, onDelete, className }) {
  const TypeIcon = item.type === "lost" ? PackageSearch : PackageCheck;
  const canDelete = onDelete && state !== "returned";
  return (
    <Card padding="none" interactive className={cn("group overflow-hidden", className)}>
      <div className="flex flex-col sm:flex-row">
        <div className="h-44 shrink-0 overflow-hidden sm:h-auto sm:w-48">
          <MatchPhoto preview={{ imageUrl: item.imageUrl, category: item.category }} label={`${titleOf(item)} you reported`} className="min-h-full transition-transform duration-700 ease-[var(--ease-luqta)] group-hover:scale-[1.06]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-muted">
              <TypeIcon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              {item.type === "lost" ? "You lost this" : "You found this"}
            </span>
            <StatusBadge state={state} />
          </div>
          <h3 className="truncate text-lg font-bold text-ink">{titleOf(item)}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            {item.location?.label && (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Place</dt>
                <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <dd>{item.location.label}</dd>
              </div>
            )}
            {item.dateTime && (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Time</dt>
                <Clock className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <dd>{formatWhen(item.dateTime)}</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-base font-semibold text-ink" data-role={role}>
            {sentence}
          </p>
          {(action || canDelete) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {action && (
                <Button to={action.to} size="sm" variant={state === "pending" || state === "answered" || state === "accepted" ? "primary" : "outline"}>
                  {action.label}
                </Button>
              )}
              {canDelete && (
                <Button variant="ghost" size="sm" icon={Trash2} onClick={onDelete} className="ms-auto !text-muted hover:!text-brand" aria-label={`Delete ${titleOf(item)} report`}>
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
