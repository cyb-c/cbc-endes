/**
 * Sistema de Tracking para Debugging
 * 
 * Registra cada paso del proceso de creación de proyectos
 * Genera log.json con el tracking completo
 * 
 * Following R4: Accesores tipados para bindings
 */

import type { Env } from '../env'

/**
 * Nivel de log
 */
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'

/**
 * Evento de tracking
 */
export interface TrackingEvent {
  timestamp: string
  paso: string
  nivel: LogLevel
  mensaje: string
  datos?: Record<string, unknown>
  error?: {
    mensaje: string
    stack?: string
    codigo?: string
  }
  duracion_ms?: number
}

/**
 * Contexto de tracking para una operación
 */
export interface TrackingContext {
  id: string
  eventos: TrackingEvent[]
  inicio: number
  estado: 'EN_PROCESO' | 'COMPLETADO' | 'FALLIDO'
}

/**
 * Inicia un nuevo contexto de tracking
 */
export function iniciarTracking(id: string): TrackingContext {
  return {
    id,
    eventos: [],
    inicio: Date.now(),
    estado: 'EN_PROCESO',
  }
}

/**
 * Registra un evento de tracking
 */
export function registrarEvento(
  contexto: TrackingContext,
  paso: string,
  nivel: LogLevel,
  mensaje: string,
  datos?: Record<string, unknown>,
) {
  const evento: TrackingEvent = {
    timestamp: new Date().toISOString(),
    paso,
    nivel,
    mensaje,
    datos,
  }

  contexto.eventos.push(evento)
  
  // También loguear a consola para wrangler tail
  logToConsole(evento)
}

/**
 * Registra un evento de error
 */
export function registrarError(
  contexto: TrackingContext,
  paso: string,
  error: unknown,
  datos?: Record<string, unknown>,
) {
  const errorObj = error instanceof Error ? error : new Error(String(error))
  
  const evento: TrackingEvent = {
    timestamp: new Date().toISOString(),
    paso,
    nivel: 'ERROR',
    mensaje: errorObj.message,
    datos,
    error: {
      mensaje: errorObj.message,
      stack: errorObj.stack,
      codigo: (errorObj as Error & { code?: string }).code,
    },
  }

  contexto.eventos.push(evento)
  contexto.estado = 'FALLIDO'
  
  // Loguear a consola con stack trace completo
  console.error(`[TRACKING ERROR] ${paso}: ${errorObj.message}`, errorObj)
}

/**
 * Marca el tracking como completado
 */
export function completarTracking(contexto: TrackingContext) {
  if (contexto.estado !== 'FALLIDO') {
    contexto.estado = 'COMPLETADO'
  }
}

/**
 * Genera el log.json con todo el tracking
 */
export async function generarLogJSON(
  env: Env,
  contexto: TrackingContext,
  cii?: string,
): Promise<string> {
  const duracionTotal = Date.now() - contexto.inicio
  
  const logCompleto = {
    tracking_id: contexto.id,
    estado: contexto.estado,
    inicio: new Date(contexto.inicio).toISOString(),
    fin: new Date().toISOString(),
    duracion_total_ms: duracionTotal,
    total_eventos: contexto.eventos.length,
    eventos: contexto.eventos,
    resumen: {
      errores: contexto.eventos.filter(e => e.nivel === 'ERROR').length,
      warnings: contexto.eventos.filter(e => e.nivel === 'WARN').length,
      infos: contexto.eventos.filter(e => e.nivel === 'INFO').length,
    },
  }

  // Guardar en R2 si hay CII
  if (cii) {
    try {
      const logKey = `analisis-inmuebles/${cii}/${cii}_log.json`
      await env.r2_binding_01.put(logKey, JSON.stringify(logCompleto, null, 2), {
        httpMetadata: {
          contentType: 'application/json',
        },
      })
    } catch (error) {
      console.error('Error al guardar log.json en R2:', error)
    }
  }

  return JSON.stringify(logCompleto, null, 2)
}

/**
 * Loguea evento a consola para wrangler tail
 */
function logToConsole(evento: TrackingEvent) {
  const logFn = {
    'INFO': console.log,
    'DEBUG': console.log,
    'WARN': console.warn,
    'ERROR': console.error,
  }[evento.nivel]

  const prefix = `[TRACKING:${evento.paso}]`
  
  if (evento.nivel === 'ERROR') {
    logFn(`${prefix} ${evento.mensaje}`, evento.error)
  } else {
    logFn(`${prefix} ${evento.mensaje}`, evento.datos || {})
  }
}

/**
 * Obtiene el último log.json de un proyecto
 */
export async function obtenerLogJSON(
  env: Env,
  cii: string,
): Promise<unknown | null> {
  try {
    const logKey = `analisis-inmuebles/${cii}/${cii}_log.json`
    const object = await env.r2_binding_01.get(logKey)
    
    if (!object) {
      return null
    }
    
    const text = await object.text()
    return JSON.parse(text)
  } catch (error) {
    console.error('Error al obtener log.json:', error)
    return null
  }
}
