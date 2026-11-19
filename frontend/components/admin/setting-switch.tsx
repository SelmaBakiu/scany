"use client";

import { useState, useTransition } from "react";
import {
  setCurrencyConversionEnabled,
  setOrderingEnabled,
  setShowPhotos,
} from "@/app/admin/actions";
import { NO_RESULT, type ActionResult } from "@/lib/admin-types";
import type { AdminTextKey } from "@/lib/admin-i18n";
import { useAdminStrings } from "./admin-locale";
import { Card, StatusMessage } from "./ui";

/**
 * The actions a switch may call. Named here rather than passed as a prop so
 * the server pages can render a switch without handing a function across the
 * server/client boundary.
 */
const ACTIONS = {
  ordering: setOrderingEnabled,
  currency: setCurrencyConversionEnabled,
  photos: setShowPhotos,
} satisfies Record<string, (enabled: boolean) => Promise<ActionResult>>;

/**
 * An on/off switch that saves the moment it is flipped — no Save button.
 *
 * Optimistic: it moves at once, and moves back if the server refuses.
 */
export function SettingSwitch({
  setting,
  initial,
  labelKey,
  hintKey,
}: {
  setting: keyof typeof ACTIONS;
  initial: boolean;
  labelKey: AdminTextKey;
  hintKey?: AdminTextKey;
}) {
  const t = useAdminStrings();
  const [on, setOn] = useState(initial);
  const [result, setResult] = useState<ActionResult>(NO_RESULT);
  const [pending, startTransition] = useTransition();

  function flip() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const outcome = await ACTIONS[setting](next);
      if (!outcome.ok) setOn(!next);
      setResult(outcome);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="block text-[15px] font-semibold">{t[labelKey]}</span>
          {hintKey ? <span className="block text-[13px] text-muted">{t[hintKey]}</span> : null}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={t[labelKey]}
          disabled={pending}
          onClick={flip}
          className={`inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full border px-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
            on ? "border-ink bg-ink text-ground" : "border-line-strong bg-surface text-ink"
          }`}
        >
          <span
            aria-hidden
            className={`relative inline-block h-5 w-9 rounded-full transition-colors ${
              on ? "bg-ground/30" : "bg-line-strong"
            }`}
          >
            <span
              className={`absolute top-0.5 size-4 rounded-full transition-all ${
                on ? "left-[1.125rem] bg-ground" : "left-0.5 bg-surface"
              }`}
            />
          </span>
          {on ? t.switchOn : t.switchOff}
        </button>
      </div>
      <div className="self-start">
        <StatusMessage state={result} />
      </div>
    </div>
  );
}

/** The top of the Menus page: what the guest's menu shows. */
export function DisplaySettings({
  showPhotos,
  currencyConversionEnabled,
}: {
  showPhotos: boolean;
  currencyConversionEnabled: boolean;
}) {
  const t = useAdminStrings();
  return (
    <Card>
      <h3 className="mb-1 font-display text-lg font-bold tracking-[-0.02em]">{t.displaySection}</h3>
      <p className="mb-4 text-[13px] text-muted">{t.displaySectionHint}</p>
      <div className="flex flex-col gap-4">
        <SettingSwitch
          setting="photos"
          initial={showPhotos}
          labelKey="showPhotos"
          hintKey="showPhotosHint"
        />
        <SettingSwitch
          setting="currency"
          initial={currencyConversionEnabled}
          labelKey="currencyConversion"
          hintKey="currencyConversionHint"
        />
      </div>
    </Card>
  );
}

/** The top of the Orders page: the ordering master switch. */
export function OrderingSwitchCard({ enabled }: { enabled: boolean }) {
  return (
    <Card>
      <SettingSwitch
        setting="ordering"
        initial={enabled}
        labelKey="orderingEnabled"
        hintKey="orderingEnabledHint"
      />
    </Card>
  );
}
