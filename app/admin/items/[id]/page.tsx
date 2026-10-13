import { getMerchantContext } from "@/lib/admin";
import { ItemForm } from "@/components/admin/item-form";
import { Flash, SectionHeading } from "@/components/admin/ui";

export default async function EditItemPage({ params, searchParams }: PageProps<"/admin/items/[id]">) {
  const context = await getMerchantContext();
  if (context.status !== "ok") return null;

  const { id } = await params;
  const query = await searchParams;
  const item = context.data.items.find((candidate) => candidate.id === id);

  if (!item) {
    return <SectionHeading titleKey="itemNotFound" />;
  }

  return (
    <>
      {/* The dish's own name, so NOT translated — it is the merchant's text. */}
      <SectionHeading title={item.text.nb?.name ?? item.slug} />
      <Flash messageKey={query.kopiert ? "itemCopiedMakeAvailable" : null} />
      <ItemForm data={context.data} item={item} />
    </>
  );
}
