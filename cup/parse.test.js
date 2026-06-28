'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { parse } = require('./parse.js');

const matches = parse(path.join(__dirname, 'World_Cup_2026_Schedule.md'));

test('parses all 104 matches', () => {
  assert.strictEqual(matches.length, 104);
});

test('round counts match the bracket structure', () => {
  const by = {};
  for (const m of matches) by[m.round] = (by[m.round] || 0) + 1;
  assert.strictEqual(by['Group Stage'], 72);
  assert.strictEqual(by['Round of 32'], 16);
  assert.strictEqual(by['Round of 16'], 8);
  assert.strictEqual(by['Quarter-finals'], 4);
  assert.strictEqual(by['Semi-finals'], 2);
  assert.strictEqual(by['Third-Place Play-off'], 1);
  assert.strictEqual(by['Final'], 1);
});

test('CET spill: late ET games air on the next German day', () => {
  // "South Korea v Czech Republic" is 10 PM ET Jun 11 -> 4 AM CET Jun 12
  const m = matches.find((x) => x.match === 'South Korea v Czech Republic');
  assert.ok(m);
  assert.strictEqual(m.etDate, '2026-06-11');
  assert.strictEqual(m.cetDate, '2026-06-12');
  assert.strictEqual(m.cetTime, '4:00 AM');
});

test('non-spill: evening CET games stay on the section date', () => {
  const m = matches.find((x) => x.match === 'Mexico v South Africa');
  assert.strictEqual(m.cetDate, '2026-06-11');
  assert.strictEqual(m.cetTime, '9:00 PM');
});

test('flags Germany matches via home or away', () => {
  const ger = matches.filter((x) => x.isGermany).map((x) => x.match);
  assert.deepStrictEqual(ger, [
    'Germany v Curacao',
    'Germany v Ivory Coast',
    'Ecuador v Germany',
    'Germany v Paraguay',
  ]);
});

test('every match has the fields the renderers need', () => {
  for (const m of matches) {
    for (const k of ['cetDate', 'cetTime', 'etTime', 'match', 'home', 'away', 'venue', 'round']) {
      assert.ok(m[k] !== undefined && m[k] !== '', `missing ${k} in ${JSON.stringify(m)}`);
    }
    assert.match(m.cetDate, /^2026-\d\d-\d\d$/);
  }
});
