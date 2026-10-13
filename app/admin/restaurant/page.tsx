import { getMerchantContext } from "@/lib/admin";
import { RestaurantForm } from "@/components/admin/restaurant-form";
import { SectionHeading } from "@/components/admin/ui";

export default async function RestaurantPage() {
  const context = await getMerchantContext();
  if (context.status !== "ok") return null;

  return (
    <>
      <SectionHeading titleKey="navRestaurant" />
      <RestaurantForm restaurant={context.data.restaurant} />
    </>
  );
}
