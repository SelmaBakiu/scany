"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setOrderStatus } from "@/app/admin/actions";
import {
  ORDER_TABS,
  SELECT_ORDERS,
  STATUS_ACTIONS,
  TAB_STATUSES,
  minutesSince,
  toAdminOrder,
  type AdminOrder,
  type OrderTab,
} from "@/lib/admin-orders";
import type { AdminStrings } from "@/lib/admin-i18n";
import { displayPrice } from "@/lib/money";
import type { OrderStatus } from "@/lib/order-types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Currency } from "@/lib/types";
import { ClockIcon } from "../icons";
import { ModalSheet } from "../modal-sheet";
import { useAdminStrings } from "./admin-locale";
import { NewOrderAlerts } from "./new-order-alerts";
import { Field, GhostButton, Input, PrimaryButton, SectionHeading } from "./ui";

const TAB_LABEL: Record<OrderTab, keyof AdminStrings> = {
  new: "tabNew",
  active: "tabActive",
  ready: "tabReady",
  completed: "tabCompleted",
  declined: "tabDeclined",
};

const ACTION_LABEL: Record<OrderStatus, keyof AdminStrings> = {
  accepted: "accept",
  declined: "decline",
  preparing: "startPreparing",
  ready: "markReady",
  completed: "complete",
  new: "tabNew",
};

/**
 * The kitchen's screen.
 *
 * Orders arrive over Realtime and are also re-fetched on a timer. Both, not
 * one: a websocket that quietly dies at 19:40 on a Friday means orders piling
 * up unseen, and nobody is watching the console to notice. The poll is the
 * floor under the feature — slower, but it cannot silently stop working.
 */
