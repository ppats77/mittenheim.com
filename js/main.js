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
