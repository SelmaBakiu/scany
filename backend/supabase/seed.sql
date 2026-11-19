-- ============================================================================
-- MenuScan — seed data
--
-- GENERATED FILE. Do not edit by hand.
--   edit  supabase/menu-data.mjs
--   then  node supabase/generate-seed.mjs
--
-- 4 categories, 11 items, 4 languages (nb, en, it, zh-CN).
-- Run AFTER schema.sql. Safe to re-run: every statement upserts.
--
-- The dish names, descriptions and prices are placeholders. The exchange
-- rates are placeholders too, not live rates. Replace both before this goes
-- in front of customers.
-- ============================================================================

insert into public.currencies (code, symbol, decimals, rate_per_eur) values
  ('NOK', 'kr', 2, 11.50000000),
  ('EUR', '€', 2, 1.00000000),
  ('USD', '$', 2, 1.10000000),
  ('SEK', 'kr', 2, 11.20000000),
  ('CNY', '¥', 2, 7.80000000)
on conflict (code) do update
  set symbol = excluded.symbol, decimals = excluded.decimals;
  -- rate_per_eur deliberately not overwritten, so re-running the seed does
  -- not stomp rates a scheduled job has since refreshed.

insert into public.locales (code, label, native_label) values
  ('nb', 'Norwegian', 'Norsk'),
  ('en', 'English', 'English'),
  ('it', 'Italian', 'Italiano'),
  ('zh-CN', 'Chinese', '中文')
on conflict (code) do update
  set label = excluded.label, native_label = excluded.native_label;

insert into public.tags (slug, kind, sort_order) values
  ('vegetarian', 'diet', 10),
  ('vegan', 'diet', 20),
  ('gluten_free', 'diet', 30),
  ('halal', 'diet', 40),
  ('nuts', 'allergen', 10),
  ('dairy', 'allergen', 20),
  ('gluten', 'allergen', 30),
  ('egg', 'allergen', 40),
  ('fish', 'allergen', 50),
  ('shellfish', 'allergen', 60),
  ('sesame', 'allergen', 70),
  ('celery', 'allergen', 80),
  ('mustard', 'allergen', 90),
  ('mild', 'heat', 10),
  ('hot', 'heat', 20),
  ('serves_two', 'info', 10),
  ('gf_on_request', 'info', 20)
on conflict (slug) do update set kind = excluded.kind, sort_order = excluded.sort_order;

