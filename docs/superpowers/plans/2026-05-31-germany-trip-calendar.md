# Summer in Germany 2026 Trip Calendar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a calendar-style trip page for Summer in Germany 2026 (66 days, Jun 8 – Aug 12) — a month-grid overview linking to rich per-day pages — generated from a single data file, with a Cloudflare-safe client-side "today" highlight in Europe/Berlin time.

**Architecture:** A zero-dependency Node generator (`build.js`) reads a data file (`days.js`) and writes static HTML: one month-grid overview (`index.html`) plus 66 day pages (`june-08/index.html` … `august-12/index.html`). The committed HTML is what Cloudflare serves — production stays buildless; Node is dev-only. A small addition to the existing `js/main.js` adds the today-highlight, guarded to no-op on non-calendar pages. New CSS for the calendar grid is appended to `css/style.css`.

**Tech Stack:** Plain HTML/CSS/JS (no framework, no npm deps). Node.js v24 built-in test runner (`node --test`) for the generator. Existing site design system (Gumroad neubrutalism, `trip-*` CSS classes).

---

## File Structure

| File | Responsibility |
|---|---|
| `trips/2026/germany/days.js` | Source of truth: trip meta, phases, 66 day objects (CommonJS module). Hand-edited by Max. |
| `trips/2026/germany/lib.js` | Pure helper functions (date math, slugs, month-grid layout). Imported by build + tests. No I/O. |
| `trips/2026/germany/render.js` | Pure HTML template functions (overview + day page + blocks). Returns strings. No I/O. |
| `trips/2026/germany/build.js` | Thin orchestrator: reads days.js, calls render, writes files to disk. |
| `trips/2026/germany/lib.test.js` | Tests for date/slug/grid helpers. |
| `trips/2026/germany/render.test.js` | Tests for generated HTML (counts, anchors, prev/next, structure). |
| `trips/2026/germany/index.html` + 66× `*/index.html` | GENERATED output (committed). |
| `css/style.css` | Append calendar grid CSS (after line 984). |
| `js/main.js` | Append today-highlight logic (after line 37). |
| `trips/index.html` | Add a card linking to the Germany trip. |

Split rationale: `lib.js` (logic) and `render.js` (templates) are pure and independently testable; `build.js` is the only file that touches the filesystem. This keeps each unit small and lets tests run without writing files except where explicitly testing output.

---

## Task 1: Date & slug helpers (`lib.js`)

**Files:**
- Create: `trips/2026/germany/lib.js`
- Test: `trips/2026/germany/lib.test.js`

- [ ] **Step 1: Write the failing test**

Create `trips/2026/germany/lib.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const lib = require('./lib.js');

test('eachDate returns inclusive range of ISO dates', () => {
  const dates = lib.eachDate('2026-06-08', '2026-08-12');
  assert.strictEqual(dates.length, 66);
  assert.strictEqual(dates[0], '2026-06-08');
  assert.strictEqual(dates[65], '2026-08-12');
});

test('slugFor builds month-DD slug, zero-padded', () => {
  assert.strictEqual(lib.slugFor('2026-06-08'), 'june-08');
  assert.strictEqual(lib.slugFor('2026-07-01'), 'july-01');
  assert.strictEqual(lib.slugFor('2026-08-12'), 'august-12');
});

test('parts returns weekday/month label data in Europe/Berlin terms', () => {
  const p = lib.parts('2026-06-08');
  assert.strictEqual(p.weekdayEN, 'Monday');
  assert.strictEqual(p.monthEN, 'June');
  assert.strictEqual(p.day, 8);
  assert.strictEqual(p.year, 2026);
});

test('weekdayIndexMon: Monday=0 .. Sunday=6', () => {
  assert.strictEqual(lib.weekdayIndexMon('2026-06-08'), 0); // Mon
  assert.strictEqual(lib.weekdayIndexMon('2026-07-01'), 2); // Wed
  assert.strictEqual(lib.weekdayIndexMon('2026-08-01'), 5); // Sat
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test trips/2026/germany/lib.test.js`
Expected: FAIL — `Cannot find module './lib.js'`.

- [ ] **Step 3: Write minimal implementation**

Create `trips/2026/germany/lib.js`. Use UTC-noon Date objects to avoid any TZ/DST drift in date arithmetic (dates are calendar dates, not instants):

