import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

const STORAGE_KEY = "openoagent-supabase-auth";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client used for OAuth authentication (Google, GitHub).
 *
 * Returns `null` when the required env vars are not configured, allowing
 * the Canvas to fall back to a baked `VITE_SESSION_API_KEY` for local
 * development or agent-server-only deployments.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, { auth: { storageKey: STORAGE_KEY } })
    : null;

interface StoredSession {
  access_token: string;
  refresh_token: string;
  user?: User;
}

/**
 * Read the persisted Supabase access token from localStorage.
 *
 * This lets `makeDefaultLocalBackend()` seed a backend with the user's
 * platform token before React mounts, so the initial `/server_info` call
 * is authenticated immediately after an OAuth redirect.
 */
export function getSupabaseAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as StoredSession;
    return session.access_token ?? null;
  } catch {
    return null;
  }
}
