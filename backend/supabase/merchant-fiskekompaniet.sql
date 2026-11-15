-- ============================================================================
-- MenuScan — merchant: Fiskekompaniet
--
-- Creates the restaurant /m/fiskekompaniet with its three menus, taken from
--   https://fiskekompani.no/lunsjmeny     -> menu 'lunsj'
--   https://fiskekompani.no/middagsmeny   -> menu 'middag'      (active)
--   https://fiskekompani.no/sj-matbaren   -> menu 'sjomatbaren'
--
-- Only one menu can be live at a time (menus_one_active_per_restaurant). The
-- merchant switches between them in /admin/menus.
--
-- Run AFTER schema.sql and seed.sql (it needs the NOK currency and the nb /
-- en / zh-CN locales). Safe to re-run: every insert is ON CONFLICT DO NOTHING,
-- so a re-run never overwrites what the merchant has since edited.
--
-- Not included, because the website gives no price for them:
--   * Østers naturell (Sjømatbaren) and Østers (Middag) — "spør om dagens utvalg"
--   * Dagens kjøtt (Sjømatbaren) — "spør oss om utvalg & pris"
-- The website lists no allergens, so no allergen tags are set.
-- Address, phone and opening hours are not on the menu pages; fill them in
-- under /admin.
--
-- Owner account: create it from /management/stores (edit the store and set
-- an owner email + password), or with merchant-setup.sql.
-- ============================================================================

insert into public.restaurants (slug, name, base_currency, default_locale, is_published,
  theme, timezone, socials)
values ('fiskekompaniet', 'Fiskekompaniet', 'NOK', 'nb', true,
  'lys', 'Europe/Oslo', '[{"label":"Nettside","url":"https://fiskekompani.no"}]'::jsonb)
on conflict (slug) do nothing;

insert into public.restaurant_locales (restaurant_id, locale)
select r.id, v.locale
from (values ('nb'), ('en'), ('zh-CN')) as v(locale)
cross join public.restaurants r
where r.slug = 'fiskekompaniet'
on conflict do nothing;

insert into public.restaurant_translations (restaurant_id, locale, description)
select r.id, v.locale, v.description
from (values
  ('nb', 'Sjømatrestaurant med lunsj, middag og sjømatbar.'),
  ('en', 'Seafood restaurant with lunch, dinner and a seafood bar.'),
  ('zh-CN', '海鲜餐厅，提供午餐、晚餐和海鲜吧。')
) as v(locale, description)
join public.restaurants r on r.slug = 'fiskekompaniet'
on conflict (restaurant_id, locale) do nothing;

-- ---------------------------------------------------------------------------
-- Menus
-- ---------------------------------------------------------------------------

insert into public.menus (restaurant_id, slug, sort_order, is_active)
select r.id, v.slug, v.sort_order, v.is_active
from (values
  ('lunsj', 10, false),
  ('middag', 20, true),
  ('sjomatbaren', 30, false)
) as v(slug, sort_order, is_active)
join public.restaurants r on r.slug = 'fiskekompaniet'
on conflict (restaurant_id, slug) do nothing;

insert into public.menu_translations (menu_id, locale, name)
select m.id, v.locale, v.name
from (values
  ('lunsj', 'nb', 'Lunsj'),
  ('lunsj', 'en', 'Lunch'),
  ('lunsj', 'zh-CN', '午餐'),
  ('middag', 'nb', 'Middag'),
  ('middag', 'en', 'Dinner'),
  ('middag', 'zh-CN', '晚餐'),
  ('sjomatbaren', 'nb', 'Sjømatbaren'),
  ('sjomatbaren', 'en', 'Seafood bar'),
  ('sjomatbaren', 'zh-CN', '海鲜吧')
) as v(menu_slug, locale, name)
join public.restaurants r on r.slug = 'fiskekompaniet'
join public.menus m on m.restaurant_id = r.id and m.slug = v.menu_slug
on conflict (menu_id, locale) do nothing;

-- ---------------------------------------------------------------------------
-- Categories. Slugs are unique per restaurant, not per menu, hence the
-- l- / m- / s- prefixes.
-- ---------------------------------------------------------------------------

insert into public.categories (restaurant_id, menu_id, slug, sort_order)
select r.id, m.id, v.slug, v.sort_order
from (values
  ('l-kaviar', 'lunsj', 10),
  ('l-osters', 'lunsj', 20),
  ('l-skalldyr', 'lunsj', 30),
  ('l-varmretter', 'lunsj', 40),
  ('l-dessert', 'lunsj', 50),
  ('l-tilbehor', 'lunsj', 60),
  ('m-menyer', 'middag', 10),
  ('m-mer', 'middag', 20),
  ('s-kaviar', 'sjomatbaren', 10),
  ('s-skalldyr', 'sjomatbaren', 20),
  ('s-forretter', 'sjomatbaren', 30),
  ('s-hovedretter', 'sjomatbaren', 40),
  ('s-sott-ost', 'sjomatbaren', 50)
) as v(slug, menu_slug, sort_order)
join public.restaurants r on r.slug = 'fiskekompaniet'
join public.menus m on m.restaurant_id = r.id and m.slug = v.menu_slug
on conflict (restaurant_id, slug) do nothing;

