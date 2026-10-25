import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/anon";
import { MarkIcon } from "@/components/icons";

/**
 * A developer landing page, not a product page. The real entry point is
 * /m/[slug], which is what a QR code links to.
 */
export default function Home() {
  const configured = isSupabaseConfigured();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-grow flex-col justify-center gap-7 px-6 py-16">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-ink text-ground">
          <MarkIcon size={22} />
        </span>
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">MenuScan</h1>
      </div>

      <p className="text-base leading-relaxed text-muted">
        A customer-facing menu you reach by scanning a QR code. This stage is
        read-only: browse, search, filter, switch language and currency. No cart,
        no ordering.
      </p>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.07em] text-muted">
          Sample menu
        </h2>
        <Link
          href="/m/sofra"
          className="mt-3 inline-flex h-11 items-center rounded-full bg-accent px-5 text-[15px] font-semibold text-surface no-underline hover:bg-accent-strong"
        >
          Open /m/sofra
        </Link>
        {!configured ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Supabase is not configured yet, so that link will show setup
            instructions instead of a menu. Copy{" "}
            <code className="font-mono text-ink">.env.local.example</code> to{" "}
            <code className="font-mono text-ink">.env.local</code> and fill it in.
          </p>
        ) : null}
      </div>

      <p className="text-[13px] leading-relaxed text-muted">
        The dish names, descriptions and prices in the seed data are placeholders
        from the design mockup, and the currency rates in{" "}
        <code className="font-mono">backend/supabase/seed.sql</code> are not live rates.
        Replace both before anyone sees this.
      </p>
    </main>
  );
}
