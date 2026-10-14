import { useEffect, useState } from "react";
import { messageOf } from "../lib/errors.js";
import Button from "./Button.jsx";
import Dialog from "./Dialog.jsx";
import Field, { Textarea } from "./Field.jsx";

const EXAMPLES = [
  "What sticker is on the back?",
  "What is inside the front pocket?",
  "What does the lock screen show?",
  "Where are the scratches or marks?",
];

const MIN = 8;

/** The finder writes a question only the real owner could answer. The owner never sees the photo. */
export default function QuestionSheet({ open, onClose, onSubmit }) {
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setQuestion("");
      setError("");
    }
  }, [open]);

  async function submit(event) {
    event.preventDefault();
    const text = question.trim();
    if (text.length < MIN) {
      setError(`Write a little more. Ask about a detail only the owner would know (at least ${MIN} characters).`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit(text);
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
      title="Ask the owner one question"
      description="Pick a detail that is not visible in the photo. The owner sees your question, never the photo."
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Your question" error={error}>
          <Textarea data-autofocus value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What sticker is on the back?" maxLength={240} />
        </Field>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Need an idea? Tap one.</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setQuestion(example)}
                className="min-h-11 rounded-full border border-line bg-white px-4 text-sm text-ink transition-colors hover:bg-sand"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Send question
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
