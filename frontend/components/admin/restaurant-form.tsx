"use client";

import Image from "next/image";
import { saveRestaurant } from "@/app/admin/actions";
import type { AdminRestaurant } from "@/lib/admin-types";
import { dayNames } from "@/lib/opening-hours";
import { useAdminLocale } from "./admin-locale";
import { ActionForm, Card, Field, Input, Textarea, Toggle } from "./ui";

/** Everything the "Restaurantinfo" sheet shows the diner. */
export function RestaurantForm({ restaurant }: { restaurant: AdminRestaurant }) {
  const { locale, t } = useAdminLocale();
  const days = dayNames(locale);
  const socials = [...restaurant.socials, ...Array(4).fill({ label: "", url: "" })].slice(0, 4);

  return (
    <ActionForm action={saveRestaurant}>
      <Card>
        <h3 className="mb-4 font-display text-lg font-bold tracking-[-0.02em]">{t.nameAndLogo}</h3>
        <div className="flex flex-col gap-4">
          <Field label={t.name}>
            <Input name="name" defaultValue={restaurant.name} required />
          </Field>

          <div className="flex flex-wrap items-start gap-5">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-line bg-tint">
              {restaurant.logoUrl ? (
                <Image
                  src={restaurant.logoUrl}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[13px] text-muted">
                  {t.none}
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Field label={t.uploadLogo} hint={t.uploadLogoHint}>
                <Input name="logo" type="file" accept="image/*" />
              </Field>
              {restaurant.logoUrl ? <Toggle name="removeLogo" label={t.removeLogo} /> : null}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-lg font-bold tracking-[-0.02em]">{t.description}</h3>
        <div className="flex flex-col gap-4">
          <Field label={t.norwegian}>
            <Textarea name="nb_description" defaultValue={restaurant.descriptions.nb ?? ""} />
          </Field>
          <Field label={t.english}>
            <Textarea name="en_description" defaultValue={restaurant.descriptions.en ?? ""} />
          </Field>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-lg font-bold tracking-[-0.02em]">{t.contact}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t.address}>
            <Input name="address" defaultValue={restaurant.address} />
          </Field>
          <Field label={t.mapsUrl} hint={t.mapsUrlHint}>
            <Input name="mapsUrl" type="url" defaultValue={restaurant.mapsUrl} />
          </Field>
          <Field label={t.phone} hint={t.phoneHint}>
            <Input name="phone" type="tel" defaultValue={restaurant.phone} />
          </Field>
          <Field label={t.email}>
            <Input name="email" type="email" defaultValue={restaurant.email} />
          </Field>
          <Field label={t.timezone} hint={t.timezoneHint}>
            <Input name="timezone" defaultValue={restaurant.timezone} />
          </Field>
        </div>
      </Card>

      <Card>
        <h3 className="mb-1 font-display text-lg font-bold tracking-[-0.02em]">
          {t.orderingSection}
        </h3>
        <p className="mb-4 text-[13px] text-muted">{t.orderingEnabledHint}</p>
        <Toggle
          name="orderingEnabled"
          defaultChecked={restaurant.orderingEnabled}
          label={t.orderingEnabled}
        />
      </Card>

      <Card>
        <h3 className="mb-1 font-display text-lg font-bold tracking-[-0.02em]">{t.openingHours}</h3>
        <p className="mb-4 text-[13px] text-muted">{t.openingHoursHint}</p>
        <div className="flex flex-col gap-2.5">
          {days.map((dayName, day) => {
            const hours = restaurant.openingHours.find((h) => h.day === day);
            return (
              <div
                key={day}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line px-3.5 py-2.5"
              >
                <span className="w-20 shrink-0 text-[15px] font-semibold">{dayName}</span>
                <label className="flex items-center gap-2 text-[14px]">
                  <input
                    type="checkbox"
                    name={`day_${day}_closed`}
                    defaultChecked={hours?.closed ?? false}
                    className="size-4.5 accent-accent"
                  />
                  {t.closed}
                </label>
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <input
                    type="time"
                    name={`day_${day}_open`}
                    defaultValue={hours?.open || "11:00"}
                    aria-label={t.opensAt(dayName)}
                    className="h-11 rounded-xl border border-line-strong bg-surface px-3 text-[15px] text-ink"
                  />
                  <span className="text-muted">–</span>
                  <input
                    type="time"
                    name={`day_${day}_close`}
                    defaultValue={hours?.close || "22:00"}
                    aria-label={t.closesAt(dayName)}
                    className="h-11 rounded-xl border border-line-strong bg-surface px-3 text-[15px] text-ink"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="mb-1 font-display text-lg font-bold tracking-[-0.02em]">{t.socials}</h3>
        <p className="mb-4 text-[13px] text-muted">{t.socialsHint}</p>
        <div className="flex flex-col gap-3">
          {socials.map((social, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[10rem_1fr]">
              <Input
                name={`social_${index}_label`}
                defaultValue={social.label}
                placeholder="Instagram"
                aria-label={`${t.socialName} ${index + 1}`}
              />
              <Input
                name={`social_${index}_url`}
                type="url"
                defaultValue={social.url}
                placeholder="https://…"
                aria-label={`${t.socialUrl} ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </Card>
    </ActionForm>
  );
}
