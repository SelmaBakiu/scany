import { getMerchantContext } from "@/lib/admin";
import { QrCodes } from "@/components/admin/qr-codes";

export default async function QrPage() {
  const context = await getMerchantContext();
  if (context.status !== "ok") return null; // the layout has already explained why

  return <QrCodes restaurantSlug={context.data.restaurant.slug} />;
}
