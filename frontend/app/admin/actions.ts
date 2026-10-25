"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify, uniqueSlug } from "@/lib/slug";
import { EDITABLE_LOCALES, type ActionResult } from "@/lib/admin-types";
import type { ActionKey } from "@/lib/admin-i18n";
import { generateFoodImage, imagePathFor, promptForItem } from "@/lib/ai-image.mjs";
import { isThemeId } from "@/lib/themes";

/**
 * Every merchant write in the app.
 *
 * Server actions rather than API routes: the form posts straight to the
 * function, there is no fetch wrapper to keep in sync, and `revalidatePath`
 * at the end is what makes the diner's menu show the change immediately
 * instead of up to a minute later.
 *
 * None of these check ownership. That is deliberate — the row level security
 * policies in schema.sql do it, inside the database, for every statement.
 * A check here as well would be a second place to get it wrong, and would hide
 * a broken policy rather than expose it.
 */

const IMAGE_BUCKET = "menu-images";

type Ctx = {
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
  restaurantId: string;
  slug: string;
};

async function context(): Promise<Ctx | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("restaurant_members")
    .select("restaurant_id")
    .limit(1)
    .maybeSingle();
  if (!membership) return null;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", membership.restaurant_id)
    .single();

  return {
    supabase,
    restaurantId: membership.restaurant_id as string,
    slug: (restaurant?.slug as string) ?? "",
  };
}

/** Refresh both the admin and the diner's menu after a change. */
function refresh(ctx: Ctx) {
  revalidatePath("/admin", "layout");
  if (ctx.slug) revalidatePath(`/m/${ctx.slug}`, "layout");
}

/**
 * Results are KEYS, not sentences.
 *
 * These functions run on the server; the merchant's admin language is a
 * browser preference the server cannot see. The form looks the key up in
 * lib/admin-i18n.ts. `detail` carries a raw Postgres message when there is
 * one — untranslated, because an exact error is more use than a vague
 * translated one.
 */
const fail = (key: ActionKey, detail?: string): ActionResult => ({ ok: false, key, detail });
const done = (key: ActionKey = "saved"): ActionResult => ({ ok: true, key });

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const flag = (form: FormData, key: string) => form.get(key) === "on" || form.get(key) === "true";

