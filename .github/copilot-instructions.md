# mysite — GitHub Copilot Instructions

> Authoritative short-form baseline for **mysite**, a personal website + blog. This document is
> the source of truth for conventions — keep **it** current when a convention, boundary,
> architecture decision, or gotcha changes, and keep [README.md](../README.md) in sync when
> user-facing structure or the deploy/publish flow changes. As the app grows, document each new
> surface in whichever doc fits (user-facing → README; conventions/architecture → here).

## Repository overview

**mysite** is a personal website — a small **React + Vite + TypeScript** app that renders blog
posts written in **markdown**. It is hosted on **GitHub Pages** at
[likhansiddiquee.com](https://likhansiddiquee.com).

The defining idea is **content/app isolation**: the app is deployed, but **post bodies are not
bundled into it**. Markdown lives in `content/` in this same repo and is **fetched at runtime** from
`raw.githubusercontent.com`. Content changes trigger a static rebuild only so committed manifests
can generate crawler-visible per-route metadata.

Status: **initial build** — app scaffold, runtime content loader, Pages deploy workflow, and dev
container are in place.

## Non-negotiable rules (project-wide)

1. **Content/app isolation.** `app/` is the deployed application; `content/` bodies are fetched at
  runtime. NEVER import markdown bodies into the React bundle. The build may read committed
  manifests and post frontmatter only to emit static route metadata. Publishing stays a pure
  `content/` commit.
2. **Path-gated deploys.** The deploy workflow triggers on `app/**`, `content/**`, and its own file.
  Content-triggered builds exist to refresh crawler-visible metadata; do not add unrelated paths.
3. **GitHub Pages only.** Hosting is GitHub Pages with a custom apex domain. Do not introduce a
   different host, a server/backend, or any runtime that Pages cannot serve (it is static only).
4. **SPA fallback is required.** Pages has no server rewrites; deep links depend on the
   `index.html → 404.html` copy produced by the `spaFallback` Vite plugin. Never remove it, and
   keep `base: '/'` (apex domain serves from root).
5. **Custom domain is pinned.** `app/public/CNAME` = `www.likhansiddiquee.com` (the primary
   host; the apex `likhansiddiquee.com` stays in DNS and redirects to it). Do not change or drop
   it without an explicit request.
6. **No secrets in the repo or client bundle.** The Cloudflare Analytics beacon token is the only
   public identifier that belongs in `app/index.html`. Never add API keys, tokens, or secrets —
   everything ships to the browser.

## Architecture & boundaries

```text
mysite/
  app/                      # React + Vite app — the ONLY thing deployed
    src/
      config.ts             # owner/repo/branch + content base URL (single source of truth)
      content/posts.ts      # runtime content loader (index.json + projects.json + markdown fetch)
      components/            # Layout, Markdown, PostList, PageMeta, Comments — presentational
      pages/                # Home, Blog, Post, Projects, Project, Now, About, NotFound (lazy-loaded)
      lib/                  # useAsync, date + post (reading time / headings / related) helpers
    public/CNAME            # custom domain
    vite.config.ts          # base '/', tailwind, SPA fallback + route metadata shells
  content/                  # blog + project data — NOT deployed, fetched at runtime
    index.json              # post manifest (blog list source of truth)
    projects.json           # project manifest (projects list source of truth)
    assets/*                # images (hero banners + in-post images), fetched at runtime
    posts/*.md              # post bodies (optional frontmatter)
    projects/*.md           # project case studies
    pages/*.md              # standalone pages (e.g. Now, About)
  .github/workflows/deploy.yml
  .devcontainer/            # Node 24 container + persistent caches
```

- **`config.ts` owns the content location.** The `owner`/`repo`/`branch`/`contentPath` and the
  derived `contentBase` live there once — never hardcode `raw.githubusercontent.com` URLs elsewhere.
- **Images are content, resolved via `resolveContentUrl` (in `content/posts.ts`).** Hero banners
  and in-post images live under `content/assets/` and are fetched at runtime like everything else
  — never bundle them into the app. A post's optional `hero` (manifest field) and any relative
  markdown `src`/`href` are rewritten against `contentBase` by `resolveContentUrl`; absolute,
  protocol-relative, and `data:` URLs pass through untouched. Relative paths are relative to the
  `content/` root (`assets/x.png`). Pages are served by GitHub Pages but content lives on
  `raw.githubusercontent.com`, so a raw relative `src` would resolve against the page URL and
  404 — always route content URLs through `resolveContentUrl`.
- **`content/index.json` is the listing source of truth.** Listing pages read the manifest; the
  post page merges manifest metadata with the file's frontmatter. Keep both consistent.
  **`content/projects.json` is the same pattern for projects** — a manifest entry plus a case-study
  markdown file under `content/projects/`. Standalone pages (e.g. Now) are plain markdown under
  `content/pages/`, loaded via `fetchContentPage`.
- **Committed manifests own generated metadata.** The Vite build emits
  `dist/blog/<slug>/index.html` and `dist/projects/<slug>/index.html` from `content/index.json` and
  `content/projects.json`. Repeated post frontmatter fields must match the manifest or the build
  fails. Route shells contain metadata plus the normal SPA entry point; markdown bodies remain
  runtime-fetched.
- **Pages/components stay presentational.** Data fetching goes through `content/posts.ts` and the
  `useAsync` hook — components don't call `fetch` directly.
- **Frontmatter parsing is browser-safe.** Use the small `js-yaml`-based parser in `posts.ts`; do
  NOT add `gray-matter` or anything that needs a Node `Buffer` polyfill in the browser.

## Conventions

- **TypeScript strict** everywhere (see `app/tsconfig.json`); no `any` escape hatches.
- **Styling: Tailwind CSS v4** via `@tailwindcss/vite` (config is CSS-first in `src/index.css` — no
  `tailwind.config.js`). Markdown renders with the `@tailwindcss/typography` `prose` classes. Do
  not add a second styling system.
- **Routing: `react-router-dom`** with `BrowserRouter`. New routes go in `app/src/App.tsx` under
  the shared `Layout`, and are **lazy-loaded** via `React.lazy` + a `Suspense` fallback (keeps the
  markdown/highlight and Giscus code out of the initial chunk). Add new routes the same way.
- **Icons: `lucide-react`.** Note this build ships no brand marks (no `Github` icon) — use a
  generic icon (e.g. `Code2`) for source links.
- **Comments: `@giscus/react`** (GitHub Discussions, `General` category, mapped by pathname) in the
  `Comments` component on post pages. The `repoId`/`categoryId` are public identifiers, not secrets.
  Discussions must stay enabled on the repo for comments to render.
- **Page metadata: the `PageMeta` component** renders `<title>`/`<meta>` via React 19's document
  metadata hoisting — this updates the browser tab and JS-rendering crawlers only. Social/link
  scrapers don't run JS, so they still see the static site-wide tags in `app/index.html`; keep those.
- **Design system lives in `src/index.css`** (`@layer components`: `.eyebrow`, `.page-title`,
  `.button-primary`, `.card`, `.tag-chip`, etc.) on a warm **stone** neutral + **indigo** accent
  palette, with a serif `--font-display` for headings. Reuse these classes instead of re-inlining
  long utility strings; markdown heading anchors (`h2`/`h3` ids) come from `slugifyHeading` in
  `lib/post.ts` so the table of contents and headings stay in sync.
- **Markdown: `react-markdown` + `remark-gfm` + `rehype-highlight`.** Render only through the
  `Markdown` component so plugins/highlighting stay consistent. It also sets `urlTransform` to
  `defaultUrlTransform` (keeps the built-in `javascript:` sanitizer) composed with
  `resolveContentUrl`, so relative content URLs work — don't drop either half.
- **Dates are date-only (`YYYY-MM-DD`)** and formatted as UTC via `lib/date.ts` — never construct
  `new Date(dateString)` in local time (it can show the previous day in negative offsets).
- **Node 24**, npm (a committed `app/package-lock.json` backs CI's `npm ci`).

## Tooling & code style (single owner · fail loud)

Each concern has exactly ONE owner — do not add a second tool that formats the same files:

- **Prettier** (`.prettierrc.json`) — the single formatter for **all non-Markdown** files
  repo-wide (ts/tsx/js/json/jsonc/css/html/yaml). `.prettierignore` excludes Markdown,
  `node_modules`, `dist`, and the lockfile.
- **markdownlint-cli2** (`.markdownlint-cli2.jsonc`) — the ONLY tool that touches Markdown
  (docs + blog posts). Prettier never formats `.md`.
- **ESLint** (`app/eslint.config.js`) — correctness/quality for `app/` TS+TSX only; formatting
  is delegated to Prettier via `eslint-config-prettier`. Do not add stylistic ESLint rules.
- **EditorConfig** (`.editorconfig`) — editor-time defaults (charset, LF, final newline, indent)
  for everything, including files no formatter owns (shell, dotfiles).
- **strip-lockfile-resolved** (`scripts/strip-lockfile-resolved.sh`) — the ONLY tool that touches
  `app/package-lock.json`: strips every `resolved` tarball URL so the lockfile pins **versions +
  `integrity` only** and stays registry-agnostic. Prettier ignores the lockfile; do not add another
  tool that rewrites it.
- **gitleaks** (`.gitleaks.toml`) — secret scanning; extends the default ruleset and adds ONE
  narrow allowlist: the Cloudflare Web Analytics beacon token (`data-cf-beacon` line in
  `app/index.html`) is a public id, not a secret. Don't broaden the allowlist for anything else.
- **pre-commit** (`.pre-commit-config.yaml`) wires the above plus gitleaks + Conventional Commits.

**Fail loud — hard rule (applies everywhere: hooks, checks, CI, and setup/bootstrap scripts).**
Never wrap a step in a guard that hides failure or silently skips when a tool is missing — no
`|| true`, no `command -v x || exit 0`, no `... >/dev/null 2>&1 || true`, no "skipping" fallbacks.
A missing toolchain or a failed step is an error to surface, not hide. Shell scripts run with
`set -euo pipefail`; the dev container's `post-create.sh` fails the build if any step fails, and the
local ESLint/Prettier hooks call `app/node_modules/.bin` directly and error if absent (run
`cd app && npm install` first). Genuine conditionals (e.g. `if [ -d dir ]`, or "try pipx else pip
then verify it's on PATH") are branching, not error-hiding, and are fine.

## Build & tooling gotchas (verified)

- **The lockfile carries NO `resolved` URLs — versions + `integrity` only.**
  `app/package-lock.json` is registry-agnostic on purpose: npm rebuilds tarball URLs from the
  configured `registry` at install and verifies each package via `integrity`, so the same lockfile
  works with the public registry in CI and a private mirror locally, and no internal feed host is
  ever committed. `npm install` **re-adds** `resolved` (baking in the current registry host) — the
  `strip-lockfile-resolved` pre-commit hook removes them again; after `npm install`, re-stage the
  lockfile. Prefer `npm ci` for plain installs. On a restricted network, set the mirror in the
  **user-global** `~/.npmrc` (`npm config set registry <url> --location=user`), NEVER a repo
  `.npmrc` (that would break CI on public runners).
- **Single `app/tsconfig.json` — no project references.** The build is `tsc && vite build`. Do NOT
  reintroduce a composite `tsconfig.node.json` via `references`: with `noEmit` it fails with
  TS6310 (`referenced project may not disable emit`). `vite.config.ts` is type-checked by being in
  the single tsconfig's `include`, with `types: ["node", "vite/client"]`.
- **Devcontainer builds from `.devcontainer/Dockerfile` (not a bare `image:`).** The
  `mysite-vscode-server` volume is mounted at `/home/node/.vscode-server` to persist extensions +
  workspaceStorage. A fresh named volume is created **root-owned**, and VS Code installs its server
  there (as `node`) BEFORE `post-create.sh` runs → `Permission denied`. The Dockerfile pre-creates
  that dir `node`-owned so the empty volume inherits `node:node` on first mount (Docker copies the
  image dir's ownership into a fresh volume). If you ever hit this again, the volume was created
  before the fix — remove it (`docker volume rm mysite-vscode-server`) and rebuild.

## Publishing model (do not break)

Adding a post = (1) a markdown file under `content/posts/`, (2) one entry in `content/index.json`.
Adding a project = (1) a case study under `content/projects/`, (2) one entry in
`content/projects.json`. Standalone pages are a single markdown file under `content/pages/`.
No app code change is needed. A content-only commit triggers a static rebuild for route metadata;
the markdown body remains runtime-fetched.

### RSS / sitemap (deliberately deferred)

Content-triggered builds now make same-origin RSS and sitemap generation possible without bundling
markdown bodies into React. They remain deferred for YAGNI; when added, generate them from the same
committed manifests that own route metadata and keep post bodies runtime-fetched.

## Engineering discipline (DRY · YAGNI)

- This is a small personal site — **prefer the smallest thing that ships.** Don't add state
  managers, SSR, a CMS, or backend services speculatively (YAGNI).
- First instance stays local; extract a shared helper only once a pattern is genuinely repeated.
- Keep changes small, local, reversible; fix root causes, not symptoms.
- Respect the `app/` vs `content/` seam before inventing new ones.

## Context persistence (never lose work on tangents)

Long sessions can exceed the context window, and the assistant **memory store (`/memories/`) is
ephemeral** — a container/devcontainer rebuild wipes it. Assume anything not written to a durable
location is lost. Choose a storage tier by durability **and** audience:

- **`.local/` — in-progress, LOCAL-only** (gitignored, survives rebuild, never shared). Create
  `.local/scratch/` if missing and keep work-in-progress notes there; use it freely as a scratchpad.
- **`/memories/` — short-lived session notes only** (EPHEMERAL: wiped on rebuild, never shared).
  Fine for the current conversation's working state; never the home for anything durable.
- **Git-tracked docs (`README.md`, `.github/copilot-instructions.md`) — durable, shared knowledge.**
  Anything useful to future-me or anyone else (structure, deploy/publish flow, conventions, a
  non-obvious gotcha) goes here, in the **same change** that produced it.

- **One task-state file:** for any non-trivial, multi-step task, maintain
  `.local/scratch/task-state.md` — current focus, a ledger of in-flight items
  (`pending` / `in-progress` / `blocked` / `done` + next step), open threads, and key findings.
  Create it before the first edit.
- **Keep it lean — roll off DONE work.** When it grows past ~200 lines or several fully-done
  blocks, move completed sections to `.local/scratch/task-state-completed.md` (newest-first
  archive) and migrate any durable finding into the git-tracked docs in the same pass.
- **Checkpoint as you work** — before switching focus or deep-diving, the moment you spot a new
  sub-issue, and after completing meaningful steps. Re-read and reconcile it when resuming.

Rule of thumb: **in-progress → `.local/`; useful to everyone → git-tracked docs; `/memories/` is
scratch that vanishes on rebuild.**

## Assistant working style

- **Show live command output — don't pre-filter.** When running terminal commands, do NOT
  reflexively pipe through `tail`/`head`/`grep`; run them plainly so progress and the full output
  stay visible. Only filter or redirect to a file when the output is genuinely expected to be large
  enough to blow out the context window.

## Pattern capture

When you re-explain the same thing, fix the same class of issue repeatedly, or hit a non-obvious
gotcha, **capture it in git so nobody rediscovers it** — a durable build/tooling/AI-edit gotcha or
verified practice goes in `.github/copilot-instructions.md` (or `README.md` if it's user-facing).
Do not leave a durable gotcha only in `/memories/` (ephemeral) — migrate it.

## Definition of Done (every change)

1. **Green build.** `npm run build` and `npm run lint` in `app/` pass (`tsc` strict + `vite build`
   - ESLint), and `dist/` still contains `404.html` and `CNAME`. Prettier + markdownlint are clean
   (`pre-commit run --all-files`).
2. **Isolation intact.** No path bundles markdown bodies into React; generated route shells contain
  manifest metadata only. The deploy filter includes only `app/**`, `content/**`, and itself.
3. **Boundaries respected.** Content access stays behind `content/posts.ts` + `config.ts`; no
   direct `fetch`/hardcoded raw URLs in components.
4. **No secrets** added to the repo or client bundle.
5. **Docs current.** Update the docs the change touches, in the **same** change: user-facing
   structure / deploy / publishing flow → [README.md](../README.md); a new convention, boundary,
   architecture decision, dependency, or gotcha → this `copilot-instructions.md` (and add a new
   doc if a feature warrants one). Not README-only — as the app gains features, keep the matching
   doc current.
6. **Conventional Commit** message (e.g. `feat(blog): add tag filtering`, `fix(post): correct date
   formatting`) — enforced by the `commit-msg` hook (see `.pre-commit-config.yaml`).

## Validation commands

```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc strict + vite build → app/dist (also emits 404.html)
npm run lint       # ESLint (app TS/TSX)
npm run format     # Prettier — formats the whole repo (except Markdown)
npm run preview    # preview the production build (http://localhost:4173)
```

Git hooks (repo root) are managed by the Python `pre-commit` framework and installed
automatically by the dev container's `post-create.sh`. Run them manually with:

```bash
pre-commit run --all-files   # Prettier + markdownlint + ESLint + gitleaks + commit-msg
```

## Things to avoid

- Do **not** bundle `content/` markdown bodies into React or emit post bodies into route shells.
- Do **not** remove `content/**` from deploy paths; content commits must refresh route metadata.
- Do **not** remove the `spaFallback` 404 copy or change `base` away from `'/'`.
- Do **not** hardcode `raw.githubusercontent.com` URLs outside `config.ts`.
- Do **not** call `fetch` directly from components — go through `content/posts.ts`.
- Do **not** add `gray-matter` or Node-only APIs that break in the browser.
- Do **not** introduce a backend, SSR, or a non-Pages host.
- Do **not** put secrets/tokens in the repo or the client bundle (the Cloudflare beacon token is
  the only allowed public identifier).
- Do **not** add a second styling system alongside Tailwind.
