import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircleCheck, CircleX, Hourglass } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { isAccessError, messageOf } from "../lib/errors.js";
import { useClaim } from "../hooks/useData.js";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Page from "../components/Page.jsx";
import { ErrorState, ListSkeleton } from "../components/states.jsx";

/** The finder compares the owner's answer with what they know, then accepts or declines. */
export default function ClaimReview() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: claim, error, refresh } = useClaim(claimId, { interval: 5000, until: (c) => c?.status !== "pending" });
  const [busy, setBusy] = useState(null);
  const [failure, setFailure] = useState("");

  useEffect(() => {
    if (error && isAccessError(error)) navigate("/forbidden", { replace: true });
    else if (claim && user && claim.finderId !== user.id) navigate("/forbidden", { replace: true });
  }, [error, claim, user, navigate]);

  if (!claim) return <Page title="Review answer">{error && !isAccessError(error) ? <ErrorState error={error} onRetry={refresh} /> : <ListSkeleton count={1} />}</Page>;
  if (claim.finderId !== user?.id) return null;

  async function respond(accept) {
    setBusy(accept ? "yes" : "no");
    setFailure("");
    try {
      await api.respondClaim({ claimId, accept });
      if (accept) navigate(`/handover/${claimId}`, { replace: true });
      else {
        toast("Declined. You can pick another match.");
        navigate(-1);
      }
    } catch (e) {
      setFailure(messageOf(e));
      setBusy(null);
    }
  }

  return (
    <Page title="Review the answer">
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">Review the owner's answer</h1>
      <p className="mb-6 mt-1.5 text-muted">Does the answer match the item in your hands? Only accept if you're sure.</p>

      <Card padding="lg" className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">You asked</p>
          <p className="mt-1 text-lg font-bold text-ink">{claim.question}</p>
        </div>
        <div className="rounded-2xl bg-sand p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">They answered</p>
          {claim.answer ? (
            <p className="mt-1 text-xl font-bold leading-snug text-ink">“{claim.answer}”</p>
          ) : (
            <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-ink">
              <Hourglass className="h-5 w-5" aria-hidden="true" /> Waiting for the owner's answer…
            </p>
          )}
        </div>

        {failure && <p role="alert" className="rounded-xl bg-brand/10 px-4 py-3 text-sm font-medium text-brand">{failure}</p>}

        {claim.status === "answered" && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" size="lg" icon={CircleCheck} loading={busy === "yes"} disabled={Boolean(busy)} onClick={() => respond(true)}>
              Yes, it matches
            </Button>
            <Button className="flex-1" size="lg" variant="outline" icon={CircleX} loading={busy === "no"} disabled={Boolean(busy)} onClick={() => respond(false)}>
              No, it doesn't
            </Button>
          </div>
        )}
        {claim.status === "accepted" && <Button to={`/handover/${claim.id}`} variant="accent" className="w-full">Arrange the handover</Button>}
        {claim.status === "rejected" && <p className="font-semibold text-muted">You declined this answer.</p>}
        {claim.status === "pending" && <Button to="/my-reports" variant="outline" className="w-full">Back to my reports</Button>}
      </Card>
    </Page>
  );
}
