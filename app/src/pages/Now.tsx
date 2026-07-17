import Markdown from '../components/Markdown'
import PageMeta from '../components/PageMeta'
import { fetchContentPage } from '../content/posts'
import { useAsync } from '../lib/useAsync'

const loadNow = () => fetchContentPage('pages/now.md')

export default function Now() {
  const { data: content, error, loading } = useAsync(loadNow, [])

  return (
    <div className="mx-auto max-w-3xl">
      <PageMeta title="Now" description="What Likhan Siddiquee is building and exploring now." />
      {loading && <p className="muted">Loading now…</p>}
      {error && <p className="error-text">{error}</p>}
      {content && <Markdown>{content}</Markdown>}
    </div>
  )
}
