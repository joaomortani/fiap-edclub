"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { fetchProfile, loginWithPassword, signUpWithPassword } from "@/lib/api/auth";
import { clearSession, getStoredSession, persistSession, type SessionTokens } from "@/lib/api/session";

type AuthContextValue = {
  user: User | null;
  tokens: SessionTokens | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ requiresConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const parseErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Não foi possível concluir a operação.";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<SessionTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      setUser(profile.user);
      setError(null);
    } catch (err) {
      const message = parseErrorMessage(err);
      setError(message);
      setUser(null);
      clearSession();
      setTokens(null);
      throw err;
    }
  }, []);

  useEffect(() => {
    const stored = getStoredSession();

    if (!stored) {
      setIsLoading(false);
      return;
    }

    setTokens(stored);

    loadProfile()
      .catch(() => {
        // handled inside loadProfile
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [loadProfile]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { session } = await loginWithPassword(email, password);
      persistSession(session);
      setTokens(session);
      await loadProfile();
      setError(null);
    } catch (err) {
      const message = parseErrorMessage(err);
      setError(message);
      clearSession();
      setTokens(null);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  const handleSignUp = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signUpWithPassword(email, password);

      if (result.session && result.user) {
        persistSession(result.session);
        setTokens(result.session);
        await loadProfile();
        setError(null);
        return { requiresConfirmation: false };
      }

      setError(null);
      return { requiresConfirmation: true };
    } catch (err) {
      const message = parseErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  const handleSignOut = useCallback(async () => {
    clearSession();
    setTokens(null);
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isLoading,
      error,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut,
      refreshProfile: loadProfile,
    }),
    [user, tokens, isLoading, error, handleSignIn, handleSignUp, handleSignOut, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de AuthProvider");
  }

  return context;
}
