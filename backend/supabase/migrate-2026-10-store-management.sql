-- Adds authorization for the platform-level store management area.
-- Safe to re-run. Run this on an existing database; new databases get the
-- same objects from schema.sql.

alter table public.restaurant_members add column if not exists role text not null default 'owner';
alter table public.restaurant_members add column if not exists created_at timestamptz not null default now();

create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;

drop policy if exists platform_admins_read_own on public.platform_admins;
create policy platform_admins_read_own on public.platform_admins
  for select to authenticated using (user_id = auth.uid());

grant select on public.platform_admins to authenticated;
