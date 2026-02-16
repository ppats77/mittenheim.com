# Mittenheim

A static food blog. Clean, minimal, no build step.

## Local Development

Open `index.html` in a browser, or serve locally:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Create a new project → Connect to your GitHub repo
4. Configure:
   - **Build command**: *(leave empty — no build step)*
   - **Build output directory**: `/`
5. Deploy

Cloudflare will auto-deploy on every push to `main`.

### Custom Domain

In Cloudflare Pages project settings → Custom domains → Add `mittenheim.com`.
Update your domain's DNS nameservers to Cloudflare if not already.

## Adding a New Recipe

1. Create `recipes/[recipe-slug]/index.html` using an existing recipe as a template
2. Add a card for the recipe in `recipes.html` (include `data-tags` for filtering)
3. Add a card to the homepage `index.html` (keep the 6 most recent)
4. Commit and push — Cloudflare deploys automatically

## Structure

```
mittenheim/
├── index.html          # Homepage
├── about.html          # About page
├── recipes.html        # All recipes with filtering
├── css/style.css       # Design system
├── js/main.js          # Mobile nav + filtering
├── images/             # Photos and assets
└── recipes/            # One folder per recipe
    └── [slug]/index.html
```
