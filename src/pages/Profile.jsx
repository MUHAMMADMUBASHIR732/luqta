import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { initials } from "../lib/format.js";
import { messageOf } from "../lib/errors.js";
import { useAuth } from "../context/AuthContext.jsx";
import { markContactSaved } from "../components/ContactGate.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Field, { Input } from "../components/Field.jsx";
import Page from "../components/Page.jsx";
import { ErrorState, ListSkeleton } from "../components/states.jsx";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const load = () => {
    setError(null);
    api.getProfile().then((p) => {
      setProfile(p);
      setName(p.name || "");
      setPhone(p.phone || "");
    }).catch(setError);
  };
  useEffect(load, []);

  async function save(event) {
    event.preventDefault();
    setPhoneError("");
    if (phone.trim() && !/^[+()\d][\d\s()-]{6,18}$/.test(phone.trim())) {
      setPhoneError("Enter a phone number like +92 300 1234567.");
      return;
    }
    setBusy(true);
    try {
      await api.updateProfile({ name });
      if (phone.trim()) {
        await api.saveContact({ phone, email: profile.email || user.email });
        markContactSaved(user.id);
      }
      toast.success("Profile saved");
      load();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    await signOut();
    navigate("/");
  }

  return (
    <Page title="Profile">
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">Your profile</h1>
      {error ? (
        <ErrorState className="mt-6" error={error} onRetry={load} />
      ) : !profile ? (
        <div className="mt-6"><ListSkeleton count={1} /></div>
      ) : (
        <>
          <Card padding="lg" className="mt-6 flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand text-xl font-bold text-white">{initials(profile.name)}</span>
            <div className="min-w-0">
              <p className="truncate text-xl font-bold text-ink">{profile.name}</p>
              <p className="truncate text-muted">{profile.email || user?.email}</p>
            </div>
            {profile.trustScore != null && (
              <div className="ms-auto text-end">
                <p className="flex items-center justify-end gap-1 text-sm font-semibold text-success"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Trust</p>
                <p className="text-2xl font-extrabold text-ink">{profile.trustScore}</p>
              </div>
            )}
          </Card>
          <Card padding="lg" className="mt-5">
            <form onSubmit={save} noValidate className="space-y-4">
              <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></Field>
              <Field label="Phone" error={phoneError} hint="Shared only with the other person after the finder accepts an answer.">
                <Input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" autoComplete="tel" />
              </Field>
              <Button type="submit" loading={busy} className="w-full sm:w-auto">Save changes</Button>
            </form>
          </Card>
          <Button className="mt-5" variant="outline" icon={LogOut} onClick={leave}>Sign out</Button>
        </>
      )}
    </Page>
  );
}
