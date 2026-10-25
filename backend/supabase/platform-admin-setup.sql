-- ============================================================================
-- MenuScan — grant access to the platform Store Management area
--
-- 1. Create the platform administrator in Supabase Authentication -> Users.
-- 2. Replace the email below.
-- 3. Run this file once in the Supabase SQL Editor.
-- ============================================================================

insert into public.platform_admins (user_id)
select id
from auth.users
where email = 'admin@example.com' -- <- REPLACE with the platform admin email
on conflict (user_id) do nothing;

select u.email, p.created_at
from public.platform_admins p
join auth.users u on u.id = p.user_id;
