import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { MailCheck } from "lucide-react";
import { messageOf } from "../lib/errors.js";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Field, { Input } from "../components/Field.jsx";
import Logo from "../components/Logo.jsx";
import Page from "../components/Page.jsx";

export default function Login() {
  const { user, signIn, signUp, switchDemoUser, isMock, demoAccounts } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/my-reports";
  const [mode, setMode] = useState("in");
  const [formError, setFormError] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { name: "", email: "", password: "" } });

  if (user && !busy) return <Navigate to={from} replace />;

  async function go(action) {
    setBusy(true);
    setFormError("");
    try {
      const result = await action();
      if (result?.needsConfirmation) return;
      navigate(from, { replace: true });
    } catch (e) {
      setFormError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = handleSubmit(async (v) => {
    if (mode === "in") return go(() => signIn(v.email.trim(), v.password));
    setBusy(true);
    setFormError("");
    try {
      const result = await signUp(v.email.trim(), v.password, v.name.trim());
      if (result.needsConfirmation) setConfirmEmail(v.email.trim());
      else navigate(from, { replace: true });
    } catch (e) {
      setFormError(messageOf(e));
    } finally {
      setBusy(false);
    }
  });

  if (confirmEmail) {
    return (
      <Page title="Check your email">
        <Card padding="lg" className="mt-4 text-center">
          <MailCheck className="mx-auto h-14 w-14 text-brand" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-ink">Check your email</h1>
          <p className="mt-2 text-muted">We sent a confirmation link to {confirmEmail}. Open it, then come back and sign in.</p>
          <Button className="mt-6" onClick={() => { setConfirmEmail(""); setMode("in"); }}>
            Back to sign in
          </Button>
        </Card>
      </Page>
    );
  }

  return (
    <Page title={mode === "in" ? "Sign in" : "Create account"}>
      <div className="relative mx-auto max-w-md">
        <div className="animate-drift pointer-events-none absolute -start-24 -top-10 -z-10 h-64 w-64 rounded-full bg-ember/20 blur-3xl" aria-hidden="true" />
        <div className="animate-drift-slow pointer-events-none absolute -end-20 top-40 -z-10 h-64 w-64 rounded-full bg-rose/20 blur-3xl" aria-hidden="true" />
        <div className="mb-6 flex justify-center">
          <Logo size="md" />
        </div>
        <Card padding="lg">
          <h1 className="text-2xl font-bold text-ink">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-muted">{mode === "in" ? "Sign in to see your reports." : "It takes less than a minute."}</p>
          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            {mode === "up" && (
              <Field label="Your name" error={errors.name?.message}>
                <Input autoComplete="name" {...register("name", { required: "Tell us your name" })} />
              </Field>
            )}
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" autoComplete="email" inputMode="email" {...register("email", { required: "Enter your email", pattern: { value: /^\S+@\S+\.\S+$/, message: "That email doesn't look right" } })} />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <Input type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} {...register("password", { required: "Enter your password", minLength: mode === "up" ? { value: 6, message: "Use at least 6 characters" } : undefined })} />
            </Field>
            {formError && (
              <p role="alert" className="rounded-xl bg-brand/10 px-4 py-3 text-sm font-medium text-brand">
                {formError}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" loading={busy}>
              {mode === "in" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <p className="mt-5 text-center text-muted">
            {mode === "in" ? "New here? " : "Already registered? "}
            <button type="button" className="min-h-11 font-semibold text-brand underline underline-offset-4" onClick={() => { setMode(mode === "in" ? "up" : "in"); setFormError(""); }}>
              {mode === "in" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </Card>

        {isMock && (
          <Card padding="md" className="mt-5 border-dashed bg-sand/60">
            <p className="font-bold text-ink">Try the demo</p>
            <p className="mt-0.5 text-sm text-muted">Demo data lives in this browser. Pick a person to sign in instantly.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              {demoAccounts.map((a) => (
                <Button key={a.email} variant="outline" className="flex-1" disabled={busy} onClick={() => go(() => switchDemoUser(a.email))}>
                  {a.name} <span className="text-xs font-normal text-muted">({a.role})</span>
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Page>
  );
}
