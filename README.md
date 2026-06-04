# Knowledge Hub — UX × AI

A browsable, filterable library of **prompts, Claude skills, and workflow templates** for
UX × AI work. Built with [Docusaurus](https://docusaurus.io/), hosted free on GitHub Pages.

The point of this repo: **designers contribute without touching git.** They fill out a web
form (a GitHub Issue Form); a maintainer reviews it; automation turns it into a page and opens
a PR; merging publishes it.

## How contribution works

```
Designer fills Issue Form ──► maintainer adds `approved` label
   ──► Action renders Markdown + downloads attachments into static/
   ──► opens a Pull Request ──► CI build passes + maintainer merges
   ──► deploy.yml publishes to GitHub Pages
```

See [`docs/contributing.md`](docs/contributing.md) for the designer-facing guide.

## First-time setup

1. **Create the GitHub repo** and push this project to it.
2. **Set your org/repo** in [`docusaurus.config.ts`](docusaurus.config.ts) — the `ORG` and
   `REPO` constants drive `url`/`baseUrl`. Getting `baseUrl` wrong is the #1 cause of broken
   CSS on the live site (it must be `/<repo>/` for a project site).
3. Update the repo URL in [`.github/ISSUE_TEMPLATE/config.yml`](.github/ISSUE_TEMPLATE/config.yml).
4. **Settings → Pages → Source = "GitHub Actions"** (not the legacy `gh-pages` branch).
5. Create an **`approved`** label and restrict who can apply it to maintainers (label = publish
   authority).
6. Push to `main` — `deploy.yml` builds and publishes automatically.

## Local development

```bash
npm install
npm start        # dev server with live reload
npm run build    # production build (what CI runs on every PR)
npm run serve    # preview the production build locally
```

## Project layout

| Path | What |
|------|------|
| `docs/{prompts,skills,workflows}/` | Library content — one Markdown file per entry; folder = category |
| `docs/tags.yml` | Controlled tag vocabulary (a typo'd tag fails the build) |
| `src/pages/index.tsx` | Custom filterable card gallery (homepage) |
| `src/css/custom.css` | Design system — Apple-airy light + Linear-crisp dark |
| `plugins/knowledge-index/` | Build-time plugin: scans docs frontmatter → gallery data |
| `.github/ISSUE_TEMPLATE/new-experiment.yml` | The designer-facing submission form |
| `.github/workflows/experiment-to-page.yml` | Issue → Markdown → PR pipeline |
| `scripts/render-entry.mjs` | Renders a submission + localizes uploaded media |
| `.github/workflows/{deploy,test-deploy}.yml` | Publish to Pages / build-check every PR |

## Adding a new tag

Edit `docs/tags.yml`, then add the tag to the `tags` dropdown in
`.github/ISSUE_TEMPLATE/new-experiment.yml` and to `KNOWN_TAGS` in `scripts/render-entry.mjs`.

## Optional: Sveltia CMS (phase 2)

For maintainers/power users who want a WYSIWYG editor, Sveltia CMS (open-source) can be added
at `/admin` with a free Cloudflare Worker OAuth proxy. Not required for the form-based flow.
