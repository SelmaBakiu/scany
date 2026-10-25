/**
 * Give every dish on the menu an AI photo. Run once, not per page view.
 *
 *   npm run generate-images              # only dishes with no photo
 *   npm run generate-images -- --check   # test the setup, generate nothing
 *   npm run generate-images -- --force   # redo every dish
 *   npm run generate-images -- --force --reroll   # redo, with DIFFERENT pictures
 *   npm run generate-images -- --limit 5 # try a handful first
 *   npm run generate-images -- --dry-run # show what it would do
 *
 * Why a script and not something the page does: Pollinations takes 10–40
 * seconds per picture. Generating on request would mean a diner waiting half a
 * minute for a menu, every time, for a picture that never changes. So the
 * pictures are made once, uploaded to Supabase Storage, and served from there
 * like any other file.
 *
 * ---------------------------------------------------------------------------
 * HOW IT SIGNS IN
 *
 * It signs in as the merchant, with the same email and password used at
 * /admin, and writes through exactly the same Row Level Security policies the
 * admin does. That is on purpose: the alternative is the service_role key,
 * which bypasses RLS entirely, and a leaked one hands over the whole database.
 * A password that only works for one restaurant's menu is a much smaller thing
 * to lose.
 *
 * Add to .env.local (these are NOT NEXT_PUBLIC_*, so they never reach a
 * browser — and .env.local is already in .gitignore):
 *
 *   MENUSCAN_EMAIL=you@example.com
 *   MENUSCAN_PASSWORD=the password you set in Supabase
 * ---------------------------------------------------------------------------
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { generateFoodImage, imagePathFor, promptForItem, randomSeed, sleep } from "../lib/ai-image.mjs";

const BUCKET = "menu-images";

/** Seconds between dishes. Polite to a free service, and it is not optional. */
const GAP_MS = 4000;

// ---------------------------------------------------------------- arguments

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1];
};

const force = has("--force");
/** A different picture for the same dish, instead of the repeatable one. */
const reroll = has("--reroll");
const dryRun = has("--dry-run");
/**
 * --check answers "is this thing set up correctly?" without spending two
 * minutes on a picture to find out. It stops after the parts that can fail
 * quietly: the variables, the sign-in, the restaurant link, the menu query.
 */
const checkOnly = has("--check");
const limit = Number(valueOf("--limit") ?? Number.POSITIVE_INFINITY);

// ------------------------------------------------------------------- config

/**
 * .env.local is Next's file, not Node's — nothing loads it for a bare script,
 * and adding dotenv for four lines of parsing is not worth a dependency.
 */