insert into public.tag_translations (tag_id, locale, label)
select t.id, v.locale, v.label
from (values
  ('vegetarian', 'nb', 'Vegetar'),
  ('vegetarian', 'en', 'Vegetarian'),
  ('vegetarian', 'it', 'Vegetariano'),
  ('vegetarian', 'zh-CN', '素食'),
  ('vegan', 'nb', 'Vegansk'),
  ('vegan', 'en', 'Vegan'),
  ('vegan', 'it', 'Vegano'),
  ('vegan', 'zh-CN', '纯素'),
  ('gluten_free', 'nb', 'Glutenfri'),
  ('gluten_free', 'en', 'Gluten free'),
  ('gluten_free', 'it', 'Senza glutine'),
  ('gluten_free', 'zh-CN', '无麸质'),
  ('halal', 'nb', 'Halal'),
  ('halal', 'en', 'Halal'),
  ('halal', 'it', 'Halal'),
  ('halal', 'zh-CN', '清真'),
  ('nuts', 'nb', 'Inneholder nøtter'),
  ('nuts', 'en', 'Contains nuts'),
  ('nuts', 'it', 'Contiene frutta a guscio'),
  ('nuts', 'zh-CN', '含坚果'),
  ('dairy', 'nb', 'Inneholder melk'),
  ('dairy', 'en', 'Contains dairy'),
  ('dairy', 'it', 'Contiene latticini'),
  ('dairy', 'zh-CN', '含乳制品'),
  ('gluten', 'nb', 'Inneholder gluten'),
  ('gluten', 'en', 'Contains gluten'),
  ('gluten', 'it', 'Contiene glutine'),
  ('gluten', 'zh-CN', '含麸质'),
  ('egg', 'nb', 'Inneholder egg'),
  ('egg', 'en', 'Contains egg'),
  ('egg', 'it', 'Contiene uova'),
  ('egg', 'zh-CN', '含鸡蛋'),
  ('fish', 'nb', 'Inneholder fisk'),
  ('fish', 'en', 'Contains fish'),
  ('fish', 'it', 'Contiene pesce'),
  ('fish', 'zh-CN', '含鱼类'),
  ('shellfish', 'nb', 'Inneholder skalldyr'),
  ('shellfish', 'en', 'Contains shellfish'),
  ('shellfish', 'it', 'Contiene crostacei'),
  ('shellfish', 'zh-CN', '含贝类'),
  ('sesame', 'nb', 'Inneholder sesam'),
  ('sesame', 'en', 'Contains sesame'),
  ('sesame', 'it', 'Contiene sesamo'),
  ('sesame', 'zh-CN', '含芝麻'),
  ('celery', 'nb', 'Inneholder selleri'),
  ('celery', 'en', 'Contains celery'),
  ('celery', 'it', 'Contiene sedano'),
  ('celery', 'zh-CN', '含芹菜'),
  ('mustard', 'nb', 'Inneholder sennep'),
  ('mustard', 'en', 'Contains mustard'),
  ('mustard', 'it', 'Contiene senape'),
  ('mustard', 'zh-CN', '含芥菜籽'),
  ('mild', 'nb', 'Litt sterk'),
  ('mild', 'en', 'Mild heat'),
  ('mild', 'it', 'Poco piccante'),
  ('mild', 'zh-CN', '微辣'),
  ('hot', 'nb', 'Sterk'),
  ('hot', 'en', 'Spicy'),
  ('hot', 'it', 'Piccante'),
  ('hot', 'zh-CN', '辣'),
  ('serves_two', 'nb', 'For 2 personer'),
  ('serves_two', 'en', 'Serves 2'),
  ('serves_two', 'it', 'Per 2 persone'),
  ('serves_two', 'zh-CN', '2 人份'),
  ('gf_on_request', 'nb', 'Glutenfri på bestilling'),
  ('gf_on_request', 'en', 'GF on request'),
  ('gf_on_request', 'it', 'Senza glutine su richiesta'),
  ('gf_on_request', 'zh-CN', '可做无麸质')
) as v(tag_slug, locale, label)
join public.tags t on t.slug = v.tag_slug
on conflict (tag_id, locale) do update set label = excluded.label;

insert into public.restaurants (slug, name, base_currency, default_locale, is_published,
  theme, address, phone, email, maps_url, timezone, socials, opening_hours)
values ('tromso-local-food', 'Tromsø Local Food', 'NOK', 'nb', true,
  'lys', 'Storgata 1, 0155 Oslo', '+47 22 00 00 00', 'post@example.no', 'https://maps.google.com/?q=Storgata+1+Oslo', 'Europe/Oslo', '[{"label":"Instagram","url":"https://instagram.com/example"},{"label":"Facebook","url":"https://facebook.com/example"}]'::jsonb, '[{"day":0,"closed":false,"open":"11:00","close":"22:00"},{"day":1,"closed":false,"open":"11:00","close":"22:00"},{"day":2,"closed":false,"open":"11:00","close":"22:00"},{"day":3,"closed":false,"open":"11:00","close":"23:00"},{"day":4,"closed":false,"open":"11:00","close":"23:30"},{"day":5,"closed":false,"open":"12:00","close":"23:30"},{"day":6,"closed":true,"open":"","close":""}]'::jsonb)
on conflict (slug) do update
  set name = excluded.name,
      base_currency = excluded.base_currency,
      default_locale = excluded.default_locale,
      is_published = excluded.is_published;
      -- theme and the contact details are deliberately NOT overwritten:
      -- re-running the seed must not undo what the merchant edited.

