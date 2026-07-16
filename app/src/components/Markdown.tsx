import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { resolveContentUrl } from '../content/posts'

interface MarkdownProps {
  children: string
}

/**
 * Renders GitHub-flavoured markdown with syntax-highlighted code blocks.
 * Relative image/link URLs are resolved against the content repo (so
 * `![](assets/x.png)` works), after the built-in sanitizer strips unsafe
 * schemes like `javascript:`.
 */
export default function Markdown({ children }: MarkdownProps) {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:rounded-xl prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-800 prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        urlTransform={(url) => resolveContentUrl(defaultUrlTransform(url))}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
