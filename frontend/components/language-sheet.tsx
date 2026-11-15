"use client";

import { useMemo } from "react";
import { APP_LANGUAGES, FREQUENT_LANGUAGES, localeBadge, type UiStrings } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { SearchSheet } from "./search-sheet";

/**
 * The language picker: the restaurant's language and English pinned under
 * "Frequently used", then every language the app offers.
 */
export function LanguageSheet({
  value,
  restaurantLocales,
  defaultLocale,
  strings,
  onChange,
  onClose,
}: {
  value: string;
  /** Languages the restaurant translated its dishes into. Always offered. */
  restaurantLocales: Locale[];
  defaultLocale: string;
  strings: UiStrings;
  onChange: (code: string) => void;
  onClose: () => void;
}) {
  const options = useMemo(() => {
    const known = new Set(APP_LANGUAGES.map((l) => l.code));
    // A restaurant may offer a language added straight in the database that
    // the app has no entry for. Its dishes are translated, so it belongs here.
    const extra = restaurantLocales
      .filter((l) => !known.has(l.code))
      .map((l) => ({ code: l.code, label: l.label, native: l.native_label }));
    return [...APP_LANGUAGES, ...extra].map((l) => ({
      value: l.code,
      title: l.native,
      subtitle: l.label !== l.native ? l.label : undefined,
      badge: localeBadge(l.code),
      lang: l.code,
    }));
  }, [restaurantLocales]);

  return (
    <SearchSheet
      title={strings.language}
      options={options}
      frequent={[defaultLocale, ...FREQUENT_LANGUAGES]}
      value={value}
      onChange={onChange}
      onClose={onClose}
      labels={{
        close: strings.close,
        clearSearch: strings.clearSearch,
        searchPlaceholder: strings.languageSearchPlaceholder,
        frequentlyUsed: strings.frequentlyUsed,
        all: strings.allLanguages,
        searchResults: strings.searchResults,
        notFound: strings.languageNotFound,
      }}
    />
  );
}
