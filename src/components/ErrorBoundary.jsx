import { Component } from "react";
import { TriangleAlert } from "lucide-react";

/** Last line of defense. Shows a calm message and a way home, never a stack trace. */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand/10 text-brand">
          <TriangleAlert className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-ink">This screen hit a problem</h1>
        <p className="mt-2 text-muted">Nothing was lost. Reload the page, or go back to the start.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="min-h-12 rounded-xl bg-brand px-5 font-semibold text-white hover:bg-rose"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
          <a href="/" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-white px-5 font-semibold text-ink hover:bg-sand">
            Go to the start
          </a>
        </div>
      </main>
    );
  }
}