function loadEnvLocal() {
  let raw;
  try {
    raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const value = match[2].replace(/^["']|["']$/g, "");
    if (!(match[1] in process.env)) process.env[match[1]] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.MENUSCAN_EMAIL;
const password = process.env.MENUSCAN_PASSWORD;

const missing = [
  !url && "NEXT_PUBLIC_SUPABASE_URL",
  !key && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  !email && "MENUSCAN_EMAIL",
  !password && "MENUSCAN_PASSWORD",
].filter(Boolean);

// Always say what WAS found, not only what was not. "Missing X" on its own
// leaves you wondering whether the file was read at all.
console.log("\n.env.local");
for (const [name, value] of [
  ["NEXT_PUBLIC_SUPABASE_URL", url],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", key],
  ["MENUSCAN_EMAIL", email],
  ["MENUSCAN_PASSWORD", password],
]) {
  const shown = !value
    ? "NOT SET"
    : name.includes("PASSWORD")
      ? `set (${value.length} characters)`
      : name.includes("KEY")
        ? `${value.slice(0, 12)}…`
        : value;
  console.log(`  ${!value ? "✗" : "✓"} ${name.padEnd(30)} ${shown}`);
}

if (missing.length) {
  console.error(`\nCannot run: ${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} missing from .env.local`);
  console.error("\nMENUSCAN_EMAIL and MENUSCAN_PASSWORD are the same ones you use at /admin,");
  console.error("and they are NOT in the file by default — add these two lines yourself:");
  console.error("\n  MENUSCAN_EMAIL=you@example.com");
  console.error("  MENUSCAN_PASSWORD=your-admin-password\n");
  console.error("The script signs in as you, so it writes under the same rules the admin does.\n");
  process.exit(1);
}

// --------------------------------------------------------------------- main

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (signInError || !session.user) {
  console.error(`\nCould not sign in as ${email}: ${signInError?.message ?? "unknown error"}`);
  console.error("(A \"fetch failed\" here usually means the URL is wrong, or there is no internet.)");
  console.error("Check the password, and that the user is confirmed in the Supabase dashboard.\n");
  process.exit(1);
}

/**
 * Which restaurant. RLS already limits the query to restaurants this account
 * is a member of, so no filtering by hand — and if the answer is empty, the
 * account was never linked (see ../backend/supabase/merchant-setup.sql).
 */
const { data: membership } = await supabase
  .from("restaurant_members")
  .select("restaurant_id, restaurants(slug)")
  .limit(1)
  .maybeSingle();

if (!membership) {
  console.error(`\n${email} is signed in but is not a member of any restaurant.`);
  console.error("Run ../backend/supabase/merchant-setup.sql with this email, then try again.\n");
  process.exit(1);
}

const restaurantId = membership.restaurant_id;

const { data: items, error: itemsError } = await supabase
  .from("items")
  .select("id, slug, image_path, image_prompt, item_translations(locale, name, description)")
  .eq("restaurant_id", restaurantId)
  .order("sort_order");

if (itemsError) {
  console.error(`\nCould not read the menu: ${itemsError.message}\n`);
  process.exit(1);
}

const queue = (items ?? [])
  .filter((item) => force || !item.image_path)
  .slice(0, limit);

const skipped = (items ?? []).length - queue.length;

console.log(`\nSigned in  : ${email}`);
console.log(`Restaurant : ${membership.restaurants?.slug ?? restaurantId}`);
console.log(`Dishes     : ${(items ?? []).length}`);
console.log(`To generate: ${queue.length}${skipped > 0 ? `  (${skipped} already have a photo)` : ""}`);
if (force) console.log("Mode       : --force, existing photos will be replaced");
if (reroll) console.log("Mode       : --reroll, new random pictures rather than the repeatable ones");
if (dryRun) console.log("Mode       : --dry-run, nothing will be written");
console.log("");

if (checkOnly) {
  console.log("--check: everything above worked. Run it again without --check to generate.\n");
  process.exit(0);
}

if (queue.length === 0) {
  console.log("Nothing to do. Use --force to regenerate photos that already exist.\n");
  process.exit(0);
}

let done = 0;
let failed = 0;

for (const [index, item] of queue.entries()) {
  const translations = item.item_translations ?? [];
  const nb = translations.find((t) => t.locale === "nb");
  const en = translations.find((t) => t.locale === "en");

  // One prompt builder for the script and the admin button alike — see
  // promptForItem() in lib/ai-image.mjs for why English comes first.
  const { prompt, source } = promptForItem({
    imagePrompt: item.image_prompt,
    en: { name: en?.name, description: en?.description },
    nb: { name: nb?.name, description: nb?.description },
    slug: item.slug,
  });
  const name = (en?.name || nb?.name || item.slug).trim();

  const position = `[${index + 1}/${queue.length}]`;

  if (dryRun) {
    console.log(`${position} ${name}  [${source}]`);
    console.log(`  prompt: ${prompt}`);
    continue;
  }

  console.log(`${position} ${name}  [${source}]`);

  const picture = await generateFoodImage(name, "", item.slug, {
    prompt,
    // A fixed seed per dish by default: regenerating the same dish gives the
    // same picture, so a change in the result means the PROMPT changed, which
    // is what makes the override field predictable to work with.
    seed: reroll ? randomSeed() : undefined,
    onRetry: (attempt, reason) => console.log(`  retry ${attempt}: ${reason}`),
  });

  if (!picture) {
    console.log("  FAILED");
    failed++;
  } else {
    const path = imagePathFor(restaurantId, item.slug, picture.contentType);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, picture.bytes, { contentType: picture.contentType, upsert: true });

    if (uploadError) {
      console.log(`  UPLOAD FAILED (${uploadError.message})`);
      failed++;
    } else {
      const { error: saveError } = await supabase
        .from("items")
        .update({ image_path: path, updated_at: new Date().toISOString() })
        .eq("id", item.id);

      if (saveError) {
        console.log(`  SAVE FAILED (${saveError.message})`);
        failed++;
      } else {
        console.log(`  ok (${Math.round(picture.bytes.byteLength / 1024)} KB)`);
        done++;
      }
    }
  }

  // Wait between dishes, but not after the last one.
  if (index < queue.length - 1) await sleep(GAP_MS);
}

console.log(`\nDone. ${done} generated, ${failed} failed.`);
if (failed > 0) {
  console.log("Re-run the command — it skips what already worked and retries only the rest.");
}
console.log("");

await supabase.auth.signOut();
process.exit(failed > 0 ? 1 : 0);
