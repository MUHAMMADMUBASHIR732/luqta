import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import {
  ArrowRight, Backpack, Camera, CupSoda, Headphones, IdCard, KeyRound, Laptop, PackageCheck, PackageSearch,
  ShieldCheck, Shirt, Smartphone, Sparkles, Umbrella, UserCheck, Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { illustrate } from "../lib/illustrations.js";
import { EASE } from "../lib/motion.js";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/Button.jsx";
import CountUp from "../components/CountUp.jsx";
import Page from "../components/Page.jsx";
import Reveal from "../components/Reveal.jsx";
import { ViewfinderMark } from "../components/Logo.jsx";

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
});

const STEPS = [
  { icon: Camera, title: "Report", text: "Snap a photo if you found it, or describe it if you lost it." },
  { icon: Sparkles, title: "We match", text: "Our AI compares photos and descriptions and picks the best five." },
  { icon: UserCheck, title: "Prove it", text: "The finder asks one question only the real owner can answer." },
  { icon: ShieldCheck, title: "Hand over", text: "Contact details appear only after the finder says yes." },
];

const THINGS = [
  [Backpack, "Backpacks"], [Laptop, "Laptops"], [Smartphone, "Phones"], [Wallet, "Wallets"], [KeyRound, "Keys"],
  [IdCard, "ID cards"], [CupSoda, "Bottles"], [Shirt, "Clothing"], [Umbrella, "Umbrellas"], [Headphones, "Earphones"],
];

const STATS = [
  { to: 5, label: "best matches per found item" },
  { to: 4, suffix: " steps", label: "from report to handover" },
  { to: 100, suffix: "%", label: "private until you confirm" },
];

