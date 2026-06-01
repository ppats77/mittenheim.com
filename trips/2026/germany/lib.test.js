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

test('parts returns UTC-based weekday/month labels', () => {
  const p = lib.parts('2026-06-08');
  assert.strictEqual(p.weekdayEN, 'Monday');
  assert.strictEqual(p.monthEN, 'June');
  assert.strictEqual(p.month, 6);
  assert.strictEqual(p.day, 8);
  assert.strictEqual(p.year, 2026);
});

test('weekdayIndexMon: Monday=0 .. Sunday=6', () => {
  assert.strictEqual(lib.weekdayIndexMon('2026-06-08'), 0); // Mon
  assert.strictEqual(lib.weekdayIndexMon('2026-07-01'), 2); // Wed
  assert.strictEqual(lib.weekdayIndexMon('2026-08-01'), 5); // Sat
});

test('eachDate returns exactly one date for a single-day range', () => {
  const dates = lib.eachDate('2026-06-08', '2026-06-08');
  assert.strictEqual(dates.length, 1);
  assert.strictEqual(dates[0], '2026-06-08');
});

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
