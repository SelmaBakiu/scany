"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin/actions";
import { NO_RESULT } from "@/lib/admin-types";
import { MarkIcon } from "../icons";
import { AdminLanguagePicker, useAdminStrings } from "./admin-locale";
import { Field, Input, PrimaryButton, StatusMessage } from "./ui";

/**
 * The whole sign-in page, not just the form.
 *
 * It owns the page because every word on it is translated, including the
 * heading and the footnote — and because the language picker has to be
 * reachable before you are signed in. Someone who does not read Norwegian
 * should not have to guess which box is the password.
 */
export function LoginPanel({ next }: { next: string }) {
  const t = useAdminStrings();
  const [state, formAction, pending] = useActionState(signIn, NO_RESULT);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ground px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-ink text-ground">
            <MarkIcon size={22} />
          </span>
          <span className="font-display text-2xl font-bold tracking-[-0.02em]">MenuScan</span>
          <span className="ml-auto">
            <AdminLanguagePicker />
          </span>
        </div>

        <h1 className="font-display text-[26px] font-bold tracking-[-0.03em]">{t.loginTitle}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.loginIntro}</p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />

          <Field label={t.loginEmail}>
            <Input
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder={t.loginEmailPlaceholder}
            />
          </Field>

          <Field label={t.loginPassword}>
            <Input name="password" type="password" autoComplete="current-password" required />
          </Field>

          <div className="flex flex-col gap-3">
            <PrimaryButton type="submit" disabled={pending} className="w-full">
              {pending ? t.loginPending : t.loginSubmit}
            </PrimaryButton>
            <StatusMessage state={state} />
          </div>
        </form>

        <p className="mt-6 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
          {t.loginFootnote}
        </p>
      </div>
    </main>
  );
}
