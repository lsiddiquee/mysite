import { Link } from 'react-router-dom'
import { resolveContentUrl, type PostMeta } from '../content/posts'
import { formatDate } from '../lib/date'

interface PostListProps {
  posts: PostMeta[]
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400">No posts yet — check back soon.</p>
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            to={`/blog/${post.slug}`}
            className="group block rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-indigo-500/50 dark:hover:bg-slate-900"
          >
            {post.hero && (
              <img
                src={resolveContentUrl(post.hero)}
                alt=""
                className="mb-4 aspect-video w-full rounded-lg border border-slate-200 object-cover dark:border-slate-800"
              />
            )}
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {formatDate(post.date)}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {post.title}
            </h2>
            {post.summary && (
              <p className="mt-2 text-slate-600 dark:text-slate-400">{post.summary}</p>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
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
          </Link>
        </li>
      ))}
    </ul>
  )
}
