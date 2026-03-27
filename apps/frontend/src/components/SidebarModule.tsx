/**
 * SidebarModule Component
 * 
 * Renders a menu module with its functions, handles expand/collapse
 * Following R5: Idioma y estilo - Código en inglés, documentación en español
 */

import { useState } from 'react';
import { SidebarItem } from './SidebarItem';

interface SidebarModuleProps {
  module: {
    id: number;
    nombre_interno: string;
    nombre_mostrar: string;
    icono: string;
    orden: number;
    funciones: Array<{
      id: number;
      nombre_interno: string;
      nombre_mostrar: string;
      url_path: string;
      icono: string;
    }>;
  };
  label: string;
  isExpanded: boolean;
}

export const SidebarModule: React.FC<SidebarModuleProps> = ({
  module,
  label,
  isExpanded,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      {/* Module button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Icon - using emoji for now */}
          <span className="text-lg">{module.icono}</span>
          {isExpanded && <span>{label}</span>}
        </div>
        {isExpanded && (
          <svg
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>

      {/* Module functions */}
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {module.funciones.map((funcion) => (
            <SidebarItem
              key={funcion.id}
              funcion={funcion}
              label={label}
              isExpanded={isExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};
