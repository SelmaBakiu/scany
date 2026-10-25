import type { OpeningHours } from "./admin-types";

/**
 * Opening hours, and whether the kitchen is open right now.
 *
 * Two rules drive everything here:
 *
 *   1. "Now" means now in the RESTAURANT's timezone, not the diner's. Someone
 *      checking the menu from another country should see whether the place is
 *      open, not whether it would be open where they are standing.
 *
 *   2. Closing times after midnight are normal. 18:00–01:00 means the 01:00
 *      belongs to the next day, so at 00:30 the restaurant is open because of
 *      YESTERDAY's row, not today's.
 *
 * Day 0 is Monday, which is how Norway counts weeks — not Sunday, which is how
 * JavaScript's getDay() counts them. The conversion happens once, below.
 */

export const DAY_NAMES: Record<string, string[]> = {
  nb: ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  sq: ["E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë", "E diel"],
  it: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"],
};

export const DAY_NAMES_NB = DAY_NAMES.nb;

export function dayNames(locale: string): string[] {
  return DAY_NAMES[locale] ?? DAY_NAMES.en;
}

/** "18:30" -> 1110. Returns null for anything unparseable. */
function toMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

const JS_DAY_TO_MONDAY_FIRST: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/**
 * The restaurant's local weekday (Monday = 0) and minutes since midnight.
 *
 * `now` is injectable so the behaviour around midnight, across a timezone and
 * over a daylight-saving change can be tested with fixed instants instead of
 * whatever the clock happens to say when the suite runs.
 */
export function nowInZone(timeZone: string, now: Date = new Date()): { day: number; minutes: number } {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
  } catch {
    // An invalid or unknown zone: fall back to the device's own time rather
    // than claiming the restaurant is closed.
    const local = now;
    return {
      day: (local.getDay() + 6) % 7,
      minutes: local.getHours() * 60 + local.getMinutes(),
    };
  }

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = JS_DAY_TO_MONDAY_FIRST[get("weekday")] ?? 0;
  // "24" appears at midnight in some runtimes; treat it as 0.
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));

  return { day, minutes: hour * 60 + minute };
}

export type OpenState = {
  isOpen: boolean;
  /** Today in the restaurant's timezone, Monday = 0. */
  today: number;
};

export function openState(
  hours: OpeningHours[],
  timeZone: string,
  now: Date = new Date(),
): OpenState {
  const { day, minutes } = nowInZone(timeZone, now);
  const on = (index: number) => hours.find((h) => h.day === index);

  const today = on(day);
  if (today && !today.closed) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (open !== null && close !== null) {
      // Same-day hours, e.g. 11:00–22:00.
      if (close > open && minutes >= open && minutes < close) return { isOpen: true, today: day };
      // Hours that run past midnight, e.g. 18:00–01:00 — still open tonight.
      if (close <= open && minutes >= open) return { isOpen: true, today: day };
    }
  }

  // Early morning, still inside yesterday's late closing time.
  const yesterday = on((day + 6) % 7);
  if (yesterday && !yesterday.closed) {
    const open = toMinutes(yesterday.open);
    const close = toMinutes(yesterday.close);
    if (open !== null && close !== null && close <= open && minutes < close) {
      return { isOpen: true, today: day };
    }
  }

  return { isOpen: false, today: day };
}

/** "11:00–22:00", or the closed label. */
export function formatHours(entry: OpeningHours | undefined, closedLabel: string): string {
  if (!entry || entry.closed || !entry.open || !entry.close) return closedLabel;
  return `${entry.open}–${entry.close}`;
}
