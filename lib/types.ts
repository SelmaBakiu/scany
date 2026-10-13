/**
 * Domain types.
 *
 * Two layers on purpose:
 *   - `Db*` types mirror exactly what PostgREST returns for the nested select
 *     in lib/menu.ts. Ugly, deeply nested, full of arrays — that's the wire.
 *   - everything else is the shape the UI wants: translations collapsed into
 *     `Record<locale, string>`, tags flattened, image paths already resolved.
 *
 * Keeping them apart means a schema change breaks in ONE file (lib/menu.ts)
 * instead of in every component.
 *
 * Later you can replace the Db* types with generated ones:
 *   npx supabase gen types typescript --project-id <id> > lib/database.types.ts
 */

export type TagKind = "diet" | "allergen" | "heat" | "info";

export type Currency = {
  code: string;
  symbol: string;
  decimals: number;
  /** Units of this currency per 1 EUR. EUR itself is 1. */
  rate_per_eur: number;
};

export type Locale = {
  code: string;
  label: string;
  native_label: string;
};

/** A translated string, keyed by locale code. */
export type Translated = Record<string, string>;

// ---------------------------------------------------------------------------
// Wire shapes
// ---------------------------------------------------------------------------

type DbTranslationRow = { locale: string; name: string };

export type DbTag = {
  id: string;
  slug: string;
  kind: TagKind;
  sort_order: number;
  tag_translations: { locale: string; label: string }[];
};

export type DbItem = {
  id: string;
  slug: string;
  price_minor: number;
  image_path: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  item_translations: {
    locale: string;
    name: string;
    description: string | null;
    description_long: string | null;
    ingredients: string | null;
  }[];
  item_tags: { tags: DbTag | null }[];
};

export type DbCategory = {
  id: string;
  slug: string;
  sort_order: number;
  category_translations: DbTranslationRow[];
  items: DbItem[];
};

export type DbMenu = {
  id: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  menu_translations: DbTranslationRow[];
  categories: DbCategory[];
};

export type DbRestaurant = {
  id: string;
  slug: string;
  name: string;
  base_currency: string;
  default_locale: string;
  restaurant_locales: { locales: Locale | null }[];
  menus: DbMenu[];
};

// ---------------------------------------------------------------------------
// View shapes
// ---------------------------------------------------------------------------

export type Tag = {
  id: string;
  slug: string;
  kind: TagKind;
  /** From tags.sort_order — the order the filter panel lists them in. */
  sortOrder: number;
  labels: Translated;
};

export type MenuItem = {
  id: string;
  slug: string;
  /** Integer, minor units of the restaurant's base currency. 850 = EUR 8.50 */
  priceMinor: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  names: Translated;
  /** The one-liner on the card. */
  descriptions: Translated;
  /** The paragraph on the item's own page. */
  descriptionsLong: Translated;
  /** Comma-separated, in the viewed language. */
  ingredients: Translated;
  tags: Tag[];
  /** Precomputed so search doesn't rebuild it on every keystroke. */
  searchText: Record<string, string>;
};

export type MenuCategory = {
  id: string;
  slug: string;
  names: Translated;
  items: MenuItem[];
};

export type Menu = {
  id: string;
  slug: string;
  names: Translated;
  categories: MenuCategory[];
};

/** Everything the "Restaurantinfo" sheet shows. */
export type RestaurantInfo = {
  logoUrl: string | null;
  descriptions: Translated;
  address: string;
  phone: string;
  email: string;
  mapsUrl: string;
  timezone: string;
  socials: { label: string; url: string }[];
  openingHours: { day: number; closed: boolean; open: string; close: string }[];
};

export type RestaurantMenu = {
  slug: string;
  /** Brand name — never translated. */
  name: string;
  baseCurrency: Currency;
  defaultLocale: string;
  /** Languages this restaurant publishes, in the order they should appear. */
  locales: Locale[];
  /** Currencies a diner may switch to. */
  currencies: Currency[];
  menu: Menu | null;
  /** Chosen by the merchant in the admin; every diner gets the same one. */
  theme: string;
  /**
   * The merchant's master switch for ordering. The guest's UI hides the
   * buttons when this is off; the database refuses the order regardless, which
   * is the half that actually matters.
   */
  orderingEnabled: boolean;
  info: RestaurantInfo;
  /**
   * The two cut points for the price filter, derived from this menu's own
   * prices so the bands make sense in any currency — null on a menu too small
   * or too uniform to band, which hides the control. See lib/money.ts.
   */
  priceThresholds: readonly [number, number] | null;
};

/** Everything the diner can narrow the menu by. */
export type Filters = {
  /** diet tag slugs the item must have ALL of */
  diets: string[];
  /** allergen tag slugs the item must have NONE of */
  excludeAllergens: string[];
  /** 1 = €, 2 = €€, 3 = €€€; empty means any */
  priceBands: number[];
  /** heat tag slug, or "none" for items with no heat tag at all */
  heat: string | null;
  availableOnly: boolean;
};

export const emptyFilters: Filters = {
  diets: [],
  excludeAllergens: [],
  priceBands: [],
  heat: null,
  availableOnly: false,
};

export function countActiveFilters(f: Filters): number {
  return (
    f.diets.length +
    f.excludeAllergens.length +
    f.priceBands.length +
    (f.heat ? 1 : 0) +
    (f.availableOnly ? 1 : 0)
  );
}
