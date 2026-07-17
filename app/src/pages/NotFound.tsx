import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <PageMeta title="Not found" description="This page could not be found." />
      <h1 className="font-display text-5xl font-bold text-stone-900 dark:text-white">404</h1>
      <p className="muted">This page could not be found.</p>
      <Link to="/" className="text-link inline-block text-sm font-medium">
        ← Back home
      </Link>
    </div>
  )
}
