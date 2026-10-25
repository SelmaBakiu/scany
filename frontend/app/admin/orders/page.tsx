import { getMerchantContext } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SELECT_ORDERS, toAdminOrder, type AdminOrder } from "@/lib/admin-orders";
import { OrdersBoard } from "@/components/admin/orders-board";

/**
 * The kitchen's screen. Never cached — an order list that is a minute old is
 * worse than useless.
 */
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const context = await getMerchantContext();
  if (context.status !== "ok") return null; // the layout has already explained why

  const supabase = await createSupabaseServerClient();
  const { data } = supabase
    ? await supabase
        .from("orders")
        .select(SELECT_ORDERS)
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] };

  const orders = (data ?? [])
    .map(toAdminOrder)
    .filter((order): order is AdminOrder => order !== null);

  return (
    <OrdersBoard
      initial={orders}
      baseCurrency={context.data.baseCurrency}
      locale={context.data.restaurant.defaultLocale}
    />
  );
}
