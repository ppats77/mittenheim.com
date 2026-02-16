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
