'use strict';
const lib = require('./lib.js');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const IMG = 'https://mittenheim.com/images/og-image.png';

function head() {
  const title = 'World Cup 2026 — Match Calendar - Mittenheim';
  const desc = 'FIFA World Cup 2026 — all 104 matches with kickoff times in CET (Germany) and ET. Today’s games highlighted. June 11 – July 19, 2026.';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="theme-color" content="#000000">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Mittenheim">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="https://mittenheim.com/cup/">
  <meta property="og:image" content="${IMG}">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${IMG}">
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

// Channel chips for a match: 🇩🇪 (German free-TV) and 🇬🇧 (UK). "exp." = unofficial
// projection; absent = not announced -> shown as TBC. Returns '' if no data at all.
function renderChannels(ch) {
  if (!ch) {
    return '<div class="cup-chans"><span class="cup-chan cup-chan--tbc">&#127465;&#127466; / &#127468;&#127463; TBC</span></div>';
  }
  const chip = (flag, name, conf) => {
    if (!name) return `<span class="cup-chan cup-chan--tbc">${flag} TBC</span>`;
    const exp = conf === 'expected' ? '<span class="cup-chan__exp"> exp.</span>' : '';
    return `<span class="cup-chan cup-chan--${conf}">${flag} ${esc(name)}${exp}</span>`;
  };
  return `<div class="cup-chans">${chip('&#127465;&#127466;', ch.de, ch.deConf)}${chip('&#127468;&#127463;', ch.uk, ch.ukConf)}</div>`;
}

// One match row. data-germany lets us accent it; flag emoji optional decoration.
function renderMatch(m) {
  const ger = m.isGermany ? ' cup-match--germany' : '';
  const sub = m.group && m.group !== m.round ? m.group : m.round;
  return `<div class="cup-match${ger}">
          <div class="cup-match__time">
            <span class="cup-match__cet">${esc(m.cetTime)}</span>
            <span class="cup-match__et">${esc(m.etTime)} ET</span>
          </div>
          <div class="cup-match__main">
            <div class="cup-match__teams">${esc(m.match)}</div>
            <div class="cup-match__meta">${esc(sub)} &middot; ${esc(m.venue)}</div>
          </div>
          ${renderChannels(m.channels)}
        </div>`;
}

function renderDay(d) {
  const rows = d.matches.map(renderMatch).join('\n        ');
  return `<section class="cup-day" data-date="${d.iso}">
      <h2 class="cup-day__title">${d.weekday}, ${d.monthEN} ${d.day}</h2>
        ${rows}
    </section>`;
}

function renderPage(matches) {
  const days = lib.groupByCetDate(matches);
  const total = matches.length;
  const daysHTML = days.map(renderDay).join('\n    ');

  return `${head()}

  <!-- Navigation -->
  <nav class="nav">
    <div class="container nav__inner">
      <a href="/" class="nav__logo">Mittenheim</a>
      <ul class="nav__links" id="nav-links">
        <li><a href="/trips/2026/germany/">Trip</a></li>
        <li><a href="/">Blog</a></li>
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
        <span>June 11 – July 19, 2026</span>
        <span class="tag">&#9917; World Cup</span>
      </div>
      <h1>World Cup 2026</h1>
      <div style="margin-top: 12px; color: rgba(255,255,255,0.7); font-size: 0.9rem;">
        ${total} matches &middot; USA &middot; Canada &middot; Mexico &middot; kickoff times in CET (Germany) and ET
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="recipe-content cup-content">

    <details class="cup-watch">
      <summary>&#128250; How to watch (free-to-air)</summary>
      <div class="cup-watch__body">
        <p><strong>&#127465;&#127466; In Germany (home base):</strong> <strong>ARD</strong> &amp; <strong>ZDF</strong> show 60 of the 104 matches free-to-air &mdash; including every Germany game, the opening match, both semi-finals and the final (also free on their apps/streams). <strong>MagentaTV</strong> (Telekom) carries all 104 live, 44 of them exclusively.</p>
        <p><strong>&#127467;&#127479; On the France trip (Jun 14&ndash;24):</strong> if you have <strong>UK channels</strong>, <strong>BBC One</strong> and <strong>ITV1</strong> split all 104 matches between them, all free (and on BBC iPlayer / ITVX). The <strong>German ARD/ZDF</strong> free games are available too. Both of Germany&rsquo;s first two matches fall during this stay &mdash; Germany v Curacao (Jun 14) and Germany v Ivory Coast (Jun 20) &mdash; carried free on ARD/ZDF and on BBC or ITV.</p>
        <p><strong>Channel chips below each match:</strong> &#127465;&#127466; = German free-TV (ARD/ZDF), &#127468;&#127463; = UK (BBC/ITV). Officially confirmed games are firm; <em>exp.</em> = expected (well-sourced but unofficial projection); <strong>TBC</strong> = not announced yet. The full per-match BBC-vs-ITV split is only published for the home-nation and marquee games &mdash; the rest, and all knockout ties, are confirmed nearer kick-off.</p>
        <p class="cup-watch__note">Kickoff times below are CET (Germany) with ET shown underneath. Games not on German free-TV are on MagentaTV (pay); in the UK all 104 are free across BBC/ITV.</p>
      </div>
    </details>

    <div class="cup-controls">
      <p class="cup-view-note" id="cup-view-note">Today &amp; tomorrow&rsquo;s matches.</p>
      <button class="trip-maps-btn" id="cup-show-all" type="button" aria-pressed="false">Show full schedule</button>
      <span class="cup-legend"><i class="cup-swatch"></i> Germany match</span>
    </div>

    <!-- Shown by JS when there are no matches today/tomorrow -->
    <p id="cup-empty" class="cup-empty" hidden></p>

    <div class="cup-calendar" id="cup-calendar">
    ${daysHTML}
    </div>

    <p style="margin-top: 40px;"><a href="/trips/2026/germany/">&larr; Our Germany trip calendar</a></p>
  </div>

${FOOTER}`;
}

module.exports = { renderPage, renderMatch, renderDay, renderChannels, head, esc, FOOTER };
