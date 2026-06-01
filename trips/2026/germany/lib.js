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
  for (let cur = toDate(startISO); cur <= end; ) {
    out.push(toISO(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
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
    const p = parts(first);
    return {
      key,
      monthEN: p.monthEN,
      year: p.year,
      leadingBlanks: weekdayIndexMon(first),
      dates: monthDates,
    };
  });
}

module.exports = { eachDate, parts, slugFor, weekdayIndexMon, monthGrids, MONTHS_EN, WEEKDAYS_EN };
