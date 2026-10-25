"use client";

import type { UiStrings } from "@/lib/i18n";
import { STATUS_STEPS, type OrderStatus } from "@/lib/order-types";
import { CheckIcon } from "./icons";

/**
 * The shared vocabulary of order status: one label table, one dot, one
 * tracker. Imported by the guest's status page, the "my orders" sheet and
 * (through its own translations) the merchant's board.
 */

const LABEL_KEY: Record<OrderStatus, keyof UiStrings> = {
  new: "statusNew",
  accepted: "statusAccepted",
  preparing: "statusPreparing",
  ready: "statusReady",
  completed: "statusCompleted",
  declined: "statusDeclined",
};

export function statusLabel(status: OrderStatus, strings: UiStrings): string {
  return strings[LABEL_KEY[status]] as string;
}

/** Red for declined, green once it is ready, otherwise the accent. */
export function StatusDot({ status }: { status: OrderStatus }) {
  const tone =
    status === "declined"
      ? "bg-heat"
      : status === "ready" || status === "completed"
        ? "bg-veg"
        : "bg-accent";
  return <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${tone}`} />;
}

/**
 * The tracker: five steps, the ones already passed filled in.
 *
 * A declined order does not belong on a progress line — it did not progress —
 * so the caller renders the reason instead.
 */
export function StatusTracker({
  status,
  strings,
}: {
  status: OrderStatus;
  strings: UiStrings;
}) {
  const index = STATUS_STEPS.indexOf(status);

  return (
    <ol className="flex flex-col gap-0">
      {STATUS_STEPS.map((step, position) => {
        const done = position < index;
        const current = position === index;
        const last = position === STATUS_STEPS.length - 1;

        return (
          <li key={step} className="flex gap-3">
            {/* The rail: a marker and the line down to the next step. */}
            <span className="flex flex-col items-center" aria-hidden>
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  done
                    ? "border-veg bg-veg text-ground"
                    : current
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line-strong bg-surface"
                }`}
              >
                {done ? <CheckIcon size={12} /> : null}
                {current ? <span className="size-2 rounded-full bg-on-accent" /> : null}
              </span>
              {last ? null : (
                <span
                  className={`w-0.5 flex-1 ${done ? "bg-veg" : "bg-line-strong"}`}
                  style={{ minHeight: 18 }}
                />
              )}
            </span>

            <span className={`pb-4 text-[15px] ${current ? "font-bold" : "text-muted"}`}>
              {statusLabel(step, strings)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
