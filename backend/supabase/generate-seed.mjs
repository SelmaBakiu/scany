/**
 * Turns supabase/menu-data.mjs into supabase/seed.sql.
 *
 *     node supabase/generate-seed.mjs
 *
 * Edit the data file, run this, paste the SQL into the Supabase SQL editor.
 * It refuses to write anything if a translation is missing, so a half-translated
 * dish fails here rather than showing up blank in front of a diner.
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES, CURRENCIES, LOCALES, RESTAURANT, TAGS } from "./menu-data.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const LOCALE_CODES = LOCALES.map((l) => l.code);

/** Single-quote a string for SQL by doubling any apostrophes inside it. */
const q = (value) => `'${String(value).replace(/'/g, "''")}'`;

// ---------------------------------------------------------------------------
// Validate before writing a single line
// ---------------------------------------------------------------------------

const problems = [];
const tagSlugs = new Set(TAGS.map((t) => t.slug));
const seenItemSlugs = new Set();

for (const tag of TAGS) {
  for (const code of LOCALE_CODES) {
    if (!tag.l[code]) problems.push(`tag "${tag.slug}" has no ${code} label`);
  }
}

for (const category of CATEGORIES) {
  for (const code of LOCALE_CODES) {
    if (!category.names[code]) problems.push(`category "${category.slug}" has no ${code} name`);
  }

  for (const item of category.items) {
    if (seenItemSlugs.has(item.slug)) problems.push(`duplicate item slug "${item.slug}"`);
    seenItemSlugs.add(item.slug);

    if (!Number.isInteger(item.price) || item.price <= 0) {
      problems.push(`item "${item.slug}" has a bad price: ${item.price}`);
    }
    for (const tag of item.tags ?? []) {
      if (!tagSlugs.has(tag)) problems.push(`item "${item.slug}" uses unknown tag "${tag}"`);
    }
    for (const code of LOCALE_CODES) {
      const t = item.t[code];
      if (!t) {
        problems.push(`item "${item.slug}" has no ${code} translation`);
        continue;
      }
      for (const field of ["n", "s", "l", "i"]) {
        if (!t[field] || !String(t[field]).trim()) {
          problems.push(`item "${item.slug}" (${code}) is missing "${field}"`);
        }
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`Refusing to generate — ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  • ${p}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Build the SQL
// ---------------------------------------------------------------------------

const itemCount = CATEGORIES.reduce((n, c) => n + c.items.length, 0);
const out = [];
const w = (line = "") => out.push(line);

w("-- ============================================================================");
w("-- MenuScan — seed data");
w("--");
w("-- GENERATED FILE. Do not edit by hand.");
w("--   edit  supabase/menu-data.mjs");
w("--   then  node supabase/generate-seed.mjs");
w("--");
w(`-- ${CATEGORIES.length} categories, ${itemCount} items, ${LOCALE_CODES.length} languages (${LOCALE_CODES.join(", ")}).`);
w("-- Run AFTER schema.sql. Safe to re-run: every statement upserts.");
w("--");
w("-- The dish names, descriptions and prices are placeholders. The exchange");
w("-- rates are placeholders too, not live rates. Replace both before this goes");
w("-- in front of customers.");
w("-- ============================================================================");
w();

// -- currencies
w("insert into public.currencies (code, symbol, decimals, rate_per_eur) values");
w(
  CURRENCIES.map((c) => `  (${q(c.code)}, ${q(c.symbol)}, ${c.decimals}, ${c.ratePerEur.toFixed(8)})`).join(",\n") + "\non conflict (code) do update",
);
w("  set symbol = excluded.symbol, decimals = excluded.decimals;");
w("  -- rate_per_eur deliberately not overwritten, so re-running the seed does");
w("  -- not stomp rates a scheduled job has since refreshed.");
w();

// -- locales
w("insert into public.locales (code, label, native_label) values");
w(
  LOCALES.map((l) => `  (${q(l.code)}, ${q(l.label)}, ${q(l.native)})`).join(",\n") + "\non conflict (code) do update",
);
w("  set label = excluded.label, native_label = excluded.native_label;");
w();

// -- tags
w("insert into public.tags (slug, kind, sort_order) values");
w(
  TAGS.map((t) => `  (${q(t.slug)}, ${q(t.kind)}, ${t.order})`).join(",\n") + "\non conflict (slug) do update set kind = excluded.kind, sort_order = excluded.sort_order;",
);
w();

w("insert into public.tag_translations (tag_id, locale, label)");
w("select t.id, v.locale, v.label");
w("from (values");
w(
  TAGS.flatMap((t) => LOCALE_CODES.map((code) => `  (${q(t.slug)}, ${q(code)}, ${q(t.l[code])})`)).join(",\n"),
);
w(") as v(tag_slug, locale, label)");
w("join public.tags t on t.slug = v.tag_slug");
w("on conflict (tag_id, locale) do update set label = excluded.label;");
w();

// -- restaurant
w("insert into public.restaurants (slug, name, base_currency, default_locale, is_published,");
w("  theme, address, phone, email, maps_url, timezone, socials, opening_hours)");
w(`values (${q(RESTAURANT.slug)}, ${q(RESTAURANT.name)}, ${q(RESTAURANT.baseCurrency)}, ${q(RESTAURANT.defaultLocale)}, true,`);
w(
  `  ${q(RESTAURANT.theme)}, ${q(RESTAURANT.address)}, ${q(RESTAURANT.phone)}, ${q(RESTAURANT.email)}, ` +
    `${q(RESTAURANT.mapsUrl)}, ${q(RESTAURANT.timezone)}, ${q(JSON.stringify(RESTAURANT.socials))}::jsonb, ` +
    `${q(JSON.stringify(RESTAURANT.openingHours))}::jsonb)`,
);
w("on conflict (slug) do update");
w("  set name = excluded.name,");
w("      base_currency = excluded.base_currency,");
w("      default_locale = excluded.default_locale,");
w("      is_published = excluded.is_published;");
w("      -- theme and the contact details are deliberately NOT overwritten:");
w("      -- re-running the seed must not undo what the merchant edited.");
w();

w("insert into public.restaurant_translations (restaurant_id, locale, description)");
w("select r.id, v.locale, v.description");
w("from (values");
w(
  LOCALE_CODES.map((code) => `  (${q(code)}, ${q(RESTAURANT.description[code] ?? "")})`).join(",\n"),
);
w(") as v(locale, description)");
w(`join public.restaurants r on r.slug = ${q(RESTAURANT.slug)}`);
w("on conflict (restaurant_id, locale) do nothing;");
w("  -- do nothing, not do update: the merchant owns this text once they edit it.");
w();

w("insert into public.restaurant_locales (restaurant_id, locale)");
w("select r.id, v.locale");
w(`from (values ${LOCALE_CODES.map((c) => `(${q(c)})`).join(", ")}) as v(locale)`);
w("cross join public.restaurants r");
w(`where r.slug = ${q(RESTAURANT.slug)}`);
w("on conflict do nothing;");
w();

// -- menu
w("insert into public.menus (restaurant_id, slug, sort_order, is_active)");
w(`select r.id, 'dinner', 0, true from public.restaurants r where r.slug = ${q(RESTAURANT.slug)}`);
w("on conflict (restaurant_id, slug) do update set is_active = excluded.is_active;");
w();

const MENU_NAMES = { nb: "Meny", en: "Menu", sq: "Menu", it: "Menu" };
w("insert into public.menu_translations (menu_id, locale, name)");
w("select m.id, v.locale, v.name");
w("from (values");
w(LOCALE_CODES.map((code) => `  (${q(code)}, ${q(MENU_NAMES[code] ?? "Menu")})`).join(",\n"));
w(") as v(locale, name)");
w("join public.menus m on m.slug = 'dinner'");
w(`join public.restaurants r on r.id = m.restaurant_id and r.slug = ${q(RESTAURANT.slug)}`);
w("on conflict (menu_id, locale) do update set name = excluded.name;");
w();

// -- categories
w("insert into public.categories (restaurant_id, menu_id, slug, sort_order)");
w("select r.id, m.id, v.slug, v.sort_order");
w("from (values");
w(CATEGORIES.map((c) => `  (${q(c.slug)}, ${c.order})`).join(",\n"));
w(") as v(slug, sort_order)");
w(`join public.restaurants r on r.slug = ${q(RESTAURANT.slug)}`);
w("join public.menus m on m.restaurant_id = r.id and m.slug = 'dinner'");
w("on conflict (restaurant_id, slug) do update set sort_order = excluded.sort_order;");
w();

w("insert into public.category_translations (category_id, locale, name)");
w("select c.id, v.locale, v.name");
w("from (values");
w(
  CATEGORIES.flatMap((c) => LOCALE_CODES.map((code) => `  (${q(c.slug)}, ${q(code)}, ${q(c.names[code])})`)).join(",\n"),
);
w(") as v(cat_slug, locale, name)");
w("join public.categories c on c.slug = v.cat_slug");
w(`join public.restaurants r on r.id = c.restaurant_id and r.slug = ${q(RESTAURANT.slug)}`);
w("on conflict (category_id, locale) do update set name = excluded.name;");
w();

// -- items
w("-- price_minor is in øre: 18900 = kr 189,00");
w("insert into public.items (restaurant_id, category_id, slug, price_minor, is_available, is_featured, sort_order)");
w("select r.id, c.id, v.slug, v.price_minor, v.is_available, v.is_featured, v.sort_order");
w("from (values");
w(
  CATEGORIES.flatMap((category) =>
    category.items.map((item, index) =>
      `  (${q(item.slug)}, ${q(category.slug)}, ${item.price * 100}, ${item.available === false ? "false" : "true"}, ${item.featured ? "true" : "false"}, ${(index + 1) * 10})`,
    ),
  ).join(",\n"),
);
w(") as v(slug, cat_slug, price_minor, is_available, is_featured, sort_order)");
w(`join public.restaurants r on r.slug = ${q(RESTAURANT.slug)}`);
w("join public.categories c on c.restaurant_id = r.id and c.slug = v.cat_slug");
w("on conflict (restaurant_id, slug) do update");
w("  set price_minor  = excluded.price_minor,");
w("      category_id  = excluded.category_id,");
w("      is_available = excluded.is_available,");
w("      is_featured  = excluded.is_featured,");
w("      sort_order   = excluded.sort_order,");
w("      updated_at   = now();");
w();

// -- item translations
w("insert into public.item_translations (item_id, locale, name, description, description_long, ingredients)");
w("select i.id, v.locale, v.name, v.description, v.description_long, v.ingredients");
w("from (values");
w(
  CATEGORIES.flatMap((category) =>
    category.items.flatMap((item) =>
      LOCALE_CODES.map((code) => {
        const t = item.t[code];
        return `  (${q(item.slug)}, ${q(code)}, ${q(t.n)}, ${q(t.s)}, ${q(t.l)}, ${q(t.i)})`;
      }),
    ),
  ).join(",\n"),
);
w(") as v(item_slug, locale, name, description, description_long, ingredients)");
w("join public.items i on i.slug = v.item_slug");
w(`join public.restaurants r on r.id = i.restaurant_id and r.slug = ${q(RESTAURANT.slug)}`);
w("on conflict (item_id, locale) do update");
w("  set name = excluded.name,");
w("      description = excluded.description,");
w("      description_long = excluded.description_long,");
w("      ingredients = excluded.ingredients;");
w();

// -- item tags
w("insert into public.item_tags (item_id, tag_id)");
w("select i.id, t.id");
w("from (values");
w(
  CATEGORIES.flatMap((category) =>
    category.items.flatMap((item) => (item.tags ?? []).map((tag) => `  (${q(item.slug)}, ${q(tag)})`)),
  ).join(",\n"),
);
w(") as v(item_slug, tag_slug)");
w("join public.items i on i.slug = v.item_slug");
w(`join public.restaurants r on r.id = i.restaurant_id and r.slug = ${q(RESTAURANT.slug)}`);
w("join public.tags t on t.slug = v.tag_slug");
w("on conflict do nothing;");
w();

// Dishes removed from the data file should disappear from the database too,
// otherwise a re-run leaves yesterday's menu sitting underneath today's.
w("-- Remove anything no longer in menu-data.mjs.");
w("delete from public.items i");
w(`using public.restaurants r`);
w(`where i.restaurant_id = r.id and r.slug = ${q(RESTAURANT.slug)}`);
w(`  and i.slug not in (${[...seenItemSlugs].map(q).join(", ")});`);
w();
w("delete from public.categories c");
w(`using public.restaurants r`);
w(`where c.restaurant_id = r.id and r.slug = ${q(RESTAURANT.slug)}`);
w(`  and c.slug not in (${CATEGORIES.map((c) => q(c.slug)).join(", ")});`);

const target = join(HERE, "seed.sql");
writeFileSync(target, out.join("\n") + "\n", "utf8");

console.log(
  `seed.sql written — ${CATEGORIES.length} categories, ${itemCount} items, ` +
    `${itemCount * LOCALE_CODES.length} item translations, ${TAGS.length * LOCALE_CODES.length} tag translations`,
);
