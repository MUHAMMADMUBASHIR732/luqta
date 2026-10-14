import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { SearchX } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { isAccessError } from "../lib/errors.js";
import { EASE } from "../lib/motion.js";
import { useItem, useMatches } from "../hooks/useData.js";
import { useAuth, useIsFinderOf } from "../context/AuthContext.jsx";
import { useContactGate } from "../components/ContactGate.jsx";
import Button from "../components/Button.jsx";
import MatchCard from "../components/MatchCard.jsx";
import Page from "../components/Page.jsx";
import QuestionSheet from "../components/QuestionSheet.jsx";
import AnalyzingScreen from "../components/AnalyzingScreen.jsx";
import { EmptyState, ErrorState, ListSkeleton } from "../components/states.jsx";
import { useEffect } from "react";

/** Only the finder reaches this screen. Anyone else (including the owner) is sent to /forbidden. */
export default function FinderMatches() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { requireContact } = useContactGate();
  const { data: item, error: itemError, refresh: refreshItem } = useItem(id, { interval: 5000, until: (i) => i?.analyzed });
  const isFinder = useIsFinderOf(item);
  const matchesReady = Boolean(item?.analyzed && isFinder);
  const { data, loading, error, refresh } = useMatches(id, matchesReady);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (itemError && isAccessError(itemError)) navigate("/forbidden", { replace: true });
    else if (item && user && !isFinder) navigate("/forbidden", { replace: true });
  }, [itemError, item, user, isFinder, navigate]);

  if (!item) {
    return (
      <Page title="Matches" wide>
        {itemError && !isAccessError(itemError) ? <ErrorState error={itemError} onRetry={refreshItem} /> : <ListSkeleton />}
      </Page>
    );
  }
  if (!isFinder) return null;
  if (!item.analyzed) {
    return (
      <Page title="Analyzing">
        <AnalyzingScreen type="found" imageUrl={item.imageUrl} />
      </Page>
    );
  }

  const matches = data?.matches || [];
  const claims = data?.claims || [];
  const claimFor = (m) => claims.find((c) => c.matchId === m.id) || null;
  const hasAccepted = claims.some((c) => c.status === "accepted" && matches.some((m) => m.id === c.matchId));

  async function choose(match) {
    const ok = await requireContact();
    if (ok) setSelected(match);
  }

  async function send(question) {
    await api.startClaim({ matchId: selected.id, question });
    setSelected(null);
    toast.success("Question sent. We'll tell you when they answer.");
    refresh();
  }

  return (
    <Page title="Possible owners" wide>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">Possible owners</h1>
          <p className="mt-1 max-w-xl text-muted">
            These people reported something similar. Pick the best one and ask a question only the real owner can answer.
          </p>
        </div>
        <div className="viewfinder h-20 w-20 overflow-hidden rounded-2xl bg-sand [--vf-color:var(--color-cream)] [--vf-inset:6px] [--vf-len:12px]">
          {item.imageUrl && <img src={item.imageUrl} alt="The item you found" className="h-full w-full object-cover" />}
        </div>
      </div>

      <div className="mt-8">
        {loading && !data ? (
          <ListSkeleton />
        ) : error && !data ? (
          <ErrorState error={error} onRetry={refresh} />
        ) : matches.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No matches yet"
            text="Nobody has reported something like this. We'll keep checking and tell you when an owner appears."
            action={<Button to="/my-reports" variant="outline">Go to my reports</Button>}
          />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((m, i) => (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              >
                <MatchCard match={m} claim={claimFor(m)} best={i === 0 && matches.length > 1 && !claimFor(m)} onSelect={choose} />
              </motion.li>
            ))}
          </ul>
        )}
        {hasAccepted && <p className="mt-6 text-center font-semibold text-success">An owner was confirmed. Arrange the handover above.</p>}
      </div>

      <QuestionSheet open={Boolean(selected)} onClose={() => setSelected(null)} onSubmit={send} />
    </Page>
  );
}
