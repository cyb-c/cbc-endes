/**
 * Real Estate Analysis Workflow Service (WF-ANALISIS)
 * 
 * Executes a 7-step sequential workflow using OpenAI Responses API
 * to generate 7 Markdown artifacts for property analysis projects.
 * 
 * Following R5: Code in English, documentation in Spanish
 * Following R2: No hardcoding - prompts from R2, API key from KV
 * Following R4: Typed accessors for bindings
 */

import type { Env } from '../env'
import type { TrackingContext } from '../lib/tracking'
import { registrarEvento, registrarError, completarTracking } from '../lib/tracking'
import { getR2Bucket, getDB, getSecretsKV } from '../env'
import { callOpenAIResponses, formatOpenAIError } from '../lib/openai-client'
import type {
  EjecutarPasoConIAResult,
  EjecutarAnalisisConIAResult,
  InputsParaPaso,
  PasoAnalisisClave,
  ArtefactoArchivo,
  TipoArtefacto,
} from '../types/analisis'
import {
  PASOS_ANALISIS,
  MAPEO_ARCHIVOS,
  ESTADOS_PERMITIDOS_ANALISIS,
  ERROR_CODES,
  EVENTOS_ANALISIS,
  TIPOS_ARTEFACTOS,
} from '../types/analisis'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get OpenAI API key from KV
 */
async function getOpenAIKey(env: Env): Promise<string> {
  const secretsKV = getSecretsKV(env)
  const key = await secretsKV.get('OPENAI_API_KEY')
  
  if (!key) {
    throw new Error('OPENAI_API_KEY not found in KV secrets')
  }
  
  return key
}

/**
 * Validate project state allows analysis execution
 */
export function validarEstadoParaAnalisis(estadoId: number): boolean {
  return ESTADOS_PERMITIDOS_ANALISIS.includes(estadoId as any)
}

/**
 * Validate dependencies for steps 5-7
 * Steps 5-7 require IJSON + MD 1-4 to exist
 */
export function validarDependencias(
  resultados: Record<string, string>
): boolean {
  const requeridos = [
    'analisis-fisico',
    'analisis-estrategico',
    'analisis-financiero',
    'analisis-regulatorio',
  ]
  
  return requeridos.every(clave => resultados[clave] && resultados[clave].trim().length > 0)
}

/**
 * Replace placeholders in prompt template
 * Supports multiple placeholders: %%ijson%%, %%analisis-fisico%%, etc.
 */
function reemplazarPlaceholders(
  template: string,
  inputs: InputsParaPaso
): string {
  let result = template
  
  for (const [placeholder, value] of Object.entries(inputs)) {
    // Escape value for JSON string
    const escapedValue = JSON.stringify(value).slice(1, -1)
    result = result.replace(new RegExp(`%%${placeholder}%%`, 'g'), escapedValue)
  }
  
  return result
}

// ============================================================================
// Step Execution Functions
// ============================================================================

/**
 * Execute a single analysis step with OpenAI
 * 
 * @param env - Environment bindings
 * @param promptNombre - Prompt file name (e.g., '01_ActivoFisico.json')
 * @param inputs - Input data for the step (IJSON for steps 1-4, IJSON+MD1-4 for steps 5-7)
 * @param tracking - Tracking context for observability
 * @returns Result with generated content or error
 */
