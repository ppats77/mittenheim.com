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
  title: 'Drive to Berlin — Döner & Brandenburg Gate at dusk',
  phase: 'summer',
  type: 'travel',
  icon: '🚗',
  summary: 'Klanxbüll → Berlin (~470 km). Check in ~16:00, Döner in Schöneberg, golden-hour walk to the Brandenburg Gate.',
  blocks: [
    { kind: 'place', name: '🚗 Klanxbüll → Berlin',
      detail: '~470 km · ~5 h driving' },
    { kind: 'place', name: '🏨 Hotel Sachsenhof, Berlin',
      detail: 'Motzstr. 7, Tempelhof-Schöneberg, 10777 Berlin<br>Check-in Tue Jul 7 (from 3:00 PM) · Check-out Fri Jul 10 (by 12:00 PM)<br>Quadruple Room · 2 adults + 2 kids (13, 15) · 3 nights<br>Confirmation 6622466272 · Tel +49 30 2162074',
      maps: 'Hotel Sachsenhof Motzstrasse 7 Berlin' },
    { kind: 'note', html: '<p>🚇 <strong>Getting around:</strong> park the car and forget it — <strong>Nollendorfplatz U-Bahn (U1/U2/U3/U4) is 3 minutes from the hotel</strong>, and the <strong>U2 line goes almost everywhere on our list</strong> (Potsdamer Platz, Checkpoint Charlie area, Alexanderplatz). Best ticket: the <strong>24-h small-group ticket, zone AB (&ldquo;24-Stunden-Karte Kleingruppe&rdquo;, ~&euro;33)</strong> — covers up to 5 people, cheaper than four singles after 3 rides. Buy it in the BVG Tickets app, or validate (stamp) paper tickets before boarding. Tip: activate it in the evening and it still covers most of the next day. The car stays as backup — Schöneberg streets are paid-parking zones, so ask reception where to leave it for the stay.</p>' },
    { kind: 'timing', rows: [
      ['~16:00', 'Check in, drop bags, feet up 30 min'],
      ['17:30', 'Early dinner: Rüyam Gemüse Kebab, Hauptstr. 26 (~15 min walk) — Döner was invented in Berlin, and this is one of the best, minus Mustafa&rsquo;s queue'],
      ['19:00', 'Stroll back via Wittenbergplatz — peek at KaDeWe (continental Europe&rsquo;s biggest department store)'],
      ['19:45', 'U2 Nollendorfplatz → Potsdamer Platz (4 stops) — Wall slabs outside the station, futuristic Sony Center'],
      ['20:30', 'Walk through the Holocaust Memorial stelae field'],
      ['21:00', 'Brandenburg Gate at golden hour (sunset ~21:30) — then the Reichstag lawn next door'],
      ['22:00', 'U2 back from Potsdamer Platz'],
    ] },
    { kind: 'place', name: '🥙 Rüyam Gemüse Kebab', detail: 'Hauptstr. 26, 10827 Berlin-Schöneberg<br>~15 min walk from the hotel · cash-friendly, fast queue', maps: 'Rueyam Gemuese Kebab Hauptstrasse 26 Berlin' },
    { kind: 'checklist', items: [
      'Booking confirmation 6622466272 + PIN handy at check-in',
      'Pay at property on arrival · breakfast €14 pp/night if wanted',
      'TONIGHT: book the free Reichstag dome slots at bundestag.de for Thu ~20:30 (passport data needed for all four; if online is full, the visitors&rsquo; pavilion next to the Reichstag sells same-day slots from 8:00)',
      'Install the BVG Tickets app + grab the 24-h Kleingruppe AB ticket',
      'Book DDR Museum online for Wed afternoon (skips the queue)',
      'Ask reception about parking the car for the whole stay',
    ] },
    { kind: 'stories', title: 'Tonight&rsquo;s backstories — read on the drive', ids: ['brandenburger-tor', 'holocaust-mahnmal', 'kadewe', 'berlin-food'] },
  ],
};
days['2026-07-08'] = {
  title: 'East Berlin day — the Wall, DDR & Karl-Marx-Allee',
  phase: 'summer',
  type: 'plan',
  summary: 'Wall Memorial at Bernauer Straße, Currywurst at Konnopke’s, DDR Museum, Stalinist boulevards. Dinner at Berlin’s oldest restaurant (1621).',
  blocks: [
    { kind: 'note', html: '<p>🚩 <strong>The Soviet-flavour day.</strong> Real Wall with death strip and watchtower in the morning, DDR everyday life hands-on in the afternoon, Stalin-era boulevard before dinner. Almost the whole day rides on the <strong>U2 + tram M10</strong> — the M10 follows the old border strip.</p>' },
    { kind: 'timing', rows: [
      ['9:00', 'Breakfast at Winterfeldtmarkt (Wed market, 5 min walk from hotel) — pastries, fruit, people-watching on Berlin&rsquo;s prettiest square'],
      ['10:00', 'U2 → Potsdamer Platz, change to S1/S2 → Nordbahnhof (~25 min)'],
      ['10:15', 'Berlin Wall Memorial, Bernauer Straße (free): preserved death strip, watchtower, Window of Remembrance, Documentation Center rooftop view'],
      ['12:15', 'Tram M10 (the &ldquo;Wall tram&rdquo;) → Eberswalder Straße'],
      ['12:30', 'Lunch: Konnopke&rsquo;s Imbiss under the U2 viaduct — East Berlin&rsquo;s Currywurst institution since 1930 (the DDR classic is &ldquo;ohne Darm&rdquo;, skinless)'],
      ['14:00', 'U2 Eberswalder Str. → Alexanderplatz (direct): Weltzeituhr world clock, TV Tower from below — East Berlin&rsquo;s showpiece square'],
      ['14:30', 'DDR Museum (~2 h, booked slot): drive the Trabi simulator, walk through a full DDR flat, open every drawer'],
      ['17:00', 'U5 one stop → Strausberger Platz: walk Karl-Marx-Allee — Stalin&rsquo;s &ldquo;workers&rsquo; palaces&rdquo;, tiled facades, Kino International — up to the Frankfurter Tor towers'],
      ['19:30', 'Dinner: Zur letzten Instanz (reserved?) — Berlin&rsquo;s oldest restaurant, est. 1621: Königsberger Klopse, Buletten, Eisbein. Napoleon and Gorbachev both ate here'],
      ['21:30', 'U2 Klosterstraße → Nollendorfplatz, direct home'],
    ] },
    { kind: 'place', name: '🧱 Gedenkstätte Berliner Mauer', detail: 'Bernauer Str. 111, 13355 Berlin<br>Open-air 24/7, free · Documentation Center Tue–Sun 10–18<br>S1/S2 Nordbahnhof', maps: 'Gedenkstaette Berliner Mauer Bernauer Strasse 111' },
    { kind: 'place', name: '🌭 Konnopke’s Imbiss', detail: 'Schönhauser Allee 44a, 10435 Berlin (under the viaduct)<br>Mon–Fri 10:00–20:00 · since 1930', maps: 'Konnopkes Imbiss Schoenhauser Allee 44a Berlin' },
    { kind: 'place', name: '🚗 DDR Museum', detail: 'Karl-Liebknecht-Str. 1, 10178 Berlin (Spree side, opposite the Dom)<br>Open daily to 21:00 — book a time slot online', maps: 'DDR Museum Berlin Karl-Liebknecht-Strasse 1' },
    { kind: 'place', name: '🍖 Zur letzten Instanz', detail: 'Waisenstr. 14–16, 10179 Berlin · est. 1621<br>Reserve: +49 30 242 55 28 · U2 Klosterstraße', maps: 'Zur letzten Instanz Waisenstrasse 14 Berlin' },
    { kind: 'note', html: '<p>🌦️ <strong>Plan B / extras:</strong> if the weather is kind and nobody is museum-tired, Prater Garten (Berlin&rsquo;s oldest beer garden, 1837, Kastanienallee) is 5 min from Konnopke&rsquo;s. Fernsehturm ride up (203 m) is a fun add-on at Alexanderplatz but needs a pre-booked slot — skip if the queue is silly, the Reichstag dome tomorrow is free and arguably better.</p>' },
    { kind: 'stories', title: 'Today&rsquo;s backstories', ids: ['berliner-mauer', 'ddr-alltag', 'karl-marx-allee', 'berlin-food'] },
  ],
};
days['2026-07-09'] = {
  title: 'Checkpoint Charlie, East Side Gallery & the Reichstag dome',
  phase: 'summer',
  type: 'plan',
  summary: 'Gendarmenmarkt → Checkpoint Charlie → Wall panorama → East Side Gallery → Soviet War Memorial. Street Food Thursday, then sunset from the Reichstag dome.',
  blocks: [
    { kind: 'note', html: '<p>🏛️ <strong>Classic Berlin, then the big finale.</strong> Cold-War central in the morning, the painted Wall and the most Soviet place in the city in the afternoon, Berlin&rsquo;s best food event for dinner (it&rsquo;s Thursday!), and sunset from inside the glass dome over the Bundestag.</p>' },
    { kind: 'timing', rows: [
      ['9:30', 'U2 → Stadtmitte: Gendarmenmarkt — Konzerthaus + twin French/German cathedrals'],
      ['10:15', 'Walk 5 min → Checkpoint Charlie: the guardhouse, &ldquo;You are leaving the American sector&rdquo;, free open-air exhibition panels'],
      ['10:45', 'asisi Panorama DIE MAUER next door (~45 min) — stand on a 1980s Kreuzberg rooftop and look over the Wall into East Berlin. Better than the pricey private Wall museum'],
      ['11:45', 'Niederkirchnerstraße: 200 m of original Wall + Topography of Terror (free) — where the Gestapo/SS headquarters stood. Short visit, heavy but important'],
      ['13:00', 'U6 Kochstr. → Mehringdamm (2 stops): the classic West-Berlin Imbiss corner — Curry 36 vs Mustafa&rsquo;s Gemüse Kebap. Pick the shorter queue'],
      ['14:30', 'U1 Mehringdamm → Warschauer Str.: East Side Gallery — 1.3 km of painted Wall along the Spree, incl. the Brezhnev–Honecker kiss. Oberbaumbrücke photo stop'],
      ['16:00', 'S-Bahn 1 stop → Treptower Park: Soviet War Memorial — colossal, hushed, the most &ldquo;Soviet taste&rdquo; spot in Berlin. 7,000 Red Army soldiers are buried here'],
      ['17:45', 'S → Warschauer Str. → U1 → Görlitzer Bahnhof: Street Food Thursday at Markthalle Neun (17:00–22:00) — eat your way around the world, something for each of us'],
      ['19:30', 'Leave for the Reichstag (U1 → Hallesches Tor → U6 → Friedrichstraße + 10 min walk) — allow time for airport-style security'],
      ['20:30', 'Reichstag dome slot (booked, passports!): Norman Foster&rsquo;s glass spiral, free audio guide, sunset ~21:27 over the whole city'],
      ['21:45', 'Brandenburg Gate illuminated, 2 min away — the closing shot of Berlin'],
      ['22:15', 'S1 Brandenburger Tor → Potsdamer Platz → U2 home'],
    ] },
    { kind: 'place', name: '🪖 Checkpoint Charlie + asisi Panorama', detail: 'Friedrichstr. 43–45, 10117 Berlin<br>Panorama daily 10–18 · U2/U6 Stadtmitte / Kochstr.', maps: 'Checkpoint Charlie Friedrichstrasse Berlin' },
    { kind: 'place', name: '🎨 East Side Gallery', detail: 'Mühlenstr. 3–100, 10243 Berlin · open 24/7, free<br>U1/S Warschauer Straße', maps: 'East Side Gallery Muehlenstrasse Berlin' },
    { kind: 'place', name: '⭐ Sowjetisches Ehrenmal Treptower Park', detail: 'Puschkinallee, 12435 Berlin · open 24/7, free<br>S8/S9 Treptower Park + 10 min walk<br>(Car fallback: easy parking along Puschkinallee if legs are done)', maps: 'Sowjetisches Ehrenmal Treptower Park Berlin' },
    { kind: 'place', name: '🍜 Markthalle Neun — Street Food Thursday', detail: 'Eisenbahnstr. 42/43, 10997 Berlin-Kreuzberg<br>Thursdays 17:00–22:00 · U1 Görlitzer Bahnhof', maps: 'Markthalle Neun Eisenbahnstrasse Berlin' },
    { kind: 'place', name: '🏛️ Reichstag dome', detail: 'Platz der Republik 1, 11011 Berlin<br>Free, booked slot + passports for all four · last entry 21:45<br>Booking: bundestag.de → Visit the dome', maps: 'Reichstag Platz der Republik 1 Berlin' },
    { kind: 'note', html: '<p>🚗 <strong>Car option for today:</strong> everything runs fine on BVG, but if anyone&rsquo;s feet are done after the East Side Gallery, the Treptower memorial is the one stop where driving genuinely helps (parking on Puschkinallee). Otherwise leave the car at the hotel. 🧸 Souvenir hunt: an <strong>Ampelmännchen</strong> (the East-Berlin traffic-light man) from one of the Ampelmann shops, and a proper <strong>Pfannkuchen</strong> from any bakery — what the rest of Germany calls a &ldquo;Berliner&rdquo;, Berliners call a Pfannkuchen. Optional splurge if the kids want maximum Ost: a <strong>Trabi Safari</strong> convoy ride near Checkpoint Charlie (you drive, they ride).</p>' },
    { kind: 'stories', title: 'Today&rsquo;s backstories', ids: ['checkpoint-charlie', 'east-side-gallery', 'treptower-ehrenmal', 'reichstag'] },
  ],
};
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
  title: 'Drive to Ravenna — Casa Alighieri',
  phase: 'summer',
  type: 'travel',
  icon: '🚗',
  summary: 'Oberschleißheim → Ravenna over the Brenner (~580 km). Self check-in at Casa Alighieri, lockbox code 5656.',
  blocks: [
    { kind: 'place', name: '🚗 Oberschleißheim → Ravenna',
      detail: '~580 km · ~7 h driving · via the Brenner Pass (A22)<br>Through Austria & over the Alps into Emilia-Romagna' },
    { kind: 'timing', rows: [
      ['Early AM', 'Leave Oberschleißheim — full tank'],
      ['~2.5 h', 'Brenner Pass — Austrian + Italian motorway tolls'],
      ['from 14:00', 'Check-in window opens at Casa Alighieri'],
      ['Afternoon', 'Arrive Ravenna (Adriatic coast)'],
    ] },
    { kind: 'checklist', items: [
      'Austrian vignette + Brenner toll; Italian autostrada tolls (Telepass/card)',
      'Warnweste (hi-vis) + warning triangle — required in Italy & Austria',
      'Passports/IDs; snacks, water, offline maps',
      'A/C check — it will be hot on the Adriatic',
    ] },

    { kind: 'place', name: '🏠 Casa Alighieri (our apartment)',
      detail: 'Via Beatrice Alighieri 20, 48121 Ravenna RA · Airbnb<br><strong>Check-in from 14:00 · Check-out by 10:00</strong> — ground floor',
      maps: 'Via Beatrice Alighieri 20 48121 Ravenna' },
    { kind: 'note', html: '<p style="background:#FF90E8;border:2px solid #000;border-radius:6px;padding:10px 14px;font-weight:600;">🔑 <strong>Getting the keys:</strong> arriving by car, stop briefly on the <strong>LEFT</strong> at the outside gate. The keys are in the <strong>lockbox attached to the gate</strong> — code <strong style="font-size:1.25em;letter-spacing:1px;">5656</strong>. The gate opens with the remote control or the small key.</p>' },
    { kind: 'note', html: '<p>🚗 <strong>Parking:</strong> your private space is the one marked with an <strong>“X”</strong> in the photo — drive in and follow the arrows to the building entrance. The apartment is on the <strong>ground floor</strong>.<br>🌐 <strong>WiFi:</strong> network <strong>TP-Link_667A</strong> · password <strong>28579793</strong></p>' },
    { kind: 'photo', src: '/trips/2026/germany/files/ravenna/street.jpg', alt: 'The street — Via Beatrice Alighieri, Ravenna' },
    { kind: 'photo', src: '/trips/2026/germany/files/ravenna/gate.jpg', alt: 'The external gate to the parking and apartment' },
    { kind: 'photo', src: '/trips/2026/germany/files/ravenna/lockbox.jpg', alt: 'The key lockbox on the gate — code 5656' },
    { kind: 'photo', src: '/trips/2026/germany/files/ravenna/parking-x.jpg', alt: 'Park in the space marked X, then follow the arrows to the entrance' },
    { kind: 'note', html: '<p>🗑️ <strong>Rubbish:</strong> bins are outside the building — sort plastic / glass / cardboard. The non-recyclable bins open with the <strong>magnetic card</strong> in the apartment (losing it costs €50).<br>⚠️ <strong>House rule:</strong> don’t leave any food or drinks in the apartment or fridge when you check out.</p>' },
    { kind: 'note', html: '<p>📄 <strong><a href="/trips/2026/germany/files/ravenna/casa-alighieri-ravenna.pdf">Download the printable check-in sheet (PDF)</a></strong> &nbsp;·&nbsp; 🗺️ <a href="https://maps.app.goo.gl/k3yUiJGPAyshA6vY8" target="_blank">Open in Google Maps</a> &nbsp;·&nbsp; 📱 <a href="https://casabattisti.my.canva.site/alighieri" target="_blank">Host’s full instructions</a></p>' },
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
  title: 'Drive to Crema — walking in Elio & Oliver’s footsteps',
  phase: 'summer',
  type: 'travel',
  icon: '🚗',
  summary: 'Ravenna → Crema (~290 km, ~3 h). Lunch at Al Dòmm (tortelli cremaschi), check in ~2 PM, then the Call Me By Your Name walking tour of the old town.',
  blocks: [
    { kind: 'place', name: '🚗 Ravenna → Crema',
      detail: '~290 km · ~3 h driving' },
    { kind: 'place', name: '🏠 Apartment "da Irma in terrazza", Crema',
      detail: 'Via Stazione 112, 1° piano, 26013 Crema, Italy · GPS N 045° 21.976, E 09° 41.121<br>Check-in Mon Jul 27 — <strong>arranged ~2:00 PM</strong> with the host (official window 3:00–6:00 PM) · Check-out Wed Jul 29 (8:00–10:00 AM)<br>Two-Bedroom Apartment (private bathroom, terrace, kitchen) · 2 adults + 2 kids (13, 15) · 2 nights<br>Host: +39 347 768 6561 · Confirmation 6913.995.215 · PIN 9621',
      maps: 'Via Stazione 112 Crema Italy' },
    { kind: 'note', html: '<p style="background:#FF90E8;border:2px solid #000;border-radius:6px;padding:10px 14px;font-weight:600;">🔑 <strong>Check-in:</strong> plan is to arrive ~1 PM, have lunch first, then check in around 2 PM. <strong>Message Irma (+39 347 768 6561) when you finish lunch</strong> — she is 5 minutes away and comes to the apartment to hand over the keys. She may message if it’s ready by 1 PM.</p>' },
    { kind: 'note', html: '<p style="background:#FF90E8;border:2px solid #000;border-radius:6px;padding:10px 14px;font-weight:600;">🅿️ <strong>No parking at the apartment.</strong> Plan a nearby public car park — easiest is by the train station (Stazione di Crema, ~400 m up Via Stazione), or street parking outside the centre. Don’t drive into the historic-centre <strong>ZTL</strong> (camera-enforced traffic zone — automatic fines).</p>' },
    { kind: 'checklist', items: [
      'Bring €12 cash for the tourist tax (tassa di soggiorno) — the 13-year-old is exempt (under 14 doesn’t pay)',
      'Confirmation 6913.995.215 · PIN 9621',
      'Total €250.20 (incl. €36 cleaning); card charged €227.46 after Booking discounts — nothing due at the apartment',
      'Non-refundable rate (free-cancellation window ended Jul 12); WiFi free in the rooms',
    ] },

    // --- Call Me By Your Name — Day 1: the town (afternoon/evening after check-in) ---
    { kind: 'note', html: '<p>🎬 <strong>Call Me By Your Name — Day 1: Elio &amp; Oliver’s Crema.</strong> This is Phima’s day. The 2017 film was shot around Crema in the summer of 2016, and the old town looks virtually unchanged — almost every street here appears on screen. After lunch and check-in, walk into the historic centre.</p>' },
    { kind: 'timing', rows: [
      ['~10:00', 'Leave Ravenna (~3 h drive; Irma is expecting you Monday)'],
      ['~13:00', 'Arrive Crema — lunch first at Al Dòmm (the host’s tip: authentic tortelli cremaschi), by the Duomo'],
      ['~14:00', 'Check in — message Irma when you finish lunch; she’s 5 min away'],
      ['15:00', 'Piazza del Duomo — the heart of the film: café terrace, war memorial, bicycle scenes, where Marzia &amp; Elio meet'],
      ['16:00', 'Cathedral arch + historic streets: Via XX Settembre · Via Cavour · Via Marazzi · Piazza Premoli'],
      ['17:30', 'Porta Serio — the old town gate from the cycling scenes'],
      ['Evening', 'Gelato, then back to Piazza del Duomo for sunset, photos &amp; dinner'],
    ] },
    { kind: 'place', name: '🍝 Al Dòmm — lunch (host’s recommendation)',
      detail: 'Pizzeria · Ristorante · American Bar, right by the cathedral, a few minutes from the apartment. Irma recommends it for authentic <strong>tortelli cremaschi</strong>, Crema’s signature sweet-and-savoury stuffed pasta.',
      maps: 'Al Domm Crema Italy' },
    { kind: 'place', name: '⭐ Piazza del Duomo, Crema',
      detail: '<strong>🎬 In the film:</strong> the café terrace where Oliver asks "So… what do people do around here?", the newsagent <em>La Provincia</em> (at no. 14, now closed) that Elio watches Oliver leave, where Elio meets Marzia — and the start and end of the bicycle rides.<br><strong>🏛 History:</strong> the first cathedral here was razed by Emperor Frederick Barbarossa after the brutal seven-month Siege of Crema (1159–60), when the whole town was destroyed. The Duomo you see was rebuilt 1284–1340 in Lombard Gothic — brick, rose window, soaring bell tower.',
      maps: 'Piazza del Duomo Crema Italy' },
    { kind: 'place', name: 'Arco del Torrazzo (cathedral arch)',
      detail: '<strong>🎬 In the film:</strong> the Renaissance archway looming beside Elio and Oliver’s café table — the backdrop of the piazza scenes.<br><strong>🏛 History:</strong> built in 1525, a gift to the city from Francesco II Sforza, Duke of Milan. Walk through it — it links the piazza to the old market square behind.',
      maps: 'Arco del Torrazzo Crema Italy' },
    { kind: 'place', name: 'Porta Serio (town gate)',
      detail: '<strong>🎬 In the film:</strong> the old gate the bikes roll through in the cycling sequences.<br><strong>🏛 History:</strong> one of Crema’s two surviving town gates, on the east road toward the Serio river. Crema spent 350 years (1449–1797) as the <em>westernmost outpost of the Republic of Venice</em> — a fortified island of Venetian territory inside Milanese Lombardy, which is why the old town feels subtly different from its neighbours.',
      maps: 'Porta Serio Crema Italy' },
    { kind: 'note', html: '<p>🍬 <strong>About those tortelli cremaschi:</strong> Crema’s signature pasta is stuffed with amaretti, candied citron, raisins and spices — a sweet-savoury combination that is a direct legacy of the Venetian spice trade that ran through the town for centuries. Nobody else in Italy makes them like this.</p>' },
  ],
};
days['2026-07-28'] = {
  title: 'Crema — Call Me By Your Name countryside',
  phase: 'summer',
  type: 'plan',
  summary: 'Film-location day: Villa Albergoni (Moscazzano), Moscazzano village, and Pandino — the “speak or die” piazza + the Visconti castle. A car day; the villages are 15–20 min apart.',
  blocks: [
    { kind: 'note', html: '<p>🎬 <strong>Day 2: the countryside.</strong> The Perlman family villa and the film’s most famous scenes were shot in the villages just south of Crema. A short loop by car links them all — roughly 15–20 minutes between each.</p>' },
    { kind: 'timing', rows: [
      ['09:00', 'Villa Albergoni, Moscazzano — the Perlman house: Elio’s bedroom, garden, pool, outdoor lunches, the peach scene, the big conversations'],
      ['10:30', 'Moscazzano village — the bar where Oliver plays cards; Marzia scenes'],
      ['11:30', 'Pandino — Piazza Vittorio Emanuele II, the “is it better to speak or to die?” arcade'],
      ['12:00', 'Castello Visconteo, Pandino — the moated medieval castle in the same sequence'],
      ['13:00', 'Lunch in Pandino, or back in Crema'],
      ['Afternoon', 'Crema — shopping, coffee, revisit favourite spots; one final sunset walk in Piazza del Duomo'],
    ] },
    { kind: 'alert', html: '<p>🏡 <strong>Villa Albergoni is private property.</strong> The house (“Villa Perlman” on screen) is not open to visitors — admire it from the road outside, and keep quiet for the residents.</p>' },
    { kind: 'place', name: '⭐ Villa Albergoni, Moscazzano',
      detail: '<strong>🎬 In the film:</strong> the Perlman family home — Elio’s bedroom, Mr. Perlman’s book-lined study, the garden and orchard, the pool, the outdoor lunches, the dancing and the peach scene. Guadagnino originally wanted to <em>buy</em> the villa; when he couldn’t, he filmed his movie in it instead, with set designer Violante Visconti di Modrone dressing every room.<br><strong>🏛 History:</strong> built in the 1500s for the Milanese Vimercati family on the ruins of an earlier castle; inside are 16th-century murals by Aurelio Busso, a pupil of Raphael. Sold to new owners after the film (listed at €1.7M in 2018). Private property — view from outside.',
      maps: 'Villa Albergoni Moscazzano Italy' },
    { kind: 'place', name: 'Moscazzano village',
      detail: '<strong>🎬 In the film:</strong> the sleepy village bar where Oliver disappears at night to play cards with the locals — to Elio’s bafflement — plus several Marzia scenes.<br><strong>🏛 History:</strong> a farming village of ~800 people that the Vimercati and Albergoni families dominated for centuries; the film needed almost no set dressing because so little has changed.',
      maps: 'Moscazzano CR Italy' },
    { kind: 'place', name: '⭐ Piazza Vittorio Emanuele II, Pandino',
      detail: '<strong>🎬 In the film:</strong> Elio circles the WWI memorial and, under these arcades, tells Oliver the Heptaméron story — the knight who doesn’t know whether it is "better to speak or to die" — his roundabout confession. The film’s pivotal scene.<br><strong>🏛 History:</strong> the porticoed piazza grew up at the gates of the Visconti castle; the memorial at its centre honours Pandino’s fallen of the Great War — in the film it becomes a monument to "the Battle of the Piave".',
      maps: 'Piazza Vittorio Emanuele II Pandino Italy' },
    { kind: 'place', name: 'Castello Visconteo, Pandino',
      detail: '<strong>🎬 In the film:</strong> the castle frames the background of the Pandino sequence.<br><strong>🏛 History:</strong> built 1355–61 by Bernabò Visconti, Lord of Milan, and his wife Beatrice Regina della Scala as a hunting residence — an elegant country palace rather than a fortress. Square plan, four corner towers, and a frescoed courtyard still carrying the Visconti serpent and della Scala ladder emblems. One of the best-preserved Visconti castles in Lombardy; the courtyard is usually free to wander.',
      maps: 'Castello Visconteo Pandino Italy' },
    { kind: 'note', html: '<p>🎬 <strong>Filming-location checklist:</strong> Piazza del Duomo ⭐⭐⭐⭐⭐ · Cathedral arch ⭐⭐⭐⭐ · Historic streets ⭐⭐⭐⭐ · Porta Serio ⭐⭐⭐ · Villa Albergoni ⭐⭐⭐⭐⭐ · Moscazzano ⭐⭐⭐ · Piazza Vittorio Emanuele, Pandino ⭐⭐⭐⭐⭐ · Castello Visconteo ⭐⭐⭐ · Grotte di Catullo ⭐⭐⭐⭐</p>' },
    { kind: 'note', html: '<p>🚗 <strong>Optional excursion:</strong> the <a href="https://maps.google.com/?q=Grotte%20di%20Catullo%20Sirmione" target="_blank">Grotte di Catullo at Sirmione</a> (Lake Garda) — the Roman villa where the bronze statue is pulled from the lake — is ~1.5 h east. Rather than a same-day round trip, save it for the drive home tomorrow: Sirmione sits right on the A4, on the way to the Brenner.</p>' },
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
    { kind: 'place', name: '🎬 Optional last stop: Grotte di Catullo, Sirmione',
      detail: 'Lake Garda peninsula, right on the A4 toward the Brenner (~1 h from Crema).<br><strong>🎬 In the film:</strong> where Mr. Perlman’s team dredges the bronze statue from Lake Garda — and Elio and Oliver shake hands over its outstretched arm ("Truce?").<br><strong>🏛 History:</strong> the ruins of a vast Roman villa (~2 hectares, built around the turn of the 1st century AD) on the tip of the Sirmione peninsula — the largest Roman private villa in northern Italy. Named after the poet Catullus, who wrote of coming home to "beloved Sirmio" (Poem 31), though the villa itself was built after his death. Olive groves, lake views, and a fitting film farewell before the Alps.',
      maps: 'Grotte di Catullo Sirmione Italy' },
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
