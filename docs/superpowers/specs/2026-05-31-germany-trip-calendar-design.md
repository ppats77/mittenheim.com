# Summer in Germany 2026 — Trip Calendar Design

**Status:** Approved (brainstorm complete)
**Date:** 2026-05-31
**Author:** Max + Claude
**Repo:** mittenheim.com (static food/travel blog, plain HTML/CSS/JS, Cloudflare Pages)

## Goal

Build a calendar-style trip page for the family's summer in Germany, covering the
travel out (Jun 8, 2026) through the return to SFO (Aug 12, 2026) — **66 day-slots**.
It must show the whole summer at a glance, link to a rich per-day page for each day,
and **auto-highlight "today"** while the trip is underway. Max fills in the actual
daily activities; this project delivers the scaffold + day-page system, pre-seeded
with the confirmed flight days.

## Context

- Family: **Max, Natalia, Seraphima (16), Luca (14)**. Home in Cupertino, CA.
- This is a **homecoming summer**: fly SFO → Frankfurt → Munich, base in
  **Oberschleißheim** (near Munich; S1 line), return MUC → FRA → SFO.
- Confirmed flights (Condor, booking ref 14795686):
  - **Jun 8, 2026 (Mon):** SFO → Frankfurt, DE2097, dep 16:30, arr 12:40+1
  - **Jun 9, 2026 (Tue):** Frankfurt → Munich, DE4427, arr 15:30
  - **Aug 12, 2026 (Wed):** Munich → Frankfurt (DE4304, 09:15) → SFO (DE2096, arr 14:30)
- Getting around in Germany: **car + Deutsche Bahn / S-Bahn**.
- Day density: **realistic mix** — planned days, rest/home days, travel days.
- The existing `/trips/` section (Japan April 2026) is the visual + structural model:
  trip index → trip overview → per-day `index.html` pages built from `<details>`
  timeline "steps" with `.trip-place`, `.trip-maps-btn`, `.trip-checklist`,
  `.trip-timing-table`, photos.

## Decisions (locked during brainstorm)

| Decision | Choice |
|---|---|
| Overview layout | **A (month grid) + C (rich day pages)** combined |
| Build approach | **Generator script + data file** (deployed site stays 100% static) |
| Language | **English only** (matches existing `/trips/`, which is `noindex`) |
| "Today" timezone | **Europe/Berlin** (Germany time), not device time |
| Day coverage | All 66 dates exist; 3 flight days seeded from booking; rest = "to be planned" placeholders for Max |
| Month labels | **German** month + weekday names on the grid (Juni/Juli/August, Mo–So); English everywhere else |

## Architecture

Data-driven generator. A single data file is the source of truth; a zero-dependency
Node script generates the overview grid and all 66 day pages from shared templates.
**The committed `.html` is what Cloudflare serves** — production stays buildless;
Node is a dev-only tool for (re)generating after data edits.

```
trips/2026/germany/
├── days.js          # SOURCE OF TRUTH: trip meta + phases + 66 days
├── build.js         # Node generator (no npm deps); `node build.js`
├── build.test.js    # Node test (node --test) — assertions below
├── index.html       # GENERATED: month-grid overview (A)
├── june-08/index.html
├── june-09/index.html
│   ... (66 total) ...
└── august-12/index.html
```

Also: add a card to `trips/index.html` linking to `/trips/2026/germany/`.

### Day-page URL slugs

Lowercase `month-DD`, zero-padded day: `june-08` … `june-30`, `july-01` … `july-31`,
`august-01` … `august-12`. (23 + 31 + 12 = 66.)

## Data model (`days.js`)

```js
module.exports = {
  name: "Summer in Germany 2026",
  base: "Oberschleißheim",
  tz: "Europe/Berlin",
  travelers: "Max, Natalia, Seraphima & Luca",
  start: "2026-06-08",
  end:   "2026-08-12",
  phases: [
    { id, label, emoji, from, to }   // e.g. { id:'arrival', label:'Ankunft & München', emoji:'🏡', from:'2026-06-08', to:'2026-06-14' }
  ],
  days: {
    "2026-06-08": {
      title: "Abflug SFO → Frankfurt",
      phase: "arrival",
      type: "travel",                 // travel | plan | rest
      summary: "One-line summary shown on the day card / grid tooltip",
      blocks: [ /* see Block types */ ]
    },
    // ... every date from start..end present (66 entries) ...
  }
}
```

### `type` → grid appearance
- `travel` → dark cell with ✈ marker
- `plan` → pink fill (Gumroad `--pink`)
- `rest` → light fill

