import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Bell, BellOff } from "lucide-react";
import { api } from "../lib/api.js";
import { timeAgo } from "../lib/format.js";
import { routeForClaim } from "../lib/status.js";
import { DUR, EASE } from "../lib/motion.js";
import { useNotifications } from "../hooks/useData.js";
import { useDismiss } from "../hooks/useDismiss.js";
import { useAuth } from "../context/AuthContext.jsx";
import { cn } from "../lib/cn.js";

/** Bell with an unread dot and a dropdown of plain-language updates. Tapping one opens the right screen. */
export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data, refresh } = useNotifications(Boolean(user));
  useDismiss(ref, open, () => setOpen(false));

  const list = data || [];
  const unread = list.filter((n) => !n.read).length;

  async function openOne(n) {
    setOpen(false);
    try {
      if (!n.read) await api.markNotificationRead(n.id);
    } catch {
      /* ignore, navigation matters more */
    }
    refresh();
    let target = "/my-reports";
    if (n.claimId) {
      try {
        target = routeForClaim(await api.getClaim(n.claimId), user.id);
      } catch {
        /* fall back to the list */
      }
    }
    navigate(target);
  }

  async function readAll() {
    try {
      await api.markAllNotificationsRead();
    } catch {
      /* ignore */
    }
    refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-sand"
      >
        <Bell className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
        {unread > 0 && (
          <motion.span
            key={unread}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="absolute end-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 text-[0.7rem] font-bold text-ink-950"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: DUR.micro, ease: EASE }}
            className="fixed inset-x-3 top-[4.5rem] z-50 origin-top overflow-hidden rounded-2xl border border-line bg-white shadow-lift sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="font-bold text-ink">Updates</h2>
              {unread > 0 && (
                <button type="button" onClick={readAll} className="min-h-11 px-2 text-sm font-semibold text-brand hover:underline">
                  Mark all as read
                </button>
              )}
            </div>
            {list.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center text-muted">
                <BellOff className="mb-2 h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
                Nothing new yet. We'll tell you when someone replies.
              </div>
            ) : (
              <ul className="max-h-[60dvh] overflow-y-auto">
                {list.slice(0, 20).map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => openOne(n)}
                      className={cn("flex w-full items-start gap-3 border-b border-line/60 px-4 py-3.5 text-start transition-colors hover:bg-sand", !n.read && "bg-ember/10")}
                    >
                      <span className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", n.read ? "bg-line" : "bg-ember")} aria-hidden="true" />
                      <span className="min-w-0">
                        <span className={cn("block text-[0.95rem] leading-snug text-ink", !n.read && "font-semibold")}>{n.text}</span>
                        <span className="mt-0.5 block text-xs text-muted">{timeAgo(n.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
