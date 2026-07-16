# mysite

My personal website — a small **React + Vite + TypeScript** app that renders blog
posts written in markdown. Hosted on **GitHub Pages** at
[www.likhansiddiquee.com](https://www.likhansiddiquee.com).

## Why it's structured this way

- **`app/`** — the website. This is the *only* thing that gets deployed. It is the
  only folder that triggers a redeploy (see the workflow's `paths` filter).
- **`content/`** — blog posts (markdown) + the `index.json` manifest. Content is
  **fetched at runtime** from this repo via `raw.githubusercontent.com`, so
  **publishing a post never rebuilds or redeploys the app**.

```text
mysite/
├─ app/                     # React + Vite app (deployed)
│  ├─ src/
│  ├─ public/CNAME          # custom domain for GitHub Pages
│  └─ package.json
├─ content/                 # blog content (NOT deployed; fetched at runtime)
│  ├─ index.json            # post manifest
│  └─ posts/*.md
├─ .devcontainer/           # Node 24 dev container + persistent caches
└─ .github/workflows/deploy.yml
```

## Publishing a new post (no redeploy)

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
     "file": "posts/2026-08-01-my-post.md"
   }
   ```

3. Commit and push. The post appears immediately — no app rebuild.

> `index.json` is sorted by date in the app, so ordering in the file doesn't matter.

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

`.github/workflows/deploy.yml` builds `app/` and publishes `app/dist` to GitHub Pages
on pushes to `main` that touch `app/**`. One-time setup in the repo:

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
