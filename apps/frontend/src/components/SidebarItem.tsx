/**
 * SidebarItem Component
 * 
 * Renders a menu function item with navigation and active state
 * Following R5: Idioma y estilo - Código en inglés, documentación en español
 */

import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  funcion: {
    id: number;
    nombre_interno: string;
    nombre_mostrar: string;
    url_path: string;
    icono: string;
  };
  label: string;
  isExpanded: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  funcion,
  label,
  isExpanded,
}) => {
  const location = useLocation();
  const isActive = location.pathname === funcion.url_path;

  return (
    <Link
      to={funcion.url_path}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
    >
      {/* Icon - using emoji for now, will be adapted to SVG icons later */}
      <span className="text-lg">{funcion.icono}</span>
      {isExpanded && <span>{label}</span>}
    </Link>
  );
};
