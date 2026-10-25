"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ADMIN_LOCALES,
  DEFAULT_ADMIN_LOCALE,
  adminStrings,
  isAdminLocale,
  type AdminLocale,
  type AdminStrings,
} from "@/lib/admin-i18n";
import { ADMIN_LOCALE_KEY } from "@/lib/prefs-storage";
import { GlobeIcon } from "../icons";
import { OptionSheet, SheetTrigger } from "../option-sheet";

/**
 * The merchant's language, kept entirely apart from the diner's.
 *
 * Two separate stores, two separate storage keys, no shared state: a merchant
 * who works in English is not telling their guests anything, and a guest
 * switching the menu to Italian does not relabel the merchant's buttons. The
 * only thing they have in common is the sheet they are picked in.
 *
 * It lives in localStorage rather than on the restaurant row because it is a
 * property of the PERSON, not the business — two people sharing one login can
 * each have their own.
 */

type AdminLocaleValue = {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  t: AdminStrings;
};

const AdminLocaleContext = createContext<AdminLocaleValue | null>(null);

export function AdminLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>(DEFAULT_ADMIN_LOCALE);

  /**
   * Same load-bearing flag as the diner's provider: without it the save effect
   * runs on the first commit, while `locale` still holds the default, and
   * writes that default over the stored choice before it has been read.
   */
  const [hydrated, setHydrated] = useState(false);

  // Read once on mount, not in a lazy initializer: the server rendered the
  // default, so touching localStorage during the first client render would
  // make the two disagree and break hydration.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(ADMIN_LOCALE_KEY);
    } catch {
      // Storage blocked. Norwegian it is.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isAdminLocale(stored)) setLocaleState(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(ADMIN_LOCALE_KEY, locale);
    } catch {
      // Storage blocked. The choice still holds for this page view.
    }
    // The admin is one language for the whole document, so <html lang> can be
    // set directly — unlike the diner's side, where it follows the menu.
    document.documentElement.lang = locale;
  }, [hydrated, locale]);

  const value = useMemo<AdminLocaleValue>(
    () => ({ locale, setLocale: setLocaleState, t: adminStrings(locale) }),
    [locale],
  );

  return <AdminLocaleContext.Provider value={value}>{children}</AdminLocaleContext.Provider>;
}

export function useAdminLocale(): AdminLocaleValue {
  const value = useContext(AdminLocaleContext);
  if (!value) {
    throw new Error("useAdminLocale must be used inside <AdminLocaleProvider>");
  }
  return value;
}

/** Shorthand for the common case: a component that only wants the strings. */
export function useAdminStrings(): AdminStrings {
  return useAdminLocale().t;
}

/**
 * The language pill in the admin header.
 *
 * Deliberately the same `SheetTrigger` + `OptionSheet` the diner's menu uses,
 * so there is one sheet in this codebase and not two. It comes out black and
 * white here for free: the sheet is built from colour tokens, and inside the
 * admin's scope those tokens are monochrome.
 */
export function AdminLanguagePicker() {
  const { locale, setLocale, t } = useAdminLocale();
  const [open, setOpen] = useState(false);
  const current = ADMIN_LOCALES.find((l) => l.code === locale) ?? ADMIN_LOCALES[0];

  return (
    <>
      <SheetTrigger
        label={t.language}
        display={current.badge}
        icon={<GlobeIcon className="shrink-0" />}
        expanded={open}
        onClick={() => setOpen(true)}
      />
      {open ? (
        <OptionSheet
          title={t.language}
          closeLabel={t.close}
          value={locale}
          onChange={(value) => {
            if (isAdminLocale(value)) setLocale(value);
          }}
          onClose={() => setOpen(false)}
          options={ADMIN_LOCALES.map((l) => ({ value: l.code, label: l.label, hint: l.badge }))}
        />
      ) : null}
    </>
  );
}
