"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { generateItemImage } from "@/app/admin/actions";
import { NO_RESULT, type ActionResult } from "@/lib/admin-types";
import { SparkIcon } from "../icons";
import { useAdminStrings } from "./admin-locale";
import { GhostButton, StatusMessage } from "./ui";

/**
 * "Generer AI-bilde" — one dish, one picture, saved immediately.
 *
 * Three things about it that are deliberate:
 *
 * 1. It is `type="button"` and calls the server action directly rather than
 *    submitting. It sits INSIDE the dish form, and a submit here would save
 *    the whole form as a side effect of asking for a photo.
 *
 * 2. It reads the name and description from the live form fields, not from the
 *    saved row, so renaming a dish and generating a photo in the same sitting
 *    gives a picture of the new name.
 *
 * 3. It needs a saved dish to attach the photo to, so on a brand-new dish it
 *    is disabled with an explanation instead of hidden. A button that vanishes
 *    reads as a bug; a disabled one with a reason reads as an instruction.
 *
 * Generation is slow — a free service, 10–40 seconds is normal — so the
 * pending state is a real part of the design rather than an afterthought.
 */
export function AiImageButton({
  itemId,
  currentUrl,
  hint,
}: {
  itemId: string | null;
  currentUrl: string | null;
  /** "en-missing": prompting from Norwegian, which gives worse pictures. */
  hint?: "en-missing" | null;
}) {
  const t = useAdminStrings();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult>(NO_RESULT);
  const [preview, setPreview] = useState<string | null>(null);

  const shown = preview ?? currentUrl;
  const canGenerate = Boolean(itemId) && !pending;

  function generate() {
    if (!itemId) return;
    startTransition(async () => {
      const next = await generateItemImage(itemId);
      setResult(next);
      // A new path every time, so the <img> src genuinely changes and the
      // browser cannot serve the previous picture from cache.
      if (next.imageUrl) setPreview(next.imageUrl);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start gap-4">
        <span className="relative size-28 shrink-0 overflow-hidden rounded-xl border border-line bg-tint">
          {shown ? (
            <Image src={shown} alt="" fill sizes="112px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[12px] text-faint">
              {t.none}
            </span>
          )}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* self-start so it hugs its label, like every other admin button —
              a flex column would otherwise stretch it across the whole card. */}
          <GhostButton
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            className="self-start"
          >
            <SparkIcon />
            {pending ? t.generatingImage : t.generateImage}
          </GhostButton>

          <p className="text-[13px] leading-relaxed text-muted">
            {itemId ? t.generateImageHint : t.generateImageSaveFirst}
          </p>

          {hint === "en-missing" && itemId ? (
            <p className="text-[13px] font-semibold leading-relaxed text-heat">
              {t.generateImageNeedsEnglish}
            </p>
          ) : null}

          {preview ? (
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
              {t.aiPreviewLabel}
            </p>
          ) : null}
        </div>
      </div>

      <StatusMessage state={result} />
    </div>
  );
}
