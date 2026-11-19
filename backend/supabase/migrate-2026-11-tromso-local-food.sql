-- ============================================================================
-- Migration: the restaurant becomes "Tromsø Local Food" (slug tromso-local-food)
--
-- Run this ONCE in the Supabase SQL editor, THEN run seed.sql.
--
-- Renaming the existing row (instead of letting seed.sql insert a new one)
-- keeps everything hanging off it: tables, past orders, merchant logins,
-- settings and switches.
--
-- WARNING: the slug is in every menu URL. Any QR code that points at
-- /m/sofra stops working after this — print new ones for
-- /m/tromso-local-food.
--
-- Safe to run twice: the second run finds no 'sofra' row and does nothing.
-- ============================================================================

begin;

update public.restaurants
   set slug = 'tromso-local-food',
       name = 'Tromsø Local Food'
 where slug = 'sofra'
   and not exists (select 1 from public.restaurants where slug = 'tromso-local-food');

-- seed.sql leaves an existing description alone (the merchant owns it), so
-- set the new one here.
update public.restaurant_translations rt
   set description = v.description
  from (values
    ('nb', 'Nordnorsk mat på julemarkedet. God jul – spør oss om alt på menyen!'),
    ('en', 'Northern Norwegian food at the Christmas market. Merry Christmas – ask us about anything on the menu!'),
    ('it', 'Cucina della Norvegia del Nord al mercatino di Natale. Buon Natale – chiedeteci qualsiasi cosa sul menu!'),
    ('zh-CN', '圣诞市集上的北挪威风味。圣诞快乐！菜单上有什么想问的，尽管问我们！')
  ) as v(locale, description),
  public.restaurants r
 where r.slug = 'tromso-local-food'
   and rt.restaurant_id = r.id
   and rt.locale = v.locale;

commit;
