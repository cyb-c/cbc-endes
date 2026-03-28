/**
 * Servicio de Simulación de IA - Proyectos PAI
 * Genera los 10 archivos Markdown de análisis en R2
 */

import { getR2Bucket } from '../env'
import type { Env } from '../env'
import {
  generateCII,
  generateProjectFolderStructure,
  saveIJSON,
  saveAllMarkdownArtifacts,
  generateSimulatedAnalysisContent,
} from '../lib/r2-storage'
import {
  insertPipelineEvent,
} from '../lib/pipeline-events'
import type { D1Database } from '@cloudflare/workers-types'
import type {
  AnalisisResultado,
  Artefacto,
  IJSONValidacion,
} from '../types/pai'

// ============================================================================
// Constantes
// ============================================================================

const ANALYSIS_TIMEOUT_MS = 30000 // 30 segundos máximo para análisis
const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 1000 // 1 segundo base para reintentos

// ============================================================================
// Funciones de Utilidad - Timeout y Retry (P2.1, P2.2)
// ============================================================================

/**
 * Crea una promesa que rechaza después de un timeout
 * P2.1 Mejora: Timeout de análisis
 */
function createTimeout(ms: number, contexto: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout después de ${ms}ms: ${contexto}`))
    }, ms)
  })
}

/**
 * Ejecuta una operación con reintentos y backoff exponencial
 * P2.2 Mejora: Reintentos con backoff exponencial
 * 
 * @param operacion - Función asíncrona a ejecutar
 * @param maxReintentos - Número máximo de reintentos
 * @param baseDelay - Delay base en ms para backoff exponencial
 * @returns Resultado de la operación
 */
async function ejecutarConReintento<T>(
  operacion: () => Promise<T>,
  maxReintentos: number = MAX_RETRIES,
  baseDelay: number = RETRY_BASE_DELAY_MS,
): Promise<T> {
  let ultimoError: Error | null = null

  for (let intento = 1; intento <= maxReintentos; intento++) {
    try {
      return await operacion()
    } catch (error) {
      ultimoError = error as Error
      
      if (intento < maxReintentos) {
        // Backoff exponencial: 1s, 2s, 4s, 8s...
        const delay = baseDelay * Math.pow(2, intento - 1)
        console.warn(`Reintento ${intento}/${maxReintentos} después de ${delay}ms. Error: ${(error as Error).message}`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw ultimoError
}

/**
 * Ejecuta una operación con timeout
 * P2.1 Mejora: Timeout de análisis
 * 
 * @param operacion - Función asíncrona a ejecutar
 * @param timeoutMs - Timeout en milisegundos
 * @param contexto - Descripción del contexto para el error
 * @returns Resultado de la operación
 */
async function ejecutarConTimeout<T>(
  operacion: () => Promise<T>,
  timeoutMs: number,
  contexto: string,
): Promise<T> {
  return Promise.race([
    operacion(),
    createTimeout(timeoutMs, contexto),
  ])
}

// ============================================================================
// Mapeo de tipos de artefactos
// ============================================================================

/**
 * Mapea el tipo de archivo (del nombre del archivo) al VAL_codigo en la base de datos
 */
function mapTipoToVALCodigo(tipo: string): string {
  const mapping: Record<string, string> = {
    'resumen-ejecutivo': 'RESUMEN_EJECUTIVO',
    'datos-transformados': 'DATOS_MD',
    'analisis-fisico': 'ANALISIS_FISICO',
    'analisis-estrategico': 'ANALISIS_ESTRATEGICO',
    'analisis-financiero': 'ANALISIS_FINANCIERO',
    'analisis-regulatorio': 'ANALISIS_REGULATORIO',
    'lectura-inversor': 'LECTURA_INVERSOR',
    'lectura-operador': 'LECTURA_OPERADOR',
    'lectura-propietario': 'LECTURA_PROPIETARIO',
  }
  return mapping[tipo] || tipo.toUpperCase().replace(/-/g, '_')
}

/**
 * Extrae el tipo de artefacto del key de R2
 * Formato: {CII}_{tipo}.md
 */
function extractTipoFromKey(key: string): string {
  const parts = key.split('/')
  const filename = parts[parts.length - 1]
  const match = filename.match(/^[^_]+_(.+)\.md$/)
  return match ? match[1] : filename
}

/**
 * Obtiene el VAL_id para un VAL_codigo dado
 */
async function getVALIdForCodigo(db: D1Database, codigo: string): Promise<number | null> {
  const result = await db
    .prepare('SELECT VAL_id FROM PAI_VAL_valores WHERE VAL_codigo = ?')
    .bind(codigo)
    .first()
  
  return result ? (result.VAL_id as number) : null
}

// ============================================================================
// Tipos de Errores
// ============================================================================

type ErrorCodigo =
  | 'INVALID_IJSON'
  | 'R2_SAVE_ERROR'
  | 'R2_READ_ERROR'
  | 'DB_INSERT_ERROR'
  | 'ANALISIS_TIMEOUT'
  | 'ESTADO_NO_PERMITE'
  | 'PROYECTO_NO_ENCONTRADO'

// ============================================================================
// Funciones de Validación
// ============================================================================

/**
 * Valida el IJSON recibido
 * P1.2 Mejora: Validar campos adicionales requeridos para análisis
 */
function validarIJSON(ijson: string): IJSONValidacion {
  try {
    const parsed = JSON.parse(ijson)

    // Campos obligatorios básicos
    const camposObligatorios = [
      'titulo_anuncio',
      'tipo_inmueble',
      'precio',
    ]

    // Campos recomendados para análisis completo
    const camposRecomendados = [
      'superficie_construida_m2',
      'ciudad',
      'operacion',
    ]

    // Validar campos obligatorios
    for (const campo of camposObligatorios) {
      if (!parsed[campo]) {
        return { valido: false, error: `Falta campo obligatorio: ${campo}` }
      }
    }

    // Validar campos recomendados (warning si faltan)
    const camposFaltantes: string[] = []
    for (const campo of camposRecomendados) {
      if (!parsed[campo]) {
        camposFaltantes.push(campo)
      }
    }

    // Si faltan campos recomendados, continuar pero con warning
    if (camposFaltantes.length > 0) {
      // Nota: No bloqueamos, pero se podría registrar un warning en pipeline
      console.warn(`Campos recomendados faltantes: ${camposFaltantes.join(', ')}`)
    }

    // Validar que precio sea un string válido
    if (typeof parsed.precio !== 'string') {
      return { valido: false, error: 'El campo precio debe ser un string' }
    }

    // Validar que superficie_construida_m2 sea un string si existe
    if (parsed.superficie_construida_m2 && typeof parsed.superficie_construida_m2 !== 'string') {
      return { valido: false, error: 'El campo superficie_construida_m2 debe ser un string' }
    }

    return { valido: true, ijson: parsed }
  } catch (error) {
    return { valido: false, error: 'JSON inválido' }
  }
}

/**
 * Valida si el estado del proyecto permite re-ejecución
 */
async function validarEstadoParaReejecucion(
  db: D1Database,
  proyectoId: number,
): Promise<{ permitido: boolean; razon?: string }> {
  const proyecto = await db
    .prepare('SELECT PRO_estado_val_id as estado_id FROM PAI_PRO_proyectos WHERE PRO_id = ?')
    .bind(proyectoId)
    .first()

  if (!proyecto) {
    return { permitido: false, razon: 'Proyecto no encontrado' }
  }

  const estadosPermitidos = [3, 5, 6, 7] // PENDIENTE_REVISION, EVALUANDO_VIABILIDAD, EVALUANDO_PLAN_NEGOCIO, SEGUIMIENTO_COMERCIAL
  const estadosNoPermitidos = [1, 2, 4, 8, 9] // NUEVO, EN_ANALISIS, APROBADO, RECHAZADO, ANALISIS_CON_ERROR

  const estadoId = proyecto.estado_id as number
  if (estadosNoPermitidos.includes(estadoId)) {
    return { permitido: false, razon: 'El estado actual no permite re-ejecución' }
  }

  if (estadosPermitidos.includes(estadoId)) {
    return { permitido: true }
  }

  return { permitido: false, razon: 'Estado desconocido' }
}

// ============================================================================
// Funciones de Preservación de Artefactos
// ============================================================================

/**
 * Preserva artefactos al re-ejecutar análisis
 * Elimina solo los Markdowns, conserva el IJSON original
 */
async function preservarArtefactos(
  r2Bucket: R2Bucket,
  cii: string,
): Promise<void> {
  const folderStructure = generateProjectFolderStructure(cii)
  
  // Listar todos los objetos en la carpeta
  const listed = await r2Bucket.list({ prefix: folderStructure.projectFolder })
  
  // Eliminar solo archivos .md
  for (const object of listed.objects) {
    if (object.key.endsWith('.md')) {
      await r2Bucket.delete(object.key)
    }
  }
  
  // NOTA: El IJSON (CII.json) se conserva
}

/**
 * Obtiene notas del análisis anterior
 */
async function obtenerNotasAnalisisAnterior(
  db: D1Database,
  proyectoId: number,
): Promise<unknown[]> {
  // Obtener todos los eventos de cambio de estado
  const eventos = await db
    .prepare('SELECT * FROM pipeline_eventos WHERE entity_id = ? ORDER BY created_at DESC')
    .bind(`proyecto-${proyectoId}`)
    .all()
  
  // Encontrar el último cambio de estado a PENDIENTE_REVISION
  const ultimoCambioRevision = [...eventos.results]
    .reverse()
    .find((e: Record<string, unknown>) =>
      e.paso === 'cambiar_estado' &&
      typeof e.detalle === 'object' &&
      (e.detalle as Record<string, unknown>)?.estado_nuevo === 'PENDIENTE_REVISION'
    )
  
  if (!ultimoCambioRevision) {
    // No ha habido análisis anterior, no hay notas que preservar
    return []
  }
  
  // Obtener notas creadas antes de ese cambio de estado
  const notas = await db
    .prepare(`
      SELECT * FROM PAI_NOT_notas
      WHERE proyecto_id = ? AND created_at < ?
      ORDER BY created_at ASC
    `)
    .bind(proyectoId, (ultimoCambioRevision as Record<string, unknown>).created_at)
    .all()
  
  return notas.results
}

// ============================================================================
// Función Principal: Ejecutar Análisis Completo
// ============================================================================

/**
 * Ejecuta el análisis completo de un proyecto PAI
 * Genera los 10 archivos Markdown en R2
 * P2.1, P2.2 Mejora: Timeout y reintentos con backoff exponencial
 *
 * @param env - Environment bindings
 * @param db - D1 database instance
 * @param proyectoId - ID del proyecto PAI
 * @param ijson - Contenido del IJSON (JSON string)
 * @returns Promise con resultado del análisis
 */
export async function ejecutarAnalisisCompleto(
  env: Env,
  db: D1Database,
  proyectoId: number,
  ijson: string,
): Promise<AnalisisResultado> {
  const entityId = `proyecto-${proyectoId}`
  const r2Bucket = getR2Bucket(env)

  try {
    // P2.1, P2.2: Ejecutar análisis con timeout y reintentos
    return await ejecutarConReintento(async () => {
      return await ejecutarConTimeout(async () => {
        // 1. Registrar inicio del proceso
        await insertPipelineEvent(db, {
          entityId,
          paso: 'ejecutar_analisis',
          nivel: 'INFO',
          tipoEvento: 'PROCESS_START',
          detalle: 'Iniciando análisis completo',
        })

        // 2. Validar IJSON
        const ijsonValidado = validarIJSON(ijson)

        if (!ijsonValidado.valido) {
          await insertPipelineEvent(db, {
            entityId,
            paso: 'validar_ijson',
            nivel: 'ERROR',
            tipoEvento: 'STEP_FAILED',
            errorCodigo: 'INVALID_IJSON',
            detalle: ijsonValidado.error,
          })

          return {
            exito: false,
            error_codigo: 'INVALID_IJSON',
            error_mensaje: ijsonValidado.error,
          }
        }

        await insertPipelineEvent(db, {
          entityId,
          paso: 'validar_ijson',
          nivel: 'INFO',
          tipoEvento: 'STEP_SUCCESS',
          detalle: 'IJSON validado correctamente',
        })

        // 3. Generar CII
        const cii = generateCII(proyectoId)

        // 4. Guardar IJSON en R2
        await saveIJSON(r2Bucket, cii, ijson)

        await insertPipelineEvent(db, {
          entityId,
          paso: 'guardar_ijson',
          nivel: 'INFO',
          tipoEvento: 'STEP_SUCCESS',
          detalle: 'IJSON guardado en R2',
        })

        // 5. Generar contenido de análisis
        const ijsonParsed = ijsonValidado.ijson as Record<string, unknown>
        const markdownContents = generateSimulatedAnalysisContent(cii, ijsonParsed)

        // 6. Guardar cada Markdown en R2
        const resultados = await saveAllMarkdownArtifacts(r2Bucket, cii, markdownContents)

        await insertPipelineEvent(db, {
          entityId,
          paso: 'generar_markdowns',
          nivel: 'INFO',
          tipoEvento: 'STEP_SUCCESS',
          detalle: 'Markdowns generados exitosamente',
        })

        // 7. Insertar registros de artefactos en DB
        for (const resultado of resultados) {
          const tipo = extractTipoFromKey(resultado.key)
          const valCodigo = mapTipoToVALCodigo(tipo)
          const valId = await getVALIdForCodigo(db, valCodigo)

          if (!valId) {
            throw new Error(`No se encontró VAL_id para VAL_codigo: ${valCodigo}`)
          }

          // Extraer nombre del artefacto desde la ruta (ej: "resumen-ejecutivo" desde "analisis-inmuebles/26030002/26030002_resumen-ejecutivo.md")
          const artefactoNombre = resultado.key.split('/').pop()?.replace(/\.md$/, '') || 'artefacto'

          await db
            .prepare(`
              INSERT INTO PAI_ART_artefactos (ART_proyecto_id, ART_tipo_val_id, ART_nombre, ART_ruta, ART_fecha_generacion)
              VALUES (?, ?, ?, ?, ?)
            `)
            .bind(
              proyectoId,
              valId,
              artefactoNombre,
              resultado.key,
              new Date().toISOString(),
            )
            .run()
        }

        await insertPipelineEvent(db, {
          entityId,
          paso: 'registrar_artefactos',
          nivel: 'INFO',
          tipoEvento: 'STEP_SUCCESS',
          detalle: 'Artefactos registrados en base de datos',
        })

        // 8. Actualizar estado a PENDIENTE_REVISION (VAL_id=3)
        await db
          .prepare(`
            UPDATE PAI_PRO_proyectos
            SET PRO_estado_val_id = ?, PRO_fecha_ultima_actualizacion = ?
            WHERE PRO_id = ?
          `)
          .bind(3, new Date().toISOString(), proyectoId)
          .run()

        await insertPipelineEvent(db, {
          entityId,
          paso: 'actualizar_estado',
          nivel: 'INFO',
          tipoEvento: 'STEP_SUCCESS',
          detalle: 'Estado actualizado a PENDIENTE_REVISION',
        })

        // 9. Finalizar proceso
        await insertPipelineEvent(db, {
          entityId,
          paso: 'ejecutar_analisis',
          nivel: 'INFO',
          tipoEvento: 'PROCESS_COMPLETE',
          detalle: 'Análisis completado exitosamente',
        })

        return {
          exito: true,
          artefactos_generados: resultados.map(r => {
            const tipo = extractTipoFromKey(r.key)
            const valCodigo = mapTipoToVALCodigo(tipo)
            return {
              id: 0, // Será asignado por la DB
              proyecto_id: proyectoId,
              tipo_artefacto_id: 0, // Se llenará después de consultar la DB
              tipo: valCodigo,
              ruta_r2: r.key,
              fecha_creacion: new Date().toISOString(),
            }
          }),
        }
      }, ANALYSIS_TIMEOUT_MS, 'ejecutarAnalisisCompleto')
    }, MAX_RETRIES, RETRY_BASE_DELAY_MS)
  } catch (error) {
    // Registrar error (timeout o error después de reintentos)
    await insertPipelineEvent(db, {
      entityId,
      paso: 'ejecutar_analisis',
      nivel: 'ERROR',
      tipoEvento: 'PROCESS_FAILED',
      errorCodigo: error instanceof Error && error.message.includes('Timeout') 
        ? 'ANALYSIS_TIMEOUT' 
        : 'ERROR_ANALISIS_INESPERADO',
      detalle: error instanceof Error ? error.message : 'Error desconocido',
    })

    return {
      exito: false,
      error_codigo: error instanceof Error && error.message.includes('Timeout')
        ? 'ANALYSIS_TIMEOUT'
        : 'ERROR_ANALISIS_INESPERADO',
      error_mensaje: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

// ============================================================================
// Función: Re-ejecutar Análisis
// ============================================================================

/**
 * Re-ejecuta el análisis de un proyecto PAI
 * Genera nuevos artefactos mientras preserva el contexto
 *
 * @param env - Environment bindings
 * @param db - D1 database instance
 * @param proyectoId - ID del proyecto PAI
 * @param ijson - Contenido del IJSON (JSON string)
 * @returns Promise con resultado del análisis
 */
export async function reejecutarAnalisis(
  env: Env,
  db: D1Database,
  proyectoId: number,
  ijson: string,
): Promise<AnalisisResultado> {
  const entityId = `proyecto-${proyectoId}`
  const r2Bucket = getR2Bucket(env)
  
  try {
    // 1. Validar estado para re-ejecución
    const validacion = await validarEstadoParaReejecucion(db, proyectoId)
    
    if (!validacion.permitido) {
      await insertPipelineEvent(db, {
        entityId,
        paso: 'validar_estado',
        nivel: 'WARN',
        tipoEvento: 'STEP_FAILED',
        errorCodigo: 'ESTADO_NO_PERMITE',
        detalle: validacion.razon,
      })
      
      return {
        exito: false,
        error_codigo: 'ESTADO_NO_PERMITE',
        error_mensaje: validacion.razon,
      }
    }
    
    // 2. Registrar inicio de re-ejecución
    await insertPipelineEvent(db, {
      entityId,
      paso: 'reejecutar_analisis',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_START',
      detalle: 'Iniciando re-ejecución de análisis',
    })
    
    // 3. Validar IJSON
    const ijsonValidado = validarIJSON(ijson)
    
    if (!ijsonValidado.valido) {
      await insertPipelineEvent(db, {
        entityId,
        paso: 'validar_ijson',
        nivel: 'ERROR',
        tipoEvento: 'STEP_FAILED',
        errorCodigo: 'INVALID_IJSON',
        detalle: ijsonValidado.error,
      })
      
      return {
        exito: false,
        error_codigo: 'INVALID_IJSON',
        error_mensaje: ijsonValidado.error,
      }
    }
    
    await insertPipelineEvent(db, {
      entityId,
      paso: 'validar_ijson',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: 'IJSON validado correctamente',
    })
    
    // 4. Generar CII
    const cii = generateCII(proyectoId)
    
    // 5. Preservar artefactos anteriores
    await preservarArtefactos(r2Bucket, cii)
    
    await insertPipelineEvent(db, {
      entityId,
      paso: 'preservar_artefactos',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: 'Artefactos de análisis anterior preservados',
    })
    
    // 6. Generar contenido de análisis
    const ijsonParsed = ijsonValidado.ijson as Record<string, unknown>
    const markdownContents = generateSimulatedAnalysisContent(cii, ijsonParsed)
    
    // 7. Guardar cada Markdown en R2
    const resultados = await saveAllMarkdownArtifacts(r2Bucket, cii, markdownContents)
    
    await insertPipelineEvent(db, {
      entityId,
      paso: 'generar_markdowns',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: 'Nuevos Markdowns generados',
    })
    
    // 8. Insertar nuevos registros de artefactos en DB
    for (const resultado of resultados) {
      const tipo = extractTipoFromKey(resultado.key)
      const valCodigo = mapTipoToVALCodigo(tipo)
      const valId = await getVALIdForCodigo(db, valCodigo)

      if (!valId) {
        throw new Error(`No se encontró VAL_id para VAL_codigo: ${valCodigo}`)
      }

      // Extraer nombre del artefacto desde la ruta
      const artefactoNombre = resultado.key.split('/').pop()?.replace(/\.md$/, '') || 'artefacto'

      await db
        .prepare(`
          INSERT INTO PAI_ART_artefactos (ART_proyecto_id, ART_tipo_val_id, ART_nombre, ART_ruta, ART_fecha_generacion)
          VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          proyectoId,
          valId,
          artefactoNombre,
          resultado.key,
          new Date().toISOString(),
        )
        .run()
    }
    
    await insertPipelineEvent(db, {
      entityId,
      paso: 'registrar_nuevos_artefactos',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: 'Nuevos artefactos registrados en base de datos',
    })

    // 9. Actualizar estado a PENDIENTE_REVISION (VAL_id=3)
    await db
      .prepare(`
        UPDATE PAI_PRO_proyectos
        SET PRO_estado_val_id = ?, PRO_fecha_ultima_actualizacion = ?
        WHERE PRO_id = ?
      `)
      .bind(3, new Date().toISOString(), proyectoId)
      .run()

    await insertPipelineEvent(db, {
      entityId,
      paso: 'actualizar_estado',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: 'Estado actualizado a PENDIENTE_REVISION',
    })
    
    // 10. Finalizar re-ejecución
    await insertPipelineEvent(db, {
      entityId,
      paso: 'reejecutar_analisis',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_COMPLETE',
      detalle: 'Re-ejecución completada exitosamente',
    })
    
    return {
      exito: true,
      artefactos_generados: resultados.map(r => {
        const tipo = extractTipoFromKey(r.key)
        const valCodigo = mapTipoToVALCodigo(tipo)
        return {
          id: 0, // Será asignado por la DB
          proyecto_id: proyectoId,
          tipo_artefacto_id: 0, // Se llenará después de consultar la DB
          tipo: valCodigo,
          ruta_r2: r.key,
          fecha_creacion: new Date().toISOString(),
        }
      }),
    }
  } catch (error) {
    await insertPipelineEvent(db, {
      entityId,
      paso: 'reejecutar_analisis',
      nivel: 'ERROR',
      tipoEvento: 'PROCESS_FAILED',
      errorCodigo: 'ERROR_REEJECUCION',
      detalle: error instanceof Error ? error.message : 'Error desconocido',
    })
    
    throw error
  }
}
