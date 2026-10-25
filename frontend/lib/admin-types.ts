import type { ActionKey } from "./admin-i18n";
import type { TagKind, Translated } from "./types";

/**
 * What the admin sees — which is more than the diner does.
 *
 * The client's view model (lib/types.ts) is shaped for reading: translations
 * collapsed to the viewed language, hidden categories already filtered out,
 * inactive menus dropped. The admin needs the opposite: every language side by
 * side, hidden things still listed, nothing thrown away. Hence a second set of
 * types rather than bending the first.
 */

/**
 * The languages the admin form edits. Any other locale's rows are left alone.
 *
 * Chinese is here because the forms carry Chinese fields; Italian is not,
 * because nothing in the admin writes it, and listing it would mean every save
 * blanking the Italian from seed.sql.
 */
export const EDITABLE_LOCALES = ["nb", "en", "zh-CN"] as const;
export type EditableLocale = (typeof EDITABLE_LOCALES)[number];

export type OpeningHours = {
  /** 0 = Monday … 6 = Sunday. */
  day: number;
  closed: boolean;
  /** "HH:MM", 24-hour, in the restaurant's own timezone. */
  open: string;
  close: string;
};

export type SocialLink = {
  label: string;
  url: string;
};

export type AdminTag = {
  id: string;
  slug: string;
  kind: TagKind;
  sortOrder: number;
  labels: Translated;
};

export type AdminItemText = {
  name: string;
  description: string;
  descriptionLong: string;
  ingredients: string;
};

export type AdminItem = {
  id: string;
  slug: string;
  /**
   * An English description written for the image model, overriding the one
   * built from the dish's own text. The escape hatch for a dish the AI keeps
   * getting wrong.
   */
  imagePrompt: string;
  categoryId: string;
  priceMinor: number;
  imagePath: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  text: Record<string, AdminItemText>;
  tagIds: string[];
};

export type AdminCategory = {
  id: string;
  slug: string;
  menuId: string;
  sortOrder: number;
  isVisible: boolean;
  names: Translated;
};

export type AdminMenu = {
  id: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  names: Translated;
};

export type AdminRestaurant = {
  id: string;
  slug: string;
  name: string;
  theme: string;
  /** The master switch for ordering; the clock closes it too. */
  orderingEnabled: boolean;
  logoPath: string | null;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
  mapsUrl: string;
  timezone: string;
  socials: SocialLink[];
  openingHours: OpeningHours[];
  descriptions: Translated;
  defaultLocale: string;
  baseCurrency: string;
  isPublished: boolean;
};

export type AdminData = {
  /** The restaurant's own currency, with its real decimal count. */
  baseCurrency: { code: string; symbol: string; decimals: number; rate_per_eur: number };
  restaurant: AdminRestaurant;
  menus: AdminMenu[];
  categories: AdminCategory[];
  items: AdminItem[];
  tags: AdminTag[];
};

/**
 * What a server action hands back to the form that called it.
 *
 * A KEY, not a sentence. The action runs on the server, where the merchant's
 * chosen admin language is a browser preference it cannot see; the form
 * translates the key with the table in lib/admin-i18n.ts. `detail` carries a
 * raw database message when there is one, untranslated — Postgres does not
 * speak Norwegian either, and an exact error beats a vague translated one.
 */
export type ActionResult = {
  ok: boolean;
  key: ActionKey | null;
  detail?: string;
  /** Set by the AI photo action so the form can show the new picture at once. */
  imageUrl?: string;
};

export const NO_RESULT: ActionResult = { ok: true, key: null };

/** A full week, used when a restaurant has never had its hours set. */
export function emptyWeek(): OpeningHours[] {
  return Array.from({ length: 7 }, (_, day) => ({
    day,
    closed: day === 6,
    open: "11:00",
    close: "22:00",
  }));
}
