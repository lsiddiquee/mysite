import { NavLink, Outlet, Link } from 'react-router-dom'
import { config } from '../config'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors hover:text-slate-900 ${
    isActive ? 'text-slate-900' : 'text-slate-500'
  }`

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-slate-900">
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
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-slate-500">
          © {new Date().getFullYear()} {config.siteTitle}
        </div>
      </footer>
    </div>
  )
}
