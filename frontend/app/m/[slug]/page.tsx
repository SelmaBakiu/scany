import type { Metadata } from "next";
import { fetchRestaurantMenu } from "@/lib/menu";
import { MenuBrowser } from "@/components/menu-browser";
import { SetupNotice } from "@/components/setup-notice";

/**
 * The page a QR code points at: /m/sofra
 *
 * This is a SERVER component. It runs the database query on the server and
 * sends finished HTML, so a diner's phone gets the menu in the first response
 * instead of downloading JavaScript, booting it, and only then asking for the
 * data. It is the whole reason this project is Next.js and not a plain React
 * single-page app.
 *
 * `revalidate = 60` caches the rendered page for a minute: a thousand diners
 * scanning the same QR code cost one database query, not a thousand. When the
 * merchant app can change a menu, call revalidatePath(`/m/${slug}`) from the
 * save handler so edits appear at once instead of up to a minute later.
 */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/m/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchRestaurantMenu(slug);

  if (result.status !== "ok") {
    return { title: "Menu" };
  }

  return {
    title: `${result.data.name} — menu`,
    description: `The menu at ${result.data.name}.`,
    openGraph: {
      title: `${result.data.name} — menu`,
      type: "website",
    },
  };
}

export default async function MenuPage({ params }: PageProps<"/m/[slug]">) {
  const { slug } = await params;
  const result = await fetchRestaurantMenu(slug);

  if (result.status === "not-configured") {
    return (
      <SetupNotice
        title="Connect Supabase to see the menu"
        detail="The app is running, but it has no database to read from yet."
        steps={[
          "Create a project at supabase.com (the free tier is plenty).",
          "In the dashboard, open Settings -> API Keys (or the Connect button) and copy your project URL and publishable key.",
          "Copy .env.local.example to .env.local and paste both values in.",
          "Run backend/supabase/schema.sql, then backend/supabase/seed.sql, in the Supabase SQL editor.",
          "Restart the dev server and reload this page.",
        ]}
      />
    );
  }

  if (result.status === "error") {
    return (
      <SetupNotice
        title="The database refused that query"
        detail={result.message}
        steps={[
          "Confirm schema.sql ran without errors — the row level security policies at the bottom are what make the menu readable.",
          "Confirm the restaurant row has is_published = true; an unpublished restaurant is invisible to the anon key by design.",
        ]}
      />
    );
  }

  if (result.status === "not-found") {
    // Deliberately not notFound(): during setup, "no such slug" and "not
    // published yet" are the two likeliest causes and both need explaining.
    // Swap this for notFound() once you are live.
    return (
      <SetupNotice
        title={`No published menu at “${slug}”`}
        detail="Either no restaurant has that slug, or it exists but is_published is still false — row level security makes those two cases look identical from outside, on purpose."
        steps={[
          "Run backend/supabase/seed.sql to create the sample restaurant, then open /m/sofra.",
          "Or set is_published = true on your own row in the restaurants table.",
        ]}
      />
    );
  }

  if (!result.data.menu) {
    return (
      <SetupNotice
        title={`${result.data.name} has no active menu`}
        detail="The restaurant exists but every menu is either inactive or empty. An empty category is hidden on purpose, so a menu with no items at all shows up as nothing."
      />
    );
  }

  return <MenuBrowser restaurant={result.data} />;
}
