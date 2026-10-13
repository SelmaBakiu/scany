import { DEFAULT_THEME, THEMES } from "./themes";

/**
 * Where preferences are kept, and the script that paints the page background
 * before anything else renders.
 *
 * Deliberately NOT inside components/prefs-provider.tsx: that file is
 * `"use client"`, and a server component cannot call a function exported from a
 * client module — it can only render it as a component. The layout needs
 * `themeBootScript()` as a plain string at render time, so it lives here, in a
 * module with no directive at all, importable from both sides.
 */

export function storageKey(restaurantSlug: string): string {
  return `menuscan:prefs:${restaurantSlug}`;
}

/** Where the merchant's choice of admin language is kept. */
export const ADMIN_LOCALE_KEY = "menuscan:admin:locale";

/**
 * Paints `<html>` in the restaurant's colours before the page renders.
 *
 * Note what this does NOT do: it does not put `data-theme` on `<html>`. The
 * theme is applied by the diner's layout, on its own wrapper div, and nowhere
 * else — which is what guarantees it can never reach the admin, since the
 * admin is a sibling of that div and not a descendant.
 *
 * What is left on `<html>` is two cosmetic properties: the background colour
 * behind the page (visible when you overscroll past the top or bottom on a
 * phone) and `color-scheme` (which is what makes the scrollbar and form
 * controls render dark on a dark theme). Without them a diner on the black
 * theme gets a white flash and a white scrollbar. They are plain inline
 * styles, so `adminChromeScript()` can simply set them back.
 */
export function themeBootScript(theme: string): string {
  const option = THEMES.find((t) => t.id === theme) ?? THEMES.find((t) => t.id === DEFAULT_THEME)!;
  return paint(option.swatch.ground, option.scheme);
}

/**
 * The same, for the admin: always white, always light.
 *
 * It runs because a client-side navigation from the diner's menu into /admin
 * keeps the same document, and the inline styles above would otherwise still
 * be sitting on `<html>`.
 */
export function adminChromeScript(): string {
  return paint("#ffffff", "light");
}

function paint(background: string, scheme: "light" | "dark"): string {
  return `document.documentElement.style.setProperty("background-color",${JSON.stringify(
    background,
  )});document.documentElement.style.setProperty("color-scheme",${JSON.stringify(scheme)})`;
}
