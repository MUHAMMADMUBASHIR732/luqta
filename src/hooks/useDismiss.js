import { useEffect } from "react";

/** Calls onClose on Escape or on a click outside `ref` while `open`. */
export function useDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && onClose();
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [ref, open, onClose]);
}