insert into public.restaurant_translations (restaurant_id, locale, description)
select r.id, v.locale, v.description
from (values
  ('nb', 'Nordnorsk mat på julemarkedet. God jul – spør oss om alt på menyen!'),
  ('en', 'Northern Norwegian food at the Christmas market. Merry Christmas – ask us about anything on the menu!'),
  ('it', 'Cucina della Norvegia del Nord al mercatino di Natale. Buon Natale – chiedeteci qualsiasi cosa sul menu!'),
  ('zh-CN', '圣诞市集上的北挪威风味。圣诞快乐！菜单上有什么想问的，尽管问我们！')
) as v(locale, description)
join public.restaurants r on r.slug = 'tromso-local-food'
on conflict (restaurant_id, locale) do nothing;
  -- do nothing, not do update: the merchant owns this text once they edit it.

insert into public.restaurant_locales (restaurant_id, locale)
select r.id, v.locale
from (values ('nb'), ('en'), ('it'), ('zh-CN')) as v(locale)
cross join public.restaurants r
where r.slug = 'tromso-local-food'
on conflict do nothing;

insert into public.menus (restaurant_id, slug, sort_order, is_active)
select r.id, 'dinner', 0, true from public.restaurants r where r.slug = 'tromso-local-food'
on conflict (restaurant_id, slug) do update set is_active = excluded.is_active;

insert into public.menu_translations (menu_id, locale, name)
select m.id, v.locale, v.name
from (values
  ('nb', 'Meny'),
  ('en', 'Menu'),
  ('it', 'Menu'),
  ('zh-CN', '菜单')
) as v(locale, name)
join public.menus m on m.slug = 'dinner'
join public.restaurants r on r.id = m.restaurant_id and r.slug = 'tromso-local-food'
on conflict (menu_id, locale) do update set name = excluded.name;

insert into public.categories (restaurant_id, menu_id, slug, sort_order)
select r.id, m.id, v.slug, v.sort_order
from (values
  ('fiskekaker', 10),
  ('reinsdyr', 20),
  ('arktisk-varme', 30),
  ('lokale-produkter', 40)
) as v(slug, sort_order)
join public.restaurants r on r.slug = 'tromso-local-food'
join public.menus m on m.restaurant_id = r.id and m.slug = 'dinner'
on conflict (restaurant_id, slug) do update set sort_order = excluded.sort_order;

insert into public.category_translations (category_id, locale, name)
select c.id, v.locale, v.name
from (values
  ('fiskekaker', 'nb', 'Tromsø-fiskekaker'),
  ('fiskekaker', 'en', 'Tromsø Fish Cakes'),
  ('fiskekaker', 'it', 'Polpette di pesce di Tromsø'),
  ('fiskekaker', 'zh-CN', '特罗姆瑟鱼饼'),
  ('reinsdyr', 'nb', 'Lokalt reinsdyr'),
  ('reinsdyr', 'en', 'Local Reindeer'),
  ('reinsdyr', 'it', 'Renna locale'),
  ('reinsdyr', 'zh-CN', '驯鹿'),
  ('arktisk-varme', 'nb', 'Arktisk varme'),
  ('arktisk-varme', 'en', 'Arctic Hearth'),
  ('arktisk-varme', 'it', 'Focolare artico'),
  ('arktisk-varme', 'zh-CN', '极地暖汤'),
  ('lokale-produkter', 'nb', 'Lokale produkter'),
  ('lokale-produkter', 'en', 'Local Products'),
  ('lokale-produkter', 'it', 'Prodotti locali'),
  ('lokale-produkter', 'zh-CN', '本地特产')
) as v(cat_slug, locale, name)
join public.categories c on c.slug = v.cat_slug
join public.restaurants r on r.id = c.restaurant_id and r.slug = 'tromso-local-food'
on conflict (category_id, locale) do update set name = excluded.name;

