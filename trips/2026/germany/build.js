#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const lib = require('./lib.js');
const render = require('./render.js');
const trip = require('./days.js');

// World Cup matches (with TV channels), grouped by the German (CET) day they air on.
const cupLib = require('../../../cup/lib.js');
const cupMatches = cupLib.withChannels(require('../../../cup/matches.js'), require('../../../cup/channels.js'));
const matchesByDate = {};
for (const m of cupMatches) {
  (matchesByDate[m.cetDate] = matchesByDate[m.cetDate] || []).push(m);
}
// Sort each day's matches by CET kickoff time.
for (const d of Object.keys(matchesByDate)) {
  matchesByDate[d].sort((a, b) => cupLib.timeToMinutes(a.cetTime) - cupLib.timeToMinutes(b.cetTime));
}
const matchDates = new Set(Object.keys(matchesByDate));

function outDir() {
  // No --out: write into this source dir (used by Task 9 to generate the live site).
  // With --out <dir>: write elsewhere (used by tests to generate into a temp dir).
  const i = process.argv.indexOf('--out');
  if (i === -1) return __dirname;
  const dir = process.argv[i + 1];
  if (!dir) {
    console.error('--out requires a directory argument');
    process.exit(1);
  }
  return dir;
}

function write(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function main() {
  const out = outDir();
  const dates = lib.eachDate(trip.start, trip.end);

  // Overview
  write(path.join(out, 'index.html'), render.renderOverview(trip, { matchDates }));

  // Day pages
  dates.forEach((iso, idx) => {
    const p = lib.parts(iso);
    const slug = lib.slugFor(iso);
    const html = render.renderDayPage({
      trip, iso, day: trip.days[iso],
      prevSlug: idx > 0 ? lib.slugFor(dates[idx - 1]) : null,
      nextSlug: idx < dates.length - 1 ? lib.slugFor(dates[idx + 1]) : null,
      weekday: p.weekdayEN, monthEN: p.monthEN, dayNum: p.day,
      matches: matchesByDate[iso],
    });
    write(path.join(out, slug, 'index.html'), html);
  });

  console.log(`Generated overview + ${dates.length} day pages into ${out}`);
}

main();
