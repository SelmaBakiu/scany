import { createAnonClient } from "./supabase/anon";
import { toOrderView, type Cart, type OrderView } from "./order-types";

/**
 * The guest's three calls to the database, all of them RPC.
 *
 * There is no `from("orders")` anywhere in this file, and there cannot be:
 * the guest has no grant on that table. Everything goes through the
 * security-definer functions in schema.sql, which is what lets a browser
 * holding the public key create an order without being able to read anyone
 * else's, or decide what anything costs.
 */

export type PlacedOrder = {
  orderId: string;
  orderNumber: number;
  token: string;
  totalMinor: number;
};

/**
 * Why an order could not be placed, as a key the UI translates.
 *
 * The database raises these as exception messages; mapping them to a closed
 * set here means a Postgres error string never reaches a guest's screen.
 */
export type OrderError =
  | "ordering_closed"
  | "item_unavailable"
  | "table_required"
  | "empty_order"
  | "unknown_item"
  | "network"
  | "not_configured";

export type PlaceResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; error: OrderError; detail?: string };

const KNOWN_ERRORS: OrderError[] = [
  "ordering_closed",
  "item_unavailable",
  "table_required",
  "empty_order",
  "unknown_item",
];

function classify(message: string): OrderError {
  const found = KNOWN_ERRORS.find((key) => message.includes(key));
  return found ?? "network";
}

export async function placeOrder(restaurantSlug: string, cart: Cart): Promise<PlaceResult> {
  const supabase = createAnonClient();
  if (!supabase) return { ok: false, error: "not_configured" };

  // Note what is sent: item id, quantity, comment. No price, no name, no
  // total. The database looks all of that up itself.
  const lines = cart.lines.map((line) => ({
    item_id: line.itemId,
    quantity: line.quantity,
    comment: line.comment,
  }));

  const { data, error } = await supabase.rpc("place_order", {
    p_restaurant_slug: restaurantSlug,
    p_table_number: cart.tableNumber,
    p_guest_name: cart.guestName,
    p_comment: cart.comment,
    p_lines: lines,
  });

  if (error) return { ok: false, error: classify(error.message), detail: error.message };

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.token !== "string") return { ok: false, error: "network" };

  return {
    ok: true,
    order: {
      orderId: String(row.order_id),
      orderNumber: Number(row.order_number),
      token: row.token,
      totalMinor: Number(row.total_minor),
    },
  };
}

export async function fetchOrder(token: string): Promise<OrderView | null> {
  const supabase = createAnonClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("order_status", { p_token: token });
  if (error) return null;
  return toOrderView(data);
}

export async function fetchOrders(tokens: string[]): Promise<OrderView[]> {
  const supabase = createAnonClient();
  if (!supabase || tokens.length === 0) return [];
  const { data, error } = await supabase.rpc("orders_by_tokens", { p_tokens: tokens });
  if (error || !Array.isArray(data)) return [];
  return data.map(toOrderView).filter((order): order is OrderView => order !== null);
}

/** Is this restaurant taking orders at this moment? Both switches and the clock. */
export async function isOrderingOpen(restaurantId: string): Promise<boolean> {
  const supabase = createAnonClient();
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("ordering_open", { rid: restaurantId });
  return !error && data === true;
}

/**
 * Watch one order for changes.
 *
 * Two mechanisms, on purpose:
 *
 *   - **Realtime broadcast** on a channel named after the order's own token,
 *     pushed by a trigger. Instant, and the token in the channel name is the
 *     authorisation — the same capability that reaches this page at all.
 *
 *   - **Polling**, every few seconds, as a floor. Realtime needs to be enabled
 *     on the project, websockets get blocked on some café wifi, and phones
 *     silently kill sockets when the screen locks. A guest watching for their
 *     food is the worst possible audience for a silent failure, so there is
 *     always a second way for the news to arrive.
 *
 * Both feed the same callback; the caller cannot tell which fired, and does
 * not need to.
 */
export function watchOrder(
  token: string,
  onChange: (order: OrderView) => void,
  { pollMs = 6000 }: { pollMs?: number } = {},
): () => void {
  const supabase = createAnonClient();
  let stopped = false;

  const refresh = async () => {
    if (stopped) return;
    const order = await fetchOrder(token);
    if (order && !stopped) onChange(order);
  };

  void refresh();

  const channel = supabase
    ?.channel(`order-${token}`)
    .on("broadcast", { event: "status" }, () => void refresh())
    .subscribe();

  // Hidden tabs are throttled by the browser anyway; backing off explicitly
  // means a phone in a pocket is not re-asking every six seconds for an hour.
  let timer: ReturnType<typeof setInterval> | null = null;
  const startPolling = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => void refresh(), document.hidden ? pollMs * 5 : pollMs);
  };
  const onVisibility = () => {
    if (!document.hidden) void refresh();
    startPolling();
  };

  startPolling();
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    stopped = true;
    if (timer) clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisibility);
    if (channel) void supabase?.removeChannel(channel);
  };
}
