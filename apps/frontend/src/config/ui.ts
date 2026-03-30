/**
 * Configuración de UI y Branding del Proyecto
 * 
 * Este archivo centraliza todos los valores de configuración de UI
 * para facilitar cambios futuros sin modificar el código estructural.
 * 
 * Fecha: 2026-03-30
 */

// ============================================================================
// Branding de la Empresa
// ============================================================================

export const BRANDING = {
  // Título de la página (se muestra en la pestaña del navegador)
  page_title: 'Proyectos de Análisis Inmobiliarios • C&B Consulting',
  
  // Logo y nombre de la empresa
  empresa: {
    logo_url: 'https://srrhhmx.s-ul.eu/BgmSpQcc',
    nombre: 'C&B Consulting',
  },
  
  // Usuario actual (hardcoding permitido según requerimiento)
  usuario: {
    nombre: 'Asesor Inmobiliario',
    // Usar icono en lugar de avatar
    usar_icono: true,
  },
} as const;

// ============================================================================
// Empresa Desarrolladora (Sidebar Widget)
// ============================================================================

export const DESARROLLADOR = {
  logo_url: 'https://srrhhmx.s-ul.eu/D2Flxfr7',
  texto: 'PáginaVIVA: Diseño y desarrollo',
  enlace: 'https://www.paginaviva.net/',
  abrir_en_nueva_pestana: true,
} as const;

// ============================================================================
// Visibilidad de Elementos de UI
// ============================================================================
// Los elementos marcados como "ocultar, no eliminar" pueden reactivarse
// cambiando estos valores a true en el futuro.

export const UI_VISIBILIDAD = {
  // Barra de búsqueda en el header (ref 4)
  busqueda: false,
  
  // Icono de notificaciones (ref 5)
  notificaciones_icono: false,
  
  // Panel desplegable de notificaciones (ref 6)
  notificaciones_panel: false,
  
  // Menú desplegable de usuario (ref 8)
  usuario_menu: false,
  
  // Bloque promocional del sidebar (ref 9) - false = eliminar
  sidebar_promo: false,
} as const;

// ============================================================================
// Exportación de Configuración Completa
// ============================================================================

export const CONFIG = {
  branding: BRANDING,
  desarrollador: DESARROLLADOR,
  ui_visibilidad: UI_VISIBILIDAD,
} as const;

export default CONFIG;
