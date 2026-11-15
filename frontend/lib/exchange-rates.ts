import type { Currency } from "./types";

/**
 * Live exchange rates, so converted prices are not the placeholders in the
 * seed.
 *
 * Source: ExchangeRate-API's open endpoint — free, no key, ~160 currencies,
 * refreshed once a day. Its rates are "units per 1 EUR", the same shape as
 * currencies.rate_per_eur, so they drop straight in. Their terms ask for a
 * credit link wherever the rates are shown; the currency sheet carries it
 * (RATES_CREDIT below).
 *
 * Fetched on the server and cached by Next for six hours, so a thousand
 * diners cost one request, not a thousand — the data only changes daily.
 *
 * If the service is down, the database rates are used unchanged. A menu with
 * day-old rates beats a menu that does not load.
 */

const ENDPOINT = "https://open.er-api.com/v6/latest/EUR";
const CACHE_SECONDS = 6 * 60 * 60;

export const RATES_CREDIT = { label: "Rates by Exchange Rate API", url: "https://www.exchangerate-api.com" };

type ApiResponse = { result: string; rates?: Record<string, number> };

async function fetchRatesPerEur(): Promise<Record<string, number> | null> {
  try {
    const response = await fetch(ENDPOINT, {
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as ApiResponse;
    if (body.result !== "success" || !body.rates) return null;
    return body.rates;
  } catch {
    return null;
  }
}

/**
 * Symbol and decimal places for a currency the database knows nothing about,
 * from the runtime's own currency data: "¥" and 0 decimals for JPY, "$" and 2
 * for USD. Null for a code the runtime does not recognise.
 */
function describe(code: string): Pick<Currency, "symbol" | "decimals"> | null {
  try {
    const format = new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    });
    const symbol = format.formatToParts(1).find((part) => part.type === "currency")?.value ?? code;
    return { symbol, decimals: format.resolvedOptions().maximumFractionDigits ?? 2 };
  } catch {
    return null;
  }
}

/**
 * The database currencies with today's rates, plus every other currency the
 * rates service knows. Database rows keep their own symbol and decimals —
 * "kr" for NOK is a choice somebody made — and only their rate is replaced.
 */
export async function withLiveRates(stored: Currency[]): Promise<Currency[]> {
  const rates = await fetchRatesPerEur();
  if (!rates) return stored;

  const byCode = new Map(stored.map((c) => [c.code, c]));
  for (const [code, rate] of Object.entries(rates)) {
    if (!(rate > 0)) continue;
    const existing = byCode.get(code);
    if (existing) {
      byCode.set(code, { ...existing, rate_per_eur: rate });
      continue;
    }
    const shape = describe(code);
    if (shape) byCode.set(code, { code, ...shape, rate_per_eur: rate });
  }
  return [...byCode.values()];
}
