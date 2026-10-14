import { CircleX, Clock, Hourglass, MapPin, MessageCircleQuestion, PartyPopper } from "lucide-react";
import { formatWhen } from "../lib/format.js";
import { categoryLabel } from "../lib/schemas.js";
import Button from "./Button.jsx";
import Card from "./Card.jsx";
import MatchPhoto from "./MatchPhoto.jsx";
import ReasonChip from "./ReasonChip.jsx";
import SimilarityBar from "./SimilarityBar.jsx";

const NO_PHOTO_REASON = "Owner gave no photo: matched on description";

/**
 * One candidate for a found item. Everything comes from match.lostPreview, never from the lost report itself.
 * `claim` is the finder's claim on this match, if any.
 */
export default function MatchCard({ match, claim, onSelect, best = false }) {
  const p = match.lostPreview || {};
  const title = [p.color, p.brand, categoryLabel(p.category).toLowerCase()].filter(Boolean).join(" ");
  const heading = title.charAt(0).toUpperCase() + title.slice(1);
  const noPhotoNote = match.basis === "description" && !match.reasons.some((r) => /no photo/i.test(r));
  const attributeChips = [p.color && `Color: ${p.color}`, p.brand && `Brand: ${p.brand}`, ...(p.features || [])].filter(Boolean);

  let footer;
  if (!claim) {
    footer = (
      <Button className="w-full" icon={MessageCircleQuestion} onClick={() => onSelect(match)}>
        Ask the owner a question
      </Button>
    );
  } else if (claim.status === "rejected") {
    footer = (
      <p className="flex items-center justify-center gap-2 rounded-xl bg-line/60 px-4 py-3 text-center font-semibold text-muted">
        <CircleX className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        Declined
      </p>
    );
  } else if (claim.status === "accepted") {
    footer = (
      <Button className="w-full" variant="accent" icon={PartyPopper} to={`/handover/${claim.id}`}>
        Arrange the handover
      </Button>
    );
  } else if (claim.status === "answered") {
    footer = (
      <Button className="w-full" to={`/claim/${claim.id}/review`}>
        Review the owner's answer
      </Button>
    );
  } else {
    footer = (
      <p className="flex items-center justify-center gap-2 rounded-xl bg-sand px-4 py-3 text-center font-semibold text-ink">
        <Hourglass className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        Waiting for the owner's answer
      </p>
    );
  }

  return (
    <Card padding="none" interactive className={`group flex h-full flex-col overflow-hidden ${claim?.status === "rejected" ? "opacity-70" : ""}`}>
      <div className="viewfinder relative h-48 overflow-hidden bg-sand [--vf-color:var(--color-cream)] [--vf-inset:14px] group-hover:[--vf-inset:7px]">
        <MatchPhoto preview={p} label={`${heading || "Item"} reported lost`} className="transition-transform duration-700 ease-[var(--ease-luqta)] group-hover:scale-[1.07]" />
        {best && (
          <span className="absolute start-3 top-3 z-10 animate-ring rounded-full bg-ember px-3 py-1 text-sm font-bold text-ink-950 shadow-soft">Best match</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-bold text-ink">{heading || "Reported item"}</h3>
          {(p.place || p.dateTime) && (
            <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              {p.place && (
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Place</dt>
                  <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <dd>{p.place}</dd>
                </div>
              )}
              {p.dateTime && (
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Time</dt>
                  <Clock className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <dd>{formatWhen(p.dateTime)}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
        <SimilarityBar score={match.score} basis={match.basis} />
        <div className="flex flex-wrap gap-2">
          {noPhotoNote && <ReasonChip tone="note">{NO_PHOTO_REASON}</ReasonChip>}
          {match.reasons.map((r) => (
            <ReasonChip key={r} tone={/no photo/i.test(r) ? "note" : "reason"}>
              {r}
            </ReasonChip>
          ))}
          {attributeChips.map((c) => (
            <ReasonChip key={c} tone="plain">
              {c}
            </ReasonChip>
          ))}
        </div>
        <div className="mt-auto pt-1">{footer}</div>
      </div>
    </Card>
  );
}
