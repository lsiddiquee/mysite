import yaml from 'js-yaml'
import { contentBase } from '../config'

export interface PostMeta {
  slug: string
  title: string
  date: string
  summary?: string
  tags?: string[]
  file: string
}

export interface Post extends PostMeta {
  content: string
}

interface ContentIndex {
  posts: PostMeta[]
}

/** Fetch the post manifest that drives the listing pages. */
export async function fetchIndex(): Promise<PostMeta[]> {
  const res = await fetch(`${contentBase}/index.json`, { cache: 'no-cache' })
  if (!res.ok) {
    throw new Error(`Could not load content index (HTTP ${res.status}).`)
  }
  const data = (await res.json()) as ContentIndex
  return [...data.posts].sort((a, b) => b.date.localeCompare(a.date))
}

/** Fetch a single post's markdown body by slug. */
export async function fetchPost(slug: string): Promise<Post> {
  const index = await fetchIndex()
  const meta = index.find((p) => p.slug === slug)
  if (!meta) {
    throw new Error('Post not found.')
  }
  const res = await fetch(`${contentBase}/${meta.file}`, { cache: 'no-cache' })
  if (!res.ok) {
    throw new Error(`Could not load post (HTTP ${res.status}).`)
  }
  const raw = await res.text()
  const { data, content } = parseFrontmatter(raw)
  const post = { ...meta, ...data, content }
  // Frontmatter is authored by hand; never let a mistyped scalar (e.g. an
  // unquoted YAML date, which parses to a Date) replace the manifest's
  // canonical YYYY-MM-DD string and break date formatting downstream.
  if (typeof post.date !== 'string') post.date = meta.date
  return post
}

/** Minimal, browser-safe frontmatter parser (no Buffer dependency). */
function parseFrontmatter(raw: string): { data: Partial<PostMeta>; content: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) {
    return { data: {}, content: raw }
  }
  // CORE_SCHEMA keeps scalars as authored (unlike the default schema, which
  // auto-converts unquoted ISO dates to Date objects) — so `date: 2026-07-16`
  // stays the string the rest of the app expects.
  const parsed = yaml.load(match[1], { schema: yaml.CORE_SCHEMA })
  const data = (typeof parsed === 'object' && parsed !== null ? parsed : {}) as Partial<PostMeta>
  return { data, content: raw.slice(match[0].length) }
}
