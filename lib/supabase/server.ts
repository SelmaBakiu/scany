import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * The signed-in merchant's client, for server components and server actions.
 *
 * Unlike the anon client in ./anon.ts this one carries the session cookie, so
 * `auth.uid()` is set inside Postgres and the membership policies in
 * schema.sql can tell whose restaurant this is. Those policies — not this
 * code — are what stop one merchant editing another's menu: even if a bug
 * here passed the wrong restaurant id, the database would refuse the write.
 *
 * Anything that uses this is dynamic by definition (it reads cookies), so it
 * is never cached. That is correct for the admin and wrong for the diner's
 * menu, which is why the two clients are separate files.
 */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a server component, where cookies are read-only.
          // proxy.ts refreshes the session instead, which is why
          // that file exists at all.
        }
      },
    },
  });
}
