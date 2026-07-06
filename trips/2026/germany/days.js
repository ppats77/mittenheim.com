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
  return p ? p.id : null;
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
      ['05:30', 'Leave Oberschleißheim for MUC (~30–40 min drive)'],
      ['06:15', 'At MUC — check-in deadline is 180 min before a US flight'],
      ['09:15', 'Depart Munich (MUC) — DE4304 (operated by German Airways)'],
      ['10:10', 'Arrive Frankfurt (FRA)'],
      ['11:40', 'Depart Frankfurt (FRA) — Condor DE2096'],
      ['14:30', 'Arrive San Francisco (SFO) — same day'],
    ] },
    { kind: 'place', name: '✈️ Condor DE4304 + DE2096 · MUC → FRA → SFO',
      detail: 'MUC 09:15 → FRA 10:10, then FRA 11:40 → SFO 14:30 (11h50m)<br>Economy (Classic) · 1 checked bag (23kg) + 1 carry-on (8kg) each<br>Check-in deadline: 180 min for US flights' },
    { kind: 'checklist', items: [
      'Online check-in 24h before; at MUC allow 180 min (US flight) + 60 min check-in→gate',
      'Pack the night before',
      'Last fridge/trash/keys check at the house',
    ] },
  ],
};

// --- Sat Jun 13: School of Rock visit (Luca) ---
days['2026-06-13'] = {
  title: 'School of Rock — Performance Program',
  phase: 'arrival',
  type: 'plan',
  summary: 'Luca tries the Performance Program at School of Rock München, 13:30.',
  blocks: [
    { kind: 'timing', rows: [
      ['~13:20', 'Arrive a few minutes early to say hello (Patrick suggested)'],
      ['13:30', 'Performance Program — Luca meets the guitar teacher at his level'],
    ] },
    { kind: 'place', name: '🎸 School of Rock Candidplatz',
      detail: 'Candidplatz 1, 81543 München<br>General Manager: Patrick Palmer · 089 38 04 7760<br>ppalmer@schoolofrock.com · schoolofrock.de',
      maps: 'School of Rock Candidplatz 1 München' },
    { kind: 'note', html: '<p>Performance-based music education. Luca will meet the guitar teacher on the right level — a taster of the Performance Program. Come a few minutes early for a chat.</p>' },
  ],
};

// --- Leg 1: France road trip (Chérac, Charente-Maritime) ---
// Sun Jun 14 drive out (direct), stay through Jun 23, Wed Jun 24 drive home.
days['2026-06-14'] = {
  title: 'Drive to Chérac, France',
  phase: 'arrival',
  type: 'travel',
  icon: '🚗',
  summary: 'Long direct drive Oberschleißheim → Chérac (~1,200 km, ~12 h).',
  blocks: [
    { kind: 'place', name: '🚗 Oberschleißheim → Chérac (Charente-Maritime)',
      detail: '~1,200 km · ~12 h driving · direct, no overnight stop<br>Route: A8/A40 via Switzerland or A6 through France — check tolls & vignette' },
    { kind: 'timing', rows: [
      ['Early AM', 'Leave Oberschleißheim — full tank, fresh start'],
      ['Midday', 'Halfway break (lunch + driver swap)'],
      ['Evening', 'Arrive Chérac'],
    ] },
    { kind: 'checklist', items: [
      'Swiss vignette / French tolls (péage) — cash + card ready',
      'Passports/IDs for all four',
      'Snacks, water, playlists, offline maps downloaded',
      'Warnweste (hi-vis vests) + warning triangle in the car (required in France)',
    ] },
  ],
};
days['2026-06-24'] = {
  title: 'Drive back — Chérac → Oberschleißheim',
  phase: 'summer',
  type: 'travel',
  icon: '🚗',
  summary: 'Long direct drive home from Chérac (~1,200 km, ~12 h).',
  blocks: [
    { kind: 'place', name: '🚗 Chérac → Oberschleißheim',
      detail: '~1,200 km · ~12 h driving · direct<br>Leave early to beat traffic and arrive at a reasonable hour' },
    { kind: 'checklist', items: [
      'Full tank before the motorway',
      'Tolls / vignette ready again',
      'Pack the car the night before',
    ] },
  ],
};
// Stay days in Chérac (Jun 15–23): mark as "away" with the location.
for (const iso of eachDate('2026-06-15', '2026-06-23')) {
  const p = parts(iso);
  days[iso] = {
    title: `Chérac — ${p.weekdayEN}, ${p.monthEN} ${p.day}`,
    phase: 'summer',
    type: 'plan',
    summary: 'In Chérac, France.',
    blocks: [
      { kind: 'note', html: '<p>📍 <strong>Chérac, Charente-Maritime, France.</strong> To be planned.</p>' },
    ],
  };
}

