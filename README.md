# MenuScan

Two halves of one app, sharing one database.

**The diner's menu** (`/m/sofra?table=5`) — the page reached by scanning the QR
code on the table: read the menu, search it, filter it, open a dish, switch
language and currency, see the restaurant's details — and **order**. Build a
basket, send it, and watch the kitchen's progress live. No account, no app.

**The merchant's admin** (`/admin`) — sign in, take orders as they arrive, and
edit the dishes, categories, menus, theme and restaurant details the diner
sees. Every save shows up on the menu immediately.

**Platform Store Management** (`/management/stores`) — create, edit and delete
stores, set each owner's email and password, and control the dedicated
`/m/<store-slug>` menu page.

Ships with **Norwegian (bokmål) as the default language and NOK as the base
currency**, plus English, Italian and Simplified Chinese. Both are per-restaurant settings
(`restaurants.default_locale` and `restaurants.base_currency`), not hardcoded.
The admin itself is Norwegian only.

Sample menu: **7 categories, 56 dishes, 4 languages (nb / en / it / zh-CN)**, each dish with a short
description for the card, a full one for its own page, and an ingredient list.
**7 themes** — the merchant picks one, and every diner sees it.

Built with Next.js (App Router) + TypeScript + Tailwind CSS v4 + Supabase.

The repository is split by responsibility:

- `frontend/` is the runnable Next.js application.
- `backend/` owns the Supabase schema, migrations, seed data, and SQL tests.

---

> **Deploying?** `DEPLOY.md` has the ordered steps for Vercel + Supabase,
> including the two that fail quietly if you do them out of order.

## Quick start

```bash
npm --prefix frontend install
cp frontend/.env.local.example frontend/.env.local  # then fill in the three values
npm run dev                                        # http://localhost:3000/m/sofra
```

Until Supabase is configured, `/m/sofra` shows a setup screen instead of a menu
— that is deliberate, not a crash.

### 1. Create the database

