import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface MarkdownProps {
  children: string
}

/** Renders GitHub-flavoured markdown with syntax-highlighted code blocks. */
export default function Markdown({ children }: MarkdownProps) {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-900">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
