"use client";

import Link from "next/link";
import { useState } from "react";
import { saveItem } from "@/app/admin/actions";
import type { AdminData, AdminItem } from "@/lib/admin-types";
import { adminName, type AdminTextKey } from "@/lib/admin-i18n";
import { pick } from "@/lib/i18n";
import { AiImageButton } from "./ai-image-button";
import { useAdminLocale } from "./admin-locale";
import { ActionForm, Card, Field, Input, Select, Textarea, Toggle } from "./ui";

const KIND_LABELS: Record<string, AdminTextKey> = {
  diet: "tagDiet",
  allergen: "tagAllergen",
  heat: "tagHeat",
  info: "tagInfo",
};

/**
 * Create and edit are the same form; `item` being null is the only difference.
 *
 * Norwegian and English sit side by side rather than behind a language switch,
 * so a merchant writing a new dish can see at a glance that they have filled
 * in both — and that nothing is half-translated. That is separate from the
 * admin's own language, which only relabels the chrome around these fields.
 */
export function ItemForm({ data, item }: { data: AdminData; item: AdminItem | null }) {
  const { locale, t } = useAdminLocale();
  const nb = item?.text.nb;
  const en = item?.text.en;
  const zh = item?.text["zh-CN"];
  const price = item ? (item.priceMinor / 10 ** data.baseCurrency.decimals).toString() : "";

  /*
   * The Norwegian name and short description are controlled, which they do not
   * strictly need to be — but the AI photo button builds its prompt from what
   * is on screen RIGHT NOW. Reading the saved values instead would generate a
   * picture of the dish's previous name, which is exactly wrong when someone
   * is in the middle of renaming it.
   */
  const [nbName, setNbName] = useState(nb?.name ?? "");
  const [nbDescription, setNbDescription] = useState(nb?.description ?? "");

  /*
   * The English fields are controlled too, because the AI photo button prompts
   * with them. The image model is trained on English captions: given the
   * Norwegian it guesses, and the guess is how you get a picture of the wrong
   * dish. Norwegian is only the fallback, for a dish nobody has translated.
   */
  const [enName, setEnName] = useState(en?.name ?? "");
  const [enDescription, setEnDescription] = useState(en?.description ?? "");

  const byKind = ["diet", "allergen", "heat", "info"].map((kind) => ({
    kind,
    tags: data.tags.filter((tag) => tag.kind === kind),
  }));

  return (
    <ActionForm action={saveItem} submitLabel={item ? t.saveChanges : t.createItem}>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t.category}>
            <Select name="categoryId" defaultValue={item?.categoryId ?? ""} required>
              <option value="" disabled>
                {t.chooseCategory}
              </option>
              {[...data.categories]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {adminName(category.names, locale, category.slug)}
                  </option>
                ))}
            </Select>
          </Field>

          <Field label={t.priceLabel(data.baseCurrency.code)} hint={t.priceHint}>
            <Input name="price" defaultValue={price} inputMode="decimal" required />
          </Field>

          <Field label={t.sortOrder} hint={t.sortOrderHint}>
            <Input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
          </Field>

          <div className="flex flex-col justify-end gap-1">
            <Toggle
              name="isAvailable"
              defaultChecked={item ? item.isAvailable : true}
              label={t.availableToggle}
              hint={t.availableHint}
            />
            <Toggle
              name="isFeatured"
              defaultChecked={item?.isFeatured ?? false}
              label={t.featured}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-lg font-bold tracking-[-0.02em]">{t.norwegian}</h3>
        <div className="flex flex-col gap-4">
          <Field label={t.name}>
            <Input
              name="nb_name"
              value={nbName}
              onChange={(event) => setNbName(event.target.value)}
              required
            />
          </Field>
          <Field label={t.shortDescription} hint={t.shortDescriptionHint}>
            <Input
              name="nb_description"
              value={nbDescription}
              onChange={(event) => setNbDescription(event.target.value)}
            />
          </Field>
          <Field label={t.longDescription} hint={t.longDescriptionHint}>
            <Textarea name="nb_descriptionLong" defaultValue={nb?.descriptionLong ?? ""} />
          </Field>
          <Field label={t.ingredients} hint={t.ingredientsHint}>
            <Input name="nb_ingredients" defaultValue={nb?.ingredients ?? ""} />
          </Field>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-lg font-bold tracking-[-0.02em]">{t.english}</h3>
        <div className="flex flex-col gap-4">
          <Field label="Name">
            <Input
              name="en_name"
              value={enName}
              onChange={(event) => setEnName(event.target.value)}
            />
          </Field>
          <Field label="Short description">
            <Input
              name="en_description"
              value={enDescription}
              onChange={(event) => setEnDescription(event.target.value)}
            />
          </Field>
          <Field label="Full description">
            <Textarea name="en_descriptionLong" defaultValue={en?.descriptionLong ?? ""} />
          </Field>
          <Field label="Ingredients">
            <Input name="en_ingredients" defaultValue={en?.ingredients ?? ""} />
          </Field>
        </div>
      </Card>

      {/* Chinese. The field labels are in Chinese rather than translated into
          the admin language: whoever is typing these is reading Chinese. */}
      <Card>
        <h3 className="mb-4 font-display text-lg font-bold tracking-[-0.02em]">{t.chinese}</h3>
        <div className="flex flex-col gap-4">
          <Field label="名称 (Name)">
            <Input name="zh-CN_name" defaultValue={zh?.name ?? ""} />
          </Field>
          <Field label="简短描述 (Short description)">
            <Input name="zh-CN_description" defaultValue={zh?.description ?? ""} />
          </Field>
          <Field label="详细描述 (Full description)">
            <Textarea name="zh-CN_descriptionLong" defaultValue={zh?.descriptionLong ?? ""} />
          </Field>
          <Field label="食材 (Ingredients)">
            <Input name="zh-CN_ingredients" defaultValue={zh?.ingredients ?? ""} />
          </Field>
        </div>
      </Card>

      <Card>
        <h3 className="mb-1 font-display text-lg font-bold tracking-[-0.02em]">{t.tags}</h3>
        <p className="mb-4 text-[13px] text-muted">{t.tagsHint}</p>
        <div className="grid gap-5 md:grid-cols-2">
          {byKind.map(({ kind, tags }) =>
            tags.length === 0 ? null : (
              <fieldset key={kind} className="flex flex-col gap-1">
                <legend className="mb-1 p-0 text-[13px] font-bold uppercase tracking-[0.06em] text-muted">
                  {t[KIND_LABELS[kind]] ?? kind}
                </legend>
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex min-h-10 cursor-pointer items-center gap-2.5 text-[15px]"
                  >
                    <input
                      type="checkbox"
                      name="tag"
                      value={tag.id}
                      defaultChecked={item?.tagIds.includes(tag.id) ?? false}
                      className="size-4.5 accent-accent"
                    />
                    {pick(tag.labels, locale)}
                  </label>
                ))}
              </fieldset>
            ),
          )}
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-lg font-bold tracking-[-0.02em]">{t.image}</h3>
        <AiImageButton
          itemId={item?.id ?? null}
          currentUrl={item?.imageUrl ?? null}
          hint={enName || item?.imagePrompt ? null : "en-missing"}
        />

        <div className="mt-5 border-t border-line pt-5">
          <Field label={t.imagePrompt} hint={t.imagePromptHint}>
            <Textarea name="imagePrompt" defaultValue={item?.imagePrompt ?? ""} />
          </Field>
        </div>
        <div className="mt-5 flex min-w-0 flex-col gap-3 border-t border-line pt-5">
          <Field label={t.uploadImage} hint={t.uploadImageHint}>
            <Input name="image" type="file" accept="image/*" />
          </Field>
          {item?.imageUrl ? <Toggle name="removeImage" label={t.removeImage} /> : null}
        </div>
      </Card>

      <Link
        href="/admin/items"
        className="text-sm font-semibold text-muted underline hover:text-ink"
      >
        {t.backToList}
      </Link>
    </ActionForm>
  );
}
