import { config } from '../config'

export default function About() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1>About</h1>
      <p>
        Hi, I&apos;m {config.siteTitle}. This is my personal corner of the web where I write about
        the things I build and learn.
      </p>
      <p>
        The site is a small React app; every post is just markdown committed to the same repository,
        so publishing is as simple as pushing a file.
      </p>
    </div>
  )
}
