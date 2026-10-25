"use client";

import { useEffect, useId, useRef } from "react";
import { CloseIcon } from "./icons";

/**
 * The one sheet.
 *
 * Filters, language, currency and theme all render inside this, which is why
 * they look and behave identically — not because four components were styled
 * to match, but because there is only one.
 *
 * Bottom sheet on a phone, centred dialog from `md` up. Closes on Escape, on a
 * scrim click, and on the X. Scrolls internally when the content is taller than
 * the screen, with the footer pinned.
 */
export function ModalSheet({
  title,
  onClose,
  children,
  footer,
  closeLabel,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeLabel: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Escape closes. Without it a phone user has no obvious way back out.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Move focus into the panel so a keyboard user is not left behind it, and
  // stop the page behind from scrolling while the sheet is open — on iOS that
  // otherwise shows as the menu sliding about under your thumb.
  useEffect(() => {
    panelRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="scrim-enter fixed inset-0 z-40 cursor-default bg-black/45"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sheet-enter fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl border border-line bg-surface shadow-sheet md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[80vh] md:w-[min(44rem,calc(100vw-3rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:shadow-pop"
      >
        {/* Grab handle, phone only — the visual cue that this can be dragged
            away, even though closing is by tap. */}
        <div className="flex shrink-0 justify-center pt-3 md:hidden">
          <span className="h-1.5 w-10 rounded-full bg-line-strong" aria-hidden />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 px-5 pb-3 pt-3 md:px-6 md:pt-5">
          <h2 id={titleId} className="font-display text-lg font-bold tracking-[-0.02em] md:text-xl">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-ink hover:bg-chip"
          >
            <CloseIcon size={13} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 md:px-6">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-line bg-surface px-5 py-3.5 md:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </>
  );
}
