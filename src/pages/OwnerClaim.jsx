import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageCircleQuestion, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { isAccessError, messageOf } from "../lib/errors.js";
import { useClaim } from "../hooks/useData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useContactGate } from "../components/ContactGate.jsx";
import AnimatedCheck from "../components/AnimatedCheck.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Field, { Textarea } from "../components/Field.jsx";
import Page from "../components/Page.jsx";
import { ErrorState, ListSkeleton } from "../components/states.jsx";

/** The owner sees ONLY the question. Never the photo, the finder, or where it was found. */
export default function OwnerClaim() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { requireContact } = useContactGate();
  const { data: claim, error, refresh } = useClaim(claimId);
  const [answer, setAnswer] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (error && isAccessError(error)) navigate("/forbidden", { replace: true });
    else if (claim && user && claim.ownerId !== user.id) navigate("/forbidden", { replace: true });
  }, [error, claim, user, navigate]);

  if (!claim) {
    return <Page title="Question">{error && !isAccessError(error) ? <ErrorState error={error} onRetry={refresh} /> : <ListSkeleton count={1} />}</Page>;
  }
  if (claim.ownerId !== user?.id) return null;

  async function submit(event) {
    event.preventDefault();
    if (answer.trim().length < 2) {
      setFieldError("Write your answer first.");
      return;
    }
    if (!(await requireContact())) return;
    setBusy(true);
    setFieldError("");
    try {
      await api.answerClaim({ claimId, answer: answer.trim() });
      toast.success("Answer sent");
      refresh();
    } catch (e) {
      setFieldError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  const done = claim.status !== "pending";

  return (
    <Page title="A question for you">
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">Is this your item?</h1>
      <p className="mb-6 mt-1.5 text-muted">Someone found something that may be yours. Answer their question to prove it. They'll decide if it matches.</p>

      <Card padding="lg">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ember/20 text-brand">
            <MessageCircleQuestion className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">Their question</p>
            <p className="mt-1 text-xl font-bold leading-snug text-ink">{claim.question}</p>
          </div>
        </div>

        {!done ? (
          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <Field label="Your answer" error={fieldError} hint="Be specific. Only the real owner would know this.">
              <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={400} placeholder="Type your answer…" />
            </Field>
            <Button type="submit" size="lg" className="w-full" icon={Send} loading={busy}>
              Send my answer
            </Button>
          </form>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-2xl bg-sand p-6 text-center">
            {claim.status === "accepted" ? <AnimatedCheck size={72} /> : null}
            <p className="mt-3 text-lg font-bold text-ink">
              {claim.status === "answered" && "Answer sent. Waiting for the finder."}
              {claim.status === "accepted" && "Confirmed! It's yours."}
              {claim.status === "rejected" && "The finder couldn't confirm this one. Your report is still open."}
            </p>
            {claim.answer && <p className="mt-2 max-w-md text-muted">You answered: “{claim.answer}”</p>}
            {claim.status === "accepted" ? (
              <Button className="mt-5" variant="accent" to={`/handover/${claim.id}`}>Get the contact details</Button>
            ) : (
              <Button className="mt-5" variant="outline" to="/my-reports">Back to my reports</Button>
            )}
          </div>
        )}
      </Card>
    </Page>
  );
}
