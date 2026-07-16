import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { config } from '../config'
import ErrorBoundary from './ErrorBoundary'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors hover:text-slate-900 dark:hover:text-white ${
    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
  }`

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            {config.siteTitle}
          </Link>
          <nav className="flex gap-6">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/blog" className={navLinkClass}>
              Blog
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <ErrorBoundary key={pathname}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} {config.siteTitle}
        </div>
      </footer>
    </div>
  )
}
