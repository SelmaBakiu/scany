import type { Translated } from "./types";

/**
 * The themes on offer.
 *
 * The colours themselves live in app/globals.css, one `[data-theme="..."]`
 * block each. This file only knows the names — which keeps the picker honest:
 * it cannot offer a theme the stylesheet does not define.
 *
 * To add one: a new block in globals.css, a new entry here, and run
 * `node scripts/check-contrast.mjs` to confirm it is readable.
 */

export const THEME_IDS = ["lys", "svart", "rod", "bla", "gronn", "lilla", "gull"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = "lys";

export type ThemeOption = {
  id: ThemeId;
  labels: Translated;
  /** Two colours for the swatch in the picker: the page ground and its accent. */
  swatch: { ground: string; accent: string };
  /**
   * Whether this theme is light or dark chrome.
   *
   * Duplicated from the `color-scheme` line in globals.css because the boot
   * script needs it in JavaScript, before any stylesheet has been consulted.
   * Keep the two in step; `npm run check:contrast` reads the stylesheet, not
   * this file, so it will not catch a mismatch here.
   */
  scheme: "light" | "dark";
};

export const THEMES: ThemeOption[] = [
  {
    id: "lys",
    labels: { nb: "Lys", en: "Light", sq: "E çelët", it: "Chiaro" },
    swatch: { ground: "#fbf8f4", accent: "#b04a26" },
    scheme: "light",
  },
  {
    id: "svart",
    labels: { nb: "Svart", en: "Black", sq: "E zezë", it: "Nero" },
    swatch: { ground: "#121212", accent: "#e2703a" },
    scheme: "dark",
  },
  {
    id: "rod",
    labels: { nb: "Rød", en: "Red", sq: "E kuqe", it: "Rosso" },
    swatch: { ground: "#17100f", accent: "#e8615a" },
    scheme: "dark",
  },
  {
    id: "bla",
    labels: { nb: "Blå", en: "Blue", sq: "Blu", it: "Blu" },
    swatch: { ground: "#0e1420", accent: "#5aa6ee" },
    scheme: "dark",
  },
  {
    id: "gronn",
    labels: { nb: "Grønn", en: "Green", sq: "Jeshile", it: "Verde" },
    swatch: { ground: "#0e1611", accent: "#58bf80" },
    scheme: "dark",
  },
  {
    id: "lilla",
    labels: { nb: "Lilla", en: "Purple", sq: "Vjollcë", it: "Viola" },
    swatch: { ground: "#140f1c", accent: "#ab7cf0" },
    scheme: "dark",
  },
  {
    id: "gull",
    labels: { nb: "Gull", en: "Gold", sq: "Ari", it: "Oro" },
    swatch: { ground: "#15120b", accent: "#e0ad44" },
    scheme: "dark",
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}
