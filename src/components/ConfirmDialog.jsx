import { useState } from "react";
import { messageOf } from "../lib/errors.js";
import Button from "./Button.jsx";
import Dialog from "./Dialog.jsx";

/** Asks before something that cannot be undone. `onConfirm` may be async; errors are shown in plain words. */
export default function ConfirmDialog({ open, onClose, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, variant = "primary" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      description={description}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={confirm} loading={busy} data-autofocus>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {error && (
        <p role="alert" className="rounded-xl bg-brand/10 px-4 py-3 text-sm font-medium text-brand">
          {error}
        </p>
      )}
    </Dialog>
  );
}
