# Mittenheim Food Blog - Claude Instructions

## What This Is
Static food blog at **mittenheim.com**. Wife describes recipes to Claude, Claude generates the HTML and commits to the repo. Cloudflare auto-deploys on push.

## Tech Stack
- **Plain HTML/CSS/JS** — zero dependencies, zero build step
- **GitHub repo**: `ppats77/mittenheim.com`
- **Hosting**: Cloudflare Pages (free tier), project name: `mittenheim`
- **Domains**: `mittenheim.com`, `www.mittenheim.com`, `mittenheim.pages.dev`
- **Auto-deploy**: GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers `wrangler pages deploy` on every push to `main`
- **Font**: Inter from Google Fonts (free alternative to Gumroad's ABC Favorit)

## Design System — Gumroad Neubrutalism
The site uses Gumroad's actual design language: neubrutalism.

### Colors (CSS variables in `css/style.css`)
- `--bg: #FFFFFF` — main background
- `--bg-alt: #F4F4F0` — alternate section background
- `--black: #000000` — borders, text, footer bg
- `--text: #000000` — headings
- `--text-body: #333333` — body text
- `--pink: #FF90E8` — Gumroad's signature Lavender Rose accent
- `--pink-hover: #e87bd0` — hover state

### Visual Language
- **Thick borders**: `2px solid #000` on cards, nav, footer, recipe boxes
- **Hard offset shadows**: `4px 4px 0px #000` — NO blur, NO soft shadows
- **Border radius**: `6px` on cards/boxes, `100px` (pill) on tags and filter buttons
- **Hover on cards**: shadow grows to `6px 6px`, card shifts `translate(-2px, -2px)`
- **Active/pressed buttons**: shadow disappears, button shifts `translate(2px, 2px)` (pressed-in feel)
- **Tags**: Pink background `#FF90E8`, black border, pill-shaped, uppercase, tiny font
- **Footer**: Black background, white text, pink on hover

### Typography
- Font: `'Inter'` from Google Fonts, weights: 400, 500, 600, 700
- Body: 18px, line-height 1.7
- Headings: font-weight 700, letter-spacing -0.03em, line-height 1.15
- Hero h1: 3.8rem, letter-spacing -0.04em
- Links: underline with `text-decoration-thickness: 2px`, `text-underline-offset: 3px`

## Pictureless Design (Current State)
The site is intentionally designed without photos. This is NOT a "placeholder" situation — it's a deliberate design choice.

### Recipe Cards (homepage + recipes page)
- Cards are `<a>` tags (entire card is clickable), NOT `<div>` with inner links
- No image area at all — just `card__body` containing: tags (top) → title → description
- Tags sit at the TOP of the card (above the title)
- `card__title` is plain text (no inner `<a>` tag since the whole card is the link)
- Description clamps to 3 lines (`-webkit-line-clamp: 3`)
- On hover: title color changes to pink

### Recipe Detail Pages
- NO hero image section — instead uses `recipe-hero--text` class
- Black background header with white title text + pink tags
- Structure: `recipe-hero--text` → `recipe-hero__inner` → `recipe-meta` + `h1`
- Story section follows, then `recipe-box` with ingredients/instructions

### About Page
- Single-column centered text layout (class: `about-text--centered`, max-width 680px)
- No photo/image placeholder

## Trilingual Support (English + German + Bavarian)
The site is trilingual. English is at root (`/`), German (Hochdeutsch) is under `/de/`, Bavarian is under `/by/`.
- Shared assets (CSS, JS, images) stay at root — referenced with absolute paths
- Every page has three `<link rel="alternate" hreflang="...">` tags: `en`, `de`, `bar` (ISO 639-3 for Bavarian)
- Every page shows two language switcher pills in the nav bar (linking to the other two languages)
  - EN pages: `DE` + `BY` pills
  - DE pages: `EN` + `BY` pills
  - BY pages: `EN` + `DE` pills
- `data-tags` on recipe cards stay in English across all three languages (internal, JS matches against them) — only visible tag labels are translated
- On mobile, the language switcher pills stay visible next to the hamburger (not hidden in dropdown)
- DE pages use proper Hochdeutsch (standard German) — no Bavarian dialect
- BY pages use full Bavarian dialect throughout (story, recipe box, notes)
- BY pages use `<html lang="bar">`, `og:locale` = `de_DE` (no standard Bavarian locale exists)

## File Structure
```
mittenheim/
├── .github/workflows/deploy.yml    # Auto-deploy to Cloudflare Pages
├── index.html                      # EN homepage: nav, hero, latest recipes grid
├── about.html                      # EN about page: centered text
├── recipes.html                    # EN all recipes: filter bar + grid
├── css/style.css                   # Single stylesheet, full design system
├── js/main.js                      # Mobile nav toggle + recipe filtering
├── images/                         # Recipe photos
├── recipes/
│   └── [slug]/index.html           # EN recipe pages (19 recipes)
├── de/                             # German (Hochdeutsch) mirror
│   ├── index.html                  # DE homepage
│   ├── about.html                  # DE about (Über uns)
│   ├── recipes.html                # DE all recipes (Rezepte)
│   └── recipes/
│       └── [slug]/index.html       # DE recipe pages (19 recipes)
├── by/                             # Bavarian dialect mirror
│   ├── index.html                  # BY homepage
│   ├── about.html                  # BY about (Über mia)
│   ├── recipes.html                # BY all recipes (Rezepte)
│   └── recipes/
│       └── [slug]/index.html       # BY recipe pages (19 recipes)
├── sitemap.xml                     # Sitemap with three-way hreflang cross-refs
├── CLAUDE.md                       # This file
└── README.md                       # Deploy instructions
```

## How to Add a New Recipe (Trilingual)

### Step 1: Create the English recipe page
Create `recipes/[slug]/index.html`. Use this exact structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Recipe Title] - Mittenheim</title>
  <meta name="description" content="[Short description]">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="alternate" hreflang="en" href="/recipes/[slug]/">
  <link rel="alternate" hreflang="de" href="/de/recipes/[slug]/">
  <link rel="alternate" hreflang="bar" href="/by/recipes/[slug]/">
