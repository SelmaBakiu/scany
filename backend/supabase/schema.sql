-- ============================================================================
-- MenuScan — schema
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run: every statement is guarded.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Reference tables: currencies and locales
-- ---------------------------------------------------------------------------

create table if not exists public.currencies (
  code          text primary key,              -- ISO 4217, e.g. 'EUR'
  symbol        text        not null,
  decimals      smallint    not null default 2,-- 2 for EUR, 0 for ALL/JPY
  -- How many units of THIS currency equal 1 EUR. EUR itself is 1.
  -- Prices are stored once in the restaurant's base currency; every other
  -- currency is derived from these rates, so they are indicative, not final.
  rate_per_eur  numeric(18,8) not null,
  updated_at    timestamptz not null default now(),
  constraint currencies_rate_positive check (rate_per_eur > 0)
);

comment on column public.currencies.rate_per_eur is
  'Units of this currency per 1 EUR. Refresh from a rates API on a schedule.';

create table if not exists public.locales (
  code          text primary key,              -- BCP-47, e.g. 'en', 'it', 'zh-CN'
  label         text not null,                 -- 'Chinese'   (in English)
  native_label  text not null                  -- '中文'      (in its own language)
);

-- ---------------------------------------------------------------------------
-- Restaurants
-- ---------------------------------------------------------------------------

create table if not exists public.restaurants (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,        -- the QR code points at /m/<slug>
  name            text not null,               -- brand name, not translated
  tagline_key     text,                        -- optional i18n key for the hero line
  base_currency   text not null references public.currencies(code),
  default_locale  text not null references public.locales(code),
  is_published    boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Which languages this restaurant actually offers in its menu.
create table if not exists public.restaurant_locales (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  locale        text not null references public.locales(code),
  primary key (restaurant_id, locale)
);

-- ---------------------------------------------------------------------------
-- Menus -> categories -> items
--
-- Coming from MongoDB, the instinct is one `restaurants` document with
-- categories and items nested inside it. Don't. In Postgres each level is its
-- own table pointing UP at its parent, because:
--   * the merchant app updates one item at a time (no whole-document rewrite),
--   * an item's price and availability change far more often than the menu,
--   * foreign keys make an orphaned item impossible, and
--   * the read side can still fetch it all in ONE request (see frontend/lib/menu.ts) —
--     PostgREST assembles the nesting for you from these foreign keys.
--
-- `restaurant_id` is repeated on every level on purpose. It is not redundant
-- data that can drift: the composite foreign keys below make Postgres reject
-- any row whose restaurant_id disagrees with its parent's. It buys simple
-- one-hop security policies and simple merchant-app queries.
-- ---------------------------------------------------------------------------

create table if not exists public.menus (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  slug          text not null,                 -- 'dinner', 'lunch', 'drinks'
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  unique (restaurant_id, slug),
  unique (id, restaurant_id)                   -- target for the composite FK below
);

create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  menu_id       uuid not null,
  slug          text not null,                 -- 'starters', 'mains'
  sort_order    integer not null default 0,
  unique (restaurant_id, slug),
  unique (id, restaurant_id),
  foreign key (menu_id, restaurant_id)
    references public.menus(id, restaurant_id) on delete cascade
);

create table if not exists public.items (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  category_id   uuid not null,
  slug          text not null,                 -- 'muhammara'
  -- Price as an INTEGER in the minor units of the restaurant's base currency
  -- (850 = EUR 8.50). Never store money as float or text.
  price_minor   integer not null,
  image_path    text,                          -- path inside the storage bucket
  is_available  boolean not null default true, -- today's availability
  is_featured   boolean not null default false,-- "house favourite" ribbon
  sort_order    integer not null default 0,
  updated_at    timestamptz not null default now(),
  unique (restaurant_id, slug),
  foreign key (category_id, restaurant_id)
    references public.categories(id, restaurant_id) on delete cascade,
  constraint items_price_nonnegative check (price_minor >= 0)
);

create index if not exists items_category_idx on public.items (category_id, sort_order);
create index if not exists categories_menu_idx on public.categories (menu_id, sort_order);

-- ---------------------------------------------------------------------------
-- Translations
--
-- One row per (thing, language). The merchant types the Albanian name for a
-- dish; that is DATA, so it lives in the database — not in a JSON file in the
-- repo. Only UI chrome ("Search dishes", "Filters") is translated in code,
-- in frontend/lib/i18n.ts.
--
-- Four near-identical tables instead of one generic
-- translations(entity_type, entity_id, field, value) table: the generic shape
-- cannot have a foreign key, so nothing stops a translation for a deleted
-- dish, and every query needs a cast. Repetition is the cheaper price.
-- ---------------------------------------------------------------------------

