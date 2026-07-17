import { config } from '../config'
import PageMeta from '../components/PageMeta'

export default function About() {
  return (
    <div className="space-y-8">
      <PageMeta title="About" description={`About ${config.siteTitle}.`} />
      <header>
        <p className="eyebrow">About</p>
        <h1 className="page-title">Hi, I&apos;m {config.siteTitle}</h1>
      </header>
      <div className="prose prose-stone max-w-none dark:prose-invert prose-headings:font-display prose-a:text-indigo-700 dark:prose-a:text-indigo-300">
        <p>{config.siteIntro}</p>
        <p>
          This is my personal corner of the web where I write about the things I build and learn.
          The site is a small React app; every post is just markdown committed to a repository, so
          publishing is as simple as pushing a file.
        </p>
        <p>
          You can find my work on <a href={config.githubUrl}>GitHub</a>, or see what I&apos;m
          focused on right now on the <a href="/now">Now</a> page.
        </p>
      </div>
    </div>
  )
}
