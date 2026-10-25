import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/admin/actions";
import { MarkIcon } from "@/components/icons";
import { getPlatformAccess } from "@/lib/management";
import { adminChromeScript } from "@/lib/prefs-storage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Store Management — MenuScan" };

export default async function ManagementLayout({ children }: { children: React.ReactNode }) {
  const access = await getPlatformAccess();
  if (access.status === "signed-out") redirect("/admin/login?next=/management/stores");

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: adminChromeScript() }} />
      <div data-chrome="admin" className="min-h-screen bg-ground text-ink">
        <header className="sticky top-0 z-30 border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
            <Link href="/management/stores" className="flex items-center gap-2.5 text-ink no-underline">
              <span className="flex size-8 items-center justify-center rounded-[9px] bg-ink text-ground">
                <MarkIcon size={18} />
              </span>
              <span className="font-display text-[17px] font-bold">MenuScan Management</span>
            </Link>
            {access.status === "ok" ? (
              <div className="ml-auto flex items-center gap-3">
                <span className="hidden text-sm text-muted sm:inline">{access.email}</span>
                <Link
                  href="/admin"
                  className="inline-flex h-11 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-ink no-underline"
                >
                  Store admin
                </Link>
                <form action={signOut}>
                  <button className="inline-flex h-11 items-center rounded-full border border-line-strong px-4 text-sm font-semibold">
                    Sign out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          {access.status === "ok" ? children : <ManagementAccessProblem status={access.status} />}
        </main>
      </div>
    </>
  );
}

function ManagementAccessProblem({ status }: { status: Exclude<Awaited<ReturnType<typeof getPlatformAccess>>["status"], "ok" | "signed-out"> }) {
  const message =
    status === "not-configured"
      ? "Configure the public Supabase URL and key first."
      : status === "service-key-missing"
        ? "Add SUPABASE_SECRET_KEY to frontend/.env.local and your deployment environment."
        : status === "forbidden"
          ? "This account is not a platform administrator. Run backend/supabase/platform-admin-setup.sql for the intended account."
          : "The platform administrator check failed. Apply backend/supabase/migrate-2026-10-store-management.sql and try again.";

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-6">
      <h1 className="font-display text-xl font-bold">Store Management unavailable</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
      <form action={signOut} className="mt-5">
        <button className="inline-flex h-11 items-center rounded-full border border-line-strong px-4 text-sm font-semibold">
          Sign out
        </button>
      </form>
    </div>
  );
}