insert into public.category_translations (category_id, locale, name)
select c.id, v.locale, v.name
from (values
  ('l-kaviar', 'nb', 'Kaviar & løyrom'),
  ('l-kaviar', 'en', 'Caviar & roe'),
  ('l-kaviar', 'zh-CN', '鱼子酱与鱼籽'),
  ('l-osters', 'nb', 'Østers'),
  ('l-osters', 'en', 'Oysters'),
  ('l-osters', 'zh-CN', '生蚝'),
  ('l-skalldyr', 'nb', 'Skalldyr'),
  ('l-skalldyr', 'en', 'Shellfish'),
  ('l-skalldyr', 'zh-CN', '贝类海鲜'),
  ('l-varmretter', 'nb', 'Varmretter'),
  ('l-varmretter', 'en', 'Hot dishes'),
  ('l-varmretter', 'zh-CN', '热菜'),
  ('l-dessert', 'nb', 'Dessert & ost'),
  ('l-dessert', 'en', 'Dessert & cheese'),
  ('l-dessert', 'zh-CN', '甜点与奶酪'),
  ('l-tilbehor', 'nb', 'Tilbehør'),
  ('l-tilbehor', 'en', 'Sides'),
  ('l-tilbehor', 'zh-CN', '配菜'),
  ('m-menyer', 'nb', 'Menyer'),
  ('m-menyer', 'en', 'Set menus'),
  ('m-menyer', 'zh-CN', '套餐'),
  ('m-mer', 'nb', 'Mer'),
  ('m-mer', 'en', 'À la carte'),
  ('m-mer', 'zh-CN', '单点'),
  ('s-kaviar', 'nb', 'Kaviar'),
  ('s-kaviar', 'en', 'Caviar'),
  ('s-kaviar', 'zh-CN', '鱼子酱'),
  ('s-skalldyr', 'nb', 'Skalldyr & bløtdyr'),
  ('s-skalldyr', 'en', 'Shellfish & molluscs'),
  ('s-skalldyr', 'zh-CN', '贝类与软体海鲜'),
  ('s-forretter', 'nb', 'Forretter'),
  ('s-forretter', 'en', 'Starters'),
  ('s-forretter', 'zh-CN', '前菜'),
  ('s-hovedretter', 'nb', 'Hovedretter'),
  ('s-hovedretter', 'en', 'Mains'),
  ('s-hovedretter', 'zh-CN', '主菜'),
  ('s-sott-ost', 'nb', 'Søtt / Ost'),
  ('s-sott-ost', 'en', 'Sweet / Cheese'),
  ('s-sott-ost', 'zh-CN', '甜点 / 奶酪')
) as v(cat_slug, locale, name)
join public.restaurants r on r.slug = 'fiskekompaniet'
join public.categories c on c.restaurant_id = r.id and c.slug = v.cat_slug
on conflict (category_id, locale) do nothing;

-- ---------------------------------------------------------------------------
-- Items. price_minor is in øre: 35000 = kr 350.
-- The schema has no size variants, so each size is its own item.
-- ---------------------------------------------------------------------------

