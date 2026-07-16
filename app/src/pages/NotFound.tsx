import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="space-y-4 text-center py-16">
      <h1 className="text-5xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600">This page could not be found.</p>
      <Link to="/" className="inline-block text-sky-600 hover:underline">
        ← Back home
      </Link>
    </div>
  )
}
