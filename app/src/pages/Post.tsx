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
      <Link to="/blog" className="text-sm text-sky-600 hover:underline">
        ← Back to blog
      </Link>

      {loading && <p className="text-slate-500">Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {post && (
        <article className="space-y-6">
          <header>
            <p className="text-sm text-slate-400">{formatDate(post.date)}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">{post.title}</h1>
          </header>
          <Markdown>{post.content}</Markdown>
        </article>
      )}
    </div>
  )
}
