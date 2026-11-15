"use client";

import { useState } from "react";
import { normalize } from "@/lib/i18n";
import { ModalSheet } from "./modal-sheet";
import { CheckIcon, CloseIcon, SearchIcon } from "./icons";

export type SearchSheetOption = {
  value: string;
  title: string;
  subtitle?: string;
  /** Short text in the round chip at the start of the row: "NO", "kr". */
  badge: string;
  /** Extra words the search matches on, beyond title and subtitle. */
  keywords?: string[];
  /** BCP-47 tag of the title's language, for screen readers. */
  lang?: string;
};

/**
 * A long single-choice list with a search box: "Frequently used" on top, then
 * everything. The language and currency pickers both use it.
 *
 * Not an OptionSheet because an option can appear in both lists at once
 * (Norsk is frequent AND in the full list), and a radio group cannot hold the
 * same value twice. The rows are buttons with aria-pressed instead.
 *
 * `translate="no"` on the rows keeps Google Translate away from them: a list
 * of language names translated into Japanese is no help to a German.
 */
export function SearchSheet({
  title,
  options,
  frequent,
  value,
  onChange,
  onClose,
  labels,
  footer,
}: {
  title: string;
  options: SearchSheetOption[];
  /** Values to pin under "Frequently used", in order. Unknown ones are skipped. */
  frequent: string[];
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  labels: {
    close: string;
    clearSearch: string;
    searchPlaceholder: string;
    frequentlyUsed: string;
    all: string;
    searchResults: string;
    notFound: string;
  };
  footer?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");

  const pinned = [...new Set(frequent)]
    .map((v) => options.find((o) => o.value === v))
    .filter((o): o is SearchSheetOption => Boolean(o));

  const needle = normalize(query.trim());
  const results = needle
    ? options.filter((o) =>
        [o.title, o.subtitle ?? "", o.value, ...(o.keywords ?? [])].some((text) =>
          normalize(text).includes(needle),
        ),
      )
    : options;

  function choose(next: string) {
    onChange(next);
    onClose();
  }

  return (
    <ModalSheet title={title} onClose={onClose} closeLabel={labels.close} footer={footer}>
      <div className="sticky top-0 z-10 -mx-1 bg-surface px-1 pb-3 pt-1">
        <div
          className={`flex h-11 items-center gap-2.5 rounded-full border px-4 ${
            query ? "border-ink bg-surface" : "border-line bg-tint"
          }`}
        >
          <SearchIcon className={query ? "text-ink" : "text-muted"} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
            className="min-w-0 flex-grow bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={labels.clearSearch}
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-chip text-chip-ink"
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>
      </div>

      {!needle && pinned.length > 0 ? (
        <Group title={labels.frequentlyUsed}>
          {pinned.map((option) => (
            <Row key={option.value} option={option} selected={option.value === value} onSelect={choose} />
          ))}
        </Group>
      ) : null}

      <Group title={needle ? labels.searchResults : labels.all}>
        {results.length > 0 ? (
          results.map((option) => (
            <Row key={option.value} option={option} selected={option.value === value} onSelect={choose} />
          ))
        ) : (
          <li className="rounded-xl border border-dashed border-line px-3.5 py-4 text-center text-[15px] text-muted">
            {labels.notFound}
          </li>
        )}
      </Group>
    </ModalSheet>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pb-3">
      <h3 className="px-1 pb-2 pt-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">
        {title}
      </h3>
      <ul className="flex flex-col gap-1.5">{children}</ul>
    </section>
  );
}

function Row({
  option,
  selected,
  onSelect,
}: {
  option: SearchSheetOption;
  selected: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        lang={option.lang}
        translate="no"
        aria-pressed={selected}
        onClick={() => onSelect(option.value)}
        className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left ${
          selected
            ? "border-accent bg-accent/10"
            : "border-line bg-surface hover:border-line-strong"
        }`}
      >
        <span
          aria-hidden
          className="flex h-7 min-w-9 shrink-0 items-center justify-center rounded-full bg-chip px-1.5 text-[11px] font-bold text-chip-ink"
        >
          {option.badge}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{option.title}</span>
          {option.subtitle ? (
            <span className="block truncate text-[13px] text-muted">{option.subtitle}</span>
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
      </button>
    </li>
  );
}
