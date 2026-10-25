import { notFound } from "next/navigation";
import { OrderStatusView } from "@/components/order-status-view";
import { fetchRestaurantMenu } from "@/lib/menu";
import { createAnonClient } from "@/lib/supabase/anon";
import { toOrderView } from "@/lib/order-types";

/**
 * The guest's order, reached by a link only they have.
 *
 * The token in the URL is the whole authorisation — there is no login — so the
 * page must never be cached or prerendered: one guest's order sitting in a CDN
 * is exactly the leak the token exists to prevent.
 */
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: PageProps<"/m/[slug]/order/[token]">) {
  const { slug, token } = await params;

  const menu = await fetchRestaurantMenu(slug);
  if (menu.status !== "ok") notFound();

  // Fetched on the server so the first paint is the real order rather than a
  // spinner; the client then takes over watching it.
  const supabase = createAnonClient();
  const { data } = supabase
    ? await supabase.rpc("order_status", { p_token: token })
    : { data: null };

  return (
    <OrderStatusView restaurant={menu.data} token={token} initial={toOrderView(data)} />
  );
}
