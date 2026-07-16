import { Link } from 'react-router-dom'
import type { PostMeta } from '../content/posts'
import { formatDate } from '../lib/date'

interface PostListProps {
  posts: PostMeta[]
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-slate-500">No posts yet — check back soon.</p>
  }

  return (
    <ul className="space-y-8">
      {posts.map((post) => (
        <li key={post.slug}>
          <article>
            <p className="text-sm text-slate-400">{formatDate(post.date)}</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              <Link to={`/blog/${post.slug}`} className="hover:text-sky-600">
                {post.title}
              </Link>
            </h2>
            {post.summary && <p className="mt-2 text-slate-600">{post.summary}</p>}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        </li>
      ))}
    </ul>
  )
}
