import type { PostMeta } from '../content/posts'

export interface Heading {
  depth: number
  text: string
  id: string
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getHeadings(markdown: string): Heading[] {
  return [...markdown.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((match) => ({
    depth: match[1].length,
    text: match[2].replace(/\s+#+$/, ''),
    id: slugifyHeading(match[2].replace(/\s+#+$/, '')),
  }))
}

export function getReadingMinutes(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`\-[\]()]/g, ' ')
    .trim()
    .split(/\s+/).length
  return Math.max(1, Math.ceil(words / 220))
}

export function getRelatedPosts(post: PostMeta, posts: PostMeta[], limit = 2): PostMeta[] {
  const tags = new Set(post.tags ?? [])
  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      candidate,
      score: (candidate.tags ?? []).filter((tag) => tags.has(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.date.localeCompare(a.candidate.date))
    .slice(0, limit)
    .map(({ candidate }) => candidate)
}
