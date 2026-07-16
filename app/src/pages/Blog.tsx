import { fetchIndex } from '../content/posts'
import { useAsync } from '../lib/useAsync'
import PostList from '../components/PostList'

export default function Blog() {
  const { data: posts, error, loading } = useAsync(fetchIndex, [])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Blog</h1>
      {loading && <p className="text-slate-500 dark:text-slate-400">Loading…</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {posts && <PostList posts={posts} />}
    </div>
  )
}
