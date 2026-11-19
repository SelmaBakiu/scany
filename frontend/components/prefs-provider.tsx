"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { APP_LANGUAGES } from "@/lib/i18n";
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
  /** True once the stored choices have been read; before that, locale is just the default. */
  hydrated: boolean;
  setLocale: (locale: string) => void;
  setCurrency: (currency: string) => void;
};

const PrefsContext = createContext<PrefsContextValue | null>(null);

export function PrefsProvider({
  restaurantSlug,
  restaurantLocales = [],
  children,
}: {
  restaurantSlug: string;
  /** The restaurant's own languages, preferred over machine-translated ones. */
  restaurantLocales?: string[];
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<StoredPrefs>({ locale: null, currency: null });

  /**
   * The browser's language, used only while the guest has not picked one.
   * Kept apart from `prefs` on purpose: it is never written to storage, so a
   * guest who later picks a language by hand keeps that choice, and one who
   * never picks always follows their own phone's setting.
   */
  const [browserLocale, setBrowserLocale] = useState<string | null>(null);
  const localeKey = restaurantLocales.join("|");

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
    setBrowserLocale(
      detectBrowserLocale(
        typeof navigator !== "undefined"
          ? navigator.languages?.length
            ? navigator.languages
            : [navigator.language]
          : [],
        localeKey ? localeKey.split("|") : [],
      ),
    );
    // Set on every path, including the failures above — otherwise a diner with
    // no stored preferences could never save one.
    setHydrated(true);
  }, [restaurantSlug, localeKey]);

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
      // What the guest picked wins; otherwise their browser's language.
      locale: prefs.locale ?? browserLocale,
      hydrated,
      setLocale: (locale) => setPrefs((p) => ({ ...p, locale })),
      setCurrency: (currency) => setPrefs((p) => ({ ...p, currency })),
    }),
    [prefs, browserLocale, hydrated],
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
 *
 * Every app language is allowed on top of the restaurant's own: the buttons
 * and headings are translated in code, and dishes the restaurant has not
 * translated fall back to English, then Norwegian (see `pick`).
 */
export function useResolvedLocale(allowed: { code: string }[], fallback: string): string {
  const { locale } = usePrefs();
  if (!locale) return fallback;
  if (allowed.some((l) => l.code === locale)) return locale;
  if (APP_LANGUAGES.some((l) => l.code === locale)) return locale;
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

/**
 * The first of the browser's languages (in the guest's own order of
 * preference) that the menu can be shown in. Restaurant languages are tried
 * before the machine-translated app languages, so a Norwegian phone lands on
 * the restaurant's hand-written "nb" rather than a Google translation.
 *
 * Matching goes exact tag first ("zh-TW"), then by primary language ("de-AT"
 * -> "de"), with the few codes where browsers and Google disagree mapped
 * across. Returns null when nothing fits, which leaves the restaurant default.
 */
export function detectBrowserLocale(
  browserLanguages: readonly string[],
  restaurantLocales: string[],
): string | null {
  const candidates = [...restaurantLocales, ...APP_LANGUAGES.map((l) => l.code)];
  const lower = candidates.map((c) => c.toLowerCase());

  for (const raw of browserLanguages) {
    if (!raw) continue;
    const tag = raw.toLowerCase();
    const primary = tag.split("-")[0];

    // Chinese is the one language where the region/script decides the code.
    if (primary === "zh") {
      const traditional = /-(tw|hk|mo|hant)/.test(tag);
      const code = traditional ? "zh-TW" : "zh-CN";
      if (lower.includes(code.toLowerCase())) return candidates[lower.indexOf(code.toLowerCase())];
      continue;
    }

    const exact = lower.indexOf(tag);
    if (exact !== -1) return candidates[exact];

    const aliases: Record<string, string[]> = {
      no: ["nb"],
      nn: ["nb"],
      nb: ["nb", "no"],
      he: ["iw", "he"],
      fil: ["tl"],
      jv: ["jw"],
    };
    for (const code of aliases[primary] ?? [primary]) {
      const index = lower.findIndex((c) => c === code || c.split("-")[0] === code);
      if (index !== -1) return candidates[index];
    }
  }
  return null;
}
