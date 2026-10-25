import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Elevated Supabase client for the platform management area only.
 *
 * Secret keys bypass Row Level Security. Keep this module server-only and
 * perform a normal signed-in platform-admin check before every use.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) return null;

  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
