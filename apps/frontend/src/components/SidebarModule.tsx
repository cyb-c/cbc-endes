/**
 * SidebarModule Component
 *
 * Renders a menu module with its functions, handles expand/collapse
 * Following R5: Idioma y estilo - Código en inglés, documentación en español
 * 
 * Actualizado: 2026-03-28 - Fase P2: Unificación de styling con AppSidebar
 */

import { useState } from 'react';
import { SidebarItem } from './SidebarItem';
import { useSidebar } from '../context/SidebarContext';
import { ChevronDownIcon } from '../icons';

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
}

export const SidebarModule: React.FC<SidebarModuleProps> = ({
  module,
  label,
}) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="mb-2">
      {/* Module button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`menu-item group ${
          isOpen ? "menu-item-active" : "menu-item-inactive"
        } cursor-pointer ${
          !isExpanded && !isHovered
            ? "lg:justify-center"
            : "lg:justify-start"
        }`}
      >
        <span
          className={`menu-item-icon-size ${
            isOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"
          }`}
        >
          {/* Icon - using emoji for now */}
          <span className="text-lg">{module.icono}</span>
        </span>
        {(isExpanded || isHovered || isMobileOpen) && (
          <span className="menu-item-text">{label}</span>
        )}
        {(isExpanded || isHovered || isMobileOpen) && (
          <ChevronDownIcon
            className={`ml-auto w-5 h-5 transition-transform ${
              isOpen ? "rotate-180 text-brand-500" : ""
            }`}
          />
        )}
      </button>

      {/* Module functions */}
      {isOpen && (isExpanded || isHovered || isMobileOpen) && (
        <div className="overflow-hidden transition-all duration-300">
          <ul className="mt-2 space-y-1 ml-9">
            {module.funciones.map((funcion) => (
              <SidebarItem
                key={funcion.id}
                funcion={funcion}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};