create table if not exists public.menu_translations (
  menu_id uuid not null references public.menus(id) on delete cascade,
  locale  text not null references public.locales(code),
  name    text not null,
  primary key (menu_id, locale)
);

create table if not exists public.category_translations (
  category_id uuid not null references public.categories(id) on delete cascade,
  locale      text not null references public.locales(code),
  name        text not null,
  primary key (category_id, locale)
);

create table if not exists public.item_translations (
  item_id          uuid not null references public.items(id) on delete cascade,
  locale           text not null references public.locales(code),
  name             text not null,
  -- The one-liner on the menu card. Keep it short; it is truncated on phones.
  description      text,
  -- The paragraph on the item's own page.
  description_long text,
  -- Comma-separated, written in the same language. A plain list rather than
  -- its own table: a kitchen edits this as a sentence, and nothing queries
  -- individual ingredients. Allergens are tags, because those ARE filtered on.
  ingredients      text,
  primary key (item_id, locale)
);

-- A database created before these two columns existed upgrades here.
-- `create table if not exists` above does nothing to an existing table, so
-- without these an older database would silently keep the old shape.
alter table public.item_translations add column if not exists description_long text;
alter table public.item_translations add column if not exists ingredients text;

-- ---------------------------------------------------------------------------
-- Tags: diets, allergens, heat, free-form info
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.tag_kind as enum ('diet', 'allergen', 'heat', 'info');
exception when duplicate_object then null;
end $$;

-- Tags are global, not per-restaurant: "contains nuts" means the same thing
-- everywhere, and the filter panel needs a fixed vocabulary to filter on.
create table if not exists public.tags (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,             -- 'vegan', 'nuts', 'mild'
  kind       public.tag_kind not null,
  sort_order integer not null default 0
);

create table if not exists public.tag_translations (
  tag_id uuid not null references public.tags(id) on delete cascade,
  locale text not null references public.locales(code),
  label  text not null,
  primary key (tag_id, locale)
);

create table if not exists public.item_tags (
  item_id uuid not null references public.items(id) on delete cascade,
  tag_id  uuid not null references public.tags(id)  on delete cascade,
  primary key (item_id, tag_id)
);

