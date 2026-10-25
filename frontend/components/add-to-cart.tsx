"use client";

import { useEffect, useState } from "react";
import type { UiStrings } from "@/lib/i18n";
import type { MenuItem } from "@/lib/types";
import { MinusIcon, PlusIcon } from "./icons";
import { useCart } from "./cart-provider";

/**
 * "Legg til", in two sizes.
 *
 * On a card it starts as one button and becomes a stepper once there is
 * something in the basket — one tap to order, and the second tap is where
 * quantity appears, rather than making every guest read a number picker they
 * mostly do not need.
 */
export function AddToCart({
  item,
  strings,
  size = "card",
  orderingOpen,
}: {
  item: MenuItem;
  strings: UiStrings;
  size?: "card" | "page";
  orderingOpen: boolean;
}) {
  const { add, quantityOf, setQuantity } = useCart();
  const quantity = quantityOf(item.id);
  const large = size === "page";

  // "Lagt til" for a moment after the first tap, so something visibly happens
  // on a card where the basket button is off-screen.
  const [justAdded, setJustAdded] = useState(false);
  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1400);
    return () => clearTimeout(timer);
  }, [justAdded]);

  if (!orderingOpen) return null;

  /*
   * Nothing at all for a sold-out dish.
   *
   * Both callers already show an "Utsolgt" marker of their own — the chip in
   * the card's tag row, the pill on the dish page — and they show it whether
   * or not ordering is switched on. Rendering a second badge here put the same
   * word on the card twice.
   */
  if (!item.isAvailable) return null;

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={(event) => {
          // On a card the whole row is a link to the dish page. Adding to the
          // basket must not also navigate.
          event.preventDefault();
          event.stopPropagation();
          add(item, 1);
          setJustAdded(true);
        }}
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-accent font-semibold text-on-accent ${
          large ? "h-12 px-6 text-base" : "h-9 px-3.5 text-[13px]"
        }`}
      >
        {justAdded ? strings.added : strings.addToOrder}
      </button>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-ink bg-surface ${
        large ? "h-12 px-1.5" : "h-9 px-1"
      }`}
      // Same reason as above: this sits inside the card's link.
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <button
        type="button"
        aria-label={strings.decrease}
        onClick={() => setQuantity(item.id, quantity - 1)}
        className={`inline-flex items-center justify-center rounded-full text-ink ${
          large ? "size-9" : "size-7"
        }`}
      >
        <MinusIcon size={large ? 16 : 13} />
      </button>
      <span
        aria-live="polite"
        aria-label={`${strings.quantity}: ${quantity}`}
        className={`min-w-5 text-center font-bold tabular-nums ${large ? "text-base" : "text-sm"}`}
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label={strings.increase}
        onClick={() => setQuantity(item.id, quantity + 1)}
        className={`inline-flex items-center justify-center rounded-full bg-accent text-on-accent ${
          large ? "size-9" : "size-7"
        }`}
      >
        <PlusIcon size={large ? 16 : 13} />
      </button>
    </span>
  );
}
