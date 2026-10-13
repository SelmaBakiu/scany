import { getMerchantContext } from "@/lib/admin";
import { ItemForm } from "@/components/admin/item-form";
import { SectionHeading } from "@/components/admin/ui";

export default async function NewItemPage() {
  const context = await getMerchantContext();
  if (context.status !== "ok") return null;

  return (
    <>
      <SectionHeading titleKey="newItem" />
      <ItemForm data={context.data} item={null} />
    </>
  );
}
