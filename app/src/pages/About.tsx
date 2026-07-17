import { Link } from 'react-router-dom'
import { config } from '../config'
import Markdown from '../components/Markdown'
import PageMeta from '../components/PageMeta'
import { fetchContentPage } from '../content/posts'
import { useAsync } from '../lib/useAsync'

const loadAbout = () => fetchContentPage('pages/about.md')

export default function About() {
  const { data: content, error, loading } = useAsync(loadAbout, [])

  return (
    <div className="space-y-8">
      <PageMeta title="About" description={`About ${config.siteTitle}.`} />
      <img
        src="/about-banner.jpg"
        alt="A tinker's building blocks, notebook, camera, circuit board, puzzle, and travel map connected by one path"
        className="aspect-video w-full rounded-lg object-cover"
      />
      <header>
        <p className="eyebrow">About</p>
        <h1 className="page-title">Hi, I&apos;m {config.siteTitle}</h1>
      </header>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error-text">{error}</p>}
      {/* The bio body lives in content/pages/about.md so it's editable without a redeploy;
          strip a leading H1 so it doesn't duplicate the styled page title above. */}
      {content && <Markdown>{content.replace(/^#\s+.+\n+/, '')}</Markdown>}

      <div className="flex flex-wrap gap-3 border-t border-stone-200 pt-8 dark:border-stone-800">
        <a className="button-primary" href={config.githubUrl}>
          GitHub
        </a>
        {config.linkedinUrl && (
          <a className="button-secondary" href={config.linkedinUrl}>
            LinkedIn
          </a>
        )}
        <Link className="button-secondary" to="/projects">
          Projects
        </Link>
        <Link className="button-secondary" to="/now">
          Now
        </Link>
      </div>
    </div>
  )
}