1. Create a project at [supabase.com](https://supabase.com). The free tier is
   plenty for this.
2. **Settings → API Keys** in the dashboard sidebar. Copy the **Project URL**,
   the **publishable key** (`sb_publishable_…`), and the server-only
   **secret key** (`sb_secret_…`) into `.env.local`. The
   **Connect** button in the top bar is a shortcut: pick Next.js and it hands
   you both values already formatted as env vars.
   - If that panel names the variable something other than
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`, paste the *value* into the variable name
     this project uses, or rename it in both places.
   - Older projects show a legacy **anon public** key instead. It still works
     here, but Supabase is deprecating `anon` and `service_role` at the end of
     2026, so prefer a publishable key for anything new.
3. **SQL Editor → New query**. Paste the *contents* of `backend/supabase/schema.sql`
   (not its filename) and run it.
4. New query again, paste `backend/supabase/seed.sql`, run it. That creates the sample
   restaurant with the slug `sofra`.
5. **Database → Replication → `supabase_realtime`**, tick `orders`. This is
   what makes orders appear instantly rather than on the next poll; `schema.sql`
   tries to do it for you and carries on quietly if it cannot.
6. `npm run dev` and open `http://localhost:3000/m/sofra`.

Both SQL files are safe to re-run — every statement is guarded, so you can
iterate without dropping the database.

> **Upgrading a database created before the admin existed?** Run `schema.sql`
> again. It adds the merchant columns and the `restaurant_members` table with
> `alter table … add column if not exists`, because `create table if not exists`
> does nothing to a table that already exists.

> Keep `SUPABASE_SECRET_KEY` server-only. It bypasses Row Level Security, so do
> not prefix it with `NEXT_PUBLIC_`, import it into client components, or commit
> `.env.local`. The management code reads it only in `frontend/lib/supabase/admin.ts`.

### 2. Create the merchant's login

The admin uses **real Supabase Auth**, not a hardcoded password. It has to:
the diner's page and the admin talk to the same database with the same public
key, so "who is allowed to write" is a question only the database can answer.
A fake login would mean granting write access to the anon key — and that key is
in the page source of every menu, so the database would be editable by anyone
who opened it.

1. **Authentication → Users → Add user → Create new user.** Enter an email and
   a password, and tick **Auto Confirm User** — otherwise sign-in waits on a
   confirmation email that is not configured yet.
2. Open `backend/supabase/merchant-setup.sql`, replace the example email with the one
   you just used, and run it in the SQL editor. It links that account to the
   restaurant and prints a row back to confirm.
3. Go to `http://localhost:3000/admin` and sign in.

There is deliberately **no self-signup page**. Anyone with an account can edit a
menu, so accounts are created by you, one at a time.

If you sign in and see "Kontoen er ikke koblet til en restaurant", step 2 did
not match — check the email in the SQL against the one in the user list.

### 3. Create the platform administrator

Store owners manage only their own menu at `/admin`. The account that manages
all stores needs one extra role:

1. Create that account under **Authentication → Users** if it does not exist.
2. Open `backend/supabase/platform-admin-setup.sql`, replace
   `admin@example.com`, and run it in the SQL editor.
3. Sign in at `/admin/login?next=/management/stores`.

From `/management/stores`, creating a store also creates and confirms its owner
account, links it to the new restaurant, creates an active empty menu, and gives
the store its dedicated `/m/<slug>` page. Editing can change the owner's email
or password. Deleting a store removes its menus, dishes, orders, uploaded menu
images and—when it belongs to no other store—the owner login.

---

## The admin

Seven sections, all at `/admin`:

| Section | What it does |
|---|---|
| **Bestillinger** | The kitchen's screen. Orders arrive live, grouped into Nye / Pågår / Klare / Fullført / Avslått, each card showing the table, how long it has been waiting, every line with its comments, the guest's message and the total. Godta, Avslå (with a reason), Start tilberedning, Klar, Fullfør. Search and date filters for the history. |
| **Retter** | Every dish: image, name, category, price, availability. Add, edit, duplicate, delete. Search by name or description, filter by category and by sold-out. Editing a dish opens its full form — Norwegian and English name, short and long description, ingredients, price, tags, photo (uploaded, or **Generer AI-bilde**). |
| **Kategorier** | Add, rename, reorder (↑ ↓), and **hide without deleting**. A hidden category keeps its dishes but disappears from the menu — which is what you want for "Grillmeny" in January. |
| **Menyer** | Several menus (Lunsj, Middag, Drikkemeny). Exactly one is active, and the active one is what diners see. A menu owns categories; categories own dishes. |
| **Tema** | One of seven themes, applied to every visitor, with a live preview of the diner's menu above the save button. |
| **Restaurant** | Name, logo, description (nb + en), address, Google Maps link, phone, email, opening hours per day, social links, and the **ordering on/off** switch. All of it feeds the **Restaurantinfo** sheet on the diner's menu. |
| **QR-koder** | One printable code per table, generated in the browser. Downloads as PNG, prints as a sheet. |

Platform administrators also see a **Management** link in the admin header.
The platform screen is separate from a store's own admin so ordinary store
owners cannot enumerate or change other stores.

Everything confirms: a save shows **"Lagret"**, and every delete asks first and
names what it is about to remove. Deleting a category takes its dishes with it,
and says so.

### The admin is black and white, always

The merchant's theme is for guests. The admin stays white, black and grey
whatever is chosen, because a tool you work in all day should not change colour
every time you redecorate the menu — and because black-on-white is the most
legible thing there is.

Mechanically: the theme is applied by `frontend/app/m/[slug]/layout.tsx`, on **its own
wrapper div**, and nowhere else. Not on `<html>`, not on the root layout. The
admin renders outside that subtree with `data-chrome="admin"`, which redefines
the same colour tokens in monochrome. Since a custom property set on an element
beats one inherited from an ancestor, a theme cannot reach the admin even if a
future change were to put `data-theme` higher up the tree.

The one exception is the preview box on the **Tema** page. It is a real
`data-theme` wrapper around real menu markup, nested *inside* the admin scope,
so the colours come back for exactly that rectangle. The preview is the thing
itself, not a picture of it.

If you ever need to check this held, `frontend/scripts/check-contrast.mjs` includes the
admin palette alongside the seven themes.

### The admin speaks Norwegian and English

A language pill sits in the admin header, in the same sheet the diner's menu
uses, and it relabels everything: nav, page titles, buttons, form labels,
hints, confirmations and error messages. Norwegian is the default.

Three things are deliberately separate from the diner's language:

- **Different storage key.** `menuscan:admin:locale` vs the diner's
  `menuscan:prefs:<slug>`. A merchant working in English is not telling guests
  anything, and a guest switching to Italian does not relabel the merchant's
  buttons.
- **Different table.** `frontend/lib/admin-i18n.ts`, not `frontend/lib/i18n.ts`. Same shape, so
  adding a language means adding one block and TypeScript names every string
  you forgot.
- **Server actions return keys, not sentences.** An action runs on the server,
  which cannot see a browser preference, so it hands back an `ActionKey` and
  the form translates it. That is why `ActionResult` carries `key` rather than
  `message`. A raw Postgres error is appended untranslated — it exists in one
  language and is more useful verbatim.

The merchant's own content — dish names, descriptions, category names — is
never translated by the switcher. Only the chrome around it moves.

### Dish text is trilingual, not quadrilingual

The forms edit **Norwegian, English and Chinese** — `EDITABLE_LOCALES` in
`frontend/lib/admin-types.ts`. Italian exists in the database and is shown to guests,
but nothing in the admin writes it, so listing it there would mean every save
blanking the Italian that came from `seed.sql`.

English is not optional in practice, even for a Norwegian-only restaurant: it
is the fallback for every other language, **and it is what the AI photo
generator prompts with**. A dish with no English gets a worse picture, and the
form says so.

### Why the image prompt is English, always

The image model is trained overwhelmingly on English captions. Given
"Hvitløksbrød" it does not know what that is, so it invents something that
merely looks like food — which is how a menu ends up illustrated with the wrong
dishes entirely.

`promptForItem()` in `frontend/lib/ai-image.mjs` is the one place that decision is made,
shared by the batch script and the button in the admin so they cannot drift:

1. **`items.image_prompt`**, if the merchant wrote one — "AI image description
   (English)" on the dish form. They looked at a wrong picture and said what
   they actually wanted; nothing overrides that.
2. **The English name and description.** The normal case.
3. **Norwegian**, only when there is no English at all. Better than nothing,
   and the form warns you.

The prompt itself is fixed:

```
Professional food photography of {dish}: {description}. Served on a plate in a
restaurant, natural light, close-up, realistic, appetizing, no text, no people,
no hands.
```

The **seed is derived from the dish slug**, so regenerating an unchanged dish
gives the same picture. That is deliberate: the way to change a photo is to
change the prompt, not to keep rolling dice. `--reroll` is there for when you
do want a different roll.

Every prompt is printed to the console as it runs, so when a picture is wrong
you can see exactly what was asked for:

```
[3/56] Bruschetta  [english]
  prompt: Professional food photography of Bruschetta: Tomato, basil and olive oil on toasted bread. Served on a plate…
  ok (138 KB)
```

---

## Security, in three sentences

The anon key is in your page source and always will be — anyone can read it out
and query the database directly. That is fine, because a row with no policy
granting access is invisible, and the write policies in `schema.sql` check
membership in `restaurant_members` against `auth.uid()`. `frontend/proxy.ts` redirecting
signed-out visitors away from `/admin` is **convenience, not security**: the
real wall is in the database, so a forged cookie or a direct API call still gets
nothing.

`backend/tests/rls-test.sql` asserts exactly this against a real Postgres: anon reads
but cannot write, a signed-in stranger changes zero rows, the owner can write,
an unpublished menu is visible to its owner and invisible to everyone else.

---

## Coming from MongoDB: the four things that are genuinely different

**1. Nothing is nested. Everything points up.**
In Mongo you'd have one restaurant document with categories and items inside it.
Here `items → categories → menus → restaurants`, each its own table holding its
parent's id. You still read it all in one request — see `MENU_QUERY` in
`frontend/lib/menu.ts`, where the nesting in the query string mirrors the foreign keys —
but the admin can update one item's price without rewriting a document, and a
foreign key makes an orphaned item impossible rather than merely unlikely.

**2. Row Level Security replaces "the server is the only thing with the
credentials".** See above. Flip `restaurants.is_published` to `false` and the
whole menu vanishes from the outside world while staying visible to its owner —
verified, not assumed.

**3. Columns have types, and the types do work for you.**
`items` carries `restaurant_id` as well as `category_id`, which looks like
duplicated data you'd have to keep in sync. It isn't: a composite foreign key
makes Postgres *reject* an item whose `restaurant_id` disagrees with its
category's. Attaching one restaurant's dish to another's category fails at the
database, not in a code review.

**4. `numeric` columns arrive as strings.**
`rate_per_eur` comes back as `"1.10000000"`, and `"1.1" * 8.5` is not what you
want. `frontend/lib/menu.ts` wraps every numeric in `Number()` on the way in. This bites
everyone once.

---

## How it's put together

```
frontend/
  proxy.ts                        session refresh + protected-route redirects
  next.config.ts                  Tailwind loader + next/image allow-list
  app/                            routes, layouts, server actions, global CSS
  components/                     diner and merchant UI
  lib/                            domain logic and Supabase clients
  scripts/
    check-contrast.mjs            WCAG checks
    generate-images.mjs           batch AI menu photos
  package.json                    development and build commands
backend/
  supabase/
    schema.sql                    tables, functions, RLS, storage bucket
    merchant-setup.sql            link an Auth user to a restaurant
    platform-admin-setup.sql      grant platform Store Management access
    menu-data.mjs                 editable source for the seed menu
    generate-seed.mjs             menu-data.mjs -> seed.sql
    seed.sql                      generated sample data
    migrate-*.sql                 incremental database migrations
  tests/
    rls-test.sql                  security policy checks
    orders-test.sql               ordering checks
                                 (both roll back their transactions)
  package.json                    seed-generation command
```

### Editing the menu

Day to day, use the admin. `backend/supabase/menu-data.mjs` + `npm run seed`
from `backend/` is for the **initial** menu — it regenerates
`backend/supabase/seed.sql`, which you paste into the
SQL editor. The generator refuses to write anything if a dish is missing a
translation or uses an unknown tag, so a half-translated dish fails on your
machine instead of showing up blank in front of a diner.

Re-running `seed.sql` **overwrites** the seeded dishes, so don't do it after the
merchant has started editing.

> The Italian and Chinese in `menu-data.mjs` have not been checked by a native
> speaker. Have someone read them before a real diner does.

### Dish photos

Two ways in, both ending in the same place — a file in the `menu-images`
bucket and its path in `items.image_path`:

1. **Upload one** in the dish form. Always available, always wins.
2. **Generer AI-bilde** — one dish, generated from its Norwegian name and
   short description, saved immediately.

For a whole menu at once:

```bash
cd frontend
npm run generate-images -- --check     # is it set up? generates nothing
npm run generate-images                # only dishes with no photo yet
npm run generate-images -- --force     # redo everything
npm run generate-images -- --force --reroll   # redo, with DIFFERENT pictures
npm run generate-images -- --limit 5   # try a handful first
npm run generate-images -- --dry-run   # list what it would do
```

Start with `--check`. It signs in, finds the restaurant and counts the dishes,
then stops — so a wrong password or a missing variable costs you two seconds
instead of two minutes of waiting for a picture that was never going to arrive.

It needs two more lines in `frontend/.env.local` — the same email and password you sign
in to `/admin` with:

```
MENUSCAN_EMAIL=you@example.com
MENUSCAN_PASSWORD=...
```

**Why a password and not the service_role key.** The script signs in as you and
writes through exactly the same RLS policies the admin does. The usual advice
for a seed script is the `service_role` key, which bypasses RLS entirely — and
a leaked one hands over the whole database. A password that can only edit one
restaurant's menu is a far smaller thing to lose. Neither variable is
`NEXT_PUBLIC_*`, so neither reaches a browser.

**Why a script and not on-demand.** Generation takes 10–40 seconds. Doing it
when a diner opens the menu would mean waiting half a minute for a picture that
never changes. So: generated once, stored, served like any other file.

The prompt, the retry logic and the storage path all live in one place,
`frontend/lib/ai-image.mjs` — plain JavaScript because it is imported by both the server
action (TypeScript, bundled by Next) and the script (bare `node`, no build
step). Four details worth knowing:

- **The prompt is built from the ENGLISH name and description**, not the
  Norwegian. The model is trained on English captions; given Norwegian it
  guesses, and the guess is how you get a picture of the wrong dish entirely.
  Norwegian is only the fallback. Fill the English fields in before generating.
- It asks for the **flux** model rather than the default, which is faster and
  markedly worse at food — it drifts into illustration. Override with
  `POLLINATIONS_MODEL` if you want to try another.
- The **seed is derived from the dish slug**, so a re-run is repeatable. When
  you want a *different* picture, that is exactly wrong, so `--reroll` uses
  random seeds and the admin's button uses a new one on every click.
- The **storage path carries a timestamp**. Supabase serves public objects
  through a CDN, and re-uploading to the same path can keep serving the old
  picture for a while.
- A **200 response that is not an image is rejected**. A busy free service
  sometimes answers with an HTML error page, and writing that into the bucket
  as "the dish photo" would be worse than failing.
- Retries back off exponentially, and there is a **4-second gap between
  dishes**. Hammering a free service faster gets you rate-limited and fewer
  pictures, not more.

> Even at their best these are invented pictures, not photographs of this
> kitchen's actual food. A free model gets the broad idea of "garlic bread"
> right and the specifics wrong, and no prompt fixes that.
> They are good placeholders for a demo. Photograph the real dishes before a
> paying guest orders from them — a guest who gets something that looks nothing
> like the picture is a complaint, and in some places a consumer-law problem.

### Chinese

Simplified Chinese is a first-class language, not a bolt-on:

- The locale code is **`zh-CN`**, not `zh` — it is what `<html lang>` gets, what
  `Intl` formats money with, and it leaves room for `zh-TW` later.
- The **font stack puts the Chinese faces last**, after Bricolage and Public
  Sans. A browser walks the list per character, so Latin text keeps the brand
  face and only 蒜香面包 falls through to PingFang / Microsoft YaHei / Noto Sans
  SC. Put them first and every Latin letter would be drawn by the Chinese face.
- A dish with no Chinese falls back to **English, then Norwegian** — `pick()`
  in `frontend/lib/i18n.ts`.
- The **language pill shows 中文**, not "ZH", because "ZH" means nothing to a
  Chinese reader.

Albanian was removed in the same change. A guest who had it saved is not shown
an error: `useResolvedLocale` only honours a stored language the restaurant
still offers, and otherwise returns the default. Same for a removed currency.

### Chinese yuan

`Intl` already does the hard part, which is why there is almost no code here.
Asked for CNY it renders `¥28.50` in Chinese and **`CN¥28.50` in English**,
`28,50 CNY` in Norwegian — the disambiguation from Japanese yen is automatic
and per-locale, which is better than hardcoding a prefix.

The one addition is `ALWAYS_DECIMALS` in `frontend/lib/money.ts`. The general rule is
"kr 95", not "kr 95,00", because that is how a menu is written. Yuan is the
exception: ¥28 reads like a listed price, ¥28.50 reads like what it is, a
conversion.

### Themes

Seven: `lys`, `svart`, `rod`, `bla`, `gronn`, `lilla`, `gull`. Each is one
`[data-theme="..."]` block in `frontend/app/globals.css` redefining the same 17 colour
tokens. No component knows a theme exists — they ask for `bg-surface` and get
whatever the active theme says that is.

The theme is the **merchant's** choice, stored in `restaurants.theme` and the
same for every diner. It used to be a per-diner picker in the top bar; that
place in the bar now belongs to **Restaurantinfo**.

To add one: copy a block, change the hexes, add an entry to `THEMES` in
`frontend/lib/themes.ts`, and run `npm run check:contrast` from `frontend/`. That script parses the real
stylesheet and checks twelve colour pairs per theme against WCAG AA, so a
pretty-but-unreadable palette fails before anyone sees it.

Two details that are easy to miss and painful to debug:

- Every theme block sets `color-scheme`. That is what makes scrollbars, text
  selection and native dropdowns render dark on a dark theme.
- A small blocking script paints the page background before anything renders,
  so a diner never sees a white flash on the way to a dark theme. Note what it
  does *not* do: it sets two inline styles on `<html>` and never `data-theme`,
  which is what keeps the theme out of the admin (see above). `<html>` carries
  `suppressHydrationWarning` for the same reason.

### Opening hours and "Åpen nå"

`frontend/lib/opening-hours.ts`, and it is fussier than it looks:

- **Day 0 is Monday**, the way Norway counts weeks — not Sunday, the way
  `Date.getDay()` does. The conversion happens in exactly one place.
- "Now" means now **in the restaurant's timezone** (`restaurants.timezone`), not
  the diner's. Someone checking the menu from another country should see whether
  the place is open, not whether it would be open where they are standing.
- A closing time **after midnight** is normal: 18:00–01:00 means at 00:30 the
  restaurant is open because of *yesterday's* row.
- The badge is computed on the client and re-checked every minute, because the
  menu page is cached for 60 seconds and a server-rendered "Åpen nå" would be
  stale either side of opening time.

### Why the server/client split is where it is

`frontend/app/m/[slug]/page.tsx` runs the database query **on the server** and sends
finished HTML. A diner's phone gets the menu in the first response instead of
downloading JavaScript, booting it, and only then asking for data. That is the
whole reason this is Next.js and not a plain React SPA — and it's why Google can
index the menu.

That one query fetches **every language and every currency rate**, because a
menu is a few dozen rows. Switching language or currency after that is local
state: no network, no spinner, and it still works if the connection drops.
`revalidate = 60` caches the rendered page, so a thousand diners scanning the
same QR code cost one database query rather than a thousand — and every admin
save calls `revalidatePath` on both `/admin` and `/m/[slug]`, so edits appear at
once instead of up to a minute later.

### Two rules worth not breaking

**Money.** A price is an integer in minor units of the restaurant's base
currency — `9500` means kr 95,00. Never a float, never a string. Other
currencies are derived at display time from `currencies.rate_per_eur` (EUR is
just the pivot the maths routes through; it does not have to be anyone's base),
and converted prices are shown with `≈` because they are indicative. Whole
amounts print without decimals, because "kr 95" is how a menu is written and
"kr 95,00" is not. All of it lives in `frontend/lib/money.ts`.

The price filter's bands are **derived from each menu's own prices** (the 33rd
and 67th percentile) rather than hardcoded. A fixed "under 1000 minor units"
threshold is a reasonable €10 and a nonsensical 10 øre — every kroner dish would
land in the top band. A menu with fewer than three dishes, or one where
everything costs the same, gets no price filter at all instead of three buttons
where two return nothing.

**Language.** Dish names and descriptions live in the database
(`item_translations`), because the *merchant* writes them. Only UI chrome
("Filtre", "Søk i retter") lives in `frontend/lib/i18n.ts`, because *you* write that.
Getting this backwards means a merchant has to call you to fix a typo.

Adding a language is three steps: a row in `locales`, a block in `UI_STRINGS`,
and translation rows for the menu, categories, items and tags. A dish with no
translation in the viewed language falls back to English rather than rendering
blank.

---

## What this stage deliberately does not do

**No payment.** Guests order; they pay the way they always did. Taking money
means a payment provider, refunds, receipts and tax rules, and none of that
should be bolted onto a menu app as an afterthought.

Also not here, roughly in the order you would want them:

1. **More than one merchant per restaurant** — `restaurant_members.role` is
   already there and already ignored. Decide what a `staff` role may change
   (availability, probably) before you grant anyone one.
2. **Editing an order after it is placed** — a guest adding a coffee to an
   order already in the kitchen, or a waiter splitting a table. Both need
   rules about what the kitchen has already started, which is a conversation
   with the restaurant, not a schema change.
3. **Printing to a kitchen printer** — most take an ESC/POS socket, which
   needs something running on the premises.
4. **Mobile apps** — Expo / React Native. Same language, same types, same API;
   `frontend/lib/types.ts`, `frontend/lib/money.ts` and `frontend/lib/filter.ts` move across unchanged.

---

## Before anyone real sees this

- **The dish names, descriptions and prices in `seed.sql` are placeholders**
  from the design mockup. The address, phone number and email are
  placeholders too.
- **The currency rates in `seed.sql` are placeholders, not live rates.** Wire a
  rates API (the ECB daily feed is free) to a scheduled job that updates
  `currencies.rate_per_eur`, or drop the currency switcher until you do.
- **Password reset is not wired up.** Supabase sends the email; the page that
  receives the link does not exist yet. Until then, reset passwords from the
  dashboard.

## Notes

### Self-hosting the fonts

`frontend/app/layout.tsx` loads Bricolage Grotesque and Public Sans via a stylesheet
link. `next/font/google` is better — it downloads the files at build time and
self-hosts them, so there's no third-party request from a diner's phone. It
needs network access to `fonts.googleapis.com` while building, which the sandbox
this was written in didn't have. To switch, replace the `<head>` block in
`layout.tsx` with:

```tsx
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";

const displayFace = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-display-face" });
const bodyFace = Public_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-body-face" });
// then: <html className={`${displayFace.variable} ${bodyFace.variable} ...`}>
```

and in `globals.css` change the two font tokens to
`var(--font-display-face), "Trebuchet MS", system-ui, sans-serif` (and the body
equivalent), moving them into a `@theme inline { }` block so they can reference
the variables.

### "hostname is not configured under images"

```
Invalid src prop (https://xxxx.supabase.co/storage/v1/object/public/…)
on `next/image`, hostname "xxxx.supabase.co" is not configured under
images in your `next.config.js`
```

`frontend/next.config.ts` builds the allow-list from `NEXT_PUBLIC_SUPABASE_URL`, so this
means the variable was not set **at the moment the server started**. That file
is read once, at startup: editing `.env.local` afterwards does not re-run it,
and neither does reloading the page.

> **Stop the dev server (Ctrl-C) and run `npm run dev` again.** A browser
> reload is not enough.

There is a wildcard fallback for any `*.supabase.co` public storage path, so
images work even before the variable is set — but the exact-host pattern is
better, and it is what you get once the server restarts with the variable in
place.

### `frontend/proxy.ts`, not `middleware.ts`

Next.js 16.4 renamed the file convention. The old name still works and logs a
deprecation warning on every dev start; this project uses the new one. If you
are following a tutorial written against `middleware.ts`, it is the same file
with a different name and a `proxy` export.

### Tailwind and Turbopack

The `turbopack.rules` block in `frontend/next.config.ts` is what runs Tailwind v4. Remove
it and `@import "tailwindcss"` is passed through untouched: you get a 1 KB
stylesheet with no utility classes, the page renders completely unstyled, and
there is no error message. Worth knowing before you spend an hour on it.

### `npm audit`

Five "high" advisories, all from `braces` reaching this project through
`eslint-config-next` → `fast-glob`. It is a denial-of-service on deeply nested
glob patterns in **dev tooling only** — nothing in it ships to a browser.
`npm audit fix --force` "fixes" it by downgrading `eslint-config-next` to v14,
which is worse. Leave it; it clears when the upstream dependency updates.

---

## Verified

Checked before hand-off, not assumed:

**Database**

- `schema.sql` and `seed.sql` run against a real PostgreSQL 16, **four times
  over**, with no errors — they are genuinely idempotent, including the renamed
  policies.
- Seeded data lands correctly: 7 categories, 56 items, 224 item translations
  (56 × 4 languages, no gaps), all with a long description and ingredients.
- `backend/tests/rls-test.sql` passes: anon reads the menu but cannot change a price;
  a signed-in stranger updates and deletes **0** rows; the owner can write; an
  unpublished restaurant is visible to its owner and shows 0 rows to anon; the
  database refuses a second active menu; deleting a category cascades to its
  dishes.
- The composite foreign key rejects an item pointing at another restaurant's
  category.
- `backend/tests/orders-test.sql` passes, which is the one to read if you read any:
  a browser claiming `"price_minor": 1` is **charged the real price**, because
  `place_order()` never looks at what it sent; `anon` cannot select, insert or
  update `orders` at all; one guest's token will not read another's order;
  a random token returns nothing; sold-out dishes, another restaurant's dishes,
  zero and 500-portion quantities, blank table numbers and empty baskets are
  all refused; a rejected order leaves **no** half-written row behind; twelve
  orders in a row get twelve distinct, increasing numbers starting at 1000;
  a stranger sees 0 orders and changes 0; the owner sees and updates their own;
  the database refuses an invented status; ordering is refused with the switch
  off, while unpublished, and outside opening hours (including the
  past-midnight case); and **deleting a dish does not rewrite history** — the
  order lines keep their name and price snapshots.

**Logic**

- 65 checks on the money, filter, i18n, slug and opening-hours helpers:
  conversion round-trips, 0-decimal currencies, Norwegian number formatting
  ("95 kr", not "kr 95"), percentile price bands, "diets are AND / allergens are
  NOT", accent-insensitive search, locale fallback, `æøå` slugs, slug collisions,
  midnight and past-midnight opening hours, a restaurant in another timezone.
- 96 contrast checks — 12 colour pairs × 7 themes **plus the admin's
  monochrome palette** — all pass WCAG AA (`npm run check:contrast`).
- 73 checks on the ordering layer's pure functions: table lists (`12`, `3-6`,
  `1-3,bar`, and `ute-1` being a table name rather than a range), QR links
  (an `&` in a table name cannot smuggle in a second parameter), basket maths,
  the jsonb-to-view-model mapping surviving nulls and garbage, every status
  landing in exactly one tab, the status buttons never leading backwards, a new
  order being walkable all the way to completed, and "4 min ago" rounding down
  rather than up.
- 30 checks on the photo generator against a stubbed network: the prompt, the
  per-dish seed being stable, the URL's parameters, a slash in a dish name not
  escaping the path, two uploads of one dish never colliding, exponential
  backoff actually waiting, a hanging request timing out, and — the one that
  matters — a 200 response carrying HTML instead of an image being rejected
  rather than stored as the dish photo.

**Rendering** (real Chromium, both halves)

- The diner's menu at **320, 360, 390, 414, 768, 1024 and 1440px**, and all
  seven admin screens at 320/390/768/1440 **in both admin languages** — no
  horizontal overflow anywhere.
- **The admin is monochrome under every theme.** Each of the 7 themes × 7 admin
  screens was rendered and every painted colour read back from the DOM; none
  had a hue. The Tema preview box was checked the other way round — it *must*
  show colour, and that colour must not escape the box.
- Switching the admin to English relabels the nav, titles, buttons, form
  labels, hints and `<html lang>`, leaves no Norwegian chrome behind, survives
  a reload, and does not change the diner's menu language. Switching the diner
  to Italian does not change the admin.
- The AI photo button is `type="button"` so it cannot submit the dish form, is
  disabled with an explanation on an unsaved dish, and does not replace the
  manual upload field.
- `next/image` accepts the Supabase storage host and still rejects an
  unlisted one — checked against the optimiser endpoint directly, with the
  environment variable both set and missing.
- All four diner sheets open, fit the screen, contain no invisible text, and
  close on Escape. Tapping the option already selected closes the sheet too.
- Restaurantinfo shows an open/closed badge and highlights exactly one day as
  today, in the restaurant's timezone.
- Every admin control has an accessible name and a tap target at least 32px
  tall.

**Ordering** (real Chromium, both sides)

- Adding from a card does **not** open the dish page; the button becomes a
  stepper; the basket count follows; a sold-out dish offers "Utsolgt" and no
  way in; and the basket survives a reload.
- The cart sheet fits a 390px screen, picks the table number up from
  `?table=7`, takes a per-line comment, shows the empty state when the last
  line goes, and keeps "Send bestilling" disabled while the basket is empty.
- Sending without a table number is refused, with the field marked invalid.
- With ordering off, the menu says so and shows no add buttons and no basket.
- All six statuses render the right Norwegian message; a declined order shows
  its reason and **no** progress tracker; an unknown token says so instead of
  crashing; the page fits every width from 320 to 1440.
- The board shows all five tabs and filters by them, renders order number,
  table, line comments, the guest's note and the age, offers the right buttons
  per status, searches by order number, and asks for a reason before declining.
- QR codes: twelve by default, each a downloadable PNG whose caption carries
  `?table=`, and `1-3,ute-1` produces exactly four. Three generated codes were
  **decoded again with a QR reader** and came back as the exact URL, including
  a percent-encoded table name.
- Orders and QR stay monochrome under all seven themes, and the whole board
  translates to English with no Norwegian left behind.
- The guest's add button translates across all four languages.

- `npm run build`, `npx tsc --noEmit` and `npm run lint` all clean from `frontend/`.

**This change**

- All 56 dishes, 7 categories and 15 tags carry Chinese; a coverage check
  confirmed none missing and none spurious.
- The language sheet offers exactly Norsk / English / Italiano / 中文, the
  currency sheet exactly NOK / EUR / USD / SEK / CNY, and neither offers
  Albanian.
- `<html lang>` becomes `zh-CN`; the Chinese glyphs were **measured** in the
  browser (four characters at 64px against a Latin baseline) to prove they
  render rather than falling back to empty boxes.
- Chinese fits 320 / 360 / 390 / 768 / 1280 with no horizontal overflow, on the
  menu, the dish page, the cart and the order status page.
- Prices in CNY show two decimals everywhere and are labelled `¥` in Chinese,
  `CN¥` in English, `CNY` in Norwegian.
- A browser with `sq` and `ALL` saved from before falls back to Norwegian and
  NOK silently, with no console error.
- The dish form has Norwegian, English and Chinese fields plus the English
  image-prompt override; no Albanian fields remain.
- No "Sofra" anywhere — menu, dish page, order page, Restaurantinfo, the admin
  or the theme preview.
- `migrate-2026-10-zh.sql` runs twice with the same result on a database that
  already has data.
- The orders and RLS suites still pass, 96 contrast checks still pass.

**Not verified here**

- The real call to `image.pollinations.ai`. This sandbox blocks it, so the
  generator was exercised against a stubbed `fetch` instead — everything but
  the network hop. Run `npm run generate-images -- --limit 2` first and look at
  the two pictures before letting it loose on the whole menu.
- **Supabase Realtime against a live project.** This sandbox cannot reach
  Supabase, so the websocket path is the one piece that was not exercised
  end to end. The SQL it depends on is tested, the trigger cannot break a
  status change even if Realtime is absent, and both screens poll regardless —
  so the worst case is updates arriving in seconds rather than instantly. Still
  worth ten minutes of your own: place an order on your phone with the board
  open on a laptop, and check it appears without touching either.
- **Two phones ordering at the same instant.** The database guarantees distinct
  order numbers (a sequence, and twelve sequential calls were checked), but the
  genuinely simultaneous case needs two real clients.