create index if not exists item_tags_tag_idx on public.item_tags (tag_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- This is the part with no MongoDB equivalent, and the part you must not skip.
-- The key in the browser (NEXT_PUBLIC_SUPABASE_ANON_KEY) is public — anyone
-- can read it out of your page source and query your database directly. RLS is
-- what makes that safe: without a policy granting it, a row is invisible.
--
-- Policy below: anyone may READ the menu of a PUBLISHED restaurant. Nobody can
-- write anything yet. The merchant app adds the write policies, scoped to the
-- signed-in owner.
-- ---------------------------------------------------------------------------

alter table public.currencies           enable row level security;
alter table public.locales              enable row level security;
alter table public.tags                 enable row level security;
alter table public.tag_translations     enable row level security;
alter table public.restaurants          enable row level security;
alter table public.restaurant_locales   enable row level security;
alter table public.menus                enable row level security;
alter table public.categories           enable row level security;
alter table public.items                enable row level security;
alter table public.menu_translations    enable row level security;
alter table public.category_translations enable row level security;
alter table public.item_translations    enable row level security;
alter table public.item_tags            enable row level security;

-- Helper so each policy stays one readable line.
-- SECURITY DEFINER lets it read `restaurants` without re-triggering that
-- table's own policy, which would recurse.
create or replace function public.restaurant_is_public(rid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.restaurants r
    where r.id = rid and r.is_published
  );
$$;

revoke all on function public.restaurant_is_public(uuid) from public;
grant execute on function public.restaurant_is_public(uuid) to anon, authenticated;

-- Reference data is public and harmless.
drop policy if exists currencies_public_read on public.currencies;
create policy currencies_public_read on public.currencies for select using (true);

drop policy if exists locales_public_read on public.locales;
create policy locales_public_read on public.locales for select using (true);

drop policy if exists tags_public_read on public.tags;
create policy tags_public_read on public.tags for select using (true);

drop policy if exists tag_translations_public_read on public.tag_translations;
create policy tag_translations_public_read on public.tag_translations for select using (true);

-- Restaurant-scoped data: only when the restaurant is published.
drop policy if exists restaurants_public_read on public.restaurants;
drop policy if exists restaurants_read on public.restaurants;
create policy restaurants_public_read on public.restaurants
  for select using (is_published);

drop policy if exists restaurant_locales_public_read on public.restaurant_locales;
drop policy if exists restaurant_locales_read on public.restaurant_locales;
create policy restaurant_locales_public_read on public.restaurant_locales
  for select using (public.restaurant_is_public(restaurant_id));

drop policy if exists menus_public_read on public.menus;
drop policy if exists menus_read on public.menus;
create policy menus_public_read on public.menus
  for select using (public.restaurant_is_public(restaurant_id));

drop policy if exists categories_public_read on public.categories;
drop policy if exists categories_read on public.categories;
create policy categories_public_read on public.categories
  for select using (public.restaurant_is_public(restaurant_id));

drop policy if exists items_public_read on public.items;
drop policy if exists items_read on public.items;
create policy items_public_read on public.items
  for select using (public.restaurant_is_public(restaurant_id));

-- Translations and item_tags have no restaurant_id, so they hop through their parent.
drop policy if exists menu_translations_public_read on public.menu_translations;
drop policy if exists menu_translations_read on public.menu_translations;
create policy menu_translations_public_read on public.menu_translations
  for select using (exists (
    select 1 from public.menus m
    where m.id = menu_id and public.restaurant_is_public(m.restaurant_id)
  ));

drop policy if exists category_translations_public_read on public.category_translations;
drop policy if exists category_translations_read on public.category_translations;
create policy category_translations_public_read on public.category_translations
  for select using (exists (
    select 1 from public.categories c
    where c.id = category_id and public.restaurant_is_public(c.restaurant_id)
  ));

drop policy if exists item_translations_public_read on public.item_translations;
drop policy if exists item_translations_read on public.item_translations;
create policy item_translations_public_read on public.item_translations
  for select using (exists (
    select 1 from public.items i
    where i.id = item_id and public.restaurant_is_public(i.restaurant_id)
  ));

drop policy if exists item_tags_public_read on public.item_tags;
drop policy if exists item_tags_read on public.item_tags;
create policy item_tags_public_read on public.item_tags
  for select using (exists (
    select 1 from public.items i
    where i.id = item_id and public.restaurant_is_public(i.restaurant_id)
  ));

-- Supabase already grants the anon/authenticated roles access to tables in
-- `public`, but stating it here makes the script self-contained and makes the
-- security model explicit: the GRANT says "this role may ask", the POLICIES
-- above decide which rows it actually gets back. No policy, no rows.
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket for dish photos (public read).
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

-- ===========================================================================
-- MERCHANT SIDE
--
-- Everything above this line is the diner's half: public reads, no writes.
-- Below is what lets a signed-in restaurant owner change their own menu —
-- and only their own.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Restaurant details: the things the merchant edits on the "Restaurant" tab.
-- ---------------------------------------------------------------------------

alter table public.restaurants add column if not exists theme text not null default 'lys';
alter table public.restaurants add column if not exists logo_path text;
alter table public.restaurants add column if not exists address text;
alter table public.restaurants add column if not exists phone text;
alter table public.restaurants add column if not exists email text;
alter table public.restaurants add column if not exists maps_url text;
alter table public.restaurants add column if not exists timezone text not null default 'Europe/Oslo';

-- [{ "label": "Instagram", "url": "https://..." }, ...]
alter table public.restaurants add column if not exists socials jsonb not null default '[]'::jsonb;

-- [{ "day": 0..6 (Monday=0), "closed": bool, "open": "11:00", "close": "22:00" }]
-- JSON rather than a table: it is read and written whole, never queried by
-- day, and a merchant editing a week of hours is editing one object.
alter table public.restaurants add column if not exists opening_hours jsonb not null default '[]'::jsonb;

comment on column public.restaurants.timezone is
  'IANA zone. "Open now" is worked out in the restaurant''s time, not the diner''s.';

-- The restaurant blurb is translated; the name is a brand and is not.
create table if not exists public.restaurant_translations (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  locale        text not null references public.locales(code),
  description   text,
  primary key (restaurant_id, locale)
);

-- Hide a category from the menu without deleting it or its dishes.
alter table public.categories add column if not exists is_visible boolean not null default true;

-- Exactly one menu can be the live one. A partial unique index is the whole
-- rule: the database refuses a second active menu rather than trusting the
-- admin UI to switch the old one off first.
create unique index if not exists menus_one_active_per_restaurant
  on public.menus (restaurant_id) where is_active;

-- ---------------------------------------------------------------------------
-- Who may edit what
-- ---------------------------------------------------------------------------

create table if not exists public.restaurant_members (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'owner',
  created_at    timestamptz not null default now(),
  primary key (restaurant_id, user_id)
);

-- Platform administrators manage the restaurant/store accounts themselves.
-- There is intentionally no client-side write policy: the first platform
-- administrator is bootstrapped with platform-admin-setup.sql, and all later
-- management writes use the server-only Supabase secret key after verifying
-- that the signed-in caller appears in this table.
create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.restaurant_members enable row level security;
alter table public.restaurant_translations enable row level security;
alter table public.platform_admins enable row level security;

-- The one question every write policy asks. SECURITY DEFINER so it can read
-- restaurant_members without re-triggering that table's own policy, which
-- would recurse.
create or replace function public.is_restaurant_member(rid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.restaurant_members m
    where m.restaurant_id = rid and m.user_id = auth.uid()
  );
$$;

revoke all on function public.is_restaurant_member(uuid) from public;
grant execute on function public.is_restaurant_member(uuid) to anon, authenticated;

-- Same question, for the tables that only reach a restaurant through a parent.
create or replace function public.is_member_of_menu(mid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.menus m
                 where m.id = mid and public.is_restaurant_member(m.restaurant_id));
$$;

create or replace function public.is_member_of_category(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.categories c
                 where c.id = cid and public.is_restaurant_member(c.restaurant_id));
$$;

create or replace function public.is_member_of_item(iid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.items i
                 where i.id = iid and public.is_restaurant_member(i.restaurant_id));
$$;

grant execute on function public.is_member_of_menu(uuid) to anon, authenticated;
grant execute on function public.is_member_of_category(uuid) to anon, authenticated;
grant execute on function public.is_member_of_item(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Reading your own unpublished work
--
-- The public read policies hide anything not yet published — which would also
-- hide it from the owner editing it. These replace them with "published, OR
-- mine".
-- ---------------------------------------------------------------------------

drop policy if exists restaurants_public_read on public.restaurants;
create policy restaurants_read on public.restaurants
  for select using (is_published or public.is_restaurant_member(id));

drop policy if exists restaurant_locales_public_read on public.restaurant_locales;
create policy restaurant_locales_read on public.restaurant_locales
  for select using (
    public.restaurant_is_public(restaurant_id) or public.is_restaurant_member(restaurant_id)
  );

drop policy if exists menus_public_read on public.menus;
create policy menus_read on public.menus
  for select using (
    public.restaurant_is_public(restaurant_id) or public.is_restaurant_member(restaurant_id)
  );

drop policy if exists categories_public_read on public.categories;
create policy categories_read on public.categories
  for select using (
    public.restaurant_is_public(restaurant_id) or public.is_restaurant_member(restaurant_id)
  );

drop policy if exists items_public_read on public.items;
create policy items_read on public.items
  for select using (
    public.restaurant_is_public(restaurant_id) or public.is_restaurant_member(restaurant_id)
  );

drop policy if exists menu_translations_public_read on public.menu_translations;
create policy menu_translations_read on public.menu_translations
  for select using (exists (
    select 1 from public.menus m where m.id = menu_id
      and (public.restaurant_is_public(m.restaurant_id) or public.is_restaurant_member(m.restaurant_id))
  ));

drop policy if exists category_translations_public_read on public.category_translations;
create policy category_translations_read on public.category_translations
  for select using (exists (
    select 1 from public.categories c where c.id = category_id
      and (public.restaurant_is_public(c.restaurant_id) or public.is_restaurant_member(c.restaurant_id))
  ));

drop policy if exists item_translations_public_read on public.item_translations;
create policy item_translations_read on public.item_translations
  for select using (exists (
    select 1 from public.items i where i.id = item_id
      and (public.restaurant_is_public(i.restaurant_id) or public.is_restaurant_member(i.restaurant_id))
  ));

drop policy if exists item_tags_public_read on public.item_tags;
create policy item_tags_read on public.item_tags
  for select using (exists (
    select 1 from public.items i where i.id = item_id
      and (public.restaurant_is_public(i.restaurant_id) or public.is_restaurant_member(i.restaurant_id))
  ));

drop policy if exists restaurant_translations_read on public.restaurant_translations;
create policy restaurant_translations_read on public.restaurant_translations
  for select using (
    public.restaurant_is_public(restaurant_id) or public.is_restaurant_member(restaurant_id)
  );

drop policy if exists restaurant_members_read on public.restaurant_members;
create policy restaurant_members_read on public.restaurant_members
  for select using (user_id = auth.uid());

drop policy if exists platform_admins_read_own on public.platform_admins;
create policy platform_admins_read_own on public.platform_admins
  for select to authenticated using (user_id = auth.uid());

grant select on public.platform_admins to authenticated;

-- ---------------------------------------------------------------------------
-- Writing
--
-- `using` governs which existing rows may be changed or removed; `with check`
-- governs what a row is allowed to look like afterwards. Both are needed on
-- update, or an owner could move a dish into somebody else's restaurant.
--
-- There is deliberately no insert/update/delete policy for `restaurants`
-- (beyond update), `tags`, `locales` or `currencies`: a merchant edits their
-- own restaurant, not the list of restaurants or the shared vocabulary.
-- ---------------------------------------------------------------------------

drop policy if exists restaurants_member_update on public.restaurants;
create policy restaurants_member_update on public.restaurants
  for update to authenticated
  using (public.is_restaurant_member(id))
  with check (public.is_restaurant_member(id));

drop policy if exists restaurant_translations_member_write on public.restaurant_translations;
create policy restaurant_translations_member_write on public.restaurant_translations
  for all to authenticated
  using (public.is_restaurant_member(restaurant_id))
  with check (public.is_restaurant_member(restaurant_id));

drop policy if exists menus_member_write on public.menus;
create policy menus_member_write on public.menus
  for all to authenticated
  using (public.is_restaurant_member(restaurant_id))
  with check (public.is_restaurant_member(restaurant_id));

drop policy if exists categories_member_write on public.categories;
create policy categories_member_write on public.categories
  for all to authenticated
  using (public.is_restaurant_member(restaurant_id))
  with check (public.is_restaurant_member(restaurant_id));

drop policy if exists items_member_write on public.items;
create policy items_member_write on public.items
  for all to authenticated
  using (public.is_restaurant_member(restaurant_id))
  with check (public.is_restaurant_member(restaurant_id));

drop policy if exists menu_translations_member_write on public.menu_translations;
create policy menu_translations_member_write on public.menu_translations
  for all to authenticated
  using (public.is_member_of_menu(menu_id))
  with check (public.is_member_of_menu(menu_id));

drop policy if exists category_translations_member_write on public.category_translations;
create policy category_translations_member_write on public.category_translations
  for all to authenticated
  using (public.is_member_of_category(category_id))
  with check (public.is_member_of_category(category_id));

drop policy if exists item_translations_member_write on public.item_translations;
create policy item_translations_member_write on public.item_translations
  for all to authenticated
  using (public.is_member_of_item(item_id))
  with check (public.is_member_of_item(item_id));

drop policy if exists item_tags_member_write on public.item_tags;
create policy item_tags_member_write on public.item_tags
  for all to authenticated
  using (public.is_member_of_item(item_id))
  with check (public.is_member_of_item(item_id));

grant insert, update, delete on public.restaurants, public.restaurant_translations,
  public.menus, public.menu_translations, public.categories, public.category_translations,
  public.items, public.item_translations, public.item_tags to authenticated;

-- ---------------------------------------------------------------------------
-- Dish photos and logos: public to read, signed-in merchants to write.
-- ---------------------------------------------------------------------------

drop policy if exists menu_images_public_read on storage.objects;
create policy menu_images_public_read on storage.objects
  for select using (bucket_id = 'menu-images');

drop policy if exists menu_images_member_write on storage.objects;
create policy menu_images_member_write on storage.objects
  for all to authenticated
  using (bucket_id = 'menu-images')
  with check (bucket_id = 'menu-images');

-- ===========================================================================
-- ORDERING
--
-- A guest scans a QR code with a table number in it, builds a basket, and
-- sends it. The merchant sees it arrive and moves it through the kitchen.
--
-- The whole design turns on one question: the guest's browser holds the anon
-- key, so whatever the browser is allowed to do, ANY visitor is allowed to do.
-- Three consequences shaped everything below.
--
--   1. The guest has NO insert, update or select policy on orders. None. The
--      only way in is place_order(), a security-definer function that reads
--      every price out of the items table itself. A browser that posts
--      {"price": 1} gets a dish at its real price, because the price it sent
--      was never read.
--
--   2. The guest reads their order back through order_status(token), which
--      takes the order's secret token and returns exactly that one order.
--      Guessing another guest's order means guessing a UUID.
--
--   3. The merchant is a different story: they are signed in, so ordinary RLS
--      scoped to restaurant_members does the job, and Realtime inherits it.
-- ===========================================================================

alter table public.restaurants
  add column if not exists ordering_enabled boolean not null default true;

comment on column public.restaurants.ordering_enabled is
  'Master switch. Off = the menu still reads, but nothing can be ordered.';

-- ---------------------------------------------------------------------------
-- Order numbers
--
-- A sequence, not max(order_number)+1. Two guests pressing send in the same
-- second must not get the same number, and a sequence is the one thing in
-- Postgres that is guaranteed collision-free under concurrency without taking
-- a lock. Starting at 1000 so the first order is "#1000" rather than "#1" —
-- four digits are easier to read aloud across a kitchen.
--
-- Numbers are unique across every restaurant in the database rather than
-- restarting per restaurant. Per-restaurant numbering would need a counter row
-- and a lock on it, which is exactly the contention this avoids; a shared
-- sequence just means one restaurant's numbers have gaps, which nobody minds.
-- ---------------------------------------------------------------------------

create sequence if not exists public.order_number_seq start 1000;

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_number  integer not null default nextval('public.order_number_seq'),

  -- The secret. The guest's only claim to this order: whoever holds it can
  -- read the order and nothing else. 122 bits of entropy, so it is not
  -- guessable, and it never appears in the merchant's UI.
  token         uuid not null default gen_random_uuid(),

  table_number  text not null,
  guest_name    text not null default '',
  comment       text not null default '',

  status        text not null default 'new',
  decline_reason text not null default '',

  -- Minor units of the restaurant's base currency, like items.price_minor.
  -- (The brief called this column "total"; it is total_minor here so that
  -- every money column in this schema carries the same warning in its name.)
  total_minor   integer not null default 0,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique (order_number),
  unique (token),
  constraint orders_status_valid check (
    status in ('new', 'accepted', 'declined', 'preparing', 'ready', 'completed')
  ),
  constraint orders_total_nonnegative check (total_minor >= 0),
  constraint orders_table_not_blank check (length(btrim(table_number)) > 0)
);

create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,

  -- Nullable, and ON DELETE SET NULL: deleting a dish from the menu must not
  -- delete last Tuesday's orders, or silently change what they say.
  item_id     uuid references public.items(id) on delete set null,

  -- Snapshots, not joins. A receipt is a record of what was agreed at the
  -- time. Renaming the dish or raising its price tomorrow must not rewrite
  -- what this guest ordered and was charged today.
  name        text not null,
  price_minor integer not null,

  quantity    integer not null,
  comment     text not null default '',

  constraint order_items_quantity_sane check (quantity between 1 and 99),
  constraint order_items_price_nonnegative check (price_minor >= 0)
);

