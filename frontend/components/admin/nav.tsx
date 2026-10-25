"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { AdminTextKey } from "@/lib/admin-i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAdminStrings } from "./admin-locale";

const SECTIONS: { href: string; key: AdminTextKey; badge?: "newOrders" }[] = [
  { href: "/admin/orders", key: "navOrders", badge: "newOrders" },
  { href: "/admin/items", key: "navItems" },
  { href: "/admin/categories", key: "navCategories" },
  { href: "/admin/menus", key: "navMenus" },
  { href: "/admin/theme", key: "navTheme" },
  { href: "/admin/restaurant", key: "navRestaurant" },
  { href: "/admin/qr", key: "navQr" },
];

/**
 * Horizontal tabs on a phone, a sidebar from `md` up.
 *
 * One list, two layouts — the tabs scroll sideways on a narrow screen rather
 * than wrapping into two rows that push the content down.
 *
 * Orders carries a count of what is waiting, and it has to be live from every
 * page: a merchant editing a dish still needs to see an order arrive. So the
 * nav keeps its own small subscription rather than depending on the board
 * being mounted.
 */
export function AdminNav() {
  const pathname = usePathname();
  const t = useAdminStrings();
  const newOrders = useNewOrderCount();

  return (
    <nav aria-label={t.sections} className="md:w-52 md:shrink-0">
      <ul className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
        {SECTIONS.map((section) => {
          const active = pathname === section.href || pathname.startsWith(`${section.href}/`);
          const count = section.badge === "newOrders" ? newOrders : 0;
          return (
            <li key={section.href} className="shrink-0 md:shrink">
              <Link
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-11 w-full items-center gap-2 rounded-full px-4 text-sm font-semibold no-underline md:rounded-xl ${
                  active
                    ? "bg-accent text-on-accent"
                    : "border border-line-strong bg-surface text-ink hover:border-ink md:border-transparent md:bg-transparent md:hover:bg-chip"
                }`}
              >
                {t[section.key]}
                {count > 0 ? (
                  <span
                    className={`ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums ${
                      active ? "bg-on-accent text-accent" : "bg-ink text-ground"
                    }`}
                  >
                    {count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * How many orders are sitting at "new", kept current from anywhere in the
 * admin. Realtime when it is available, a slow poll underneath it either way.
 */
function useNewOrderCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    let cancelled = false;

    const read = async () => {
      const { count: found, error } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");
      if (!cancelled && !error) setCount(found ?? 0);
    };

    void read();

    const channel = supabase
      .channel("admin-order-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void read())
      .subscribe();

    const timer = setInterval(() => void read(), 30_000);

    return () => {
      cancelled = true;
      clearInterval(timer);
      void supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
