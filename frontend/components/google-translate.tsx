"use client";

import { useEffect } from "react";
import {
  ELEMENT_ID,
  googleCode,
  protectReactFromTranslation,
  resetTranslation,
  translatePage,
} from "@/lib/google-translate";
import { usePrefs } from "./prefs-provider";

/**
 * Runs Google Translate over the menu whenever the guest picks a language
 * other than the restaurant's own. See lib/google-translate.ts for why it
 * comes after the app's own translations rather than instead of them.
 *
 * Waits for `hydrated`: until the guest's stored choice has been read, the
 * locale is just the default, and acting on it would clear a chosen
 * translation and reload the page — on every load, forever.
 */
export function GoogleTranslate({ baseLocale }: { baseLocale: string }) {
  const { locale, hydrated } = usePrefs();

  useEffect(() => {
    if (!hydrated) return;
    const target = locale ?? baseLocale;
    if (target === baseLocale) {
      resetTranslation();
      return;
    }
    protectReactFromTranslation();
    translatePage(googleCode(target));
  }, [hydrated, locale, baseLocale]);

  // Google renders its own dropdown in here. Ours replaces it, so it is hidden.
  return <div id={ELEMENT_ID} hidden translate="no" />;
}
