"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { displayPrice } from "@/lib/money";
import { pick, uiStrings } from "@/lib/i18n";
import type { MenuCategory, MenuItem, RestaurantMenu } from "@/lib/types";
import {
  useDocumentLanguage,
  useResolvedCurrency,
  useResolvedLocale,
} from "./prefs-provider";
import { PrefsControls } from "./prefs-controls";
import { AddToCart } from "./add-to-cart";
import { OrderControls, useOrderingOpen } from "./order-controls";
import { TagChip } from "./item-card";
import { ChevronLeftIcon, PlatePlaceholder } from "./icons";

/**
 * One dish's page.
 *
 * Single column on a phone, image beside the text from `lg` up. Language,
 * currency and theme come from the shared provider, so whatever the diner chose
 * on the menu is already in effect before this renders.
 */
export function ItemDetail({
  restaurant,
  item,
  category,
}: {
  restaurant: RestaurantMenu;
  item: MenuItem;
  category: MenuCategory;
}) {
  const router = useRouter();
  const locale = useResolvedLocale(restaurant.locales, restaurant.defaultLocale);
  const currency = useResolvedCurrency(restaurant.currencies, restaurant.baseCurrency);
  useDocumentLanguage(locale);

  const strings = uiStrings(locale);
  const name = pick(item.names, locale);
  const price = displayPrice(item.priceMinor, restaurant.baseCurrency, currency, locale);
  const orderingOpen = useOrderingOpen(restaurant);

  const long = pick(item.descriptionsLong, locale) || pick(item.descriptions, locale);
  const ingredients = pick(item.ingredients, locale)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const allergens = item.tags.filter((tag) => tag.kind === "allergen");
  const otherTags = item.tags.filter((tag) => tag.kind !== "allergen");

  const menuHref = `/m/${restaurant.slug}`;

  /**
   * Going back through history is what restores the diner's place in a long
   * menu — a <Link> to the menu would land them at the top again. The fallback
   * matters for someone who opened this link directly from a shared message and
   * has no history to go back to.
   */
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(menuHref);
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[77.5rem] items-center gap-2 px-5 py-3 md:gap-3.5 md:px-8 md:py-3.5">
          <button
            type="button"
            onClick={goBack}
            // The label is not optional: below `sm` the text is hidden and this
            // is an icon-only button, which would otherwise be announced as
            // just "button".
            aria-label={strings.back}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-sm font-semibold text-ink sm:px-4"
          >
            <ChevronLeftIcon />
            <span className="hidden sm:inline">{strings.back}</span>
          </button>

          <Link
            href={menuHref}
            className="min-w-0 flex-1 truncate text-center font-display text-[17px] font-bold tracking-[-0.02em] text-ink no-underline md:text-left md:text-[21px]"
          >
            {restaurant.name}
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <PrefsControls restaurant={restaurant} strings={strings} />
            <OrderControls restaurant={restaurant} strings={strings} orderingOpen={orderingOpen} />
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="mx-auto max-w-[77.5rem] px-5 py-6 md:px-8 md:py-9">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-10">
            {/* Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-tint lg:aspect-square">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={name}
                  fill
                  sizes="(min-width: 1024px) 22rem, 100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-faint">
                  <PlatePlaceholder className="size-24" variant={item.slug.length} />
                </div>
              )}

              {item.isFeatured && item.isAvailable ? (
                <span className="absolute left-4 top-4 inline-flex h-7 items-center rounded-full bg-ink px-3 text-xs font-bold text-ground">
                  {strings.houseFavourite}
                </span>
              ) : null}
            </div>

            {/* Everything else */}
            <div className="min-w-0">
              <p className="text-[13px] font-bold uppercase tracking-[0.07em] text-muted">
                {pick(category.names, locale)}
              </p>

              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                <h1 className="min-w-0 font-display text-[26px] font-bold leading-tight tracking-[-0.03em] md:text-[38px]">
                  {name}
                </h1>
                <p
                  className={`shrink-0 font-display text-[22px] font-bold md:text-[28px] ${
                    item.isAvailable ? "" : "text-muted"
                  }`}
                >
                  {price.approximate ? "≈ " : ""}
                  {price.text}
                </p>
              </div>

              {price.approximate ? (
                <p className="mt-1 text-[12px] text-muted">
                  {strings.approxNote(currency.code, restaurant.baseCurrency.code)}
                </p>
              ) : null}

              {!item.isAvailable ? (
                <p className="mt-3 inline-flex items-center rounded-full border border-line-strong bg-chip px-3 py-1.5 text-[13px] font-semibold text-chip-ink">
                  {strings.unavailable}
                </p>
              ) : null}

              {orderingOpen ? (
                <div className="mt-4">
                  <AddToCart item={item} strings={strings} orderingOpen size="page" />
                </div>
              ) : null}

              {otherTags.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {otherTags.map((tag) => (
                    <li key={tag.id}>
                      <TagChip tag={tag} locale={locale} large />
                    </li>
                  ))}
                </ul>
              ) : null}

              {long ? (
                <section className="mt-6">
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.07em] text-muted">
                    {strings.aboutDish}
                  </h2>
                  <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed md:text-base">
                    {long}
                  </p>
                </section>
              ) : null}

              {ingredients.length > 0 ? (
                <section className="mt-6">
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.07em] text-muted">
                    {strings.ingredients}
                  </h2>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {ingredients.map((ingredient) => (
                      <li
                        key={ingredient}
                        className="rounded-full border border-line bg-surface px-3 py-1.5 text-[13px]"
                      >
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="mt-6">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.07em] text-muted">
                  {strings.allergens}
                </h2>
                {allergens.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {allergens.map((tag) => (
                      <li key={tag.id}>
                        <TagChip tag={tag} locale={locale} large />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[15px] text-muted">{strings.noAllergens}</p>
                )}
                <p className="mt-3 max-w-[60ch] text-[13px] text-muted">{strings.allergenNote}</p>
              </section>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-[15px] font-semibold text-on-accent hover:bg-accent-strong"
                >
                  <ChevronLeftIcon size={16} />
                  {strings.backToMenu}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