// --- Between the trips: Oberschleißheim days (photo-dated via EXIF) ---
days['2026-06-26'] = {
  title: 'At the beekeeper’s — Pfaffenhofen',
  phase: 'summer',
  type: 'plan',
  summary: 'Visiting a beekeeper near Pfaffenhofen a.d. Ilm — open hives, honeycomb in hand.',
  blocks: [
    { kind: 'note', html: '<p>🐝 An afternoon at a beekeeper&rsquo;s garden up near <strong>Pfaffenhofen an der Ilm</strong> — hives open, a frame of honeycomb straight out of the box, bees everywhere and nobody stung.</p>' },
    { kind: 'photo', src: '/trips/2026/germany/photos/pfaffenhofen-imker.jpg', alt: 'The beekeeper lifting a honeycomb frame out of the hive' },
  ],
};
days['2026-06-27'] = {
  title: 'Biergarten evening — Oberschleißheim',
  phase: 'summer',
  type: 'plan',
  summary: 'Classic Bavarian beer garden night — lanterns, Maß and dancing between the tables.',
  blocks: [
    { kind: 'note', html: '<p>🍻 Saturday night at the beer garden in <strong>Oberschleißheim</strong> — lanterns under the chestnut trees, Weißbier and Maßkrüge on the benches, and couples dancing between the tables as the sun went down.</p>' },
    { kind: 'photo', src: '/trips/2026/germany/photos/oberschleissheim-biergarten.jpg', alt: 'Beer garden at dusk, lanterns lit, dancing by the trees' },
  ],
};
days['2026-06-30'] = {
  title: 'Last evening before the northern loop',
  phase: 'summer',
  type: 'plan',
  summary: 'Evening walk through the green lanes of Oberschleißheim; packing for the road.',
  blocks: [
    { kind: 'note', html: '<p>🚶 A last evening walk through the hedge-lined lanes of <strong>Oberschleißheim</strong> before packing the car — tomorrow the northern loop starts: Oldenburg &rarr; Nordfriesland &rarr; Berlin.</p>' },
    { kind: 'photo', src: '/trips/2026/germany/photos/oberschleissheim-lane.jpg', alt: 'The three walking a green hedge-lined lane in Oberschleissheim' },
  ],
};

