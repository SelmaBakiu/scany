"use client";

import Link from "next/link";
import { useActionState } from "react";
import { deleteStore, saveStore } from "@/app/management/actions";
import {
  EMPTY_MANAGEMENT_RESULT,
  type ManagedStore,
  type ManagementActionState,
  type ManagementReference,
} from "@/lib/management-types";
import { Card, Field, Input, PrimaryButton, Select, Toggle } from "@/components/admin/ui";

export function StoreManager({
  stores,
  currencies,
  locales,
  deleted,
  deleteFailed,
}: {
  stores: ManagedStore[];
  currencies: ManagementReference[];
  locales: ManagementReference[];
  deleted: boolean;
  deleteFailed: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.03em] md:text-3xl">
          Store management
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Create store accounts, control their public menu address, and update the owner&apos;s
          sign-in credentials. Passwords are never displayed after saving.
        </p>
        {deleted ? (
          <p className="mt-3 inline-flex rounded-full bg-veg-soft px-3 py-1.5 text-sm font-semibold text-veg">
            Store deleted.
          </p>
        ) : null}
        {deleteFailed ? (
          <p className="mt-3 inline-flex rounded-full bg-heat-soft px-3 py-1.5 text-sm font-semibold text-heat">
            The store could not be deleted. No owner account was removed.
          </p>
        ) : null}
      </div>

      <StoreForm currencies={currencies} locales={locales} />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Stores</h2>
          <span className="rounded-full bg-chip px-3 py-1 text-xs font-bold text-chip-ink">
            {stores.length}
          </span>
        </div>

        {stores.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No stores yet. Create the first one above.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {stores.map((store) => (
              <details key={store.id} className="rounded-2xl border border-line bg-surface" open>
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-5 py-4 md:px-6">
                  <span className="font-display text-lg font-bold">{store.name}</span>
                  <code className="rounded-full bg-chip px-2.5 py-1 text-xs text-chip-ink">
                    /m/{store.slug}
                  </code>
                  <span
                    className={`ml-auto rounded-full px-2.5 py-1 text-xs font-bold ${
                      store.isPublished ? "bg-veg-soft text-veg" : "bg-chip text-chip-ink"
                    }`}
                  >
                    {store.isPublished ? "Published" : "Draft"}
                  </span>
                </summary>
                <div className="border-t border-line p-5 md:p-6">
                  <StoreForm store={store} currencies={currencies} locales={locales} />
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StoreForm({
  store,
  currencies,
  locales,
}: {
  store?: ManagedStore;
  currencies: ManagementReference[];
  locales: ManagementReference[];
}) {
  const [state, action, pending] = useActionState(saveStore, EMPTY_MANAGEMENT_RESULT);
  const isNew = !store;
  const defaultCurrency =
    store?.baseCurrency ??
    currencies.find((option) => option.value === "NOK")?.value ??
    currencies[0]?.value ??
    "NOK";
  const defaultLocale =
    store?.defaultLocale ??
    locales.find((option) => option.value === "nb")?.value ??
    locales[0]?.value ??
    "nb";

  return (
    <Card className={isNew ? "border-line-strong" : "border-0 p-0 md:p-0"}>
      {isNew ? (
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Create a store</h2>
          <p className="mt-1 text-sm text-muted">
            This also creates a confirmed owner account and an empty active menu.
          </p>
        </div>
      ) : null}

      <form action={action} className="flex flex-col gap-5">
        {store ? <input type="hidden" name="id" value={store.id} /> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Store name">
            <Input name="name" defaultValue={store?.name ?? ""} required maxLength={120} />
          </Field>
          <Field label="Menu URL slug" hint="The dedicated page will be /m/this-slug">
            <Input
              name="slug"
              defaultValue={store?.slug ?? ""}
              placeholder="central-cafe"
              pattern="[a-zA-Z0-9-]+"
            />
          </Field>
          <Field label="Owner email">
            <Input
              name="ownerEmail"
              type="email"
              defaultValue={store?.ownerEmail ?? ""}
              autoComplete="off"
              required
            />
          </Field>
          <Field
            label={isNew ? "Owner password" : "New owner password"}
            hint={isNew ? "At least 8 characters" : "Leave blank to keep the current password"}
          >
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required={isNew}
            />
          </Field>
          <Field label="Base currency">
            <Select name="baseCurrency" defaultValue={defaultCurrency} required>
              {currencies.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Default language">
            <Select name="defaultLocale" defaultValue={defaultLocale} required>
              {locales.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Toggle
          name="isPublished"
          defaultChecked={store?.isPublished ?? true}
          label="Publish the dedicated menu page"
          hint="Draft stores remain visible to their owner but not to diners."
        />

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Saving…" : isNew ? "Create store" : "Update store"}
          </PrimaryButton>
          {store ? (
            <Link
              href={`/m/${store.slug}`}
              target="_blank"
              className="inline-flex h-11 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-ink no-underline hover:border-ink"
            >
              Open menu page
            </Link>
          ) : null}
          <ManagementStatus state={state} />
        </div>
      </form>

      {store ? (
        <form
          action={deleteStore}
          className="mt-4 border-t border-line pt-4"
          onSubmit={(event) => {
            if (!window.confirm(`Delete ${store.name} and all of its menus, items, and orders?`)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={store.id} />
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-full border border-heat bg-heat-soft px-4 text-sm font-semibold text-heat"
          >
            Delete store
          </button>
        </form>
      ) : null}
    </Card>
  );
}

function ManagementStatus({ state }: { state: ManagementActionState }) {
  if (!state.message) return null;
  return (
    <p
      aria-live="polite"
      className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
        state.ok ? "bg-veg-soft text-veg" : "bg-heat-soft text-heat"
      }`}
    >
      {state.message}
    </p>
  );
}