-- price_minor is in øre: 18900 = kr 189,00
insert into public.items (restaurant_id, category_id, slug, price_minor, is_available, is_featured, sort_order)
select r.id, c.id, v.slug, v.price_minor, v.is_available, v.is_featured, v.sort_order
from (values
  ('fiskekaker-2', 'fiskekaker', 13000, true, false, 10),
  ('fiskekaker-3', 'fiskekaker', 17000, true, true, 20),
  ('torskerogn-potetsalat', 'fiskekaker', 5000, true, false, 30),
  ('reinsdyrpolse-brod', 'reinsdyr', 15000, true, false, 10),
  ('reinsdyrpolse-papir', 'reinsdyr', 13000, true, false, 20),
  ('vill-vinterkraft', 'arktisk-varme', 24000, true, false, 10),
  ('reinsdyrsnacks', 'lokale-produkter', 7000, true, false, 10),
  ('reinsdyrsalami', 'lokale-produkter', 28000, true, false, 20),
  ('aurora-skinke', 'lokale-produkter', 190000, true, false, 30),
  ('torket-reinsdyrkjott', 'lokale-produkter', 270000, true, false, 40),
  ('klippfisk', 'lokale-produkter', 41000, true, false, 50)
) as v(slug, cat_slug, price_minor, is_available, is_featured, sort_order)
join public.restaurants r on r.slug = 'tromso-local-food'
join public.categories c on c.restaurant_id = r.id and c.slug = v.cat_slug
on conflict (restaurant_id, slug) do update
  set price_minor  = excluded.price_minor,
      category_id  = excluded.category_id,
      is_available = excluded.is_available,
      is_featured  = excluded.is_featured,
      sort_order   = excluded.sort_order,
      updated_at   = now();

