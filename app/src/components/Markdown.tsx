import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface MarkdownProps {
  children: string
}

/** Renders GitHub-flavoured markdown with syntax-highlighted code blocks. */
export default function Markdown({ children }: MarkdownProps) {
  return (
    <div className="prose prose-slate max-w-none prose-pre:bg-slate-900 prose-a:text-sky-600">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
