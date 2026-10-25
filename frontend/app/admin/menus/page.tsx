import { getMerchantContext } from "@/lib/admin";
import { MenuManager } from "@/components/admin/menu-manager";
import { Flash, SectionHeading } from "@/components/admin/ui";
import type { ActionKey } from "@/lib/admin-i18n";

export default async function MenusPage({ searchParams }: PageProps<"/admin/menus">) {
  const context = await getMerchantContext();
  if (context.status !== "ok") return null;
  const params = await searchParams;

  const flash: ActionKey | null = params.lagret
    ? "menuActivated"
    : params.slettet
      ? "menuDeleted"
      : params.feil === "aktiv"
        ? "menuActiveCannotDelete"
        : null;

  return (
    <>
      <SectionHeading titleKey="navMenus" />
      <Flash messageKey={flash} />
      <MenuManager data={context.data} />
    </>
  );
}
