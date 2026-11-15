"use client";

import { useMemo } from "react";
import { RATES_CREDIT } from "@/lib/exchange-rates";
import type { UiStrings } from "@/lib/i18n";
import type { Currency } from "@/lib/types";
import { SearchSheet } from "./search-sheet";

/** Pinned after the restaurant's own currency: what most visitors to Norway carry. */
const FREQUENT_CURRENCIES = ["EUR", "USD", "GBP", "SEK", "DKK"];

/**
 * The currency picker. Every currency the rates service knows, searchable by
 * code ("JPY") or by name in the guest's language ("yen", "円").
 */
export function CurrencySheet({
  value,
  currencies,
  baseCode,
  locale,
  strings,
  onChange,
  onClose,
}: {
  value: string;
  currencies: Currency[];
  baseCode: string;
  locale: string;
  strings: UiStrings;
  onChange: (code: string) => void;
  onClose: () => void;
}) {
  const options = useMemo(() => {
    const names = currencyNames(locale);
    const english = currencyNames("en");
    return currencies.map((c) => {
      const name = names(c.code);
      return {
        value: c.code,
        title: c.code,
        subtitle:
          c.code === baseCode
            ? name
            : `${name} · ${strings.approxNote(c.code, baseCode)}`,
        badge: c.symbol.length <= 3 ? c.symbol : c.code.slice(0, 3),
        keywords: [name, english(c.code), c.symbol],
      };
    });
  }, [currencies, baseCode, locale, strings]);

  return (
    <SearchSheet
      title={strings.currency}
      options={options}
      frequent={[baseCode, ...FREQUENT_CURRENCIES]}
      value={value}
      onChange={onChange}
      onClose={onClose}
      labels={{
        close: strings.close,
        clearSearch: strings.clearSearch,
        searchPlaceholder: strings.currencySearchPlaceholder,
        frequentlyUsed: strings.frequentlyUsed,
        all: strings.allCurrencies,
        searchResults: strings.searchResults,
        notFound: strings.currencyNotFound,
      }}
      footer={
        <a
          href={RATES_CREDIT.url}
          target="_blank"
          rel="noreferrer"
          translate="no"
          className="block text-center text-[12px] text-muted underline-offset-2 hover:underline"
        >
          {RATES_CREDIT.label}
        </a>
      }
    />
  );
}

/** "Japanese Yen", "日本円" — the runtime's own currency names, per language. */
function currencyNames(locale: string): (code: string) => string {
  try {
    const display = new Intl.DisplayNames([locale, "en"], { type: "currency" });
    return (code) => display.of(code) ?? code;
  } catch {
    return (code) => code;
  }
}
