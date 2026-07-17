import { useCallback, useMemo } from 'react'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { fetchPostContext, resolveContentUrl, type PostMeta } from '../content/posts'
import { useAsync } from '../lib/useAsync'
import { formatDate } from '../lib/date'
import { getHeadings, getReadingMinutes, getRelatedPosts } from '../lib/post'
import Markdown from '../components/Markdown'
import PageMeta from '../components/PageMeta'
import Comments from '../components/Comments'

export default function Post() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => fetchPostContext(slug), [slug])
  const { data, error, loading } = useAsync(loader, [slug])
  const post = data?.post

  const derived = useMemo(() => {
    if (!data) return null
    const { post, posts } = data
    const index = posts.findIndex((item) => item.slug === post.slug)
    const newer: PostMeta | undefined = index > 0 ? posts[index - 1] : undefined
    const older: PostMeta | undefined =
      index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined
    return {
      headings: getHeadings(post.content),
      minutes: getReadingMinutes(post.content),
      related: getRelatedPosts(post, posts),
      newer,
      older,
    }
  }, [data])

  return (
    <div className="space-y-6">
      <Link to="/blog" className="text-link inline-flex items-center gap-1 text-sm font-semibold">
        <ArrowLeft size={15} aria-hidden="true" /> Back to blog
      </Link>

      {loading && <p className="page-loading">Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {post && derived && (
        <>
          <PageMeta title={post.title} description={post.summary ?? post.title} />
          <article className="space-y-8">
            {post.hero && (
              <img
                src={resolveContentUrl(post.hero)}
                alt=""
                className="aspect-video w-full rounded-2xl border border-stone-200 object-cover dark:border-stone-800"
              />
            )}
            <header className="border-b border-stone-200 pb-6 dark:border-stone-800/60">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
                <span>{formatDate(post.date)}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={13} aria-hidden="true" /> {derived.minutes} min read
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-950 dark:text-white sm:text-4xl">
                {post.title}
              </h1>
              {post.tags && post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {derived.headings.length > 2 && (
              <nav
                aria-label="Table of contents"
                className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/40"
              >
                <p className="eyebrow">On this page</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {derived.headings.map((heading) => (
                    <li key={heading.id} className={heading.depth === 3 ? 'pl-4' : ''}>
                      <a href={`#${heading.id}`} className="text-link">
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <Markdown>{post.content}</Markdown>
          </article>

          {derived.related.length > 0 && (
            <section className="border-t border-stone-200 pt-8 dark:border-stone-800">
              <h2 className="font-display text-lg font-semibold text-stone-900 dark:text-white">
                Related posts
              </h2>
              <ul className="mt-4 space-y-2">
                {derived.related.map((related) => (
                  <li key={related.slug}>
                    <Link to={`/blog/${related.slug}`} className="text-link font-medium">
                      {related.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(derived.newer || derived.older) && (
            <nav className="grid gap-3 border-t border-stone-200 pt-8 dark:border-stone-800 sm:grid-cols-2">
              {derived.older ? (
                <Link to={`/blog/${derived.older.slug}`} className="card p-4">
                  <span className="muted inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
                    <ArrowLeft size={13} aria-hidden="true" /> Older
                  </span>
                  <span className="mt-1 block font-medium text-stone-900 dark:text-white">
                    {derived.older.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {derived.newer && (
                <Link to={`/blog/${derived.newer.slug}`} className="card p-4 sm:text-right">
                  <span className="muted inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide sm:flex-row-reverse">
                    <ArrowRight size={13} aria-hidden="true" /> Newer
                  </span>
                  <span className="mt-1 block font-medium text-stone-900 dark:text-white">
                    {derived.newer.title}
                  </span>
                </Link>
              )}
            </nav>
          )}

          <Comments />
        </>
      )}
    </div>
  )
}
