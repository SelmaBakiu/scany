import { createAnonClient } from "./supabase/anon";
import type {
  Currency,
  DbItem,
  DbRestaurant,
  Locale,
  Menu,
  MenuCategory,
  MenuItem,
  RestaurantMenu,
  Tag,
  Translated,
} from "./types";
import { normalize } from "./i18n";
import { computePriceThresholds } from "./money";

const IMAGE_BUCKET = "menu-images";

/**
 * ONE round trip for the whole menu.
 *
 * This nested select is PostgREST's answer to "but in Mongo it was one
 * document". The indentation mirrors the foreign keys in schema.sql: because
 * `categories.menu_id` points at `menus`, you can ask for `categories(...)`
 * inside `menus(...)` and Postgres does the joining and the nesting server-side.
 *
 * `item_tags(tags(...))` hops the many-to-many join table, which is why the
 * result has that extra `{ tags: ... }` wrapper per row.
 *
 * Why fetch EVERY language and not just the one being viewed: a menu is a few
 * dozen rows. Shipping all of them costs a few kilobytes and buys instant
 * language switching with no refetch and no loading state — the right trade for
 * someone standing in a restaurant on bad wifi. Revisit this if a venue ever
 * has hundreds of items in six languages.
 */
const MENU_QUERY = `
  id, slug, name, base_currency, default_locale,
  theme, ordering_enabled, logo_path, address, phone, email, maps_url, timezone, socials, opening_hours,
  restaurant_translations ( locale, description ),
  restaurant_locales (
    locales ( code, label, native_label )
  ),
  menus (
    id, slug, sort_order, is_active,
    menu_translations ( locale, name ),
    categories (
      id, slug, sort_order,
      category_translations ( locale, name ),
      items (
        id, slug, price_minor, image_path, is_available, is_featured, sort_order,
        item_translations ( locale, name, description, description_long, ingredients ),
        item_tags (
          tags (
            id, slug, kind, sort_order,
            tag_translations ( locale, label )
          )
        )
      )
    )
  )
`;

export type MenuFetchResult =
  | { status: "ok"; data: RestaurantMenu }
  | { status: "not-configured" }
  | { status: "not-found" }
  | { status: "error"; message: string };

export async function fetchRestaurantMenu(slug: string): Promise<MenuFetchResult> {
  const supabase = createAnonClient();
  if (!supabase) return { status: "not-configured" };

  const [restaurantResult, currencyResult] = await Promise.all([
    supabase.from("restaurants").select(MENU_QUERY).eq("slug", slug).maybeSingle(),
    supabase.from("currencies").select("code, symbol, decimals, rate_per_eur"),
  ]);

  if (restaurantResult.error) {
    return { status: "error", message: restaurantResult.error.message };
  }
  if (currencyResult.error) {
    return { status: "error", message: currencyResult.error.message };
  }
  if (!restaurantResult.data) {
    // Either no such slug, or the restaurant is not published — RLS makes those
    // two cases indistinguishable from out here, which is the point.
    return { status: "not-found" };
  }

  const restaurant = restaurantResult.data as unknown as DbRestaurant;
  const currencies = (currencyResult.data ?? []).map(toCurrency);

  const baseCurrency =
    currencies.find((c) => c.code === restaurant.base_currency) ??
    // A restaurant whose base currency row is missing would be a broken FK, but
    // crashing a diner's page over it is worse than assuming 2-decimal EUR.
    { code: restaurant.base_currency, symbol: restaurant.base_currency, decimals: 2, rate_per_eur: 1 };

  const locales = restaurant.restaurant_locales
    .map((row) => row.locales)
    .filter((l): l is Locale => Boolean(l))
    .sort(byDefaultLocaleFirst(restaurant.default_locale));

  const menu = toActiveMenu(restaurant, (path) => publicImageUrl(supabase, path));

  return {
    status: "ok",
    data: {
      slug: restaurant.slug,
      name: restaurant.name,
      baseCurrency,
      defaultLocale: restaurant.default_locale,
      locales: locales.length > 0 ? locales : [{ code: "en", label: "English", native_label: "English" }],
      currencies: sortCurrencies(currencies, baseCurrency.code),
      menu,
      theme: (restaurant as unknown as { theme?: string }).theme ?? "lys",
      // Defaults to true when the column is missing, so a database that has
      // not had the ordering migration run yet still behaves sensibly rather
      // than silently refusing every order with no explanation.
      orderingEnabled:
        (restaurant as unknown as { ordering_enabled?: boolean }).ordering_enabled !== false,
      info: toRestaurantInfo(restaurant, (path) => publicImageUrl(supabase, path)),
      priceThresholds: computePriceThresholds(allPrices(menu)),
    },
  };
}

// ---------------------------------------------------------------------------
// Shaping: wire -> view model. Everything ugly about the wire format stops here.
// ---------------------------------------------------------------------------

function toCurrency(row: {
  code: string;
  symbol: string;
  decimals: number;
  rate_per_eur: number | string;
}): Currency {
  return {
    code: row.code,
    symbol: row.symbol,
    decimals: row.decimals,
    // numeric columns arrive as strings over the wire — a classic Postgres
    // gotcha that turns arithmetic into string concatenation if you miss it.
    rate_per_eur: Number(row.rate_per_eur),
  };
}

