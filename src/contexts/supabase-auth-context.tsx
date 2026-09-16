import React from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "#/services/supabase";

interface SupabaseAuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SupabaseAuthContext =
  React.createContext<SupabaseAuthContextValue | null>(null);

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Read the existing session on mount (e.g. after an OAuth redirect).
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setIsLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithProvider = React.useCallback(
    async (provider: "google" | "github") => {
      if (!supabase) {
        setError("Supabase is not configured.");
        return;
      }

      setError(null);
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      } else if (data.url) {
        // Navigate to the provider's OAuth consent screen.
        window.location.assign(data.url);
      }
    },
    [],
  );

  const signInWithGoogle = React.useCallback(
    () => signInWithProvider("google"),
    [signInWithProvider],
  );

  const signInWithGitHub = React.useCallback(
    () => signInWithProvider("github"),
    [signInWithProvider],
  );

  const signOut = React.useCallback(async () => {
    if (!supabase) return;
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    } else {
      // Force a full reload so the backend registry re-evaluates auth and
      // the login screen reappears.
      window.location.reload();
    }
  }, []);

  const value = React.useMemo<SupabaseAuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      error,
      signInWithGoogle,
      signInWithGitHub,
      signOut,
    }),
    [
      user,
      session,
      isLoading,
      error,
      signInWithGoogle,
      signInWithGitHub,
      signOut,
    ],
  );

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth(): SupabaseAuthContextValue {
  const ctx = React.useContext(SupabaseAuthContext);
  if (!ctx) {
    throw new Error(
      "useSupabaseAuth must be used inside <SupabaseAuthProvider>",
    );
  }
  return ctx;
}
