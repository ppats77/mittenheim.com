'use strict';

const lib = require('./lib.js');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderBlock(b) {
  switch (b.kind) {
    case 'note':
      return b.html; // trusted author HTML
    case 'place':
      return `<div class="trip-place">
          <div class="trip-place__name">${b.name}</div>
          <div class="trip-place__detail">${b.detail}</div>
        </div>${b.maps ? `
        <a class="trip-maps-btn" href="https://maps.google.com/?q=${encodeURIComponent(b.maps)}" target="_blank">&#128205; ${esc(b.mapsLabel || b.name)}</a>` : ''}`;
    case 'checklist':
      return `<ul class="trip-checklist">
          ${b.items.map((i) => `<li><input type="checkbox"> ${i}</li>`).join('\n          ')}
        </ul>`;
    case 'timing':
      return `<table class="trip-timing-table">
          <tr><th>Time</th><th>What</th></tr>
          ${b.rows.map(([t, w]) => `<tr><td><strong>${t}</strong></td><td>${w}</td></tr>`).join('\n          ')}
        </table>`;
    case 'step':
      return `<details class="trip-step"${b.open ? ' open' : ''}>
          <summary><span class="trip-step__time">${b.time || ''}</span> ${b.label}</summary>
          <div class="trip-step__body">${renderBlocks(b.blocks || [])}</div>
        </details>`;
    case 'backup':
      return `<div class="trip-backup"><h4>${b.title}</h4>${b.html}</div>`;
    case 'alert':
      return `<div class="trip-alert">${b.html}</div>`;
    case 'photo':
      return `<div class="recipe-photo"><img src="${esc(b.src)}" alt="${esc(b.alt || '')}" loading="lazy"></div>`;
    default:
      return '';
  }
}

function renderBlocks(blocks) {
  return (blocks || []).map(renderBlock).join('\n        ');
}

function head(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} - Mittenheim Trips</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="theme-color" content="#000000">
</head>
<body>`;
}

const FOOTER = `  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <p>&copy; 2026 Mittenheim. Made with love and good ingredients.</p>
    </div>
  </footer>

  <script src="/js/main.js"></script>
</body>
</html>`;

function renderDayPage({ trip, iso, day, prevSlug, nextSlug, weekday, monthEN, dayNum }) {
  const base = '/trips/2026/germany/';
  const prev = prevSlug ? `<a href="${base}${prevSlug}/">&larr; Prev</a>` : '<span></span>';
  const next = nextSlug ? `<a href="${base}${nextSlug}/">Next &rarr;</a>` : '<span></span>';
  return `${head(day.title)}

  <!-- Navigation -->
  <nav class="nav">
    <div class="container nav__inner">
      <a href="${base}" class="nav__logo">Germany 2026</a>
      <ul class="nav__links" id="nav-links">
        <li><a href="${base}">All Days</a></li>
        <li><a href="/trips/">Trips</a></li>
      </ul>
      <button class="nav__toggle" id="nav-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <!-- Day Header -->
  <div class="recipe-hero recipe-hero--text" data-date="${iso}">
    <div class="recipe-hero__inner">
      <div class="recipe-meta">
        <span>${weekday}, ${monthEN} ${dayNum}</span>
        <span class="tag">Day Plan</span>
        ${day.work ? `<span class="tag">${WORK_LABELS[day.work] || ''}</span>` : ''}
      </div>
      <h1>${esc(day.title)}</h1>${day.workNote ? `
      <div style="margin-top: 12px; color: rgba(255,255,255,0.7); font-size: 0.9rem;">${esc(day.workNote)}</div>` : ''}
    </div>
  </div>

  <!-- Day Content -->
  <div class="recipe-content">
    <div class="trip-daynav">${prev}${next}</div>

        ${renderBlocks(day.blocks)}

    <div class="trip-daynav" style="margin-top:32px;">${prev}<a href="${base}">All days</a>${next}</div>
  </div>

