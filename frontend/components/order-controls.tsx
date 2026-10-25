"use client";

import { useEffect, useState } from "react";
import { type UiStrings } from "@/lib/i18n";
import { openState } from "@/lib/opening-hours";
import { isOrderActive } from "@/lib/order-types";
import type { RestaurantMenu } from "@/lib/types";
import { useCart } from "./cart-provider";
import { CartSheet } from "./cart-sheet";
import { ActiveOrdersSheet } from "./active-orders-sheet";
import { BagIcon, ReceiptIcon } from "./icons";
import { useResolvedCurrency, useResolvedLocale } from "./prefs-provider";

/**
 * Whether this restaurant is taking orders, worked out on the client.
 *
 * It cannot be done on the server: the menu page is cached for a minute, so a
 * server-rendered answer would be wrong for up to a minute either side of
 * closing time. Same reasoning as the "Åpen nå" badge, and the same hook
 * shape — null until mounted, so the server and client markup agree.
 *
 * This only decides whether to DRAW the buttons. `place_order()` re-checks
 * both the switch and the clock in the database, where a guest cannot argue
 * with it.
 */
export function useOrderingOpen(restaurant: RestaurantMenu): boolean | null {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () =>
      setOpen(
        restaurant.orderingEnabled &&
          openState(restaurant.info.openingHours, restaurant.info.timezone).isOpen,
      );
    check();
    const timer = setInterval(check, 60_000);
    return () => clearInterval(timer);
  }, [restaurant.orderingEnabled, restaurant.info.openingHours, restaurant.info.timezone]);

  return open;
}

/**
 * The basket pill and the "my orders" pill, for the menu's top bar.
 *
 * The basket is always visible once there is something in it — that is the
 * whole point of it — and carries the count as a badge. "My orders" only
 * appears once this browser has actually placed one.
 */
export function OrderControls({
  restaurant,
  strings,
  orderingOpen,
}: {
  restaurant: RestaurantMenu;
  strings: UiStrings;
  orderingOpen: boolean | null;
}) {
  const { count, savedOrders } = useCart();
  const [open, setOpen] = useState<null | "cart" | "orders">(null);
  const locale = useResolvedLocale(restaurant.locales, restaurant.defaultLocale);
  const currency = useResolvedCurrency(restaurant.currencies, restaurant.baseCurrency);

  // Only orders that are still happening are worth a button. A completed meal
  // from this morning is not something anyone wants a badge for.
  const [activeCount, setActiveCount] = useState(0);

  return (
    <>
      {savedOrders.length > 0 ? (
        <button
          type="button"
          onClick={() => setOpen("orders")}
          aria-haspopup="dialog"
          aria-expanded={open === "orders"}
          aria-label={
            activeCount > 0 ? `${strings.myOrders}, ${activeCount}` : strings.myOrders
          }
          className="relative inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-sm font-semibold text-ink"
        >
          <ReceiptIcon className="shrink-0" />
          <span className="hidden lg:inline">{strings.myOrders}</span>
          {activeCount > 0 ? (
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full border-2 border-surface bg-accent px-1 text-[10px] font-bold leading-4 text-on-accent"
            >
              {activeCount}
            </span>
          ) : null}
        </button>
      ) : null}

      {orderingOpen ? (
        <button
          type="button"
          onClick={() => setOpen("cart")}
          aria-haspopup="dialog"
          aria-expanded={open === "cart"}
          aria-label={count > 0 ? `${strings.cart}, ${count}` : strings.cart}
          className={`relative inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ${
            count > 0
              ? "bg-accent text-on-accent"
              : "border border-line-strong bg-surface text-ink"
          }`}
        >
          <BagIcon className="shrink-0" />
          <span className="hidden lg:inline">{strings.cart}</span>
          {count > 0 ? (
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full border-2 border-surface bg-ink px-1 text-[10px] font-bold leading-4 text-ground"
            >
              {count}
            </span>
          ) : null}
        </button>
      ) : null}

      {open === "cart" ? (
        <CartSheet
          restaurantSlug={restaurant.slug}
          baseCurrency={restaurant.baseCurrency}
          currency={currency}
          locale={locale}
          strings={strings}
          onClose={() => setOpen(null)}
        />
      ) : null}

      {open === "orders" ? (
        <ActiveOrdersSheet
          restaurant={restaurant}
          strings={strings}
          locale={locale}
          currency={currency}
          onClose={() => setOpen(null)}
          onCount={setActiveCount}
        />
      ) : null}

      {/* Keeps the badge honest without opening the sheet. */}
      <ActiveOrderCounter onCount={setActiveCount} />
    </>
  );
}

/**
 * Counts how many saved orders are still in progress, without rendering
 * anything. Split out so the badge can update on its own schedule rather than
 * only while the sheet is open.
 */
function ActiveOrderCounter({ onCount }: { onCount: (n: number) => void }) {
  const { savedOrders } = useCart();

  useEffect(() => {
    let cancelled = false;
    if (savedOrders.length === 0) {
      onCount(0);
      return;
    }

    const tick = async () => {
      const { fetchOrders } = await import("@/lib/orders-client");
      const orders = await fetchOrders(savedOrders.map((o) => o.token));
      if (!cancelled) onCount(orders.filter((o) => isOrderActive(o.status)).length);
    };

    void tick();
    const timer = setInterval(() => void tick(), 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [savedOrders, onCount]);

  return null;
}

/** The "we are closed" line, shown in place of the basket. */
export function OrderingClosedNote({ strings }: { strings: UiStrings }) {
  return (
    <p className="rounded-xl border border-line bg-tint px-4 py-3 text-[14px] text-muted">
      <span className="font-semibold text-ink">{strings.orderingClosed}.</span>{" "}
      {strings.orderingClosedHelp}
    </p>
  );
}
