"use client";

import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import type { AdminRestaurant } from "@/lib/admin-types";
import { MarkIcon } from "../icons";
import { SetupNotice } from "../setup-notice";
import { AdminLanguagePicker, useAdminStrings } from "./admin-locale";
import { AdminNav } from "./nav";

/**
 * The header and the nav around every admin page.
 *
 * A client component because every label in it is translated, and the
 * merchant's language lives in the browser. The layout above it stays a
 * server component and does the database work.
 */
export function AdminShell({
  restaurant,
  children,
}: {
  restaurant: AdminRestaurant;
  children: React.ReactNode;
}) {
  const t = useAdminStrings();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[82rem] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <Link href="/admin/items" className="flex items-center gap-2.5 text-ink no-underline">
            <span className="flex size-8 items-center justify-center rounded-[9px] bg-ink text-ground">
              <MarkIcon size={18} />
            </span>
            <span className="font-display text-[17px] font-bold tracking-[-0.02em]">
              {restaurant.name}
            </span>
            <span className="rounded-full bg-chip px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-chip-ink">
              {t.admin}
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <AdminLanguagePicker />
            <Link
              href={`/m/${restaurant.slug}`}
              target="_blank"
              className="hidden h-11 items-center rounded-full border border-line-strong px-3.5 text-[13px] font-semibold text-ink no-underline hover:border-ink sm:inline-flex"
            >
              {t.viewMenu}
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex h-11 items-center rounded-full border border-line-strong px-3.5 text-[13px] font-semibold text-ink hover:border-ink"
              >
                {t.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[82rem] flex-1 flex-col gap-5 px-4 py-5 md:flex-row md:gap-8 md:px-6 md:py-8">
        <AdminNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}

/**
 * Why the admin cannot show you anything yet: no Supabase, no membership, or a
 * database that did not answer. Translated like everything else.
 */
export function AdminSetupNotice({
  status,
  email,
  message,
}: {
  status: "not-configured" | "no-restaurant" | "error";
  email?: string;
  message?: string;
}) {
  const t = useAdminStrings();

  if (status === "not-configured") {
    return <SetupNotice title={t.notConfiguredTitle} detail={t.notConfiguredDetail} />;
  }

  if (status === "error") {
    return <SetupNotice title={t.databaseErrorTitle} detail={message} />;
  }

  return (
    <SetupNotice
      title={t.noRestaurantTitle}
      detail={t.noRestaurantDetail(email ?? "")}
      steps={[t.noRestaurantStep1, t.noRestaurantStep2, t.noRestaurantStep3]}
    />
  );
}
