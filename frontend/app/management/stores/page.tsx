import { StoreManager } from "@/components/management/store-manager";
import { getStoreManagementData } from "@/lib/management";

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const result = await getStoreManagementData();
  if (result.status !== "ok") return null;

  const params = await searchParams;
  return (
    <StoreManager
      stores={result.data.stores}
      currencies={result.data.currencies}
      locales={result.data.locales}
      deleted={params.deleted === "1"}
      deleteFailed={params.error === "delete"}
    />
  );
}
