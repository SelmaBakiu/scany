import { redirect } from "next/navigation";

/**
 * Hidden for now: the QR page is out of the sidebar, and anyone who still has
 * the address is sent to the dishes instead. To bring it back, restore the
 * original page below and the line in components/admin/nav.tsx.
 *
 *   import { getMerchantContext } from "@/lib/admin";
 *   import { QrCodes } from "@/components/admin/qr-codes";
 *
 *   export default async function QrPage() {
 *     const context = await getMerchantContext();
 *     if (context.status !== "ok") return null;
 *     return <QrCodes restaurantSlug={context.data.restaurant.slug} />;
 *   }
 */
export default function QrPage() {
  redirect("/admin/items");
}