insert into public.item_translations (item_id, locale, name, description, description_long, ingredients)
select i.id, v.locale, v.name, v.description, v.description_long, v.ingredients
from (values
  ('fiskekaker-2', 'nb', '2 fiskekaker (smakebit)', 'Hyse, helmelk og krydder – kål, tartarsaus, tangpulver', 'Tradisjonell nordnorsk oppskrift: fersk hyse, helmelk og krydder, stekt lette og luftige. Serveres med sprø strimlet kål, tartarsaus og tangpulver. Glutenfri.', 'Hyse, helmelk, krydder, kål, tartarsaus, tangpulver'),
  ('fiskekaker-2', 'en', '2 Fish Cakes (to try)', 'Haddock, whole milk & spices – cabbage, tartare, seaweed', 'Traditional Northern Norwegian recipe: fresh haddock, whole milk & spices, pan-fried light and fluffy. Served with crispy shredded cabbage, tartare sauce and seaweed powder. Gluten-free.', 'Haddock, whole milk, spices, cabbage, tartare sauce, seaweed powder'),
  ('fiskekaker-2', 'it', '2 polpette di pesce (assaggio)', 'Eglefino, latte intero e spezie – cavolo, tartara, alghe', 'Ricetta tradizionale della Norvegia del Nord: eglefino fresco, latte intero e spezie, fritte in padella leggere e soffici. Servite con cavolo croccante a striscioline, salsa tartara e polvere di alghe. Senza glutine.', 'Eglefino, latte intero, spezie, cavolo, salsa tartara, polvere di alghe'),
  ('fiskekaker-2', 'zh-CN', '鱼饼 2 块（尝鲜小份）', '黑线鳕、全脂牛奶、香料——配卷心菜丝、塔塔酱、海藻粉', '挪威北部传统做法：以新鲜黑线鳕、全脂牛奶和香料制成，煎至松软。配香脆卷心菜丝、塔塔酱和海藻粉。无麸质。', '黑线鳕、全脂牛奶、香料、卷心菜、塔塔酱、海藻粉'),
  ('fiskekaker-3', 'nb', '3 fiskekaker', 'Som en lokal – et helt måltid', 'Tradisjonell nordnorsk oppskrift: fersk hyse, helmelk og krydder, stekt lette og luftige. Serveres med sprø strimlet kål, tartarsaus og tangpulver. Glutenfri.', 'Hyse, helmelk, krydder, kål, tartarsaus, tangpulver'),
  ('fiskekaker-3', 'en', '3 Fish Cakes', 'Like a local – a full meal', 'Traditional Northern Norwegian recipe: fresh haddock, whole milk & spices, pan-fried light and fluffy. Served with crispy shredded cabbage, tartare sauce and seaweed powder. Gluten-free.', 'Haddock, whole milk, spices, cabbage, tartare sauce, seaweed powder'),
  ('fiskekaker-3', 'it', '3 polpette di pesce', 'Come un locale – un pasto completo', 'Ricetta tradizionale della Norvegia del Nord: eglefino fresco, latte intero e spezie, fritte in padella leggere e soffici. Servite con cavolo croccante a striscioline, salsa tartara e polvere di alghe. Senza glutine.', 'Eglefino, latte intero, spezie, cavolo, salsa tartara, polvere di alghe'),
  ('fiskekaker-3', 'zh-CN', '鱼饼 3 块', '本地人份量，管饱', '挪威北部传统做法：以新鲜黑线鳕、全脂牛奶和香料制成，煎至松软。配香脆卷心菜丝、塔塔酱和海藻粉。无麸质。', '黑线鳕、全脂牛奶、香料、卷心菜、塔塔酱、海藻粉'),
  ('torskerogn-potetsalat', 'nb', '+ Potetsalat med røkt torskerogn', 'Anbefalt tilbehør', 'Potetsalat med saltet og røkt torskerogn. Anbefalt tilbehør til fiskekakene.', 'Potet, saltet og røkt torskerogn'),
  ('torskerogn-potetsalat', 'en', '+ Smoked Cod Roe Potato Salad', 'Recommended side', 'Potato salad with cured & smoked cod eggs. The recommended side for the fish cakes.', 'Potato, cured & smoked cod roe'),
  ('torskerogn-potetsalat', 'it', '+ Insalata di patate con uova di merluzzo affumicate', 'Contorno consigliato', 'Insalata di patate con uova di merluzzo salate e affumicate. Il contorno consigliato per le polpette di pesce.', 'Patate, uova di merluzzo salate e affumicate'),
  ('torskerogn-potetsalat', 'zh-CN', '+ 烟熏鳕鱼子土豆沙拉', '推荐搭配', '土豆沙拉配腌制烟熏鳕鱼子。鱼饼的推荐搭配。', '土豆、腌制烟熏鳕鱼子'),
  ('reinsdyrpolse-brod', 'nb', 'Slakterens reinsdyrpølse – i mykt brød', 'Grovkvernet, 87 % kjøtt, kål og søt sennep', 'Grovkvernet, 87 % kjøtt. Serveres med sprø strimlet kål og søt sennep. Brødet inneholder gluten og kan inneholde spor av sesam.', 'Reinsdyrpølse (87 % kjøtt), kål, søt sennep, pølsebrød'),
  ('reinsdyrpolse-brod', 'en', 'The Butcher''s Reindeer Sausage – in a soft bun', 'Coarse-ground, 87% meat, cabbage & sweet mustard', 'Coarse-ground, 87% meat. Served with crispy shredded cabbage & sweet mustard. The bread contains gluten and may contain traces of sesame.', 'Reindeer sausage (87% meat), cabbage, sweet mustard, soft bun'),
  ('reinsdyrpolse-brod', 'it', 'Salsiccia di renna del macellaio – nel panino morbido', 'Macinata grossa, 87% carne, cavolo e senape dolce', 'Macinata grossa, 87% di carne. Servita con cavolo croccante a striscioline e senape dolce. Il pane contiene glutine e può contenere tracce di sesamo.', 'Salsiccia di renna (87% carne), cavolo, senape dolce, panino morbido'),
  ('reinsdyrpolse-brod', 'zh-CN', '肉铺特制驯鹿香肠——夹松软小面包', '粗绞，肉含量 87%，配卷心菜丝和甜芥末酱', '粗绞，肉含量 87%。配香脆卷心菜丝和甜芥末酱。面包含麸质，可能含微量芝麻。', '驯鹿香肠（肉含量 87%）、卷心菜、甜芥末酱、松软小面包'),
  ('reinsdyrpolse-papir', 'nb', 'Slakterens reinsdyrpølse – pølse i papir', 'Grovkvernet, 87 % kjøtt, kål og søt sennep', 'Grovkvernet, 87 % kjøtt. Serveres med sprø strimlet kål og søt sennep. Servert klassisk, i papir.', 'Reinsdyrpølse (87 % kjøtt), kål, søt sennep'),
  ('reinsdyrpolse-papir', 'en', 'The Butcher''s Reindeer Sausage – in the classic paper wrap', 'Pølse i papir · coarse-ground, 87% meat', 'Coarse-ground, 87% meat. Served with crispy shredded cabbage & sweet mustard. Served the classic way, in a paper wrap (pølse i papir).', 'Reindeer sausage (87% meat), cabbage, sweet mustard'),
  ('reinsdyrpolse-papir', 'it', 'Salsiccia di renna del macellaio – nella classica carta', 'Pølse i papir · macinata grossa, 87% carne', 'Macinata grossa, 87% di carne. Servita con cavolo croccante a striscioline e senape dolce. Servita alla maniera classica, avvolta nella carta (pølse i papir).', 'Salsiccia di renna (87% carne), cavolo, senape dolce'),
  ('reinsdyrpolse-papir', 'zh-CN', '肉铺特制驯鹿香肠——传统纸包', 'Pølse i papir · 粗绞，肉含量 87%', '粗绞，肉含量 87%。配香脆卷心菜丝和甜芥末酱。传统纸包（pølse i papir）。', '驯鹿香肠（肉含量 87%）、卷心菜、甜芥末酱'),
  ('vill-vinterkraft', 'nb', 'Vill vinterkraft (oksehale og rein)', 'Oksehale, rein, rotgrønnsaker og tyttebær', 'Fyldig og varmende, med mør oksehale og rein, rotgrønnsaker og ville tyttebær. Familielaget, servert med sprøtt brød. Brødet inneholder gluten og kan inneholde spor av sesam.', 'Oksehale, reinsdyrkjøtt, rotgrønnsaker, tyttebær, brød'),
  ('vill-vinterkraft', 'en', 'Wild Winter Bone Broth (oxtail & reindeer)', 'Oxtail, reindeer, root vegetables & lingonberries', 'Rich and heartwarming, with tender oxtail & reindeer, root vegetables and wild lingonberries. Family-made, served with crusty bread. The bread contains gluten and may contain traces of sesame.', 'Oxtail, reindeer, root vegetables, lingonberries, bread'),
  ('vill-vinterkraft', 'it', 'Brodo d''ossa invernale selvatico (coda di bue e renna)', 'Coda di bue, renna, radici e mirtilli rossi', 'Ricco e confortante, con tenera coda di bue e renna, verdure di radice e mirtilli rossi selvatici. Fatto in famiglia, servito con pane croccante. Il pane contiene glutine e può contenere tracce di sesamo.', 'Coda di bue, renna, verdure di radice, mirtilli rossi, pane'),
  ('vill-vinterkraft', 'zh-CN', '野味冬日骨汤（牛尾与驯鹿肉）', '牛尾、驯鹿肉、根茎蔬菜、野生越橘', '浓郁暖心，内含鲜嫩牛尾与驯鹿肉、根茎蔬菜和野生越橘。家庭自制，配脆皮面包。面包含麸质，可能含微量芝麻。', '牛尾、驯鹿肉、根茎蔬菜、越橘、面包'),
  ('reinsdyrsnacks', 'nb', 'Reinsdyrsnacks', 'kr 70 · 3 for kr 190', 'Reisevennlig: holder seg trygt i romtemperatur i minst to uker. Kr 70 stykket, eller 3 for kr 190 – spør oss.', 'Spør oss om full ingrediensliste'),
  ('reinsdyrsnacks', 'en', 'Reindeer snack', 'kr 70 · 3 for kr 190', 'Travel-friendly: safe at room temperature for at least two weeks. kr 70 each, or 3 for kr 190 – just ask.', 'Ask us for the full ingredient list'),
  ('reinsdyrsnacks', 'it', 'Snack di renna', 'kr 70 · 3 per kr 190', 'Comodo da portare in viaggio: si conserva a temperatura ambiente per almeno due settimane. kr 70 l''uno, oppure 3 per kr 190 – chiedeteci.', 'Chiedeteci l''elenco completo degli ingredienti'),
  ('reinsdyrsnacks', 'zh-CN', '驯鹿肉小食', 'kr 70 · 3 件 kr 190', '便于携带：常温下可安全保存至少两周。每件 kr 70，3 件 kr 190——请询问我们。', '完整配料请询问我们'),
  ('reinsdyrsalami', 'nb', 'Reinsdyrsalami, hel', 'Reisevennlig – tåler romtemperatur', 'Reisevennlig: holder seg trygt i romtemperatur i minst to uker.', 'Spør oss om full ingrediensliste'),
  ('reinsdyrsalami', 'en', 'Reindeer salami, whole', 'Travel-friendly – keeps at room temperature', 'Travel-friendly: safe at room temperature for at least two weeks.', 'Ask us for the full ingredient list'),
  ('reinsdyrsalami', 'it', 'Salame di renna, intero', 'Da viaggio – si conserva a temperatura ambiente', 'Comodo da portare in viaggio: si conserva a temperatura ambiente per almeno due settimane.', 'Chiedeteci l''elenco completo degli ingredienti'),
  ('reinsdyrsalami', 'zh-CN', '驯鹿萨拉米香肠（整根）', '便于携带——常温保存', '便于携带：常温下可安全保存至少两周。', '完整配料请询问我们'),
  ('aurora-skinke', 'nb', 'Aurora-skinke (per kilo)', 'Reisevennlig – tåler romtemperatur', 'Reisevennlig: holder seg trygt i romtemperatur i minst to uker.', 'Spør oss om full ingrediensliste'),
  ('aurora-skinke', 'en', 'Aurora ham (per kilo)', 'Travel-friendly – keeps at room temperature', 'Travel-friendly: safe at room temperature for at least two weeks.', 'Ask us for the full ingredient list'),
  ('aurora-skinke', 'it', 'Prosciutto Aurora (al chilo)', 'Da viaggio – si conserva a temperatura ambiente', 'Comodo da portare in viaggio: si conserva a temperatura ambiente per almeno due settimane.', 'Chiedeteci l''elenco completo degli ingredienti'),
  ('aurora-skinke', 'zh-CN', '极光火腿（每公斤）', '便于携带——常温保存', '便于携带：常温下可安全保存至少两周。', '完整配料请询问我们'),
  ('torket-reinsdyrkjott', 'nb', 'Tørket reinsdyrkjøtt, røkt (per kilo)', 'Reisevennlig – tåler romtemperatur', 'Reisevennlig: holder seg trygt i romtemperatur i minst to uker.', 'Spør oss om full ingrediensliste'),
  ('torket-reinsdyrkjott', 'en', 'Dried reindeer meat, smoked (per kilo)', 'Travel-friendly – keeps at room temperature', 'Travel-friendly: safe at room temperature for at least two weeks.', 'Ask us for the full ingredient list'),
  ('torket-reinsdyrkjott', 'it', 'Carne di renna essiccata e affumicata (al chilo)', 'Da viaggio – si conserva a temperatura ambiente', 'Comodo da portare in viaggio: si conserva a temperatura ambiente per almeno due settimane.', 'Chiedeteci l''elenco completo degli ingredienti'),
  ('torket-reinsdyrkjott', 'zh-CN', '烟熏驯鹿肉干（每公斤）', '便于携带——常温保存', '便于携带：常温下可安全保存至少两周。', '完整配料请询问我们'),
  ('klippfisk', 'nb', 'Klippfisk, saltmodnet og tørket (per eske)', 'Reisevennlig – tåler romtemperatur', 'Reisevennlig: holder seg trygt i romtemperatur i minst to uker.', 'Spør oss om full ingrediensliste'),
  ('klippfisk', 'en', 'Clipfish, salt-matured & dried (per box)', 'Travel-friendly – keeps at room temperature', 'Travel-friendly: safe at room temperature for at least two weeks.', 'Ask us for the full ingredient list'),
  ('klippfisk', 'it', 'Baccalà, maturato sotto sale ed essiccato (a scatola)', 'Da viaggio – si conserva a temperatura ambiente', 'Comodo da portare in viaggio: si conserva a temperatura ambiente per almeno due settimane.', 'Chiedeteci l''elenco completo degli ingredienti'),
  ('klippfisk', 'zh-CN', '盐腌风干鱼干（每盒）', '便于携带——常温保存', '便于携带：常温下可安全保存至少两周。', '完整配料请询问我们')
) as v(item_slug, locale, name, description, description_long, ingredients)
join public.items i on i.slug = v.item_slug
join public.restaurants r on r.id = i.restaurant_id and r.slug = 'tromso-local-food'
on conflict (item_id, locale) do update
  set name = excluded.name,
      description = excluded.description,
      description_long = excluded.description_long,
      ingredients = excluded.ingredients;

