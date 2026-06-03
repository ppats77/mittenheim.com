'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const render = require('./render.js');
const lib = require('./lib.js');

const sample = [
  { cetDate: '2026-06-14', cetTime: '7:00 PM', etTime: '1:00 PM', match: 'Germany v Curacao',
    home: 'Germany', away: 'Curacao', group: 'Group E', round: 'Group Stage', venue: 'Houston', isGermany: true },
  { cetDate: '2026-06-14', cetTime: '10:00 PM', etTime: '4:00 PM', match: 'Netherlands v Japan',
    home: 'Netherlands', away: 'Japan', group: 'Group F', round: 'Group Stage', venue: 'Dallas', isGermany: false },
  { cetDate: '2026-06-12', cetTime: '4:00 AM', etTime: '10:00 PM', match: 'South Korea v Czech Republic',
    home: 'South Korea', away: 'Czech Republic', group: 'Group A', round: 'Group Stage', venue: 'Guadalajara', isGermany: false },
];

test('withChannels attaches channel data and rejects unknown fixtures', () => {
  const ok = lib.withChannels(sample, { 'Germany v Curacao|2026-06-14': { de: 'ARD', deConf: 'confirmed' } });
  const g = ok.find((m) => m.match === 'Germany v Curacao');
  assert.deepStrictEqual(g.channels, { de: 'ARD', deConf: 'confirmed' });
  // a match with no entry has no channels key
  assert.strictEqual(ok.find((m) => m.match === 'Netherlands v Japan').channels, undefined);
  // unknown fixture key throws (keeps channel data honest)
  assert.throws(() => lib.withChannels(sample, { 'Bogus v Team|2026-06-14': { de: 'ARD' } }), /unknown fixture/);
});

test('renderChannels: confirmed, expected, and TBC states', () => {
  assert.match(render.renderChannels({ de: 'ARD', deConf: 'confirmed', uk: 'ITV', ukConf: 'confirmed' }), /ARD/);
  assert.match(render.renderChannels({ de: 'ARD', deConf: 'confirmed', uk: 'ITV', ukConf: 'confirmed' }), /cup-chan--confirmed/);
  assert.match(render.renderChannels({ de: 'ARD', deConf: 'expected' }), /exp\./);
  assert.match(render.renderChannels({ de: 'ARD', deConf: 'expected' }), /cup-chan--tbc/); // UK missing -> TBC chip
  assert.match(render.renderChannels(undefined), /TBC/); // no data at all
});

test('groupByCetDate sorts days and matches by kickoff', () => {
  const days = lib.groupByCetDate(sample);
  assert.strictEqual(days.length, 2);
  assert.strictEqual(days[0].iso, '2026-06-12'); // earlier date first
  assert.strictEqual(days[1].iso, '2026-06-14');
  // within Jun 14, 7 PM before 10 PM
  assert.strictEqual(days[1].matches[0].cetTime, '7:00 PM');
  assert.strictEqual(days[1].matches[1].cetTime, '10:00 PM');
});

test('renderPage produces full doc with day anchors + germany accent', () => {
  const html = render.renderPage(sample);
  assert.match(html, /^<!DOCTYPE html>/);
  assert.match(html, /<\/html>\s*$/);
  assert.match(html, /noindex, nofollow/);
  assert.match(html, /id="cup-calendar"/);           // calendar container for JS filtering
  assert.match(html, /id="cup-show-all"/);           // full-schedule toggle
  assert.match(html, /class="cup-day" data-date="2026-06-14"/); // day anchor for JS date filter
  assert.match(html, /cup-match--germany/);          // Germany match flagged
  assert.match(html, /Germany v Curacao/);
  assert.match(html, /1:00 PM ET/);                  // ET shown
  assert.match(html, /og:url" content="https:\/\/mittenheim.com\/cup\/"/);
  // "How to watch" section covers both Germany (ARD/ZDF) and UK (BBC/ITV) channels
  assert.match(html, /How to watch/);
  assert.match(html, /ARD/);
  assert.match(html, /ZDF/);
  assert.match(html, /BBC One/);
  assert.match(html, /ITV1/);
});

test('build.js writes index.html into target dir', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cup-build-'));
  execFileSync('node', [path.join(__dirname, 'build.js'), '--out', tmp], { stdio: 'pipe' });
  const html = fs.readFileSync(path.join(tmp, 'index.html'), 'utf8');
  assert.match(html, /World Cup 2026/);
  // real data has all 3 Germany games
  assert.ok((html.match(/cup-match--germany/g) || []).length >= 3);
  fs.rmSync(tmp, { recursive: true, force: true });
});
