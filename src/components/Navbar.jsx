import { useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ChevronDown, LogOut, Repeat, UserRound } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/cn.js";
import { initials } from "../lib/format.js";
import { DUR, EASE } from "../lib/motion.js";
import { useDismiss } from "../hooks/useDismiss.js";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "./Button.jsx";
import Logo from "./Logo.jsx";
import NotificationBell from "./NotificationBell.jsx";

const LINKS = [
  { to: "/report/lost", label: "I lost something" },
  { to: "/report/found", label: "I found something" },
  { to: "/my-reports", label: "My reports" },
];

const linkClass = (onHome) => ({ isActive }) =>
  cn(
    "relative inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-[0.95rem] font-semibold transition-colors duration-200",
    onHome
      ? isActive
        ? "bg-ember text-ink-950 shadow-soft"
        : "text-cream/90 hover:bg-white/10 hover:text-white"
      : isActive
        ? "bg-ink text-cream shadow-soft"
        : "text-ink hover:bg-sand hover:text-brand"
  );

export default function Navbar() {
  const { user, signOut, switchDemoUser, isMock, demoAccounts } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  useDismiss(menuRef, menu, () => setMenu(false));

  const onHome = location.pathname === "/";

  async function leave() {
    setMenu(false);
    await signOut();
    navigate("/");
  }

  async function swap(email) {
    setMenu(false);
    try {
      const next = await switchDemoUser(email);
      toast.success(`Now using the app as ${next.name}`);
      navigate("/my-reports");
    } catch {
      toast.error("Couldn't switch accounts. Try again.");
    }
  }

  const others = (demoAccounts || []).filter((a) => a.email !== user?.email);

  return (
    <header className={cn("sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300", onHome ? "border-white/10 bg-ink-950" : "border-line/70 bg-cream/85")}>
      <div className="mx-auto flex h-[4.25rem] max-w-[1100px] items-center justify-between gap-3 px-4">
        <Link to="/" aria-label="Luqta home" className="rounded-lg transition-transform duration-300 ease-[var(--ease-luqta)] hover:scale-[1.04]">
          <Logo size="sm" variant={onHome ? "light" : "dark"} stacked />
        </Link>

        {user && (
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass(onHome)}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-1">
          {user ? (
            <>
              <div className={onHome ? "text-cream [&_button:hover]:bg-white/10 [&_button]:text-cream" : ""}>
                <NotificationBell />
              </div>
              <div ref={menuRef} className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setMenu((o) => !o)}
                  aria-expanded={menu}
                  aria-haspopup="true"
                  className={cn("flex min-h-11 items-center gap-2 rounded-full ps-1 pe-3 transition-colors", onHome ? "text-cream hover:bg-white/10" : "text-ink hover:bg-sand")}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">{initials(user.name)}</span>
                  <span className="max-w-28 truncate text-sm font-semibold">{user.name}</span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: DUR.micro, ease: EASE }}
                      className="absolute end-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-lift"
                    >
                      <Link to="/profile" onClick={() => setMenu(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold text-ink hover:bg-sand">
                        <UserRound className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" /> Profile
                      </Link>
                      {isMock &&
                        others.map((a) => (
                          <button key={a.email} type="button" onClick={() => swap(a.email)} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start font-semibold text-ink hover:bg-sand">
                            <Repeat className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                            <span className="min-w-0">
                              <span className="block truncate">Switch to {a.name}</span>
                              <span className="block text-xs font-normal text-muted">Demo account</span>
                            </span>
                          </button>
                        ))}
                      <button type="button" onClick={leave} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 font-semibold text-brand hover:bg-sand">
                        <LogOut className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Button to="/login" size="sm" variant={onHome ? "accent" : "primary"}>
              Sign in
            </Button>
          )}
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-[-1px] h-[3px] origin-left bg-gradient-to-r from-brand via-rose to-ember"
      />
    </header>
  );
}
