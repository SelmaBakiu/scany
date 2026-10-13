import { createSupabaseServerClient } from "./supabase/server";
import { emptyWeek, type AdminData, type AdminItemText } from "./admin-types";
import type { Translated } from "./types";

const IMAGE_BUCKET = "menu-images";

export type MerchantContext =
  | { status: "ok"; data: AdminData; email: string }
  | { status: "not-configured" }
  | { status: "signed-out" }
  | { status: "no-restaurant"; email: string }
  | { status: "error"; message: string };

/**
 * Everything the admin needs, for whichever restaurant this merchant owns.
 *
 * Five queries rather than one deeply nested one. The admin is behind a login
 * and renders per request anyway, so a few round trips cost nothing — and flat
 * queries mean no guessing about which foreign key PostgREST will follow
 * through the composite keys that link categories and items.
 *
 * Note what is NOT here: any filtering by ownership. The queries ask for
 * everything, and the row level security policies in schema.sql return only
 * this merchant's rows. If the policies were wrong, adding a `.eq()` here
 * would hide the bug rather than fix it.
 */
export async function getMerchantContext(): Promise<MerchantContext> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "not-configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };

  const email = user.email ?? "";

  const { data: membership, error: membershipError } = await supabase
    .from("restaurant_members")
    .select("restaurant_id")
    .limit(1)
    .maybeSingle();

  if (membershipError) return { status: "error", message: membershipError.message };
  if (!membership) return { status: "no-restaurant", email };

  const restaurantId = membership.restaurant_id as string;

  const [restaurantRes, menusRes, categoriesRes, itemsRes, tagsRes, currencyRes] = await Promise.all([
    supabase
      .from("restaurants")
      .select(
        "id, slug, name, theme, ordering_enabled, logo_path, address, phone, email, maps_url, timezone, socials, opening_hours, default_locale, base_currency, is_published, restaurant_translations(locale, description)",
      )
      .eq("id", restaurantId)
      .single(),
    supabase
      .from("menus")
      .select("id, slug, sort_order, is_active, menu_translations(locale, name)")
      .order("sort_order"),
    supabase
      .from("categories")
      .select("id, slug, menu_id, sort_order, is_visible, category_translations(locale, name)")
      .order("sort_order"),
    supabase
      .from("items")
      .select(
        "id, slug, category_id, price_minor, image_path, image_prompt, is_available, is_featured, sort_order, item_translations(locale, name, description, description_long, ingredients), item_tags(tag_id)",
      )
      .order("sort_order"),
    supabase
      .from("tags")
      .select("id, slug, kind, sort_order, tag_translations(locale, label)")
      .order("sort_order"),
    supabase.from("currencies").select("code, symbol, decimals, rate_per_eur"),
  ]);

  const failure = [restaurantRes, menusRes, categoriesRes, itemsRes, tagsRes, currencyRes].find(
    (r) => r.error,
  );
  if (failure?.error) return { status: "error", message: failure.error.message };

  const r = restaurantRes.data as Record<string, unknown>;
  const publicUrl = (path: string | null) =>
    path ? supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl : null;

  const openingHours = Array.isArray(r.opening_hours) && r.opening_hours.length === 7
    ? (r.opening_hours as AdminData["restaurant"]["openingHours"])
    : emptyWeek();

  // The admin shows prices in the restaurant's own currency only, but it still
  // needs the right number of decimals — kroner have two, lek have none.
  const baseCurrency = (currencyRes.data ?? [])
    .map((c) => ({
      code: c.code as string,
      symbol: c.symbol as string,
      decimals: c.decimals as number,
      rate_per_eur: Number(c.rate_per_eur),
    }))
    .find((c) => c.code === r.base_currency) ?? {
    code: r.base_currency as string,
    symbol: "",
    decimals: 2,
    rate_per_eur: 1,
  };

  return {
    status: "ok",
    email,
    data: {
      baseCurrency,
      restaurant: {
        id: r.id as string,
        slug: r.slug as string,
        name: r.name as string,
        theme: (r.theme as string) ?? "lys",
        // Defaults to on when the column is absent, so a database that has not
        // had the ordering migration run yet is not silently refusing orders.
        orderingEnabled: (r.ordering_enabled as boolean | undefined) !== false,
        logoPath: (r.logo_path as string | null) ?? null,
        logoUrl: publicUrl((r.logo_path as string | null) ?? null),
        address: (r.address as string) ?? "",
        phone: (r.phone as string) ?? "",
        email: (r.email as string) ?? "",
        mapsUrl: (r.maps_url as string) ?? "",
        timezone: (r.timezone as string) ?? "Europe/Oslo",
        socials: Array.isArray(r.socials) ? (r.socials as AdminData["restaurant"]["socials"]) : [],
        openingHours,
        descriptions: translated(
          r.restaurant_translations as { locale: string; description: string | null }[],
          "description",
        ),
        defaultLocale: r.default_locale as string,
        baseCurrency: r.base_currency as string,
        isPublished: Boolean(r.is_published),
      },

      menus: (menusRes.data ?? []).map((m) => ({
        id: m.id as string,
        slug: m.slug as string,
        sortOrder: m.sort_order as number,
        isActive: Boolean(m.is_active),
        names: translated(m.menu_translations as { locale: string; name: string }[], "name"),
      })),

      categories: (categoriesRes.data ?? []).map((c) => ({
        id: c.id as string,
        slug: c.slug as string,
        menuId: c.menu_id as string,
        sortOrder: c.sort_order as number,
        isVisible: Boolean(c.is_visible),
        names: translated(c.category_translations as { locale: string; name: string }[], "name"),
      })),

      items: (itemsRes.data ?? []).map((i) => {
        const text: Record<string, AdminItemText> = {};
        for (const row of (i.item_translations ?? []) as {
          locale: string;
          name: string;
          description: string | null;
          description_long: string | null;
          ingredients: string | null;
        }[]) {
          text[row.locale] = {
            name: row.name ?? "",
            description: row.description ?? "",
            descriptionLong: row.description_long ?? "",
            ingredients: row.ingredients ?? "",
          };
        }
        return {
          id: i.id as string,
          slug: i.slug as string,
          categoryId: i.category_id as string,
          priceMinor: i.price_minor as number,
          imagePath: (i.image_path as string | null) ?? null,
          imagePrompt: (i.image_prompt as string | null) ?? "",
          imageUrl: publicUrl((i.image_path as string | null) ?? null),
          isAvailable: Boolean(i.is_available),
          isFeatured: Boolean(i.is_featured),
          sortOrder: i.sort_order as number,
          text,
          tagIds: ((i.item_tags ?? []) as { tag_id: string }[]).map((t) => t.tag_id),
        };
      }),

      tags: (tagsRes.data ?? []).map((t) => ({
        id: t.id as string,
        slug: t.slug as string,
        kind: t.kind as AdminData["tags"][number]["kind"],
        sortOrder: t.sort_order as number,
        labels: translated(t.tag_translations as { locale: string; label: string }[], "label"),
      })),
    },
  };
}

function translated<T extends Record<string, unknown>>(rows: T[] | null, field: keyof T): Translated {
  return Object.fromEntries(
    (rows ?? []).map((row) => [row.locale as string, (row[field] as string) ?? ""]),
  );
}
