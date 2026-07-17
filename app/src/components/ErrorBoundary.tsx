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
          <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="muted">{this.state.error.message}</p>
          <Link to="/" className="text-link inline-block text-sm font-medium">
            ← Back home
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
