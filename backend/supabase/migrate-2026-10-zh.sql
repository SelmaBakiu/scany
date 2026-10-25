-- ============================================================================
-- Migration: Chinese in, Albanian out, CNY added, restaurant renamed.
--
-- Run this ONCE, AFTER schema.sql, on a database that already has data.
--
-- Why this file exists instead of "just run seed.sql again": seed.sql rewrites
-- every dish, and by now you have edited some of them in the admin. This
-- touches only what actually changed — the languages, the currencies and the
-- name — and leaves your menu alone.
--
-- Safe to run twice. Safe to read first: the only deletions are the Albanian
-- rows, which is the point.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. The name.
--
-- The SLUG is deliberately unchanged. It is in every URL and on every QR code
-- you may already have printed; renaming it would break them all. Guests read
-- the name, not the slug.
-- ---------------------------------------------------------------------------

update public.restaurants
   set name = 'Tromsø Restaurant'
 where slug = 'sofra';

-- ---------------------------------------------------------------------------
-- 2. Chinese.
-- ---------------------------------------------------------------------------

insert into public.locales (code, label, native_label)
values ('zh-CN', 'Chinese', '中文')
on conflict (code) do update
   set label = excluded.label, native_label = excluded.native_label;

-- Offer it on every restaurant that already offers English.
-- (restaurant_locales is just the pair; the order the pills appear in comes
-- from the locales table, not from here.)
insert into public.restaurant_locales (restaurant_id, locale)
select distinct rl.restaurant_id, 'zh-CN'
  from public.restaurant_locales rl
 where rl.locale = 'en'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 3. Chinese yuan.
--
-- rate_per_eur is a placeholder, like every other rate in this project. Wire a
-- real feed before anyone pays attention to the number.
-- ---------------------------------------------------------------------------

-- Currencies are global in this schema: there is no per-restaurant join table,
-- every restaurant offers every row here. Inserting it is the whole job.
insert into public.currencies (code, symbol, decimals, rate_per_eur)
values ('CNY', '¥', 2, 7.8)
on conflict (code) do update
   set symbol = excluded.symbol,
       decimals = excluded.decimals,
       rate_per_eur = excluded.rate_per_eur;

-- ---------------------------------------------------------------------------
-- 4. The prompt override column, if schema.sql has not been re-run yet.
-- ---------------------------------------------------------------------------

alter table public.items add column if not exists image_prompt text not null default '';

-- ---------------------------------------------------------------------------
-- 5. Albanian, removed.
--
-- The translation rows go first, then the offer, then the language itself —
-- children before parents, so no foreign key complains.
--
-- A guest who had Albanian saved in their browser is NOT broken by this: the
-- client only honours a stored language that the restaurant still offers, and
-- falls back to the default otherwise. Same for a removed currency.
-- ---------------------------------------------------------------------------

delete from public.item_translations       where locale = 'sq';
delete from public.category_translations   where locale = 'sq';
delete from public.menu_translations       where locale = 'sq';
delete from public.restaurant_translations where locale = 'sq';
delete from public.tag_translations        where locale = 'sq';
delete from public.restaurant_locales      where locale = 'sq';
delete from public.locales                 where code   = 'sq';

-- Albanian lek, if it was ever added. It is not in this project's seed data,
-- so this is almost certainly a no-op — included because you asked. Guarded,
-- because a restaurant that somehow had it as its BASE currency would
-- otherwise fail the whole migration on a foreign key.
delete from public.currencies
 where code = 'ALL'
   and not exists (select 1 from public.restaurants where base_currency = 'ALL');

-- ---------------------------------------------------------------------------
-- 6. Check it worked.
-- ---------------------------------------------------------------------------

select r.name,
       (select string_agg(rl.locale, ', ' order by rl.locale)
          from public.restaurant_locales rl where rl.restaurant_id = r.id) as languages,
       (select string_agg(c.code, ', ' order by c.code) from public.currencies c) as currencies
  from public.restaurants r
 where r.slug = 'sofra';

commit;
