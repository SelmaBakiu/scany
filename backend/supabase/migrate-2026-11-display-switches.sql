-- ============================================================================
-- MenuScan — merchant switches for what the guest's menu shows
--
--   currency_conversion_enabled  off = prices only in the restaurant's own
--                                currency; the currency picker is hidden.
--   show_photos                  off = no dish photos anywhere on the menu.
--
-- (Ordering already has its own switch: restaurants.ordering_enabled.)
--
-- Run once in the Supabase SQL editor, after schema.sql. Safe to re-run.
-- The app selects these columns, so the guest menu errors until this has run.
-- ============================================================================

alter table public.restaurants
  add column if not exists currency_conversion_enabled boolean not null default true;

alter table public.restaurants
  add column if not exists show_photos boolean not null default true;

comment on column public.restaurants.currency_conversion_enabled is
  'Off = guests see prices only in base_currency, with no currency picker.';

comment on column public.restaurants.show_photos is
  'Off = the guest menu shows no dish photos at all.';
