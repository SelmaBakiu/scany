"use client";

import { useActionState, useState } from "react";
import { saveTheme } from "@/app/admin/actions";
import { NO_RESULT } from "@/lib/admin-types";
import { THEMES, type ThemeId } from "@/lib/themes";
import { pick } from "@/lib/i18n";
import { useAdminLocale } from "./admin-locale";
import { Card, PrimaryButton, StatusMessage } from "./ui";
import { CheckIcon, MarkIcon, SearchIcon } from "../icons";

/**
 * The merchant picks one theme; every diner gets it.
 *
 * The preview is not a picture — it is a real `data-theme` wrapper around real
 * markup using the same tokens as the menu, so what you see is exactly what
 * the diner gets. Selecting a theme changes the preview immediately; nothing
 * reaches the database until Lagre.
 */
export function ThemePicker({ current, name }: { current: string; name: string }) {
  const { locale, t } = useAdminLocale();
  const [selected, setSelected] = useState<ThemeId>(
    (THEMES.find((t) => t.id === current)?.id ?? "lys") as ThemeId,
  );
  const [state, formAction, pending] = useActionState(saveTheme, NO_RESULT);

  const dirty = selected !== current;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="theme" value={selected} />

      <Card>
        <h3 className="mb-1 font-display text-lg font-bold tracking-[-0.02em]">{t.chooseTheme}</h3>
        <p className="mb-4 text-[13px] text-muted">
          {t.chooseThemeHint} {t.adminStaysMono}
        </p>

        <ul className="grid gap-2.5 sm:grid-cols-2">
          {THEMES.map((theme) => {
            const active = theme.id === selected;
            return (
              <li key={theme.id}>
                <label
                  className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 ${
                    active ? "border-accent bg-accent/10" : "border-line hover:border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="theme-choice"
                    checked={active}
                    onChange={() => setSelected(theme.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className="size-7 shrink-0 rounded-full border border-line-strong"
                    style={{
                      background: `linear-gradient(135deg, ${theme.swatch.ground} 0 50%, ${theme.swatch.accent} 50% 100%)`,
                    }}
                  />
                  <span className="flex-1 text-[15px] font-semibold">
                    {pick(theme.labels, locale)}
                  </span>
                  {theme.id === current ? (
                    <span className="rounded-full bg-chip px-2 py-0.5 text-[11px] font-semibold text-chip-ink">
                      {t.saved}
                    </span>
                  ) : null}
                  <span
                    aria-hidden
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                      active ? "bg-accent text-on-accent" : "text-transparent"
                    }`}
                  >
                    <CheckIcon />
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <h3 className="mb-1 font-display text-lg font-bold tracking-[-0.02em]">{t.preview}</h3>
        <p className="mb-4 text-[13px] text-muted">{t.previewHint}</p>
        <ThemePreview theme={selected} name={name} />
      </Card>

      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 border-t border-line bg-surface/95 px-5 py-3.5 backdrop-blur md:-mx-6 md:px-6">
        <PrimaryButton type="submit" disabled={pending || !dirty}>
          {pending ? t.saving : dirty ? t.saveTheme : t.saved}
        </PrimaryButton>
        <StatusMessage state={state} />
      </div>
    </form>
  );
}

/**
 * A miniature of the real menu, rendered inside the chosen theme.
 *
 * This is the one place in the admin where theme colour appears. It works
 * because `data-theme` here sits INSIDE `data-chrome="admin"`, and an
 * element's own custom properties beat an ancestor's — so the preview is the
 * real thing while the page around it stays black and white. It is markup, not
 * a screenshot, using the same tokens the diner's menu uses.
 */
function ThemePreview({ theme, name }: { theme: ThemeId; name: string }) {
  return (
    <div
      data-theme={theme}
      className="overflow-hidden rounded-2xl border border-line bg-ground text-ink"
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface px-3.5 py-2.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-ink text-ground">
          <MarkIcon size={15} />
        </span>
        <span className="truncate font-display text-[15px] font-bold tracking-[-0.02em]">{name}</span>
        <span className="ml-auto flex h-8 items-center gap-2 rounded-full border border-line-strong px-3 text-[12px] font-semibold">
          NO
        </span>
      </div>

      <div className="border-b border-line bg-tint px-3.5 py-3">
        <p className="font-display text-base font-bold tracking-[-0.02em]">Middagsmeny</p>
      </div>

      <div className="flex gap-2 px-3.5 py-2.5">
        <span className="inline-flex h-8 items-center rounded-full bg-accent px-3 text-[12px] font-semibold text-on-accent">
          Forretter
        </span>
        <span className="inline-flex h-8 items-center rounded-full border border-line-strong bg-surface px-3 text-[12px] font-semibold">
          Pizza
        </span>
      </div>

      <div className="px-3.5 pb-3.5">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-tint text-faint">
            <SearchIcon size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[14px] font-semibold">Hvitløksbrød</span>
              <span className="shrink-0 text-[14px] font-bold">95 kr</span>
            </span>
            <span className="mt-0.5 block truncate text-[12px] text-muted">
              Sprøtt surdeigsbrød med hvitløkssmør
            </span>
            <span className="mt-1.5 flex gap-1.5">
              <span className="rounded-full bg-veg-soft px-2 py-0.5 text-[10px] font-semibold text-veg">
                Vegetar
              </span>
              <span className="rounded-full bg-chip px-2 py-0.5 text-[10px] font-semibold text-chip-ink">
                Inneholder melk
              </span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