export async function ejecutarPasoConIA(
  env: Env,
  promptNombre: string,
  inputs: InputsParaPaso,
  tracking: TrackingContext
): Promise<EjecutarPasoConIAResult> {
  const r2Bucket = getR2Bucket(env)
  
  try {
    // 1. Load prompt from R2
    registrarEvento(tracking, `cargar-prompt-${promptNombre}`, 'INFO', `Cargando prompt desde R2: ${promptNombre}`)
    
    const promptKey = `prompts-ia/${promptNombre}`
    const promptObject = await r2Bucket.get(promptKey)
    
    if (!promptObject) {
      registrarError(tracking, `prompt-not-found-${promptNombre}`, new Error(`Prompt no encontrado: ${promptNombre}`))
      
      return {
        exito: false,
        error_codigo: ERROR_CODES.PROMPT_NOT_FOUND,
        error_mensaje: `Prompt no encontrado: ${promptNombre}`,
      }
    }
    
    const promptTemplate = await promptObject.text()
    
    // 2. Replace placeholders
    const promptBody = reemplazarPlaceholders(promptTemplate, inputs)
    
    // 3. Execute prompt via OpenAI Responses API
    registrarEvento(tracking, `ejecutar-openai-${promptNombre}`, 'INFO', 'Ejecutando prompt con OpenAI')
    
    const openAIKey = await getOpenAIKey(env)
    const result = await callOpenAIResponses(
      openAIKey,
      JSON.parse(promptBody),
      tracking
    )
    
    // 4. Extract text content
    const contenido = result.text.trim()
    
    if (!contenido) {
      registrarError(tracking, `empty-response-${promptNombre}`, new Error('La IA no generó contenido'))
      
      return {
        exito: false,
        error_codigo: ERROR_CODES.EMPTY_RESPONSE,
        error_mensaje: 'La IA no generó contenido',
      }
    }
    
    registrarEvento(tracking, `paso-${promptNombre}-completado`, 'INFO', `Paso completado: ${promptNombre}`, {
      contenido_length: contenido.length,
    })
    
    return {
      exito: true,
      contenido,
    }
    
  } catch (error) {
    registrarError(tracking, `ejecutar-paso-${promptNombre}`, error)
    
    return {
      exito: false,
      error_codigo: ERROR_CODES.OPENAI_ERROR,
      error_mensaje: formatOpenAIError(error),
    }
  }
}

// ============================================================================
// Main Workflow Function
// ============================================================================

/**
 * Execute complete 7-step analysis workflow
 * 
 * @param env - Environment bindings
 * @param db - D1 database instance
 * @param proyectoId - Project ID
 * @param cii - Project CII (Código de Identificación de Inmueble)
 * @param ijson - IJSON content (read from R2)
 * @param tracking - Tracking context
 * @returns Result with generated artifacts or error
 */
