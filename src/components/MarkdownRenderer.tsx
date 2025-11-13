import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Customize heading styles
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-semibold mt-3 mb-2 text-gray-900" {...props} />
          ),
          // Customize paragraph styles
          p: ({ node, ...props }) => (
            <p className="mb-4 text-gray-700 leading-relaxed" {...props} />
          ),
          // Customize list styles
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4 text-gray-700" {...props} />
          ),
          // Customize code block styles
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isCodeBlock = !inline && match;
            
            if (isCodeBlock) {
              // Code block - handled by pre element
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            // Inline code
            return (
              <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }: any) => {
            // Code blocks are wrapped in pre, styling is handled by CSS
            return <pre className="mb-4" {...props} />;
          },
          // Customize blockquote styles
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary-500 pl-4 italic my-4 text-gray-600"
              {...props}
            />
          ),
          // Customize link styles
          a: ({ node, ...props }) => (
            <a
              className="text-primary-600 hover:text-primary-700 underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          // Customize table styles
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-300 rounded-lg" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-100" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left font-semibold text-gray-900 border-b border-gray-300" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-gray-700 border-b border-gray-200" {...props} />
          ),
          // Customize horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-gray-300" {...props} />
          ),
          // Customize strong (bold) text
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-900" {...props} />
          ),
          // Customize emphasis (italic) text
          em: ({ node, ...props }) => (
            <em className="italic text-gray-700" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

