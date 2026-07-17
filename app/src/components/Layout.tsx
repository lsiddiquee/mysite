import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { config } from '../config'
import ErrorBoundary from './ErrorBoundary'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors hover:text-stone-900 dark:hover:text-white ${
    isActive ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400'
  }`

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects', end: false },
  { to: '/blog', label: 'Blog', end: false },
  { to: '/now', label: 'Now', end: false },
  { to: '/about', label: 'About', end: false },
]

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-800 dark:bg-stone-950 dark:text-stone-200">
      <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-stone-50/80 backdrop-blur dark:border-stone-800/70 dark:bg-stone-950/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="font-display text-lg font-semibold tracking-tight text-stone-900 dark:text-white"
          >
            {config.siteTitle}
          </Link>
          <nav className="flex gap-4 sm:gap-6">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
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

      <footer className="border-t border-stone-200 dark:border-stone-800">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
          <span>
            © {new Date().getFullYear()} {config.siteTitle}
          </span>
          <a className="text-link font-medium" href="https://github.com/lsiddiquee">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