export async function ejecutarAnalisisConIA(
  env: Env,
  db: D1Database,
  proyectoId: number,
  cii: string,
  ijson: string,
  tracking: TrackingContext
): Promise<EjecutarAnalisisConIAResult> {
  const r2Bucket = getR2Bucket(env)
  
  try {
    // Register analysis start
    registrarEvento(tracking, EVENTOS_ANALISIS.ANALISIS_INICIO, 'INFO', 'Iniciando análisis con IA de 7 pasos')
    
    // ========================================================================
    // Steps 1-4: Execute with IJSON only
    // ========================================================================
    registrarEvento(tracking, 'ejecutar-pasos-1-4', 'INFO', 'Ejecutando pasos 1-4 (input: IJSON)')
    
    const resultadosPasos1a4: Record<string, string> = {}
    
    for (const paso of PASOS_ANALISIS.slice(0, 4)) {
      registrarEvento(tracking, `inicio-paso-${paso.numero}`, 'INFO', `Ejecutando paso ${paso.numero}: ${paso.nombre}`)
      
      const resultado = await ejecutarPasoConIA(
        env,
        paso.archivo,
        { ijson },
        tracking
      )
      
      if (!resultado.exito) {
        registrarError(tracking, `fallo-paso-${paso.numero}`, new Error(resultado.error_mensaje))
        
        return {
          exito: false,
          error_codigo: resultado.error_codigo,
          error_mensaje: `Error en paso ${paso.numero} (${paso.nombre}): ${resultado.error_mensaje}`,
        }
      }
      
      resultadosPasos1a4[paso.clave] = resultado.contenido!
      
      registrarEvento(tracking, EVENTOS_ANALISIS.PASO_N_COMPLETADO.replace('n', paso.numero.toString()), 'INFO', `Paso ${paso.numero} completado: ${paso.nombre}`)
    }
    
    // ========================================================================
    // Validate dependencies before steps 5-7
    // ========================================================================
    registrarEvento(tracking, 'validar-dependencias', 'INFO', 'Validando dependencias para pasos 5-7')
    
    const dependenciasCompletas = validarDependencias(resultadosPasos1a4)
    
    if (!dependenciasCompletas) {
      registrarError(tracking, 'dependencias-incompletas', new Error('No se completaron los análisis base'))
      
      return {
        exito: false,
        error_codigo: ERROR_CODES.DEPENDENCIAS_INCOMPLETAS,
        error_mensaje: 'No se completaron los análisis base requeridos',
      }
    }
    
    // ========================================================================
    // Steps 5-7: Execute with IJSON + MD 1-4 (5 inputs)
    // ========================================================================
    registrarEvento(tracking, 'ejecutar-pasos-5-7', 'INFO', 'Ejecutando pasos 5-7 (input: IJSON + MD 1-4)')
    
    const inputsParaPasos5a7: InputsParaPaso = {
      ijson,
      'analisis-fisico': resultadosPasos1a4['analisis-fisico'],
      'analisis-estrategico': resultadosPasos1a4['analisis-estrategico'],
      'analisis-financiero': resultadosPasos1a4['analisis-financiero'],
      'analisis-regulatorio': resultadosPasos1a4['analisis-regulatorio'],
    }
    
    const resultadosPasos5a7: Record<string, string> = {}
    
    for (const paso of PASOS_ANALISIS.slice(4)) {
      registrarEvento(tracking, `inicio-paso-${paso.numero}`, 'INFO', `Ejecutando paso ${paso.numero}: ${paso.nombre}`)
      
      const resultado = await ejecutarPasoConIA(
        env,
        paso.archivo,
        inputsParaPasos5a7,
        tracking
      )
      
      if (!resultado.exito) {
        registrarError(tracking, `fallo-paso-${paso.numero}`, new Error(resultado.error_mensaje))
        
        return {
          exito: false,
          error_codigo: resultado.error_codigo,
          error_mensaje: `Error en paso ${paso.numero} (${paso.nombre}): ${resultado.error_mensaje}`,
        }
      }
      
      resultadosPasos5a7[paso.clave] = resultado.contenido!
      
      registrarEvento(tracking, EVENTOS_ANALISIS.PASO_N_COMPLETADO.replace('n', paso.numero.toString()), 'INFO', `Paso ${paso.numero} completado: ${paso.nombre}`)
    }
    
    // ========================================================================
    // Persist artifacts in R2
    // ========================================================================
    registrarEvento(tracking, EVENTOS_ANALISIS.PERSISTIR_ARTEFACTOS, 'INFO', 'Persistiendo artefactos en R2')

    const todosLosResultados = { ...resultadosPasos1a4, ...resultadosPasos5a7 }
    const artefactosGuardados: Array<{ nombre: string; ruta: string; contenido: string }> = []

    for (const [nombreAnalisis, contenido] of Object.entries(todosLosResultados) as Array<[PasoAnalisisClave, string]>) {
      const paso = PASOS_ANALISIS.find(p => p.clave === nombreAnalisis)
      if (!paso) continue

      const fileName = MAPEO_ARCHIVOS[nombreAnalisis].replace('{cii}', cii)
      const key = `analisis-inmuebles/${cii}/${fileName}`

      await r2Bucket.put(key, contenido, {
        httpMetadata: {
          contentType: 'text/markdown',
        },
      })

      artefactosGuardados.push({
        nombre: nombreAnalisis,
        ruta: key,
        contenido,
      })

      registrarEvento(tracking, `persistir-${nombreAnalisis}`, 'INFO', `Artefacto persistido: ${key}`)
    }
    
    // ========================================================================
    // Register artifacts in database (PAI_ART_artefactos)
    // ========================================================================
    registrarEvento(tracking, EVENTOS_ANALISIS.REGISTRAR_EN_BD, 'INFO', 'Registrando artefactos en base de datos')
    
    // Get VAL_id for each artifact type
    const tiposArtefactosResult = await db
      .prepare(`
        SELECT v.VAL_id, v.VAL_codigo
        FROM PAI_VAL_valores v
        JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
        WHERE a.ATR_codigo = 'TIPO_ARTEFACTO'
          AND v.VAL_codigo IN (${TIPOS_ARTEFACTOS.map(() => '?').join(', ')})
      `)
      .bind(...TIPOS_ARTEFACTOS)
      .all()
    
    const tiposArtefactos = tiposArtefactosResult.results as Array<{ VAL_id: number; VAL_codigo: string }>
    const fechaGeneracion = new Date().toISOString()
    
    const artefactosGenerados: Array<{
      id: number
      tipo: string
      ruta_r2: string
      fecha_generacion: string
    }> = []
    
    for (const artefacto of artefactosGuardados) {
      const tipoVal = tiposArtefactos.find(
        t => t.VAL_codigo === artefacto.nombre.toUpperCase().replace('-', '_')
      )
      
      if (!tipoVal) {
        console.error(`Tipo de artefacto no encontrado: ${artefacto.nombre}`)
        continue
      }
      
      const insertResult = await db
        .prepare(`
          INSERT INTO PAI_ART_artefactos (
            ART_proyecto_id,
            ART_tipo_val_id,
            ART_ruta,
            ART_fecha_generacion,
            ART_activo
          ) VALUES (?, ?, ?, ?, 1)
        `)
        .bind(proyectoId, tipoVal.VAL_id, artefacto.ruta, fechaGeneracion)
        .run()
      
      artefactosGenerados.push({
        id: insertResult.meta.last_row_id as number,
        tipo: artefacto.nombre,
        ruta_r2: artefacto.ruta,
        fecha_generacion: fechaGeneracion,
      })
    }
    
    // ========================================================================
    // Update project state to ANALISIS_FINALIZADO (4)
    // ========================================================================
    registrarEvento(tracking, EVENTOS_ANALISIS.ACTUALIZAR_ESTADO, 'INFO', 'Actualizando estado del proyecto a ANALISIS_FINALIZADO')
    
    await db
      .prepare(`
        UPDATE PAI_PRO_proyectos
        SET PRO_estado_val_id = 4,
            PRO_fecha_ultima_actualizacion = ?
        WHERE PRO_id = ?
      `)
      .bind(fechaGeneracion, proyectoId)
      .run()
    
    // ========================================================================
    // Complete tracking
    // ========================================================================
    registrarEvento(tracking, EVENTOS_ANALISIS.ANALISIS_COMPLETADO, 'INFO', 'Análisis completado exitosamente', {
      artefactos_generados: artefactosGenerados.length,
    })
    
    completarTracking(tracking)
    
    return {
      exito: true,
      artefactos_generados: artefactosGenerados,
    }
    
  } catch (error) {
    registrarError(tracking, EVENTOS_ANALISIS.ANALISIS_ERROR, error)
    completarTracking(tracking)
    
    return {
      exito: false,
      error_codigo: ERROR_CODES.ANALISIS_ERROR,
      error_mensaje: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

// ============================================================================
// Cleanup Function (for re-execution)
// ============================================================================

/**
 * Delete previous 7 analysis Markdown files from R2
 * Preserves IJSON ({CII}.json) and other files
 * 
 * @param env - Environment bindings
 * @param cii - Project CII
 * @param tracking - Tracking context
 */
export async function limpiarAnalisisAnterior(
  env: Env,
  cii: string,
  tracking: TrackingContext
): Promise<void> {
  const r2Bucket = getR2Bucket(env)
  
  try {
    registrarEvento(tracking, EVENTOS_ANALISIS.LIMPIAR_MD_ANTERIORES, 'INFO', `Limpiando análisis anterior para CII: ${cii}`)
    
    const folderPrefix = `analisis-inmuebles/${cii}/`
    const listed = await r2Bucket.list({ prefix: folderPrefix })
    
    // Filter only the 7 analysis MD files (pattern: _{step_number}_{name}.md)
    const mdFilesToDelete = listed.objects.filter(obj =>
      obj.key.match(/_\d{2}_.*\.md$/) // Matches _01_*.md, _02_*.md, etc.
    )
    
    for (const object of mdFilesToDelete) {
      await r2Bucket.delete(object.key)
      registrarEvento(tracking, `eliminar-${object.key}`, 'INFO', `Eliminado: ${object.key}`)
    }
    
    registrarEvento(tracking, 'limpieza-completada', 'INFO', `Limpieza completada: ${mdFilesToDelete.length} archivos eliminados`)
    
  } catch (error) {
    registrarError(tracking, 'limpieza-error', error)
    throw error
  }
}
