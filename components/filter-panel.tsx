"use client";

import { pick, type UiStrings } from "@/lib/i18n";
import { priceBandLabel } from "@/lib/money";
import type { Currency, Filters, Tag } from "@/lib/types";
import { emptyFilters } from "@/lib/types";
import { ModalSheet } from "./modal-sheet";

/**
 * The filter sheet.
 *
 * All the chrome — scrim, rounded corners, animation, close button, scroll
 * behaviour — comes from ModalSheet, which the language, currency and theme
 * pickers also use. This file is only the contents.
 *
 * It is a controlled component: it holds no state of its own, it just renders
 * `filters` and calls `onChange` with the next value. That is what keeps the
 * active-filter chips, the count on the button and this sheet from ever
 * disagreeing with each other.
 */
export function FilterPanel({
  tags,
  filters,
  onChange,
  onClose,
  resultCount,
  baseCurrency,
  currency,
  thresholds,
  locale,
  strings,
}: {
  tags: Tag[];
  filters: Filters;
  onChange: (next: Filters) => void;
  onClose: () => void;
  resultCount: number;
  /** Prices are stored in this currency, so the band thresholds are too. */
  baseCurrency: Currency;
  /** What the diner is currently looking at prices in. */
  currency: Currency;
  thresholds: readonly [number, number] | null;
  locale: string;
  strings: UiStrings;
}) {
  const diets = tags.filter((t) => t.kind === "diet");
  const allergens = tags.filter((t) => t.kind === "allergen");
  const heats = tags.filter((t) => t.kind === "heat");

  function toggleIn(list: string[], slug: string): string[] {
    return list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
  }

  return (
    <ModalSheet title={strings.filters} onClose={onClose} closeLabel={strings.close}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onChange(emptyFilters)}
            className="h-11 text-sm font-semibold text-muted underline hover:text-ink"
          >
            {strings.clearAll}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-full bg-accent px-6 text-[15px] font-semibold text-on-accent hover:bg-accent-strong"
          >
            {strings.showResults(resultCount)}
          </button>
        </div>
      }
    >
      <div className="grid gap-6 py-1 md:grid-cols-3 md:gap-7">
        {diets.length > 0 ? (
          <CheckGroup
            legend={strings.diet}
            options={diets.map((tag) => ({ value: tag.slug, label: pick(tag.labels, locale) }))}
            selected={filters.diets}
            onToggle={(slug) => onChange({ ...filters, diets: toggleIn(filters.diets, slug) })}
          />
        ) : null}

        {allergens.length > 0 ? (
          <CheckGroup
            legend={strings.excludeAllergens}
            options={allergens.map((tag) => ({
              value: tag.slug,
              // "Inneholder nøtter" reads wrong next to an exclude checkbox,
              // so strip the lead-in and show the allergen itself.
              label: shortAllergen(pick(tag.labels, locale)),
            }))}
            selected={filters.excludeAllergens}
            onToggle={(slug) =>
              onChange({ ...filters, excludeAllergens: toggleIn(filters.excludeAllergens, slug) })
            }
          />
        ) : null}

        <div className="flex flex-col gap-6">
          {/* Hidden on a menu too small or too uniform to band by price. */}
          <fieldset className={`flex-col gap-2.5 ${thresholds ? "flex" : "hidden"}`}>
            <Legend>{`${strings.price} · ${currency.code}`}</Legend>
            <div className="flex flex-wrap gap-2">
              {thresholds
                ? ([1, 2, 3] as const).map((band) => (
                    <PillToggle
                      key={band}
                      pressed={filters.priceBands.includes(band)}
                      onClick={() =>
                        onChange({
                          ...filters,
                          priceBands: filters.priceBands.includes(band)
                            ? filters.priceBands.filter((b) => b !== band)
                            : [...filters.priceBands, band],
                        })
                      }
                    >
                      {priceBandLabel(band, thresholds, baseCurrency, currency, locale)}
                    </PillToggle>
                  ))
                : null}
            </div>
          </fieldset>

          {heats.length > 0 ? (
            <fieldset className="flex flex-col gap-2.5">
              <Legend>{strings.heat}</Legend>
              <div className="flex flex-wrap gap-2">
                <PillToggle
                  pressed={filters.heat === "none"}
                  onClick={() =>
                    onChange({ ...filters, heat: filters.heat === "none" ? null : "none" })
                  }
                >
                  {strings.heatNone}
                </PillToggle>
                {heats.map((tag) => (
                  <PillToggle
                    key={tag.id}
                    pressed={filters.heat === tag.slug}
                    onClick={() =>
                      onChange({ ...filters, heat: filters.heat === tag.slug ? null : tag.slug })
                    }
                  >
                    {pick(tag.labels, locale)}
                  </PillToggle>
                ))}
              </div>
            </fieldset>
          ) : null}

          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px]">
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={(event) => onChange({ ...filters, availableOnly: event.target.checked })}
              className="size-4.5 accent-accent"
            />
            {strings.availableNow}
          </label>
        </div>
      </div>
    </ModalSheet>
  );
}

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <legend className="p-0 text-xs font-bold uppercase tracking-[0.07em] text-muted">
      {children}
    </legend>
  );
}

function CheckGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-1">
      <Legend>{legend}</Legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px]"
        >
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => onToggle(option.value)}
            className="size-4.5 accent-accent"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

function PillToggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      // aria-pressed, not a checkbox: these are toggle buttons, and a screen
      // reader should say "pressed" rather than "checked".
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex h-11 min-w-13 items-center justify-center rounded-full px-4 text-sm font-semibold ${
        pressed
          ? "border border-ink bg-ink text-ground"
          : "border border-line-strong bg-surface text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Tag labels are written for a dish card ("Inneholder nøtter"), which reads
 * wrong beside an "exclude" checkbox. Strip the lead-in and recapitalise.
 */
function shortAllergen(label: string): string {
  const stripped = label.replace(/^(contains|inneholder|përmban|contiene)\s+/i, "").trim();
  if (!stripped) return label;
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}
