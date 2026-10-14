import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../lib/cn.js";
import { DUR, EASE } from "../lib/motion.js";
import Button from "./Button.jsx";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
let lockCount = 0;

function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    lockCount += 1;
    document.body.style.overflow = "hidden";
    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.body.style.overflow = "";
    };
  }, [active]);
}

/**
 * Modal on desktop, bottom sheet on phones. Traps focus, closes on Escape, restores focus on close.
 */
export default function Dialog({ open, onClose, title, description, children, footer, className, hideClose = false }) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descId = useId();
  const returnFocus = useRef(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    returnFocus.current = document.activeElement;
    const panel = panelRef.current;
    const first = panel?.querySelector("[data-autofocus]") || panel?.querySelector(FOCUSABLE);
    (first || panel)?.focus({ preventScroll: true });

    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const nodes = [...panel.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-ink-950/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.ui, ease: EASE }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ duration: DUR.ui, ease: EASE }}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift focus:outline-none sm:max-w-lg sm:rounded-3xl",
              className
            )}
          >
            <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
              <div>
                {title && (
                  <h2 id={titleId} className="text-xl font-bold leading-snug text-ink">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descId} className="mt-1.5 text-muted">
                    {description}
                  </p>
                )}
              </div>
              {!hideClose && (
                <Button variant="ghost" size="sm" className="-me-3 -mt-2 !px-3" onClick={onClose} aria-label="Close">
                  <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </Button>
              )}
            </div>
            <div className="overflow-y-auto px-6 pb-6 pt-3">{children}</div>
            {footer && <div className="border-t border-line bg-cream/60 px-6 py-4 pb-safe">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export { Dialog as Sheet, Dialog as Modal };
