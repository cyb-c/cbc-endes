/**
 * Servicio de IA para creación de proyectos PAI
 * 
 * Ejecuta el prompt 00_CrearProyecto.json contra OpenAI Responses API
 * para extraer datos estructurados del IJSON y generar el resumen ejecutivo.
 * 
 * Following R4: Accesores tipados para bindings
 * Following R2: Cero hardcoding - prompts desde R2, API key desde KV
 */

import type { Env } from '../env'
import { executePrompt, formatIAError } from '../lib/ia-provider'
import type { TrackingContext } from '../lib/tracking'
import { registrarEvento, registrarError } from '../lib/tracking'

/**
 * Resultado de la creación de proyecto desde IA
 */
export interface CrearProyectoIAResult {
  exito: boolean
  error_codigo?: string
  error_mensaje?: string
  datos?: {
    pro_titulo: string
    pro_portal_nombre: string
    pro_portal_url: string
    pro_operacion: string
    pro_tipo_inmueble: string
    pro_precio: string
    pro_superficie_construida_m2: string
    pro_ciudad: string
    pro_barrio_distrito: string
    pro_direccion: string
    pro_resumen_ejecutivo: string
  }
}

/**
 * Ejecuta el prompt de creación de proyecto contra OpenAI
 * 
 * @param env - Environment bindings
 * @param tracking - Contexto de tracking
 * @param ijson - IJSON del inmueble a procesar
 * @returns Resultado con datos extraídos o error
 */
export async function crearProyectoConIA(
  env: Env,
  tracking: TrackingContext,
  ijson: string,
): Promise<CrearProyectoIAResult> {
  registrarEvento(tracking, 'ia-creacion-inicio', 'INFO', 'Iniciando creación de proyecto con IA', {
    ijson_length: ijson.length,
  })

  try {
    // Paso 1: Ejecutar prompt 00_CrearProyecto.json desde R2
    registrarEvento(tracking, 'ia-ejecutar-prompt', 'INFO', 'Ejecutando prompt desde R2', {
      prompt: '00_CrearProyecto.json',
    })
    
    const result = await executePrompt(env, '00_CrearProyecto.json', { ijson }, tracking)
    
    registrarEvento(tracking, 'ia-prompt-completado', 'INFO', 'Prompt ejecutado correctamente', {
      response_length: result.text?.length || 0,
      has_usage: !!result.usage,
      has_raw: !!result.raw,
      usage_tokens: result.usage?.total_tokens,
      response_preview: result.text?.substring(0, 500),
    })
    
    // Paso 2: Parsear resultado como JSON
    registrarEvento(tracking, 'ia-parse-json', 'INFO', 'Parseando respuesta JSON', {
      response_length: result.text?.length || 0,
      response_first_char: result.text?.charAt(0),
    })
    
    const datos = parsearResultadoJSON(result.text)
    
    if (!datos) {
      registrarError(tracking, 'ia-parse-json-fallido', new Error('La IA no devolvió un JSON válido'), {
        response_text: result.text?.substring(0, 500),
      })
      
      return {
        exito: false,
        error_codigo: 'INVALID_JSON_RESPONSE',
        error_mensaje: 'La IA no devolvió un JSON válido',
      }
    }
    
    registrarEvento(tracking, 'ia-parse-json-ok', 'INFO', 'JSON parseado correctamente', {
      has_titulo: !!datos.pro_titulo,
      has_precio: !!datos.pro_precio,
    })
    
    // Paso 3: Validar campos requeridos
    registrarEvento(tracking, 'ia-validar-datos', 'INFO', 'Validando datos extraídos')
    
    const validacion = validarDatosExtraidos(datos)
    
    if (!validacion.valido) {
      registrarError(tracking, 'ia-validacion-fallida', new Error(validacion.error || 'Validación fallida'), {
        datos: datos,
      })
      
      return {
        exito: false,
        error_codigo: 'INVALID_EXTRACTED_DATA',
        error_mensaje: validacion.error,
      }
    }
    
    registrarEvento(tracking, 'ia-validacion-ok', 'INFO', 'Datos validados correctamente', {
      titulo: datos.pro_titulo,
      ciudad: datos.pro_ciudad,
    })
    
    registrarEvento(tracking, 'ia-creacion-completado', 'INFO', 'Creación con IA completada exitosamente')
    
    return {
      exito: true,
      datos,
    }
  } catch (error) {
    registrarError(tracking, 'ia-creacion-error', error, {
      ijson_preview: ijson.substring(0, 200),
    })
    
    const errorMessage = formatIAError(error)
    
    // Clasificar error para manejo apropiado
    const classifiedError = error as Error & { type?: string; retryable?: boolean }
    
    let errorCodigo = 'OPENAI_ERROR'
    if (classifiedError.type === 'RATE_LIMIT') {
      errorCodigo = 'RATE_LIMIT_EXCEEDED'
    } else if (classifiedError.type === 'AUTHENTICATION') {
      errorCodigo = 'INVALID_API_KEY'
    } else if (classifiedError.message.includes('KV')) {
      errorCodigo = 'SECRETS_KV_ERROR'
    } else if (classifiedError.message.includes('R2')) {
      errorCodigo = 'PROMPT_R2_ERROR'
    }
    
    return {
      exito: false,
      error_codigo: errorCodigo,
      error_mensaje: errorMessage,
    }
  }
}

/**
 * Parsear resultado de IA como JSON
 */
function parsearResultadoJSON(text: string): CrearProyectoIAResult['datos'] | null {
  try {
    // Intentar parsear directamente
    const datos = JSON.parse(text)
    return datos as CrearProyectoIAResult['datos']
  } catch {
    // Intentar extraer JSON de texto con markdown o texto adicional
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      try {
        const datos = JSON.parse(jsonMatch[0])
        return datos as CrearProyectoIAResult['datos']
      } catch {
        return null
      }
    }
    
    return null
  }
}

/**
 * Validar datos extraídos de la IA
 */
function validarDatosExtraidos(
  datos: NonNullable<CrearProyectoIAResult['datos']>,
): { valido: boolean; error?: string } {
  // Campos requeridos mínimos para crear proyecto
  if (!datos.pro_titulo || datos.pro_titulo.trim() === '') {
    return { valido: false, error: 'El título del proyecto es requerido' }
  }

  if (!datos.pro_tipo_inmueble || datos.pro_tipo_inmueble.trim() === '') {
    return { valido: false, error: 'El tipo de inmueble es requerido' }
  }

  if (!datos.pro_precio || datos.pro_precio.trim() === '') {
    return { valido: false, error: 'El precio es requerido' }
  }

  if (!datos.pro_ciudad || datos.pro_ciudad.trim() === '') {
    return { valido: false, error: 'La ciudad es requerida' }
  }

  // Campos opcionales pero recomendados
  if (!datos.pro_portal_nombre) {
    datos.pro_portal_nombre = 'Desconocido'
  }

  if (!datos.pro_portal_url) {
    datos.pro_portal_url = ''
  }

  if (!datos.pro_operacion) {
    datos.pro_operacion = 'venta'
  }

  if (!datos.pro_superficie_construida_m2) {
    datos.pro_superficie_construida_m2 = '0'
  }

  if (!datos.pro_barrio_distrito) {
    datos.pro_barrio_distrito = ''
  }
  
  if (!datos.pro_direccion) {
    datos.pro_direccion = ''
  }
  
  if (!datos.pro_resumen_ejecutivo) {
    datos.pro_resumen_ejecutivo = '## RESUMEN\n\nNo fue posible elaborar un resumen fiable con la información proporcionada.'
  }
  
  return { valido: true }
}
