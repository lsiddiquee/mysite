import { useCallback } from 'react'
import { ArrowLeft, Code2, ExternalLink } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown'
import PageMeta from '../components/PageMeta'
import { fetchProject, resolveContentUrl } from '../content/posts'
import { useAsync } from '../lib/useAsync'

export default function Project() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => fetchProject(slug), [slug])
  const { data: project, error, loading } = useAsync(loader, [slug])

  return (
    <div className="space-y-8">
      <Link
        to="/projects"
        className="text-link inline-flex items-center gap-1 text-sm font-semibold"
      >
        <ArrowLeft size={15} aria-hidden="true" /> All projects
      </Link>
      {loading && <p className="muted">Loading project…</p>}
      {error && <p className="error-text">{error}</p>}
      {project && (
        <article className="space-y-10">
          <PageMeta title={project.name} description={project.summary} />
          <header className="grid gap-8 border-b border-stone-200 pb-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="eyebrow">{project.status}</p>
              <h1 className="page-title">{project.name}</h1>
              <p className="page-intro max-w-2xl">{project.summary}</p>
            </div>
            <div className="flex gap-3">
              {project.url && (
                <a className="button-primary" href={project.url}>
                  <ExternalLink size={16} aria-hidden="true" /> Try it
                </a>
              )}
              {project.repo && (
                <a
                  className="button-secondary"
                  href={project.repo}
                  aria-label="View source on GitHub"
                >
                  <Code2 size={17} aria-hidden="true" />
                </a>
              )}
            </div>
          </header>
          {project.hero && (
            <img
              src={resolveContentUrl(project.hero)}
              alt=""
              className="aspect-[16/8] w-full rounded-md object-cover"
            />
          )}
          <div className="mx-auto max-w-3xl">
            <Markdown>{project.content.replace(/^# .+\n+/, '')}</Markdown>
          </div>
        </article>
      )}
    </div>
  )
}
