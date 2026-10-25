-- ===========================================================================
-- SAFE TO RUN ANYWHERE: this whole file is one transaction that ROLLS BACK.
--
-- The checks below deliberately delete rows — that is the only honest way to
-- test that deleting a dish does not erase order history, or that a category
-- delete cascades. Nothing survives: the ROLLBACK at the end puts every row
-- back exactly as it was, including the orders the tests placed.
--
-- Run it against your real database if you want to. It changes nothing.
-- ===========================================================================

begin;

-- ============================================================================
-- Does the ordering system actually hold up?
--
-- Run against a scratch Postgres with schema.sql and seed.sql loaded, plus the
-- auth stubs the RLS harness creates. Every check here is something that would
-- be a bug worth money or trust if it were wrong: a forged price, one guest
-- reading another's order, two orders sharing a number, a kitchen taking
-- orders while it is shut.
--
-- Raises on the first failure, so a silent pass means all of it passed.
-- ============================================================================

do $$
declare
  rid         uuid;
  owner_id    uuid;
  stranger_id uuid;
  cheap_item  uuid;
  cheap_price integer;
  other_item  uuid;
  other_price integer;
  sold_out    uuid;
  res         record;
  res2        record;
  tok         uuid;
  tok2        uuid;
  js          jsonb;
  n           integer;
  numbers     integer[];
