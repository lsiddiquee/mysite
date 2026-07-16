import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Catches render-time errors in a single route so one bad post can't blank the
 * whole app. Reset it on navigation by giving it a `key` that changes per route.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="space-y-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{this.state.error.message}</p>
          <Link
            to="/"
            className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            ← Back home
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
