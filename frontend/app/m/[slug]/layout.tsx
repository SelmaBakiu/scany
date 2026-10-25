import { CartProvider } from "@/components/cart-provider";
import { PrefsProvider } from "@/components/prefs-provider";
import { themeBootScript } from "@/lib/prefs-storage";
import { fetchRestaurantMenu } from "@/lib/menu";

/**
 * Wraps the menu page AND every item page in one preference store, so a diner
 * who picks English on the menu still has it after tapping into a dish.
 *
 * This is also the ONLY place the theme is applied. `data-theme` goes on the
 * div below and nowhere else — not on `<html>`, not on the root layout — so
 * the merchant's choice of colours covers the diner's menu completely and
 * cannot reach the admin, which renders outside this subtree in its own
 * black-and-white scope.
 *
 * The basket lives here too, so it is the same basket on the menu, on a dish's
 * page and on the order status page — and so it survives moving between them.
 *
 * The inline script only paints the background behind the page and sets
 * `color-scheme`, which is what stops a white flash on the way to a dark
 * theme. The layout shares the page's cached query, so this costs no extra
 * database work.
 */
export default async function MenuLayout({ children, params }: LayoutProps<"/m/[slug]">) {
  const { slug } = await params;
  const result = await fetchRestaurantMenu(slug);
  const theme = result.status === "ok" ? result.data.theme : "lys";

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeBootScript(theme) }} />
      <div data-theme={theme} className="flex min-h-screen flex-col bg-ground text-ink">
        <PrefsProvider restaurantSlug={slug}>
          <CartProvider restaurantSlug={slug}>{children}</CartProvider>
        </PrefsProvider>
      </div>
    </>
  );
}
