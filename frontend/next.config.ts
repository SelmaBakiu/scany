import type { NextConfig } from "next";

/**
 * Dish photos live in Supabase Storage, so next/image needs explicit
 * permission to optimise images from that host — it refuses arbitrary remote
 * URLs by default, which is what stops your image optimiser being used as a
 * free CDN for someone else's files.
 *
 * ---------------------------------------------------------------------------
 * If you have ever seen this:
 *
 *   Invalid src prop (https://xxxx.supabase.co/storage/v1/object/public/…)
 *   on `next/image`, hostname "xxxx.supabase.co" is not configured under
 *   images in your `next.config.js`
 *
 * …the cause is almost always that the dev server was STARTED BEFORE
 * .env.local had a Supabase URL in it. This file is read once, at startup, so
 * `NEXT_PUBLIC_SUPABASE_URL` was undefined at the moment the allow-list was
 * built, and the list came out empty. Editing .env.local afterwards does not
 * re-run this file, and neither does reloading the page.
 *
 *   >>> After changing .env.local, STOP the dev server (Ctrl-C) and run
 *   >>> `npm run dev` again. A reload is not enough.
 *
 * The fallback below means that even in that situation images still work: any
 * Supabase project's PUBLIC storage path is accepted. The exact-host pattern is
 * used whenever the env var is actually set, which is the normal case.
 * ---------------------------------------------------------------------------
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

function supabaseImageHosts(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const publicStorage = "/storage/v1/object/public/**";

  if (supabaseUrl) {
    try {
      return [
        {
          protocol: "https" as const,
          hostname: new URL(supabaseUrl).hostname,
          pathname: publicStorage,
        },
      ];
    } catch {
      console.warn(
        `[menuscan] NEXT_PUBLIC_SUPABASE_URL is not a valid URL ("${supabaseUrl}"). ` +
          "Falling back to allowing any *.supabase.co storage host for images.",
      );
    }
  } else {
    console.warn(
      "[menuscan] NEXT_PUBLIC_SUPABASE_URL is not set, so next/image cannot be locked to " +
        "your project's hostname. Fill in .env.local and RESTART the dev server.",
    );
  }

  // Wildcard fallback. Still restricted to the public storage path, so it
  // cannot be pointed at arbitrary files.
  return [
    { protocol: "https" as const, hostname: "**.supabase.co", pathname: publicStorage },
    { protocol: "https" as const, hostname: "**.supabase.in", pathname: publicStorage },
  ];
}

const nextConfig: NextConfig = {
  // Tailwind v4 runs as a Turbopack CSS loader. Without this rule `@import
  // "tailwindcss"` is passed through untouched and you get a 1 KB stylesheet
  // with no utility classes in it — the page renders, unstyled, with no error.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  images: {
    remotePatterns: supabaseImageHosts(),
  },

  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
