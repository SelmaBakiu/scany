import type { Translated } from "./types";

/**
 * The guest's basket, and what comes back once it has been sent.
 *
 * One rule runs through this whole file: **every price here is for display
 * only.** The basket is a shopping list the browser keeps for itself; the
 * amount that counts is the one `place_order()` computes in the database from
 * the items table. If the two ever disagree, the database is right and the
 * screen is stale — which is exactly what happens when the merchant changes a
 * price while someone is mid-order.
 */

export const ORDER_STATUSES = [
  "new",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "declined",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** The steps a guest watches, in order. `declined` is not one of them. */
export const STATUS_STEPS: OrderStatus[] = ["new", "accepted", "preparing", "ready", "completed"];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Still being cooked or carried: worth showing on the "my orders" button. */
export function isOrderActive(status: OrderStatus): boolean {
  return status !== "completed" && status !== "declined";
}

export type CartLine = {
  itemId: string;
  slug: string;
  /**
   * Every language, not the one that was on screen when it was added. A guest
   * who switches to English after filling the basket should see the basket in
   * English too.
   */
  names: Translated;
  /** Display only — see the note at the top of this file. */
  priceMinor: number;
  quantity: number;
  /** "uten løk" — per line, because it belongs to the dish, not the order. */
  comment: string;
};

export type Cart = {
  lines: CartLine[];
  /** From ?table= in the QR link, or typed in by the guest. */
  tableNumber: string;
  guestName: string;
  comment: string;
};

export const EMPTY_CART: Cart = { lines: [], tableNumber: "", guestName: "", comment: "" };

export function cartCount(cart: Cart): number {
  return cart.lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** Display total, in the restaurant's base currency's minor units. */
export function cartTotalMinor(cart: Cart): number {
  return cart.lines.reduce((sum, line) => sum + line.priceMinor * line.quantity, 0);
}

/** One line of an order as the database recorded it. */
export type OrderLine = {
  name: string;
  priceMinor: number;
  quantity: number;
  comment: string;
};

/** A placed order, read back by its token. */
export type OrderView = {
  id: string;
  orderNumber: number;
  tableNumber: string;
  guestName: string;
  comment: string;
  status: OrderStatus;
  declineReason: string;
  totalMinor: number;
  createdAt: string;
  updatedAt: string;
  restaurantSlug: string;
  items: OrderLine[];
};

/** The receipt the guest keeps in localStorage so they can reopen the page. */
export type SavedOrder = {
  token: string;
  orderNumber: number;
  restaurantSlug: string;
  createdAt: string;
};

type RawOrder = {
  id?: unknown;
  order_number?: unknown;
  table_number?: unknown;
  guest_name?: unknown;
  comment?: unknown;
  status?: unknown;
  decline_reason?: unknown;
  total_minor?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
  restaurant_slug?: unknown;
  items?: unknown;
};

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const num = (value: unknown, fallback = 0) => (typeof value === "number" ? value : fallback);

/**
 * jsonb from `order_status()` into the shape the UI wants.
 *
 * Defensive on every field: this crosses a network boundary, and a page that
 * throws because `decline_reason` was null is a page a guest cannot read their
 * order on.
 */
export function toOrderView(raw: unknown): OrderView | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as RawOrder;
  if (typeof row.id !== "string") return null;

  const status = isOrderStatus(row.status) ? row.status : "new";
  const items = Array.isArray(row.items)
    ? row.items.map((line): OrderLine => {
        const l = (line ?? {}) as Record<string, unknown>;
        return {
          name: str(l.name),
          priceMinor: num(l.price_minor),
          quantity: num(l.quantity, 1),
          comment: str(l.comment),
        };
      })
    : [];

  return {
    id: row.id,
    orderNumber: num(row.order_number),
    tableNumber: str(row.table_number),
    guestName: str(row.guest_name),
    comment: str(row.comment),
    status,
    declineReason: str(row.decline_reason),
    totalMinor: num(row.total_minor),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
    restaurantSlug: str(row.restaurant_slug),
    items,
  };
}
