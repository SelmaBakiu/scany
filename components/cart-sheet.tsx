"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pick, type UiStrings } from "@/lib/i18n";
import { displayPrice } from "@/lib/money";
import { placeOrder, type OrderError } from "@/lib/orders-client";
import type { Currency } from "@/lib/types";
import { useCart } from "./cart-provider";
import { MinusIcon, PlusIcon, TrashIcon } from "./icons";
import { ModalSheet } from "./modal-sheet";

const ERROR_STRING: Record<OrderError, keyof UiStrings> = {
  ordering_closed: "errorOrderingClosed",
  item_unavailable: "errorItemUnavailable",
  table_required: "errorTableRequired",
  empty_order: "errorEmptyOrder",
  unknown_item: "errorUnknownItem",
  network: "errorNetwork",
  not_configured: "errorNotConfigured",
};

/**
 * The basket, in the same sheet as the filters.
 *
 * The send button is the one piece of this file worth reading twice. A guest
 * on a slow connection will press it again if nothing happens, and a
 * double-sent order means food cooked twice and an argument at the table. So
 * it disables itself on the first press and never re-enables on success —
 * the sheet navigates away instead.
 */
export function CartSheet({
  restaurantSlug,
  baseCurrency,
  currency,
  locale,
  strings,
  onClose,
}: {
  restaurantSlug: string;
  baseCurrency: Currency;
  currency: Currency;
  locale: string;
  strings: UiStrings;
  onClose: () => void;
}) {
  const router = useRouter();
  const { cart, totalMinor, setQuantity, setLineComment, remove, setDetails, empty, keepOrder } =
    useCart();

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<OrderError | null>(null);
  const [showTableError, setShowTableError] = useState(false);

  const total = displayPrice(totalMinor, baseCurrency, currency, locale);
  const needsTable = cart.tableNumber.trim().length === 0;

  async function send() {
    if (sending) return;

    if (needsTable) {
      setShowTableError(true);
      setError("table_required");
      return;
    }
    if (cart.lines.length === 0) {
      setError("empty_order");
      return;
    }

    setSending(true);
    setError(null);

    const result = await placeOrder(restaurantSlug, cart);

    if (!result.ok) {
      setError(result.error);
      // Only now is pressing send again sensible.
      setSending(false);
      return;
    }

    keepOrder({
      token: result.order.token,
      orderNumber: result.order.orderNumber,
      restaurantSlug,
      createdAt: new Date().toISOString(),
    });
    empty();
    // Deliberately still `sending`: the button stays dead until this page is
    // gone, so a second tap during the navigation cannot start another order.
    router.push(`/m/${restaurantSlug}/order/${result.order.token}`);
  }

  return (
    <ModalSheet
      title={strings.cart}
      onClose={onClose}
      closeLabel={strings.close}
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[15px] font-semibold">{strings.total}</span>
            <span className="font-display text-xl font-bold tabular-nums">
              {total.approximate ? "≈ " : ""}
              {total.text}
            </span>
          </div>

          {error ? (
            <p
              aria-live="polite"
              className="rounded-xl bg-heat-soft px-3 py-2 text-[13px] font-semibold text-heat"
            >
              {strings[ERROR_STRING[error]] as string}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || cart.lines.length === 0}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent text-base font-semibold text-on-accent disabled:opacity-60"
          >
            {sending ? strings.sending : strings.sendOrder}
          </button>
        </div>
      }
    >
      {cart.lines.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-display text-lg font-bold">{strings.cartEmpty}</p>
          <p className="mt-1 text-[15px] text-muted">{strings.cartEmptyHelp}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 py-1">
          {cart.lines.map((line) => {
            const lineTotal = displayPrice(
              line.priceMinor * line.quantity,
              baseCurrency,
              currency,
              locale,
            );
            return (
              <li key={line.itemId} className="rounded-xl border border-line bg-tint p-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 flex-1 text-[15px] font-semibold">
                    {pick(line.names, locale)}
                  </span>
                  <span className="shrink-0 text-[15px] font-bold tabular-nums">
                    {lineTotal.approximate ? "≈ " : ""}
                    {lineTotal.text}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-10 items-center gap-1 rounded-full border border-line-strong bg-surface px-1">
                    <button
                      type="button"
                      aria-label={strings.decrease}
                      onClick={() => setQuantity(line.itemId, line.quantity - 1)}
                      className="inline-flex size-8 items-center justify-center rounded-full text-ink"
                    >
                      <MinusIcon size={14} />
                    </button>
                    <span className="min-w-6 text-center text-[15px] font-bold tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={strings.increase}
                      onClick={() => setQuantity(line.itemId, line.quantity + 1)}
                      className="inline-flex size-8 items-center justify-center rounded-full bg-accent text-on-accent"
                    >
                      <PlusIcon size={14} />
                    </button>
                  </span>

                  <button
                    type="button"
                    onClick={() => remove(line.itemId)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink"
                  >
                    <TrashIcon size={14} />
                    {strings.removeLine}
                  </button>
                </div>

                <label className="mt-2.5 block">
                  <span className="sr-only">{strings.lineComment}</span>
                  <input
                    value={line.comment}
                    onChange={(event) => setLineComment(line.itemId, event.target.value)}
                    placeholder={strings.lineCommentPlaceholder}
                    maxLength={200}
                    className="h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-[14px] text-ink outline-none placeholder:text-muted focus:border-accent"
                  />
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted">
            {strings.tableNumber}
          </span>
          <input
            value={cart.tableNumber}
            onChange={(event) => {
              setDetails({ tableNumber: event.target.value });
              setShowTableError(false);
            }}
            placeholder={strings.tableNumberPlaceholder}
            inputMode="numeric"
            maxLength={16}
            aria-invalid={showTableError && needsTable}
            className={`h-11 w-full rounded-xl border bg-surface px-3.5 text-[15px] text-ink outline-none placeholder:text-muted ${
              showTableError && needsTable ? "border-heat" : "border-line-strong focus:border-accent"
            }`}
          />
          <span className="text-[12px] text-muted">{strings.tableNumberHelp}</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted">
            {strings.guestName}{" "}
            <span className="font-semibold normal-case tracking-normal">
              ({strings.guestNameOptional})
            </span>
          </span>
          <input
            value={cart.guestName}
            onChange={(event) => setDetails({ guestName: event.target.value })}
            maxLength={80}
            className="h-11 w-full rounded-xl border border-line-strong bg-surface px-3.5 text-[15px] text-ink outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted">
            {strings.orderComment}
          </span>
          <textarea
            value={cart.comment}
            onChange={(event) => setDetails({ comment: event.target.value })}
            placeholder={strings.orderCommentPlaceholder}
            maxLength={500}
            className="min-h-20 w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted focus:border-accent"
          />
        </label>
      </div>
    </ModalSheet>
  );
}
