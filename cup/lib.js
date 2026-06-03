'use strict';
// Helpers for the World Cup page: group matches by their German (CET) air-date
// and sort within a day by kickoff time.

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function toDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function dayLabel(iso) {
  const dt = toDate(iso);
  return {
    weekday: WEEKDAYS_EN[dt.getUTCDay()],
    monthEN: MONTHS_EN[dt.getUTCMonth()],
    day: dt.getUTCDate(),
  };
}

// "9:00 PM" / "4:00 AM" -> minutes since midnight (for sorting within a day)
function timeToMinutes(t) {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (/PM/i.test(m[3])) h += 12;
  return h * 60 + Number(m[2]);
}

// Group matches by cetDate (German air-date), each group's matches sorted by CET time.
function groupByCetDate(matches) {
  const byDate = new Map();
  for (const m of matches) {
    if (!byDate.has(m.cetDate)) byDate.set(m.cetDate, []);
    byDate.get(m.cetDate).push(m);
  }
  const dates = [...byDate.keys()].sort();
  return dates.map((iso) => ({
    iso,
    ...dayLabel(iso),
    matches: byDate.get(iso).slice().sort((a, b) => timeToMinutes(a.cetTime) - timeToMinutes(b.cetTime)),
  }));
}

module.exports = { groupByCetDate, dayLabel, timeToMinutes, toDate, WEEKDAYS_EN, MONTHS_EN };