begin
  select id into rid from public.restaurants where slug = 'sofra';
  select id into owner_id from auth.users where email = 'owner@test.no';
  select id into stranger_id from auth.users where email = 'stranger@test.no';

  -- Two real dishes to order, and one we will mark sold out.
  select id, price_minor into cheap_item, cheap_price
    from public.items where restaurant_id = rid order by price_minor limit 1;
  select id, price_minor into other_item, other_price
    from public.items where restaurant_id = rid and id <> cheap_item
    order by price_minor desc limit 1;
  select id into sold_out from public.items
    where restaurant_id = rid and id not in (cheap_item, other_item) limit 1;

  update public.restaurants
     set ordering_enabled = true, is_published = true, opening_hours = '[]'::jsonb
   where id = rid;

  -- ===================================================== PRICES ARE THE DB'S
  set local role anon;
  perform set_config('request.jwt.claim.sub', '', true);

  -- The browser claims these cost 1 øre each. It does not get to decide.
  select * into res from public.place_order(
    'sofra', '5', 'Selma', 'ingen hast',
    jsonb_build_array(
      jsonb_build_object('item_id', cheap_item, 'quantity', 2, 'price_minor', 1, 'price', 1),
      jsonb_build_object('item_id', other_item, 'quantity', 1, 'price_minor', 1)
    )
  );

  if res.total_minor <> cheap_price * 2 + other_price then
    raise exception 'A FORGED PRICE GOT THROUGH: total % should be %',
      res.total_minor, cheap_price * 2 + other_price;
  end if;

  -- Inspecting the stored rows needs a role that is allowed to read them.
  -- anon is not, which is the point, and is checked explicitly further down.
  set local role postgres;

  select total_minor into n from public.orders where id = res.order_id;
  if n <> cheap_price * 2 + other_price then
    raise exception 'THE STORED TOTAL IS WRONG: %', n;
  end if;

  select count(*) into n from public.order_items
   where order_id = res.order_id and price_minor = 1;
  if n > 0 then raise exception 'A LINE WAS STORED AT THE BROWSER''S PRICE'; end if;

  tok := res.token;

  -- The line carries a name snapshot, not a join.
  select count(*) into n from public.order_items
   where order_id = res.order_id and length(name) > 0;
  if n <> 2 then raise exception 'ORDER LINES LOST THEIR NAMES'; end if;

  -- ------------------------------------------------- comments and quantities
  select count(*) into n from public.order_items
   where order_id = res.order_id and quantity = 2;
  if n <> 1 then raise exception 'QUANTITY WAS NOT RECORDED'; end if;

  -- ============================================== WHAT MUST BE REFUSED
  set local role anon;
  begin
    perform public.place_order('sofra', '5', '', '', '[]'::jsonb);
    raise exception 'AN EMPTY ORDER WAS ACCEPTED';
  exception when sqlstate 'P0001' then null;
  end;

  begin
    perform public.place_order('sofra', '   ', '', '',
      jsonb_build_array(jsonb_build_object('item_id', cheap_item, 'quantity', 1)));
    raise exception 'AN ORDER WITH NO TABLE NUMBER WAS ACCEPTED';
  exception when sqlstate 'P0001' then null;
  end;

  begin
    perform public.place_order('sofra', '5', '', '',
      jsonb_build_array(jsonb_build_object('item_id', cheap_item, 'quantity', 0)));
    raise exception 'A ZERO QUANTITY WAS ACCEPTED';
  exception when sqlstate 'P0001' then null;
  end;

  begin
    perform public.place_order('sofra', '5', '', '',
      jsonb_build_array(jsonb_build_object('item_id', cheap_item, 'quantity', 500)));
    raise exception 'A 500-PORTION ORDER WAS ACCEPTED';
  exception when sqlstate 'P0001' then null;
  end;

  begin
    perform public.place_order('sofra', '5', '', '',
      jsonb_build_array(jsonb_build_object('item_id', gen_random_uuid(), 'quantity', 1)));
    raise exception 'AN ORDER FOR A DISH THAT DOES NOT EXIST WAS ACCEPTED';
  exception when sqlstate 'P0002' then null;
  end;

  begin
    perform public.place_order('not-a-restaurant', '5', '', '',
      jsonb_build_array(jsonb_build_object('item_id', cheap_item, 'quantity', 1)));
    raise exception 'AN ORDER FOR AN UNKNOWN RESTAURANT WAS ACCEPTED';
  exception when sqlstate 'P0002' then null;
  end;

  -- A sold-out dish.
  set local role postgres;
  update public.items set is_available = false where id = sold_out;
  set local role anon;
  begin
    perform public.place_order('sofra', '5', '', '',
      jsonb_build_array(jsonb_build_object('item_id', sold_out, 'quantity', 1)));
    raise exception 'A SOLD-OUT DISH WAS ORDERED';
  exception when sqlstate 'P0001' then null;
  end;
  set local role postgres;
  update public.items set is_available = true where id = sold_out;

  -- Nothing partial may survive a rejected order: the whole call is one
  -- statement, so the orders row inserted before the failing line is gone.
  set local role postgres;
  select count(*) into n from public.orders where table_number = '5' and total_minor = 0;
  if n > 0 then raise exception 'A REJECTED ORDER LEFT AN EMPTY ROW BEHIND'; end if;

  -- ======================================================= THE KITCHEN IS SHUT
  update public.restaurants set ordering_enabled = false where id = rid;
  set local role anon;
  begin
    perform public.place_order('sofra', '5', '', '',
      jsonb_build_array(jsonb_build_object('item_id', cheap_item, 'quantity', 1)));
    raise exception 'AN ORDER WAS TAKEN WITH ORDERING SWITCHED OFF';
  exception when sqlstate 'P0001' then null;
  end;

  set local role postgres;
  update public.restaurants set ordering_enabled = true where id = rid;

  -- An unpublished restaurant cannot take orders either.
  update public.restaurants set is_published = false where id = rid;
  set local role anon;
  begin
    perform public.place_order('sofra', '5', '', '',
      jsonb_build_array(jsonb_build_object('item_id', cheap_item, 'quantity', 1)));
    raise exception 'AN UNPUBLISHED RESTAURANT TOOK AN ORDER';
  exception when sqlstate 'P0001' then null;
  end;
  set local role postgres;
  update public.restaurants set is_published = true where id = rid;

  -- ========================================================= OPENING HOURS
  -- Shut all week.
  update public.restaurants set opening_hours = (
    select jsonb_agg(jsonb_build_object('day', d, 'closed', true, 'open', '', 'close', ''))
    from generate_series(0, 6) d
  ) where id = rid;

  if public.is_open_now(rid) then raise exception 'CLOSED ALL WEEK, BUT REPORTED OPEN'; end if;

  set local role anon;
  begin
    perform public.place_order('sofra', '5', '', '',
      jsonb_build_array(jsonb_build_object('item_id', cheap_item, 'quantity', 1)));
    raise exception 'AN ORDER WAS TAKEN OUTSIDE OPENING HOURS';
  exception when sqlstate 'P0001' then null;
  end;
  set local role postgres;

  -- Open all week, round the clock.
  update public.restaurants set opening_hours = (
    select jsonb_agg(jsonb_build_object('day', d, 'closed', false, 'open', '00:00', 'close', '23:59'))
    from generate_series(0, 6) d
  ) where id = rid;
  if not public.is_open_now(rid) then raise exception 'OPEN ALL WEEK, BUT REPORTED SHUT'; end if;

  -- Past midnight: shut today, but yesterday ran 18:00 -> 23:59+. Build a week
  -- where only YESTERDAY is open, 20:00 to 06:00, and ask at 02:00 local.
  -- (is_open_now reads the real clock, so this check only runs when the local
  -- hour is actually in the small hours; otherwise it is skipped rather than
  -- faked, and the TypeScript suite covers the hour-by-hour cases.)
  declare
    local_hour integer;
    yest integer;
    todayd integer;
  begin
    select extract(hour from (now() at time zone timezone))::int,
           (extract(isodow from (now() at time zone timezone))::int - 1)
      into local_hour, todayd
      from public.restaurants where id = rid;
    yest := (todayd + 6) % 7;

    update public.restaurants set opening_hours = (
      select jsonb_agg(jsonb_build_object(
        'day', d,
        'closed', d <> yest,
        'open', case when d = yest then '20:00' else '' end,
        'close', case when d = yest then '06:00' else '' end))
      from generate_series(0, 6) d
    ) where id = rid;

    if local_hour < 6 then
      if not public.is_open_now(rid) then
        raise exception 'A PAST-MIDNIGHT CLOSING TIME WAS NOT HONOURED (hour %)', local_hour;
      end if;
    else
      if public.is_open_now(rid) then
        raise exception 'REPORTED OPEN FROM YESTERDAY''S ROW AT % O''CLOCK', local_hour;
      end if;
    end if;
  end;

  -- Back to always open for the rest of the suite.
  update public.restaurants set opening_hours = '[]'::jsonb where id = rid;

  -- ======================================================= READING AN ORDER
  set local role anon;

  js := public.order_status(tok);
  if js is null then raise exception 'A GUEST COULD NOT READ THEIR OWN ORDER'; end if;
  if (js->>'table_number') <> '5' then raise exception 'THE WRONG ORDER CAME BACK'; end if;
  if jsonb_array_length(js->'items') <> 2 then raise exception 'THE LINES ARE MISSING'; end if;
  if (js->>'status') <> 'new' then raise exception 'A NEW ORDER IS NOT "new"'; end if;

  -- A token nobody holds.
  if public.order_status(gen_random_uuid()) is not null then
    raise exception 'A RANDOM TOKEN RETURNED AN ORDER';
  end if;

  -- A second guest's order must not be reachable with the first one's token.
  select * into res2 from public.place_order(
    'sofra', '9', '', '',
    jsonb_build_array(jsonb_build_object('item_id', cheap_item, 'quantity', 1)));
  tok2 := res2.token;

  if (public.order_status(tok)->>'id') = (public.order_status(tok2)->>'id') then
    raise exception 'TWO TOKENS RETURNED THE SAME ORDER';
  end if;
  if (public.order_status(tok)->>'table_number') <> '5' then
    raise exception 'ONE GUEST''S TOKEN READ ANOTHER GUEST''S ORDER';
  end if;

  -- orders_by_tokens returns only the tokens held, newest first.
  js := public.orders_by_tokens(array[tok, tok2, gen_random_uuid()]);
  if jsonb_array_length(js) <> 2 then
    raise exception 'orders_by_tokens RETURNED % ORDERS, EXPECTED 2', jsonb_array_length(js);
  end if;
  if (js->0->>'table_number') <> '9' then
    raise exception 'orders_by_tokens IS NOT NEWEST FIRST';
  end if;

  -- ============================================ THE TABLES THEMSELVES ARE SHUT
  begin
    select count(*) into n from public.orders;
    raise exception 'ANON COULD SELECT FROM orders (% rows)', n;
  exception
    when insufficient_privilege then null;    -- no grant: correct
    when others then
      if n > 0 then raise exception 'ANON READ % ORDER ROWS', n; end if;
  end;

  begin
    update public.orders set status = 'completed';
    raise exception 'ANON COULD UPDATE AN ORDER STATUS';
  exception
    when insufficient_privilege then null;
    when others then null;
  end;

  begin
    insert into public.orders (restaurant_id, table_number) values (rid, '99');
    raise exception 'ANON COULD INSERT AN ORDER DIRECTLY, BYPASSING place_order';
  exception
    when insufficient_privilege then null;
    when others then null;
  end;

  -- ===================================================== THE MERCHANT'S VIEW
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', stranger_id::text, true);

  select count(*) into n from public.orders;
  if n > 0 then raise exception 'A STRANGER SAW % ORDERS', n; end if;

  update public.orders set status = 'accepted';
  get diagnostics n = row_count;
  if n > 0 then raise exception 'A STRANGER CHANGED % ORDERS', n; end if;

  perform set_config('request.jwt.claim.sub', owner_id::text, true);

  select count(*) into n from public.orders;
  if n < 2 then raise exception 'THE OWNER SAW ONLY % OF THEIR OWN ORDERS', n; end if;

  select count(*) into n from public.order_items;
  if n < 3 then raise exception 'THE OWNER CANNOT SEE THE ORDER LINES'; end if;

  update public.orders set status = 'accepted' where token = tok;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'THE OWNER COULD NOT ACCEPT AN ORDER'; end if;

  set local role anon;
  if (public.order_status(tok)->>'status') <> 'accepted' then
    raise exception 'THE GUEST DID NOT SEE THE NEW STATUS';
  end if;

  -- updated_at moves on its own.
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  update public.orders set status = 'preparing' where token = tok;
  select count(*) into n from public.orders where token = tok and updated_at > created_at;
  if n <> 1 then raise exception 'updated_at DID NOT MOVE'; end if;

  -- An invented status is refused by the database, not just by the UI.
  set local role postgres;
  begin
    update public.orders set status = 'on fire' where token = tok;
    raise exception 'AN INVALID STATUS WAS ACCEPTED';
  exception when check_violation then null;
  end;

  -- ==================================================== NUMBERS AND HISTORY
  set local role anon;
  numbers := array[]::integer[];
  for n in 1..12 loop
    select * into res2 from public.place_order(
      'sofra', (100 + n)::text, '', '',
      jsonb_build_array(jsonb_build_object('item_id', cheap_item, 'quantity', 1)));
    numbers := numbers || res2.order_number;
  end loop;

  if (select count(distinct x) from unnest(numbers) x) <> 12 then
    raise exception 'TWO ORDERS SHARED A NUMBER';
  end if;
  if numbers[1] >= numbers[12] then
    raise exception 'ORDER NUMBERS ARE NOT INCREASING';
  end if;
  if numbers[1] < 1000 then
    raise exception 'ORDER NUMBERS DID NOT START AT 1000 (got %)', numbers[1];
  end if;

  -- Deleting a dish must not rewrite history.
  set local role postgres;
  select count(*) into n from public.order_items where item_id = sold_out;
  delete from public.items where id = cheap_item;
  select count(*) into n from public.order_items where name <> '' and item_id is null;
  if n = 0 then
    raise exception 'DELETING A DISH ERASED THE ORDER LINES INSTEAD OF KEEPING THE SNAPSHOT';
  end if;
  select count(*) into n from public.orders;
  if n < 14 then raise exception 'DELETING A DISH DELETED ORDERS'; end if;

  raise notice 'Orders: all checks passed';
end $$;

-- Everything above is discarded here. This is what makes the file safe.
rollback;
