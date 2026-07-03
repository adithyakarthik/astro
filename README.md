# JK Vedansh Astro

A multi-user Vedic astrology practice-management app: each astrologer signs in
with just their email (no password), and sees only their own clients, kundlis,
videos and classes. Store client kundlis (birth charts), compute them in
standard Vedic formats (Rasi/D1, Navamsa/D9, Nakshatra, Vimshottari Dasha),
check marriage compatibility, look up Muhurta/Panchang, track planetary
transits, publish YouTube videos, and announce classes with a UPI payment
link/QR so students can pay directly via GPay, PhonePe, Paytm etc. The whole
interface works in **English, Tamil, or Hindi**.

This is a **working first version (MVP)**, not a finished commercial product
— see [`ROADMAP.md`](./ROADMAP.md) for what to build next.

## What's in here

| Feature | Where |
|---|---|
| Email + OTP login (no password) | `/login` |
| Admin console — enable/disable feature modules per user (subscription-style access control) | `/admin/users` |
| Add clients + their kundli birth details | `/clients` |
| Auto-computed Rasi (D1) & Navamsa (D9) charts, Nakshatra, Vimshottari Dasha + Antardasha (Dasa-Bukthi) | `/kundli/[id]` |
| Tamil Jathakam ("Jamakkol" style) — same chart in Tamil terminology | `/kundli/[id]` (bottom section) |
| Match Making — Ashtakoot Guna Milan (36-point) compatibility | `/matchmaking` |
| Muhurta / Panchang — tithi, nakshatra, yoga, karana, Rahu Kalam, etc. + Tamil calendar (month/day/weekday) | `/muhurta` |
| Transits (Gochar) — current planetary positions vs. a natal chart | `/transits` |
| Publish YouTube videos | `/videos` |
| Announce classes with UPI payment link + QR code | `/classes` |
| Language switcher (English / தமிழ் / हिन्दी) | top-right of the nav bar |

Tech stack: **Next.js** (React) + **TypeScript**, **Prisma** ORM on **SQLite**
(swap for Postgres when you deploy for real, see Roadmap), astrology math via
the **astronomia** VSOP87 astronomy library, **qrcode** for payment QR codes,
email OTP via **Resend** (optional — falls back to on-screen codes locally).

## Running it yourself (no coding needed, just following steps)

You need [Node.js](https://nodejs.org) installed (get the "LTS" version).

1. Open a terminal in this project folder.
2. Copy the example environment file and open it:
   ```bash
   cp .env.example .env
   ```
   Set `ADMIN_EMAILS` to your own email address (comma-separate more than
   one) — whoever logs in with one of these emails becomes an admin who can
   manage other users' module access.
3. Install dependencies (only needed once, or after pulling new code):
   ```bash
   npm install
   ```
4. Set up the database (only needed once):
   ```bash
   npm run setup
   ```
5. Start the app:
   ```bash
   npm run dev
   ```
6. Open **http://localhost:3000** — you'll land on the login page.

## Signing in

1. Enter your email and click **Send login code**.
2. Since no email provider is configured yet, the app shows the 6-digit code
   directly on the next screen ("dev mode"). Enter it to sign in.
3. To send real emails instead, sign up at [resend.com](https://resend.com)
   (free tier available), get an API key, and set `RESEND_API_KEY` and
   `RESEND_FROM_EMAIL` in `.env`.

Each account only ever sees the clients/kundlis/videos/classes it created
itself — this is a real multi-tenant app, not a shared single-user tool.

## Managing users & subscriptions (admin console)

If your email is listed in `ADMIN_EMAILS`, you'll see an **Admin** link in the
nav. At `/admin/users` you can:
- See every user who has signed in.
- Enable or disable each feature module (Clients & Kundlis, Match Making,
  Muhurta, Transits, Videos, Classes) per user — this is how you'd gate
  features by subscription plan (e.g. a "Basic" plan only gets Clients &
  Kundlis, a "Pro" plan gets everything).
- Promote another user to Admin.

A user with a module disabled sees a friendly "isn't in your plan" message
instead of that page's content, and it disappears from their nav.

This is manual/admin-driven gating, not tied to an actual payment/subscription
system yet — see `ROADMAP.md` for connecting it to real billing.

## Language

Everyone can switch the interface language (English / தமிழ் / हिन्दी) from the
dropdown next to their email in the top nav — it's saved as a cookie, so it
persists across visits, and it's per-browser, not per-account. The kundli
chart page also shows rasi/nakshatra/planet names in whichever language is
selected, plus a bonus "Tamil Jathakam" section that's always in Tamil
regardless of the UI language setting.

## How accurate are the charts?

Planetary positions come from VSOP87 astronomical theory (the same class of
math used by serious planetarium software), converted to the sidereal
(Nirayana) zodiac using a **mean Lahiri ayanamsa approximation**. This is
accurate to roughly an arcminute — good enough to get the right sign,
nakshatra and dasha for the vast majority of charts, but not certified to the
same precision as paid Swiss Ephemeris-based software. If you're publishing
charts professionally and need exact-to-the-second precision, see the Swiss
Ephemeris upgrade path in `ROADMAP.md`.

The **Match Making** tool uses the standard, widely-published simplified
Ashtakoot rules; a few koots have minor variations across traditional
Panchang schools. It's a genuinely useful starting point, not a substitute
for a qualified astrologer's sign-off — especially for a borderline score or
a flagged Nadi/Bhakoot dosha.

## Where your data lives

By default this uses a local SQLite file (`dev.db`) — great for trying things
out, but it resets if you redeploy on most hosting platforms. Before you rely
on this for real clients, follow the "Deploying for real" steps in
`ROADMAP.md` to move to a persistent hosted database.

## Project structure (for whoever maintains this later)

```
src/
  app/                  Pages (Next.js App Router) — one folder per URL
    login/              Email + OTP sign-in flow
    admin/users/        Admin console (module access per user)
    clients/            Client list, add client, add kundli
    kundli/[id]/        Kundli chart display
    matchmaking/        Ashtakoot Guna Milan compatibility
    muhurta/            Panchang + Tamil calendar lookup
    transits/           Current planetary transits
    videos/             Video gallery + publish form
    classes/            Class announcements + UPI payment links
  components/           Reusable UI (chart grid, module-locked message, language switcher)
  lib/
    auth/                Session/OTP/email/module-access logic
    astro/engine.ts      The astrology calculation engine
    astro/constants.ts   Sign/nakshatra/dasha reference data (English/Tamil/Hindi)
    astro/localized-names.ts  Picks chart terminology by UI language
    astro/panchang.ts     Panchang (tithi/nakshatra/yoga/karana/Rahu Kalam etc.)
    astro/tamil-calendar.ts  Tamil solar calendar
    astro/matching.ts     Ashtakoot Guna Milan engine
    astro/transit.ts      Transit (Gochar) engine
    astro/birth-utils.ts Local time -> UTC conversion helper
    i18n/                 Translation dictionary + language cookie helpers
    upi.ts               UPI deep-link builder
    youtube.ts            YouTube URL -> video ID parser
    db.ts                 Database connection
  proxy.ts                Redirects signed-out users to /login
prisma/schema.prisma     Database structure (User, Session, OtpCode, Client, Kundli, Video, Class)
```
