import { ImageOff } from "lucide-react";
import { cn } from "../lib/cn.js";
import { categoryLabel } from "../lib/schemas.js";

/** Photo of a reported item, or a grey "No photo provided" box when the owner skipped the photo. */
export default function MatchPhoto({ preview, className, label }) {
  const name = label || `${categoryLabel(preview?.category)} reported lost`;
  if (preview?.imageUrl) {
    return <img src={preview.imageUrl} alt={name} className={cn("h-full w-full object-cover", className)} loading="lazy" />;
  }
  return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center gap-2 bg-line/50 text-sm font-medium text-muted", className)}>
      <ImageOff className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
      No photo provided
    </div>
  );
}
