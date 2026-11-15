/**
 * Google's website translator, for whatever the menu has no translation of.
 *
 * The app's own translations come first: buttons and headings from
 * lib/i18n.ts, and any dish text the restaurant translated in the database.
 * Google only sees the page AFTER that, so in practice it translates the dish
 * text that fell back to English or Norwegian. Source language is "auto" for
 * that reason — one page can hold both.
 *
 * How the widget works: it reads a `googtrans` cookie ("/auto/ja") when its
 * script loads and translates the page to that language. Switching language
 * afterwards means setting its hidden <select> and firing "change". Going back
 * to the original language cannot be done in place; the cookie is cleared and
 * the page reloaded.
 *
 * Browser-only. Every function touches document or window.
 */

const SCRIPT_ID = "google-translate-script";
export const ELEMENT_ID = "google_translate_element";
const COOKIE = "googtrans";
const CALLBACK = "googleTranslateElementInit";

/** Our codes that Google spells differently. Everything else is the same. */
const GOOGLE_CODES: Record<string, string> = { nb: "no", nn: "no" };

export function googleCode(locale: string): string {
  return GOOGLE_CODES[locale] ?? locale;
}

type GoogleTranslateWindow = Window & {
  google?: {
    translate?: {
      TranslateElement?: new (
        options: { pageLanguage: string; autoDisplay: boolean },
        elementId: string,
      ) => unknown;
    };
  };
  [CALLBACK]?: () => void;
};

const win = () => window as GoogleTranslateWindow;

// ------------------------------------------------------------------ cookies

/** The language the page is currently being translated to, or null. */
export function getTranslateLanguage(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (!match) return null;
  return decodeURIComponent(match[1]).split("/")[2] || null;
}

export function setTranslateCookie(language: string): void {
  document.cookie = `${COOKIE}=/auto/${language}; path=/; SameSite=Lax`;
}

/**
 * Google writes the cookie on the bare host AND on the parent domain, so it
 * has to be cleared on every one of them or it comes straight back.
 */
export function deleteTranslateCookie(): void {
  const host = window.location.hostname;
  const parent = host.replace(/^.*?\.(?=[^.]+\.[^.]+$)/, "");
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  for (const domain of new Set([host, `.${host}`, parent, `.${parent}`])) {
    document.cookie = `${COOKIE}=; path=/; domain=${domain}; ${expired}`;
  }
  document.cookie = `${COOKIE}=; path=/; ${expired}`;
}

// ------------------------------------------------------------------- script

function addScript(): void {
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = `https://translate.google.com/translate_a/element.js?cb=${CALLBACK}`;
  script.async = true;
  document.body.appendChild(script);
}

/** Pick a language in the widget's own (hidden) dropdown. */
function selectInWidget(language: string): boolean {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) return false;
  combo.value = language;
  combo.dispatchEvent(new Event("change"));
  return true;
}

/**
 * Translate the page into `language` (a Google code, e.g. "ja").
 *
 * First call loads the script, which picks the language up from the cookie.
 * Later calls switch it through the widget. If the widget has not finished
 * building its dropdown yet, retry briefly rather than drop the request.
 */
export function translatePage(language: string): void {
  setTranslateCookie(language);

  const google = win().google?.translate?.TranslateElement;
  if (google && selectInWidget(language)) return;

  win()[CALLBACK] = () => {
    const TranslateElement = win().google?.translate?.TranslateElement;
    if (!TranslateElement) return;
    new TranslateElement({ pageLanguage: "auto", autoDisplay: false }, ELEMENT_ID);
    let tries = 0;
    const timer = window.setInterval(() => {
      if (selectInWidget(language) || ++tries > 20) window.clearInterval(timer);
    }, 250);
  };

  if (google) win()[CALLBACK]!();
  else addScript();
}

/** Back to the page as it was written. Needs a reload; see the top comment. */
export function resetTranslation(): void {
  const wasTranslated = getTranslateLanguage() !== null;
  deleteTranslateCookie();
  if (wasTranslated) window.location.reload();
}

/**
 * Google wraps translated text in <font> elements, behind React's back. When
 * React later removes or moves one of those text nodes (a filter changes, the
 * basket updates) the node is no longer where React left it, and the browser
 * throws "Failed to execute 'removeChild'", taking the page down.
 *
 * This is the widely used workaround from the React issue tracker (#11538):
 * when the node has been moved, do nothing instead of throwing. Installed
 * once, only while Google Translate is in use.
 */
let patched = false;

export function protectReactFromTranslation(): void {
  if (patched || typeof Node === "undefined") return;
  patched = true;

  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };

  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    this: Node,
    node: T,
    reference: Node | null,
  ): T {
    if (reference && reference.parentNode !== this) return node;
    return insertBefore.call(this, node, reference) as T;
  };
}