create index if not exists orders_restaurant_idx
  on public.orders (restaurant_id, created_at desc);
create index if not exists orders_open_idx
  on public.orders (restaurant_id, status)
  where status in ('new', 'accepted', 'preparing', 'ready');
create index if not exists order_items_order_idx on public.order_items (order_id);

-- updated_at, maintained by the database rather than by every caller.
-- clock_timestamp(), not now(): now() is the transaction's start time and does
-- not move within a transaction, so two status changes in one transaction
-- would record the same instant — and "updated 3 seconds ago" on the merchant's
-- board would be wrong by however long the transaction ran. clock_timestamp()
-- is the actual wall clock at the moment of the write.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Is the kitchen open?
--
-- The same three rules as frontend/lib/opening-hours.ts, and for the same reasons:
-- day 0 is Monday, "now" is the RESTAURANT's local time, and a closing time
-- earlier than its opening time means it is past midnight. Duplicated in SQL
-- deliberately — the browser's clock belongs to the guest, and a guest whose
-- laptop is set to yesterday should not be able to order at 4am.
-- ---------------------------------------------------------------------------

create or replace function public.is_open_now(rid uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  zone     text;
  hours    jsonb;
  local_ts timestamp;
  today    integer;
  now_min  integer;
  row_day  jsonb;
  o        integer;
  c        integer;
begin
  select timezone, opening_hours into zone, hours
  from public.restaurants where id = rid;

  if zone is null then return false; end if;
  -- No hours configured at all: treat the place as always open rather than
  -- always shut, so ordering works before anyone has filled the form in.
  if hours is null or jsonb_array_length(hours) = 0 then return true; end if;

  local_ts := now() at time zone zone;
  today    := extract(isodow from local_ts)::int - 1;   -- isodow 1..7 -> 0..6
  now_min  := extract(hour from local_ts)::int * 60 + extract(minute from local_ts)::int;

  -- Today's row.
  select value into row_day from jsonb_array_elements(hours)
   where (value->>'day')::int = today limit 1;

  if row_day is not null and coalesce((row_day->>'closed')::boolean, false) = false then
    o := public.minutes_of(row_day->>'open');
    c := public.minutes_of(row_day->>'close');
    if o is not null and c is not null then
      if c > o and now_min >= o and now_min < c then return true; end if;
      if c <= o and now_min >= o then return true; end if;   -- runs past midnight
    end if;
  end if;

  -- Early morning, still inside yesterday's late closing time.
  select value into row_day from jsonb_array_elements(hours)
   where (value->>'day')::int = (today + 6) % 7 limit 1;

  if row_day is not null and coalesce((row_day->>'closed')::boolean, false) = false then
    o := public.minutes_of(row_day->>'open');
    c := public.minutes_of(row_day->>'close');
    if o is not null and c is not null and c <= o and now_min < c then return true; end if;
  end if;

  return false;
end;
$$;

create or replace function public.minutes_of(hhmm text)
returns integer language plpgsql immutable as $$
declare parts text[];
begin
  if hhmm is null then return null; end if;
  parts := regexp_match(btrim(hhmm), '^(\d{1,2}):(\d{2})$');
  if parts is null then return null; end if;
  if parts[1]::int > 23 or parts[2]::int > 59 then return null; end if;
  return parts[1]::int * 60 + parts[2]::int;
end;
$$;

/**
 * Can this restaurant take an order right now? Both switches must agree.
 */
create or replace function public.ordering_open(rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select ordering_enabled and is_published from public.restaurants where id = rid),
    false
  ) and public.is_open_now(rid);
