import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

const Home = lazy(() => import('./pages/Home'))
const Blog = lazy(() => import('./pages/Blog'))
const Post = lazy(() => import('./pages/Post'))
const Projects = lazy(() => import('./pages/Projects'))
const Project = lazy(() => import('./pages/Project'))
const Now = lazy(() => import('./pages/Now'))
const About = lazy(() => import('./pages/About'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <Suspense fallback={<p className="page-loading">Loading…</p>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<Project />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<Post />} />
          <Route path="now" element={<Now />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
