import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The signed-in merchant's client, in the browser.
 *
 * It exists for exactly one reason: Realtime. Everything else the admin does
 * goes through a server action, where the session cookie is read on the
 * server and nothing is exposed. But a websocket has to be opened by the
 * browser, and for the merchant's board to receive only their own restaurant's
 * orders, that socket has to carry their session — Realtime applies the same
 * Row Level Security policies as a query, using whoever the connection says
 * it is.
 *
 * `createBrowserClient` from @supabase/ssr reads the same cookies the server
 * client writes, so the session is already there; there is no second login.
 *
 * Returns null when Supabase is not configured, so the board can fall back to
 * polling instead of throwing.
 */
let client: SupabaseClient | null = null;

export function createSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  // One client per tab. A second one would open a second websocket for the
  // same session, which costs a connection and gains nothing.
  client ??= createBrowserClient(url, key);
  return client;
}
