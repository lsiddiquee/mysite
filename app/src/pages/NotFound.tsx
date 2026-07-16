import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-5xl font-bold text-slate-900 dark:text-white">404</h1>
      <p className="text-slate-600 dark:text-slate-400">This page could not be found.</p>
      <Link
        to="/"
        className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
      >
        ← Back home
      </Link>
    </div>
  )
}
