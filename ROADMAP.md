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

## Phase 2 — Before going live (do this next)

1. **Add a login.** Right now anyone with the URL can see and edit every
   client's birth details — that's a privacy problem the moment this is on
   the public internet. Add password-protected admin access:
   - Easiest: [NextAuth.js](https://authjs.dev) with a single hardcoded admin
     email/password (or Google sign-in restricted to your email).
   - Wrap every page under `/clients`, `/videos/new`, `/classes/new` etc. in
     an auth check; leave `/videos` and `/classes` (the public-facing pages
     for students) open.
2. **Move to a persistent, hosted database.** SQLite is a single file on
   disk — fine for local use, but most hosting platforms (Vercel, Netlify)
   reset the filesystem on every deploy, so you'd lose all client data.
   - Get a free Postgres database from [Neon](https://neon.tech),
     [Supabase](https://supabase.com), or Vercel's own Postgres add-on.
   - In `prisma/schema.prisma`, change `provider = "sqlite"` to
     `provider = "postgresql"`.
   - Swap `@prisma/adapter-better-sqlite3` for `@prisma/adapter-pg` in
     `src/lib/db.ts`, pointing at your new `DATABASE_URL`.
   - Run `npx prisma migrate deploy` against the new database.
3. **Deploy.** Push this repo to GitHub, then import it into
   [Vercel](https://vercel.com/new) (free tier is enough to start). Add your
   `DATABASE_URL` as an environment variable in the Vercel project settings.
   Vercel gives you a live URL and redeploys automatically on every push.

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

## Notes on what "done" means for Phase 1

- The astrology engine is internally consistent and uses standard formulas
  (ayanamsa, dasha, navamsa division), verified against expected sidereal
  positions for a known birth date — but it has **not** been cross-checked
  planet-by-planet against a paid Swiss-Ephemeris product. Treat results as
  "very likely correct sign/nakshatra/dasha" rather than "certified to the
  second," until Phase 3's Swiss Ephemeris swap.
- There is no authentication. Do not deploy this publicly with real client
  data until Phase 2, step 1, is done.
