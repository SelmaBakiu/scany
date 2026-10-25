/**
 * Checks every theme's colour pairs against WCAG AA.
 *
 *     node scripts/check-contrast.mjs
 *
 * Parses the theme blocks straight out of app/globals.css, so it tests what
 * actually ships rather than a copy that can drift. Exits non-zero on failure,
 * which makes it usable in CI.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");

/** Body text and anything below 24px needs 4.5; large text needs 3. */
const AA_NORMAL = 4.5;

/** [foreground, background, label, minimum] */
const PAIRS = [
  ["ink", "ground", "body text on the page", AA_NORMAL],
  ["ink", "surface", "text on cards and sheets", AA_NORMAL],
  ["ink", "tint", "text on the hero band", AA_NORMAL],
  ["muted", "ground", "secondary text on the page", AA_NORMAL],
  ["muted", "surface", "secondary text on cards", AA_NORMAL],
  ["muted", "tint", "secondary text on the hero band", AA_NORMAL],
  ["accent", "ground", "links and active text on the page", AA_NORMAL],
  ["accent", "surface", "links and active text on cards", AA_NORMAL],
  ["on-accent", "accent", "label inside a filled button", AA_NORMAL],
  ["chip-ink", "chip", "neutral tag", AA_NORMAL],
  ["veg", "veg-soft", "dietary tag", AA_NORMAL],
  ["heat", "heat-soft", "spice tag", AA_NORMAL],
];

function parseThemes(source) {
  const light = {};
  const themeBlock = source.match(/@theme\s*\{([\s\S]*?)\n\}/);
  if (!themeBlock) throw new Error("no @theme block found in globals.css");
  for (const [, name, value] of themeBlock[1].matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{3,8})/gi)) {
    light[name] = value;
  }

  // The admin's monochrome scope is checked alongside the themes: it is built
  // from the same seventeen tokens, so the same twelve pairs apply to it, and
  // "black and white" is no excuse for grey-on-grey.
  const themes = { lys: { ...light } };
  const blocks =
    /\[data-(?:theme|chrome)="([a-z]+)"\]\s*\{([\s\S]*?)\n  \}/g;
  for (const [, name, body] of source.matchAll(blocks)) {
    const tokens = { ...light };
    for (const [, token, value] of body.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{3,8})/gi)) {
      tokens[token] = value;
    }
    themes[name] = tokens;
  }
  return themes;
}

function channel(hex) {
  const v = parseInt(hex, 16) / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return (
    0.2126 * channel(h.slice(0, 2)) +
    0.7152 * channel(h.slice(2, 4)) +
    0.0722 * channel(h.slice(4, 6))
  );
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const themes = parseThemes(css);
let failures = 0;
let checks = 0;

for (const [themeName, tokens] of Object.entries(themes)) {
  const rows = [];
  for (const [fg, bg, label, min] of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) {
      console.error(`  ${themeName}: missing token ${tokens[fg] ? bg : fg}`);
      failures++;
      continue;
    }
    checks++;
    const ratio = contrast(tokens[fg], tokens[bg]);
    const ok = ratio >= min;
    if (!ok) failures++;
    rows.push(`  ${ok ? "ok  " : "FAIL"} ${ratio.toFixed(2).padStart(5)}:1  ${label} (${fg} on ${bg})`);
  }
  const worst = rows.some((r) => r.includes("FAIL"));
  console.log(`\n${themeName}${worst ? "  <-- FAILS" : ""}`);
  for (const row of rows) console.log(row);
}

console.log(
  `\n${checks} checks across ${Object.keys(themes).length} themes — ` +
    (failures === 0 ? "all pass AA" : `${failures} FAILED`),
);
process.exit(failures === 0 ? 0 : 1);
