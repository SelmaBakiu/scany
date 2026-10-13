import { priceBand, type PriceThresholds } from "./money";
import { normalize } from "./i18n";
import type { Filters, Menu, MenuCategory, MenuItem } from "./types";

/**
 * Search and filtering are PURE FUNCTIONS over the already-fetched menu — no
 * network, no database round trip per keystroke.
 *
 * That is a deliberate choice for this stage: a menu is tens of items, so
 * filtering it in the browser is instant and works even when the connection
 * drops after first load. Push this to the database (`.textSearch()`, or a
 * Postgres function) only once a venue's menu is large enough that shipping it
 * all is the problem.
 */

export function matchesQuery(item: MenuItem, normalizedQuery: string, locale: string): boolean {
  if (!normalizedQuery) return true;

  // Search the viewed language first, then every other language: a diner
  // reading Norwegian may still type the Italian name they know.
  const haystacks = [item.searchText[locale], ...Object.values(item.searchText)];
  return haystacks.some((h) => h?.includes(normalizedQuery));
}

export function matchesFilters(
  item: MenuItem,
  filters: Filters,
  thresholds: PriceThresholds,
): boolean {
  const slugs = new Set(item.tags.map((t) => t.slug));

  // Diets are AND: "vegan + gluten free" means both, not either.
  if (filters.diets.some((diet) => !slugs.has(diet))) return false;

  // Allergens are exclusions.
  if (filters.excludeAllergens.some((allergen) => slugs.has(allergen))) return false;

  if (
    thresholds &&
    filters.priceBands.length > 0 &&
    !filters.priceBands.includes(priceBand(item.priceMinor, thresholds))
  ) {
    return false;
  }

  if (filters.heat) {
    const heatTags = item.tags.filter((t) => t.kind === "heat");
    if (filters.heat === "none") {
      if (heatTags.length > 0) return false;
    } else if (!heatTags.some((t) => t.slug === filters.heat)) {
      return false;
    }
  }

  if (filters.availableOnly && !item.isAvailable) return false;

  return true;
}

export type FilteredMenu = {
  categories: MenuCategory[];
  matchCount: number;
  totalCount: number;
};

export function filterMenu(
  menu: Menu | null,
  query: string,
  filters: Filters,
  locale: string,
  thresholds: PriceThresholds,
): FilteredMenu {
  if (!menu) return { categories: [], matchCount: 0, totalCount: 0 };

  const normalizedQuery = normalize(query.trim());
  let matchCount = 0;
  let totalCount = 0;

  const categories = menu.categories
    .map((category) => {
      totalCount += category.items.length;
      const items = category.items.filter(
        (item) =>
          matchesFilters(item, filters, thresholds) &&
          matchesQuery(item, normalizedQuery, locale),
      );
      matchCount += items.length;
      return { ...category, items };
    })
    .filter((category) => category.items.length > 0);

  return { categories, matchCount, totalCount };
}