function HeroMock() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const shiftX = useTransform(sx, [-0.5, 0.5], [-14, 14]);

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="relative mx-auto mt-14 w-full max-w-md [perspective:1100px] lg:mt-0" aria-hidden="true">
      <motion.div style={reduce ? undefined : { rotateX, rotateY }} className="[transform-style:preserve-3d]">
        <motion.div
          {...rise(0.25)}
          className="viewfinder relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-ink shadow-[0_30px_80px_-20px_rgba(231,123,73,0.35)] [--vf-color:var(--color-ember)] [--vf-inset:16px] [--vf-len:34px] [--vf-thick:4px] hover:[--vf-inset:10px]"
        >
          <img src={illustrate("backpack", "black")} alt="" className="h-full w-full object-cover" />
          <div className="animate-scan absolute inset-x-6 top-0 h-0.5 rounded-full bg-ember shadow-[0_0_18px_4px_rgba(231,123,73,0.7)]" />
        </motion.div>
        <motion.div
          style={reduce ? undefined : { x: shiftX, translateZ: 50 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.75 }}
          className="absolute -bottom-8 -start-2 w-64 rounded-2xl bg-cream p-4 shadow-lift sm:-start-8"
        >
          <div className="animate-bob">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-ink">Best match</p>
              <p className="text-2xl font-extrabold text-brand">94%</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <motion.div initial={{ width: 0 }} animate={{ width: "94%" }} transition={{ duration: 1.1, ease: EASE, delay: 1.1 }} className="h-full rounded-full bg-gradient-to-r from-brand to-ember" />
            </div>
            <p className="mt-3 inline-block rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">Same black Nike backpack</p>
          </div>
        </motion.div>
        <motion.div
          style={reduce ? undefined : { translateZ: 80 }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 1.3 }}
          className="absolute -end-3 top-10 grid h-14 w-14 place-items-center rounded-2xl bg-ember text-ink-950 shadow-lift sm:-end-6"
        >
          <ShieldCheck className="h-7 w-7 animate-bob" strokeWidth={1.75} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function Marquee() {
  const row = THINGS.map(([Icon, label]) => (
    <li key={label} className="flex shrink-0 items-center gap-2.5 rounded-full border border-line bg-white px-5 py-2.5 font-semibold text-ink shadow-soft transition-colors hover:border-rose/50 hover:bg-sand">
      <Icon className="h-5 w-5 text-brand" strokeWidth={1.75} aria-hidden="true" />
      {label}
    </li>
  ));
  return (
    <div className="relative overflow-hidden py-10 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]" aria-label="Things people lose and find">
      <ul className="animate-marquee flex w-max gap-3 hover:[animation-play-state:paused]">
        {row}
        {THINGS.map(([Icon, label]) => (
          <li key={`${label}-2`} aria-hidden="true" className="flex shrink-0 items-center gap-2.5 rounded-full border border-line bg-white px-5 py-2.5 font-semibold text-ink shadow-soft">
            <Icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  return (
    <Page flush>
      <section className="relative overflow-hidden bg-ink-950 text-cream">
        <div className="animate-drift pointer-events-none absolute -end-32 -top-32 h-96 w-96 rounded-full bg-brand/45 blur-3xl" aria-hidden="true" />
        <div className="animate-drift-slow pointer-events-none absolute -bottom-40 start-0 h-96 w-96 rounded-full bg-ember/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:26px_26px]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1100px] items-center gap-6 px-4 pb-24 pt-12 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:pb-28">
          <div>
            <motion.div {...rise(0)} className="flex items-center gap-3">
              <ViewfinderMark className="h-10 w-10" tone="dark" />
              <span className="text-sm font-semibold uppercase tracking-[0.4em] text-ember">Luqta</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.08 }}
              lang="ar"
              dir="rtl"
              className="font-wordmark mt-4 text-left text-[clamp(6rem,26vw,12rem)] font-bold leading-[0.95] text-cream"
            >
              لقطة
            </motion.h1>
            <motion.p {...rise(0.22)} className="mt-4 max-w-md text-xl font-semibold leading-snug text-cream/95 sm:text-2xl">
              Lost something? Found something? <span className="text-gradient">Let's get it home.</span>
            </motion.p>
            <motion.p {...rise(0.3)} className="mt-3 max-w-md text-cream/70">
              Report in a minute. We match it with the other side and keep your contact details private until the owner is confirmed.
            </motion.p>
            <motion.div {...rise(0.38)} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/report/lost" size="lg" variant="accent" icon={PackageSearch} className="animate-ring">
                I lost something
              </Button>
              <Button to="/report/found" size="lg" variant="secondary" icon={PackageCheck}>
                I found something
              </Button>
            </motion.div>
            {!user && (
              <motion.p {...rise(0.45)} className="mt-5 text-sm text-cream/70">
                Already have a report?{" "}
                <Link to="/login" className="font-semibold text-cream underline underline-offset-4 transition-colors hover:text-ember">
                  Sign in
                </Link>
              </motion.p>
            )}
          </div>
          <HeroMock />
        </div>
        <svg className="absolute inset-x-0 bottom-[-1px] h-8 w-full text-cream sm:h-12" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0 48V24C240 4 480 0 720 12s480 28 720 8v28z" />
        </svg>
      </section>

      <Marquee />

      <section className="mx-auto max-w-[1100px] px-4 pb-8 pt-6" aria-labelledby="how">
        <Reveal>
          <h2 id="how" className="text-3xl font-bold text-ink sm:text-4xl">
            How it works
          </h2>
          <p className="mt-2 max-w-xl text-muted">Four short steps, and nobody has to share a phone number until it's safe.</p>
        </Reveal>
        <ol className="relative mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute inset-x-[12%] top-[3.35rem] hidden h-0.5 bg-gradient-to-r from-brand/0 via-rose/40 to-ember/0 lg:block" aria-hidden="true" />
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} as="li" delay={i * 0.09} className="group relative cursor-default rounded-2xl border border-line/80 bg-white p-6 shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-luqta)] hover:-translate-y-1.5 hover:border-rose/40 hover:shadow-lift">
              <span className="absolute end-5 top-4 text-5xl font-extrabold text-sand transition-colors duration-300 group-hover:text-ember/30" aria-hidden="true">
                {i + 1}
              </span>
              <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand transition-all duration-300 ease-[var(--ease-luqta)] group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
                <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
              <p className="mt-1.5 text-muted">{text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-14" aria-label="At a glance">
        <dl className="grid gap-4 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="rounded-2xl border border-line/80 bg-white/70 p-6 text-center backdrop-blur transition-transform duration-300 ease-[var(--ease-luqta)] hover:-translate-y-1">
              <dd className="text-5xl font-extrabold text-brand">
                <CountUp to={s.to} suffix={s.suffix} />
              </dd>
              <dt className="mt-1 text-muted">{s.label}</dt>
            </Reveal>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 pb-20">
        <Reveal className="relative overflow-hidden rounded-3xl bg-ink p-8 text-cream sm:p-10">
          <div className="animate-drift pointer-events-none absolute -end-10 -top-16 h-56 w-56 rounded-full bg-ember/25 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-2xl font-bold sm:text-3xl">Your privacy comes first.</p>
              <p className="mt-1.5 max-w-lg text-cream/75">Only the finder sees matches. Only the confirmed owner gets contact details.</p>
            </div>
            <Button to={user ? "/my-reports" : "/login"} variant="accent" size="lg" iconEnd={ArrowRight}>
              {user ? "My reports" : "Get started"}
            </Button>
          </div>
        </Reveal>
      </section>
    </Page>
  );
}
