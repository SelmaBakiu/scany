import { getMerchantContext } from "@/lib/admin";
import { CategoryManager } from "@/components/admin/category-manager";
import { Flash, SectionHeading } from "@/components/admin/ui";

export default async function CategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  const context = await getMerchantContext();
  if (context.status !== "ok") return null;
  const params = await searchParams;

  return (
    <>
      <SectionHeading titleKey="navCategories" />
      <Flash messageKey={params.slettet ? "categoryDeleted" : null} />
      <CategoryManager data={context.data} />
    </>
  );
}
