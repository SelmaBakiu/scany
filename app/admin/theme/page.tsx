import { getMerchantContext } from "@/lib/admin";
import { ThemePicker } from "@/components/admin/theme-picker";
import { SectionHeading } from "@/components/admin/ui";

export default async function ThemePage() {
  const context = await getMerchantContext();
  if (context.status !== "ok") return null;

  return (
    <>
      <SectionHeading titleKey="navTheme" />
      <ThemePicker current={context.data.restaurant.theme} name={context.data.restaurant.name} />
    </>
  );
}
