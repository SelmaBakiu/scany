"use client";

import { ModalSheet } from "./modal-sheet";
import { CheckIcon, ChevronDownIcon } from "./icons";

export type SheetOption = {
  value: string;
  label: string;
  /** Smaller text under the label — the currency symbol, the English name. */
  hint?: string;
  /** Two colours drawn as a split circle. Used by the theme picker. */
  swatch?: { ground: string; accent: string };
};

/**
 * A single-choice list rendered inside the shared sheet — language, currency
 * and theme all use this.
 *
 * The rows are real radio inputs with a visually-hidden control, so arrow keys,
 * screen readers and form semantics work; the tick is just the visible state.
 * A list of buttons would have needed `role="radiogroup"` and hand-rolled
 * keyboard handling to get to the same place.
 */
export function OptionSheet({
  title,
  options,
  value,
  onChange,
  onClose,
  closeLabel,
}: {
  title: string;
  options: SheetOption[];
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  closeLabel: string;
}) {
  return (
    <ModalSheet title={title} onClose={onClose} closeLabel={closeLabel}>
      <ul className="flex flex-col gap-1.5 py-1">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <li key={option.value}>
              <label
                // Tapping the row that is ALREADY selected has to close the
                // sheet too. The radio's change event does not fire when the
                // value does not change, so without this a diner who opens the
                // language sheet, sees Norsk ticked and taps it is left staring
                // at an unresponsive sheet.
                onClick={() => {
                  if (selected) onClose();
                }}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 ${
                  selected
                    ? "border-accent bg-accent/10"
                    : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                <input
                  type="radio"
                  name={`option-${title}`}
                  checked={selected}
                  onChange={() => {
                    onChange(option.value);
                    onClose();
                  }}
                  className="sr-only"
                />

                {option.swatch ? (
                  <span
                    aria-hidden
                    className="size-7 shrink-0 overflow-hidden rounded-full border border-line-strong"
                    style={{
                      background: `linear-gradient(135deg, ${option.swatch.ground} 0 50%, ${option.swatch.accent} 50% 100%)`,
                    }}
                  />
                ) : null}

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold">{option.label}</span>
                  {option.hint ? (
                    <span className="block truncate text-[13px] text-muted">{option.hint}</span>
                  ) : null}
                </span>

                <span
                  aria-hidden
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                    selected ? "bg-accent text-on-accent" : "text-transparent"
                  }`}
                >
                  <CheckIcon />
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </ModalSheet>
  );
}

/**
 * The pill in the top bar that opens one of these sheets.
 *
 * Deliberately a plain <button aria-haspopup="dialog">, not a <select>: the
 * brief asked for the pickers to behave like the filter modal, and a native
 * select cannot be made to look like one.
 */
export function SheetTrigger({
  label,
  display,
  icon,
  onClick,
  expanded,
  iconOnlyOnPhone,
}: {
  /** Accessible name, e.g. "Språk". Never shown. */
  label: string;
  display: string;
  icon?: React.ReactNode;
  onClick: () => void;
  expanded: boolean;
  /**
   * Hide the text below `sm`, leaving just the icon. Three preference pills
   * plus a brand do not fit across a 360px phone otherwise.
   */
  iconOnlyOnPhone?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      // The label always names the current value, even when only the icon is
      // drawn — otherwise a screen reader announces "button" and nothing else.
      aria-label={`${label}: ${display}`}
      className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold sm:px-3.5 ${
        expanded ? "border-ink bg-ink text-ground" : "border-line-strong bg-surface text-ink"
      }`}
    >
      {icon}
      <span className={iconOnlyOnPhone ? "hidden sm:inline" : undefined}>{display}</span>
      <ChevronDownIcon
        className={`${iconOnlyOnPhone ? "hidden sm:block" : ""} ${
          expanded ? "text-ground" : "text-muted"
        }`}
      />
    </button>
  );
}
