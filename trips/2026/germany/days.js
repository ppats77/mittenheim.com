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
