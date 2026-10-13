import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client for PUBLIC, read-only data (the menu a diner sees).
 *
 * The key here is published to the browser — that is by design. What keeps the
 * database safe is Row Level Security in supabase/schema.sql, not the key being
 * secret. Supabase calls it the "publishable" key on new projects
 * (sb_publishable_…) and the legacy "anon" key on older ones; both work.
 *
 * Never put the secret / `service_role` key in this project: it bypasses RLS
 * entirely, and anything prefixed NEXT_PUBLIC_ is shipped to the browser.
 *
 * Returns null when the environment is not configured yet, so the page can
 * render a setup screen instead of a stack trace.
 */
export function createAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
