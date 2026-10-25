/**
 * Dish photos from Pollinations.ai.
 *
 * Plain JavaScript on purpose: this is the ONE copy of the prompt wording and
 * the fetch-with-retry, and it has to be usable from two places that cannot
 * share TypeScript — the server action in app/admin/actions.ts (bundled by
 * Next) and scripts/generate-images.mjs (run by bare node, with no build step
 * and no ts-node in this project's dependencies). `allowJs` in tsconfig.json
 * is what lets the TypeScript side import it.
 *
 * Pollinations needs no API key and no account, which is why it is here. It is
 * a free service: it is sometimes slow, sometimes down, and the pictures are
 * invented rather than photographs of this restaurant's actual food. Treat
 * them as decent placeholders, not as the real thing — see the note in
 * README.md about photographing the real dishes before a guest sees them.
 */

const ENDPOINT = "https://image.pollinations.ai/prompt/";

/**
 * Flux, not the default model. The default is fast and markedly worse at food:
 * it drifts into illustration and invents implausible dishes. Override with
 * POLLINATIONS_MODEL if you want to try another.
 */
const MODEL = process.env.POLLINATIONS_MODEL || "flux";

/**
 * The prompt. Deliberately specific about the medium and the lighting:
 * "picture of a burger" gets you a cartoon about a third of the time, and
 * naming the photographic style is what keeps the set looking like one menu
 * rather than seven different ones.
 *
 * @param {string} name
 * @param {string} [description]
 * @returns {string}
 */
export function foodPrompt(name, description) {
  const detail = (description ?? "").trim().replace(/\s*\.\s*$/, "");
  const dish = name.trim();
  return (
    `Professional food photography of ${dish}` +
    (detail ? `: ${detail}` : "") +
    ". Served on a plate in a restaurant, natural light, close-up, realistic, " +
    "appetizing, no text, no people, no hands."
  );
}

/**
 * The prompt for one dish, and the ONE place that decision is made.
 *
 * Both callers come through here — the batch script and the button in the
 * admin — so they cannot drift apart and start producing different pictures
 * for the same dish.
 *
 * The order is deliberate:
 *
 *   1. `imagePrompt`, if the merchant wrote one. They looked at a wrong
 *      picture and said what they actually wanted; nothing should override it.
 *   2. The ENGLISH name and description. This is the fix for the whole
 *      problem: the model is trained on English captions, so "Hvitløksbrød"
 *      is noise to it and "Garlic bread" is not.
 *   3. Norwegian, only when there is no English at all. Better than nothing,
 *      and the admin says so, but expect a worse picture.
 *
 * @param {{ imagePrompt?: string, en?: {name?: string, description?: string},
 *           nb?: {name?: string, description?: string}, slug?: string }} item
 * @returns {{ prompt: string, source: "override" | "english" | "norwegian" }}
 */
export function promptForItem(item) {
  const override = (item.imagePrompt ?? "").trim();
  if (override) return { prompt: foodPrompt(override, ""), source: "override" };

  const en = item.en ?? {};
  if ((en.name ?? "").trim()) {
    return { prompt: foodPrompt(en.name, en.description ?? ""), source: "english" };
  }

  const nb = item.nb ?? {};
  return {
    prompt: foodPrompt(nb.name || item.slug || "dish", nb.description ?? ""),
    source: "norwegian",
  };
}

/**
 * A stable seed per dish: the same slug always gives the same picture.
 *
 * Useful for a repeatable batch, and exactly wrong when you look at the result
 * and want a different one — hence `randomSeed()` below. The AI photo button
 * in the admin uses a random seed on every click, because "try again" that
 * returns an identical picture is not a try at all.
 *
 * FNV-1a: small, dependency-free, good enough for "pick a number".
 *
 * @param {string} slug
 * @returns {number}
 */
export function seedFor(slug) {
  let hash = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 1_000_000;
}

/**
 * @param {string} prompt
 * @param {number} seed
 * @param {number} [size]
 * @returns {string}
 */
export function imageUrl(prompt, seed, size = 800) {
  const query = new URLSearchParams({
    width: String(size),
    height: String(size),
    nologo: "true",
    seed: String(seed),
    model: MODEL,
  });
  return `${ENDPOINT}${encodeURIComponent(prompt)}?${query}`;
}

/** A fresh seed, for when the point is to get a different picture. */
export function randomSeed() {
  return Math.floor(Math.random() * 1_000_000);
}

/**
 * Fetch one picture, retrying on the failures that are worth retrying.
 *
 * Generation takes real time on a free service, so the timeout is generous and
 * the backoff is exponential: hammering it faster is how you get rate-limited
 * and end up with fewer pictures, not more.
 *
 * @param {string} name
 * @param {string | undefined} description
 * @param {string} slug
 * @param {{ attempts?: number, timeoutMs?: number, size?: number, seed?: number, prompt?: string, onRetry?: (attempt: number, reason: string) => void }} [options]
 * @returns {Promise<{ bytes: Uint8Array, contentType: string, url: string, prompt: string } | null>}
 */
export async function generateFoodImage(name, description, slug, options = {}) {
  const { attempts = 3, timeoutMs = 90_000, size = 800, seed, prompt, onRetry } = options;
  const finalPrompt = prompt ?? foodPrompt(name, description);
  const url = imageUrl(finalPrompt, seed ?? seedFor(slug), size);

  // Logged so you can see exactly what was asked for when a picture is wrong.
  console.log(`  prompt: ${finalPrompt}`);

  for (let attempt = 1; attempt <= attempts; attempt++) {
    /** @type {string} */
    let reason = "unknown";
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response;
      try {
        response = await fetch(url, {
          signal: controller.signal,
          headers: { accept: "image/*" },
        });
      } finally {
        clearTimeout(timer);
      }

      if (response.ok) {
        const contentType = response.headers.get("content-type") ?? "image/jpeg";
        // A service that is busy sometimes answers 200 with an HTML error
        // page. Writing that into the bucket as "the dish photo" would be
        // worse than failing, so check what actually came back.
        if (!contentType.startsWith("image/")) {
          reason = `expected an image, got ${contentType}`;
        } else {
          const bytes = new Uint8Array(await response.arrayBuffer());
          if (bytes.byteLength < 1024) {
            reason = `suspiciously small response (${bytes.byteLength} bytes)`;
          } else {
            return { bytes, contentType, url, prompt: finalPrompt };
          }
        }
      } else {
        reason = `HTTP ${response.status}`;
      }
    } catch (error) {
      reason = error instanceof Error ? error.message : String(error);
    }

    if (attempt < attempts) {
      onRetry?.(attempt, reason);
      await sleep(2000 * 2 ** (attempt - 1));
    } else {
      onRetry?.(attempt, `${reason} (giving up)`);
    }
  }

  return null;
}

/** @param {number} ms */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Where a dish's photo lives in the bucket.
 *
 * The timestamp is not decoration: Supabase Storage serves public objects
 * through a CDN, so re-uploading to the same path can keep serving the old
 * picture for a while. A new path every time sidesteps it entirely.
 *
 * @param {string} restaurantId
 * @param {string} slug
 * @param {string} contentType
 */
export function imagePathFor(restaurantId, slug, contentType) {
  const extension = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";
  return `${restaurantId}/ai-${slug}-${Date.now()}.${extension}`;
}
