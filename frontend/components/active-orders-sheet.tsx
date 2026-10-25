"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { UiStrings } from "@/lib/i18n";
import { displayPrice } from "@/lib/money";
import { fetchOrders } from "@/lib/orders-client";
import { isOrderActive, type OrderView } from "@/lib/order-types";
import type { Currency, RestaurantMenu } from "@/lib/types";
import { useCart } from "./cart-provider";
import { ModalSheet } from "./modal-sheet";
import { statusLabel, StatusDot } from "./order-status";

/**
 * "Mine bestillinger" — everything this browser has sent that is still
 * happening, newest first.
 *
 * The tokens come from localStorage; the orders themselves come from the
 * database, because a status saved in the browser would be a lie the moment
 * the kitchen touched it.
 */
export function ActiveOrdersSheet({
  restaurant,
  strings,
  locale,
  currency,
  onClose,
  onCount,
}: {
  restaurant: RestaurantMenu;
  strings: UiStrings;
  locale: string;
  currency: Currency;
  onClose: () => void;
  onCount: (n: number) => void;
}) {
  const { savedOrders } = useCart();
  const [orders, setOrders] = useState<OrderView[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const found = await fetchOrders(savedOrders.map((o) => o.token));
      if (cancelled) return;
      setOrders(found);
      onCount(found.filter((o) => isOrderActive(o.status)).length);
    };
    void load();
    const timer = setInterval(() => void load(), 10_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [savedOrders, onCount]);

  const tokenFor = (order: OrderView) =>
    savedOrders.find((saved) => saved.orderNumber === order.orderNumber)?.token;

  return (
    <ModalSheet title={strings.myOrders} onClose={onClose} closeLabel={strings.close}>
      {orders === null ? (
        <p className="py-6 text-center text-[15px] text-muted">…</p>
      ) : orders.length === 0 ? (
        <p className="py-6 text-center text-[15px] text-muted">{strings.noActiveOrders}</p>
      ) : (
        <ul className="flex flex-col gap-2.5 py-1">
          {orders.map((order) => {
            const token = tokenFor(order);
            const total = displayPrice(
              order.totalMinor,
              restaurant.baseCurrency,
              currency,
              locale,
            );
            const body = (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-base font-bold">
                    {strings.orderNumber(order.orderNumber)}
                  </span>
                  <span className="text-[15px] font-bold tabular-nums">
                    {total.approximate ? "≈ " : ""}
                    {total.text}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                  <span className="text-muted">{strings.table(order.tableNumber)}</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <StatusDot status={order.status} />
                    {statusLabel(order.status, strings)}
                  </span>
                </div>
              </>
            );

            return (
              <li key={order.id}>
                {token ? (
                  <Link
                    href={`/m/${restaurant.slug}/order/${token}`}
                    onClick={onClose}
                    className="block rounded-xl border border-line bg-tint p-3.5 text-ink no-underline hover:border-line-strong"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="rounded-xl border border-line bg-tint p-3.5">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </ModalSheet>
  );
}
