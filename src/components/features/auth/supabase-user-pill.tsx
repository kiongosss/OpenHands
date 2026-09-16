/* eslint-disable i18next/no-literal-string -- Auth surface copy is not yet translated */
import { useSupabaseAuth } from "#/contexts/supabase-auth-context";

/**
 * Small user pill for the top-right of the canvas.
 *
 * Displays the signed-in Supabase user's email and a logout button.
 * Hidden when no Supabase session is active.
 */
export function SupabaseUserPill() {
  const { user, signOut } = useSupabaseAuth();

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-full border border-[var(--oh-border)] bg-base-secondary px-4 py-2 shadow-lg">
      <span className="max-w-[160px] truncate text-sm text-white">
        {user.email ?? user.user_metadata?.full_name ?? user.id}
      </span>
      <button
        type="button"
        onClick={signOut}
        className="text-sm text-[var(--oh-muted)] hover:text-white"
      >
        Log out
      </button>
    </div>
  );
}
