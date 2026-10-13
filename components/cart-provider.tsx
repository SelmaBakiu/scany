"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearCart,
  loadCart,
  loadSavedOrders,
  rememberOrder,
  saveCart,
} from "@/lib/cart-storage";
import {
  EMPTY_CART,
  cartCount,
  cartTotalMinor,
  type Cart,
  type CartLine,
  type SavedOrder,
} from "@/lib/order-types";
import type { MenuItem } from "@/lib/types";

/**
 * The basket, shared by the menu, every dish card, the dish page and the
 * cart sheet.
 *
 * It lives beside the preferences provider rather than inside it because the
 * two have nothing to do with each other: changing currency must not touch
 * the basket, and emptying the basket must not forget the language.
 */

type CartValue = {
  cart: Cart;
  count: number;
  totalMinor: number;
  /** How many of this dish are in the basket right now. */
  quantityOf: (itemId: string) => number;
  add: (item: MenuItem, quantity: number) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  setLineComment: (itemId: string, comment: string) => void;
  remove: (itemId: string) => void;
  setDetails: (details: Partial<Pick<Cart, "tableNumber" | "guestName" | "comment">>) => void;
  empty: () => void;
  /** Receipts for orders already sent, newest first. */
  savedOrders: SavedOrder[];
  keepOrder: (order: SavedOrder) => void;
  refreshSavedOrders: () => void;
};

const CartContext = createContext<CartValue | null>(null);

/**
 * The table number out of the QR link: /m/sofra?table=5
 *
 * Read from `window.location` rather than with `useSearchParams`, which forces
 * the whole subtree out of static rendering and needs a Suspense boundary.
 * This runs in a mount effect, where `window` exists and nothing is being
 * prerendered.
 */
function tableFromLocation(): string {
  try {
    const value = new URLSearchParams(window.location.search).get("table") ?? "";
    return value.trim().slice(0, 16);
  } catch {
    return "";
  }
}

export function CartProvider({
  restaurantSlug,
  children,
}: {
  restaurantSlug: string;
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);

  /**
   * The same load-bearing flag as the preferences provider: without it the
   * save effect below runs on the first commit, while `cart` is still the
   * empty default, and writes that empty basket over the stored one before it
   * has been read back.
   */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadCart(restaurantSlug);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart({
      ...stored,
      // A table number in the link always wins: the guest has physically moved
      // to the table whose QR code they just scanned.
      tableNumber: tableFromLocation() || stored.tableNumber,
    });
    setSavedOrders(loadSavedOrders(restaurantSlug));
    setHydrated(true);
  }, [restaurantSlug]);

  useEffect(() => {
    if (!hydrated) return;
    saveCart(restaurantSlug, cart);
  }, [hydrated, restaurantSlug, cart]);

  const add = useCallback((item: MenuItem, quantity: number) => {
    // Sold out is enforced in the database too; this is the polite half.
    if (!item.isAvailable || quantity < 1) return;

    setCart((current) => {
      const existing = current.lines.find((line) => line.itemId === item.id);
      const lines = existing
        ? current.lines.map((line) =>
            line.itemId === item.id
              ? { ...line, quantity: Math.min(99, line.quantity + quantity) }
              : line,
          )
        : [
            ...current.lines,
            {
              itemId: item.id,
              slug: item.slug,
              names: item.names,
              priceMinor: item.priceMinor,
              quantity: Math.min(99, quantity),
              comment: "",
            } satisfies CartLine,
          ];
      return { ...current, lines };
    });
  }, []);

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    setCart((current) => ({
      ...current,
      lines:
        quantity < 1
          ? current.lines.filter((line) => line.itemId !== itemId)
          : current.lines.map((line) =>
              line.itemId === itemId ? { ...line, quantity: Math.min(99, quantity) } : line,
            ),
    }));
  }, []);

  const setLineComment = useCallback((itemId: string, comment: string) => {
    setCart((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.itemId === itemId ? { ...line, comment: comment.slice(0, 200) } : line,
      ),
    }));
  }, []);

  const remove = useCallback((itemId: string) => {
    setCart((current) => ({
      ...current,
      lines: current.lines.filter((line) => line.itemId !== itemId),
    }));
  }, []);

  const setDetails = useCallback(
    (details: Partial<Pick<Cart, "tableNumber" | "guestName" | "comment">>) => {
      setCart((current) => ({ ...current, ...details }));
    },
    [],
  );

  const empty = useCallback(() => {
    // The table number survives: the guest has not moved tables just because
    // their food is on its way, and asking again for a second round is rude.
    setCart((current) => ({ ...EMPTY_CART, tableNumber: current.tableNumber }));
    clearCart(restaurantSlug);
  }, [restaurantSlug]);

  const keepOrder = useCallback(
    (order: SavedOrder) => {
      rememberOrder(restaurantSlug, order);
      setSavedOrders(loadSavedOrders(restaurantSlug));
    },
    [restaurantSlug],
  );

  const refreshSavedOrders = useCallback(() => {
    setSavedOrders(loadSavedOrders(restaurantSlug));
  }, [restaurantSlug]);

  const value = useMemo<CartValue>(
    () => ({
      cart,
      count: cartCount(cart),
      totalMinor: cartTotalMinor(cart),
      quantityOf: (itemId) => cart.lines.find((l) => l.itemId === itemId)?.quantity ?? 0,
      add,
      setQuantity,
      setLineComment,
      remove,
      setDetails,
      empty,
      savedOrders,
      keepOrder,
      refreshSavedOrders,
    }),
    [cart, add, setQuantity, setLineComment, remove, setDetails, empty, savedOrders, keepOrder, refreshSavedOrders],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}