${FOOTER}`;
}

const MONTHS_DE = { January:'Januar', February:'Februar', March:'März', April:'April',
  May:'Mai', June:'Juni', July:'Juli', August:'August', September:'September',
  October:'Oktober', November:'November', December:'Dezember' };
const WEEKDAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// Work-status badge labels (overlay on top of travel/away/open days).
const WORK_LABELS = {
  remote: '💻 RW',
  off: '🏖️ OFF',
  holiday: '🎆 HOLIDAY',
};

function renderOverview(trip) {
  const base = '/trips/2026/germany/';
  const grids = lib.monthGrids(trip.start, trip.end);
  const s = lib.parts(trip.start);
  const e = lib.parts(trip.end);
  const range = `${s.monthEN} ${s.day} – ${e.monthEN} ${e.day}, ${e.year}`;

  const monthsHTML = grids.map((g) => {
    const blanks = Array.from({ length: g.leadingBlanks },
      () => `<div class="cal-day cal-day--empty"></div>`).join('');
    const cells = g.dates.map((iso) => {
      const p = lib.parts(iso);
      const day = trip.days[iso];
      const slug = lib.slugFor(iso);
      // Icon: a day may set its own (e.g. '🚗' for a drive); travel days
      // default to a plane if none is specified. Non-travel days show none.
      const icon = day.icon ? ` ${day.icon}` : (day.type === 'travel' ? ' &#9992;' : '');
      const summary = day.summary
        ? `<span class="cal-day__summary">${esc(day.summary)}</span>` : '';
      const badge = day.work
        ? `<span class="cal-badge cal-badge--${day.work}">${WORK_LABELS[day.work] || ''}</span>` : '';
      return `<a class="cal-day cal-day--${day.type}" href="${base}${slug}/" data-date="${iso}" title="${esc(day.summary || '')}">${badge}<span class="cal-day__num">${p.day}${icon}</span>${summary}</a>`;
    }).join('');
    const weekdayHdr = WEEKDAYS_DE.map((w) => `<div class="cal-weekday">${w}</div>`).join('');
    return `<div class="cal-month">
        <h2 class="cal-month__title">${MONTHS_DE[g.monthEN]} ${g.year}</h2>
        <div class="cal-grid">
          ${weekdayHdr}
          ${blanks}${cells}
        </div>
      </div>`;
  }).join('\n      ');

  return `${head(trip.name)}

  <!-- Navigation -->
  <nav class="nav">
    <div class="container nav__inner">
      <a href="${base}" class="nav__logo">Germany 2026</a>
      <ul class="nav__links" id="nav-links">
        <li><a href="/trips/">All Trips</a></li>
      </ul>
      <button class="nav__toggle" id="nav-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <!-- Header -->
  <div class="recipe-hero recipe-hero--text">
    <div class="recipe-hero__inner">
      <div class="recipe-meta">
        <span>${range}</span>
        <span class="tag">Germany</span>
      </div>
      <h1>${esc(trip.name)}</h1>
      <div style="margin-top: 12px; color: rgba(255,255,255,0.7); font-size: 0.9rem;">
        ${esc(trip.travelers)} &middot; Home base: ${esc(trip.base)}
      </div>
    </div>
  </div>

  <!-- Calendar -->
  <div class="recipe-content">
    <div class="cal-controls">
      <button class="trip-maps-btn" id="jump-today" type="button">&#128204; Jump to today</button>
      <div class="cal-legend">
        <span><i class="cal-swatch cal-swatch--plan"></i> Planned</span>
        <span><i class="cal-swatch cal-swatch--rest"></i> Open</span>
        <span><i class="cal-swatch cal-swatch--travel"></i> Travel</span>
        <span><i class="cal-swatch cal-swatch--today"></i> Today</span>
        <span class="cal-badge cal-badge--remote">💻 RW</span>
        <span class="cal-badge cal-badge--off">🏖️ OFF</span>
        <span class="cal-badge cal-badge--holiday">🎆 HOLIDAY</span>
      </div>
    </div>

    <div class="trip-calendar">
      ${monthsHTML}
    </div>

    <p style="margin-top: 32px;"><a href="/trips/">&larr; All trips</a></p>
  </div>

${FOOTER}`;
}

module.exports = { renderBlock, renderBlocks, renderDayPage, renderOverview, head, esc, FOOTER };
