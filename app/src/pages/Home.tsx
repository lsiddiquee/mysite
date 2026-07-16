import { Link } from 'react-router-dom'
import { config } from '../config'
import { fetchIndex } from '../content/posts'
import { useAsync } from '../lib/useAsync'
import PostList from '../components/PostList'

export default function Home() {
  const { data: posts, error, loading } = useAsync(fetchIndex, [])

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">{config.siteTitle}</h1>
        <p className="mt-3 text-lg text-slate-600">{config.siteTagline}</p>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent posts</h2>
          <Link to="/blog" className="text-sm text-sky-600 hover:underline">
            View all →
          </Link>
        </div>

        <div className="mt-6">
          {loading && <p className="text-slate-500">Loading…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {posts && <PostList posts={posts.slice(0, 5)} />}
        </div>
      </section>
    </div>
  )
}
