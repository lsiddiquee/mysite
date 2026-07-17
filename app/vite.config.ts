import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import yaml from 'js-yaml'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { config, contentBase } from './src/config'

interface PostManifestEntry {
  slug: string
  title: string
  date: string
  summary?: string
  hero?: string
  file: string
}

interface ProjectManifestEntry {
  slug: string
  name: string
  summary: string
  hero?: string
  file: string
}

interface RouteMetadata {
  path: string
  title: string
  description: string
  image: string
  imageAlt: string
  type: 'article' | 'website'
  usesSiteBanner: boolean
}

const contentDir = resolve(__dirname, '../content')
const distDir = resolve(__dirname, 'dist')
const siteBanner = `${config.siteUrl}/site-banner.jpg`

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(contentDir, file), 'utf8')) as T
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function socialImage(hero?: string): { image: string; usesSiteBanner: boolean } {
  if (!hero || hero.startsWith('data:')) {
    return { image: siteBanner, usesSiteBanner: true }
  }
  if (/^https?:\/\//i.test(hero)) {
    return { image: hero, usesSiteBanner: false }
  }
  if (hero.startsWith('//')) {
    return { image: `https:${hero}`, usesSiteBanner: false }
  }
  return {
    image: `${contentBase}/${hero.replace(/^(\.\/|\/)/, '')}`,
    usesSiteBanner: false,
  }
}

function validateSlug(slug: string, source: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${source} has an invalid slug: ${slug}`)
  }
}

function validatePostFrontmatter(post: PostManifestEntry): void {
  const markdownPath = resolve(contentDir, post.file)
  if (!existsSync(markdownPath)) {
    throw new Error(`Post manifest references a missing file: ${post.file}`)
  }
  const raw = readFileSync(markdownPath, 'utf8')
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return

  const parsed = yaml.load(match[1], { schema: yaml.CORE_SCHEMA })
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Post frontmatter must be a mapping: ${post.file}`)
  }

  const frontmatter = parsed as Record<string, unknown>
  const fields = ['title', 'date', 'summary', 'hero'] as const
  for (const field of fields) {
    const manifestValue = post[field]
    const frontmatterValue = frontmatter[field]
    if (
      manifestValue !== undefined &&
      frontmatterValue !== undefined &&
      frontmatterValue !== manifestValue
    ) {
      throw new Error(
        `${post.file} frontmatter ${field} does not match content/index.json (${String(frontmatterValue)} !== ${manifestValue})`,
      )
    }
  }
}

function replaceRequired(
  html: string,
  pattern: RegExp,
  replacement: string,
  label: string,
): string {
  if (!pattern.test(html)) {
    throw new Error(`Could not find ${label} in built index.html`)
  }
  return html.replace(pattern, replacement)
}

function renderRouteHtml(shell: string, metadata: RouteMetadata): string {
  const fullTitle = `${metadata.title} · ${config.siteTitle}`
  const canonical = `${config.siteUrl}${metadata.path}`
  const values = {
    title: escapeHtml(fullTitle),
    description: escapeHtml(metadata.description),
    canonical: escapeHtml(canonical),
    image: escapeHtml(metadata.image),
    imageAlt: escapeHtml(metadata.imageAlt),
    type: metadata.type,
  }

  let html = shell
  html = replaceRequired(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${values.title}</title>`,
    'title',
  )
  html = replaceRequired(
    html,
    /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${values.description}" />`,
    'description',
  )
  html = replaceRequired(
    html,
    /<link rel="canonical" href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${values.canonical}" />`,
    'canonical URL',
  )

  const replacements: Array<[RegExp, string, string]> = [
    [
      /<meta property="og:type" content="[^"]*"\s*\/>/,
      `<meta property="og:type" content="${values.type}" />`,
      'og:type',
    ],
    [
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${values.title}" />`,
      'og:title',
    ],
    [
      /<meta property="og:description" content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${values.description}" />`,
      'og:description',
    ],
    [
      /<meta property="og:url" content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${values.canonical}" />`,
      'og:url',
    ],
    [
      /<meta property="og:image" content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${values.image}" />`,
      'og:image',
    ],
    [
      /<meta property="og:image:alt" content="[^"]*"\s*\/>/,
      `<meta property="og:image:alt" content="${values.imageAlt}" />`,
      'og:image:alt',
    ],
    [
      /<meta name="twitter:title" content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${values.title}" />`,
      'twitter:title',
    ],
    [
      /<meta name="twitter:description" content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${values.description}" />`,
      'twitter:description',
    ],
    [
      /<meta name="twitter:image" content="[^"]*"\s*\/>/,
      `<meta name="twitter:image" content="${values.image}" />`,
      'twitter:image',
    ],
  ]
  for (const [pattern, replacement, label] of replacements) {
    html = replaceRequired(html, pattern, replacement, label)
  }

  if (!metadata.usesSiteBanner) {
    html = html.replace(
      /^[ \t]*<meta property="og:image:(?:width|height)" content="[^"]*"\s*\/>\r?\n?/gm,
      '',
    )
  }
  return html
}