// --- Leg 2: Northern loop (Oldenburg → Klanxbüll → Berlin) ---
// Wed Jul 1 → Oldenburg (3 nts), Sat Jul 4 → Klanxbüll (3 nts), Tue Jul 7 → Berlin (3 nts), Fri Jul 10 home.
days['2026-07-01'] = {
  title: 'Drive to Oldenburg — gelato on arrival',
  phase: 'summer',
  type: 'travel',
  icon: '🚗',
  summary: 'Oberschleißheim → Oldenburg (~700 km). Evening gelato stroll through the Altstadt.',
  blocks: [
    { kind: 'place', name: '🚗 Oberschleißheim → Oldenburg',
      detail: '~700 km · ~7 h driving<br>3 nights in Oldenburg (Jul 1–4)' },
    { kind: 'note', html: '<p>Made it north — and straight out for ice cream. An evening stroll through the <strong>Oldenburg Altstadt</strong>: gelato by the old Rathaus, past Caf&eacute; &amp; Bar Celona, and down the lane where umbrellas and lanterns hang overhead between the buildings.</p>' },
    { kind: 'photo', src: '/trips/2026/germany/photos/oldenburg-eis.jpg', alt: 'Ice cream on the walk through the Oldenburg old town' },
    { kind: 'photo', src: '/trips/2026/germany/photos/oldenburg-ratskeller.jpg', alt: 'Evening square by the Ratskeller with cafe umbrellas' },
    { kind: 'photo', src: '/trips/2026/germany/photos/oldenburg-umbrellas.jpg', alt: 'Umbrellas and lanterns strung over an Oldenburg lane at dusk' },
  ],
};
days['2026-07-02'] = {
  title: 'Oldenburg — canal, trains & the Schloss',
  phase: 'summer',
  type: 'plan',
  summary: 'Barges on the canal at the Cäcilienbrücke, trainspotting at the Hauptbahnhof, then the Schlossplatz.',
  blocks: [
    { kind: 'note', html: '<p>📍 <strong>Oldenburg.</strong> A slow loop through town: watching the barge <em>Emelie&nbsp;D</em> squeeze up the canal at the C&auml;cilienbr&uuml;cke, a detour through the Hauptbahnhof with its timbered platform roofs, and across the cobbled Schlossplatz past the yellow baroque Oldenburger Schloss (now the Landesmuseum).</p>' },
    { kind: 'photo', src: '/trips/2026/germany/photos/oldenburg-kanal.jpg', alt: 'The barge Emelie D passing the canal walls at the Caecilienbruecke' },
    { kind: 'photo', src: '/trips/2026/germany/photos/oldenburg-hunte-luca.jpg', alt: 'Luca windblown at the canal railing' },
    { kind: 'photo', src: '/trips/2026/germany/photos/oldenburg-bahnhof.jpg', alt: 'Watching an Intercity pull in under the wooden platform canopy of Oldenburg Hbf' },
    { kind: 'photo', src: '/trips/2026/germany/photos/oldenburg-schloss.jpg', alt: 'Crossing the cobbled Schlossplatz in front of the yellow Oldenburger Schloss' },
    { kind: 'place', name: '🏰 Oldenburger Schloss', detail: 'Schlossplatz 26, 26122 Oldenburg<br>Landesmuseum für Kunst und Kulturgeschichte', maps: 'Oldenburger Schloss Schlossplatz Oldenburg' },
  ],
};
days['2026-07-03'] = {
  title: 'Day trip to Bremen',
  phase: 'summer',
  type: 'plan',
  summary: 'Bremen Altstadt: Marktplatz, Rathaus, Dom & the Town Musicians.',
  blocks: [
    { kind: 'note', html: '<p>📍 <strong>Bremen</strong> — an easy hop from Oldenburg (~45 min). The UNESCO-listed Marktplatz with the Rathaus and St.&nbsp;Petri Dom, the Liebfrauenkirche, and of course the <em>Bremer Stadtmusikanten</em> — donkey, dog, cat and rooster. Grabbing the donkey&rsquo;s front legs with both hands is supposed to make a wish come true. Then postcard-browsing in the crooked lanes of the <strong>Schnoor</strong> quarter — and Luca made a friend: a giant Ukrainian bear 💙💛 by the Dom.</p>' },
    { kind: 'photo', src: '/trips/2026/germany/photos/bremen-rathaus-dom.jpg', alt: 'Bremen Marktplatz with the Rathaus and the twin spires of St. Petri Dom' },
    { kind: 'photo', src: '/trips/2026/germany/photos/bremen-stadtmusikanten.jpg', alt: 'Natalia, Phima and Luca at the Bremen Town Musicians statue' },
    { kind: 'photo', src: '/trips/2026/germany/photos/bremen-baer.jpg', alt: 'Luca thumbs-up with a giant Ukrainian bear by the Dom' },
    { kind: 'photo', src: '/trips/2026/germany/photos/bremen-liebfrauenkirche.jpg', alt: 'The Liebfrauenkirche with cafe umbrellas on the square' },
    { kind: 'photo', src: '/trips/2026/germany/photos/bremen-schnoor.jpg', alt: 'Postcard browsing in the lanes of the Schnoor quarter' },
    { kind: 'photo', src: '/trips/2026/germany/photos/bremen-marktplatz.jpg', alt: 'Wandering the square by the Liebfrauenkirche' },
    { kind: 'place', name: '🎺 Bremer Stadtmusikanten', detail: 'Am Markt / west side of the Rathaus, 28195 Bremen<br>Bronze by Gerhard Marcks (1951)', maps: 'Bremer Stadtmusikanten Rathaus Bremen' },
  ],
};
days['2026-07-04'] = {
  title: 'Drive to Klanxbüll (Nordfriesland)',
  phase: 'summer',
  type: 'travel',
  icon: '🚗',
  summary: 'Oldenburg → Klanxbüll (~230 km, ~2.5 h). 3 nights near the North Sea.',
  blocks: [
    { kind: 'place', name: '🚗 Oldenburg → Klanxbüll',
      detail: '~230 km · ~2.5 h driving<br>3 nights in Klanxbüll, Nordfriesland (Jul 4–7) — last stop before the Hindenburgdamm to Sylt, near Niebüll & the North Sea coast' },
    { kind: 'note', html: '<p>Short hop north. Klanxbüll is the base for Sylt / Wadden Sea day trips.</p>' },
  ],
};
days['2026-07-05'] = {
  title: 'Day trip to Sylt — Westerland',
  phase: 'summer',
  type: 'plan',
  summary: 'Train over the Hindenburgdamm to Westerland: Friedrichstraße, the sea promenade, sunset back at the house.',
  blocks: [
    { kind: 'note', html: '<p>🏝️ By train across the <strong>Hindenburgdamm</strong> to <strong>Sylt</strong> — the causeway where the railway runs right through the Wadden Sea. Wandered Westerland&rsquo;s Friedrichstra&szlig;e, then out to the sea promenade: North Sea wind, whitecaps and seagulls. Phima read the whole train ride home; the day ended with pink clouds over the meadow behind the house.</p>' },
    { kind: 'photo', src: '/trips/2026/germany/photos/sylt-westerland.jpg', alt: 'The three walking Friedrichstrasse in Westerland, Sylt' },
    { kind: 'photo', src: '/trips/2026/germany/photos/sylt-promenade.jpg', alt: 'Windblown on the Westerland sea promenade' },
    { kind: 'photo', src: '/trips/2026/germany/photos/marschbahn-zug.jpg', alt: 'Phima reading on the train back across the Hindenburgdamm' },
    { kind: 'photo', src: '/trips/2026/germany/photos/abendsonne-wiese.jpg', alt: 'Sunset over the meadow behind the holiday house' },
    { kind: 'place', name: '🏖️ Westerland, Sylt', detail: 'Friedrichstraße & Strandpromenade, 25980 Westerland<br>Train from Klanxbüll over the Hindenburgdamm (~40 min)', maps: 'Westerland Sylt Friedrichstrasse' },
  ],
};
days['2026-07-06'] = {
  title: 'Across the border — Tønder, Denmark',
  phase: 'summer',
  type: 'plan',
  summary: 'Morning at the thatched house, a walk in Aventoft on the border, rainy afternoon in Tønder 🇩🇰.',
  blocks: [
    { kind: 'note', html: '<p>📍 A slow morning at the thatched-roof holiday house, then a walk through <strong>Aventoft</strong> — the last village before Denmark — and across the border to <strong>Tønder</strong>. Cobbled pedestrian streets under Dannebrog bunting, umbrellas out all afternoon. Just missed the T&oslash;nder Marked &amp; Oldtimer-Treffen (Jul 4, per the events board in the Midtby).</p>' },
    { kind: 'photo', src: '/trips/2026/germany/photos/ferienhaus-reetdach.jpg', alt: 'Natalia at the thatched brick holiday house, fields behind' },
    { kind: 'photo', src: '/trips/2026/germany/photos/aventoft-spaziergang.jpg', alt: 'Walking the lanes of Aventoft by the Danish border' },
    { kind: 'photo', src: '/trips/2026/germany/photos/aventoft-country-road.jpg', alt: 'Phima and Luca on a country lane in Aventoft' },
    { kind: 'photo', src: '/trips/2026/germany/photos/toender-flags.jpg', alt: 'Tønder pedestrian street under Danish flag bunting' },
    { kind: 'photo', src: '/trips/2026/germany/photos/toender-street.jpg', alt: 'Umbrellas out on the cobbles of Tønder Midtby' },
    { kind: 'photo', src: '/trips/2026/germany/photos/toender-storegade.jpg', alt: 'Storegade under Dannebrog bunting, purple umbrella leading the way' },
    { kind: 'photo', src: '/trips/2026/germany/photos/toender-events.jpg', alt: 'Events i Toender Midtby 2026 board' },
    { kind: 'photo', src: '/trips/2026/germany/photos/toender-garden.jpg', alt: 'A rainy garden allee stroll' },
    { kind: 'place', name: '🇩🇰 Tønder Midtby', detail: 'Storegade / Vestergade pedestrian zone, 6270 Tønder, Denmark<br>~20 min drive from the house', maps: 'Toender Denmark Storegade' },
  ],
};
days['2026-07-07'] = {
  title: 'Drive to Berlin — Hotel Sachsenhof',
  phase: 'summer',
  type: 'travel',
  icon: '🚗',
  summary: 'Klanxbüll → Berlin (~470 km, ~5 h). Hotel Sachsenhof, 3 nights.',
  blocks: [
    { kind: 'place', name: '🚗 Klanxbüll → Berlin',
      detail: '~470 km · ~5 h driving' },
    { kind: 'place', name: '🏨 Hotel Sachsenhof, Berlin',
      detail: 'Motzstr. 7, Tempelhof-Schöneberg, 10777 Berlin<br>Check-in Tue Jul 7 (from 3:00 PM) · Check-out Fri Jul 10 (by 12:00 PM)<br>Quadruple Room · 2 adults + 2 kids (13, 15) · 3 nights<br>Confirmation 6622466272 · Tel +49 30 2162074',
      maps: 'Hotel Sachsenhof Motzstrasse 7 Berlin' },
    { kind: 'checklist', items: [
      'Booking confirmation 6622466272 + PIN handy at check-in',
      'Breakfast is €14 pp/night (pay at property if you want it)',
      'Pay at property on arrival',
    ] },
  ],
};
for (const iso of eachDate('2026-07-08', '2026-07-09')) {
  const p = parts(iso);
  days[iso] = {
    title: `Berlin — ${p.weekdayEN}, ${p.monthEN} ${p.day}`,
    phase: 'summer',
    type: 'plan',
    summary: 'In Berlin (Hotel Sachsenhof).',
    blocks: [
      { kind: 'note', html: '<p>📍 <strong>Berlin</strong> — based at Hotel Sachsenhof, Schöneberg. To be planned.</p>' },
    ],
  };
}
days['2026-07-10'] = {
  title: 'Drive back — Berlin → Oberschleißheim',
  phase: 'summer',
  type: 'travel',
  icon: '🚗',
  summary: 'Berlin → Oberschleißheim (~590 km, ~6 h). Check out by 12:00.',
  blocks: [
    { kind: 'timing', rows: [
      ['Until 12:00', 'Check out of Hotel Sachsenhof'],
      ['Midday', 'Drive south (~590 km, ~6 h)'],
      ['Evening', 'Home in Oberschleißheim'],
    ] },
    { kind: 'place', name: '🚗 Berlin → Oberschleißheim',
      detail: '~590 km · ~6 h driving · mostly A9' },
  ],
};