</head>
<body>

  <!-- Navigation -->
  <nav class="nav">
    <div class="container nav__inner">
      <a href="/" class="nav__logo">Mittenheim</a>
      <ul class="nav__links" id="nav-links">
        <li><a href="/recipes.html">Recipes</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/de/recipes/[slug]/" class="nav__lang">DE</a></li>
        <li><a href="/by/recipes/[slug]/" class="nav__lang">BY</a></li>
      </ul>
      <button class="nav__toggle" id="nav-toggle" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>

  <!-- Recipe Header -->
  <div class="recipe-hero recipe-hero--text">
    <div class="recipe-hero__inner">
      <div class="recipe-meta">
        <span>[Date, e.g. February 15, 2026]</span>
        <span class="tag">[Tag1]</span>
        <span class="tag">[Tag2]</span>
      </div>
      <h1>[Recipe Title]</h1>
    </div>
  </div>

  <!-- Recipe Content -->
  <div class="recipe-content">

    <div class="recipe-story">
      <p>[Personal story about the recipe, 2-4 paragraphs]</p>
      <p><em>Adapted from [source].</em></p> <!-- if applicable -->
    </div>

    <div class="recipe-box">
      <h2>The Recipe</h2>

      <p><strong>Serves:</strong> [N] &nbsp;&bull;&nbsp; <strong>Time:</strong> [time]</p>

      <h3>Ingredients</h3>
      <ul>
        <li>[ingredient]</li>
      </ul>

      <h3>Instructions</h3>
      <ol>
        <li><strong>[Step name]:</strong> [instructions]</li>
      </ol>

      <h3>Notes</h3>  <!-- optional -->
      <ul>
        <li>[tip or variation]</li>
      </ul>
    </div>

    <p><a href="/recipes.html">&larr; Back to all recipes</a></p>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <p>&copy; 2026 Mittenheim. Made with love and good ingredients.</p>
    </div>
  </footer>

  <script src="/js/main.js"></script>
</body>
</html>
```

### Step 2: Create the German (Hochdeutsch) recipe page
Create `de/recipes/[slug]/index.html` with translated content. Key differences:
- `<html lang="de">`, three hreflang links (en, de, bar)
- Nav: "Rezepte", "Über uns", two lang pills: "EN" linking to `/recipes/[slug]/` and "BY" linking to `/by/recipes/[slug]/`
- All internal links point to `/de/...` paths
- Recipe box headers: "Das Rezept", "Zutaten", "Zubereitung", "Anmerkungen"
- Tags display in standard German (but `data-tags` stay in English)
- Date format: `15. Februar 2026`
- Footer: "Mit Liebe und guten Zutaten gemacht."
- Back link: "← Zurück zu allen Rezepten" linking to `/de/recipes.html`
- **Important**: Use proper Hochdeutsch only — no Bavarian dialect

### Step 2b: Create the Bavarian recipe page
Create `by/recipes/[slug]/index.html` with Bavarian dialect content. Key differences:
- `<html lang="bar">`, three hreflang links (en, de, bar)
- Nav: "Rezepte", "Über mia", two lang pills: "EN" linking to `/recipes/[slug]/` and "DE" linking to `/de/recipes/[slug]/`
- All internal links point to `/by/...` paths
- Recipe box headers: "Des Rezept", "Zuatatn", "Zuabreitung", "Anmerkuunga"
- Tags display in Bavarian (Abendessn, Oafach, Backn, Mittogessn, Früahstück, Feiertog, Getränke, etc.) but `data-tags` stay in English
- Date format: `15. Februar 2026`
- Footer: "Mit Liab und guade Zuatatn gmacht."
- Back link: "← Zruck zu olle Rezepte" linking to `/by/recipes.html`
- `og:locale` = `de_DE` (no standard Bavarian locale exists)
- Full Bavarian dialect throughout: story, recipe box, instructions, notes, JSON-LD

### Step 3: Add English card to `recipes.html` and `index.html`
Add ABOVE existing cards (newest first). Cards are `<a>` tags with `data-tags` for filtering:

```html
<a class="card" href="/recipes/[slug]/" data-tags="[tag1], [tag2]">
  <div class="card__body">
    <div class="card__tags">
      <span class="tag">[Tag1]</span>
      <span class="tag">[Tag2]</span>
    </div>
    <h3 class="card__title">[Recipe Title]</h3>
    <p class="card__desc">[One-line description]</p>
  </div>
