import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before every page renders. (Next.js 16 calls this file "proxy"; it was
 * called "middleware" until 16.4 and the old name now logs a deprecation
 * warning, so the file and the export were renamed. Nothing else changed.)
 *
 * Two jobs, both of which have to happen before the page renders.
 *
 * 1. Refresh the Supabase session and write the rotated cookies onto the
 *    response. Server components cannot set cookies, so without this a
 *    merchant gets signed out the moment their token expires mid-session.
 *
 * 2. Bounce anyone without a session away from /admin and /management.
 *
 * Point 2 is convenience, not security. The real protection is in the database:
 * every write policy in schema.sql checks membership, so a forged cookie or a
 * direct API call still gets nothing. This file just means an unauthenticated
 * visitor sees the login page instead of an empty dashboard.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Not configured yet: let the page render its own setup screen.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser(), not getSession(): it verifies the token with Supabase rather
  // than trusting whatever the cookie claims.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isProtectedPage = pathname.startsWith("/admin") || pathname.startsWith("/management");

  if (isProtectedPage && !isLoginPage && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/admin/login";
    // Remember where they were headed so sign-in can finish the journey.
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  if (isLoginPage && user) {
    const redirect = request.nextUrl.clone();
    const requested = request.nextUrl.searchParams.get("next");
    redirect.pathname = requested?.startsWith("/management") ? requested : "/admin/items";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  // Everything except static assets. The diner's menu passes straight through,
  // but it still needs the session refresh above to run on admin navigations.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