/** "189", "189,50" and "189.50" all mean the same thing to a Norwegian merchant. */
function parsePrice(raw: string): number | null {
  const normalised = raw.replace(/\s/g, "").replace(",", ".");
  const value = Number(normalised);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

// ===========================================================================
// Auth
// ===========================================================================

export async function signIn(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("supabaseMissing");

  const email = text(form, "email");
  const password = String(form.get("password") ?? "");
  if (!email || !password) return fail("missingCredentials");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Deliberately vague: saying which half was wrong tells an attacker which
  // email addresses exist.
  if (error) return fail("badCredentials");

  const next = text(form, "next");
  redirect(next.startsWith("/admin") || next.startsWith("/management") ? next : "/admin/items");
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

// ===========================================================================
// Items
// ===========================================================================

async function uploadImage(ctx: Ctx, file: File, prefix: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${ctx.restaurantId}/${prefix}-${Date.now()}.${extension || "jpg"}`;
  const { error } = await ctx.supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) return null;
  return path;
}

export async function saveItem(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await context();
  if (!ctx) return fail("notSignedIn");

  const id = text(form, "id");
  const categoryId = text(form, "categoryId");
  const priceMinor = parsePrice(text(form, "price"));
  const nbName = text(form, "nb_name");

  if (!nbName) return fail("itemNeedsName");
  if (!categoryId) return fail("itemNeedsCategory");
  if (priceMinor === null) return fail("priceMustBeNumber");

  const isAvailable = flag(form, "isAvailable");
  const isFeatured = flag(form, "isFeatured");
  const sortOrder = Number(text(form, "sortOrder")) || 0;

  const file = form.get("image");
  const uploadedPath = file instanceof File ? await uploadImage(ctx, file, "item") : null;

  let itemId = id;

  if (id) {
    const patch: Record<string, unknown> = {
      category_id: categoryId,
      price_minor: priceMinor,
      is_available: isAvailable,
      is_featured: isFeatured,
      sort_order: sortOrder,
      image_prompt: text(form, "imagePrompt"),
      updated_at: new Date().toISOString(),
    };
    if (uploadedPath) patch.image_path = uploadedPath;
    if (flag(form, "removeImage")) patch.image_path = null;

    const { error } = await ctx.supabase.from("items").update(patch).eq("id", id);
    if (error) return fail("saveFailed", error.message);
  } else {
    const { data: existing } = await ctx.supabase.from("items").select("slug");
    const taken = new Set((existing ?? []).map((row) => row.slug as string));
    const slug = uniqueSlug(slugify(nbName), taken);

    const { data, error } = await ctx.supabase
      .from("items")
      .insert({
        restaurant_id: ctx.restaurantId,
        category_id: categoryId,
        image_prompt: text(form, "imagePrompt"),
        slug,
        price_minor: priceMinor,
        image_path: uploadedPath,
        is_available: isAvailable,
        is_featured: isFeatured,
        sort_order: sortOrder,
      })
      .select("id")
      .single();

    if (error || !data) return fail("createFailed", error?.message);
    itemId = data.id as string;
  }

  // Only the languages the form edits are touched. Albanian and Italian rows
  // stay exactly as they were — an admin that cannot show a language must not
  // silently wipe it.
  const translations = EDITABLE_LOCALES.map((locale) => ({
    item_id: itemId,
    locale,
    name: text(form, `${locale}_name`) || nbName,
    description: text(form, `${locale}_description`),
    description_long: text(form, `${locale}_descriptionLong`),
    ingredients: text(form, `${locale}_ingredients`),
  }));

  const { error: translationError } = await ctx.supabase
    .from("item_translations")
    .upsert(translations, { onConflict: "item_id,locale" });
  if (translationError) return fail("textSaveFailed", translationError.message);

  // Tags are replaced wholesale: simpler, and correct when one is unticked.
  const tagIds = form.getAll("tag").map(String).filter(Boolean);
  await ctx.supabase.from("item_tags").delete().eq("item_id", itemId);
  if (tagIds.length > 0) {
    const { error: tagError } = await ctx.supabase
      .from("item_tags")
      .insert(tagIds.map((tagId) => ({ item_id: itemId, tag_id: tagId })));
    if (tagError) return fail("tagSaveFailed", tagError.message);
  }

  refresh(ctx);
  if (!id) redirect("/admin/items?lagret=1");
  return done();
}

/**
 * Generate one dish photo with AI and save it, on the spot.
 *
 * Called directly from the client component rather than through a <form>: the
 * button lives inside the item form, and a nested form is invalid HTML. Server
 * actions are callable as plain async functions, which sidesteps that without
 * restructuring the page.
 *
 * The name and description are passed in from the live form fields rather than
 * read back from the database, so a merchant can type a new dish, generate a
 * picture of it, and save everything together. The picture itself IS saved
 * immediately — generation takes half a minute and losing it to a mistyped
 * price would be rude.
 */
export async function generateItemImage(itemId: string): Promise<ActionResult> {
  const ctx = await context();
  if (!ctx) return fail("notSignedIn");

  /*
   * The dish's own saved text, not whatever is on screen.
   *
   * It used to take the name and description as arguments from the form, which
   * meant the picture was generated from unsaved edits — and, worse, from the
   * NORWEGIAN fields, which is what made every photo show the wrong dish. One
   * read here, one prompt builder, same answer as the batch script.
   */
  const { data: item } = await ctx.supabase
    .from("items")
    .select("slug, image_prompt, item_translations(locale, name, description)")
    .eq("id", itemId)
    .maybeSingle();
  if (!item) return fail("itemMissing");

  const translations = (item.item_translations ?? []) as {
    locale: string;
    name: string | null;
    description: string | null;
  }[];
  const at = (locale: string) => translations.find((t) => t.locale === locale);
  const en = at("en");
  const nb = at("nb");

  const { prompt } = promptForItem({
    imagePrompt: (item.image_prompt as string) ?? "",
    en: { name: en?.name ?? "", description: en?.description ?? "" },
    nb: { name: nb?.name ?? "", description: nb?.description ?? "" },
    slug: item.slug as string,
  });

  const slug = item.slug as string;

  // A fixed seed per dish, so pressing the button twice on an unchanged dish
  // gives the same picture. To get a different one, change the English text or
  // the image description — the prompt is the dial, not chance.
  const picture = await generateFoodImage("", "", slug, { prompt });
  if (!picture) return fail("imageGenerationFailed");

  const path = imagePathFor(ctx.restaurantId, slug, picture.contentType);
  const { error: uploadError } = await ctx.supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, picture.bytes, { contentType: picture.contentType, upsert: true });
  if (uploadError) return fail("imageUploadFailed", uploadError.message);

  const { error } = await ctx.supabase
    .from("items")
    .update({ image_path: path, updated_at: new Date().toISOString() })
    .eq("id", itemId);
  if (error) return fail("saveFailed", error.message);

  refresh(ctx);
  return {
    ok: true,
    key: "imageGenerated",
    imageUrl: ctx.supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl,
    detail: prompt,
  };
}

export async function deleteItem(form: FormData): Promise<void> {
  const ctx = await context();
  if (!ctx) return;
  await ctx.supabase.from("items").delete().eq("id", text(form, "id"));
  refresh(ctx);
  redirect("/admin/items?slettet=1");
}

export async function duplicateItem(form: FormData): Promise<void> {
  const ctx = await context();
  if (!ctx) return;

  const id = text(form, "id");
  const { data: original } = await ctx.supabase
    .from("items")
    .select(
      "category_id, price_minor, image_path, is_available, is_featured, sort_order, item_translations(locale, name, description, description_long, ingredients), item_tags(tag_id)",
    )
    .eq("id", id)
    .single();
  if (!original) return;

  const { data: existing } = await ctx.supabase.from("items").select("slug");
  const taken = new Set((existing ?? []).map((row) => row.slug as string));
  const nb = (original.item_translations ?? []).find(
    (t: { locale: string }) => t.locale === "nb",
  ) as { name?: string } | undefined;
  const slug = uniqueSlug(slugify(`${nb?.name ?? "rett"} kopi`), taken);

  const { data: copy, error } = await ctx.supabase
    .from("items")
    .insert({
      restaurant_id: ctx.restaurantId,
      category_id: original.category_id,
      slug,
      price_minor: original.price_minor,
      image_path: original.image_path,
      // A copy starts hidden. Duplicating is how you draft a variant, and a
      // half-edited duplicate should not appear on the menu in the meantime.
      is_available: false,
      is_featured: false,
      sort_order: (original.sort_order as number) + 1,
    })
    .select("id")
    .single();
  if (error || !copy) return;

  const rows = (original.item_translations ?? []) as {
    locale: string;
    name: string;
    description: string | null;
    description_long: string | null;
    ingredients: string | null;
  }[];
  if (rows.length > 0) {
    await ctx.supabase.from("item_translations").insert(
      rows.map((row) => ({
        item_id: copy.id,
        locale: row.locale,
        name: `${row.name} (kopi)`,
        description: row.description,
        description_long: row.description_long,
        ingredients: row.ingredients,
      })),
    );
  }

  const tags = (original.item_tags ?? []) as { tag_id: string }[];
  if (tags.length > 0) {
    await ctx.supabase
      .from("item_tags")
      .insert(tags.map((t) => ({ item_id: copy.id, tag_id: t.tag_id })));
  }

  refresh(ctx);
  redirect(`/admin/items/${copy.id}?kopiert=1`);
}

// ===========================================================================
// Categories
// ===========================================================================

export async function saveCategory(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await context();
  if (!ctx) return fail("notSignedIn");

  const id = text(form, "id");
  const menuId = text(form, "menuId");
  const nbName = text(form, "nb_name");
  if (!nbName) return fail("categoryNeedsName");
  if (!menuId) return fail("categoryNeedsMenu");

  let categoryId = id;

  if (id) {
    const { error } = await ctx.supabase
      .from("categories")
      .update({ menu_id: menuId, is_visible: flag(form, "isVisible") })
      .eq("id", id);
    if (error) return fail("saveFailed", error.message);
  } else {
    const { data: existing } = await ctx.supabase.from("categories").select("slug, sort_order");
    const taken = new Set((existing ?? []).map((row) => row.slug as string));
    const nextOrder =
      Math.max(0, ...(existing ?? []).map((row) => (row.sort_order as number) ?? 0)) + 10;

    const { data, error } = await ctx.supabase
      .from("categories")
      .insert({
        restaurant_id: ctx.restaurantId,
        menu_id: menuId,
        slug: uniqueSlug(slugify(nbName), taken),
        sort_order: nextOrder,
        is_visible: flag(form, "isVisible"),
      })
      .select("id")
      .single();
    if (error || !data) return fail("createFailed", error?.message);
    categoryId = data.id as string;
  }

  const { error: translationError } = await ctx.supabase.from("category_translations").upsert(
    EDITABLE_LOCALES.map((locale) => ({
      category_id: categoryId,
      locale,
      name: text(form, `${locale}_name`) || nbName,
    })),
    { onConflict: "category_id,locale" },
  );
  if (translationError) return fail("nameSaveFailed", translationError.message);

  refresh(ctx);
  return done();
}

export async function deleteCategory(form: FormData): Promise<void> {
  const ctx = await context();
  if (!ctx) return;
  // The foreign key cascades to the dishes inside. The confirmation dialog
  // tells the merchant how many that is before they get here.
  await ctx.supabase.from("categories").delete().eq("id", text(form, "id"));
  refresh(ctx);
  redirect("/admin/categories?slettet=1");
}

export async function moveCategory(form: FormData): Promise<void> {
  const ctx = await context();
  if (!ctx) return;

  const id = text(form, "id");
  const direction = text(form, "direction") === "up" ? -1 : 1;

  const { data: all } = await ctx.supabase
    .from("categories")
    .select("id, sort_order, menu_id")
    .order("sort_order");
  if (!all) return;

  const current = all.find((c) => c.id === id);
  if (!current) return;

  // Swap with the neighbour inside the same menu — ordering is per menu, so
  // the category above may belong to a different one.
  const siblings = all.filter((c) => c.menu_id === current.menu_id);
  const index = siblings.findIndex((c) => c.id === id);
  const neighbour = siblings[index + direction];
  if (!neighbour) return;

  await ctx.supabase
    .from("categories")
    .update({ sort_order: neighbour.sort_order })
    .eq("id", current.id);
  await ctx.supabase
    .from("categories")
    .update({ sort_order: current.sort_order })
    .eq("id", neighbour.id);

  refresh(ctx);
}

export async function toggleCategoryVisible(form: FormData): Promise<void> {
  const ctx = await context();
  if (!ctx) return;
  await ctx.supabase
    .from("categories")
    .update({ is_visible: text(form, "visible") === "true" })
    .eq("id", text(form, "id"));
  refresh(ctx);
}

// ===========================================================================
// Menus
// ===========================================================================

export async function saveMenu(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await context();
  if (!ctx) return fail("notSignedIn");

  const id = text(form, "id");
  const nbName = text(form, "nb_name");
  if (!nbName) return fail("menuNeedsName");

  let menuId = id;

  if (!id) {
    const { data: existing } = await ctx.supabase.from("menus").select("slug, sort_order");
    const taken = new Set((existing ?? []).map((row) => row.slug as string));
    const nextOrder =
      Math.max(0, ...(existing ?? []).map((row) => (row.sort_order as number) ?? 0)) + 10;

    const { data, error } = await ctx.supabase
      .from("menus")
      .insert({
        restaurant_id: ctx.restaurantId,
        slug: uniqueSlug(slugify(nbName), taken),
        sort_order: nextOrder,
        // Never active on creation: switching the live menu is its own,
        // deliberate button.
        is_active: false,
      })
      .select("id")
      .single();
    if (error || !data) return fail("createFailed", error?.message);
    menuId = data.id as string;
  }

  const { error: translationError } = await ctx.supabase.from("menu_translations").upsert(
    EDITABLE_LOCALES.map((locale) => ({
      menu_id: menuId,
      locale,
      name: text(form, `${locale}_name`) || nbName,
    })),
    { onConflict: "menu_id,locale" },
  );
  if (translationError) return fail("nameSaveFailed", translationError.message);

  refresh(ctx);
  return done();
}

export async function activateMenu(form: FormData): Promise<void> {
  const ctx = await context();
  if (!ctx) return;

  // Clear first, then set. The partial unique index in schema.sql allows zero
  // active menus but never two, so doing it the other way round would be
  // rejected outright.
  await ctx.supabase
    .from("menus")
    .update({ is_active: false })
    .eq("restaurant_id", ctx.restaurantId);
  await ctx.supabase.from("menus").update({ is_active: true }).eq("id", text(form, "id"));

  refresh(ctx);
  redirect("/admin/menus?lagret=1");
}

export async function deleteMenu(form: FormData): Promise<void> {
  const ctx = await context();
  if (!ctx) return;

  const id = text(form, "id");
  const { data: menu } = await ctx.supabase.from("menus").select("is_active").eq("id", id).single();
  // Refuse to delete the live menu: the diner would get an empty page.
  if (menu?.is_active) redirect("/admin/menus?feil=aktiv");

  await ctx.supabase.from("menus").delete().eq("id", id);
  refresh(ctx);
  redirect("/admin/menus?slettet=1");
}

// ===========================================================================
// Theme and restaurant details
// ===========================================================================

export async function saveTheme(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await context();
  if (!ctx) return fail("notSignedIn");

  const theme = text(form, "theme");
  if (!isThemeId(theme)) return fail("unknownTheme");

  const { error } = await ctx.supabase
    .from("restaurants")
    .update({ theme })
    .eq("id", ctx.restaurantId);
  if (error) return fail("saveFailed", error.message);

  refresh(ctx);
  return done("themeSaved");
}

export async function saveRestaurant(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await context();
  if (!ctx) return fail("notSignedIn");

  const name = text(form, "name");
  if (!name) return fail("restaurantNeedsName");

  const openingHours = Array.from({ length: 7 }, (_, day) => ({
    day,
    closed: flag(form, `day_${day}_closed`),
    open: text(form, `day_${day}_open`),
    close: text(form, `day_${day}_close`),
  }));

  const socials = [0, 1, 2, 3]
    .map((i) => ({ label: text(form, `social_${i}_label`), url: text(form, `social_${i}_url`) }))
    .filter((s) => s.label && s.url);

  const file = form.get("logo");
  const logoPath = file instanceof File ? await uploadImage(ctx, file, "logo") : null;

  const patch: Record<string, unknown> = {
    name,
    address: text(form, "address"),
    phone: text(form, "phone"),
    email: text(form, "email"),
    maps_url: text(form, "mapsUrl"),
    timezone: text(form, "timezone") || "Europe/Oslo",
    socials,
    opening_hours: openingHours,
    // An unchecked checkbox is simply absent from the form data, which is
    // exactly what makes a plain `flag()` the right read here: absent means off.
    ordering_enabled: flag(form, "orderingEnabled"),
  };
  if (logoPath) patch.logo_path = logoPath;
  if (flag(form, "removeLogo")) patch.logo_path = null;

  const { error } = await ctx.supabase
    .from("restaurants")
    .update(patch)
    .eq("id", ctx.restaurantId);
  if (error) return fail("saveFailed", error.message);

  const { error: translationError } = await ctx.supabase.from("restaurant_translations").upsert(
    EDITABLE_LOCALES.map((locale) => ({
      restaurant_id: ctx.restaurantId,
      locale,
      description: text(form, `${locale}_description`),
    })),
    { onConflict: "restaurant_id,locale" },
  );
  if (translationError) return fail("descriptionSaveFailed", translationError.message);

  refresh(ctx);
  return done();
}

// ===========================================================================
// Orders
// ===========================================================================

/**
 * Move an order along. The only thing the merchant can change about an order.
 *
 * Note what is NOT here: no way to edit a line, a price or a total. An order
 * is a record of what a guest asked for and what it cost at the time; the
 * merchant accepts it, declines it, or cooks it. Changing the numbers after
 * the fact is how a receipt stops being evidence of anything.
 *
 * Ownership is not checked here either — `orders_member_update` in schema.sql
 * does it, and a stranger's update changes zero rows.
 */
export async function setOrderStatus(
  orderId: string,
  status: "accepted" | "declined" | "preparing" | "ready" | "completed",
  declineReason = "",
): Promise<ActionResult> {
  const ctx = await context();
  if (!ctx) return fail("notSignedIn");

  const patch: Record<string, unknown> = { status };
  // The reason belongs to the decline, so it is cleared on any other move —
  // otherwise an order declined, reinstated and completed still carries
  // "out of salmon" on the guest's screen.
  patch.decline_reason = status === "declined" ? declineReason.trim().slice(0, 300) : "";

  const { data, error } = await ctx.supabase
    .from("orders")
    .update(patch)
    .eq("id", orderId)
    .select("id")
    .maybeSingle();

  if (error) return fail("saveFailed", error.message);
  if (!data) return fail("orderNotFound");

  revalidatePath("/admin/orders");

  return {
    ok: true,
    key:
      status === "accepted"
        ? "orderAccepted"
        : status === "declined"
          ? "orderDeclined"
          : status === "completed"
            ? "orderCompleted"
            : "orderUpdated",
  };
}

/** The master switch on the Restaurant page. */
export async function setOrderingEnabled(enabled: boolean): Promise<ActionResult> {
  const ctx = await context();
  if (!ctx) return fail("notSignedIn");

  const { error } = await ctx.supabase
    .from("restaurants")
    .update({ ordering_enabled: enabled })
    .eq("id", ctx.restaurantId);

  if (error) return fail("saveFailed", error.message);

  refresh(ctx);
  return { ok: true, key: enabled ? "orderingTurnedOn" : "orderingTurnedOff" };
}
