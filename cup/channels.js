'use strict';
// Per-match TV channel assignments, hand-curated from researched sources (Jun 2026).
//
// Honesty model — three states per channel:
//   confirmed : officially announced by the broadcaster / FIFA (ARD/ZDF/DFB or BBC/ITV release)
//   expected  : well-sourced but UNofficial (aggregator projections, e.g. anstosszeiten.de / flashscore)
//   (absent)  : genuinely not announced -> shown as "TBC" on the page
//
// Keyed by exact `match` string (as in matches.js) + cetDate, so the build can verify
// every entry maps to a real fixture and we never mislabel a game.
//
// DE = German free-to-air (ARD/ZDF). UK = BBC/ITV. "Magenta only" = no German free-TV.

module.exports = {
  // ---- Officially CONFIRMED (broadcaster/FIFA announcements) ----
  'Mexico v South Africa|2026-06-11': { de: 'ZDF', deConf: 'confirmed', uk: 'ITV', ukConf: 'confirmed' }, // opening match
  'Germany v Curacao|2026-06-14':    { de: 'ARD', deConf: 'confirmed', uk: 'ITV', ukConf: 'expected' },
  'Netherlands v Japan|2026-06-14':  { uk: 'ITV', ukConf: 'expected' },
  'England v Croatia|2026-06-17':    { de: 'ZDF', deConf: 'expected', uk: 'ITV', ukConf: 'confirmed' },
  'Scotland v Morocco|2026-06-20':   { uk: 'ITV', ukConf: 'confirmed' },
  'Germany v Ivory Coast|2026-06-20':{ de: 'ZDF', deConf: 'confirmed', uk: 'ITV', ukConf: 'expected' },
  'England v Ghana|2026-06-23':      { de: 'ARD', deConf: 'expected', uk: 'BBC One', ukConf: 'confirmed' },
  'Scotland v Brazil|2026-06-25':    { uk: 'BBC One', ukConf: 'confirmed' },
  'Ecuador v Germany|2026-06-25':    { de: 'ARD', deConf: 'confirmed' },
  'Panama v England|2026-06-27':     { uk: 'ITV', ukConf: 'confirmed' }, // England's final group game
  // Opening-day late game (UK "first two matches" = likely ITV)
  'South Korea v Czech Republic|2026-06-12': { uk: 'ITV', ukConf: 'expected' },
  // Other confirmed UK home-nation / host games in the early window
  'Canada v Bosnia & Herz.|2026-06-12': { uk: 'BBC One', ukConf: 'confirmed' },
  'USA v Paraguay|2026-06-13':       { uk: 'BBC One', ukConf: 'confirmed' },
  'Qatar v Switzerland|2026-06-13':  { uk: 'ITV', ukConf: 'confirmed' },
  'Brazil v Morocco|2026-06-14':     { uk: 'BBC One', ukConf: 'confirmed' }, // 12:00 AM CET (Jun 14)
  'Haiti v Scotland|2026-06-14':     { uk: 'BBC One', ukConf: 'confirmed' }, // Scotland opener (3:00 AM CET Jun 14)
  'USA v Australia|2026-06-19':      { de: 'ARD', deConf: 'expected', uk: 'BBC One', ukConf: 'expected' },
  'Winner 101 v Winner 102|2026-07-19': { de: 'ZDF', deConf: 'confirmed', uk: 'BBC One + ITV', ukConf: 'confirmed' }, // Final

  // ---- EXPECTED German free-TV (aggregator projections; UK still TBC) ----
  'Spain v Cape Verde|2026-06-15':   { de: 'ARD', deConf: 'expected' },
  'Belgium v Egypt|2026-06-15':      { de: 'ARD', deConf: 'expected' },
  'Argentina v Algeria|2026-06-17':  { de: 'ARD', deConf: 'expected' }, // 3:00 AM CET (Jun 17)
  'Portugal v DR Congo|2026-06-17':  { de: 'ZDF', deConf: 'expected' },
  'Brazil v Haiti|2026-06-20':       { de: 'ARD', deConf: 'expected' }, // 2:30 AM CET (Jun 20)
  'Netherlands v Sweden|2026-06-20': { de: 'ZDF', deConf: 'expected' },
  'Argentina v Austria|2026-06-22':  { de: 'ARD', deConf: 'expected' },
  'France v Iraq|2026-06-22':        { de: 'ARD', deConf: 'expected' },
  'Portugal v Uzbekistan|2026-06-23':{ de: 'ARD', deConf: 'expected' },
  'Colombia v DR Congo|2026-06-24':  { de: 'ARD', deConf: 'expected' }, // 4:00 AM CET (Jun 24)
};
