"use client";

import { useState } from "react";
import { activateMenu, deleteMenu, saveMenu } from "@/app/admin/actions";
import type { AdminData, AdminMenu } from "@/lib/admin-types";
import { adminName } from "@/lib/admin-i18n";
import { useAdminLocale } from "./admin-locale";
import { ActionForm, Card, ConfirmSubmit, Field, GhostButton, Input } from "./ui";

/**
 * Menus: Lunsj, Middag, Drikkemeny — one of them live at a time.
 *
 * Which dishes are in a menu is decided one level down: a dish belongs to a
 * category, and a category belongs to a menu. Moving a whole category between
 * menus is done on the Kategorier tab, which is why this page lists the
 * categories each menu holds but does not edit them.
 */
export function MenuManager({ data }: { data: AdminData }) {
  const { locale, t } = useAdminLocale();
  const [editing, setEditing] = useState<AdminMenu | "new" | null>(null);
  const name = (m: AdminMenu) => adminName(m.names, locale, m.slug);

  const stats = new Map<string, { categories: number; items: number }>();
  for (const menu of data.menus) stats.set(menu.id, { categories: 0, items: 0 });
  for (const category of data.categories) {
    const entry = stats.get(category.menuId);
    if (!entry) continue;
    entry.categories += 1;
    entry.items += data.items.filter((i) => i.categoryId === category.id).length;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <GhostButton type="button" onClick={() => setEditing("new")}>
          {t.newMenu}
        </GhostButton>
      </div>

      {editing ? (
        <Card>
          <h3 className="mb-4 font-display text-lg font-bold tracking-[-0.02em]">
            {editing === "new" ? t.newMenu : t.editMenu(name(editing))}
          </h3>
          <ActionForm action={saveMenu}>
            {editing !== "new" ? <input type="hidden" name="id" value={editing.id} /> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.nameNorwegian} hint={t.menuNameHint}>
                <Input
                  name="nb_name"
                  defaultValue={editing === "new" ? "" : (editing.names.nb ?? "")}
                  required
                />
              </Field>
              <Field label={t.nameEnglish}>
                <Input
                  name="en_name"
                  defaultValue={editing === "new" ? "" : (editing.names.en ?? "")}
                />
              </Field>
              <Field label={t.nameChinese}>
                <Input
                  name="zh-CN_name"
                  defaultValue={editing === "new" ? "" : (editing.names['zh-CN'] ?? "")}
                />
              </Field>
            </div>
          </ActionForm>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="mt-3 text-sm font-semibold text-muted underline hover:text-ink"
          >
            {t.close}
          </button>
        </Card>
      ) : null}

      <ul className="flex flex-col gap-2.5">
        {data.menus.map((menu) => {
          const stat = stats.get(menu.id) ?? { categories: 0, items: 0 };
          return (
            <li
              key={menu.id}
              className={`flex flex-wrap items-center gap-3 rounded-2xl border bg-surface p-3.5 ${
                menu.isActive ? "border-accent" : "border-line"
              }`}
            >
              <div className="min-w-0 flex-[999_1_11rem]">
                <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                  {name(menu)}
                  {menu.isActive ? (
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-on-accent">
                      {t.showingNow}
                    </span>
                  ) : null}
                </p>
                <p className="text-[13px] text-muted">{t.menuStats(stat.categories, stat.items)}</p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {menu.isActive ? null : (
                  <form action={activateMenu}>
                    <input type="hidden" name="id" value={menu.id} />
                    <button
                      type="submit"
                      className="inline-flex h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-strong"
                    >
                      {t.makeActive}
                    </button>
                  </form>
                )}

                <GhostButton type="button" onClick={() => setEditing(menu)}>
                  {t.edit}
                </GhostButton>

                {menu.isActive ? (
                  <span className="inline-flex h-11 items-center rounded-full border border-line px-4 text-sm font-semibold text-muted">
                    {t.cannotDelete}
                  </span>
                ) : (
                  <ConfirmSubmit
                    action={deleteMenu}
                    hidden={{ id: menu.id }}
                    label={t.delete}
                    title={t.deleteMenuTitle}
                    body={t.deleteMenuBody(name(menu), stat.categories, stat.items)}
                    confirmLabel={t.deleteMenuConfirm}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[13px] leading-relaxed text-muted">{t.menusExplainer}</p>
    </div>
  );
}
