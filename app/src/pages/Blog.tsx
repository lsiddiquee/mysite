import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { fetchIndex } from '../content/posts'
import { useAsync } from '../lib/useAsync'
import PostList from '../components/PostList'
import PageMeta from '../components/PageMeta'

export default function Blog() {
  const { data: posts, error, loading } = useAsync(fetchIndex, [])
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const tags = useMemo(() => {
    if (!posts) return []
    return [...new Set(posts.flatMap((post) => post.tags ?? []))].sort()
  }, [posts])

  const filtered = useMemo(() => {
    if (!posts) return []
    const needle = query.trim().toLowerCase()
    return posts.filter((post) => {
      const matchesTag = !activeTag || (post.tags ?? []).includes(activeTag)
      const matchesQuery =
        !needle ||
        post.title.toLowerCase().includes(needle) ||
        (post.summary ?? '').toLowerCase().includes(needle) ||
        (post.tags ?? []).some((tag) => tag.toLowerCase().includes(needle))
      return matchesTag && matchesQuery
    })
  }, [posts, query, activeTag])

  return (
    <div className="space-y-8">
      <PageMeta title="Blog" description="Writing and notes by Likhan Siddiquee." />
      <img
        src="/blog-banner.jpg"
        alt="Technical notes, diagrams, and code fragments being edited into a finished article"
        className="aspect-video w-full rounded-lg object-cover"
      />
      <header>
        <p className="eyebrow">Writing</p>
        <h1 className="page-title">Blog</h1>
      </header>

      {loading && <p className="page-loading">Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {posts && (
        <>
          <div className="space-y-4">
            <div className="relative">
              <Search
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search posts…"
                aria-label="Search posts"
                className="w-full rounded-full border border-stone-300 bg-white py-2.5 pl-9 pr-4 text-sm text-stone-800 outline-none transition-colors focus:border-indigo-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTag === null
                      ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  All
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      activeTag === tag
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="muted">No posts match your search.</p>
          ) : (
            <PostList posts={filtered} />
          )}
        </>
      )}
    </div>
  )
}