// --- Leg 3: Italy (Ravenna → Crema) ---
// Mon Jul 20 drive to Ravenna, stay through Jul 26, Mon Jul 27 → Crema (2 nts), Wed Jul 29 drive home.
days['2026-07-20'] = {
  title: 'Drive to Ravenna, Italy',
  phase: 'summer',
  type: 'travel',
  icon: '🚗',
  summary: 'Oberschleißheim → Ravenna over the Brenner (~580 km, ~7 h).',
  blocks: [
    { kind: 'place', name: '🚗 Oberschleißheim → Ravenna',
      detail: '~580 km · ~7 h driving · via the Brenner Pass (A22)<br>Through Austria & over the Alps into Emilia-Romagna' },
    { kind: 'timing', rows: [
      ['Early AM', 'Leave Oberschleißheim — full tank'],
      ['~2.5 h', 'Brenner Pass — Austrian + Italian motorway tolls'],
      ['Afternoon', 'Arrive Ravenna (Adriatic coast)'],
    ] },
    { kind: 'checklist', items: [
      'Austrian vignette + Brenner toll; Italian autostrada tolls (Telepass/card)',
      'Warnweste (hi-vis) + warning triangle — required in Italy & Austria',
      'Passports/IDs; snacks, water, offline maps',
      'A/C check — it will be hot on the Adriatic',
    ] },
  ],
};
// Stay days in Ravenna (Jul 21–26): mark as "away" with the location.
for (const iso of eachDate('2026-07-21', '2026-07-26')) {
  const p = parts(iso);
  days[iso] = {
    title: `Ravenna — ${p.weekdayEN}, ${p.monthEN} ${p.day}`,
    phase: 'summer',
    type: 'plan',
    summary: 'In Ravenna, Italy.',
    blocks: [
      { kind: 'note', html: '<p>📍 <strong>Ravenna, Emilia-Romagna, Italy.</strong> Byzantine mosaics, Adriatic beaches nearby. To be planned.</p>' },
    ],
  };
}
days['2026-07-27'] = {
  title: 'Drive to Crema — Apartment da Irma in terrazza',
  phase: 'summer',
  type: 'travel',
  icon: '🚗',
  summary: 'Ravenna → Crema (Lombardy, ~290 km, ~3 h). Apartment, 2 nights.',
  blocks: [
    { kind: 'place', name: '🚗 Ravenna → Crema',
      detail: '~290 km · ~3 h driving' },
    { kind: 'place', name: '🏠 Apartment "da Irma in terrazza", Crema',
      detail: 'Via Stazione 112, 1° piano, 26013 Crema, Italy<br>Check-in Mon Jul 27 (3:00–6:00 PM) · Check-out Wed Jul 29 (8:00–10:00 AM)<br>Two-Bedroom Apartment · 2 adults + 2 kids (13, 15) · 2 nights<br>Host: +39 347 768 6561 · Confirmation 6913995215<br>Someone will meet you there to hand over the keys',
      maps: 'Via Stazione 112 Crema Italy' },
    { kind: 'checklist', items: [
      'Confirmation 6913995215 + PIN handy; host meets you at check-in',
      'Tassa di soggiorno: €2 per person per night, cash on arrival (max 3 nights)',
      'Already paid via Booking.com (€227.46 incl. cleaning fee) — no further payment due',
      'Free cancellation was until Jul 12',
    ] },
  ],
};
days['2026-07-28'] = {
  title: 'Crema — Tuesday, July 28',
  phase: 'summer',
  type: 'plan',
  summary: 'In Crema, Lombardy.',
  blocks: [
    { kind: 'note', html: '<p>📍 <strong>Crema, Lombardy</strong> — the town from <em>Call Me By Your Name</em>. Based at the apartment on Via Stazione. To be planned.</p>' },
  ],
};
days['2026-07-29'] = {
  title: 'Drive back — Crema → Oberschleißheim',
  phase: 'summer',
  type: 'travel',
  icon: '🚗',
  summary: 'Check out (by 10:00), drive Crema → Oberschleißheim (~525 km, ~5.5 h).',
  blocks: [
    { kind: 'timing', rows: [
      ['08:00–10:00', 'Check out of the apartment'],
      ['Morning', 'Drive north over the Alps (~525 km, ~5.5 h)'],
      ['Evening', 'Home in Oberschleißheim'],
    ] },
    { kind: 'place', name: '🚗 Crema → Oberschleißheim',
      detail: '~525 km · ~5.5 h driving · via the Brenner or the Gotthard/San Bernardino' },
    { kind: 'checklist', items: [
      'Settle tassa di soggiorno + return keys',
      'Full tank + tolls/vignette before the motorway',
    ] },
  ],
};

