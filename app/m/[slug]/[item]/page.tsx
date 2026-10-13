import type { Metadata } from "next";
import { fetchRestaurantMenu, findItem } from "@/lib/menu";
import { pick } from "@/lib/i18n";
import { ItemDetail } from "@/components/item-detail";
import { SetupNotice } from "@/components/setup-notice";

/**
 * One dish, at /m/sofra/margherita.
 *
 * Server-rendered from the same single query as the menu page — and cached the
 * same way, so a diner tapping through four dishes costs no extra database
 * work. A slug in the URL rather than a UUID means the link is readable and
 * shareable, which matters when someone sends a friend "look at this one".
 */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/m/[slug]/[item]">): Promise<Metadata> {
  const { slug, item: itemSlug } = await params;
  const result = await fetchRestaurantMenu(slug);
  if (result.status !== "ok") return { title: "Menu" };

  const found = findItem(result.data.menu, itemSlug);
  if (!found) return { title: result.data.name };

  const name = pick(found.item.names, result.data.defaultLocale);
  return {
    title: `${name} — ${result.data.name}`,
    description: pick(found.item.descriptions, result.data.defaultLocale),
  };
}

export default async function ItemPage({ params }: PageProps<"/m/[slug]/[item]">) {
  const { slug, item: itemSlug } = await params;
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
          "Run supabase/schema.sql, then supabase/seed.sql, in the Supabase SQL editor.",
        ]}
      />
    );
  }

  if (result.status !== "ok") {
    return (
      <SetupNotice
        title={`No published menu at “${slug}”`}
        detail={result.status === "error" ? result.message : undefined}
      />
    );
  }

  const found = findItem(result.data.menu, itemSlug);
  if (!found) {
    return (
      <SetupNotice
        title={`No dish called “${itemSlug}”`}
        detail="The link may be out of date, or the dish may have been removed from the menu."
      />
    );
  }

  return <ItemDetail restaurant={result.data} item={found.item} category={found.category} />;
}
