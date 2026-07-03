# JK Vedansh Astro

A Vedic astrology practice-management app: store client kundlis (birth charts),
compute them in standard Vedic formats (Rasi/D1, Navamsa/D9, Nakshatra,
Vimshottari Dasha), check marriage compatibility, look up Muhurta/Panchang,
track planetary transits, publish YouTube videos, and announce classes with a
UPI payment link/QR so students can pay you directly via GPay, PhonePe, Paytm etc.

This is a **working first version (MVP)**, not a finished commercial product.
See [`ROADMAP.md`](./ROADMAP.md) for what to build next — most importantly,
**this app currently has no login/password protection**, so don't put real
client data on a public URL until you've added authentication (Roadmap Phase 2).

## What's in here

| Feature | Where |
|---|---|
| Add clients + their kundli birth details | `/clients` |
| Auto-computed Rasi (D1) & Navamsa (D9) charts, Nakshatra, Vimshottari Dasha | `/kundli/[id]` |
| Match Making — Ashtakoot Guna Milan (36-point) compatibility | `/matchmaking` |
| Muhurta / Panchang — tithi, nakshatra, yoga, karana, Rahu Kalam, etc. | `/muhurta` |
| Transits (Gochar) — current planetary positions vs. a natal chart | `/transits` |
| Publish YouTube videos | `/videos` |
| Announce classes with UPI payment link + QR code | `/classes` |

Tech stack: **Next.js** (React) + **TypeScript**, **Prisma** ORM on **SQLite**
(swap for Postgres when you deploy for real, see Roadmap), astrology math via
the **astronomia** VSOP87 astronomy library, **qrcode** for payment QR codes.

## Running it yourself (no coding needed, just following steps)

You need [Node.js](https://nodejs.org) installed (get the "LTS" version).

1. Open a terminal in this project folder.
2. Install dependencies (only needed once, or after pulling new code):
   ```bash
   npm install
   ```
3. Set up the database (only needed once):
   ```bash
   npm run setup
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open **http://localhost:3000** in your browser.

That's it — add a client, generate a kundli, publish a video, announce a
class, and you'll see everything working end to end.

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
    clients/            Client list, add client, add kundli
    kundli/[id]/        Kundli chart display
    videos/             Video gallery + publish form
    classes/            Class announcements + UPI payment links
  components/           Reusable UI (chart grid)
  lib/
    astro/engine.ts      The astrology calculation engine
    astro/constants.ts   Sign/nakshatra/dasha reference data
    astro/birth-utils.ts Local time -> UTC conversion helper
    upi.ts               UPI deep-link builder
    youtube.ts            YouTube URL -> video ID parser
    db.ts                 Database connection
prisma/schema.prisma     Database structure (Client, Kundli, Video, Class)
```
