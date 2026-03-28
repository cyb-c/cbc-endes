/**
 * Componente de Paginación para listas de proyectos PAI
 * P1.1 Corrección Importante: Implementar paginación UI
 */

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  totalResultados: number;
  porPagina: number;
  onPageChange: (pagina: number) => void;
  onPorPaginaChange: (porPagina: number) => void;
}

export function Paginacion({
  paginaActual,
  totalPaginas,
  totalResultados,
  porPagina,
  onPageChange,
  onPorPaginaChange,
}: PaginacionProps) {
  const mostrarInicio = (paginaActual - 1) * porPagina + 1;
  const mostrarFin = Math.min(paginaActual * porPagina, totalResultados);

  const handleAnterior = () => {
    if (paginaActual > 1) {
      onPageChange(paginaActual - 1);
    }
  };

  const handleSiguiente = () => {
    if (paginaActual < totalPaginas) {
      onPageChange(paginaActual + 1);
    }
  };

  // Generar números de página para mostrar
  const obtenerNumerosPagina = () => {
    const numeros: number[] = [];
    const maxVisible = 5;
    
    let inicio = Math.max(1, paginaActual - Math.floor(maxVisible / 2));
    let fin = Math.min(totalPaginas, inicio + maxVisible - 1);
    
    // Ajustar si estamos cerca del final
    if (fin - inicio < maxVisible - 1) {
      inicio = Math.max(1, fin - maxVisible + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }
    
    return numeros;
  };

  if (totalPaginas <= 1) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      {/* Información de resultados */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={handleAnterior}
          disabled={paginaActual === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={handleSiguiente}
          disabled={paginaActual === totalPaginas}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>

      {/* Información de resultados (desktop) */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{mostrarInicio}</span> a{' '}
            <span className="font-medium">{mostrarFin}</span> de{' '}
            <span className="font-medium">{totalResultados}</span> resultados
          </p>
        </div>

        {/* Controles de paginación */}
        <div className="flex items-center space-x-4">
          {/* Selector de tamaño de página */}
          <div className="flex items-center space-x-2">
            <label htmlFor="porPagina" className="text-sm text-gray-700">
              Por página:
            </label>
            <select
              id="porPagina"
              value={porPagina}
              onChange={(e) => onPorPaginaChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Navegación de páginas */}
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* Botón Anterior */}
            <button
              onClick={handleAnterior}
              disabled={paginaActual === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Anterior</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Números de página */}
            {obtenerNumerosPagina().map((numero) => (
              <button
                key={numero}
                onClick={() => onPageChange(numero)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  numero === paginaActual
                    ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                }`}
              >
                {numero}
              </button>
            ))}

            {/* Botón Siguiente */}
            <button
              onClick={handleSiguiente}
              disabled={paginaActual === totalPaginas}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Siguiente</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
