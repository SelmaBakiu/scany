-- ============================================================================
-- MenuScan — give a person access to the admin
--
-- Run this ONCE, after schema.sql and seed.sql, and after you have created the
-- merchant's account.
--
-- 1. Supabase dashboard -> Authentication -> Users -> "Add user".
--    Use "Create new user", enter an email and a password, and tick
--    "Auto Confirm User" — otherwise they cannot sign in until they click a
--    confirmation email that is not configured yet.
--
-- 2. Put that email in the line below and run this.
--
-- There is deliberately no self-signup page. Anyone who can create an account
-- can edit a menu, so accounts are made by you, on purpose, one at a time.
-- ============================================================================

insert into public.restaurant_members (restaurant_id, user_id, role)
select r.id, u.id, 'owner'
from public.restaurants r
cross join auth.users u
where r.slug = 'sofra'                      -- <- which restaurant
  and u.email = 'merchant@example.com'      -- <- REPLACE with the real email
on conflict (restaurant_id, user_id) do nothing;

-- Check it worked. One row = that person can now sign in at /admin.
select r.slug as restaurant, u.email, m.role
from public.restaurant_members m
join public.restaurants r on r.id = m.restaurant_id
join auth.users u on u.id = m.user_id;
