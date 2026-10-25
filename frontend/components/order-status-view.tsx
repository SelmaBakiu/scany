"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { playSoftChime, unlockAudio } from "@/lib/chime";
import { uiStrings } from "@/lib/i18n";
import { displayPrice } from "@/lib/money";
import { watchOrder } from "@/lib/orders-client";
import type { OrderView } from "@/lib/order-types";
import type { RestaurantMenu } from "@/lib/types";
import { ChevronLeftIcon } from "./icons";
import { useResolvedCurrency, useResolvedLocale } from "./prefs-provider";
import { statusLabel, StatusDot, StatusTracker } from "./order-status";

/**
 * "Where is my food?" — the page a guest keeps open on the table.
 *
 * It subscribes and polls at the same time (see watchOrder). A guest staring
 * at a phone waiting for dinner is the worst possible audience for a dropped
 * websocket, so there are two independent ways for the news to arrive.
 */
export function OrderStatusView({
  restaurant,
  token,
  initial,
}: {
  restaurant: RestaurantMenu;
  token: string;
  /** Rendered on the server so the first paint is the real order, not a spinner. */
  initial: OrderView | null;
}) {
  const locale = useResolvedLocale(restaurant.locales, restaurant.defaultLocale);
  const currency = useResolvedCurrency(restaurant.currencies, restaurant.baseCurrency);
  const strings = uiStrings(locale);

  const [order, setOrder] = useState<OrderView | null>(initial);
  const [toast, setToast] = useState<string | null>(null);
  const lastStatus = useRef(initial?.status ?? null);

  useEffect(() => {
    return watchOrder(token, (next) => {
      setOrder(next);

      // Only on a real change, and never on the first load — nobody wants a
      // chime telling them about the status they already knew.
      if (lastStatus.current !== null && next.status !== lastStatus.current) {
        setToast(statusLabel(next.status, uiStrings(locale)));
        playSoftChime();
      }
      lastStatus.current = next.status;
    });
  }, [token, locale]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!order) {
    return (
      <main className="mx-auto w-full max-w-[42rem] px-5 py-10">
        <h1 className="font-display text-2xl font-bold">{strings.orderNotFound}</h1>
        <p className="mt-2 text-[15px] text-muted">{strings.orderNotFoundHelp}</p>
        <Link
          href={`/m/${restaurant.slug}`}
          className="mt-6 inline-flex h-11 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-ink no-underline"
        >
          {strings.backToMenuFromOrder}
        </Link>
      </main>
    );
  }

  const total = displayPrice(order.totalMinor, restaurant.baseCurrency, currency, locale);
  const declined = order.status === "declined";

  return (
    <main className="mx-auto w-full max-w-[42rem] px-5 py-6 md:py-9">
      <Link
        href={`/m/${restaurant.slug}`}
        aria-label={strings.backToMenuFromOrder}
        className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 text-sm font-semibold text-ink no-underline"
      >
        <ChevronLeftIcon size={16} />
        {strings.backToMenuFromOrder}
      </Link>

      <header className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.03em] md:text-4xl">
          {strings.orderNumber(order.orderNumber)}
        </h1>
        <span className="text-[15px] font-semibold text-muted">
          {strings.table(order.tableNumber)}
        </span>
      </header>

      <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-tint px-3 py-1.5 text-[14px] font-semibold">
        <StatusDot status={order.status} />
        {statusLabel(order.status, strings)}
      </p>

      {declined ? (
        <section className="mt-5 rounded-2xl border border-heat bg-heat-soft p-4">
          <h2 className="font-display text-lg font-bold text-heat">{strings.statusDeclined}</h2>
          {order.declineReason ? (
            <p className="mt-1.5 text-[15px] text-heat">
              <span className="font-semibold">{strings.declineReasonLabel}:</span>{" "}
              {order.declineReason}
            </p>
          ) : null}
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <StatusTracker status={order.status} strings={strings} />
        </section>
      )}

      <section className="mt-5 rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-display text-lg font-bold">{strings.yourOrder}</h2>
        <ul className="flex flex-col gap-2.5">
          {order.items.map((line, index) => {
            const linePrice = displayPrice(
              line.priceMinor * line.quantity,
              restaurant.baseCurrency,
              currency,
              locale,
            );
            return (
              <li key={`${line.name}-${index}`} className="flex items-start justify-between gap-3">
                <span className="min-w-0 flex-1">
                  <span className="text-[15px]">
                    <span className="font-bold tabular-nums">{line.quantity}×</span> {line.name}
                  </span>
                  {line.comment ? (
                    <span className="block text-[13px] text-muted">{line.comment}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[15px] font-semibold tabular-nums">
                  {linePrice.approximate ? "≈ " : ""}
                  {linePrice.text}
                </span>
              </li>
            );
          })}
        </ul>

        {order.comment ? (
          <p className="mt-4 rounded-xl bg-tint px-3 py-2.5 text-[14px]">{order.comment}</p>
        ) : null}

        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-3.5">
          <span className="text-[15px] font-semibold">{strings.total}</span>
          <span className="font-display text-xl font-bold tabular-nums">
            {total.approximate ? "≈ " : ""}
            {total.text}
          </span>
        </div>
      </section>

      {/*
        The sound needs a click before a browser will let it play. Rather than
        a modal nobody reads, the whole page is a one-time unlock target: the
        first tap anywhere arms the chime for the rest of the visit.
      */}
      <OneTapAudioUnlock />

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="sheet-enter fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-[26rem] items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-pop"
        >
          <StatusDot status={order.status} />
          <span className="min-w-0 flex-1 text-[14px] font-semibold">{toast}</span>
        </div>
      ) : null}
    </main>
  );
}

function OneTapAudioUnlock() {
  useEffect(() => {
    const unlock = () => void unlockAudio();
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);
  return null;
}
