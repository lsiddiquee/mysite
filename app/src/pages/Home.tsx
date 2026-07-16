import { Link } from 'react-router-dom'
import { config } from '../config'
import { fetchIndex } from '../content/posts'
import { useAsync } from '../lib/useAsync'
import PostList from '../components/PostList'

export default function Home() {
  const { data: posts, error, loading } = useAsync(fetchIndex, [])

  return (
    <div className="space-y-12">
      <section className="border-b border-slate-100 pb-10 dark:border-slate-800/60">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {config.siteTitle}
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{config.siteTagline}</p>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent posts</h2>
          <Link
            to="/blog"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            View all →
          </Link>
        </div>

        <div className="mt-6">
          {loading && <p className="text-slate-500 dark:text-slate-400">Loading…</p>}
          {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
          {posts && <PostList posts={posts.slice(0, 5)} />}
        </div>
      </section>
    </div>
  )
}
