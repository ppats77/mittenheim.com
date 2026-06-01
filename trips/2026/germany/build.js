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