### Block types (reuse existing trip vocabulary — NO new day-page components)
Each day's `blocks` array contains objects the generator renders into the existing
CSS classes:
- `step` → `<details class="trip-step">` with a `time`/label `summary` + body
- `place` → `.trip-place` (name + detail) optionally with a `.trip-maps-btn`
- `checklist` → `.trip-checklist`
- `timing` → `.trip-timing-table`
- `backup` → `.trip-backup`
- `alert` → `.trip-alert`
- `photo` → `.recipe-photo` `<img loading="lazy">`
- `note` → plain `<p>` / `<ul>`

Empty/rest days with no blocks render a friendly placeholder ("Nothing planned yet —
check back closer to the day").

### Seeding
The generator's `days.js` ships pre-populated with:
- All 66 dates, each with correct weekday + assigned phase.
- **Jun 8, Jun 9, Aug 12** fully filled from the Condor booking (flight numbers,
  times, airports, seat info as appropriate) using `step`/`timing`/`place` blocks.
- All other days: `type: "rest"`, a `note` placeholder, ready for Max to edit.

## Overview page (A — month grid)

- Header: black hero (`recipe-hero--text`) — trip name, travelers, base, date range.
- Three month blocks (Juni / Juli / August 2026), each a 7-column grid with German
  weekday headers (Mo Di Mi Do Fr Sa So). Leading blank cells computed from the 1st's
  weekday (Juni→Mon/0 blanks, Juli→Wed/2 blanks, August→Sat/5 blanks). Days outside
  Jun 8–Aug 12 render empty/greyed.
- Each in-trip cell shows the day number (+ ✈ on travel days), colored by `type`,
  and links to that day's page.
- Top controls: **legend** (planned / rest / travel / today) + **"Jump to today"**
  button (scrolls to and pulses the today cell; hidden if today is outside the range).
- Back link to `/trips/`.

### New CSS (added to `css/style.css`)
- `.trip-calendar`, `.cal-month`, `.cal-month__title`, `.cal-grid`, `.cal-weekday`,
  `.cal-day`, plus modifiers `.cal-day--plan`, `--rest`, `--travel`, `--empty`,
  `--today`.
- Neubrutalist consistent with site: 2px black borders, hard offset shadow on hover,
  pink for planned, `--bg-alt` for rest. Mobile (<600px): cells shrink, number stays,
  any label hides.

## Day pages (C — Japan-style, enhanced)

- Same nav/footer as existing Japan day-pages; `<meta name="robots" content="noindex, nofollow">`;
  English; logo links to the Germany trip overview.
- Black hero: phase tag + "Weekday, Month D" + day title + optional sub-line.
- **Prev / Next day** navigation links (computed from date order; clamp at ends) and a
  "← All days" back link to the overview.
- Body rendered from `blocks`. Empty days show the placeholder.

## "Today" highlight (Cloudflare-safe)

Cloudflare Pages is static hosting — no request-time server — so highlighting "today"
is done **client-side**:

```js
// inline, no deps
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' })
  .format(new Date()); // -> "2026-06-12"
```
- Overview: find `.cal-day[data-date="<today>"]`, add `--today`.
- Day page: if the page's own `data-date` equals today, show a "Today" banner / accent.
- Pure client-side, **no build, no redeploy** — auto-advances each day. Outside the
  trip range it simply highlights nothing.
- Implemented as a small addition to `js/main.js` (guarded so it's a no-op on pages
  without calendar markup).

## Testing (per superpowers TDD)

`build.test.js` (run with `node --test`) asserts, after running the generator into a
temp/dist dir:
1. Exactly **66** day-page files are emitted, slugs `june-08`…`august-12`.
2. Overview `index.html` contains 3 month blocks with the correct number of leading
   blank cells (Juni 0, Juli 2, August 5) and the correct total in-trip day count per
   month (Juni 23, Juli 31, August 12).
3. Each `.cal-day` carries a valid `data-date` (YYYY-MM-DD) within range.
4. The three flight anchors (Jun 8 / Jun 9 / Aug 12) contain their flight numbers
   (DE2097 / DE4427 / DE4304+DE2096).
5. Every day page has prev/next links consistent with date order (first has no prev,
   last has no next).
6. Generated HTML is well-formed enough to parse (basic tag balance / DOCTYPE check).

Manual verification before "done": open the overview locally, confirm grid alignment
for all three months, click through a few day pages incl. prev/next ends, and verify
the today-highlight by temporarily forcing a date.

## Out of scope (YAGNI)

- No trilingual DE/BY versions of trip pages (trips are English-only + noindex).
- No activity research — Max supplies daily content.
- No CMS/admin UI — editing is done in `days.js`.
- No interactive map embeds beyond the existing `trip-maps-btn` deep links.
- No photo pipeline changes — reuse `/images/trips/...` + `loading="lazy"`.

## Open questions

None blocking. Phase boundaries/labels are a first-draft guess in `days.js` and are
trivially editable by Max.
