import { ArrowUpRight, Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { fetchProjects, resolveContentUrl } from '../content/posts'
import { useAsync } from '../lib/useAsync'

export default function Projects() {
  const { data: projects, error, loading } = useAsync(fetchProjects, [])

  return (
    <div className="space-y-10">
      <PageMeta
        title="Projects"
        description="Products and open-source tools built by Likhan Siddiquee."
      />
      <header className="max-w-2xl">
        <p className="eyebrow">Selected work</p>
        <h1 className="page-title">Things I build</h1>
        <p className="page-intro">
          Products and experiments shaped around practical developer problems, documented from the
          constraints up.
        </p>
      </header>

      {loading && <p className="muted">Loading projects…</p>}
      {error && <p className="error-text">{error}</p>}
      {projects && (
        <div className="divide-y divide-stone-200 border-y border-stone-200">
          {projects.map((project) => (
            <article key={project.slug} className="grid gap-6 py-8 md:grid-cols-[1.1fr_1fr]">
              {project.hero && (
                <Link to={`/projects/${project.slug}`} className="overflow-hidden rounded-md">
                  <img
                    src={resolveContentUrl(project.hero)}
                    alt=""
                    className="aspect-video h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                  />
                </Link>
              )}
              <div className="flex flex-col justify-center">
                <p className="eyebrow">{project.status}</p>
                <h2 className="font-display text-3xl font-semibold text-stone-950">
                  {project.name}
                </h2>
                <p className="mt-3 text-stone-600">{project.summary}</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
                  <Link
                    className="text-link inline-flex items-center gap-1"
                    to={`/projects/${project.slug}`}
                  >
                    Read case study <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                  {project.repo && (
                    <a className="text-link inline-flex items-center gap-1" href={project.repo}>
                      <Code2 size={15} aria-hidden="true" /> Source
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