function publicImageUrl(
  supabase: NonNullable<ReturnType<typeof createAnonClient>>,
  path: string | null,
): string | null {
  if (!path) return null;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

function toRestaurantInfo(
  restaurant: DbRestaurant,
  resolveImage: (path: string | null) => string | null,
) {
  const raw = restaurant as unknown as Record<string, unknown>;
  return {
    logoUrl: resolveImage((raw.logo_path as string | null) ?? null),
    descriptions: Object.fromEntries(
      ((raw.restaurant_translations ?? []) as { locale: string; description: string | null }[]).map(
        (row) => [row.locale, row.description ?? ""],
      ),
    ),
    address: (raw.address as string) ?? "",
    phone: (raw.phone as string) ?? "",
    email: (raw.email as string) ?? "",
    mapsUrl: (raw.maps_url as string) ?? "",
    timezone: (raw.timezone as string) ?? "Europe/Oslo",
    socials: Array.isArray(raw.socials)
      ? (raw.socials as { label: string; url: string }[]).filter((s) => s?.label && s?.url)
      : [],
    openingHours: Array.isArray(raw.opening_hours)
      ? (raw.opening_hours as { day: number; closed: boolean; open: string; close: string }[])
      : [],
  };
}

function byDefaultLocaleFirst(defaultLocale: string) {
  return (a: Locale, b: Locale) => {
    if (a.code === defaultLocale) return -1;
    if (b.code === defaultLocale) return 1;
    return a.code.localeCompare(b.code);
  };
}

function sortCurrencies(currencies: Currency[], baseCode: string): Currency[] {
  return [...currencies].sort((a, b) => {
    if (a.code === baseCode) return -1;
    if (b.code === baseCode) return 1;
    return a.code.localeCompare(b.code);
  });
}

function toActiveMenu(
  restaurant: DbRestaurant,
  resolveImage: (path: string | null) => string | null,
): Menu | null {
  const active = (restaurant.menus ?? [])
    .filter((m) => m.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)[0];

  if (!active) return null;

  const categories: MenuCategory[] = (active.categories ?? [])
    // A category the merchant hid stays in the database with its dishes, but
    // never reaches a diner.
    .filter((category) => (category as unknown as { is_visible?: boolean }).is_visible !== false)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((category) => ({
      id: category.id,
      slug: category.slug,
      names: translatedNames(category.category_translations),
      items: (category.items ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => toMenuItem(item, resolveImage)),
    }))
    // A category with nothing in it is noise on a menu, not information.
    .filter((category) => category.items.length > 0);

  return {
    id: active.id,
    slug: active.slug,
    names: translatedNames(active.menu_translations),
    categories,
  };
}

function toMenuItem(
  item: DbItem,
  resolveImage: (path: string | null) => string | null,
): MenuItem {
  const names: Translated = {};
  const descriptions: Translated = {};
  const descriptionsLong: Translated = {};
  const ingredients: Translated = {};
  for (const row of item.item_translations ?? []) {
    names[row.locale] = row.name;
    if (row.description) descriptions[row.locale] = row.description;
    if (row.description_long) descriptionsLong[row.locale] = row.description_long;
    if (row.ingredients) ingredients[row.locale] = row.ingredients;
  }

  const tags: Tag[] = (item.item_tags ?? [])
    .map((row) => row.tags)
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((tag) => ({
      id: tag.id,
      slug: tag.slug,
      kind: tag.kind,
      sortOrder: tag.sort_order,
      labels: Object.fromEntries(
        (tag.tag_translations ?? []).map((row) => [row.locale, row.label]),
      ),
    }));

  // Build the haystack once per item, per language, at fetch time. Doing it
  // inside the keystroke handler is what makes search feel laggy.
  const searchText: Record<string, string> = {};
  for (const locale of new Set([...Object.keys(names), ...Object.keys(descriptions)])) {
    searchText[locale] = normalize(
      [names[locale], descriptions[locale]].filter(Boolean).join(" "),
    );
  }

  return {
    id: item.id,
    slug: item.slug,
    priceMinor: item.price_minor,
    imageUrl: resolveImage(item.image_path),
    isAvailable: item.is_available,
    isFeatured: item.is_featured,
    names,
    descriptions,
    descriptionsLong,
    ingredients,
    tags,
    searchText,
  };
}

function translatedNames(rows: { locale: string; name: string }[] | null): Translated {
  return Object.fromEntries((rows ?? []).map((row) => [row.locale, row.name]));
}

/** Every price on the menu, for working out where the ¤/¤¤/¤¤¤ bands fall. */
function allPrices(menu: Menu | null): number[] {
  if (!menu) return [];
  return menu.categories.flatMap((category) => category.items.map((item) => item.priceMinor));
}

/** Find one dish by slug, with the category it belongs to. */
export function findItem(menu: Menu | null, itemSlug: string) {
  if (!menu) return null;
  for (const category of menu.categories) {
    const item = category.items.find((i) => i.slug === itemSlug);
    if (item) return { item, category };
  }
  return null;
}

/** Every tag used anywhere on the menu — the filter panel's vocabulary. */
export function collectTags(menu: Menu | null): Tag[] {
  if (!menu) return [];
  const byId = new Map<string, Tag>();
  for (const category of menu.categories) {
    for (const item of category.items) {
      for (const tag of item.tags) byId.set(tag.id, tag);
    }
  }
  // Sorted, not first-seen: otherwise the filter panel lists diets in whatever
  // order the first few dishes happened to use them.
  return [...byId.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}
