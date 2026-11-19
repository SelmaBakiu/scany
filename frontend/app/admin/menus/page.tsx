import { getMerchantContext } from "@/lib/admin";
import { MenuManager } from "@/components/admin/menu-manager";
import { Flash, SectionHeading } from "@/components/admin/ui";
import { DisplaySettings } from "@/components/admin/setting-switch";
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
      <div className="mb-5">
        <DisplaySettings
          showPhotos={context.data.restaurant.showPhotos}
          currencyConversionEnabled={context.data.restaurant.currencyConversionEnabled}
        />
      </div>
      <MenuManager data={context.data} />
    </>
  );
}
