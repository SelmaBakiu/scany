# Deploying

Vercel for the app, Supabase for the database. Both have a free tier that is
genuinely enough for one restaurant.

Roughly 30 minutes the first time. Do it in this order — a couple of the steps
fail quietly if you do them out of sequence, and those are called out.

---

## 1. Supabase (10 minutes)

If you already set this up locally, you can point production at the same
project and skip to step 2. One project per restaurant chain, not per
environment, unless you want a separate staging database.

1. **Create the project** at [supabase.com](https://supabase.com). Pick a
   region near your guests — Frankfurt or Stockholm for Norway. This is the one
   choice you cannot change later without migrating.
2. **SQL Editor → New query.** Paste the *contents* of `supabase/schema.sql`
   and run it. Then `supabase/seed.sql` in a second query.
3. **Database → Replication → `supabase_realtime`** — tick `orders`.

   > Without this, orders still arrive, but on the next poll (6 seconds for a
   > guest, 15 for the kitchen) instead of instantly. `schema.sql` tries to do
   > it for you and carries on quietly if it cannot.

4. **Authentication → Users → Add user → Create new user.** Your email, a
   password, and tick **Auto Confirm User**.
5. Open `supabase/merchant-setup.sql`, put that email in, run it. It must come
   **after** step 4 — it links an account that already exists, so run early it
   links nothing and says so.
6. **Settings → API Keys.** Keep the **Project URL** and the **publishable key**
   (`sb_publishable_…`) open; you need them in a minute.

> The free tier **pauses a project after 7 days with no activity**. For a
> restaurant that is about to open but has no guests yet, that is a nasty
> surprise — the menu just stops. Either log into the dashboard weekly or move
> to the paid tier before you print the QR codes.

---

## 2. GitHub

Vercel deploys from a repository.

```bash
cd menuscan
git init
git add .
git commit -m "MenuScan: menu, admin and ordering"
git branch -M main
git remote add origin https://github.com/<you>/menuscan.git
git push -u origin main
```

`.gitignore` already excludes `.env*` — **except** `.env.local.example`, which
is committed on purpose so the next person knows what to fill in. Check your
first commit does not contain `.env.local`:

```bash
git log --stat -1 | grep -i "\.env" || echo "no env files committed — good"
```

---

## 3. Vercel (10 minutes)

1. **vercel.com → Add New → Project → Import** your repository. It detects
   Next.js; leave every build setting alone.

2. **Before clicking Deploy, open Environment Variables** and add both:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_…` |

   Set them for Production, Preview and Development.

   > **This is the step to get right the first time.** `next.config.ts` builds
   > the `next/image` allow-list from `NEXT_PUBLIC_SUPABASE_URL` **at build
   > time**. Add the variables after the first deploy and the build that is
   > already live never saw them — dish photos break with *"hostname … is not
   > configured under images"*, and no amount of reloading fixes it. If that
   > happens: **Deployments → ⋯ → Redeploy**. Same trap as the dev server, same
   > cure.

3. **Deploy.** Two or three minutes.

4. Open `https://<your-app>.vercel.app/m/sofra`. You should see the menu.
   Then `/admin` and sign in with the account from step 1.4.

Do **not** add `MENUSCAN_EMAIL` or `MENUSCAN_PASSWORD` to Vercel. They are only
read by `npm run generate-images`, which you run on your own machine.

---

## 4. Your own domain

Vercel → **Settings → Domains** → add `meny.dittrestaurant.no` and follow the
DNS instructions. HTTPS is automatic.

Do this **before** printing QR codes. The codes encode whatever address the
admin was open at when you generated them, so codes made on
`…vercel.app` keep pointing there — fine while it resolves, embarrassing if you
ever drop the Vercel subdomain.

---

## 5. Print the codes

`/admin/qr`, once the real domain is live.

Check the **Nettadresse** field says your domain and not `localhost:3000`, type
your table numbers (`12`, or `1-8,bar,ute-1`), and either download the PNGs or
print the page. Scan one with your own phone before printing forty.

---

## Before guests use it

- [ ] **Replace the sample menu.** The dishes, prices, address, phone and email
      in `seed.sql` are placeholders. Edit them in `/admin`, not in the SQL.
- [ ] **Have the Italian and Chinese read by someone who speaks them.** They
      have not been checked by a native speaker.
- [ ] **Fix the currency rates.** `currencies.rate_per_eur` holds placeholder
      numbers, not live rates. Either wire the ECB daily feed to a scheduled
      job, or delete every currency except your own so nobody is quoted a wrong
      price.
- [ ] **Replace the AI photos** with pictures of your actual food before anyone
      orders from them. A guest who gets something that looks nothing like the
      picture is a complaint, and in some places a consumer-law problem.
- [ ] **Check the opening hours and timezone** on the Restaurant page. They are
      what close ordering at night.
- [ ] **Test on a real phone, on mobile data**, not just on the café wifi: scan
      a code, order, and watch the kitchen screen. This is also the only way to
      confirm Realtime is working end to end.
- [ ] **Make a second merchant account** before you need one at 19:00 on a
      Friday.

---

## Optional: self-host the fonts

`app/layout.tsx` loads two fonts with a `<link>` to Google Fonts, because the
sandbox this was built in had no access to `fonts.googleapis.com` at build
time. **Vercel does**, so you can now switch to `next/font/google`, which
downloads them at build time and serves them from your own domain: one less
third-party request from a guest's phone, and no flash of fallback text. The
exact swap is in `README.md` under "Self-hosting the fonts".

---

## When something is wrong

| What you see | What it is |
|---|---|
| "Connect Supabase to see the menu" | The two environment variables are missing, or the build ran before they were added. Redeploy. |
| `hostname … is not configured under images` | Same cause. Redeploy; do not edit `next.config.ts`. |
| "Kontoen er ikke koblet til en restaurant" | You are signed in, but `merchant-setup.sql` was not run with that exact email. Re-run it. |
| The kitchen board says "Oppdaterer" and never "Live" | Realtime is not enabled for `orders` (step 1.3). Orders still arrive, just on the poll. |
| Orders stop arriving overnight | The free Supabase project paused. Open the dashboard. |
| Ordering is refused with no obvious reason | Either the switch on the Restaurant page is off, or it is outside the opening hours — both are enforced in the database, in the restaurant's own timezone. |