// --- Work-status overlays (layer on top of whatever each day already is) ---
// A day keeps its travel/away/open type & summary; `work` adds a corner badge.
const REMOTE_WEEKS = [
  ['2026-06-08', '2026-06-12'],
  ['2026-07-13', '2026-07-17'],
  ['2026-07-27', '2026-07-31'],
  ['2026-08-03', '2026-08-07'],
];
const VACATION_DAYS = [
  ['2026-06-16', '2026-06-18'],
  ['2026-06-23', '2026-06-25'],
  ['2026-06-30', '2026-07-02'],
  ['2026-07-07', '2026-07-09'],
  ['2026-07-21', '2026-07-23'],
];
const HOLIDAYS = {
  '2026-06-19': 'Juneteenth (US holiday)',
  '2026-07-03': 'Independence Day off (US)',
};

for (const [a, b] of REMOTE_WEEKS) for (const iso of eachDate(a, b)) if (days[iso]) days[iso].work = 'remote';
for (const [a, b] of VACATION_DAYS) for (const iso of eachDate(a, b)) if (days[iso]) days[iso].work = 'off';
for (const iso of Object.keys(HOLIDAYS)) if (days[iso]) { days[iso].work = 'holiday'; days[iso].workNote = HOLIDAYS[iso]; }

module.exports = { name: 'Summer in Germany 2026', base: 'Oberschleißheim',
  tz: 'Europe/Berlin', travelers: 'Max, Natalia, Seraphima & Luca',
  start: START, end: END, phases, days };
