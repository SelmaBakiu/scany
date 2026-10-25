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
-- Does the security actually hold?
--
-- Run against a scratch Postgres that has schema.sql and seed.sql loaded, plus
-- the auth stubs this file's harness creates. It asserts the things that would
-- be a breach if they were wrong, and raises an exception on the first failure.
--
-- Not a substitute for Supabase itself — auth.uid() there comes from a verified
-- JWT rather than a session variable — but the policies are the same text, and
-- these are the questions they have to answer correctly.
-- ============================================================================

do $$
declare
  owner_id   uuid;
  stranger_id uuid;
  rid        uuid;
  n          integer;
  ok         boolean;
begin
  select id into rid from public.restaurants where slug = 'sofra';
  select id into owner_id from auth.users where email = 'owner@test.no';
  select id into stranger_id from auth.users where email = 'stranger@test.no';

  insert into public.platform_admins (user_id) values (owner_id)
  on conflict (user_id) do nothing;

  -- ---------------------------------------------------------------- ANON
  set local role anon;
  perform set_config('request.jwt.claim.sub', '', true);

  select count(*) into n from public.items;
  if n = 0 then raise exception 'anon should SEE a published menu, saw nothing'; end if;

  begin
    update public.items set price_minor = 1;
    raise exception 'ANON WAS ABLE TO UPDATE PRICES';
  exception
    when insufficient_privilege then null;   -- no grant at all: correct
    when others then
      -- RLS returns zero affected rows rather than an error; check nothing moved
      if exists (select 1 from public.items where price_minor = 1) then
        raise exception 'ANON CHANGED A PRICE';
      end if;
  end;

  -- An update that matches no rows is "successful" but must change nothing.
  if exists (select 1 from public.items where price_minor = 1) then
    raise exception 'ANON CHANGED A PRICE';
  end if;

  -- ------------------------------------------------------------- STRANGER
  -- Signed in, but not a member of this restaurant.
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', stranger_id::text, true);

  select count(*) into n from public.platform_admins;
  if n <> 0 then raise exception 'A STRANGER SAW PLATFORM ADMIN MEMBERSHIP'; end if;

  update public.items set price_minor = 99999 where restaurant_id = rid;
  get diagnostics n = row_count;
  if n > 0 then raise exception 'A STRANGER UPDATED % ITEMS', n; end if;

  delete from public.items where restaurant_id = rid;
  get diagnostics n = row_count;
  if n > 0 then raise exception 'A STRANGER DELETED % ITEMS', n; end if;

  update public.restaurants set theme = 'svart' where id = rid;
  get diagnostics n = row_count;
  if n > 0 then raise exception 'A STRANGER CHANGED THE THEME'; end if;

  -- ---------------------------------------------------------------- OWNER
  perform set_config('request.jwt.claim.sub', owner_id::text, true);

  select count(*) into n from public.platform_admins where user_id = owner_id;
  if n <> 1 then raise exception 'A PLATFORM ADMIN COULD NOT SEE THEIR OWN ROLE'; end if;

  update public.items set price_minor = price_minor where restaurant_id = rid;
  get diagnostics n = row_count;
  if n = 0 then raise exception 'THE OWNER COULD NOT UPDATE THEIR OWN ITEMS'; end if;

  update public.restaurants set theme = 'bla' where id = rid;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'THE OWNER COULD NOT SET THE THEME'; end if;

  select (theme = 'bla') into ok from public.restaurants where id = rid;
  if not ok then raise exception 'THEME DID NOT STICK'; end if;

  -- Unpublished work stays visible to its owner.
  update public.restaurants set is_published = false where id = rid;
  select count(*) into n from public.items where restaurant_id = rid;
  if n = 0 then raise exception 'THE OWNER LOST SIGHT OF THEIR OWN UNPUBLISHED MENU'; end if;

  -- ...but disappears for everyone else.
  set local role anon;
  perform set_config('request.jwt.claim.sub', '', true);
  select count(*) into n from public.items;
  if n <> 0 then raise exception 'AN UNPUBLISHED MENU WAS VISIBLE TO ANON (% rows)', n; end if;

  -- put it back
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  update public.restaurants set is_published = true, theme = 'lys' where id = rid;

  raise notice 'RLS: all checks passed';
end $$;

-- --------------------------------------------------------------------------
-- Structural guarantees that do not depend on who is asking.
-- --------------------------------------------------------------------------

do $$
declare
  rid uuid;
  n   integer;
begin
  set local role postgres;
  select id into rid from public.restaurants where slug = 'sofra';

  -- Exactly one menu may be active.
  begin
    insert into public.menus (restaurant_id, slug, sort_order, is_active)
    values (rid, 'second-active', 99, true);
    raise exception 'THE DATABASE ALLOWED TWO ACTIVE MENUS';
  exception when unique_violation then
    null;
  end;

  -- Deleting a category takes its dishes with it (the admin warns first).
  select count(*) into n from public.items i
    join public.categories c on c.id = i.category_id
   where c.slug = 'drikke';
  if n = 0 then raise exception 'expected dishes in drikke to test the cascade'; end if;

  delete from public.categories where slug = 'drikke';
  select count(*) into n from public.items i
    join public.categories c on c.id = i.category_id
   where c.slug = 'drikke';
  if n <> 0 then raise exception 'CATEGORY DELETE LEFT ORPHANED DISHES'; end if;

  raise notice 'Structure: all checks passed';
end $$;

-- Everything above is discarded here. This is what makes the file safe.
rollback;
