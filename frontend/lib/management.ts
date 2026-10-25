import "server-only";

import { createSupabaseAdminClient } from "./supabase/admin";
import { createSupabaseServerClient } from "./supabase/server";
import type { ManagedStore, StoreManagementData } from "./management-types";

export type PlatformAccess =
  | {
      status: "ok";
      userId: string;
      email: string;
      admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>;
    }
  | { status: "not-configured" }
  | { status: "signed-out" }
  | { status: "forbidden"; email: string }
  | { status: "service-key-missing"; email: string }
  | { status: "error"; email: string; message: string };

/** Secure authorization gate shared by the page data and every mutation. */
export async function getPlatformAccess(): Promise<PlatformAccess> {
  const sessionClient = await createSupabaseServerClient();
  if (!sessionClient) return { status: "not-configured" };

  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) return { status: "signed-out" };

  const email = user.email ?? "";
  const { data, error } = await sessionClient
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { status: "error", email, message: error.message };
  if (!data) return { status: "forbidden", email };

  const admin = createSupabaseAdminClient();
  if (!admin) return { status: "service-key-missing", email };

  return { status: "ok", userId: user.id, email, admin };
}

export type StoreManagementResult =
  | { status: "ok"; email: string; data: StoreManagementData }
  | Exclude<PlatformAccess, { status: "ok" }>;

/** Returns a minimal DTO; auth user IDs and all privileged client data stay server-side. */
export async function getStoreManagementData(): Promise<StoreManagementResult> {
  const access = await getPlatformAccess();
  if (access.status !== "ok") return access;

  const { admin } = access;
  const [storesResult, membersResult, currenciesResult, localesResult] = await Promise.all([
    admin
      .from("restaurants")
      .select("id, name, slug, base_currency, default_locale, is_published")
      .order("name"),
    admin.from("restaurant_members").select("restaurant_id, user_id, role").eq("role", "owner"),
    admin.from("currencies").select("code").order("code"),
    admin.from("locales").select("code, native_label").order("code"),
  ]);

  const failed = [storesResult, membersResult, currenciesResult, localesResult].find((r) => r.error);
  if (failed?.error) {
    return { status: "error", email: access.email, message: failed.error.message };
  }

  const ownerByStore = new Map<string, string>();
  for (const membership of membersResult.data ?? []) {
    if (!ownerByStore.has(membership.restaurant_id as string)) {
      ownerByStore.set(membership.restaurant_id as string, membership.user_id as string);
    }
  }

  const stores: ManagedStore[] = await Promise.all(
    (storesResult.data ?? []).map(async (store) => {
      const ownerId = ownerByStore.get(store.id as string);
      const owner = ownerId ? await admin.auth.admin.getUserById(ownerId) : null;
      return {
        id: store.id as string,
        name: store.name as string,
        slug: store.slug as string,
        baseCurrency: store.base_currency as string,
        defaultLocale: store.default_locale as string,
        isPublished: Boolean(store.is_published),
        ownerEmail: owner?.data.user?.email ?? "",
      };
    }),
  );

  return {
    status: "ok",
    email: access.email,
    data: {
      stores,
      currencies: (currenciesResult.data ?? []).map((row) => ({
        value: row.code as string,
        label: row.code as string,
      })),
      locales: (localesResult.data ?? []).map((row) => ({
        value: row.code as string,
        label: `${row.native_label as string} (${row.code as string})`,
      })),
    },
  };
}
