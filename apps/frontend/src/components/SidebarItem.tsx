/**
 * SidebarItem Component
 *
 * Renders a menu function item with navigation and active state
 * Following R5: Idioma y estilo - Código en inglés, documentación en español
 * 
 * Actualizado: 2026-03-28 - Fase P2: Unificación de styling con AppSidebar
 */

import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

interface SidebarItemProps {
  funcion: {
    id: number;
    nombre_interno: string;
    nombre_mostrar: string;
    url_path: string;
    icono: string;
  };
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  funcion,
}) => {
  const location = useLocation();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const isActive = location.pathname === funcion.url_path;

  return (
    <li>
      <Link
        to={funcion.url_path}
        className={`menu-dropdown-item ${
          isActive
            ? "menu-dropdown-item-active"
            : "menu-dropdown-item-inactive"
        }`}
      >
        {(isExpanded || isHovered || isMobileOpen) && (
          <>
            <span className="text-lg mr-2">{funcion.icono}</span>
            <span>{funcion.nombre_mostrar}</span>
          </>
        )}
        {!isExpanded && !isHovered && !isMobileOpen && (
          <span className="text-lg">{funcion.icono}</span>
        )}
      </Link>
    </li>
  );
};
