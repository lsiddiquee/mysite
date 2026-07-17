import { useCallback } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { config } from '../config'
import { fetchIndex, fetchProjects, resolveContentUrl } from '../content/posts'
import { useAsync } from '../lib/useAsync'
import PostList from '../components/PostList'
import PageMeta from '../components/PageMeta'

const loadHome = () => Promise.all([fetchIndex(), fetchProjects()])

export default function Home() {
  const loader = useCallback(loadHome, [])
  const { data, error, loading } = useAsync(loader, [])
  const posts = data?.[0]
  const featured = data?.[1].find((project) => project.featured) ?? data?.[1][0]

  return (
    <div className="space-y-14">
      <PageMeta title={config.siteTitle} description={config.siteTagline} />

      <section className="border-b border-stone-200 pb-12 dark:border-stone-800/60">
        <p className="eyebrow">{config.siteTagline}</p>
        <h1 className="page-title text-4xl sm:text-6xl">{config.siteTitle}</h1>
        <p className="page-intro max-w-2xl">{config.siteIntro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/projects" className="button-primary">
            View projects <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link to="/blog" className="button-secondary">
            Read the blog
          </Link>
        </div>
      </section>

      {loading && <p className="page-loading">Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {featured && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold text-stone-900 dark:text-white">
              Featured project
            </h2>
            <Link to="/projects" className="text-link text-sm font-medium">
              All projects →
            </Link>
          </div>
          <Link
            to={`/projects/${featured.slug}`}
            className="card mt-6 grid gap-5 p-5 sm:grid-cols-[1fr_1.2fr] sm:items-center"
          >
            {featured.hero && (
              <img
                src={resolveContentUrl(featured.hero)}
                alt=""
                className="aspect-video w-full rounded-lg border border-stone-200 object-cover dark:border-stone-800"
              />
            )}
            <div>
              <p className="eyebrow">{featured.status}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-stone-900 dark:text-white">
                {featured.name}
              </h3>
              <p className="mt-2 text-stone-600 dark:text-stone-400">{featured.summary}</p>
            </div>
          </Link>
        </section>
      )}

      {posts && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold text-stone-900 dark:text-white">
              Recent posts
            </h2>
            <Link to="/blog" className="text-link text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="mt-6">
            <PostList posts={posts.slice(0, 4)} />
          </div>
        </section>
      )}
    </div>
  )
}
