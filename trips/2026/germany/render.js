'use strict';

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
      </div>
      <h1>${esc(day.title)}</h1>
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

module.exports = { renderBlock, renderBlocks, renderDayPage, head, esc, FOOTER };
