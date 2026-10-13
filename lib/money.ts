import type { Currency } from "./types";

/**
 * Money rules for this project, in one place:
 *
 *  1. A price is an INTEGER in minor units (cents) of the restaurant's base
 *     currency. 850 means EUR 8.50. No floats, no "8.50" strings.
 *  2. Every other currency is DERIVED from that integer at display time using
 *     currencies.rate_per_eur. Converted prices are indicative, so the UI marks
 *     them with "≈" and a note.
 *  3. Formatting is Intl.NumberFormat's job, never string concatenation —
 *     it is what puts "8,50 €" in Italian and "€8.50" in English.
 */

/** Convert minor units from one currency to another, returning minor units. */
export function convertMinor(priceMinor: number, from: Currency, to: Currency): number {
  if (from.code === to.code) return priceMinor;

  const major = priceMinor / 10 ** from.decimals;
  const eur = major / from.rate_per_eur;
  const converted = eur * to.rate_per_eur;

  return Math.round(converted * 10 ** to.decimals);
}

/**
 * Format minor units of `currency` for display in `locale`.
 *
 * Whole amounts drop their decimals: "kr 95" rather than "kr 95,00", while
 * 9550 still prints "kr 95,50". That is how menus are actually written, and it
 * matters more in NOK than in EUR because most kroner prices are round numbers
 * and a column of ",00" is pure noise.
 */
/**
 * Currencies that always show their decimals, even on a whole amount.
 *
 * The general rule below is "kr 95", not "kr 95,00" — that is how a menu is
 * written. Yuan is the exception: ¥28 reads like a listed price, ¥28.50 reads
 * like what it is, a conversion. Keeping the decimals keeps that honest.
 */
const ALWAYS_DECIMALS = new Set(["CNY"]);

export function formatMinor(minor: number, currency: Currency, locale: string): string {
  const major = minor / 10 ** currency.decimals;
  const isWhole = minor % 10 ** currency.decimals === 0;
  const fractionDigits = isWhole && !ALWAYS_DECIMALS.has(currency.code) ? 0 : currency.decimals;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(major);
  } catch {
    // Unknown currency code, or a locale the runtime doesn't have.
    return `${currency.symbol} ${major.toFixed(fractionDigits)}`;
  }
}

export type DisplayPrice = {
  text: string;
  /** True when the number was converted, so the UI can show "≈". */
  approximate: boolean;
};

/** The one call a component needs: base-currency cents in, display string out. */
export function displayPrice(
  priceMinor: number,
  base: Currency,
  target: Currency,
  locale: string,
): DisplayPrice {
  const approximate = base.code !== target.code;
  const minor = convertMinor(priceMinor, base, target);
  return { text: formatMinor(minor, target, locale), approximate };
}

/**
 * The two cut points between the three price bands, in base-currency minor
 * units — or null when this menu has no meaningful bands to offer.
 */
export type PriceThresholds = readonly [number, number] | null;

/**
 * Derive the price bands from the menu's own prices rather than hardcoding them.
 *
 * Fixed thresholds cannot work across currencies: 1000 and 2000 minor units are
 * a sensible €10 / €20 split, and a nonsensical 10 øre / 20 øre one — every
 * kroner dish would land in the top band. Splitting at the 33rd and 67th
 * percentile gives three roughly equal groups in any currency, at any venue,
 * with no configuration.
 */
export function computePriceThresholds(pricesMinor: number[]): PriceThresholds {
  // Fewer than three dishes, or every dish the same price: there is nothing to
  // band. Returning null lets the filter panel hide the control entirely rather
  // than offering three buttons where two always return nothing.
  if (pricesMinor.length < 3) return null;

  const sorted = [...pricesMinor].sort((a, b) => a - b);
  const at = (fraction: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];

  const low = at(1 / 3);
  const high = at(2 / 3);

  return low === high ? null : [low, high];
}

export function priceBand(priceMinor: number, thresholds: PriceThresholds): 1 | 2 | 3 {
  if (!thresholds) return 1;
  const [low, high] = thresholds;
  if (priceMinor < low) return 1;
  if (priceMinor < high) return 2;
  return 3;
}

/** The amount alone, no currency symbol — for compact labels. */
export function formatAmount(minor: number, currency: Currency, locale: string): string {
  const major = minor / 10 ** currency.decimals;
  const isWhole = minor % 10 ** currency.decimals === 0;
  const digits = isWhole ? 0 : currency.decimals;

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(major);
  } catch {
    return major.toFixed(digits);
  }
}

/**
 * Real numbers on the price filter, not "¤¤¤".
 *
 * The usual £/££/£££ convention needs a one-character symbol, and plenty of
 * currencies don't have one — "kr kr kr" is nonsense and the generic ¤ sign
 * reads as a missing glyph. "< 95 / 95–219 / 219+" tells a diner something
 * true in any currency, with the unit stated once on the group label.
 */
export function priceBandLabel(
  band: 1 | 2 | 3,
  thresholds: NonNullable<PriceThresholds>,
  base: Currency,
  display: Currency,
  locale: string,
): string {
  const show = (minor: number) =>
    formatAmount(convertMinor(minor, base, display), display, locale);

  const [low, high] = thresholds;
  if (band === 1) return `< ${show(low)}`;
  if (band === 2) return `${show(low)}–${show(high)}`;
  return `${show(high)}+`;
}