insert into public.item_tags (item_id, tag_id)
select i.id, t.id
from (values
  ('fiskekaker-2', 'gluten_free'),
  ('fiskekaker-2', 'fish'),
  ('fiskekaker-2', 'dairy'),
  ('fiskekaker-2', 'celery'),
  ('fiskekaker-2', 'mustard'),
  ('fiskekaker-2', 'egg'),
  ('fiskekaker-3', 'gluten_free'),
  ('fiskekaker-3', 'fish'),
  ('fiskekaker-3', 'dairy'),
  ('fiskekaker-3', 'celery'),
  ('fiskekaker-3', 'mustard'),
  ('fiskekaker-3', 'egg'),
  ('torskerogn-potetsalat', 'fish'),
  ('torskerogn-potetsalat', 'mustard'),
  ('torskerogn-potetsalat', 'egg'),
  ('reinsdyrpolse-brod', 'mustard'),
  ('reinsdyrpolse-brod', 'egg'),
  ('reinsdyrpolse-brod', 'gluten'),
  ('reinsdyrpolse-papir', 'mustard'),
  ('reinsdyrpolse-papir', 'egg'),
  ('vill-vinterkraft', 'celery'),
  ('vill-vinterkraft', 'gluten'),
  ('klippfisk', 'fish')
) as v(item_slug, tag_slug)
join public.items i on i.slug = v.item_slug
join public.restaurants r on r.id = i.restaurant_id and r.slug = 'tromso-local-food'
join public.tags t on t.slug = v.tag_slug
on conflict do nothing;

-- Remove anything no longer in menu-data.mjs.
delete from public.items i
using public.restaurants r
where i.restaurant_id = r.id and r.slug = 'tromso-local-food'
  and i.slug not in ('fiskekaker-2', 'fiskekaker-3', 'torskerogn-potetsalat', 'reinsdyrpolse-brod', 'reinsdyrpolse-papir', 'vill-vinterkraft', 'reinsdyrsnacks', 'reinsdyrsalami', 'aurora-skinke', 'torket-reinsdyrkjott', 'klippfisk');

delete from public.categories c
using public.restaurants r
where c.restaurant_id = r.id and r.slug = 'tromso-local-food'
  and c.slug not in ('fiskekaker', 'reinsdyr', 'arktisk-varme', 'lokale-produkter');
