/**
 * Sistema de traducción simple
 * 
 * Following R5: Idioma y estilo - Sistema multidioma con es-ES por defecto
 */

import { PAI_TEXTS, MENU_TEXTS } from './es-ES';

/**
 * Función de traducción simple
 * 
 * Busca la clave en PAI_TEXTS primero, luego en MENU_TEXTS,
 * y retorna la traducción si se encuentra, de lo contrario retorna la clave.
 * 
 * @param key - Clave de traducción
 * @returns Traducción o clave si no se encuentra
 */
export function t(key: string): string {
  // Buscar en PAI_TEXTS primero
  if (key in PAI_TEXTS) {
    return PAI_TEXTS[key];
  }
  
  // Buscar en MENU_TEXTS
  if (key in MENU_TEXTS) {
    return MENU_TEXTS[key];
  }
  
  // Retornar la clave si no se encuentra
  return key;
}
