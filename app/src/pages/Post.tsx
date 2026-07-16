import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPost } from '../content/posts'
import { useAsync } from '../lib/useAsync'
import { formatDate } from '../lib/date'
import Markdown from '../components/Markdown'

export default function Post() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => fetchPost(slug), [slug])
  const { data: post, error, loading } = useAsync(loader, [slug])

  return (
    <div className="space-y-6">
      <Link
        to="/blog"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
      >
        ← Back to blog
      </Link>

      {loading && <p className="text-slate-500 dark:text-slate-400">Loading…</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {post && (
        <article className="space-y-8">
          <header className="border-b border-slate-100 pb-6 dark:border-slate-800/60">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {formatDate(post.date)}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {post.title}
            </h1>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
          <Markdown>{post.content}</Markdown>
        </article>
      )}
    </div>
  )
}
