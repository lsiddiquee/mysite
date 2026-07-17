# mysite

My personal website — a small **React + Vite + TypeScript** app that renders blog
posts written in markdown. Hosted on **GitHub Pages** at
[www.likhansiddiquee.com](https://www.likhansiddiquee.com).

## Why it's structured this way

- **`app/`** — the website and generated route shells. This is the *only* folder that gets deployed.
- **`content/`** — blog posts (markdown) + the `index.json` manifest. Content is
  **fetched at runtime** from this repo via `raw.githubusercontent.com`. Content commits trigger a
  static rebuild only to refresh crawler-visible route metadata.

```text
mysite/
├─ app/                     # React + Vite app (deployed)
│  ├─ src/
│  ├─ public/CNAME          # custom domain for GitHub Pages
│  └─ package.json
├─ content/                 # blog + project content (NOT deployed; fetched at runtime)
│  ├─ index.json            # post manifest
│  ├─ projects.json         # project manifest
│  ├─ assets/*              # images (hero banners, in-post images)
│  ├─ pages/*.md            # standalone pages (e.g. Now, About)
│  ├─ projects/*.md         # project case studies
│  └─ posts/*.md
├─ .devcontainer/           # Node 24 dev container + persistent caches
└─ .github/workflows/deploy.yml
```

The site has **Home**, **Projects** (with per-project case studies), **Blog** (with client-side
search and tag filtering), **Now**, and **About**. Blog posts and projects are both runtime
content. Publishing either triggers a static metadata rebuild without bundling the markdown body.

## Publishing a new post

1. Add a markdown file under `content/posts/`, e.g.
   `content/posts/2026-08-01-my-post.md` (frontmatter optional — see the sample post).
2. Add an entry to `content/index.json`:

   ```json
   {
     "slug": "my-post",
     "title": "My Post",
     "date": "2026-08-01",
     "summary": "One-line summary.",
     "tags": ["notes"],
     "hero": "assets/my-post-hero.jpg",
     "file": "posts/2026-08-01-my-post.md"
   }
   ```

3. Commit and push. The workflow rebuilds static route metadata; the post body remains
  runtime-fetched and is not bundled into the app.

> `index.json` is sorted by date in the app, so ordering in the file doesn't matter.

## Publishing a project

Projects work exactly like posts — a manifest entry plus a markdown case study, both under
`content/`, fetched at runtime. The manifest also drives crawler-visible metadata:

1. Add a case study under `content/projects/`, e.g. `content/projects/my-tool.md`.
2. Add an entry to `content/projects.json`:

   ```json
   {
     "slug": "my-tool",
     "name": "My Tool",
     "summary": "One-line summary.",
     "status": "Active",
     "tags": ["TypeScript"],
     "url": "https://example.com",
     "repo": "https://github.com/you/my-tool",
     "hero": "assets/my-tool-hero.jpg",
     "file": "projects/my-tool.md",
     "featured": true
   }
   ```

3. Commit and push. `url`, `repo`, `hero`, and `featured` are optional; the newest `featured`
   project (or the first one) is highlighted on the home page.

## Comments

Blog posts have comments powered by [Giscus](https://giscus.app) (GitHub Discussions). They live in
this repo's **Discussions → General** category, mapped by page pathname. No backend or secrets —
Giscus uses the repo's public IDs only.

### Images & hero banners

Images are **content**, so they live under `content/assets/` and are fetched at runtime from
the content repo — never bundled into the app.

- **Hero banner** — optional `"hero"` field in the `index.json` entry (shown on the post page
  and as the list-card thumbnail). Use a content-relative path (`assets/my-post-hero.jpg`) or a
  full external URL.
- **In-post images** — write standard markdown: `![alt](assets/diagram.png)`. **Relative paths
  are resolved against `content/`**, so `assets/diagram.png` loads from `content/assets/`.
  Absolute URLs (`https://…`), protocol-relative URLs, and `data:` URIs are used as-is.

> Because pages are served by GitHub Pages but content lives on `raw.githubusercontent.com`, a
> raw relative `src` would otherwise resolve against the page URL and 404 — the app rewrites
> relative content URLs for you, so just author paths relative to `content/`.

## Local development

```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into app/dist
npm run lint       # ESLint (app TS/TSX)
npm run format     # Prettier — formats the whole repo (except Markdown)
npm run preview    # preview the production build
```

Or open the folder in the **dev container** (Node 24, with persistent npm cache and
VS Code server storage volumes so rebuilds stay fast).

### Git hooks

Commit hygiene and **Conventional Commit** messages are enforced by the
[`pre-commit`](https://pre-commit.com) framework (`.pre-commit-config.yaml`). Each concern
has a single owner (no overlap):

- **Prettier** — formats all non-Markdown files repo-wide (TS/JS/JSON/JSONC/CSS/HTML/YAML).
  Markdown is excluded via `.prettierignore`.
- **markdownlint-cli2** — the only tool that touches Markdown (docs + posts).
- **ESLint** — correctness for the app's TypeScript (formatting delegated to Prettier).
- **EditorConfig** — editor defaults for everything else.
- **strip-lockfile-resolved** — keeps `app/package-lock.json` registry-agnostic (see below).
- Plus **gitleaks** (secret scan) and the Conventional Commit check.

### Lockfile is registry-agnostic (versions + integrity only)

`app/package-lock.json` intentionally contains **no `resolved` tarball URLs** — it pins package
**versions** and **`integrity`** hashes only. npm reconstructs each tarball path from the
configured registry at install time and still verifies every package against its `integrity`, so
the same lockfile works with the public `registry.npmjs.org` in CI and with a private mirror
locally, and no internal feed hostname is ever committed. A `pre-commit` hook
([`scripts/strip-lockfile-resolved.sh`](scripts/strip-lockfile-resolved.sh)) strips the URLs
automatically — so after any `npm install` (which re-adds them), just re-stage the lockfile and the
hook cleans it.

**Behind a restricted network** (public registry blocked)? Point npm at your mirror in your
**user-global** `~/.npmrc` (never the repo `.npmrc`, or CI breaks) — npm's default
`replace-registry-host=npmjs` then rewrites the public host to your mirror on the fly:

```bash
npm config set registry https://<your-mirror>/ --location=user
```

The hooks **fail loudly** if the toolchain is missing — run `cd app && npm install` first (the
dev container does this automatically via `post-create.sh`). To set the hooks up manually outside
the container:

```bash
pipx install pre-commit   # or: pip install --user pre-commit
pre-commit install --install-hooks --hook-type pre-commit --hook-type commit-msg
pre-commit run --all-files
```

## Deployment

`.github/workflows/deploy.yml` builds `app/` and publishes `app/dist` to GitHub Pages on pushes to
`main` that touch `app/**` or `content/**`. Content-triggered builds regenerate per-post and
per-project HTML shells for social crawlers; React still fetches markdown at runtime. One-time setup
in the repo:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Pages → Custom domain:** enter `www.likhansiddiquee.com` and enable
   *Enforce HTTPS* (the `app/public/CNAME` file already pins this domain). The apex
   `likhansiddiquee.com` then redirects to `www` automatically.

### DNS for `likhansiddiquee.com`

`www` is the primary host (a `CNAME` to `lsiddiquee.github.io`); the apex is pointed at
GitHub Pages with `A`/`AAAA` records so `likhansiddiquee.com` resolves and redirects to `www`:

```text
CNAME www  lsiddiquee.github.io
A     185.199.108.153
A     185.199.109.153
A     185.199.110.153
A     185.199.111.153
AAAA  2606:50c0:8000::153
AAAA  2606:50c0:8001::153
AAAA  2606:50c0:8002::153
AAAA  2606:50c0:8003::153
```

## Analytics (Cloudflare Web Analytics)

Privacy-first, free, no cookies, no consent banner. To enable:

1. Add the site at
   [Cloudflare Web Analytics](https://dash.cloudflare.com/?to=/:account/web-analytics).
2. Copy the beacon **token** it gives you.
3. Replace `REPLACE_WITH_CF_TOKEN` in [`app/index.html`](app/index.html).

Until the token is set, the analytics beacon is a harmless no-op.
