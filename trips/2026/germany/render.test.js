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