function routeMetadata(): RouteMetadata[] {
  const { posts } = readJson<{ posts: PostManifestEntry[] }>('index.json')
  const { projects } = readJson<{ projects: ProjectManifestEntry[] }>('projects.json')

  const pageRoutes: RouteMetadata[] = [
    {
      path: '/about',
      title: 'About',
      description: `About ${config.siteTitle}.`,
      image: `${config.siteUrl}/about-banner.jpg`,
      imageAlt: 'Building, travel, photography, and electronics connected by curiosity',
      type: 'website',
      usesSiteBanner: false,
    },
    {
      path: '/blog',
      title: 'Blog',
      description: 'Writing and notes by Likhan Siddiquee.',
      image: `${config.siteUrl}/blog-banner.jpg`,
      imageAlt: 'Technical notes and diagrams being edited into a finished article',
      type: 'website',
      usesSiteBanner: false,
    },
    {
      path: '/projects',
      title: 'Projects',
      description: 'Products and open-source tools built by Likhan Siddiquee.',
      image: `${config.siteUrl}/projects-banner.jpg`,
      imageAlt: 'Connected modules on an engineering workbench',
      type: 'website',
      usesSiteBanner: false,
    },
  ]

  const postRoutes = posts.map((post) => {
    validateSlug(post.slug, 'content/index.json')
    validatePostFrontmatter(post)
    const { image, usesSiteBanner } = socialImage(post.hero)
    return {
      path: `/blog/${post.slug}`,
      title: post.title,
      description: post.summary ?? post.title,
      image,
      imageAlt: post.title,
      type: 'article' as const,
      usesSiteBanner,
    }
  })

  const projectRoutes = projects.map((project) => {
    validateSlug(project.slug, 'content/projects.json')
    if (!existsSync(resolve(contentDir, project.file))) {
      throw new Error(`Project manifest references a missing file: ${project.file}`)
    }
    const { image, usesSiteBanner } = socialImage(project.hero)
    return {
      path: `/projects/${project.slug}`,
      title: project.name,
      description: project.summary,
      image,
      imageAlt: project.name,
      type: 'website' as const,
      usesSiteBanner,
    }
  })

  return [...pageRoutes, ...postRoutes, ...projectRoutes]
}

// GitHub Pages has no server-side rewrites, so deep links (e.g. /blog/hello)
// need 404.html for the SPA. Known content routes also get static HTML shells
// with manifest-driven metadata for crawlers that do not execute JavaScript.
function staticRouteShells() {
  return {
    name: 'static-route-shells',
    closeBundle() {
      const index = resolve(distDir, 'index.html')
      if (existsSync(index)) {
        const shell = readFileSync(index, 'utf8')
        for (const metadata of routeMetadata()) {
          const routeDir = resolve(distDir, metadata.path.slice(1))
          mkdirSync(routeDir, { recursive: true })
          writeFileSync(resolve(routeDir, 'index.html'), renderRouteHtml(shell, metadata))
        }
        copyFileSync(index, resolve(distDir, '404.html'))
      }
    },
  }
}

export default defineConfig({
  // Custom apex domain serves from root, so base stays '/'.
  base: '/',
  plugins: [react(), tailwindcss(), staticRouteShells()],
})
