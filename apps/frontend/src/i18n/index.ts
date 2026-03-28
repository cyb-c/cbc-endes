/**
 * Sistema de traducción multiidioma
 *
 * Following R5: Idioma y estilo - Sistema multidioma con es-ES por defecto
 */

import { PAI_TEXTS as PAI_TEXTS_ES, MENU_TEXTS as MENU_TEXTS_ES } from './es-ES';
import { PAI_TEXTS as PAI_TEXTS_EN, MENU_TEXTS as MENU_TEXTS_EN } from './en-US';

/**
 * Tipos de idioma soportados
 */
export type Locale = 'es-ES' | 'en-US';

/**
 * Estructura de textos por idioma
 */
interface TextsByLocale {
  PAI_TEXTS: Record<string, string>;
  MENU_TEXTS: Record<string, string>;
}

/**
 * Mapas de textos por idioma
 */
const TEXTS_BY_LOCALE: Record<Locale, TextsByLocale> = {
  'es-ES': {
    PAI_TEXTS: PAI_TEXTS_ES,
    MENU_TEXTS: MENU_TEXTS_ES,
  },
  'en-US': {
    PAI_TEXTS: PAI_TEXTS_EN,
    MENU_TEXTS: MENU_TEXTS_EN,
  },
};

/**
 * Idioma por defecto (español de España según R5)
 */
const DEFAULT_LOCALE: Locale = 'es-ES';

/**
 * Hook para obtener y cambiar el idioma actual
 * 
 * @returns Objeto con locale actual y función para cambiarlo
 */
export function useLocale() {
  // En una implementación completa, esto usaría useState y localStorage
  // Por ahora, retorna el locale por defecto
  const locale: Locale = DEFAULT_LOCALE;

  const setLocale = (newLocale: Locale) => {
    // En una implementación completa, esto actualizaría el estado y guardaría en localStorage
    console.log(`Changing locale to: ${newLocale}`);
  };

  return { locale, setLocale };
}

/**
 * Función de traducción
 *
 * Busca la clave en el idioma actual, primero en PAI_TEXTS, luego en MENU_TEXTS,
 * y retorna la traducción si se encuentra, de lo contrario retorna la clave.
 *
 * @param key - Clave de traducción
 * @param locale - Idioma opcional (usa el por defecto si no se especifica)
 * @returns Traducción o clave si no se encuentra
 */
export function t(key: string, locale?: Locale): string {
  const currentLocale = locale || DEFAULT_LOCALE;
  const texts = TEXTS_BY_LOCALE[currentLocale];

  // Buscar en PAI_TEXTS primero
  if (key in texts.PAI_TEXTS) {
    return texts.PAI_TEXTS[key];
  }

  // Buscar en MENU_TEXTS
  if (key in texts.MENU_TEXTS) {
    return texts.MENU_TEXTS[key];
  }

  // Retornar la clave si no se encuentra
  return key;
}

/**
 * Función para obtener todos los textos de un idioma
 *
 * @param locale - Idioma opcional (usa el por defecto si no se especifica)
 * @returns Objeto con todos los textos del idioma
 */
export function getTexts(locale?: Locale): TextsByLocale {
  const currentLocale = locale || DEFAULT_LOCALE;
  return TEXTS_BY_LOCALE[currentLocale];
}

/**
 * Función para verificar si un idioma está disponible
 *
 * @param locale - Idioma a verificar
 * @returns true si el idioma está disponible
 */
export function isLocaleAvailable(locale: string): locale is Locale {
  return locale in TEXTS_BY_LOCALE;
}

/**
 * Lista de idiomas disponibles
 */
export const AVAILABLE_LOCALES: Locale[] = ['es-ES', 'en-US'];

/**
 * Nombres amigables de los idiomas
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  'es-ES': 'Español (España)',
  'en-US': 'English (US)',
};
