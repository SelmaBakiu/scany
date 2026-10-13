"use client";

import { useActionState, useState } from "react";
import { NO_RESULT, type ActionResult } from "@/lib/admin-types";
import type { ActionKey, AdminTextKey } from "@/lib/admin-i18n";
import { ModalSheet } from "../modal-sheet";
import { CheckIcon, CloseIcon } from "../icons";
import { useAdminStrings } from "./admin-locale";

/**
 * The admin's shared form parts.
 *
 * They are written against the same colour tokens as the diner's menu, but the
 * admin shell scopes those tokens to a black-and-white palette (see
 * `[data-chrome="admin"]` in app/globals.css), so `bg-surface` is white here
 * and warm cream over there. Not one of these components knows which.
 */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted">{label}</span>
      {children}
      {hint ? <span className="text-[12px] text-muted">{hint}</span> : null}
    </label>
  );
}

const CONTROL =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted focus:border-accent";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${CONTROL} min-h-24 ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${CONTROL} ${props.className ?? ""}`} />;
}

export function Toggle({
  name,
  defaultChecked,
  label,
  hint,
}: {
  name: string;
  defaultChecked?: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4.5 shrink-0 accent-accent"
      />
      <span>
        <span className="block text-[15px] font-semibold">{label}</span>
        {hint ? <span className="block text-[13px] text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface p-5 md:p-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * `titleKey` for a heading that is UI chrome ("Retter"), `title` for one that
 * is the merchant's own text (a dish name) and must not be translated.
 */
export function SectionHeading({
  title,
  titleKey,
  action,
}: {
  title?: string;
  titleKey?: AdminTextKey;
  action?: React.ReactNode;
}) {
  const t = useAdminStrings();
  const heading = title ?? (titleKey ? t[titleKey] : "");
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-xl font-bold tracking-[-0.02em] md:text-2xl">{heading}</h2>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-[15px] font-semibold text-on-accent hover:bg-accent-strong disabled:opacity-60 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:border-ink disabled:opacity-60 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

/**
 * A form wired to a server action, with its own save button and status line.
 *
 * `useActionState` gives the pending flag and the action's return value in one
 * place, so the button disables itself while saving and the "Lagret"
 * confirmation appears without any state juggling in the calling page.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  extraActions,
}: {
  action: (prev: ActionResult, form: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  submitLabel?: string;
  extraActions?: React.ReactNode;
}) {
  const t = useAdminStrings();
  const [state, formAction, pending] = useActionState(action, NO_RESULT);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {children}

      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 border-t border-line bg-surface/95 px-5 py-3.5 backdrop-blur md:-mx-6 md:px-6">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? t.saving : (submitLabel ?? t.save)}
        </PrimaryButton>
        {extraActions}
        <StatusMessage state={state} />
      </div>
    </form>
  );
}

/**
 * Translates whatever key the server action handed back.
 *
 * `detail` is appended raw when present: it is a Postgres error message, which
 * exists in exactly one language and is more useful verbatim than summarised.
 */
export function StatusMessage({ state }: { state: ActionResult }) {
  const t = useAdminStrings();
  if (!state.key) return null;
  const message = t.result[state.key] + (state.detail ? ` (${state.detail})` : "");
  return (
    <p
      // aria-live so a screen reader announces the save without the user
      // having to go looking for the confirmation.
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ${
        state.ok ? "bg-veg-soft text-veg" : "bg-heat-soft text-heat"
      }`}
    >
      {state.ok ? <CheckIcon size={13} /> : <CloseIcon size={11} />}
      {message}
    </p>
  );
}

/**
 * A destructive button that asks first.
 *
 * The confirmation is the same ModalSheet the diner's filters use, so the
 * admin does not introduce a second dialog style. The actual submit button
 * lives inside the sheet — there is no path to the server action that skips
 * the question.
 */
export function ConfirmSubmit({
  action,
  hidden,
  label,
  title,
  body,
  confirmLabel,
  tone = "danger",
}: {
  action: (form: FormData) => Promise<void>;
  hidden: Record<string, string>;
  label: React.ReactNode;
  title: string;
  body: string;
  confirmLabel: string;
  tone?: "danger" | "neutral";
}) {
  const t = useAdminStrings();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold ${
          tone === "danger"
            ? "border-heat bg-heat-soft text-heat"
            : "border-line-strong bg-surface text-ink hover:border-ink"
        }`}
      >
        {label}
      </button>

      {open ? (
        <form action={action}>
          {Object.entries(hidden).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <ModalSheet
            title={title}
            onClose={() => setOpen(false)}
            closeLabel={t.close}
            footer={
              <div className="flex flex-wrap items-center justify-between gap-3">
                <GhostButton type="button" onClick={() => setOpen(false)}>
                  {t.cancel}
                </GhostButton>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-heat bg-heat-soft px-5 text-[15px] font-semibold text-heat"
                >
                  {confirmLabel}
                </button>
              </div>
            }
          >
            <p className="py-1 text-[15px] leading-relaxed">{body}</p>
          </ModalSheet>
        </form>
      ) : null}
    </>
  );
}

/**
 * A one-off confirmation driven by a ?query=1 after a redirect.
 *
 * Takes the same key as StatusMessage rather than a sentence, so a redirect
 * that happens on the server still lands in the merchant's own language.
 */
export function Flash({ messageKey }: { messageKey: ActionKey | null }) {
  const t = useAdminStrings();
  if (!messageKey) return null;
  return (
    <p
      aria-live="polite"
      className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-veg-soft px-3 py-1.5 text-[13px] font-semibold text-veg"
    >
      <CheckIcon size={13} />
      {t.result[messageKey]}
    </p>
  );
}
