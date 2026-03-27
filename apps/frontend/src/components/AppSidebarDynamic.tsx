/**
 * AppSidebarDynamic Component
 * 
 * Container component that maps modules to SidebarModule
 * Following R5: Idioma y estilo - Código en inglés, documentación en español
 */

import { useMenu } from '../hooks/useMenu';
import { SidebarModule } from './SidebarModule';
import { MENU_TEXTS } from '../i18n/es-ES';

export const AppSidebarDynamic: React.FC<{ isExpanded: boolean }> = ({
  isExpanded,
}) => {
  const { modules, loading, error } = useMenu();

  if (loading) {
    return (
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
        <div className="text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
      <nav className="space-y-1">
        {modules.map((mod) => (
          <SidebarModule
            key={mod.id}
            module={mod}
            label={MENU_TEXTS[mod.nombre_mostrar] || mod.nombre_mostrar}
            isExpanded={isExpanded}
          />
        ))}
      </nav>
    </aside>
  );
};
