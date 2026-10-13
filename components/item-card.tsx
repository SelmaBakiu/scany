"use client";

import Image from "next/image";
import Link from "next/link";
import { displayPrice } from "@/lib/money";
import { pick } from "@/lib/i18n";
import type { Currency, MenuItem, Tag } from "@/lib/types";
import type { UiStrings } from "@/lib/i18n";
import { FlameIcon, LeafIcon, PlatePlaceholder } from "./icons";
import { AddToCart } from "./add-to-cart";

/**
 * One dish, as a link to its own page.
 *
 * Small screens get a list row (thumbnail left, text right); from `md` up the
 * same markup becomes a card with a full-width image. One component, two
 * layouts, driven by the `md:` variants — so there is one place to fix when a
 * dish needs a new badge.
 */
export function ItemCard({
  item,
  index,
  restaurantSlug,
  locale,
  baseCurrency,
  currency,
  strings,
  orderingOpen,
}: {
  item: MenuItem;
  index: number;
  restaurantSlug: string;
  locale: string;
  baseCurrency: Currency;
  currency: Currency;
  strings: UiStrings;
  /** Null until the client has worked out whether the kitchen is open. */
  orderingOpen: boolean | null;
}) {
  const name = pick(item.names, locale);
  const description = pick(item.descriptions, locale);
  const price = displayPrice(item.priceMinor, baseCurrency, currency, locale);

  return (
    <Link
      href={`/m/${restaurantSlug}/${item.slug}`}
      aria-label={strings.openItem(name)}
      // min-w-0 is load-bearing, not decoration. This card is a grid item, and
      // a grid item's automatic minimum size is its MIN-CONTENT width. The
      // truncated name and description below carry `white-space: nowrap`, whose
      // min-content is the full untruncated string — so without this the card
      // demands ~580px on a 375px screen and pushes the whole page sideways.
      className={`flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-ink no-underline transition-colors hover:border-line-strong md:block md:overflow-hidden md:p-0 ${
        item.isAvailable ? "" : "opacity-70"
      }`}
    >
      <div className="relative size-18 shrink-0 overflow-hidden rounded-xl bg-tint md:h-42 md:w-full md:rounded-none">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={name}
            fill
            sizes="(min-width: 768px) 320px, 72px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-faint">
            <PlatePlaceholder className="size-7 md:size-11" variant={index} />
          </div>
        )}

        {item.isFeatured && item.isAvailable ? (
          <span className="absolute left-3 top-3 hidden h-6.5 items-center rounded-full bg-ink px-2.5 text-xs font-bold text-ground md:inline-flex">
            {strings.houseFavourite}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 md:p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] md:whitespace-normal md:text-[17px]">
            {name}
          </h3>
          <span
            className={`shrink-0 text-[15px] font-bold md:text-base ${
              item.isAvailable ? "" : "text-muted"
            }`}
            // Converted prices get a title so the "≈" is explained on hover.
            title={price.approximate ? strings.approxNote(currency.code, baseCurrency.code) : undefined}
          >
            {price.approximate ? "≈ " : ""}
            {price.text}
          </span>
        </div>

        {description ? (
          <p className="mt-1 truncate text-[13px] leading-snug text-muted md:mt-2 md:whitespace-normal md:text-sm md:leading-relaxed">
            {description}
          </p>
        ) : null}

        <ul className="mt-2 flex flex-wrap gap-1.5">
          {!item.isAvailable ? (
            <li>
              <span className="inline-flex items-center rounded-full border border-line-strong bg-chip px-2.5 py-1 text-[11px] font-semibold text-chip-ink md:text-xs">
                {strings.unavailable}
              </span>
            </li>
          ) : null}

          {item.isFeatured && item.isAvailable ? (
            <li className="md:hidden">
              <span className="inline-flex items-center rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-ground">
                {strings.houseFavourite}
              </span>
            </li>
          ) : null}

          {item.tags.map((tag) => (
            <li key={tag.id}>
              <TagChip tag={tag} locale={locale} />
            </li>
          ))}
        </ul>

        {/* The one interactive thing inside a card that is otherwise a link.
            AddToCart stops the click from reaching the <Link>, so adding a
            dish does not also open its page. */}
        {orderingOpen ? (
          <div className="mt-2.5">
            <AddToCart item={item} strings={strings} orderingOpen size="card" />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function TagChip({ tag, locale, large }: { tag: Tag; locale: string; large?: boolean }) {
  const label = pick(tag.labels, locale);

  // Diet and heat get colour because diners scan for them; allergens and info
  // stay neutral so the card does not turn into a traffic light.
  const styles: Record<Tag["kind"], string> = {
    diet: "bg-veg-soft text-veg",
    heat: "bg-heat-soft text-heat",
    allergen: "bg-chip text-chip-ink",
    info: "bg-chip text-chip-ink",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
        large ? "text-[13px]" : "text-[11px] md:text-xs"
      } ${styles[tag.kind]}`}
    >
      {tag.kind === "diet" ? <LeafIcon /> : null}
      {tag.kind === "heat" ? <FlameIcon /> : null}
      {label}
    </span>
  );
}
