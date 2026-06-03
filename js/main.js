// Mobile nav toggle
const toggle = document.getElementById('nav-toggle');
const links = document.getElementById('nav-links');

if (toggle && links) {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });
}

// Recipe filtering (recipes.html)
const filterBar = document.getElementById('filter-bar');
const recipesGrid = document.getElementById('all-recipes');

if (filterBar && recipesGrid) {
  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    // Update active button
    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter.toLowerCase();
    const cards = recipesGrid.querySelectorAll('.card');

    cards.forEach(card => {
      if (filter === 'all') {
        card.style.display = '';
      } else {
        const tags = (card.dataset.tags || '').toLowerCase();
        card.style.display = tags.includes(filter) ? '' : 'none';
      }
    });
  });
}

// Trip calendar: highlight "today" in Europe/Berlin time (Cloudflare-safe, client-side).
(function () {
  const todayBerlin = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()); // e.g. "2026-06-12"

  // Overview grid: mark the matching cell.
  const cell = document.querySelector(`.cal-day[data-date="${todayBerlin}"]`);
  if (cell) cell.classList.add('cal-day--today');

  // Day page: if this page IS today, accent the hero + relabel the tag.
  const hero = document.querySelector('.recipe-hero[data-date]');
  if (hero && hero.getAttribute('data-date') === todayBerlin) {
    const tag = hero.querySelector('.tag');
    if (tag) tag.textContent = 'Today';
  }

  // "Jump to today" button on the overview.
  const jump = document.getElementById('jump-today');
  if (jump) {
    jump.addEventListener('click', () => {
      const target = document.querySelector('.cal-day--today');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        jump.textContent = 'Today is outside the trip 🗓️';
      }
    });
  }
})();

// /cup page: by default show only TODAY + TOMORROW's matches (Europe/Berlin).
// If neither has a match (before the tournament, or a gap day), fall back to
// the next upcoming match day so the page is never empty. A toggle shows all.
(function () {
  const calendar = document.getElementById('cup-calendar');
  if (!calendar) return; // not the cup page — no-op

  const days = Array.from(calendar.querySelectorAll('.cup-day'));
  if (!days.length) return;

  const todayBerlin = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()); // "2026-06-12"
  // Tomorrow in Berlin: add a day to the ISO string via UTC math (calendar date only).
  const [y, mo, d] = todayBerlin.split('-').map(Number);
  const tmrw = new Date(Date.UTC(y, mo - 1, d + 1));
  const tomorrowBerlin = tmrw.toISOString().slice(0, 10);

  const note = document.getElementById('cup-view-note');
  const empty = document.getElementById('cup-empty');
  const showAllBtn = document.getElementById('cup-show-all');

  function applyDefaultView() {
    let shownDates = days.map((s) => s.dataset.date).filter((dt) => dt === todayBerlin || dt === tomorrowBerlin);

    if (!shownDates.length) {
      // Nothing today/tomorrow — show the next upcoming match day (soonest date >= today).
      const upcoming = days.map((s) => s.dataset.date).filter((dt) => dt >= todayBerlin).sort();
      if (upcoming.length) shownDates = [upcoming[0]];
    }

    const shown = new Set(shownDates);
    days.forEach((s) => { s.hidden = !shown.has(s.dataset.date); });

    if (empty) empty.hidden = true;
    if (!shownDates.length) {
      // No matches today/tomorrow and none upcoming — tournament is over.
      if (note) note.textContent = 'The tournament is over.';
      if (empty) {
        empty.hidden = false;
        empty.textContent = 'No upcoming matches — see the full schedule below.';
      }
    } else if (note) {
      note.textContent = (shown.has(todayBerlin) || shown.has(tomorrowBerlin))
        ? 'Today & tomorrow’s matches.'
        : 'No matches today — showing the next match day.';
    }
  }

  let showingAll = false;
  applyDefaultView();

  if (showAllBtn) {
    showAllBtn.addEventListener('click', () => {
      showingAll = !showingAll;
      if (showingAll) {
        days.forEach((s) => { s.hidden = false; });
        if (empty) empty.hidden = true;
        if (note) note.textContent = 'Full schedule — all match days.';
        showAllBtn.textContent = 'Show today & tomorrow only';
        showAllBtn.setAttribute('aria-pressed', 'true');
      } else {
        applyDefaultView();
        showAllBtn.textContent = 'Show full schedule';
        showAllBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }
})();
