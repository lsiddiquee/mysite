/**
 * Site-wide configuration.
 *
 * Blog content lives in the same repo under /content but is NOT part of the
 * deployed app bundle — it is fetched at runtime from raw.githubusercontent.com.
 * That is what lets you publish a new post by committing markdown, with no
 * rebuild or redeploy of the app.
 */
export const config = {
  owner: 'lsiddiquee',
  repo: 'mysite',
  branch: 'main',
  contentPath: 'content',
  siteTitle: 'Likhan Siddiquee',
  siteTagline: 'Writing, notes, and projects.',
  siteIntro:
    'I build developer tools and write about the engineering decisions behind them — agents, local-first architecture, and the practical edges of shipping software.',
  githubUrl: 'https://github.com/lsiddiquee',
} as const

export const contentBase = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.contentPath}`
