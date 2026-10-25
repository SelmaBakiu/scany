"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storageKey } from "@/lib/prefs-storage";

/**
 * The diner's three choices — language, currency, theme — in one place, shared
 * by the menu page and every item page.
 *
 * It deliberately stores RAW choices, which may be null. Resolving a null
 * language into "whatever this restaurant's default is" happens in the page
 * that knows the restaurant (see `resolvePrefs` below). That keeps this
 * provider free of any knowledge about menus, so the item page and the menu
 * page can share it without either one fetching the other's data.
 */

export type StoredPrefs = {
  locale: string | null;
  currency: string | null;
};

/*
 * Theme used to live here too. It is now the merchant's decision, stored on
 * the restaurant row and applied server-side, so there is nothing per-diner
 * left to remember about it.
 */

type PrefsContextValue = StoredPrefs & {
  setLocale: (locale: string) => void;
  setCurrency: (currency: string) => void;
};

const PrefsContext = createContext<PrefsContextValue | null>(null);

export function PrefsProvider({
  restaurantSlug,
  children,
}: {
  restaurantSlug: string;
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<StoredPrefs>({ locale: null, currency: null });

  /**
   * Whether the stored choices have been read yet.
   *
   * This flag is load-bearing. Without it the save effect below fires on the
   * very first commit — while `prefs` still holds the defaults — and writes
   * those defaults over the diner's real choices before the restore effect has
   * read them. React's double-invoking of effects in development made that a
   * guaranteed loss rather than an occasional one: every reload reset the theme
   * to light. Nothing is written until something has been read.
   */
  const [hydrated, setHydrated] = useState(false);

  // Read the stored choices once on mount. This cannot be a lazy useState
  // initializer: the server rendered the defaults, and reading localStorage
  // during the first client render would make the two disagree and break
  // hydration. The boot script in lib/prefs-storage.ts is what prevents a
  // visible flash of the wrong theme in the meantime.
  useEffect(() => {
    let stored: Partial<StoredPrefs> = {};
    try {
      const raw = window.localStorage.getItem(storageKey(restaurantSlug));
      if (raw) stored = JSON.parse(raw);
    } catch {
      // Storage blocked, or the stored value is not valid JSON. Defaults stand.
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs((current) => ({
      locale: typeof stored.locale === "string" ? stored.locale : current.locale,
      currency: typeof stored.currency === "string" ? stored.currency : current.currency,
    }));
    // Set on every path, including the failures above — otherwise a diner with
    // no stored preferences could never save one.
    setHydrated(true);
  }, [restaurantSlug]);

  // Write them back, and keep <html data-theme> in step. One effect, because
  // the DOM attribute and the stored value must never disagree.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey(restaurantSlug), JSON.stringify(prefs));
    } catch {
      // Storage blocked. Choices still work for this page view.
    }
  }, [hydrated, restaurantSlug, prefs]);

  const value = useMemo<PrefsContextValue>(
    () => ({
      ...prefs,
      setLocale: (locale) => setPrefs((p) => ({ ...p, locale })),
      setCurrency: (currency) => setPrefs((p) => ({ ...p, currency })),
    }),
    [prefs],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): PrefsContextValue {
  const value = useContext(PrefsContext);
  if (!value) {
    throw new Error("usePrefs must be used inside <PrefsProvider> (see app/m/[slug]/layout.tsx)");
  }
  return value;
}

/**
 * Turn the raw stored choices into the ones actually in effect, given what this
 * restaurant offers. A venue that drops Italian since the diner's last visit
 * should not leave them staring at a blank menu.
 */
export function useResolvedLocale(allowed: { code: string }[], fallback: string): string {
  const { locale } = usePrefs();
  if (locale && allowed.some((l) => l.code === locale)) return locale;
  return fallback;
}

export function useResolvedCurrency<T extends { code: string }>(allowed: T[], fallback: T): T {
  const { currency } = usePrefs();
  const match = currency ? allowed.find((c) => c.code === currency) : undefined;
  return match ?? fallback;
}

/** Keeps <html lang> honest so screen readers switch voice with the menu. */
export function useDocumentLanguage(locale: string): void {
  const setLang = useCallback(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(setLang, [setLang]);
}
