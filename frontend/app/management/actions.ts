"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlatformAccess } from "@/lib/management";
import type { ManagementActionState } from "@/lib/management-types";
import { slugify } from "@/lib/slug";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const checked = (form: FormData, key: string) => form.get(key) === "on";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (message: string): ManagementActionState => ({ ok: false, message });
const done = (message: string): ManagementActionState => ({ ok: true, message });

function defaultMenuName(locale: string): string {
  if (locale === "nb") return "Meny";
  if (locale === "it") return "Menù";
  if (locale === "zh-CN") return "菜单";
  return "Menu";
}

async function removeProvisionedStore(
  admin: SupabaseClient,
  restaurantId: string | null,
  userId: string,
) {
  if (restaurantId) await admin.from("restaurants").delete().eq("id", restaurantId);
  await admin.auth.admin.deleteUser(userId);
}

export async function saveStore(
  _previous: ManagementActionState,
  form: FormData,
): Promise<ManagementActionState> {
  const access = await getPlatformAccess();
  if (access.status !== "ok") return fail("You are not authorized to manage stores.");

  const { admin } = access;
  const id = text(form, "id");
  const name = text(form, "name").slice(0, 120);
  const slug = slugify(text(form, "slug") || name);
  const ownerEmail = text(form, "ownerEmail").toLowerCase();
  const password = String(form.get("password") ?? "");
  const baseCurrency = text(form, "baseCurrency");
  const defaultLocale = text(form, "defaultLocale");
  const isPublished = checked(form, "isPublished");

  if (name.length < 2) return fail("Store name must contain at least 2 characters.");
  if (!slug) return fail("Enter a URL slug for the store.");
  if (!emailPattern.test(ownerEmail)) return fail("Enter a valid owner email address.");
  if ((!id || password) && password.length < 8) {
    return fail("Passwords must contain at least 8 characters.");
  }

  const [currencyResult, localeResult, slugResult] = await Promise.all([
    admin.from("currencies").select("code").eq("code", baseCurrency).maybeSingle(),
    admin.from("locales").select("code").eq("code", defaultLocale).maybeSingle(),
    id
      ? admin.from("restaurants").select("id").eq("slug", slug).neq("id", id).maybeSingle()
      : admin.from("restaurants").select("id").eq("slug", slug).maybeSingle(),
  ]);

  if (!currencyResult.data) return fail("Choose a valid base currency.");
  if (!localeResult.data) return fail("Choose a valid default language.");
  if (slugResult.data) return fail(`The menu address /m/${slug} is already in use.`);

  if (!id) {
    const { data: createdUser, error: userError } = await admin.auth.admin.createUser({
      email: ownerEmail,
      password,
      email_confirm: true,
      user_metadata: { role: "store_owner", store_name: name },
    });
    if (userError || !createdUser.user) return fail(userError?.message ?? "Could not create owner.");

    const userId = createdUser.user.id;
    let restaurantId: string | null = null;

    const { data: restaurant, error: restaurantError } = await admin
      .from("restaurants")
      .insert({
        name,
        slug,
        base_currency: baseCurrency,
        default_locale: defaultLocale,
        is_published: isPublished,
        ordering_enabled: true,
        theme: "lys",
        email: ownerEmail,
      })
      .select("id")
      .single();

    if (restaurantError || !restaurant) {
      await removeProvisionedStore(admin, null, userId);
      return fail(restaurantError?.message ?? "Could not create store.");
    }
    restaurantId = restaurant.id as string;

    const localeCodes = [...new Set([defaultLocale, "en"])];
    const { error: memberError } = await admin.from("restaurant_members").insert({
      restaurant_id: restaurantId,
      user_id: userId,
      role: "owner",
    });
    const { error: localesError } = await admin.from("restaurant_locales").insert(
      localeCodes.map((locale) => ({ restaurant_id: restaurantId, locale })),
    );
    const { error: descriptionsError } = await admin.from("restaurant_translations").insert(
      localeCodes.map((locale) => ({ restaurant_id: restaurantId, locale, description: "" })),
    );
    const { data: menu, error: menuError } = await admin
      .from("menus")
      .insert({ restaurant_id: restaurantId, slug: "main", sort_order: 0, is_active: true })
      .select("id")
      .single();

    const setupError = memberError ?? localesError ?? descriptionsError ?? menuError;
    if (setupError || !menu) {
      await removeProvisionedStore(admin, restaurantId, userId);
      return fail(setupError?.message ?? "Could not prepare the store menu.");
    }

    const { error: menuTextError } = await admin.from("menu_translations").insert(
      localeCodes.map((locale) => ({
        menu_id: menu.id,
        locale,
        name: defaultMenuName(locale),
      })),
    );
    if (menuTextError) {
      await removeProvisionedStore(admin, restaurantId, userId);
      return fail(menuTextError.message);
    }

    revalidatePath("/management/stores");
    revalidatePath(`/m/${slug}`, "layout");
    return done(`Store created. Its menu is available at /m/${slug}.`);
  }

  const { data: existing, error: existingError } = await admin
    .from("restaurants")
    .select("id, slug")
    .eq("id", id)
    .maybeSingle();
  if (existingError || !existing) return fail(existingError?.message ?? "Store not found.");

  const { data: membership, error: membershipError } = await admin
    .from("restaurant_members")
    .select("user_id")
    .eq("restaurant_id", id)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();
  if (membershipError) return fail(membershipError.message);

  let ownerId = membership?.user_id as string | undefined;
  let createdOwner = false;
  if (!ownerId) {
    if (!password) return fail("Set a password to create this store's owner account.");
    const { data: newOwner, error: newOwnerError } = await admin.auth.admin.createUser({
      email: ownerEmail,
      password,
      email_confirm: true,
      user_metadata: { role: "store_owner", store_name: name },
    });
    if (newOwnerError || !newOwner.user) {
      return fail(newOwnerError?.message ?? "Could not create owner.");
    }
    ownerId = newOwner.user.id;
    createdOwner = true;
    const { error: linkError } = await admin.from("restaurant_members").insert({
      restaurant_id: id,
      user_id: ownerId,
      role: "owner",
    });
    if (linkError) {
      await admin.auth.admin.deleteUser(ownerId);
      return fail(linkError.message);
    }
  } else {
    const attributes: { email: string; password?: string; email_confirm: boolean } = {
      email: ownerEmail,
      email_confirm: true,
    };
    if (password) attributes.password = password;
    const { error: ownerError } = await admin.auth.admin.updateUserById(ownerId, attributes);
    if (ownerError) return fail(ownerError.message);
  }

  const { error: storeError } = await admin
    .from("restaurants")
    .update({
      name,
      slug,
      base_currency: baseCurrency,
      default_locale: defaultLocale,
      is_published: isPublished,
      email: ownerEmail,
    })
    .eq("id", id);

  if (storeError) {
    if (createdOwner && ownerId) {
      await admin.from("restaurant_members").delete().eq("restaurant_id", id).eq("user_id", ownerId);
      await admin.auth.admin.deleteUser(ownerId);
    }
    return fail(storeError.message);
  }

  const { data: offeredLocale } = await admin
    .from("restaurant_locales")
    .select("locale")
    .eq("restaurant_id", id)
    .eq("locale", defaultLocale)
    .maybeSingle();
  if (!offeredLocale) {
    await admin.from("restaurant_locales").insert({ restaurant_id: id, locale: defaultLocale });
  }

  revalidatePath("/management/stores");
  revalidatePath(`/m/${existing.slug}`, "layout");
  revalidatePath(`/m/${slug}`, "layout");
  return done(`Store updated. Its menu is available at /m/${slug}.`);
}

