"use client";

import { useState } from "react";
import {
  deleteCategory,
  moveCategory,
  saveCategory,
  toggleCategoryVisible,
} from "@/app/admin/actions";
import type { AdminCategory, AdminData } from "@/lib/admin-types";
import { adminName } from "@/lib/admin-i18n";
import { ChevronDownIcon } from "../icons";
import { useAdminLocale } from "./admin-locale";
import { ActionForm, Card, ConfirmSubmit, Field, GhostButton, Input, Select, Toggle } from "./ui";

/**
 * Categories: rename, reorder, hide, move between menus, delete.
 *
 * Reordering is up/down buttons rather than drag and drop. Drag needs a
 * pointer, and a merchant doing this on a phone behind the counter has a
 * thumb — the buttons work for both, and for a keyboard.
 */
export function CategoryManager({ data }: { data: AdminData }) {
  const { locale, t } = useAdminLocale();
  const [editing, setEditing] = useState<AdminCategory | "new" | null>(null);

  const name = (c: { names: Record<string, string>; slug: string }) =>
    adminName(c.names, locale, c.slug);
  const menuName = new Map(data.menus.map((m) => [m.id, name(m)]));
  const itemCount = new Map<string, number>();
  for (const item of data.items) {
    itemCount.set(item.categoryId, (itemCount.get(item.categoryId) ?? 0) + 1);
  }

  const byMenu = data.menus.map((menu) => ({
    menu,
    categories: data.categories
      .filter((c) => c.menuId === menu.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <GhostButton type="button" onClick={() => setEditing("new")}>
          {t.newCategory}
        </GhostButton>
      </div>

      {editing ? (
        <Card>
          <h3 className="mb-4 font-display text-lg font-bold tracking-[-0.02em]">
            {editing === "new" ? t.newCategory : t.editCategory(name(editing))}
          </h3>
          <ActionForm action={saveCategory}>
            {editing !== "new" ? <input type="hidden" name="id" value={editing.id} /> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.nameNorwegian}>
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
              <Field label={t.menu}>
                <Select
                  name="menuId"
                  defaultValue={editing === "new" ? (data.menus[0]?.id ?? "") : editing.menuId}
                  required
                >
                  {data.menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {name(menu)}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-end">
                <Toggle
                  name="isVisible"
                  defaultChecked={editing === "new" ? true : editing.isVisible}
                  label={t.visibleOnMenu}
                  hint={t.visibleHint}
                />
              </div>
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

      {byMenu.map(({ menu, categories }) => (
        <section key={menu.id}>
          <h3 className="mb-2 flex flex-wrap items-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] text-muted">
            {name(menu)}
            {menu.isActive ? (
              <span className="rounded-full bg-veg-soft px-2 py-0.5 text-[11px] text-veg">
                {t.activeMenu}
              </span>
            ) : null}
          </h3>

          <ul className="flex flex-col gap-2.5">
            {categories.map((category, index) => (
              <li
                key={category.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3"
              >
                <div className="flex shrink-0 flex-col gap-1">
                  <form action={moveCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      aria-label={t.moveUp(name(category))}
                      className="flex size-7 items-center justify-center rounded-lg border border-line-strong text-ink disabled:opacity-35"
                    >
                      <ChevronDownIcon size={12} className="rotate-180" />
                    </button>
                  </form>
                  <form action={moveCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === categories.length - 1}
                      aria-label={t.moveDown(name(category))}
                      className="flex size-7 items-center justify-center rounded-lg border border-line-strong text-ink disabled:opacity-35"
                    >
                      <ChevronDownIcon size={12} />
                    </button>
                  </form>
                </div>

                <div className="min-w-0 flex-[999_1_10rem]">
                  <p className="truncate text-[15px] font-semibold">{name(category)}</p>
                  <p className="truncate text-[13px] text-muted">
                    {t.dishCount(itemCount.get(category.id) ?? 0)} ·{" "}
                    {menuName.get(category.menuId)}
                  </p>
                </div>

                <form action={toggleCategoryVisible} className="shrink-0">
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="visible" value={category.isVisible ? "false" : "true"} />
                  <button
                    type="submit"
                    className={`inline-flex h-11 items-center rounded-full px-3.5 text-[13px] font-semibold ${
                      category.isVisible
                        ? "bg-veg-soft text-veg"
                        : "border border-line-strong bg-surface text-muted"
                    }`}
                  >
                    {category.isVisible ? t.visible : t.hidden}
                  </button>
                </form>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <GhostButton type="button" onClick={() => setEditing(category)}>
                    {t.edit}
                  </GhostButton>
                  <ConfirmSubmit
                    action={deleteCategory}
                    hidden={{ id: category.id }}
                    label={t.delete}
                    title={t.deleteCategoryTitle}
                    body={
                      (itemCount.get(category.id) ?? 0) > 0
                        ? t.deleteCategoryBodyWithItems(
                            name(category),
                            itemCount.get(category.id) ?? 0,
                          )
                        : t.deleteCategoryBody(name(category))
                    }
                    confirmLabel={t.deleteCategoryConfirm}
                  />
                </div>
              </li>
            ))}
          </ul>

          {categories.length === 0 ? (
            <p className="rounded-2xl border border-line bg-surface px-5 py-6 text-[15px] text-muted">
              {t.noCategoriesYet}
            </p>
          ) : null}
        </section>
      ))}
    </div>
  );
}
