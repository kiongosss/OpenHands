/* eslint-disable i18next/no-literal-string -- Auth surface copy is not yet translated */
import React from "react";
import { useSupabaseAuth } from "#/contexts/supabase-auth-context";
import { LoadingSpinner } from "#/components/shared/loading-spinner";

/**
 * Full-screen login shown when the platform requires authentication and
 * the user has not yet signed in with Supabase.
 *
 * Offers Google and GitHub OAuth. If Supabase is not configured, it
 * instructs the operator to set the required env vars.
 */
export default function SupabaseLoginScreen() {
  const { signInWithGoogle, signInWithGitHub, isLoading, error, user } =
    useSupabaseAuth();

  // If the OAuth redirect has already resolved to a session, reload so the
  // backend registry can seed from the persisted token before the app renders.
  React.useEffect(() => {
    if (user) {
      window.location.reload();
    }
  }, [user]);

  const hasSupabase = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );

  return (
    <div
      data-testid="supabase-login-screen"
      className="flex min-h-screen items-center justify-center bg-base px-6"
    >
      <div className="relative w-full max-w-md rounded-xl border border-[var(--oh-border)] bg-base-secondary px-8 py-10 shadow-2xl">
        <h2 className="mb-2 text-center text-2xl font-semibold text-white">
          Sign in to OpenHands
        </h2>
        <p className="mb-8 text-center text-sm text-[var(--oh-muted)]">
          Continue with your platform account
        </p>

        {isLoading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="large" />
          </div>
        )}

        {!isLoading && !hasSupabase && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            Supabase is not configured. Set{" "}
            <code className="rounded bg-base px-1">VITE_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-base px-1">VITE_SUPABASE_ANON_KEY</code>{" "}
            to enable Google and GitHub OAuth.
          </div>
        )}

        {!isLoading && hasSupabase && (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-5 py-3 font-medium text-base hover:bg-gray-100"
            >
              Sign in with Google
            </button>

            <button
              type="button"
              onClick={signInWithGitHub}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#2d2d2d] px-5 py-3 font-medium text-white hover:bg-[#3d3d3d]"
            >
              Sign in with GitHub
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
