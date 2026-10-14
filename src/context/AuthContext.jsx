import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, isMock, demoAccounts, DEMO_PASSWORD } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      api.onAuth((next) => {
        setUser(next);
        setLoading(false);
      }),
    []
  );

  const signIn = useCallback(async (email, password) => {
    const next = await api.signIn(email, password);
    setUser(next);
    return next;
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    const result = await api.signUp(email, password, name);
    if (!result.needsConfirmation) setUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await api.signOut();
    setUser(null);
  }, []);

  // Demo data only: jump between the two demo accounts in one browser tab.
  const switchDemoUser = useCallback((email) => signIn(email, DEMO_PASSWORD), [signIn]);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, switchDemoUser, isMock, demoAccounts }),
    [user, loading, signIn, signUp, signOut, switchDemoUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** True when this person is the finder who reported this found item. Roles belong to reports, not accounts. */
export function useIsFinderOf(item) {
  const { user } = useAuth();
  return Boolean(user && item && item.type === "found" && item.userId === user.id);
}
