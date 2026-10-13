"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteItem, duplicateItem } from "@/app/admin/actions";
import type { AdminData } from "@/lib/admin-types";
import { formatMinor } from "@/lib/money";
import { normalize } from "@/lib/i18n";
import { adminName } from "@/lib/admin-i18n";
import { PlatePlaceholder, SearchIcon } from "../icons";
import { useAdminLocale, useAdminStrings } from "./admin-locale";
import { ConfirmSubmit, Field, GhostButton, Select } from "./ui";

/** The "new dish" button in the page heading. Here so the label translates. */
export function NewItemLink() {
  const t = useAdminStrings();
  return (
    <Link
      href="/admin/items/new"
      className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-[15px] font-semibold text-on-accent no-underline hover:bg-accent-strong"
    >
      {t.newItem}
    </Link>
  );
}

/**
 * The dish list.
 *
 * Search and filtering run over the already-loaded array, the same way the
 * diner's menu works — a merchant scanning a 56-dish list wants the filter to
 * react as they type, not after a round trip.
 */
export function ItemList({ data }: { data: AdminData }) {
  const { locale, t } = useAdminLocale();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");

  const categoryName = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of data.categories) {
      map.set(category.id, adminName(category.names, locale, category.slug));
    }
    return map;
  }, [data.categories, locale]);

  /**
   * Where each category sits in the merchant's own order.
   *
   * Sorting this list alphabetically would be easier, but then Burgere comes
   * before Forretter and the admin no longer looks like the menu the merchant
   * arranged — and dragging a category up on the Kategorier page would change
   * nothing here. The menu's order is the order.
   */
  const categoryRank = useMemo(() => {
    const map = new Map<string, number>();
    [...data.categories]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((category, index) => map.set(category.id, index));
    return map;
  }, [data.categories]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return data.items
      .filter((item) => {
        if (categoryId && item.categoryId !== categoryId) return false;
        if (status === "available" && !item.isAvailable) return false;
        if (status === "sold-out" && item.isAvailable) return false;
        if (!q) return true;
        const haystack = normalize(
          [item.slug, ...Object.values(item.text).map((t) => `${t.name} ${t.description}`)].join(" "),
        );
        return haystack.includes(q);
      })
      .sort((a, b) => {
        const byCategory =
          (categoryRank.get(a.categoryId) ?? Number.MAX_SAFE_INTEGER) -
          (categoryRank.get(b.categoryId) ?? Number.MAX_SAFE_INTEGER);
        return byCategory !== 0 ? byCategory : a.sortOrder - b.sortOrder;
      });
  }, [data.items, query, categoryId, status, categoryRank]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-[999_1_14rem]">
          <Field label={t.search}>
            <div className="flex h-11 items-center gap-2.5 rounded-xl border border-line-strong bg-surface px-3.5">
              <SearchIcon className="text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="min-w-0 flex-grow bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
              />
            </div>
          </Field>
        </div>

        <div className="flex-[1_1_10rem]">
          <Field label={t.category}>
            <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">{t.all}</option>
              {[...data.categories]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {adminName(category.names, locale, category.slug)}
                  </option>
                ))}
            </Select>
          </Field>
        </div>

        <div className="flex-[1_1_9rem]">
          <Field label={t.status}>
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">{t.all}</option>
              <option value="available">{t.available}</option>
              <option value="sold-out">{t.soldOut}</option>
            </Select>
          </Field>
        </div>
      </div>

      <p className="text-[13px] text-muted" aria-live="polite">
        {t.showingCount(visible.length, data.items.length)}
      </p>

      <ul className="flex flex-col gap-2.5">
        {visible.map((item, index) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3"
          >
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-tint">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-faint">
                  <PlatePlaceholder className="size-6" variant={index} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-[999_1_12rem]">
              <p className="truncate text-[15px] font-semibold">
                {item.text[locale]?.name || item.text.nb?.name || item.slug}
              </p>
              <p className="truncate text-[13px] text-muted">
                {categoryName.get(item.categoryId) ?? "—"} ·{" "}
                {formatMinor(item.priceMinor, data.baseCurrency, locale)}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                item.isAvailable ? "bg-veg-soft text-veg" : "bg-chip text-chip-ink"
              }`}
            >
              {item.isAvailable ? t.available : t.soldOut}
            </span>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href={`/admin/items/${item.id}`}
                className="inline-flex h-11 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-ink no-underline hover:border-ink"
              >
                {t.edit}
              </Link>

              <form action={duplicateItem}>
                <input type="hidden" name="id" value={item.id} />
                <GhostButton type="submit">{t.duplicate}</GhostButton>
              </form>

              <ConfirmSubmit
                action={deleteItem}
                hidden={{ id: item.id }}
                label={t.delete}
                title={t.deleteItemTitle}
                body={t.deleteItemBody(item.text[locale]?.name || item.text.nb?.name || item.slug)}
                confirmLabel={t.deleteItemConfirm}
              />
            </div>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface px-5 py-10 text-center text-[15px] text-muted">
          {t.noItemsMatch}
        </p>
      ) : null}
    </div>
  );
}