insert into public.items (restaurant_id, category_id, slug, price_minor, is_available, is_featured, sort_order)
select r.id, c.id, v.slug, v.price_minor, true, false, v.sort_order
from (values
  -- Lunsj
  ('l-loyrom-30', 'l-kaviar', 35000, 10),
  ('l-loyrom-100', 'l-kaviar', 99500, 20),
  ('l-oscietra-10', 'l-kaviar', 49500, 30),
  ('l-oscietra-30', 'l-kaviar', 99500, 40),
  ('l-oscietra-50', 'l-kaviar', 149500, 50),
  ('l-osters-fine-de-claire', 'l-osters', 8000, 10),
  ('l-osters-speciale', 'l-osters', 9000, 20),
  ('l-osters-bb-peter', 'l-osters', 9000, 30),
  ('l-lyngenreker', 'l-skalldyr', 29500, 10),
  ('l-blaskjell', 'l-skalldyr', 29500, 20),
  ('l-snokrabbe', 'l-skalldyr', 42500, 30),
  ('l-kongekrabbe', 'l-skalldyr', 49500, 40),
  ('l-fiskesuppe-liten', 'l-varmretter', 25500, 10),
  ('l-fiskesuppe-stor', 'l-varmretter', 32500, 20),
  ('l-uer-meuniere', 'l-varmretter', 39500, 30),
  ('l-dagens-fangst', 'l-varmretter', 39500, 40),
  ('l-brunostiskrem', 'l-dessert', 18500, 10),
  ('l-nidelven-bla', 'l-dessert', 18500, 20),
  ('l-surdeigsbrod', 'l-tilbehor', 6800, 10),
  -- Middag
  ('m-3-retter', 'm-menyer', 89500, 10),
  ('m-3-retter-vin', 'm-menyer', 149000, 20),
  ('m-5-retter', 'm-menyer', 119500, 30),
  ('m-5-retter-vin', 'm-menyer', 209000, 40),
  ('m-ostetillegg', 'm-menyer', 19500, 50),
  ('m-loyrom-30', 'm-mer', 35000, 10),
  ('m-loyrom-100', 'm-mer', 99500, 20),
  ('m-oscietra-10', 'm-mer', 49500, 30),
  ('m-oscietra-30', 'm-mer', 99500, 40),
  ('m-oscietra-50', 'm-mer', 149500, 50),
  ('m-skalldyrsplata', 'm-mer', 119500, 60),
  ('m-kongekrabbe-tillegg', 'm-mer', 49500, 70),
  ('m-lutefisk', 'm-mer', 52500, 80),
  ('m-lutefisk-pafyll', 'm-mer', 26500, 90),
  ('m-nidelven-bla', 'm-mer', 19500, 100),
  ('m-brunostiskrem', 'm-mer', 19500, 110),
  -- Sjømatbaren
  ('s-oscietra-10', 's-kaviar', 49500, 10),
  ('s-oscietra-30', 's-kaviar', 99500, 20),
  ('s-oscietra-50', 's-kaviar', 149500, 30),
  ('s-kalix-30', 's-kaviar', 35000, 40),
  ('s-kalix-100', 's-kaviar', 99500, 50),
  ('s-rockefeller', 's-skalldyr', 24000, 10),
  ('s-blaskjell', 's-skalldyr', 29500, 20),
  ('s-snokrabbe', 's-skalldyr', 42500, 30),
  ('s-kongekrabbe', 's-skalldyr', 49500, 40),
  ('s-lyngenreker', 's-skalldyr', 29500, 50),
  ('s-bolinhos', 's-forretter', 19500, 10),
  ('s-fiskesuppe-liten', 's-forretter', 25500, 20),
  ('s-fiskesuppe-stor', 's-forretter', 32500, 30),
  ('s-gravet-kveite', 's-forretter', 26500, 40),
  ('s-breiflabb', 's-hovedretter', 49500, 10),
  ('s-dagens-fangst', 's-hovedretter', 56500, 20),
  ('s-lutefisk', 's-hovedretter', 52500, 30),
  ('s-lutefisk-pafyll', 's-hovedretter', 26500, 40),
  ('s-skalldyrsplata', 's-hovedretter', 109500, 50),
  ('s-brunostiskrem', 's-sott-ost', 18500, 10),
  ('s-nidelven-bla', 's-sott-ost', 18500, 20)
) as v(slug, cat_slug, price_minor, sort_order)
join public.restaurants r on r.slug = 'fiskekompaniet'
join public.categories c on c.restaurant_id = r.id and c.slug = v.cat_slug
on conflict (restaurant_id, slug) do nothing;

