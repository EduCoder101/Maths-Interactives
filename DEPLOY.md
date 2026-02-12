# Deploying to GitHub Pages

For the site to work, **all of these files must be in the same folder** when published:

- `index.html` (landing page)
- `place-value-explorer.html`
- `number-ordering.html`
- `value-detective.html`
- `house-guest-word-sort.html`
- `building-the-houses.html`
- `house-guests-lost.html`
- `rounding.html`
- `decimal-place-value.html`

**If you get 404 errors** when clicking activity links:

1. On GitHub, open your repository and check where the files are.
2. **Option A – Publish from repo root:** Put `index.html` and every activity `.html` file in the **root** of the branch you use for GitHub Pages (e.g. `main`). Do not put them inside a subfolder (e.g. not inside "With progress tracker").
3. **Option B – Publish from a folder:** In GitHub: **Settings → Pages → Source**: choose "Deploy from a branch", then set the branch and **Folder** to the folder that contains `index.html` and all the activity files (e.g. `/docs` or the folder you upload them to). The link from the landing page to e.g. `place-value-explorer.html` only works if that file is in the **same** folder as `index.html`.

Summary: the landing page and every activity link must live in the **same directory** in the published site.
