"use client";

import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { parseTableList, tableUrl } from "@/lib/table-list";
import { DownloadIcon } from "../icons";
import { useAdminStrings } from "./admin-locale";
import { Card, Field, GhostButton, Input, SectionHeading } from "./ui";

/**
 * A printable QR code per table.
 *
 * Generated in the browser, not on the server: the codes are a function of the
 * site's own address and a table number, so there is nothing to fetch and
 * nothing to store. The merchant changes "12" to "20" and twenty codes appear
 * as they type.
 *
 * PNG rather than SVG for the download, because these end up in Word, on a
 * label printer, or in whatever a print shop asks for, and a PNG opens
 * everywhere.
 */
export function QrCodes({ restaurantSlug }: { restaurantSlug: string }) {
  const t = useAdminStrings();
  const [tables, setTables] = useState("12");
  const [baseUrl, setBaseUrl] = useState("");

  // The address the merchant is actually using, which is the one the printed
  // code has to point at — localhost while they try it out, the real domain
  // once deployed. Asking them to type it would be one more thing to get wrong.
  useEffect(() => {
    // Same reason as everywhere else in this codebase: `window` does not exist
    // while the server renders, so this has to happen after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBaseUrl(window.location.origin);
  }, []);

  const list = useMemo(() => parseTableList(tables), [tables]);

  return (
    <>
      <SectionHeading titleKey="qrTitle" />
      <p className="mb-4 max-w-[60ch] text-[15px] text-muted">{t.qrIntro}</p>

      <Card className="mb-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t.qrTables} hint={t.qrTablesHint}>
            <Input value={tables} onChange={(event) => setTables(event.target.value)} />
          </Field>
          <Field label={t.qrBaseUrl} hint={t.qrBaseUrlHint}>
            <Input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <GhostButton type="button" onClick={() => window.print()}>
            {t.qrPrint}
          </GhostButton>
        </div>
      </Card>

      <ul className="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,12rem),1fr))]">
        {list.map((table) => (
          <li key={table}>
            <QrCard
              table={table}
              url={tableUrl(baseUrl, restaurantSlug, table)}
              label={t.qrTableLabel(table)}
              downloadLabel={t.qrDownload}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function QrCard({
  table,
  url,
  label,
  downloadLabel,
}: {
  table: string;
  url: string;
  label: string;
  downloadLabel: string;
}) {
  const [png, setPng] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      // Pure black on pure white, whatever theme the admin is in. A QR code
      // printed in a theme colour is a QR code a cheap scanner refuses.
      color: { dark: "#000000", light: "#ffffff" },
      // Medium correction: survives a coffee ring on a laminated card without
      // making the pattern too dense to scan from across a table.
      errorCorrectionLevel: "M",
    })
      .then((data) => {
        if (!cancelled) setPng(data);
      })
      .catch(() => {
        if (!cancelled) setPng(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <figure className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-3 print:break-inside-avoid">
      {png ? (
        // A plain <img>: this is a data URL generated in the browser, so there
        // is nothing for next/image to optimise and no host to allow-list.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={png} alt={label} className="aspect-square w-full rounded-lg bg-white" />
      ) : (
        <span className="aspect-square w-full rounded-lg bg-tint" aria-hidden />
      )}

      <figcaption className="text-center">
        <span className="block font-display text-base font-bold">{label}</span>
        <span className="block break-all text-[11px] text-muted">{url}</span>
      </figcaption>

      {png ? (
        <a
          href={png}
          download={`qr-bord-${table}.png`}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong px-3 text-[13px] font-semibold text-ink no-underline print:hidden"
        >
          <DownloadIcon size={14} />
          {downloadLabel}
        </a>
      ) : null}
    </figure>
  );
}