```js
'use strict';

const MONTHS_EN = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const WEEKDAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Parse 'YYYY-MM-DD' to a Date at UTC noon (stable for calendar math).
function toDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}
function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function eachDate(startISO, endISO) {
  const out = [];
  const end = toDate(endISO);
  for (let cur = toDate(startISO); cur <= end; cur.setUTCDate(cur.getUTCDate() + 1)) {
    out.push(toISO(cur));
  }
  return out;
}

function parts(iso) {
  const dt = toDate(iso);
  return {
    iso,
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth() + 1,
    day: dt.getUTCDate(),
    monthEN: MONTHS_EN[dt.getUTCMonth()],
    weekdayEN: WEEKDAYS_EN[dt.getUTCDay()],
  };
}

function slugFor(iso) {
  const p = parts(iso);
  return `${p.monthEN.toLowerCase()}-${String(p.day).padStart(2, '0')}`;
}

// Monday-first weekday index: Mon=0 .. Sun=6
function weekdayIndexMon(iso) {
  const sundayFirst = toDate(iso).getUTCDay(); // Sun=0..Sat=6
  return (sundayFirst + 6) % 7;
}

module.exports = { eachDate, parts, slugFor, weekdayIndexMon, MONTHS_EN, WEEKDAYS_EN };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test trips/2026/germany/lib.test.js`
Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add trips/2026/germany/lib.js trips/2026/germany/lib.test.js
git commit -m "feat(trips): add date/slug helpers for Germany calendar"
```

---

## Task 2: Month-grid layout helper (`lib.js`)

**Files:**
- Modify: `trips/2026/germany/lib.js`
- Test: `trips/2026/germany/lib.test.js`

- [ ] **Step 1: Write the failing test**

Append to `trips/2026/germany/lib.test.js`:

```js
test('monthGrids groups trip dates into months with correct leading blanks', () => {
  const grids = lib.monthGrids('2026-06-08', '2026-08-12');
  assert.strictEqual(grids.length, 3);

  const [jun, jul, aug] = grids;
  assert.strictEqual(jun.monthEN, 'June');
  assert.strictEqual(jun.leadingBlanks, 0);   // Jun 8 is a Monday
  assert.strictEqual(jun.dates.length, 23);   // Jun 8..30
  assert.strictEqual(jul.leadingBlanks, 2);   // Jul 1 is a Wednesday
  assert.strictEqual(jul.dates.length, 31);
  assert.strictEqual(aug.leadingBlanks, 5);   // Aug 1 is a Saturday
  assert.strictEqual(aug.dates.length, 12);   // Aug 1..12
});

