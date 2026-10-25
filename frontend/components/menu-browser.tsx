"use client";

import { useEffect, useMemo, useState } from "react";
import { collectTags } from "@/lib/menu";
import { filterMenu } from "@/lib/filter";
import { pick, uiStrings } from "@/lib/i18n";
import { countActiveFilters, emptyFilters } from "@/lib/types";
import type { Filters, RestaurantMenu } from "@/lib/types";
import {
  useDocumentLanguage,
  useResolvedCurrency,
  useResolvedLocale,
} from "./prefs-provider";
import { FilterPanel } from "./filter-panel";
import { ItemCard } from "./item-card";
import { OrderControls, OrderingClosedNote, useOrderingOpen } from "./order-controls";
import { PrefsControls } from "./prefs-controls";
import { CloseIcon, MarkIcon, SearchIcon, SlidersIcon } from "./icons";

/**
 * The whole menu page, below the server boundary.
 *
 * The split is the point: the server component fetched the menu ONCE, in every
 * language and with the currency rates, and handed it down. From here on,
 * language, currency, theme, search and filters are all local state — zero
 * network, no loading spinners, works after the connection drops. That is why
 * this file is `"use client"` and the data fetching is not.
 */
export function MenuBrowser({ restaurant }: { restaurant: RestaurantMenu }) {
  const locale = useResolvedLocale(restaurant.locales, restaurant.defaultLocale);
  const currency = useResolvedCurrency(restaurant.currencies, restaurant.baseCurrency);
  useDocumentLanguage(locale);

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const strings = uiStrings(locale);
  const tags = useMemo(() => collectTags(restaurant.menu), [restaurant.menu]);

  const { categories, matchCount, totalCount } = useMemo(
    () => filterMenu(restaurant.menu, query, filters, locale, restaurant.priceThresholds),
    [restaurant.menu, query, filters, locale, restaurant.priceThresholds],
  );

  const orderingOpen = useOrderingOpen(restaurant);
  const activeFilterCount = countActiveFilters(filters);
  const isNarrowed = activeFilterCount > 0 || query.trim().length > 0;
  const activeCategory = useScrollSpy(categories.map((c) => c.slug));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[77.5rem] flex-wrap items-center gap-2 px-5 py-3 md:gap-3.5 md:px-8 md:py-3.5">
          <a
            href="#menu"
            className="flex min-h-11 shrink-0 items-center gap-2.5 text-ink no-underline"
          >
            <span className="flex size-8 items-center justify-center rounded-[9px] bg-ink text-ground md:size-9 md:rounded-[10px]">
              <MarkIcon />
            </span>
            <span className="font-display text-[19px] font-bold tracking-[-0.02em] md:text-[21px]">
              {restaurant.name}
            </span>
          </a>

          {/* Language, currency, theme. On a phone these sit on the first row
              beside the brand; from md they move to the end of the bar. */}
          <div className="ml-auto flex shrink-0 items-center gap-2 md:order-3 md:ml-0">
            <PrefsControls restaurant={restaurant} strings={strings} />
            <OrderControls
              restaurant={restaurant}
              strings={strings}
              orderingOpen={orderingOpen}
            />
          </div>

          {/* Search + filters: full width on its own row on a phone. */}
          <div className="order-last flex w-full items-center gap-2 md:order-2 md:w-auto md:flex-[999_1_16rem]">
            <div className="min-w-0 flex-grow">
              <label htmlFor="menu-search" className="sr-only">
                {strings.searchLabel}
              </label>
              <div
                className={`flex h-11 items-center gap-2.5 rounded-full border px-4 ${
                  query ? "border-ink bg-surface" : "border-line bg-tint"
                }`}
              >
                <SearchIcon className={query ? "text-ink" : "text-muted"} />
                <input
                  id="menu-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={strings.searchPlaceholder}
                  className="min-w-0 flex-grow bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label={strings.clearSearch}
                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-chip text-chip-ink"
                  >
                    <CloseIcon />
                  </button>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={filtersOpen}
              aria-label={
                activeFilterCount > 0
                  ? `${strings.filters}, ${activeFilterCount}`
                  : strings.filters
              }
              className={`relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-semibold md:px-4 ${
                filtersOpen || activeFilterCount > 0
                  ? "border border-ink bg-ink text-ground"
                  : "border border-line-strong bg-surface text-ink"
              }`}
            >
              <SlidersIcon />
              <span className="hidden md:inline">{strings.filters}</span>
              {activeFilterCount > 0 ? (
                <span
                  aria-hidden
                  className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full border-2 border-surface bg-accent px-1 text-[10px] font-bold leading-4 text-on-accent md:static md:border-0 md:px-1.5 md:text-[11px]"
                >
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <main id="menu" className="flex-grow">
        {/*
          Compact on a phone, full on desktop.

          The desktop hero is a quarter of a 667px phone screen, which pushed
          every dish below the fold — the opposite of what someone who just
          scanned a QR code wants. So the title and the dish count share one row
          on mobile, and the tagline only appears where there is room for it.
        */}
        <section className="border-b border-line bg-tint">
          <div className="mx-auto max-w-[77.5rem] px-5 py-4 md:px-8 md:py-9">
            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
              <h1 className="min-w-0 font-display text-[22px] font-bold leading-tight tracking-[-0.03em] md:text-[44px]">
                {pick(restaurant.menu?.names, locale) || restaurant.name}
              </h1>
              <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-line-strong bg-surface px-3 text-[13px] font-semibold md:h-9 md:px-3.5">
                {strings.dishCount(totalCount)}
              </span>
            </div>

            <p className="mt-3 hidden max-w-[52ch] text-base leading-relaxed text-muted md:block">
              {strings.orderWithServer}
            </p>

            {/* Plain wrapping text, not a fixed-height chip: in Norwegian this
                reads "EUR omregnet fra NOK" and a chip would overflow. */}
            {orderingOpen === false ? (
              <div className="mt-3 md:mt-4">
                <OrderingClosedNote strings={strings} />
              </div>
            ) : null}

            {currency.code !== restaurant.baseCurrency.code ? (
              <p className="mt-2 text-[12px] text-muted md:mt-3 md:text-[13px]">
                {strings.approxNote(currency.code, restaurant.baseCurrency.code)}
              </p>
            ) : null}
          </div>
        </section>

        {categories.length > 1 ? (
          <nav
            aria-label={strings.categories}
            className="sticky top-[4.25rem] z-20 border-b border-line bg-ground md:top-[4.5rem]"
          >
            <div className="mx-auto max-w-[77.5rem] px-5 py-3 md:px-8 md:py-3.5">
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`#cat-${category.slug}`}
                    aria-current={activeCategory === category.slug ? "true" : undefined}
                    className={`inline-flex h-11 shrink-0 items-center rounded-full px-5 text-sm font-semibold no-underline ${
                      activeCategory === category.slug
                        ? "bg-accent text-on-accent"
                        : "border border-line-strong bg-surface text-ink"
                    }`}
                  >
                    {pick(category.names, locale)}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        ) : null}

        <div className="mx-auto flex max-w-[77.5rem] flex-col gap-9 px-5 py-8 md:gap-10 md:px-8 md:py-9">
          {isNarrowed ? (
            <ActiveFilterBar
              filters={filters}
              tags={tags}
              query={query}
              locale={locale}
              strings={strings}
              matchCount={matchCount}
              onChange={setFilters}
              onClearQuery={() => setQuery("")}
            />
          ) : null}

          {categories.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface px-6 py-14 text-center">
              <p className="font-display text-xl font-bold">{strings.noMatches}</p>
              <p className="mt-2 text-sm text-muted">{strings.noMatchesHelp}</p>
              <button
                type="button"
                onClick={() => {
                  setFilters(emptyFilters);
                  setQuery("");
                }}
                className="mt-5 h-11 rounded-full bg-accent px-6 text-[15px] font-semibold text-on-accent hover:bg-accent-strong"
              >
                {strings.clearAll}
              </button>
            </div>
          ) : (
            categories.map((category) => (
              <section
                key={category.id}
                id={`cat-${category.slug}`}
                // Clear the two stacked sticky bars when an anchor jumps here.
                className="scroll-mt-36 md:scroll-mt-40"
              >
                <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                  <h2 className="font-display text-xl font-bold tracking-[-0.02em] md:text-[26px]">
                    {pick(category.names, locale)}
                  </h2>
                  <span className="shrink-0 text-[13px] text-muted md:text-sm">
                    {strings.dishCount(category.items.length)}
                  </span>
                </div>
                <div className="mt-4 grid gap-2.5 md:mt-5 md:grid-cols-[repeat(auto-fill,minmax(min(100%,17.5rem),1fr))] md:gap-5">
                  {category.items.map((item, index) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      restaurantSlug={restaurant.slug}
                      locale={locale}
                      baseCurrency={restaurant.baseCurrency}
                      currency={currency}
                      strings={strings}
                      orderingOpen={orderingOpen}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <footer className="mt-7 border-t border-line bg-surface">
        <div className="mx-auto flex max-w-[77.5rem] flex-wrap items-center justify-between gap-3.5 px-5 py-6 md:px-8">
          <p className="max-w-[60ch] text-[13px] text-muted">{strings.allergenNote}</p>
        </div>
      </footer>

      {filtersOpen ? (
        <FilterPanel
          tags={tags}
          filters={filters}
          onChange={setFilters}
          onClose={() => setFiltersOpen(false)}
          resultCount={matchCount}
          baseCurrency={restaurant.baseCurrency}
          currency={currency}
          thresholds={restaurant.priceThresholds}
          locale={locale}
          strings={strings}
        />
      ) : null}
    </>
  );
}

/** The chips that show what is currently narrowing the menu, each removable. */
function ActiveFilterBar({
  filters,
  tags,
  query,
  locale,
  strings,
  matchCount,
  onChange,
  onClearQuery,
}: {
  filters: Filters;
  tags: { slug: string; labels: Record<string, string> }[];
  query: string;
  locale: string;
  strings: ReturnType<typeof uiStrings>;
  matchCount: number;
  onChange: (next: Filters) => void;
  onClearQuery: () => void;
}) {
  function labelFor(slug: string): string {
    const tag = tags.find((t) => t.slug === slug);
    return tag ? pick(tag.labels, locale) : slug;
  }

  const chips: { key: string; label: string; remove: () => void }[] = [];

  if (query.trim()) {
    chips.push({ key: "query", label: `“${query.trim()}”`, remove: onClearQuery });
  }
  for (const slug of filters.diets) {
    chips.push({
      key: `diet-${slug}`,
      label: labelFor(slug),
      remove: () => onChange({ ...filters, diets: filters.diets.filter((s) => s !== slug) }),
    });
  }
  for (const slug of filters.excludeAllergens) {
    chips.push({
      key: `allergen-${slug}`,
      label: `✕ ${labelFor(slug)}`,
      remove: () =>
        onChange({
          ...filters,
          excludeAllergens: filters.excludeAllergens.filter((s) => s !== slug),
        }),
    });
  }
  for (const band of filters.priceBands) {
    chips.push({
      key: `band-${band}`,
      label: "¤".repeat(band),
      remove: () =>
        onChange({ ...filters, priceBands: filters.priceBands.filter((b) => b !== band) }),
    });
  }
  if (filters.heat) {
    const slug = filters.heat;
    chips.push({
      key: "heat",
      label: slug === "none" ? strings.heatNone : labelFor(slug),
      remove: () => onChange({ ...filters, heat: null }),
    });
  }
  if (filters.availableOnly) {
    chips.push({
      key: "available",
      label: strings.availableNow,
      remove: () => onChange({ ...filters, availableOnly: false }),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[13px] font-bold uppercase tracking-[0.07em] text-muted">
          {strings.active}
        </span>
        {chips.map((chip) => (
          <span
            key={chip.key}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong bg-surface pl-3.5 pr-2 text-sm font-semibold"
          >
            {chip.label}
            <button
              type="button"
              onClick={chip.remove}
              aria-label={strings.remove(chip.label)}
              className="flex size-5.5 items-center justify-center rounded-full bg-chip text-chip-ink"
            >
              <CloseIcon size={11} />
            </button>
          </span>
        ))}
      </div>
      <p aria-live="polite" className="text-sm text-muted">
        {strings.matchCount(matchCount)}
      </p>
    </div>
  );
}

/**
 * Highlights the category pill for the section currently in view.
 *
 * `rootMargin` pushes the detection line below the two sticky bars, so the
 * pill flips when the heading reaches the top of the readable area rather than
 * when it slides under the header.
 */
function useScrollSpy(slugs: string[]): string | null {
  const [seen, setSeen] = useState<string | null>(null);
  // Joining to a string gives the effect a stable primitive dependency: a new
  // array with the same contents on every render would restart the observer
  // on every keystroke in the search box.
  const slugKey = slugs.join("|");

  useEffect(() => {
    const current = slugKey ? slugKey.split("|") : [];
    if (current.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setSeen(visible.target.id.replace(/^cat-/, ""));
      },
      { rootMargin: "-180px 0px -60% 0px", threshold: 0 },
    );

    for (const slug of current) {
      const element = document.getElementById(`cat-${slug}`);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [slugKey]);

  // Resolved at render time rather than stored: when a filter removes the
  // category that was active, the first remaining one highlights immediately,
  // with no extra state update to go stale.
  return seen && slugs.includes(seen) ? seen : (slugs[0] ?? null);
}