insert into public.item_translations (item_id, locale, name, description, description_long)
select i.id, v.locale, v.name, v.description, v.description_long
from (values
  -- ===== Lunsj =====
  ('l-loyrom-30', 'nb', 'Løyrom fra Kalix 30 g', 'Med smørstekt brioche, rømme & sitron', null),
  ('l-loyrom-30', 'en', 'Kalix vendace roe 30 g', 'With butter-fried brioche, sour cream & lemon', null),
  ('l-loyrom-30', 'zh-CN', '卡利克斯白鲑鱼籽 30 克', '配黄油煎布里欧修、酸奶油和柠檬', null),
  ('l-loyrom-100', 'nb', 'Løyrom fra Kalix 100 g', 'Med smørstekt brioche, rømme & sitron', null),
  ('l-loyrom-100', 'en', 'Kalix vendace roe 100 g', 'With butter-fried brioche, sour cream & lemon', null),
  ('l-loyrom-100', 'zh-CN', '卡利克斯白鲑鱼籽 100 克', '配黄油煎布里欧修、酸奶油和柠檬', null),
  ('l-oscietra-10', 'nb', 'Fiskekompaniet x Rossini Oscietra Caviar 10 g', 'Med friterte vafler & røkt rømme', null),
  ('l-oscietra-10', 'en', 'Fiskekompaniet x Rossini Oscietra Caviar 10 g', 'With fried waffles & smoked sour cream', null),
  ('l-oscietra-10', 'zh-CN', 'Fiskekompaniet x Rossini 奥西特拉鱼子酱 10 克', '配炸华夫饼和烟熏酸奶油', null),
  ('l-oscietra-30', 'nb', 'Fiskekompaniet x Rossini Oscietra Caviar 30 g', 'Med friterte vafler & røkt rømme', null),
  ('l-oscietra-30', 'en', 'Fiskekompaniet x Rossini Oscietra Caviar 30 g', 'With fried waffles & smoked sour cream', null),
  ('l-oscietra-30', 'zh-CN', 'Fiskekompaniet x Rossini 奥西特拉鱼子酱 30 克', '配炸华夫饼和烟熏酸奶油', null),
  ('l-oscietra-50', 'nb', 'Fiskekompaniet x Rossini Oscietra Caviar 50 g', 'Med friterte vafler & røkt rømme', null),
  ('l-oscietra-50', 'en', 'Fiskekompaniet x Rossini Oscietra Caviar 50 g', 'With fried waffles & smoked sour cream', null),
  ('l-oscietra-50', 'zh-CN', 'Fiskekompaniet x Rossini 奥西特拉鱼子酱 50 克', '配炸华夫饼和烟熏酸奶油', null),
  ('l-osters-fine-de-claire', 'nb', 'David Hervé Fine de Claire (FR)', 'Østers, per stykk', null),
  ('l-osters-fine-de-claire', 'en', 'David Hervé Fine de Claire (FR)', 'Oyster, per piece', null),
  ('l-osters-fine-de-claire', 'zh-CN', 'David Hervé Fine de Claire 生蚝（法国）', '按只计价', null),
  ('l-osters-speciale', 'nb', 'David Hervé Spéciale (FR)', 'Østers, per stykk', null),
  ('l-osters-speciale', 'en', 'David Hervé Spéciale (FR)', 'Oyster, per piece', null),
  ('l-osters-speciale', 'zh-CN', 'David Hervé Spéciale 生蚝（法国）', '按只计价', null),
  ('l-osters-bb-peter', 'nb', 'David Hervé BB Peter (FR)', 'Østers, per stykk', null),
  ('l-osters-bb-peter', 'en', 'David Hervé BB Peter (FR)', 'Oyster, per piece', null),
  ('l-osters-bb-peter', 'zh-CN', 'David Hervé BB Peter 生蚝（法国）', '按只计价', null),
  ('l-lyngenreker', 'nb', 'Lyngenreker naturell', 'Med dillmajones, sitron & surdeigsbrød', null),
  ('l-lyngenreker', 'en', 'Lyngen prawns, natural', 'With dill mayonnaise, lemon & sourdough bread', null),
  ('l-lyngenreker', 'zh-CN', '林根鲜虾（原味）', '配莳萝蛋黄酱、柠檬和酸面包', null),
  ('l-blaskjell', 'nb', 'Dampede blåskjell', 'Med Nidelven Blå-saus', null),
  ('l-blaskjell', 'en', 'Steamed mussels', 'With Nidelven Blå blue cheese sauce', null),
  ('l-blaskjell', 'zh-CN', '清蒸青口', '配 Nidelven Blå 蓝纹奶酪酱', null),
  ('l-snokrabbe', 'nb', 'Snøkrabbe naturell 150 g', 'Med dillmajones, sitron & surdeigsbrød', null),
  ('l-snokrabbe', 'en', 'Snow crab, natural, 150 g', 'With dill mayonnaise, lemon & sourdough bread', null),
  ('l-snokrabbe', 'zh-CN', '雪蟹（原味）150 克', '配莳萝蛋黄酱、柠檬和酸面包', null),
  ('l-kongekrabbe', 'nb', 'Kongekrabbe naturell 100 g', 'Med dillmajones, sitron & surdeigsbrød', null),
  ('l-kongekrabbe', 'en', 'King crab, natural, 100 g', 'With dill mayonnaise, lemon & sourdough bread', null),
  ('l-kongekrabbe', 'zh-CN', '帝王蟹（原味）100 克', '配莳萝蛋黄酱、柠檬和酸面包', null),
  ('l-fiskesuppe-liten', 'nb', 'Kremet fiskesuppe, liten', null, null),
  ('l-fiskesuppe-liten', 'en', 'Creamy fish soup, small', null, null),
  ('l-fiskesuppe-liten', 'zh-CN', '奶油鱼汤（小份）', null, null),
  ('l-fiskesuppe-stor', 'nb', 'Kremet fiskesuppe, stor', null, null),
  ('l-fiskesuppe-stor', 'en', 'Creamy fish soup, large', null, null),
  ('l-fiskesuppe-stor', 'zh-CN', '奶油鱼汤（大份）', null, null),
  ('l-uer-meuniere', 'nb', 'Uer Meunière', 'Med sesongens grønnsaker, brunet smør, soya & hasselnøtter', null),
  ('l-uer-meuniere', 'en', 'Redfish meunière', 'With seasonal vegetables, browned butter, soy & hazelnuts', null),
  ('l-uer-meuniere', 'zh-CN', '黄油煎红鱼', '配时令蔬菜、焦黄油、酱油和榛子', null),
  ('l-dagens-fangst', 'nb', 'Dagens fangst', 'Med smørsaus, løyrom & fennikel', null),
  ('l-dagens-fangst', 'en', 'Catch of the day', 'With butter sauce, vendace roe & fennel', null),
  ('l-dagens-fangst', 'zh-CN', '今日渔获', '配黄油酱、白鲑鱼籽和茴香', null),
  ('l-brunostiskrem', 'nb', 'Brunostiskrem', 'Med blåbær, kamille & Chartreuse', null),
  ('l-brunostiskrem', 'en', 'Brown cheese ice cream', 'With blueberries, chamomile & Chartreuse', null),
  ('l-brunostiskrem', 'zh-CN', '挪威棕奶酪冰淇淋', '配蓝莓、洋甘菊和查特酒', null),
  ('l-nidelven-bla', 'nb', 'Nidelven Blå', 'Med fikensyltetøy & pekannøtter', null),
  ('l-nidelven-bla', 'en', 'Nidelven Blå blue cheese', 'With fig jam & pecans', null),
  ('l-nidelven-bla', 'zh-CN', 'Nidelven Blå 蓝纹奶酪', '配无花果酱和碧根果', null),
  ('l-surdeigsbrod', 'nb', 'Ekstra surdeigsbrød & smør', null, null),
  ('l-surdeigsbrod', 'en', 'Extra sourdough bread & butter', null, null),
  ('l-surdeigsbrod', 'zh-CN', '加点酸面包和黄油', null, null),

  -- ===== Middag =====
  ('m-3-retter', 'nb', '3-retters meny', 'Kremet fiskesuppe · Dagens fangst · Brunostiskrem',
    E'1. Kremet fiskesuppe — fennikel, hvit fisk, dill\n2. Dagens fangst — gulrot, vadouvan, kyllingsjy\n3. Brunostiskrem — blåbær, kamille, Chartreuse'),
  ('m-3-retter', 'en', '3-course menu', 'Creamy fish soup · Catch of the day · Brown cheese ice cream',
    E'1. Creamy fish soup — fennel, white fish, dill\n2. Catch of the day — carrot, vadouvan, chicken jus\n3. Brown cheese ice cream — blueberries, chamomile, Chartreuse'),
  ('m-3-retter', 'zh-CN', '三道菜套餐', '奶油鱼汤 · 今日渔获 · 棕奶酪冰淇淋',
    E'1. 奶油鱼汤——茴香、白鱼、莳萝\n2. 今日渔获——胡萝卜、vadouvan 香料、鸡肉汁\n3. 棕奶酪冰淇淋——蓝莓、洋甘菊、查特酒'),
  ('m-3-retter-vin', 'nb', '3-retters meny med vinpakke', 'Tre retter med tilhørende viner',
    E'1. Kremet fiskesuppe — fennikel, hvit fisk, dill\n2. Dagens fangst — gulrot, vadouvan, kyllingsjy\n3. Brunostiskrem — blåbær, kamille, Chartreuse'),
  ('m-3-retter-vin', 'en', '3-course menu with wine pairing', 'Three courses with matching wines',
    E'1. Creamy fish soup — fennel, white fish, dill\n2. Catch of the day — carrot, vadouvan, chicken jus\n3. Brown cheese ice cream — blueberries, chamomile, Chartreuse'),
  ('m-3-retter-vin', 'zh-CN', '三道菜套餐配餐酒', '三道菜搭配餐酒',
    E'1. 奶油鱼汤——茴香、白鱼、莳萝\n2. 今日渔获——胡萝卜、vadouvan 香料、鸡肉汁\n3. 棕奶酪冰淇淋——蓝莓、洋甘菊、查特酒'),
  ('m-5-retter', 'nb', '5-retters meny', 'Kveite · Kamskjell · Boknafisk · Dagens fangst · Brunostiskrem',
    E'1. Kveite fra Yttersia — tomat, hylleblomst, solsikkefrø\n2. Kamskjell fra Nordnesøy — vin jaune, chili\n3. Boknafisk fra Halvors — bacon, potet\n4. Dagens fangst — gulrot, vadouvan, kyllingsjy\n5. Brunostiskrem — blåbær, kamille, Chartreuse'),
  ('m-5-retter', 'en', '5-course menu', 'Halibut · Scallops · Semi-dried cod · Catch of the day · Brown cheese ice cream',
    E'1. Halibut from Yttersia — tomato, elderflower, sunflower seeds\n2. Scallops from Nordnesøy — vin jaune, chilli\n3. Semi-dried cod from Halvors — bacon, potato\n4. Catch of the day — carrot, vadouvan, chicken jus\n5. Brown cheese ice cream — blueberries, chamomile, Chartreuse'),
  ('m-5-retter', 'zh-CN', '五道菜套餐', '大比目鱼 · 扇贝 · 半干鳕鱼 · 今日渔获 · 棕奶酪冰淇淋',
    E'1. Yttersia 大比目鱼——番茄、接骨木花、葵花籽\n2. Nordnesøy 扇贝——黄葡萄酒、辣椒\n3. Halvors 半干鳕鱼——培根、土豆\n4. 今日渔获——胡萝卜、vadouvan 香料、鸡肉汁\n5. 棕奶酪冰淇淋——蓝莓、洋甘菊、查特酒'),
  ('m-5-retter-vin', 'nb', '5-retters meny med vinpakke', 'Fem retter med tilhørende viner',
    E'1. Kveite fra Yttersia — tomat, hylleblomst, solsikkefrø\n2. Kamskjell fra Nordnesøy — vin jaune, chili\n3. Boknafisk fra Halvors — bacon, potet\n4. Dagens fangst — gulrot, vadouvan, kyllingsjy\n5. Brunostiskrem — blåbær, kamille, Chartreuse'),
  ('m-5-retter-vin', 'en', '5-course menu with wine pairing', 'Five courses with matching wines',
    E'1. Halibut from Yttersia — tomato, elderflower, sunflower seeds\n2. Scallops from Nordnesøy — vin jaune, chilli\n3. Semi-dried cod from Halvors — bacon, potato\n4. Catch of the day — carrot, vadouvan, chicken jus\n5. Brown cheese ice cream — blueberries, chamomile, Chartreuse'),
  ('m-5-retter-vin', 'zh-CN', '五道菜套餐配餐酒', '五道菜搭配餐酒',
    E'1. Yttersia 大比目鱼——番茄、接骨木花、葵花籽\n2. Nordnesøy 扇贝——黄葡萄酒、辣椒\n3. Halvors 半干鳕鱼——培根、土豆\n4. 今日渔获——胡萝卜、vadouvan 香料、鸡肉汁\n5. 棕奶酪冰淇淋——蓝莓、洋甘菊、查特酒'),
  ('m-ostetillegg', 'nb', 'Ostetillegg', 'Nidelven Blå, fiken & pekannøtter', null),
  ('m-ostetillegg', 'en', 'Cheese supplement', 'Nidelven Blå, fig & pecans', null),
  ('m-ostetillegg', 'zh-CN', '加配奶酪', 'Nidelven Blå 蓝纹奶酪、无花果和碧根果', null),
  ('m-loyrom-30', 'nb', 'Løyrom fra Kalix 30 g', 'Med stekt brioche, sjalottløk & sitron', null),
  ('m-loyrom-30', 'en', 'Kalix vendace roe 30 g', 'With fried brioche, shallots & lemon', null),
  ('m-loyrom-30', 'zh-CN', '卡利克斯白鲑鱼籽 30 克', '配煎布里欧修、红葱头和柠檬', null),
  ('m-loyrom-100', 'nb', 'Løyrom fra Kalix 100 g', 'Med stekt brioche, sjalottløk & sitron', null),
  ('m-loyrom-100', 'en', 'Kalix vendace roe 100 g', 'With fried brioche, shallots & lemon', null),
  ('m-loyrom-100', 'zh-CN', '卡利克斯白鲑鱼籽 100 克', '配煎布里欧修、红葱头和柠檬', null),
  ('m-oscietra-10', 'nb', 'Fiskekompaniet x Rossini Oscietra Caviar 10 g', 'Med friterte vafler & røkt rømme', null),
  ('m-oscietra-10', 'en', 'Fiskekompaniet x Rossini Oscietra Caviar 10 g', 'With fried waffles & smoked sour cream', null),
  ('m-oscietra-10', 'zh-CN', 'Fiskekompaniet x Rossini 奥西特拉鱼子酱 10 克', '配炸华夫饼和烟熏酸奶油', null),
  ('m-oscietra-30', 'nb', 'Fiskekompaniet x Rossini Oscietra Caviar 30 g', 'Med friterte vafler & røkt rømme', null),
  ('m-oscietra-30', 'en', 'Fiskekompaniet x Rossini Oscietra Caviar 30 g', 'With fried waffles & smoked sour cream', null),
  ('m-oscietra-30', 'zh-CN', 'Fiskekompaniet x Rossini 奥西特拉鱼子酱 30 克', '配炸华夫饼和烟熏酸奶油', null),
  ('m-oscietra-50', 'nb', 'Fiskekompaniet x Rossini Oscietra Caviar 50 g', 'Med friterte vafler & røkt rømme', null),
  ('m-oscietra-50', 'en', 'Fiskekompaniet x Rossini Oscietra Caviar 50 g', 'With fried waffles & smoked sour cream', null),
  ('m-oscietra-50', 'zh-CN', 'Fiskekompaniet x Rossini 奥西特拉鱼子酱 50 克', '配炸华夫饼和烟熏酸奶油', null),
  ('m-skalldyrsplata', 'nb', 'Skalldyrsplatå', 'Sesongens skalldyr med dipper & hjemmelaget surdeig. Pris per person.',
    'Et utvalg av sesongens skalldyr, servert med dipper & hjemmelaget surdeig. Spør din servitør om dagens utvalg.'),
  ('m-skalldyrsplata', 'en', 'Shellfish platter', 'Seasonal shellfish with dips & house sourdough. Price per person.',
    'A selection of the season''s shellfish, served with dips & house-made sourdough. Ask your server about today''s selection.'),
  ('m-skalldyrsplata', 'zh-CN', '海鲜拼盘', '时令贝类海鲜配蘸酱和自制酸面包。每人价格。',
    '精选时令贝类海鲜，配蘸酱和自制酸面包。今日品种请咨询服务员。'),
  ('m-kongekrabbe-tillegg', 'nb', 'Tillegg: 100 g kongekrabbe', 'Til skalldyrsplatået', null),
  ('m-kongekrabbe-tillegg', 'en', 'Add 100 g king crab', 'For the shellfish platter', null),
  ('m-kongekrabbe-tillegg', 'zh-CN', '加 100 克帝王蟹', '加配于海鲜拼盘', null),
  ('m-lutefisk', 'nb', 'Lutefisk fra Halvors', 'Med tradisjonelt tilbehør', null),
  ('m-lutefisk', 'en', 'Lutefisk from Halvors', 'With traditional accompaniments', null),
  ('m-lutefisk', 'zh-CN', 'Halvors 碱渍鳕鱼', '配传统配菜', null),
  ('m-lutefisk-pafyll', 'nb', 'Lutefisk påfyll', 'Ekstra porsjon', null),
  ('m-lutefisk-pafyll', 'en', 'Lutefisk, second helping', 'Extra portion', null),
  ('m-lutefisk-pafyll', 'zh-CN', '碱渍鳕鱼续盘', '再来一份', null),
  ('m-nidelven-bla', 'nb', 'Nidelven Blå', 'Med pekannøtter & fikensyltetøy', null),
  ('m-nidelven-bla', 'en', 'Nidelven Blå blue cheese', 'With pecans & fig jam', null),
  ('m-nidelven-bla', 'zh-CN', 'Nidelven Blå 蓝纹奶酪', '配碧根果和无花果酱', null),
  ('m-brunostiskrem', 'nb', 'Brunostiskrem', 'Med blåbær, kamille & Chartreuse', null),
  ('m-brunostiskrem', 'en', 'Brown cheese ice cream', 'With blueberries, chamomile & Chartreuse', null),
  ('m-brunostiskrem', 'zh-CN', '挪威棕奶酪冰淇淋', '配蓝莓、洋甘菊和查特酒', null),

  -- ===== Sjømatbaren =====
  ('s-oscietra-10', 'nb', 'Fiskekompaniet x Rossini Oscietra Caviar 10 g', 'Med friterte vafler & røkt rømme', null),
  ('s-oscietra-10', 'en', 'Fiskekompaniet x Rossini Oscietra Caviar 10 g', 'With fried waffles & smoked sour cream', null),
  ('s-oscietra-10', 'zh-CN', 'Fiskekompaniet x Rossini 奥西特拉鱼子酱 10 克', '配炸华夫饼和烟熏酸奶油', null),
  ('s-oscietra-30', 'nb', 'Fiskekompaniet x Rossini Oscietra Caviar 30 g', 'Med friterte vafler & røkt rømme', null),
  ('s-oscietra-30', 'en', 'Fiskekompaniet x Rossini Oscietra Caviar 30 g', 'With fried waffles & smoked sour cream', null),
  ('s-oscietra-30', 'zh-CN', 'Fiskekompaniet x Rossini 奥西特拉鱼子酱 30 克', '配炸华夫饼和烟熏酸奶油', null),
  ('s-oscietra-50', 'nb', 'Fiskekompaniet x Rossini Oscietra Caviar 50 g', 'Med friterte vafler & røkt rømme', null),
  ('s-oscietra-50', 'en', 'Fiskekompaniet x Rossini Oscietra Caviar 50 g', 'With fried waffles & smoked sour cream', null),
  ('s-oscietra-50', 'zh-CN', 'Fiskekompaniet x Rossini 奥西特拉鱼子酱 50 克', '配炸华夫饼和烟熏酸奶油', null),
  ('s-kalix-30', 'nb', 'Fiskekompaniet x Innala & Dundrun Kalix Caviar 30 g', 'Med brioche & røkt rømme', null),
  ('s-kalix-30', 'en', 'Fiskekompaniet x Innala & Dundrun Kalix Caviar 30 g', 'With brioche & smoked sour cream', null),
  ('s-kalix-30', 'zh-CN', 'Fiskekompaniet x Innala & Dundrun 卡利克斯鱼子 30 克', '配布里欧修和烟熏酸奶油', null),
  ('s-kalix-100', 'nb', 'Fiskekompaniet x Innala & Dundrun Kalix Caviar 100 g', 'Med brioche & røkt rømme', null),
  ('s-kalix-100', 'en', 'Fiskekompaniet x Innala & Dundrun Kalix Caviar 100 g', 'With brioche & smoked sour cream', null),
  ('s-kalix-100', 'zh-CN', 'Fiskekompaniet x Innala & Dundrun 卡利克斯鱼子 100 克', '配布里欧修和烟熏酸奶油', null),
  ('s-rockefeller', 'nb', 'Rockefeller østers (3 stk)', null, null),
  ('s-rockefeller', 'en', 'Oysters Rockefeller (3 pcs)', null, null),
  ('s-rockefeller', 'zh-CN', '洛克菲勒焗生蚝（3 只）', null, null),
  ('s-blaskjell', 'nb', 'Dampede blåskjell med Nidelven Blå', null, null),
  ('s-blaskjell', 'en', 'Steamed mussels with Nidelven Blå', null, null),
  ('s-blaskjell', 'zh-CN', 'Nidelven Blå 蓝纹奶酪清蒸青口', null, null),
  ('s-snokrabbe', 'nb', 'Snøkrabbe naturell 150 g', null, null),
  ('s-snokrabbe', 'en', 'Snow crab, natural, 150 g', null, null),
  ('s-snokrabbe', 'zh-CN', '雪蟹（原味）150 克', null, null),
  ('s-kongekrabbe', 'nb', 'Kongekrabbe naturell 100 g', null, null),
  ('s-kongekrabbe', 'en', 'King crab, natural, 100 g', null, null),
  ('s-kongekrabbe', 'zh-CN', '帝王蟹（原味）100 克', null, null),
  ('s-lyngenreker', 'nb', 'Lyngenreker naturell', null, null),
  ('s-lyngenreker', 'en', 'Lyngen prawns, natural', null, null),
  ('s-lyngenreker', 'zh-CN', '林根鲜虾（原味）', null, null),
  ('s-bolinhos', 'nb', 'Bolinhos', 'Med dillmajo', null),
  ('s-bolinhos', 'en', 'Bolinhos', 'With dill mayo', null),
  ('s-bolinhos', 'zh-CN', '葡式鳕鱼球', '配莳萝蛋黄酱', null),
  ('s-fiskesuppe-liten', 'nb', 'Kremet fiskesuppe, liten', null, null),
  ('s-fiskesuppe-liten', 'en', 'Creamy fish soup, small', null, null),
  ('s-fiskesuppe-liten', 'zh-CN', '奶油鱼汤（小份）', null, null),
  ('s-fiskesuppe-stor', 'nb', 'Kremet fiskesuppe, stor', null, null),
  ('s-fiskesuppe-stor', 'en', 'Creamy fish soup, large', null, null),
  ('s-fiskesuppe-stor', 'zh-CN', '奶油鱼汤（大份）', null, null),
  ('s-gravet-kveite', 'nb', 'Gravet kveite', 'Med tomat, hylleblomst & solsikkefrø', null),
  ('s-gravet-kveite', 'en', 'Cured halibut', 'With tomato, elderflower & sunflower seeds', null),
  ('s-gravet-kveite', 'zh-CN', '腌渍大比目鱼', '配番茄、接骨木花和葵花籽', null),
  ('s-breiflabb', 'nb', 'Breiflabb', 'Med gulrot, vadouvan & kylling jus', null),
  ('s-breiflabb', 'en', 'Monkfish', 'With carrot, vadouvan & chicken jus', null),
  ('s-breiflabb', 'zh-CN', '安康鱼', '配胡萝卜、vadouvan 香料和鸡肉汁', null),
  ('s-dagens-fangst', 'nb', 'Dagens fangst', 'Med smørsaus & sesongens grønt', null),
  ('s-dagens-fangst', 'en', 'Catch of the day', 'With butter sauce & seasonal greens', null),
  ('s-dagens-fangst', 'zh-CN', '今日渔获', '配黄油酱和时令蔬菜', null),
  ('s-lutefisk', 'nb', 'Lutefisk fra Halvors', 'Med tradisjonelt tilbehør', null),
  ('s-lutefisk', 'en', 'Lutefisk from Halvors', 'With traditional accompaniments', null),
  ('s-lutefisk', 'zh-CN', 'Halvors 碱渍鳕鱼', '配传统配菜', null),
  ('s-lutefisk-pafyll', 'nb', 'Lutefisk påfyll', 'Ekstra porsjon', null),
  ('s-lutefisk-pafyll', 'en', 'Lutefisk, second helping', 'Extra portion', null),
  ('s-lutefisk-pafyll', 'zh-CN', '碱渍鳕鱼续盘', '再来一份', null),
  ('s-skalldyrsplata', 'nb', 'Skalldyrsplatå', 'Pris per person', null),
  ('s-skalldyrsplata', 'en', 'Shellfish platter', 'Price per person', null),
  ('s-skalldyrsplata', 'zh-CN', '海鲜拼盘', '每人价格', null),
  ('s-brunostiskrem', 'nb', 'Brunost iskrem', 'Med blåbær, kamille & Chartreuse', null),
  ('s-brunostiskrem', 'en', 'Brown cheese ice cream', 'With blueberries, chamomile & Chartreuse', null),
  ('s-brunostiskrem', 'zh-CN', '挪威棕奶酪冰淇淋', '配蓝莓、洋甘菊和查特酒', null),
  ('s-nidelven-bla', 'nb', 'Nidelven Blå', 'Med pekannøtter & fikensyltetøy', null),
  ('s-nidelven-bla', 'en', 'Nidelven Blå blue cheese', 'With pecans & fig jam', null),
  ('s-nidelven-bla', 'zh-CN', 'Nidelven Blå 蓝纹奶酪', '配碧根果和无花果酱', null)
) as v(item_slug, locale, name, description, description_long)
join public.restaurants r on r.slug = 'fiskekompaniet'
join public.items i on i.restaurant_id = r.id and i.slug = v.item_slug
on conflict (item_id, locale) do nothing;

-- Check: one row per menu with its item count (expected 19 / 16 / 21).
select m.slug as menu, m.is_active, count(i.id) as items
from public.menus m
join public.restaurants r on r.id = m.restaurant_id and r.slug = 'fiskekompaniet'
left join public.categories c on c.menu_id = m.id
left join public.items i on i.category_id = c.id
group by m.slug, m.is_active, m.sort_order
order by m.sort_order;
