"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { pick, type UiStrings } from "@/lib/i18n";
import { dayNames, formatHours, openState } from "@/lib/opening-hours";
import type { RestaurantInfo } from "@/lib/types";
import { ModalSheet } from "./modal-sheet";
import { InfoIcon } from "./icons";

/**
 * "Restaurantinfo" — address, hours, how to get in touch.
 *
 * Rendered in the same sheet as the filters, so it is one more thing in a
 * pattern the diner has already met rather than a new kind of window.
 */
export function RestaurantInfoSheet({
  name,
  info,
  locale,
  strings,
  onClose,
}: {
  name: string;
  info: RestaurantInfo;
  locale: string;
  strings: UiStrings;
  onClose: () => void;
}) {
  const days = dayNames(locale);
  const status = useOpenState(info);
  const description = pick(info.descriptions, locale);

  return (
    <ModalSheet title={strings.restaurantInfo} onClose={onClose} closeLabel={strings.close}>
      <div className="flex flex-col gap-6 py-1">
        <div className="flex items-center gap-4">
          {info.logoUrl ? (
            <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-line bg-tint">
              <Image src={info.logoUrl} alt="" fill sizes="64px" className="object-contain p-1.5" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="font-display text-xl font-bold tracking-[-0.02em]">{name}</h3>
            {status ? (
              <p
                className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold ${
                  status.isOpen ? "bg-veg-soft text-veg" : "bg-chip text-chip-ink"
                }`}
              >
                <span
                  aria-hidden
                  className={`size-2 rounded-full ${status.isOpen ? "bg-veg" : "bg-chip-ink"}`}
                />
                {status.isOpen ? strings.openNow : strings.closedNow}
              </p>
            ) : null}
          </div>
        </div>

        {description ? (
          <p className="max-w-[60ch] text-[15px] leading-relaxed text-muted">{description}</p>
        ) : null}

        {info.openingHours.length > 0 ? (
          <section>
            <h4 className="text-[13px] font-bold uppercase tracking-[0.07em] text-muted">
              {strings.openingHours}
            </h4>
            <ul className="mt-2 flex flex-col">
              {days.map((dayName, day) => {
                const entry = info.openingHours.find((h) => h.day === day);
                const isToday = status?.today === day;
                return (
                  <li
                    key={day}
                    aria-current={isToday ? "date" : undefined}
                    className={`flex items-center justify-between gap-4 rounded-lg px-2.5 py-1.5 text-[15px] ${
                      isToday ? "bg-tint font-semibold" : ""
                    }`}
                  >
                    <span>{dayName}</span>
                    <span className={entry?.closed ? "text-muted" : ""}>
                      {formatHours(entry, strings.closedLabel)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="flex flex-col gap-2">
          {info.address ? (
            <InfoRow label={strings.address} value={info.address} href={info.mapsUrl || undefined} linkLabel={strings.showOnMap} />
          ) : null}
          {info.phone ? (
            <InfoRow label={strings.phone} value={info.phone} href={`tel:${info.phone.replace(/\s/g, "")}`} />
          ) : null}
          {info.email ? (
            <InfoRow label={strings.email} value={info.email} href={`mailto:${info.email}`} />
          ) : null}
        </section>

        {info.socials.length > 0 ? (
          <section>
            <h4 className="text-[13px] font-bold uppercase tracking-[0.07em] text-muted">
              {strings.followUs}
            </h4>
            <ul className="mt-2 flex flex-wrap gap-2">
              {info.socials.map((social) => (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex h-11 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-ink no-underline hover:border-ink"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </ModalSheet>
  );
}

function InfoRow({
  label,
  value,
  href,
  linkLabel,
}: {
  label: string;
  value: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg px-2.5 py-1.5">
      <span className="w-20 shrink-0 text-[13px] font-bold uppercase tracking-[0.06em] text-muted">
        {label}
      </span>
      <span className="min-w-0 flex-1 text-[15px]">
        {href && !linkLabel ? (
          <a href={href} className="font-semibold">
            {value}
          </a>
        ) : (
          value
        )}
      </span>
      {href && linkLabel ? (
        <a href={href} target="_blank" rel="noreferrer noopener" className="text-sm font-semibold">
          {linkLabel}
        </a>
      ) : null}
    </div>
  );
}

/**
 * Whether the kitchen is open, worked out on the client.
 *
 * It cannot be done on the server: the menu page is cached for a minute, so a
 * server-rendered "Åpen nå" would be stale — and wrong for up to a minute
 * either side of opening. Starting as null and filling in after mount also
 * keeps the server and client markup identical, so hydration stays quiet.
 */
function useOpenState(info: RestaurantInfo) {
  const [state, setState] = useState<ReturnType<typeof openState> | null>(null);

  useEffect(() => {
    const update = () => setState(openState(info.openingHours, info.timezone));
    update();
    // Re-check every minute so the badge flips while the sheet is open.
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [info.openingHours, info.timezone]);

  return state;
}

/** The pill in the top bar that opens the sheet. */
export function RestaurantInfoTrigger({
  label,
  onClick,
  expanded,
}: {
  label: string;
  onClick: () => void;
  expanded: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      aria-label={label}
      className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold sm:px-3.5 ${
        expanded ? "border-ink bg-ink text-ground" : "border-line-strong bg-surface text-ink"
      }`}
    >
      <InfoIcon className="shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
