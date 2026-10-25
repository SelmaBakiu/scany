# MenuScan backend

This directory owns the Supabase/PostgreSQL backend:

- `supabase/schema.sql` defines tables, functions, storage, and Row Level Security.
- `supabase/seed.sql` is the generated sample dataset.
- `supabase/menu-data.mjs` is the editable source for that dataset.
- `supabase/merchant-setup.sql` links a Supabase Auth user to a restaurant.
- `supabase/platform-admin-setup.sql` grants an Auth user access to the
  platform Store Management area.
- `supabase/migrate-*.sql` contains incremental migrations.
- `tests/*.sql` exercises security and ordering behavior inside transactions that roll back.

Regenerate the seed from this directory with:

```bash
npm run seed
```

Apply `supabase/schema.sql` and `supabase/seed.sql` through the Supabase SQL Editor as described in the root `README.md` and `DEPLOY.md`.

For an existing database, apply `supabase/migrate-2026-10-store-management.sql`.
Store Management also needs a server-only `SUPABASE_SECRET_KEY` in the frontend
environment; never expose it through a `NEXT_PUBLIC_` variable.
