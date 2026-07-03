# Roadmap: from this MVP to a real practice tool

This document is the step-by-step build plan. Phase 1 is done (this code).
The rest is ordered by priority — do Phase 2 before you put any real client
data behind a public URL.

## Phase 1 — Done ✅

- Client + kundli database (Prisma + SQLite)
- Vedic astrology engine: sidereal planetary positions, Ascendant, Rasi (D1)
  chart, Navamsa (D9) chart, Nakshatra + pada, Vimshottari Dasha
- Client/kundli management pages
- YouTube video publishing (paste a link, it embeds)
- Class announcements with a UPI payment deep-link + QR code
- **Match Making**: Ashtakoot Guna Milan (36-point) compatibility scoring
  between any two saved kundlis, with a per-koot breakdown and Nadi/Bhakoot
  dosha flags (`/matchmaking`)
- **Muhurta / Panchang**: tithi, nakshatra, yoga, karana, sunrise/sunset,
  Rahu Kalam, Yamagandam, Gulika Kalam, and Abhijit Muhurta for any date and
  place (`/muhurta`)
- **Transits (Gochar)**: current planetary sidereal positions, optionally
  shown as house-from-Ascendant and house-from-Moon against any saved
  kundli (`/transits`)
- **Email + OTP login**, multi-tenant data isolation (each user only ever
  sees their own clients/kundlis/videos/classes), an **admin console** to
  enable/disable feature modules per user (subscription-style gating), and a
  full **English/Tamil/Hindi** language switcher across the UI, including the
  kundli chart's rasi/nakshatra/planet names.

## Phase 2 — Before going live (do this next)

1. **Move to a persistent, hosted database.** SQLite is a single file on
   disk — fine for local use, but most hosting platforms (Vercel, Netlify)
   reset the filesystem on every deploy, so you'd lose all client data.
   - Get a free Postgres database from [Neon](https://neon.tech),
     [Supabase](https://supabase.com), or Vercel's own Postgres add-on.
   - In `prisma/schema.prisma`, change `provider = "sqlite"` to
     `provider = "postgresql"`.
   - Swap `@prisma/adapter-better-sqlite3` for `@prisma/adapter-pg` in
     `src/lib/db.ts`, pointing at your new `DATABASE_URL`.
   - Run `npx prisma migrate deploy` against the new database.
2. **Set up real OTP email delivery.** Sign up at [resend.com](https://resend.com)
   and set `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — without this, login codes
   only ever appear on-screen (fine for local testing, not for real users).
3. **Deploy.** Push this repo to GitHub, then import it into
   [Vercel](https://vercel.com/new) (free tier is enough to start). Add your
   `DATABASE_URL`, `ADMIN_EMAILS`, `RESEND_API_KEY` and `RESEND_FROM_EMAIL` as
   environment variables in the Vercel project settings. Vercel gives you a
   live URL and redeploys automatically on every push.
4. **Add OTP request rate limiting at the infrastructure level** (e.g. Vercel
   WAF rules, or a simple IP-based limiter) — the app already enforces a
   45-second cooldown per email address, but there's no protection yet
   against someone hammering the login endpoint with many different emails.

## Phase 3 — Astrology accuracy & depth

- **Swap in Swiss Ephemeris** for arcsecond-grade precision (the industry
  standard, used by nearly every commercial Vedic astrology product). Swap
  `src/lib/astro/engine.ts`'s VSOP87 calls for the `swisseph` npm package (or
  call a hosted ephemeris API) — the rest of the app (schema, UI, dasha
  logic) doesn't need to change.
- **More divisional charts (varga)**: D2 (Hora), D3 (Drekkana), D7
  (Saptamsha), D10 (Dashamsha — career), D12 (Dwadashamsha), D30 (Trimshamsha),
  D60 (Shashtiamsha). Same math pattern as the existing D9 calculation in
  `engine.ts`, different division rule per chart.
- **Ashtakavarga** (strength-scoring system) — not yet built.
- **Antardasha/Pratyantardasha** (dasha sub-periods) — currently only
  Mahadasha (main periods) is computed; astrologers usually want the
  sub-periods too.
- **Dashakoot / Manglik (Kuja) dosha check** in the matchmaking tool — beyond
  the current 8-koot score, a full professional match report typically also
  checks Mangal Dosha for both charts.

## Phase 4 — Client & video experience

- **Client self-service portal**: let clients log in (e.g. via phone number +
  OTP) to view their own kundli instead of you sending screenshots.
- **PDF kundli export** for printing/sharing (e.g. via `@react-pdf/renderer`).
- **Auto-sync your YouTube channel** instead of pasting links one by one:
  use the YouTube Data API (free, needs a Google Cloud project + API key) to
  pull your channel's uploads automatically.
- **North Indian style chart option** — this app currently renders the
  South Indian fixed-grid style; some clients prefer the North Indian
  diamond style. Same underlying data, different chart component.

## Phase 5 — Payments & operations

- **Real payment gateway** (Razorpay, Cashfree, Instamojo — all support UPI
  plus cards/netbanking) instead of a manual UPI link. Benefit: automatic
  payment confirmation and receipts, instead of relying on a screenshot or
  your bank SMS. Adds a small transaction fee (~2%) in exchange.
  Note the current UPI-deep-link approach costs you nothing per transaction
  and needs no merchant account — it's a good starting point, just manual.
- **Automatic class reminders** via WhatsApp/SMS (e.g. Twilio, or the
  WhatsApp Business API) a day/hour before class.
- **Recurring/subscription classes** and **attendance tracking**.

## Phase 6 — Accounts, billing & i18n follow-ups

- **Connect module access to real billing.** Right now an admin manually
  ticks checkboxes per user at `/admin/users`. To actually run this as a paid
  SaaS, wire up Razorpay/Stripe subscriptions and have a webhook update each
  user's `enabledModules` automatically when their plan changes.
- **Self-serve signup page** with plan selection, instead of every new email
  landing as a full-access user by default (see `enabledModules` default in
  `prisma/schema.prisma`) — right now everyone gets every module until an
  admin restricts them.
- **More languages** — the translation system (`src/lib/i18n/`) is a plain
  dictionary keyed by language code, so adding e.g. Telugu or Kannada is just
  adding another entry to `dictionaries` in `src/lib/i18n/dictionary.ts` plus
  a matching name table in `src/lib/astro/constants.ts`.
- **Translate remaining edge-case strings** — the core flows (nav, dashboard,
  all forms, chart display, admin) are fully translated, but some error
  messages and a few static labels are still English-only.
- **Audit logging** for admin actions (who enabled/disabled which module for
  whom, and when) — useful once more than one admin exists.

## Notes on what "done" means so far

- The astrology engine is internally consistent and uses standard formulas
  (ayanamsa, dasha, navamsa division), verified against expected sidereal
  positions for a known birth date — but it has **not** been cross-checked
  planet-by-planet against a paid Swiss-Ephemeris product. Treat results as
  "very likely correct sign/nakshatra/dasha" rather than "certified to the
  second," until Phase 3's Swiss Ephemeris swap.
- Authentication, data isolation, and admin module gating are implemented
  and tested locally with multiple accounts — but OTP emails only actually
  send if you configure Resend (Phase 2, step 2); until then, treat this as
  suitable for your own use and trusted testers, not a public signup page.
