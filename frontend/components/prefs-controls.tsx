"use client";

import { useState } from "react";
import { localeBadge, type UiStrings } from "@/lib/i18n";
import type { RestaurantMenu } from "@/lib/types";
import { GlobeIcon } from "./icons";
import { LanguageSheet } from "./language-sheet";
import { CurrencySheet } from "./currency-sheet";
import { SheetTrigger } from "./option-sheet";
import { RestaurantInfoSheet, RestaurantInfoTrigger } from "./restaurant-info-sheet";
import { usePrefs, useResolvedCurrency, useResolvedLocale } from "./prefs-provider";

type Open = null | "language" | "currency" | "info";

/**
 * The diner's controls: language, currency, and the restaurant's details.
 *
 * The theme picker used to sit here. It is the merchant's decision now — one
 * theme for every visitor — so its place in the bar went to Restaurantinfo.
 *
 * Both the menu page and the item page use this, because three pickers
 * duplicated across two files is three opportunities for them to drift apart.
 * No coordination with the filter sheet is needed: every sheet covers the page
 * with a scrim, so a second trigger cannot be reached while one is open.
 */
export function PrefsControls({
  restaurant,
  strings,
}: {
  restaurant: RestaurantMenu;
  strings: UiStrings;
}) {
  const { setLocale, setCurrency } = usePrefs();
  const locale = useResolvedLocale(restaurant.locales, restaurant.defaultLocale);
  const currency = useResolvedCurrency(restaurant.currencies, restaurant.baseCurrency);
  const [open, setOpen] = useState<Open>(null);
  const close = () => setOpen(null);

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <SheetTrigger
          label={strings.language}
          display={localeBadge(locale)}
          icon={<GlobeIcon className="shrink-0" />}
          expanded={open === "language"}
          onClick={() => setOpen("language")}
        />
        <SheetTrigger
          label={strings.currency}
          display={currency.code}
          expanded={open === "currency"}
          onClick={() => setOpen("currency")}
        />
        <RestaurantInfoTrigger
          label={strings.restaurantInfo}
          expanded={open === "info"}
          onClick={() => setOpen("info")}
        />
      </div>

      {open === "language" ? (
        <LanguageSheet
          value={locale}
          restaurantLocales={restaurant.locales}
          defaultLocale={restaurant.defaultLocale}
          strings={strings}
          onChange={setLocale}
          onClose={close}
        />
      ) : null}

      {open === "currency" ? (
        <CurrencySheet
          value={currency.code}
          currencies={restaurant.currencies}
          baseCode={restaurant.baseCurrency.code}
          locale={locale}
          strings={strings}
          onChange={setCurrency}
          onClose={close}
        />
      ) : null}

      {open === "info" ? (
        <RestaurantInfoSheet
          name={restaurant.name}
          info={restaurant.info}
          locale={locale}
          strings={strings}
          onClose={close}
        />
      ) : null}
    </>
  );
}
