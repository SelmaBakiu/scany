import { getMerchantContext } from "@/lib/admin";
import { ItemList, NewItemLink } from "@/components/admin/item-list";
import { Flash, SectionHeading } from "@/components/admin/ui";
import type { ActionKey } from "@/lib/admin-i18n";

export default async function ItemsPage({ searchParams }: PageProps<"/admin/items">) {
  const context = await getMerchantContext();
  if (context.status !== "ok") return null; // the layout has already explained why

  const params = await searchParams;
  const flash: ActionKey | null = params.lagret
    ? "itemSaved"
    : params.slettet
      ? "itemDeleted"
      : params.kopiert
        ? "itemCopied"
        : null;

  return (
    <>
      <SectionHeading titleKey="navItems" action={<NewItemLink />} />
      <Flash messageKey={flash} />
      <ItemList data={context.data} />
    </>
  );
}
