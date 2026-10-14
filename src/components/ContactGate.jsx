import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { messageOf } from "../lib/errors.js";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "./Button.jsx";
import Dialog from "./Dialog.jsx";
import Field, { Input } from "./Field.jsx";

const ContactGateContext = createContext(null);
const flagKey = (uid) => `luqta:contact:${uid}`;
const PHONE = /^[+()\d][\d\s()-]{6,18}$/;

export const markContactSaved = (uid) => {
  try {
    localStorage.setItem(flagKey(uid), "1");
  } catch {
    /* storage unavailable */
  }
};

const wasSaved = (uid) => {
  try {
    return localStorage.getItem(flagKey(uid)) === "1";
  } catch {
    return false;
  }
};

/**
 * Wrap the app once. Pages call `const ok = await requireContact()` before starting or answering a claim.
 * The sheet only appears when the person has not saved a phone number yet.
 */
export function ContactGateProvider({ children }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const resolver = useRef(null);

  const requireContact = useCallback(async () => {
    if (!user) return false;
    if (wasSaved(user.id)) return true;
    try {
      const profile = await api.getProfile();
      if (profile?.phone) {
        markContactSaved(user.id);
        return true;
      }
    } catch {
      /* ask below */
    }
    return new Promise((resolve) => {
      resolver.current = resolve;
      setOpen(true);
    });
  }, [user]);

  const finish = useCallback((result) => {
    setOpen(false);
    resolver.current?.(result);
    resolver.current = null;
  }, []);

  const value = useMemo(() => ({ requireContact }), [requireContact]);

  return (
    <ContactGateContext.Provider value={value}>
      {children}
      <ContactSheet open={open} onClose={() => finish(false)} onSaved={() => finish(true)} />
    </ContactGateContext.Provider>
  );
}

export function useContactGate() {
  const ctx = useContext(ContactGateContext);
  if (!ctx) throw new Error("useContactGate must be used inside ContactGateProvider");
  return ctx;
}

function ContactSheet({ open, onClose, onSaved }) {
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!PHONE.test(phone.trim())) {
      setError("Enter a phone number the other person can call, like +92 300 1234567.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.saveContact({ phone, email: email || user?.email });
      markContactSaved(user.id);
      onSaved();
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      title="How can they reach you?"
      description="We share your contact details only after the finder accepts an answer, and only with the other person in this match."
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Phone number" error={error}>
          <Input data-autofocus type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" />
        </Field>
        <Field label="Email" optional hint="Pre-filled from your account.">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Not now
          </Button>
          <Button type="submit" loading={busy}>
            Save and continue
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
