import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircleQuestion, PackageCheck, PackageSearch, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { cn } from "../lib/cn.js";
import { categoryLabel } from "../lib/schemas.js";
import { claimsWaitingForOwner } from "../lib/status.js";
import { EASE } from "../lib/motion.js";
import { useMyReports } from "../hooks/useData.js";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/Button.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import ItemCard from "../components/ItemCard.jsx";
import Page from "../components/Page.jsx";
import { EmptyState, ErrorState, ListSkeleton } from "../components/states.jsx";

const TABS = [
  { id: "lost", label: "Lost", icon: PackageSearch, role: "owner" },
  { id: "found", label: "Found", icon: PackageCheck, role: "finder" },
];

export default function MyReports() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useMyReports(user?.id);
  const [tab, setTab] = useState("lost");
  const [toDelete, setToDelete] = useState(null);

  const cards = data?.cards || [];
  const waiting = useMemo(() => claimsWaitingForOwner(data?.claims || [], user?.id), [data, user]);
  const counts = { lost: cards.filter((c) => c.item.type === "lost").length, found: cards.filter((c) => c.item.type === "found").length };
  const shown = cards.filter((c) => c.item.type === tab);

  async function remove() {
    await api.deleteReport(toDelete.id);
    toast.success("Report deleted");
    refresh();
  }

  return (
    <Page title="My reports" wide>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">My reports</h1>
          <p className="mt-1 text-muted">Everything you reported, and what happens next.</p>
        </div>
        <div className="flex gap-2">
          <Button to="/report/lost" size="sm" variant="outline" icon={Plus}>
            Lost
          </Button>
          <Button to="/report/found" size="sm" icon={Plus}>
            Found
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {waiting.length > 0 && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-8 overflow-hidden"
            aria-label="Questions waiting for you"
          >
            <div className="rounded-3xl bg-ink p-5 text-cream sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <MessageCircleQuestion className="h-6 w-6 text-ember" strokeWidth={1.75} aria-hidden="true" />
                Questions waiting for you
              </h2>
              <ul className="mt-4 space-y-3">
                {waiting.map((c) => (
                  <li key={c.id} className="flex flex-col gap-3 rounded-2xl bg-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium">Someone may have found your item. Answer their question to confirm it's yours.</p>
                    <Button to={`/claim/${c.id}`} variant="accent" size="sm" className="shrink-0">
                      Answer now
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div role="tablist" aria-label="Report type" className="mt-8 inline-flex rounded-full bg-sand p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn("relative inline-flex min-h-11 items-center gap-2 rounded-full px-5 font-semibold transition-colors", tab === t.id ? "text-cream" : "text-ink hover:text-brand")}
          >
            {tab === t.id && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.3, ease: EASE }} />}
            <span className="relative flex items-center gap-2">
              <t.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              {t.label} <span className="text-sm opacity-70">{counts[t.id]}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6" role="tabpanel">
        {loading && !data ? (
          <ListSkeleton />
        ) : error && !data ? (
          <ErrorState error={error} onRetry={refresh} />
        ) : shown.length === 0 ? (
          <EmptyState
            icon={tab === "lost" ? PackageSearch : PackageCheck}
            title={tab === "lost" ? "Nothing lost, we hope" : "No found items yet"}
            text={tab === "lost" ? "If you lose something, report it and we'll watch for finders." : "Found something that isn't yours? Report it and we'll look for the owner."}
            action={
              <Button to={tab === "lost" ? "/report/lost" : "/report/found"} icon={Plus}>
                {tab === "lost" ? "Report a lost item" : "Report a found item"}
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-5">
            <AnimatePresence initial={false}>
              {shown.map((card, i) => (
                <motion.li
                  key={card.item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: EASE, delay: Math.min(i, 5) * 0.06 }}
                >
                  <ItemCard {...card} onDelete={() => setToDelete(card.item)} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      <p className="mt-10 text-center text-sm text-muted">
        <Link to="/" className="underline underline-offset-4">Back to start</Link>
      </p>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete this report?"
        description={toDelete ? `Your ${categoryLabel(toDelete.category).toLowerCase()} report will be removed for good.` : ""}
        confirmLabel="Delete report"
        onConfirm={remove}
      />
    </Page>
  );
}