$$;

-- ---------------------------------------------------------------------------
-- place_order — the ONLY way a guest can create an order.
--
-- Takes a restaurant slug, the table, two optional free-text fields and the
-- lines as jsonb: [{"item_id": "...", "quantity": 2, "comment": "uten løk"}].
-- Note what is NOT in that list: a price. Every price is read from the items
-- table inside this function, which is what makes "never trust the browser"
-- true rather than aspirational.
--
-- It also refuses dishes that are sold out, dishes belonging to another
-- restaurant, and anything at all when the kitchen is shut.
-- ---------------------------------------------------------------------------

create or replace function public.place_order(
  p_restaurant_slug text,
  p_table_number    text,
  p_guest_name      text,
  p_comment         text,
  p_lines           jsonb
)
returns table (order_id uuid, order_number integer, token uuid, total_minor integer)
language plpgsql volatile security definer set search_path = public as $$
declare
  rid        uuid;
  new_order  public.orders%rowtype;
  line       jsonb;
  item       record;
  qty        integer;
  running    integer := 0;
  line_count integer := 0;
begin
  select id into rid from public.restaurants where slug = p_restaurant_slug;
  if rid is null then
    raise exception 'unknown_restaurant' using errcode = 'P0002';
  end if;

  if not public.ordering_open(rid) then
    raise exception 'ordering_closed' using errcode = 'P0001';
  end if;

  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'empty_order' using errcode = 'P0001';
  end if;

  if length(btrim(coalesce(p_table_number, ''))) = 0 then
    raise exception 'table_required' using errcode = 'P0001';
  end if;

  insert into public.orders (restaurant_id, table_number, guest_name, comment)
  values (
    rid,
    left(btrim(p_table_number), 16),
    left(btrim(coalesce(p_guest_name, '')), 80),
    left(btrim(coalesce(p_comment, '')), 500)
  )
  returning * into new_order;

  for line in select * from jsonb_array_elements(p_lines)
  loop
    qty := coalesce((line->>'quantity')::int, 0);
    if qty < 1 or qty > 99 then
      raise exception 'bad_quantity' using errcode = 'P0001';
    end if;

    -- The price comes from HERE, never from `line`.
    select i.id, i.price_minor, i.is_available,
           coalesce(
             (select t.name from public.item_translations t
               where t.item_id = i.id and t.locale = r.default_locale),
             (select t.name from public.item_translations t
               where t.item_id = i.id and t.locale = 'en'),
             i.slug
           ) as name
      into item
      from public.items i
      join public.restaurants r on r.id = i.restaurant_id
     where i.id = (line->>'item_id')::uuid
       and i.restaurant_id = rid;        -- another restaurant's dish is not findable

    if item.id is null then
      raise exception 'unknown_item' using errcode = 'P0002';
    end if;
    if not item.is_available then
      raise exception 'item_unavailable' using errcode = 'P0001';
    end if;

    insert into public.order_items (order_id, item_id, name, price_minor, quantity, comment)
    values (
      new_order.id, item.id, item.name, item.price_minor, qty,
      left(btrim(coalesce(line->>'comment', '')), 200)
    );

    running := running + item.price_minor * qty;
    line_count := line_count + 1;
  end loop;

  if line_count = 0 then
    raise exception 'empty_order' using errcode = 'P0001';
  end if;

  update public.orders set total_minor = running where id = new_order.id;

  return query select new_order.id, new_order.order_number, new_order.token, running;