test('monthGrids leadingBlanks is based on the FIRST in-trip date of each month', () => {
  // June trip starts on the 8th (Mon) -> 0 blanks before the 8th in the grid row
  const grids = lib.monthGrids('2026-06-08', '2026-08-12');
  assert.strictEqual(grids[0].dates[0], '2026-06-08');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test trips/2026/germany/lib.test.js`
Expected: FAIL — `lib.monthGrids is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add to `trips/2026/germany/lib.js` (before `module.exports`), then add `monthGrids` to the exports object:

```js
// Group the trip's dates by calendar month. leadingBlanks aligns the first
// in-trip date of each month into a Monday-first 7-col grid.
function monthGrids(startISO, endISO) {
  const dates = eachDate(startISO, endISO);
  const byMonth = new Map(); // 'YYYY-MM' -> [iso,...]
  for (const iso of dates) {
    const key = iso.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(iso);
  }
  return [...byMonth.entries()].map(([key, monthDates]) => {
    const first = monthDates[0];
    return {
      key,
      monthEN: parts(first).monthEN,
      year: parts(first).year,
      leadingBlanks: weekdayIndexMon(first),
      dates: monthDates,
    };
  });
}
```

Update the exports line to:

```js
module.exports = { eachDate, parts, slugFor, weekdayIndexMon, monthGrids, MONTHS_EN, WEEKDAYS_EN };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test trips/2026/germany/lib.test.js`
Expected: PASS — all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add trips/2026/germany/lib.js trips/2026/germany/lib.test.js
git commit -m "feat(trips): add monthGrids layout helper"
```

---

## Task 3: Seed data file (`days.js`)

**Files:**
- Create: `trips/2026/germany/days.js`
- Test: `trips/2026/germany/lib.test.js` (add a data-integrity test)

- [ ] **Step 1: Write the failing test**

Append to `trips/2026/germany/lib.test.js`:

```js
test('days.js has every trip date present exactly once', () => {
  const trip = require('./days.js');
  const expected = lib.eachDate(trip.start, trip.end);
  assert.strictEqual(Object.keys(trip.days).length, expected.length);
  for (const iso of expected) {
    assert.ok(trip.days[iso], `missing day ${iso}`);
    assert.ok(['travel', 'plan', 'rest'].includes(trip.days[iso].type),
      `bad type for ${iso}`);
  }
});

test('days.js seeds the three flight anchors', () => {
  const trip = require('./days.js');
  assert.strictEqual(trip.days['2026-06-08'].type, 'travel');
  assert.strictEqual(trip.days['2026-06-09'].type, 'travel');
  assert.strictEqual(trip.days['2026-08-12'].type, 'travel');
  const blob = JSON.stringify(trip.days);
  for (const fn of ['DE2097', 'DE4427', 'DE4304', 'DE2096']) {
    assert.ok(blob.includes(fn), `missing flight ${fn}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test trips/2026/germany/lib.test.js`
Expected: FAIL — `Cannot find module './days.js'`.

- [ ] **Step 3: Write minimal implementation**

Create `trips/2026/germany/days.js`. Generate all 66 dates programmatically so none are missed, then overlay the seeded flight days. Block objects follow the schema consumed by `render.js` (Task 4): each block has a `kind` and kind-specific fields.

```js
'use strict';
const { eachDate, parts } = require('./lib.js');

const START = '2026-06-08';
const END = '2026-08-12';

const phases = [
  { id: 'arrival', label: 'Ankunft & München', emoji: '🏡', from: '2026-06-08', to: '2026-06-21' },
  { id: 'summer',  label: 'Sommer in Bayern',   emoji: '⛰',  from: '2026-06-22', to: '2026-07-26' },
  { id: 'departure', label: 'Letzte Tage & Heimflug', emoji: '✈', from: '2026-07-27', to: '2026-08-12' },
];

function phaseFor(iso) {
  const p = phases.find((ph) => iso >= ph.from && iso <= ph.to);
  return p ? p.id : phases[0].id;
}

// Start every day as a rest placeholder; seeded days overwrite below.
const days = {};
for (const iso of eachDate(START, END)) {
  const p = parts(iso);
  days[iso] = {
    title: `${p.weekdayEN}, ${p.monthEN} ${p.day}`,
    phase: phaseFor(iso),
    type: 'rest',
    summary: 'To be planned.',
    blocks: [
      { kind: 'note', html: '<p>Nothing planned yet — check back closer to the day.</p>' },
    ],
  };
}

// --- Seeded flight days (from Condor booking ref 14795686) ---
days['2026-06-08'] = {
  title: 'Departure — SFO → Frankfurt',
  phase: 'arrival',
  type: 'travel',
  summary: 'Condor DE2097 departs SFO 16:30, overnight to Frankfurt.',
  blocks: [
    { kind: 'timing', rows: [
      ['16:30', 'Depart San Francisco (SFO) — Condor DE2097'],
      ['12:40+1', 'Arrive Frankfurt (FRA) next day'],
    ] },
    { kind: 'place', name: '✈️ Condor DE2097 · SFO → FRA',
      detail: 'Dep 16:30 · 11h10m · Economy (Classic)<br>Seats 41G/41D/41F/41E · Booking ref ZJPTFG<br>1 checked bag (23kg) + 1 carry-on (8kg) each' },
    { kind: 'checklist', items: [
      'Passports + ESTA/entry docs for all four',
      'Online check-in (24–2h before): condor.com',
      'Be at SFO check-in 3h before (180 min deadline for US intl)',
      'Chargers + entertainment for the overnight flight',
    ] },
  ],
};

days['2026-06-09'] = {
  title: 'Arrival — Frankfurt → Munich → Oberschleißheim',
  phase: 'arrival',
  type: 'travel',
  summary: 'Connect FRA → Munich (DE4427, arr 15:30), settle into Oberschleißheim.',
  blocks: [
    { kind: 'timing', rows: [
      ['14:30', 'Depart Frankfurt (FRA) — DE4427 (operated by German Airways)'],
      ['15:30', 'Arrive Munich (MUC)'],
      ['~16:30', 'To Oberschleißheim (home base)'],
    ] },
    { kind: 'place', name: '✈️ Condor DE4427 · FRA → MUC',
      detail: 'Arr 15:30 · ~1h · Economy (Classic)<br>1 checked bag (23kg) + 1 carry-on (8kg) each' },
    { kind: 'note', html: '<p>Settle in, fight the jet lag — stay up until a normal bedtime.</p>' },
  ],
};

days['2026-08-12'] = {
  title: 'Heimflug — Munich → Frankfurt → SFO',
  phase: 'departure',
  type: 'travel',
  summary: 'MUC 09:15 → FRA → SFO, arrive San Francisco 14:30 same day.',
  blocks: [
    { kind: 'timing', rows: [
      ['06:00', 'Leave Oberschleißheim for MUC (be there ~07:15 — 60 min min at MUC)'],
      ['09:15', 'Depart Munich (MUC) — DE4304 (operated by German Airways)'],
      ['10:10', 'Arrive Frankfurt (FRA)'],
      ['11:40', 'Depart Frankfurt (FRA) — Condor DE2096'],
      ['14:30', 'Arrive San Francisco (SFO) — same day'],
    ] },
    { kind: 'place', name: '✈️ Condor DE4304 + DE2096 · MUC → FRA → SFO',
      detail: 'MUC 09:15 → FRA 10:10, then FRA 11:40 → SFO 14:30 (11h50m)<br>Economy (Classic) · 1 checked bag (23kg) + 1 carry-on (8kg) each<br>Check-in deadline: 180 min for US flights' },
    { kind: 'checklist', items: [
      'Online check-in 24h before (MUC needs 60 min check-in → gate)',
      'Pack the night before',
      'Last fridge/trash/keys check at the house',
    ] },
  ],
};

module.exports = { name: 'Summer in Germany 2026', base: 'Oberschleißheim',
  tz: 'Europe/Berlin', travelers: 'Max, Natalia, Seraphima & Luca',
  start: START, end: END, phases, days };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test trips/2026/germany/lib.test.js`
Expected: PASS — 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add trips/2026/germany/days.js trips/2026/germany/lib.test.js
git commit -m "feat(trips): seed Germany trip data (66 days + flight anchors)"
```

---

## Task 4: Block + day-page renderers (`render.js`)

**Files:**
- Create: `trips/2026/germany/render.js`
- Test: `trips/2026/germany/render.test.js`

- [ ] **Step 1: Write the failing test**

Create `trips/2026/germany/render.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const render = require('./render.js');

const sampleDay = {
  title: 'Test Day',
  phase: 'arrival',
  type: 'plan',
  summary: 'A test.',
  blocks: [
    { kind: 'note', html: '<p>Hello</p>' },
    { kind: 'place', name: 'Schloss', detail: 'A castle', maps: 'Schloss Schleissheim' },
    { kind: 'checklist', items: ['One', 'Two'] },
    { kind: 'timing', rows: [['09:00', 'Wake']] },
  ],
};

test('renderBlocks emits the existing trip CSS classes', () => {
  const html = render.renderBlocks(sampleDay.blocks);
  assert.match(html, /trip-place/);
  assert.match(html, /trip-maps-btn/);
  assert.match(html, /trip-checklist/);
  assert.match(html, /trip-timing-table/);
  assert.match(html, /<p>Hello<\/p>/);
});

test('renderDayPage produces a full HTML doc with noindex + prev/next', () => {
  const html = render.renderDayPage({
    trip: { name: 'Summer in Germany 2026' },
    iso: '2026-06-09',
    day: sampleDay,
    prevSlug: 'june-08',
    nextSlug: 'june-10',
    weekday: 'Tuesday', monthEN: 'June', dayNum: 9,
  });
  assert.match(html, /^<!DOCTYPE html>/);
  assert.match(html, /noindex, nofollow/);
  assert.match(html, /\/trips\/2026\/germany\/june-08\//); // prev
  assert.match(html, /\/trips\/2026\/germany\/june-10\//); // next
  assert.match(html, /data-date="2026-06-09"/);
  assert.match(html, /<\/html>\s*$/);
});

test('renderDayPage omits prev link on first day, next on last', () => {
  const first = render.renderDayPage({ trip: { name: 'X' }, iso: '2026-06-08',
    day: sampleDay, prevSlug: null, nextSlug: 'june-09',
    weekday: 'Monday', monthEN: 'June', dayNum: 8 });
  assert.doesNotMatch(first, /← Prev/);
  assert.match(first, /Next →/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test trips/2026/germany/render.test.js`
Expected: FAIL — `Cannot find module './render.js'`.

- [ ] **Step 3: Write minimal implementation**

Create `trips/2026/germany/render.js`. The block renderers mirror the markup already used in `trips/2026/japan/april-11/index.html`:

```js
'use strict';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderBlock(b) {
  switch (b.kind) {
    case 'note':
      return b.html; // trusted author HTML
    case 'place':
      return `<div class="trip-place">
          <div class="trip-place__name">${b.name}</div>
          <div class="trip-place__detail">${b.detail}</div>
        </div>${b.maps ? `
        <a class="trip-maps-btn" href="https://maps.google.com/?q=${encodeURIComponent(b.maps)}" target="_blank">&#128205; ${esc(b.mapsLabel || b.name)}</a>` : ''}`;
    case 'checklist':
      return `<ul class="trip-checklist">
          ${b.items.map((i) => `<li><input type="checkbox"> ${i}</li>`).join('\n          ')}
        </ul>`;
    case 'timing':
      return `<table class="trip-timing-table">
          <tr><th>Time</th><th>What</th></tr>
          ${b.rows.map(([t, w]) => `<tr><td><strong>${t}</strong></td><td>${w}</td></tr>`).join('\n          ')}
        </table>`;
    case 'step':
      return `<details class="trip-step"${b.open ? ' open' : ''}>
          <summary><span class="trip-step__time">${b.time || ''}</span> ${b.label}</summary>
          <div class="trip-step__body">${renderBlocks(b.blocks || [])}</div>
        </details>`;
    case 'backup':
      return `<div class="trip-backup"><h4>${b.title}</h4>${b.html}</div>`;
    case 'alert':
      return `<div class="trip-alert">${b.html}</div>`;
    case 'photo':
      return `<div class="recipe-photo"><img src="${b.src}" alt="${esc(b.alt || '')}" loading="lazy"></div>`;
    default:
      return '';
  }
}

function renderBlocks(blocks) {
  return (blocks || []).map(renderBlock).join('\n        ');
}

function head(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} - Mittenheim Trips</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="theme-color" content="#000000">
</head>
<body>`;
}

const FOOTER = `  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <p>&copy; 2026 Mittenheim. Made with love and good ingredients.</p>
    </div>
  </footer>

  <script src="/js/main.js"></script>
</body>
</html>`;

function renderDayPage({ trip, iso, day, prevSlug, nextSlug, weekday, monthEN, dayNum }) {
  const base = '/trips/2026/germany/';
  const prev = prevSlug ? `<a href="${base}${prevSlug}/">&larr; Prev</a>` : '<span></span>';
  const next = nextSlug ? `<a href="${base}${nextSlug}/">Next &rarr;</a>` : '<span></span>';
  return `${head(day.title)}

  <!-- Navigation -->
  <nav class="nav">
    <div class="container nav__inner">
      <a href="${base}" class="nav__logo">Germany 2026</a>
      <ul class="nav__links" id="nav-links">
        <li><a href="${base}">All Days</a></li>
        <li><a href="/trips/">Trips</a></li>
      </ul>
      <button class="nav__toggle" id="nav-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <!-- Day Header -->
  <div class="recipe-hero recipe-hero--text" data-date="${iso}">
    <div class="recipe-hero__inner">
      <div class="recipe-meta">
        <span>${weekday}, ${monthEN} ${dayNum}</span>
        <span class="tag">Day Plan</span>
      </div>
      <h1>${esc(day.title)}</h1>
    </div>
  </div>

  <!-- Day Content -->
  <div class="recipe-content">
    <div class="trip-daynav">${prev}${next}</div>

        ${renderBlocks(day.blocks)}

    <div class="trip-daynav" style="margin-top:32px;">${prev}<a href="${base}">All days</a>${next}</div>
  </div>

${FOOTER}`;
}

module.exports = { renderBlock, renderBlocks, renderDayPage, head, esc, FOOTER };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test trips/2026/germany/render.test.js`
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add trips/2026/germany/render.js trips/2026/germany/render.test.js
git commit -m "feat(trips): add block + day-page renderers"
```

---

## Task 5: Overview (month-grid) renderer (`render.js`)

**Files:**
- Modify: `trips/2026/germany/render.js`
- Test: `trips/2026/germany/render.test.js`

- [ ] **Step 1: Write the failing test**

Append to `trips/2026/germany/render.test.js`:

```js
const lib = require('./lib.js');

test('renderOverview emits 3 months with correct blanks and day links', () => {
  const trip = require('./days.js');
  const html = render.renderOverview(trip);
  // 3 month titles
  assert.match(html, /Juni 2026/);
  assert.match(html, /Juli 2026/);
  assert.match(html, /August 2026/);
  // German weekday headers
  assert.match(html, /cal-weekday/);
  assert.match(html, />Mo</);
  assert.match(html, />So</);
  // Every in-trip date has a linked cell with data-date
  for (const iso of lib.eachDate(trip.start, trip.end)) {
    assert.ok(html.includes(`data-date="${iso}"`), `missing cell ${iso}`);
  }
  // June grid has 0 leading blanks; July has 2; August has 5
  const blanks = (html.match(/cal-day--empty/g) || []).length;
  assert.strictEqual(blanks, 0 + 2 + 5);
  // Jump-to-today control + legend present
  assert.match(html, /Jump to today/);
  assert.match(html, /cal-legend/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test trips/2026/germany/render.test.js`
Expected: FAIL — `render.renderOverview is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add to `trips/2026/germany/render.js` (before `module.exports`), then add `renderOverview` to exports. German labels live here:

```js
const MONTHS_DE = { January:'Januar', February:'Februar', March:'März', April:'April',
  May:'Mai', June:'Juni', July:'Juli', August:'August', September:'September',
  October:'Oktober', November:'November', December:'Dezember' };
const WEEKDAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function renderOverview(trip) {
  const lib = require('./lib.js');
  const base = '/trips/2026/germany/';
  const grids = lib.monthGrids(trip.start, trip.end);

  const monthsHTML = grids.map((g) => {
    const blanks = Array.from({ length: g.leadingBlanks },
      () => `<div class="cal-day cal-day--empty"></div>`).join('');
    const cells = g.dates.map((iso) => {
      const p = lib.parts(iso);
      const day = trip.days[iso];
      const slug = lib.slugFor(iso);
      const flight = day.type === 'travel' ? ' &#9992;' : '';
      return `<a class="cal-day cal-day--${day.type}" href="${base}${slug}/" data-date="${iso}" title="${esc(day.summary || '')}"><span class="cal-day__num">${p.day}${flight}</span></a>`;
    }).join('');
    const weekdayHdr = WEEKDAYS_DE.map((w) => `<div class="cal-weekday">${w}</div>`).join('');
    return `<div class="cal-month">
        <h2 class="cal-month__title">${MONTHS_DE[g.monthEN]} ${g.year}</h2>
        <div class="cal-grid">
          ${weekdayHdr}
          ${blanks}${cells}
        </div>
      </div>`;
  }).join('\n      ');

  return `${head(trip.name)}

  <!-- Navigation -->
  <nav class="nav">
    <div class="container nav__inner">
      <a href="${base}" class="nav__logo">Germany 2026</a>
      <ul class="nav__links" id="nav-links">
        <li><a href="/trips/">All Trips</a></li>
      </ul>
      <button class="nav__toggle" id="nav-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <!-- Header -->
  <div class="recipe-hero recipe-hero--text">
    <div class="recipe-hero__inner">
      <div class="recipe-meta">
        <span>June 8 – August 12, 2026</span>
        <span class="tag">Germany</span>
      </div>
      <h1>${esc(trip.name)}</h1>
      <div style="margin-top: 12px; color: rgba(255,255,255,0.7); font-size: 0.9rem;">
        ${esc(trip.travelers)} &middot; Home base: ${esc(trip.base)}
      </div>
    </div>
  </div>

  <!-- Calendar -->
  <div class="recipe-content">
    <div class="cal-controls">
      <button class="trip-maps-btn" id="jump-today" type="button">&#128204; Jump to today</button>
      <div class="cal-legend">
        <span><i class="cal-swatch cal-swatch--plan"></i> Planned</span>
        <span><i class="cal-swatch cal-swatch--rest"></i> Open</span>
        <span><i class="cal-swatch cal-swatch--travel"></i> Travel</span>
        <span><i class="cal-swatch cal-swatch--today"></i> Today</span>
      </div>
    </div>

    <div class="trip-calendar">
      ${monthsHTML}
    </div>

    <p style="margin-top: 32px;"><a href="/trips/">&larr; All trips</a></p>
  </div>

${FOOTER}`;
}
```

Update exports to include `renderOverview`:

```js
module.exports = { renderBlock, renderBlocks, renderDayPage, renderOverview, head, esc, FOOTER };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test trips/2026/germany/render.test.js`
Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add trips/2026/germany/render.js trips/2026/germany/render.test.js
git commit -m "feat(trips): add month-grid overview renderer"
```

---

## Task 6: Generator orchestrator (`build.js`)

**Files:**
- Create: `trips/2026/germany/build.js`
- Test: `trips/2026/germany/render.test.js` (integration test that runs the build into a temp dir)

- [ ] **Step 1: Write the failing test**

Append to `trips/2026/germany/render.test.js`:

```js
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

test('build.js writes overview + 66 day pages into target dir', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'germany-build-'));
  execFileSync('node', [path.join(__dirname, 'build.js'), '--out', tmp], { stdio: 'pipe' });

  assert.ok(fs.existsSync(path.join(tmp, 'index.html')), 'overview missing');

  const trip = require('./days.js');
  const slugs = lib.eachDate(trip.start, trip.end).map(lib.slugFor);
  assert.strictEqual(slugs.length, 66);
  for (const slug of slugs) {
    assert.ok(fs.existsSync(path.join(tmp, slug, 'index.html')), `missing ${slug}`);
  }
  // Spot-check anchor content landed in the right file
  const arrival = fs.readFileSync(path.join(tmp, 'june-09', 'index.html'), 'utf8');
  assert.match(arrival, /DE4427/);

  fs.rmSync(tmp, { recursive: true, force: true });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test trips/2026/germany/render.test.js`
Expected: FAIL — build.js does not exist (`execFileSync` throws / ENOENT).

- [ ] **Step 3: Write minimal implementation**

Create `trips/2026/germany/build.js`. Defaults to writing into its own directory; `--out <dir>` overrides (used by the test):

```js
#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const lib = require('./lib.js');
const render = require('./render.js');
const trip = require('./days.js');

function outDir() {
  const i = process.argv.indexOf('--out');
  return i !== -1 ? process.argv[i + 1] : __dirname;
}

function write(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function main() {
  const out = outDir();
  const dates = lib.eachDate(trip.start, trip.end);

  // Overview
  write(path.join(out, 'index.html'), render.renderOverview(trip));

  // Day pages
  dates.forEach((iso, idx) => {
    const p = lib.parts(iso);
    const slug = lib.slugFor(iso);
    const html = render.renderDayPage({
      trip, iso, day: trip.days[iso],
      prevSlug: idx > 0 ? lib.slugFor(dates[idx - 1]) : null,
      nextSlug: idx < dates.length - 1 ? lib.slugFor(dates[idx + 1]) : null,
      weekday: p.weekdayEN, monthEN: p.monthEN, dayNum: p.day,
    });
    write(path.join(out, slug, 'index.html'), html);
  });

  console.log(`Generated overview + ${dates.length} day pages into ${out}`);
}

main();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test trips/2026/germany/render.test.js`
Expected: PASS — 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add trips/2026/germany/build.js trips/2026/germany/render.test.js
git commit -m "feat(trips): add build.js generator orchestrator"
```

---

## Task 7: Calendar CSS

**Files:**
- Modify: `css/style.css` (append after current last line, 984)

- [ ] **Step 1: Append the CSS**

Add to the END of `css/style.css`:

```css

/* ===== Trip calendar (month grid) ===== */
.cal-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.cal-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 0.85rem;
}
.cal-legend span { display: inline-flex; align-items: center; gap: 6px; }
.cal-swatch {
  width: 14px; height: 14px;
  border: var(--border-light);
  border-radius: 3px;
  display: inline-block;
}
.cal-swatch--plan { background: var(--pink); }
.cal-swatch--rest { background: var(--bg-alt); }
.cal-swatch--travel { background: var(--black); }
.cal-swatch--today { background: #fff; border: 2px solid var(--pink); }

.trip-calendar { display: flex; flex-direction: column; gap: 40px; }
.cal-month__title {
  font-size: 1.4rem;
  margin-bottom: 14px;
  letter-spacing: -0.02em;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
.cal-weekday {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-body);
  padding-bottom: 4px;
}
.cal-day {
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--border);
  border-radius: var(--radius);
  background: var(--bg-alt);
  color: var(--text);
  font-weight: 600;
  text-decoration: none;
  transition: transform var(--transition), box-shadow var(--transition);
}
.cal-day:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-sm);
}
.cal-day--plan { background: var(--pink); }
.cal-day--rest { background: var(--bg-alt); }
.cal-day--travel { background: var(--black); color: #fff; }
.cal-day--empty {
  border: none;
  background: transparent;
  pointer-events: none;
}
.cal-day--empty:hover { transform: none; box-shadow: none; }
.cal-day--today {
  outline: 3px solid var(--pink);
  outline-offset: 2px;
  box-shadow: var(--shadow);
}
.cal-day__num { pointer-events: none; }

/* Day-page prev/next nav */
.trip-daynav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  font-weight: 600;
}
.trip-daynav a { white-space: nowrap; }

@media (max-width: 600px) {
  .cal-grid { gap: 3px; }
  .cal-day { font-size: 0.8rem; }
  .cal-month__title { font-size: 1.15rem; }
}
```

- [ ] **Step 2: Verify CSS is syntactically balanced**

Run: `node -e "const c=require('fs').readFileSync('css/style.css','utf8'); const o=(c.match(/{/g)||[]).length, x=(c.match(/}/g)||[]).length; if(o!==x) throw new Error('brace mismatch '+o+'/'+x); console.log('braces balanced',o);"`
Expected: `braces balanced <N>`

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat(trips): add calendar grid CSS"
```

---

## Task 8: Today-highlight JS (Europe/Berlin)

**Files:**
- Modify: `js/main.js` (append after line 37)

- [ ] **Step 1: Append the JS**

Add to the END of `js/main.js`:

```js

// Trip calendar: highlight "today" in Europe/Berlin time (Cloudflare-safe, client-side).
(function () {
  const todayBerlin = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()); // e.g. "2026-06-12"

  // Overview grid: mark the matching cell.
  const cell = document.querySelector(`.cal-day[data-date="${todayBerlin}"]`);
  if (cell) cell.classList.add('cal-day--today');

  // Day page: if this page IS today, accent the hero + relabel the tag.
  const hero = document.querySelector('.recipe-hero[data-date]');
  if (hero && hero.getAttribute('data-date') === todayBerlin) {
    const tag = hero.querySelector('.tag');
    if (tag) tag.textContent = 'Today';
  }

  // "Jump to today" button on the overview.
  const jump = document.getElementById('jump-today');
  if (jump) {
    jump.addEventListener('click', () => {
      const target = document.querySelector('.cal-day--today');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        jump.textContent = 'Today is outside the trip 🗓️';
      }
    });
  }
})();
```

- [ ] **Step 2: Verify JS parses**

Run: `node --check js/main.js`
Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat(trips): add Europe/Berlin today-highlight for calendar"
```

---

## Task 9: Generate the site + link from trips index

**Files:**
- Generate: `trips/2026/germany/index.html` + 66 day pages (via build.js)
- Modify: `trips/index.html`

- [ ] **Step 1: Run the generator**

Run: `node trips/2026/germany/build.js`
Expected: `Generated overview + 66 day pages into /Users/gmax/code/mittenheim/trips/2026/germany`

- [ ] **Step 2: Verify the generated tree**

Run: `ls trips/2026/germany/ | grep -c index.html` (should be 1 — the overview) and
`find trips/2026/germany -name index.html | wc -l`
Expected: `67` total index.html files (1 overview + 66 days).

- [ ] **Step 3: Add the trip card to `trips/index.html`**

In `trips/index.html`, inside `<div class="recipes-grid" style="grid-template-columns: 1fr;">`, add this card ABOVE the existing Japan card (newest first):

```html
        <a class="card" href="/trips/2026/germany/">
          <div class="card__body">
            <div class="card__tags">
              <span class="tag">Jun–Aug 2026</span>
            </div>
            <h3 class="card__title">Summer in Germany</h3>
            <p class="card__desc">66 days, June 8 &ndash; August 12. Home base Oberschlei&szlig;heim. Max, Natalia, Seraphima &amp; Luca. A calendar of the whole summer &mdash; today is always highlighted.</p>
          </div>
        </a>
```

- [ ] **Step 4: Commit**

```bash
git add trips/2026/germany trips/index.html
git commit -m "feat(trips): generate Germany 2026 calendar + link from trips index"
```

---

## Task 10: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run: `node --test trips/2026/germany/*.test.js`
Expected: all tests across `lib.test.js` + `render.test.js` PASS (0 failures) — 16 tests total.

Note: do NOT pass the bare directory (`node --test trips/2026/germany/`). Node v24 treats a
bare directory arg as a module to load (not a test-discovery root) and errors with
"Cannot find module". Use the `*.test.js` glob above, or `cd trips/2026/germany && node --test`.

- [ ] **Step 2: Verify idempotency (re-running build produces no diff)**

Run: `node trips/2026/germany/build.js && git status --short trips/2026/germany/`
Expected: no changes listed (the committed output already matches a fresh build).

- [ ] **Step 3: Verify internal links + structure with a script**

Run:
```bash
node -e "
const fs=require('fs'), path=require('path');
const dir='trips/2026/germany';
const lib=require('./'+dir+'/lib.js'); const trip=require('./'+dir+'/days.js');
const dates=lib.eachDate(trip.start,trip.end);
let bad=0;
// overview links to every day
const ov=fs.readFileSync(dir+'/index.html','utf8');
for(const iso of dates){ const slug=lib.slugFor(iso);
  if(!ov.includes('/trips/2026/germany/'+slug+'/')){console.log('overview missing link',slug);bad++;}
  if(!fs.existsSync(path.join(dir,slug,'index.html'))){console.log('missing page',slug);bad++;}
}
// each page: doctype + closing html + back link
for(const iso of dates){ const slug=lib.slugFor(iso);
  const h=fs.readFileSync(path.join(dir,slug,'index.html'),'utf8');
  if(!h.startsWith('<!DOCTYPE html>')){console.log('no doctype',slug);bad++;}
  if(!/<\/html>\s*$/.test(h)){console.log('no close',slug);bad++;}
  if(!h.includes('/trips/2026/germany/')){console.log('no nav',slug);bad++;}
}
console.log(bad===0?'ALL GOOD ('+dates.length+' pages)':'PROBLEMS: '+bad);
process.exit(bad?1:0);
"
```
Expected: `ALL GOOD (66 pages)`

- [ ] **Step 4: Manual browser check (report findings, do not auto-pass)**

Open `trips/2026/germany/index.html` in a browser (or via the run skill). Confirm:
- Three month grids (Juni/Juli/August) align under Mo–So headers; June starts flush at Monday, July has 2 leading gaps, August has 5.
- Planned/rest/travel colors render; hover lifts cells.
- Click a day → its page opens; prev/next work; first day has no Prev, last no Next.
- Temporarily test the today-highlight: in DevTools console run
  `document.querySelector('.cal-day[data-date="2026-06-12"]').classList.add('cal-day--today')`
  and confirm the outline appears; click "Jump to today" scrolls to it.

- [ ] **Step 5: Final commit (only if Step 4 surfaced fixes)**

```bash
git add -A trips/2026/germany css/style.css js/main.js
git commit -m "fix(trips): address verification findings for Germany calendar"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** generator+data (T1–T6), data model & seeding (T3), overview grid A (T5), day pages C (T4), today-highlight Berlin (T8), CSS (T7), trips-index link + generation (T9), tests (T1–T6) + verification (T10). German month/weekday labels (T5). English/noindex (T4 head). All spec sections mapped.
- **Placeholders:** none — every code/command step is concrete.
- **Type consistency:** block `kind` values (`note/place/checklist/timing/step/backup/alert/photo`) match between `days.js` (T3), `render.js` (T4), and tests. Helper names (`eachDate/parts/slugFor/weekdayIndexMon/monthGrids`) consistent across T1–T2 and consumers T3–T6. `renderOverview/renderDayPage/renderBlocks` consistent across T4–T6.
- **Data-vs-output:** `days.js` uses `start='2026-06-08'`; the 3 seeded travel days carry flight numbers asserted in T3 and T6.