</a>
```

**Important**: `data-tags` must be lowercase and comma-separated. The filter buttons match against these. If a new tag category is needed, add a `<button class="filter-btn" data-filter="[tag]">[Tag]</button>` to the filter bar (EN, DE, and BY versions).

On `index.html`, same HTML but without `data-tags`. Keep only the 6 most recent.

### Step 4: Add German card to `de/recipes.html` and `de/index.html`
Same structure as Step 3, but:
- `href` points to `/de/recipes/[slug]/`
- Title and description in standard German (Hochdeutsch)
- Tag labels in German (e.g. "Abendessen" not "Dinner")
- `data-tags` stay in English (the JS filter matches against these)

### Step 5: Add Bavarian card to `by/recipes.html` and `by/index.html`
Same structure as Step 3, but:
- `href` points to `/by/recipes/[slug]/`
- Title and description in Bavarian dialect
- Tag labels in Bavarian (e.g. "Abendessn", "Oafach", "Backn")
- `data-tags` stay in English (the JS filter matches against these)

### Step 6: Commit and push
```bash
git add recipes/[slug] de/recipes/[slug] by/recipes/[slug] index.html recipes.html de/index.html de/recipes.html by/index.html by/recipes.html
git commit -m "Add [recipe name] recipe (EN + DE + BY)"
git push
```
GitHub Actions auto-deploys to Cloudflare Pages within ~30 seconds.

## Filter System
- Filter buttons in `recipes.html`, `de/recipes.html`, and `by/recipes.html` use `data-filter` attribute
- Recipe cards use `data-tags` attribute (lowercase, comma-separated) — same English values across all three languages
- JS in `main.js` handles filtering by matching `data-filter` against `data-tags` using `.includes()`
- Current filter buttons: All, Middle Eastern, Vegan, Dinner, Lunch, Breakfast, Drinks, Holiday, Baking, Easy
- Add new filter buttons as new tag categories appear (in all three language versions)

## Existing Tags in Use
- **Cuisine**: Middle Eastern
- **Diet**: Vegan
- **Meal**: Dinner, Lunch, Breakfast
- **Type**: Drinks, Holiday, Baking
- **Difficulty**: Easy

### Tag Labels by Language
| data-tag | EN | DE | BY |
|---|---|---|---|
| dinner | Dinner | Abendessen | Abendessn |
| lunch | Lunch | Mittagessen | Mittogessn |
| breakfast | Breakfast | Frühstück | Früahstück |
| baking | Baking | Backen | Backn |
| drinks | Drinks | Getränke | Getränke |
| holiday | Holiday | Feiertag | Feiertog |
| easy | Easy | Einfach | Oafach |
| vegan | Vegan | Vegan | Vegan |
| middle eastern | Middle Eastern | Nahöstlich | Nahöstlich |

## Infrastructure Details
- **Cloudflare Account ID**: `c2d8b5aa95401b0321bd5160cecfed48`
- **Cloudflare Zone (mittenheim.com)**: `91e2bed5abd1be2ac99630edebc01a53`
- **Pages Project Name**: `mittenheim`
- **GitHub Secrets**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- **Deploy workflow**: Uses `cloudflare/wrangler-action@v3`

## Important Notes
- No border line under the hero section (removed by design choice)
- On the recipes page, the hero also has `style="border-bottom: none;"` inline
- The `images/` directory exists but is empty — no placeholder SVG
- Print styles exist in CSS for recipe pages (hides nav, footer, makes recipe box clean)
- Mobile nav: hamburger toggle at 600px breakpoint, animated X transform
- Recipe grid: 3 columns desktop, 2 tablet (900px), 1 mobile (600px)
