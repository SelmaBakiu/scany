import { EMPTY_CART, type Cart, type SavedOrder } from "./order-types";

/**
 * The basket and the order receipts, kept in the guest's own browser.
 *
 * Why localStorage and not the database: a basket is not an order. Nobody
 * should be able to fill a restaurant's database by adding things to a basket
 * and walking away, and a guest who closes the tab has not ordered anything.
 * Once they press send it becomes a row, and from then on the database is the
 * record — all that stays here is the token needed to read it back.
 *
 * Everything is namespaced per restaurant, so a guest who eats at two places
 * that both run this app does not find one basket in the other's menu.
 *
 * Every access is wrapped: localStorage throws in private mode in some
 * browsers, and a basket is never worth a blank page.
 */

export const cartKey = (slug: string) => `menuscan:cart:${slug}`;
export const ordersKey = (slug: string) => `menuscan:orders:${slug}`;

/** Receipts older than this stop being offered. A meal does not last a day. */
const ORDER_MEMORY_MS = 12 * 60 * 60 * 1000;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Full, blocked, or private mode. The basket still works for this page
    // view; it just will not survive a reload.
  }
}

/**
 * A stored basket, checked rather than trusted. It is JSON the guest could
 * have edited by hand, and a line with a missing id would otherwise travel all
 * the way to the server before failing.
 */
export function loadCart(slug: string): Cart {
  const raw = read<Partial<Cart>>(cartKey(slug), EMPTY_CART);
  const lines = Array.isArray(raw.lines) ? raw.lines : [];

  return {
    lines: lines
      .filter(
        (line): line is Cart["lines"][number] =>
          Boolean(line) &&
          typeof line.itemId === "string" &&
          typeof line.priceMinor === "number" &&
          typeof line.quantity === "number" &&
          line.quantity > 0,
      )
      .map((line) => ({
        ...line,
        quantity: Math.min(99, Math.max(1, Math.round(line.quantity))),
        comment: typeof line.comment === "string" ? line.comment : "",
        names: line.names && typeof line.names === "object" ? line.names : {},
        slug: typeof line.slug === "string" ? line.slug : "",
      }))
      .slice(0, 60),
    tableNumber: typeof raw.tableNumber === "string" ? raw.tableNumber : "",
    guestName: typeof raw.guestName === "string" ? raw.guestName : "",
    comment: typeof raw.comment === "string" ? raw.comment : "",
  };
}

export function saveCart(slug: string, cart: Cart): void {
  write(cartKey(slug), cart);
}

export function clearCart(slug: string): void {
  try {
    window.localStorage.removeItem(cartKey(slug));
  } catch {
    // See above.
  }
}

export function loadSavedOrders(slug: string): SavedOrder[] {
  const raw = read<SavedOrder[]>(ordersKey(slug), []);
  if (!Array.isArray(raw)) return [];
  const cutoff = Date.now() - ORDER_MEMORY_MS;

  return raw
    .filter(
      (order) =>
        order &&
        typeof order.token === "string" &&
        typeof order.orderNumber === "number" &&
        Date.parse(order.createdAt ?? "") > cutoff,
    )
    .slice(0, 20);
}

export function rememberOrder(slug: string, order: SavedOrder): void {
  const existing = loadSavedOrders(slug).filter((o) => o.token !== order.token);
  write(ordersKey(slug), [order, ...existing].slice(0, 20));
}

export function forgetOrder(slug: string, token: string): void {
  write(
    ordersKey(slug),
    loadSavedOrders(slug).filter((o) => o.token !== token),
  );
}