export async function deleteStore(form: FormData): Promise<void> {
  const access = await getPlatformAccess();
  if (access.status !== "ok") redirect("/admin/login?next=/management/stores");

  const id = text(form, "id");
  if (!id) redirect("/management/stores?error=delete");

  const { admin } = access;
  const [{ data: store, error: storeLookupError }, { data: membership, error: memberLookupError }] =
    await Promise.all([
      admin.from("restaurants").select("slug").eq("id", id).maybeSingle(),
      admin
        .from("restaurant_members")
        .select("user_id")
        .eq("restaurant_id", id)
        .eq("role", "owner")
        .limit(1)
        .maybeSingle(),
    ]);

  if (storeLookupError || memberLookupError || !store) {
    redirect("/management/stores?error=delete");
  }

  const { data: files } = await admin.storage.from("menu-images").list(id, { limit: 1000 });
  if (files?.length) {
    await admin.storage.from("menu-images").remove(files.map((file) => `${id}/${file.name}`));
  }

  const { error: deleteError } = await admin.from("restaurants").delete().eq("id", id);
  if (deleteError) {
    redirect("/management/stores?error=delete");
  }

  const ownerId = membership?.user_id as string | undefined;
  if (ownerId && ownerId !== access.userId) {
    const [{ count: otherStores }, { data: platformAdmin }] = await Promise.all([
      admin
        .from("restaurant_members")
        .select("restaurant_id", { count: "exact", head: true })
        .eq("user_id", ownerId),
      admin.from("platform_admins").select("user_id").eq("user_id", ownerId).maybeSingle(),
    ]);
    if ((otherStores ?? 0) === 0 && !platformAdmin) {
      await admin.auth.admin.deleteUser(ownerId);
    }
  }

  revalidatePath("/management/stores");
  revalidatePath(`/m/${store.slug}`, "layout");
  redirect("/management/stores?deleted=1");
}