export function OrdersBoard({
  initial,
  baseCurrency,
  locale,
}: {
  initial: AdminOrder[];
  baseCurrency: Currency;
  /** The merchant's admin language, for formatting money. */
  locale: string;
}) {
  const t = useAdminStrings();
  const [orders, setOrders] = useState<AdminOrder[]>(initial);
  const [tab, setTab] = useState<OrderTab>("new");
  const [live, setLive] = useState(false);
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [declining, setDeclining] = useState<AdminOrder | null>(null);

  // Which orders this merchant has not looked at yet. Cleared per tab visit
  // rather than stored, because "new to me, in this sitting" is what the
  // highlight is for.
  const [unseen, setUnseen] = useState<Set<string>>(new Set());
  const knownIds = useRef<Set<string>>(new Set(initial.map((o) => o.id)));

  const refresh = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("orders")
      .select(SELECT_ORDERS)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error || !data) return;

    const next = data.map(toAdminOrder).filter((o): o is AdminOrder => o !== null);

    // Anything we have not seen before and that is still "new" gets flagged,
    // which is what drives both the highlight and the alert sound.
    const fresh = next.filter((o) => !knownIds.current.has(o.id) && o.status === "new");
    if (fresh.length > 0) {
      setUnseen((current) => {
        const updated = new Set(current);
        fresh.forEach((o) => updated.add(o.id));
        return updated;
      });
    }
    next.forEach((o) => knownIds.current.add(o.id));
    setOrders(next);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void refresh();
      })
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    // The floor. Slower when the tab is hidden, but never off: a kitchen
    // screen is usually the background tab.
    const timer = setInterval(() => void refresh(), document.hidden ? 60_000 : 15_000);
    void refresh();

    return () => {
      clearInterval(timer);
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const newCount = orders.filter((o) => o.status === "new").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    const fromTime = from ? Date.parse(`${from}T00:00:00`) : null;
    // The "to" date is inclusive: a merchant picking 5 March means that day's
    // orders too, not everything before breakfast on the 5th.
    const toTime = to ? Date.parse(`${to}T23:59:59`) : null;

    return orders.filter((order) => {
      if (!TAB_STATUSES[tab].includes(order.status)) return false;

      if (q) {
        const haystack = [
          order.tableNumber,
          order.guestName,
          String(order.orderNumber),
          ...order.items.map((i) => i.name),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      const placed = Date.parse(order.createdAt);
      if (fromTime !== null && placed < fromTime) return false;
      if (toTime !== null && placed > toTime) return false;
      return true;
    });
  }, [orders, tab, query, from, to]);

  const inTab = orders.filter((o) => TAB_STATUSES[tab].includes(o.status)).length;

  async function move(order: AdminOrder, status: OrderStatus, reason = "") {
    if (status === "new") return;
    setBusy(order.id);
    // Optimistic: the kitchen taps Godta and the card moves at once. The
    // refresh that follows is the truth, and will put it back if the write
    // failed.
    setOrders((current) =>
      current.map((o) => (o.id === order.id ? { ...o, status, declineReason: reason } : o)),
    );
    setUnseen((current) => {
      const updated = new Set(current);
      updated.delete(order.id);
      return updated;
    });
    await setOrderStatus(order.id, status, reason);
    await refresh();
    setBusy(null);
  }

  return (
    <>
      <NewOrderAlerts orders={orders} unseen={unseen} />

      <SectionHeading
        titleKey="ordersTitle"
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[12px] font-semibold text-muted">
            <span
              aria-hidden
              className={`size-2 rounded-full ${live ? "bg-veg" : "bg-line-strong"}`}
            />
            {live ? t.liveConnected : t.livePolling}
          </span>
        }
      />

      {/* Tabs. Horizontally scrollable on a phone rather than wrapped into two
          rows, so the board below never shifts down. */}
      <div className="-mx-4 mb-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div role="tablist" className="flex gap-2">
          {ORDER_TABS.map((name) => {
            const count = orders.filter((o) => TAB_STATUSES[name].includes(o.status)).length;
            const active = tab === name;
            return (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setTab(name);
                  if (name === "new") setUnseen(new Set());
                }}
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold ${
                  active
                    ? "bg-accent text-on-accent"
                    : "border border-line-strong bg-surface text-ink"
                }`}
              >
                {t[TAB_LABEL[name]] as string}
                {count > 0 ? (
                  <span
                    className={`inline-flex min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums ${
                      active ? "bg-on-accent text-accent" : "bg-chip text-chip-ink"
                    }`}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-[999_1_12rem]">
          <Field label={t.searchOrders}>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchOrdersPlaceholder}
              type="search"
            />
          </Field>
        </div>
        <div className="flex-[1_1_9rem]">
          <Field label={t.dateFrom}>
            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </Field>
        </div>
        <div className="flex-[1_1_9rem]">
          <Field label={t.dateTo}>
            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </Field>
        </div>
        {query || from || to ? (
          <GhostButton
            type="button"
            onClick={() => {
              setQuery("");
              setFrom("");
              setTo("");
            }}
          >
            {t.clearFilters}
          </GhostButton>
        ) : null}
      </div>

      <p className="mb-3 text-[13px] text-muted">{t.showingOrders(filtered.length, inTab)}</p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-8 text-center text-[15px] text-muted">
          {orders.length === 0 ? t.noOrders : t.noOrdersIn(t[TAB_LABEL[tab]] as string)}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))]">
          {filtered.map((order) => (
            <li key={order.id}>
              <OrderCard
                order={order}
                strings={t}
                baseCurrency={baseCurrency}
                locale={locale}
                highlight={unseen.has(order.id)}
                busy={busy === order.id}
                onMove={(status) =>
                  status === "declined" ? setDeclining(order) : void move(order, status)
                }
              />
            </li>
          ))}
        </ul>
      )}

      {declining ? (
        <DeclineSheet
          order={declining}
          strings={t}
          onClose={() => setDeclining(null)}
          onConfirm={(reason) => {
            const order = declining;
            setDeclining(null);
            void move(order, "declined", reason);
          }}
        />
      ) : null}

      {/* The count the sidebar badge and the tab title both read. */}
      <span hidden data-new-order-count={newCount} />
    </>
  );
}

function OrderCard({
  order,
  strings: t,
  baseCurrency,
  locale,
  highlight,
  busy,
  onMove,
}: {
  order: AdminOrder;
  strings: AdminStrings;
  baseCurrency: Currency;
  locale: string;
  highlight: boolean;
  busy: boolean;
  onMove: (status: OrderStatus) => void;
}) {
  // Re-rendered once a minute, not once a second: a kitchen needs "fresh or
  // forgotten", and a ticking clock would re-render every card every second.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const minutes = minutesSince(order.createdAt, now);
  const total = displayPrice(order.totalMinor, baseCurrency, baseCurrency, locale);
  const actions = STATUS_ACTIONS[order.status];

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-surface p-4 ${
        highlight ? "border-accent ring-2 ring-accent/30" : "border-line"
      }`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-display text-lg font-bold tracking-[-0.02em]">
          {t.orderNumber(order.orderNumber)}
          {highlight ? (
            <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-on-accent">
              {t.newOrderBadge}
            </span>
          ) : null}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
          <ClockIcon size={13} />
          {minutes === 0 ? t.justNow : t.minutesAgo(minutes)}
        </span>
      </header>

      <p className="mt-0.5 text-[14px] font-semibold">
        {t.table(order.tableNumber)}
        {order.guestName ? <span className="text-muted"> · {order.guestName}</span> : null}
      </p>

      <ul className="mt-3 flex flex-col gap-1.5">
        {order.items.map((line) => (
          <li key={line.id} className="text-[14px]">
            <span className="font-bold tabular-nums">{line.quantity}×</span> {line.name}
            {line.comment ? (
              <span className="block pl-5 text-[13px] font-semibold text-accent">
                {line.comment}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      {order.comment ? (
        <p className="mt-3 rounded-xl bg-tint px-3 py-2 text-[13px]">
          <span className="font-bold uppercase tracking-[0.05em] text-muted">{t.guestNote}:</span>{" "}
          {order.comment}
        </p>
      ) : null}

      {order.status === "declined" && order.declineReason ? (
        <p className="mt-3 rounded-xl bg-heat-soft px-3 py-2 text-[13px] font-semibold text-heat">
          {t.declinedBecause(order.declineReason)}
        </p>
      ) : null}

      <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
        <span className="text-[13px] font-semibold text-muted">{t.orderTotal}</span>
        <span className="font-display text-lg font-bold tabular-nums">{total.text}</span>
      </div>

      {actions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((status) =>
            status === "declined" ? (
              <button
                key={status}
                type="button"
                disabled={busy}
                onClick={() => onMove(status)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-heat bg-heat-soft px-4 text-sm font-semibold text-heat disabled:opacity-60"
              >
                {t[ACTION_LABEL[status]] as string}
              </button>
            ) : (
              <PrimaryButton key={status} type="button" disabled={busy} onClick={() => onMove(status)}>
                {t[ACTION_LABEL[status]] as string}
              </PrimaryButton>
            ),
          )}
        </div>
      ) : null}
    </article>
  );
}

function DeclineSheet({
  order,
  strings: t,
  onClose,
  onConfirm,
}: {
  order: AdminOrder;
  strings: AdminStrings;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <ModalSheet
      title={t.declineTitle}
      onClose={onClose}
      closeLabel={t.close}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <GhostButton type="button" onClick={onClose}>
            {t.cancel}
          </GhostButton>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-heat bg-heat-soft px-5 text-[15px] font-semibold text-heat"
          >
            {t.confirmDecline}
          </button>
        </div>
      }
    >
      <p className="py-1 text-[15px] leading-relaxed">
        {t.orderNumber(order.orderNumber)} · {t.table(order.tableNumber)}
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-muted">{t.declineBody}</p>
      <Field label={t.declineReason} hint={t.declineReasonHint}>
        <Input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={300}
          autoFocus
        />
      </Field>
    </ModalSheet>
  );
}
