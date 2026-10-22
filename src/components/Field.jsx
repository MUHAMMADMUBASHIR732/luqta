import { cloneElement, forwardRef, useId, useState } from "react";
import { ChevronDown, CircleAlert, Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/cn.js";

const control =
  "w-full rounded-xl border border-line bg-white px-4 text-base text-ink placeholder:text-muted/70 " +
  "transition-shadow duration-200 focus:border-ember focus:outline-none focus:ring-4 focus:ring-ember/30 " +
  "aria-[invalid=true]:border-brand aria-[invalid=true]:bg-brand/[0.03] disabled:opacity-60";

export const Input = forwardRef(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(control, "min-h-12", className)} {...rest} />;
});

/** Password box with an eye button to show or hide what was typed. */
export const PasswordInput = forwardRef(function PasswordInput({ className, ...rest }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={visible ? "text" : "password"} className={cn(control, "min-h-12 pe-12", className)} {...rest} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute end-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-sand hover:text-ink"
      >
        {visible ? <EyeOff className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" /> : <Eye className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />}
      </button>
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...rest} />;
});

export const Select = forwardRef(function Select({ className, children, ...rest }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, "min-h-12 appearance-none pe-11", className)} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" strokeWidth={1.75} aria-hidden="true" />
    </div>
  );
});

/** Label, hint and error around one control. The control gets its id and aria wiring automatically. */
export default function Field({ label, hint, error, optional = false, children, className }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && !error ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  const control = cloneElement(children, { id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined });

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-semibold text-ink">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {control}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm leading-snug text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm font-medium leading-snug text-brand">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
