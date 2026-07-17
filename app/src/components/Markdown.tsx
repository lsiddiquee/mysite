import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import type { Components } from 'react-markdown'
import type { ReactNode } from 'react'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { resolveContentUrl } from '../content/posts'
import { slugifyHeading } from '../lib/post'

interface MarkdownProps {
  children: string
}

/** Flatten a heading's React children to plain text for a stable anchor id. */
function headingText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(headingText).join('')
  return ''
}

const components: Components = {
  h2: ({ children }) => <h2 id={slugifyHeading(headingText(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugifyHeading(headingText(children))}>{children}</h3>,
}

/**
 * Renders GitHub-flavoured markdown with syntax-highlighted code blocks.
 * Relative image/link URLs are resolved against the content repo (so
 * `![](assets/x.png)` works), after the built-in sanitizer strips unsafe
 * schemes like `javascript:`. `h2`/`h3` get slug ids that match the table of
 * contents (see `lib/post.ts`).
 */
export default function Markdown({ children }: MarkdownProps) {
  return (
    <div className="prose prose-stone max-w-none dark:prose-invert prose-headings:font-display prose-a:text-indigo-700 dark:prose-a:text-indigo-300 prose-img:rounded-xl prose-img:border prose-img:border-stone-200 dark:prose-img:border-stone-800 prose-pre:border prose-pre:border-stone-800 prose-pre:bg-stone-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        urlTransform={(url) => resolveContentUrl(defaultUrlTransform(url))}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
