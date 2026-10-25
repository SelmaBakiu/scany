import { isOrderStatus, type OrderStatus } from "./order-types";

/**
 * Orders as the merchant sees them: all of them, with the guest's name and
 * table, but never the token. The token is the guest's key to their own order
 * and has no business on a screen in the kitchen.
 */

export type AdminOrderLine = {
  id: string;
  name: string;
  priceMinor: number;
  quantity: number;
  comment: string;
};

export type AdminOrder = {
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
  items: AdminOrderLine[];
};

/** The tabs on the board, and which statuses land in each. */
export const ORDER_TABS = ["new", "active", "ready", "completed", "declined"] as const;
export type OrderTab = (typeof ORDER_TABS)[number];

export const TAB_STATUSES: Record<OrderTab, OrderStatus[]> = {
  new: ["new"],
  active: ["accepted", "preparing"],
  ready: ["ready"],
  completed: ["completed"],
  declined: ["declined"],
};

export function tabOf(status: OrderStatus): OrderTab {
  return (ORDER_TABS.find((tab) => TAB_STATUSES[tab].includes(status)) ?? "new") as OrderTab;
}

/**
 * What each button does, as data rather than a chain of ifs in the component.
 * `next` is the status the button moves the order to.
 */
export const STATUS_ACTIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ["accepted", "declined"],
  accepted: ["preparing", "declined"],
  preparing: ["ready"],
  ready: ["completed"],
  completed: [],
  declined: [],
};

export const SELECT_ORDERS = `
  id, order_number, table_number, guest_name, comment, status, decline_reason,
  total_minor, created_at, updated_at,
  order_items ( id, name, price_minor, quantity, comment )
`;

type RawLine = {
  id?: unknown;
  name?: unknown;
  price_minor?: unknown;
  quantity?: unknown;
  comment?: unknown;
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
  order_items?: unknown;
};

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const num = (v: unknown, fallback = 0) => (typeof v === "number" ? v : fallback);

export function toAdminOrder(raw: unknown): AdminOrder | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as RawOrder;
  if (typeof row.id !== "string") return null;

  return {
    id: row.id,
    orderNumber: num(row.order_number),
    tableNumber: str(row.table_number),
    guestName: str(row.guest_name),
    comment: str(row.comment),
    status: isOrderStatus(row.status) ? row.status : "new",
    declineReason: str(row.decline_reason),
    totalMinor: num(row.total_minor),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
    items: Array.isArray(row.order_items)
      ? row.order_items.map((line): AdminOrderLine => {
          const l = (line ?? {}) as RawLine;
          return {
            id: str(l.id),
            name: str(l.name),
            priceMinor: num(l.price_minor),
            quantity: num(l.quantity, 1),
            comment: str(l.comment),
          };
        })
      : [],
  };
}

/**
 * "4 min" — how long this order has been waiting.
 *
 * Deliberately coarse. A kitchen needs to know whether an order is fresh or
 * forgotten, not that it is 4 minutes and 12 seconds old, and a second-by-
 * second counter would re-render the whole board every second to say so.
 */
export function minutesSince(iso: string, now: number = Date.now()): number {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((now - then) / 60000));
}
