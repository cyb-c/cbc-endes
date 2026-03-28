/**
 * Contexto de Idioma (Locale)
 * 
 * Following R5: Idioma y estilo - Sistema multidioma con es-ES por defecto
 * P2.1 Mejora: Soporte multiidioma completo
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Locale } from '../i18n';

const DEFAULT_LOCALE: Locale = 'es-ES';
const STORAGE_KEY = 'cbc-endes-locale';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  availableLocales: Locale[];
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

/**
 * Proveedor de contexto de idioma
 * 
 * @param children - Componentes hijos
 * @param defaultLocale - Idioma por defecto (opcional, usa es-ES por defecto)
 */
export function LocaleProvider({ children, defaultLocale = DEFAULT_LOCALE }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Intentar obtener el idioma guardado en localStorage
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (savedLocale && ['es-ES', 'en-US'].includes(savedLocale)) {
        return savedLocale;
      }
    }
    return defaultLocale;
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Guardar en localStorage para persistencia
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
  };

  const availableLocales: Locale[] = ['es-ES', 'en-US'];

  const value = {
    locale,
    setLocale,
    availableLocales,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook para usar el contexto de idioma
 * 
 * @returns Contexto de idioma con locale actual y función para cambiarlo
 * @throws Error si se usa fuera de LocaleProvider
 */
export function useLocaleContext(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocaleContext debe usarse dentro de un LocaleProvider');
  }
  return context;
}
