/**
 * Componente Visualizador de Markdown para PAI
 * G51-7: Renderizado de contenido Markdown enriquecido
 */

interface VisualizadorMarkdownProps {
  contenido: string;
}

export function VisualizadorMarkdown({ contenido }: VisualizadorMarkdownProps) {
  if (!contenido) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay contenido disponible
      </div>
    );
  }

  // Parseo simple de Markdown a HTML
  // Soporta: encabezados, negritas, cursivas, listas, párrafos
  const parseMarkdown = (markdown: string): string => {
    let html = markdown;

    // Encabezados (debe ir primero para evitar conflictos)
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h1>');

    // Negritas
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

    // Cursivas
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Listas no ordenadas
    html = html.replace(/^\s*[-*+]\s+(.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
    html = html.replace(/(<li class="ml-4 list-disc">.*<\/li>\n?)+/g, '<ul class="my-4">$&</ul>');

    // Párrafos (líneas que no son encabezados ni listas)
    const lines = html.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<li') ||
        trimmed.startsWith('</ul') ||
        trimmed === ''
      ) {
        return line;
      }
      return `<p class="my-3 text-gray-700 leading-relaxed">${trimmed}</p>`;
    });
    html = processedLines.join('\n');

    return html;
  };

  return (
    <div 
      className="prose prose-blue max-w-none"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(contenido) }}
    />
  );
}
