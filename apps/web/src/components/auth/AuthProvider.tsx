"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (sessionError) {
          setError(sessionError.message);
          setSession(null);
        } else {
          setSession(data.session ?? null);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar a sessão.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setError(null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      error,
      signOut: async () => {
        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
          throw signOutError;
        }
      },
    }),
    [session, isLoading, error],
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
