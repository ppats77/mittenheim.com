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
  assert.doesNotMatch(first, /&larr; Prev/);
  assert.match(first, /Next &rarr;/);
});

test('renderBlock step renders nested blocks recursively with open toggle', () => {
  const html = render.renderBlock({
    kind: 'step', time: '09:00', label: 'Morning', open: true,
    blocks: [{ kind: 'note', html: '<p>inner</p>' }],
  });
  assert.match(html, /<details class="trip-step" open>/);
  assert.match(html, /trip-step__time/);
  assert.match(html, /trip-step__body/);
  assert.match(html, /<p>inner<\/p>/);          // nested block rendered
  // closed by default when open is falsy
  const closed = render.renderBlock({ kind: 'step', label: 'X', blocks: [] });
  assert.match(closed, /<details class="trip-step">/);
  assert.doesNotMatch(closed, / open>/);
});

test('escaping boundary: title is escaped, author HTML blocks are not', () => {
  // title goes through esc()
  const page = render.renderDayPage({ trip: { name: 'T' }, iso: '2026-06-10',
    day: { title: 'A < B & C', phase: 'x', type: 'plan', summary: '', blocks: [] },
    prevSlug: null, nextSlug: null, weekday: 'Wednesday', monthEN: 'June', dayNum: 10 });
  assert.match(page, /A &lt; B &amp; C/);       // title escaped
  // note.html passes through verbatim (author-trusted)
  const note = render.renderBlocks([{ kind: 'note', html: '<p><strong>hi</strong></p>' }]);
  assert.match(note, /<p><strong>hi<\/strong><\/p>/);
});

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

test('renderOverview uses a custom day.icon, defaults travel days to a plane', () => {
  const trip = {
    name: 'T', base: 'B', travelers: 'X', start: '2026-06-08', end: '2026-06-09',
    days: {
      '2026-06-08': { title: 'Drive', type: 'travel', icon: '🚗', summary: '', blocks: [] },
      '2026-06-09': { title: 'Fly', type: 'travel', summary: '', blocks: [] },
    },
  };
  const html = render.renderOverview(trip);
  // June 8 cell shows the custom car icon
  assert.match(html, /data-date="2026-06-08"[^>]*><span class="cal-day__num">8 🚗</);
  // June 9 cell falls back to the plane entity
  assert.match(html, /data-date="2026-06-09"[^>]*><span class="cal-day__num">9 &#9992;</);
});

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
