/**
 * "12", "1-12", "1,2,5,ute-1" — whatever a merchant types for their tables.
 *
 * Restaurants do not number their tables the way a programmer would. There is
 * a terrace, a bar, a table 4b. So this accepts a plain count, ranges, and
 * arbitrary names, and refuses to be clever about anything it does not
 * recognise — an unparseable entry is kept verbatim as a table name rather
 * than silently dropped.
 */
export function parseTableList(input: string, max = 200): string[] {
  const raw = input.trim();
  if (!raw) return [];

  // A bare number means "I have this many tables, number them 1..n".
  if (/^\d{1,3}$/.test(raw)) {
    const count = Math.min(Number(raw), max);
    return Array.from({ length: count }, (_, i) => String(i + 1));
  }

  const out: string[] = [];
  for (const part of raw.split(/[,\n]/)) {
    const piece = part.trim();
    if (!piece) continue;

    // "1-12", but only when both ends are numbers. "ute-1" is a table name,
    // not a range, and treating it as one would produce nothing at all.
    const range = /^(\d{1,3})\s*-\s*(\d{1,3})$/.exec(piece);
    if (range) {
      const from = Number(range[1]);
      const to = Number(range[2]);
      if (from <= to) {
        for (let n = from; n <= to && out.length < max; n++) out.push(String(n));
        continue;
      }
    }

    out.push(piece.slice(0, 16));
    if (out.length >= max) break;
  }

  // Dedupe, keeping the order typed.
  return [...new Set(out)].slice(0, max);
}

/** The link printed on a table's QR code. */
export function tableUrl(baseUrl: string, slug: string, table: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  return `${base}/m/${slug}?table=${encodeURIComponent(table)}`;
}
