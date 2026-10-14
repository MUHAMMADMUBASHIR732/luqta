import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, CircleAlert, ImagePlus, Lightbulb, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "../lib/cn.js";
import { compressImage } from "../lib/image.js";
import { DUR, EASE } from "../lib/motion.js";
import Button from "./Button.jsx";

const HINT_OPTIONAL = "A photo makes matching much more accurate. You can skip it and describe the item instead.";
const HINT_REQUIRED = "The photo is how the owner's report gets matched, so make it clear.";

/**
 * Pick, take or drop a photo. Compresses to about 1280px and returns a File (or null).
 * `required` for the found form, optional for the lost form.
 */
export default function PhotoUploader({ value, onChange, required = false, error, className }) {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  async function handle(file) {
    setLocalError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLocalError("That file is not a photo. Choose a JPG or PNG image.");
      return;
    }
    setBusy(true);
    const small = await compressImage(file);
    setBusy(false);
    setFlash((n) => n + 1);
    onChange(small);
  }

  const onPick = (event) => {
    handle(event.target.files?.[0]);
    event.target.value = "";
  };
  const shownError = localError || error;

  return (
    <div className={className}>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-label="Take a photo" onChange={onPick} />
      <input ref={galleryRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-label="Choose a photo from your device" onChange={onPick} />

      {!value ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handle(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "viewfinder group flex flex-col items-center rounded-3xl border-2 border-dashed bg-white px-6 py-10 text-center transition-[border-color,background-color,box-shadow] duration-300 hover:border-rose hover:shadow-lift [--vf-inset:12px] hover:[--vf-inset:6px]",
            dragging ? "border-ember bg-ember/10" : shownError ? "border-brand" : "border-line"
          )}
        >
          <div className="animate-ring mb-4 grid h-16 w-16 place-items-center rounded-full bg-sand text-brand transition-transform duration-300 group-hover:scale-110">
            <Camera className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <p className="text-lg font-bold text-ink">{required ? "Add a photo of the item" : "Add a photo (optional)"}</p>
          <p className="mt-1 max-w-xs text-sm text-muted">Drop one here, take one now, or pick one from your gallery.</p>
          <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <Button className="flex-1" icon={Camera} onClick={() => cameraRef.current?.click()} loading={busy}>
              Take photo
            </Button>
            <Button className="flex-1" variant="outline" icon={ImagePlus} onClick={() => galleryRef.current?.click()} disabled={busy}>
              Choose photo
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
          <motion.div
            key={preview}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="viewfinder relative aspect-[4/3] bg-sand [--vf-color:var(--color-cream)] [--vf-inset:14px]"
          >
            {preview && <img src={preview} alt="Preview of the photo you added" className="h-full w-full object-cover" />}
            <AnimatePresence>
              {flash > 0 && (
                <motion.div
                  key={flash}
                  className="pointer-events-none absolute inset-0 bg-white"
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>
          </motion.div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-3">
            <p className="ps-2 text-sm font-medium text-muted">Photo ready</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => galleryRef.current?.click()} disabled={busy}>
                Replace
              </Button>
              {!required && (
                <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onChange(null)}>
                  Remove photo
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {shownError ? (
        <p role="alert" className="mt-3 flex items-start gap-1.5 text-sm font-medium text-brand">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          {shownError}
        </p>
      ) : (
        <p className="mt-3 text-sm leading-snug text-muted">{required ? HINT_REQUIRED : HINT_OPTIONAL}</p>
      )}
      <p className="mt-2 flex items-center gap-2 text-sm text-muted">
        <Lightbulb className="h-4 w-4 shrink-0 text-ember" strokeWidth={1.75} aria-hidden="true" />
        Use a plain background and good light, and show the brand or logo.
      </p>
      <span className="sr-only" aria-live="polite">
        {busy ? "Preparing your photo" : ""}
      </span>
      {/* DUR is imported for consistency with other components */}
      <span hidden>{DUR.ui}</span>
    </div>
  );
}
