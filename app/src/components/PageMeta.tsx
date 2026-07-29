import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { config } from '../config'

interface PageMetaProps {
  title: string
  description: string
}

function setContent(selector: string, content: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector)
  if (element) element.content = content
}

// Updates the tags the build already put in the route shell rather than rendering
// new ones: a second <title>/<meta> leaves search-engine behaviour undefined.
export default function PageMeta({ title, description }: PageMetaProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    const fullTitle = title === config.siteTitle ? title : `${title} · ${config.siteTitle}`
    const url = `${config.siteUrl}${pathname}${pathname.endsWith('/') ? '' : '/'}`

    document.title = fullTitle
    setContent('meta[name="description"]', description)
    setContent('meta[property="og:title"]', fullTitle)
    setContent('meta[property="og:description"]', description)
    setContent('meta[property="og:url"]', url)
    setContent('meta[name="twitter:title"]', fullTitle)
    setContent('meta[name="twitter:description"]', description)

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) canonical.href = url
  }, [title, description, pathname])

  return null
}
