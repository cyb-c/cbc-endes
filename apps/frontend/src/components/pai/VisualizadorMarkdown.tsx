/**
 * Componente Visualizador de Markdown para artefactos PAI
 * P1.2 Corrección Importante: Implementar visualizador de Markdown
 */

import ReactMarkdown from 'react-markdown';

interface VisualizadorMarkdownProps {
  contenido: string;
  className?: string;
}

export function VisualizadorMarkdown({ contenido, className = '' }: VisualizadorMarkdownProps) {
  return (
    <div className={`prose prose-blue max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-medium text-gray-900 mt-3 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-gray-700 my-3 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside my-3 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside my-3 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-700" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600" {...props} />
          ),
          code: ({ node, inline, ...props }) => (
            inline ? (
              <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800" {...props} />
            ) : (
              <code className="block bg-gray-50 rounded-lg p-4 my-3 overflow-x-auto text-sm font-mono text-gray-800" {...props} />
            )
          ),
          pre: ({ node, ...props }) => (
            <pre className="bg-gray-50 rounded-lg p-4 my-3 overflow-x-auto" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-200" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-sm text-gray-700" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-600 hover:text-blue-800 hover:underline" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-600" {...props} />
          ),
        }}
      >
        {contenido}
      </ReactMarkdown>
    </div>
  );
}
