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
  return { ...meta, ...data, content }
}

/** Minimal, browser-safe frontmatter parser (no Buffer dependency). */
function parseFrontmatter(raw: string): { data: Partial<PostMeta>; content: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) {
    return { data: {}, content: raw }
  }
  const parsed = yaml.load(match[1])
  const data = (typeof parsed === 'object' && parsed !== null ? parsed : {}) as Partial<PostMeta>
  return { data, content: raw.slice(match[0].length) }
}
