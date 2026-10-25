"use client";

import { useEffect, useRef, useState } from "react";
import { audioReady, playOrderAlert, unlockAudio } from "@/lib/chime";
import type { AdminOrder } from "@/lib/admin-orders";
import { BellIcon, BellOffIcon, CloseIcon } from "../icons";
import { useAdminStrings } from "./admin-locale";

const MUTE_KEY = "menuscan:admin:muted";

/**
 * Making sure a new order is noticed.
 *
 * Four channels, because a kitchen is a bad place to rely on any one of them:
 * a sound (hands busy, eyes elsewhere), a popup on the board (looking at the
 * screen), a browser notification (looking at a different tab or app) and the
 * tab title (glancing at the browser). Any one can fail or be switched off.
 *
 * The autoplay rule is the awkward part. A browser will not play a sound until
 * someone has clicked the page, so there is a visible "slå på lyd" button
 * rather than silent failure — a merchant who thinks the sound is on and hears
 * nothing is worse off than one who knows it is off.
 */
export function NewOrderAlerts({
  orders,
  unseen,
}: {
  orders: AdminOrder[];
  /** Ids the board considers new and not yet looked at. */
  unseen: Set<string>;
}) {
  const t = useAdminStrings();
  const [muted, setMuted] = useState(false);
  const [soundArmed, setSoundArmed] = useState(false);
  const [canNotify, setCanNotify] = useState<"default" | "granted" | "denied" | "unsupported">(
    "unsupported",
  );
  const [toast, setToast] = useState<AdminOrder | null>(null);
  const announced = useRef<Set<string>>(new Set());
  const firstRun = useRef(true);
  const originalTitle = useRef("");

  useEffect(() => {
    originalTitle.current = document.title;
    try {
      // Read on mount, not during render: the server has no localStorage, so
      // reading it while rendering would make the server and client markup
      // disagree. This is the one-shot "pick up what the browser knows" case
      // the rule is not aimed at.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMuted(window.localStorage.getItem(MUTE_KEY) === "1");
    } catch {
      // Storage blocked; sound stays on for this session.
    }
    setSoundArmed(audioReady());
    if (typeof Notification !== "undefined") setCanNotify(Notification.permission);
    return () => {
      document.title = originalTitle.current;
    };
  }, []);

  // The count in the tab title, so it is visible from another tab.
  const newCount = orders.filter((o) => o.status === "new").length;
  useEffect(() => {
    if (!originalTitle.current) return;
    document.title = newCount > 0 ? t.tabTitleNewOrders(newCount) : originalTitle.current;
  }, [newCount, t]);

  // Announce anything newly unseen.
  useEffect(() => {
    const fresh = orders.filter((o) => unseen.has(o.id) && !announced.current.has(o.id));
    if (fresh.length === 0) return;

    fresh.forEach((o) => announced.current.add(o.id));

    // Orders already on screen when the board first loaded are not news.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    const latest = fresh[0];
    setToast(latest);

    if (!muted) playOrderAlert();

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(t.browserNotificationTitle, {
          body: t.newOrderToast(latest.tableNumber, latest.orderNumber),
          // One notification per order, so a re-render cannot stack five of
          // the same thing in the corner of the screen.
          tag: `order-${latest.id}`,
        });
      } catch {
        // Some browsers refuse Notification outside a service worker. The
        // toast and the sound still happened.
      }
    }
  }, [orders, unseen, muted, t]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function toggleMute() {
    const next = !muted;
    setMuted(next);
    try {
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      // Not fatal.
    }
    if (!next) setSoundArmed(await unlockAudio());
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void toggleMute()}
          aria-pressed={!muted}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 text-[13px] font-semibold text-ink"
        >
          {muted ? <BellOffIcon size={16} /> : <BellIcon size={16} />}
          {muted ? t.soundOff : t.soundOn}
        </button>

        {!muted && !soundArmed ? (
          <button
            type="button"
            onClick={async () => {
              const ok = await unlockAudio();
              setSoundArmed(ok);
              if (ok) playOrderAlert();
            }}
            className="inline-flex h-11 items-center rounded-full bg-accent px-4 text-[13px] font-semibold text-on-accent"
          >
            {t.enableSound}
          </button>
        ) : null}

        {canNotify === "default" ? (
          <button
            type="button"
            onClick={async () => {
              try {
                setCanNotify(await Notification.requestPermission());
              } catch {
                setCanNotify("denied");
              }
            }}
            className="inline-flex h-11 items-center rounded-full border border-line-strong bg-surface px-3.5 text-[13px] font-semibold text-ink"
          >
            {t.notificationsAsk}
          </button>
        ) : null}

        {!muted && !soundArmed ? (
          <span className="text-[12px] text-muted">{t.enableSoundHint}</span>
        ) : null}
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="assertive"
          className="sheet-enter fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-[26rem] items-center gap-3 rounded-2xl border-2 border-accent bg-surface px-4 py-3.5 shadow-pop"
        >
          <BellIcon size={18} className="shrink-0 text-accent" />
          <span className="min-w-0 flex-1 text-[14px] font-bold">
            {t.newOrderToast(toast.tableNumber, toast.orderNumber)}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label={t.close}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink"
          >
            <CloseIcon size={11} />
          </button>
        </div>
      ) : null}
    </>
  );
}
