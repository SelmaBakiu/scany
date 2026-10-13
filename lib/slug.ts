/**
 * Slug helpers.
 *
 * Their own module, not part of lib/admin.ts, because they are pure string
 * functions: keeping them here means they can be tested without pulling a
 * database client — and its environment variables — into the test.
 */

/**
 * Turn a dish name into a URL-safe slug.
 *
 * Norwegian needs the æ/ø/å mapped explicitly: stripping diacritics the usual
 * way turns "å" into "a" but leaves "ø" alone, so "Smørbrød" would become
 * "smrbrd".
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Append -2, -3 … until the slug is free. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || "rett";
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}