end;
$$;

-- ---------------------------------------------------------------------------
-- order_status — the guest's read. One token in, one order out.
-- ---------------------------------------------------------------------------

create or replace function public.order_status(p_token uuid)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id',            o.id,
    'order_number',  o.order_number,
    'table_number',  o.table_number,
    'guest_name',    o.guest_name,
    'comment',       o.comment,
    'status',        o.status,
    'decline_reason',o.decline_reason,
    'total_minor',   o.total_minor,
    'created_at',    o.created_at,
    'updated_at',    o.updated_at,
    'restaurant_slug', r.slug,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
               'name', oi.name,
               'price_minor', oi.price_minor,
               'quantity', oi.quantity,
               'comment', oi.comment
             ) order by oi.name)
        from public.order_items oi where oi.order_id = o.id
    ), '[]'::jsonb)
  )
  from public.orders o
  join public.restaurants r on r.id = o.restaurant_id
  where o.token = p_token;
$$;

/**
 * The same, for the "my orders" button: several tokens, newest first.
 * Capped so a crafted request cannot ask for ten thousand orders at once.
 */
create or replace function public.orders_by_tokens(p_tokens uuid[])
returns jsonb
language sql stable security definer set search_path = public as $$
  -- order_number, not created_at alone: two orders placed inside one
  -- transaction share a created_at to the microsecond (now() is the
  -- transaction's clock), and "newest first" then means whatever the planner
  -- felt like. order_number comes from a sequence, so it is unique and
  -- monotonic — a total order, always.
  select coalesce(jsonb_agg(status order by created_at desc, number desc), '[]'::jsonb)
  from (
    select public.order_status(t) as status, o.created_at, o.order_number as number
    from unnest(p_tokens[1:20]) as t
    join public.orders o on o.token = t
  ) rows;
$$;

-- ---------------------------------------------------------------------------
-- Who may do what
--
-- anon and authenticated get EXECUTE on the three functions and nothing else.
-- No table grants, no policies: orders and order_items are simply invisible to
-- a guest, including through Realtime.
-- ---------------------------------------------------------------------------

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;

drop policy if exists orders_member_read on public.orders;
create policy orders_member_read on public.orders
  for select using (public.is_restaurant_member(restaurant_id));

drop policy if exists orders_member_update on public.orders;
create policy orders_member_update on public.orders
  for update using (public.is_restaurant_member(restaurant_id))
  with check (public.is_restaurant_member(restaurant_id));

drop policy if exists orders_member_delete on public.orders;
create policy orders_member_delete on public.orders
  for delete using (public.is_restaurant_member(restaurant_id));

drop policy if exists order_items_member_read on public.order_items;
create policy order_items_member_read on public.order_items
  for select using (exists (
    select 1 from public.orders o
     where o.id = order_id and public.is_restaurant_member(o.restaurant_id)
  ));

grant select, update, delete on public.orders to authenticated;
grant select on public.order_items to authenticated;

revoke all on function public.place_order(text, text, text, text, jsonb) from public;
revoke all on function public.order_status(uuid) from public;
revoke all on function public.orders_by_tokens(uuid[]) from public;
revoke all on function public.ordering_open(uuid) from public;
revoke all on function public.is_open_now(uuid) from public;

grant execute on function public.place_order(text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.order_status(uuid) to anon, authenticated;
grant execute on function public.orders_by_tokens(uuid[]) to anon, authenticated;
grant execute on function public.ordering_open(uuid) to anon, authenticated;
grant execute on function public.is_open_now(uuid) to anon, authenticated;
grant usage, select on sequence public.order_number_seq to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
--
-- The merchant's board subscribes to postgres_changes on orders. RLS applies
-- to Realtime exactly as it does to a query, so a signed-in merchant receives
-- their own restaurant's orders and nothing else, and a guest receives
-- nothing at all.
--
-- The guest's status page is pushed a broadcast instead, on a channel named
-- after their own order token — holding the token is the authorisation, the
-- same capability the page itself is reached by. The whole thing is wrapped
-- in an exception handler: if Realtime is not installed or not enabled, the
-- status update must still succeed. The app polls as well, so nothing is lost
-- either way.
-- ---------------------------------------------------------------------------

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when undefined_object then null;   -- no publication (local Postgres)
  when duplicate_object then null;   -- already added
end $$;

create or replace function public.broadcast_order_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  begin
    perform realtime.send(
      jsonb_build_object('status', new.status, 'order_id', new.id),
      'status',
      'order-' || new.token::text,
      false              -- public channel; the token in its name is the secret
    );
  exception when others then
    null;                -- Realtime missing or unhappy: polling covers it
  end;
  return new;
end;
$$;

drop trigger if exists orders_broadcast_change on public.orders;
create trigger orders_broadcast_change
  after update of status on public.orders
  for each row execute function public.broadcast_order_change();

-- ---------------------------------------------------------------------------
-- An English prompt override for the AI dish photo.
--
-- The image model is trained on English captions. The generator builds its
-- prompt from the dish's English name and description for that reason — but
-- some dishes need steering ("kjøttkaker" is not "meatballs" as an American
-- model pictures them), and this is where the merchant writes that.
--
-- Empty means "work it out from the dish", which is the normal case.
-- ---------------------------------------------------------------------------

alter table public.items add column if not exists image_prompt text not null default '';

comment on column public.items.image_prompt is
  'Optional ENGLISH description used for AI photo generation instead of the dish text.';
