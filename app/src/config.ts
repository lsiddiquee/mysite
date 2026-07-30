/**
 * Site-wide configuration.
 *
 * Blog content lives in the same repo under /content but is NOT part of the
 * deployed app bundle — it is fetched at runtime from raw.githubusercontent.com.
 * That keeps post bodies out of the app bundle. Content commits still trigger
 * a static rebuild so crawler-visible route metadata stays current.
 */
export const config = {
  owner: 'lsiddiquee',
  repo: 'mysite',
  branch: 'main',
  contentPath: 'content',
  siteUrl: 'https://www.likhansiddiquee.com',
  siteTitle: 'Likhan Siddiquee',
  siteTagline: 'Writing, notes, and projects.',
  siteIntro:
    'I build developer tools and write about engineering — agents, local-first architecture, and the practical edges of shipping software.',
  authorBio:
    'Software engineer at Microsoft building developer tools and writing about agents, local-first architecture, and the practical edges of shipping software.',
  githubUrl: 'https://github.com/lsiddiquee',
  // Set to your LinkedIn profile URL to show the LinkedIn link (About page).
  linkedinUrl: 'https://www.linkedin.com/in/likhan' as string,
} as const

export const contentBase = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.contentPath}`

// Shared by the app's <PageMeta> and the build's route shells so the rendered tags
// and the crawler-visible ones cannot drift apart.
export const pageMeta = {
  '/': { title: config.siteTitle, description: config.siteIntro },
  '/about': {
    title: 'About',
    description:
      'Tech lead turned hands-on engineer at Microsoft. Twenty years of shipping software, the side projects it produced, and the writing in between.',
  },
  '/blog': { title: 'Blog', description: `Writing and notes by ${config.siteTitle}.` },
  '/projects': {
    title: 'Projects',
    description: `Products and open-source tools built by ${config.siteTitle}.`,
  },
  '/now': { title: 'Now', description: `What ${config.siteTitle} is focused on right now.` },
} as const
