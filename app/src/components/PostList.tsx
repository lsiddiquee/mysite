import { Link } from 'react-router-dom'
import { resolveContentUrl, type PostMeta } from '../content/posts'
import { formatDate } from '../lib/date'

interface PostListProps {
  posts: PostMeta[]
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="muted">No posts yet — check back soon.</p>
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link to={`/blog/${post.slug}`} className="card group block p-5">
            {post.hero && (
              <img
                src={resolveContentUrl(post.hero)}
                alt=""
                className="mb-4 aspect-video w-full rounded-lg border border-stone-200 object-cover dark:border-stone-800"
              />
            )}
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
              {formatDate(post.date)}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-stone-900 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">
              {post.title}
            </h2>
            {post.summary && (
              <p className="mt-2 text-stone-600 dark:text-stone-400">{post.summary}</p>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
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
