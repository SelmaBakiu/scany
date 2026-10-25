import { getMerchantContext } from "@/lib/admin";
import { adminChromeScript } from "@/lib/prefs-storage";
import { AdminLocaleProvider } from "@/components/admin/admin-locale";
import { AdminShell, AdminSetupNotice } from "@/components/admin/shell";

/**
 * Never cached. The admin reads cookies to know who is signed in, which makes
 * it dynamic anyway — but stating it means a build that happens to run without
 * environment variables cannot accidentally prerender the signed-out state.
 */
export const dynamic = "force-dynamic";

/**
 * The admin shell.
 *
 * Two things happen here and nowhere else.
 *
 * 1. `data-chrome="admin"` — the whole admin is black and white, always. The
 *    merchant's theme is applied by the diner's layout, on its own wrapper, so
 *    there is no `data-theme` anywhere above this element for it to inherit
 *    from. Choosing a purple menu changes the menu, and nothing here.
 *
 * 2. `AdminLocaleProvider` — the merchant's own language, stored under its own
 *    key, with no connection to the language a diner picks.
 *
 * The login page sits under /admin too but has no header or nav, so it opts
 * out below while keeping both of the above. Middleware — proxy.ts — has
 * already bounced anyone without a session by the time this renders; the
 * checks here are for the cases it cannot see, like a signed-in user who is
 * not a member of any restaurant.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const context = await getMerchantContext();

  return (
    <>
      {/* Undoes the inline background the diner's layout paints on <html>, in
          case the merchant arrived here from the menu in the same document. */}
      <script dangerouslySetInnerHTML={{ __html: adminChromeScript() }} />
      <div data-chrome="admin" className="flex min-h-screen flex-col bg-ground text-ink">
        <AdminLocaleProvider>
          {context.status === "signed-out" ? (
            // The login page rendering through the layout. It draws its own
            // page; everything else is middleware's job.
            children
          ) : context.status === "ok" ? (
            <AdminShell
              restaurant={context.data.restaurant}
              isPlatformAdmin={context.isPlatformAdmin}
            >
              {children}
            </AdminShell>
          ) : (
            <AdminSetupNotice
              status={context.status}
              email={context.status === "no-restaurant" ? context.email : undefined}
              message={context.status === "error" ? context.message : undefined}
            />
          )}
        </AdminLocaleProvider>
      </div>
    </>
  );
}
