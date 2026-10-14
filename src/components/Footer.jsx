import Logo from "./Logo.jsx";

export default function Footer() {
  return (
    <footer className="border-t border-line/70 bg-cream">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-3 px-4 py-8 text-center sm:flex-row sm:text-start">
        <Logo size="sm" mark={false} stacked={false} />
        <p className="text-sm text-muted">Lost it? Found it? Let's get it back to them. Contact details stay private until both sides confirm.</p>
      </div>
    </footer>
  );
}
