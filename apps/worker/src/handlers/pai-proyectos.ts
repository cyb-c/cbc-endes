/**
 * Handlers: PAI Proyectos
 *
 * Handlers para operaciones de proyectos PAI (Proyectos de Análisis Inmobiliario)
 *
 * Following R2: Cero hardcoding - uses environment bindings
 * Following R4: Accesores tipados para bindings
 */

import { Context } from 'hono'
import { getDB, getR2Bucket, getSecretsKV } from '../env'
import { generateCII } from '../lib/r2-storage'
import { ejecutarAnalisisCompleto, reejecutarAnalisis } from '../services/simulacion-ia'
import { crearProyectoConIA } from '../services/ia-creacion-proyectos'
import { insertPipelineEvent, getEntityEvents } from '../lib/pipeline-events'
import { deleteProjectFolder } from '../lib/r2-storage'
import type { Env } from '../env'
import { iniciarTracking, completarTracking, generarLogJSON, registrarEvento, registrarError } from '../lib/tracking'

type AppBindings = {
  db_binding_01: D1Database
  r2_binding_01: R2Bucket
  secrets_kv: KVNamespace
}

type AppContext = Context<{ Bindings: AppBindings }>

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Obtiene el VAL_nombre para un VAL_id dado
 */
async function getVALNombre(db: D1Database, valId: number): Promise<string | null> {
  const result = await db
    .prepare('SELECT VAL_nombre FROM PAI_VAL_valores WHERE VAL_id = ?')
    .bind(valId)
    .first()
  
  return result ? (result.VAL_nombre as string) : null
}

/**
 * Valida el IJSON recibido
 */
function validarIJSON(ijson: string): { valido: boolean; error?: string; parsed?: Record<string, unknown> } {
  try {
    const parsed = JSON.parse(ijson)
    
    if (!parsed.titulo_anuncio) {
      return { valido: false, error: 'Falta campo titulo_anuncio' }
    }
    if (!parsed.tipo_inmueble) {
      return { valido: false, error: 'Falta campo tipo_inmueble' }
    }
    if (!parsed.precio) {
      return { valido: false, error: 'Falta campo precio' }
    }
    
    return { valido: true, parsed }
  } catch (error) {
    return { valido: false, error: 'JSON inválido' }
  }
}

// ============================================================================
// POST /api/pai/proyectos - Crear Proyecto
// ============================================================================

export async function handleCrearProyecto(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const r2Bucket = getR2Bucket(c.env)
  
  // Iniciar tracking
  const trackingId = `crear-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  const tracking = iniciarTracking(trackingId)
  
  registrarEvento(tracking, 'handler-inicio', 'INFO', 'Iniciando handler de creación de proyecto')

  try {
    const body = await c.req.json<{ ijson: string }>()
    const { ijson } = body
    
    registrarEvento(tracking, 'request-received', 'INFO', 'Request recibido', {
      ijson_length: ijson.length,
      ijson_preview: ijson.substring(0, 100),
    })

    // Validar IJSON
    registrarEvento(tracking, 'validar-ijson', 'INFO', 'Validando IJSON')
    const validacion = validarIJSON(ijson)
    if (!validacion.valido) {
      registrarError(tracking, 'validar-ijson-fallido', new Error(validacion.error || 'IJSON inválido'))
      completarTracking(tracking)
      await generarLogJSON(c.env, tracking)
      return c.json({ error: validacion.error }, 400)
    }
    
    registrarEvento(tracking, 'validar-ijson-ok', 'INFO', 'IJSON válido')

    // Ejecutar IA para extraer datos y generar resumen ejecutivo
    registrarEvento(tracking, 'ia-inicio', 'INFO', 'Iniciando extracción con IA')
    const iaResult = await crearProyectoConIA(c.env, tracking, ijson)

    if (!iaResult.exito || !iaResult.datos) {
      registrarError(tracking, 'ia-fallido', new Error(iaResult.error_mensaje || 'Error en IA'), {
        error_codigo: iaResult.error_codigo,
      })
      completarTracking(tracking)
      const logJson = await generarLogJSON(c.env, tracking)
      return c.json({
        error: iaResult.error_mensaje || 'Error al procesar IJSON con IA',
        error_codigo: iaResult.error_codigo,
        tracking_id: trackingId,
        log: JSON.parse(logJson),
      }, 500)
    }
    
    registrarEvento(tracking, 'ia-completado', 'INFO', 'IA completada exitosamente', {
      titulo: iaResult.datos.pro_titulo,
      ciudad: iaResult.datos.pro_ciudad,
    })

    const datosExtraidos = iaResult.datos

    // Obtener estado CREADO (primer estado)
    registrarEvento(tracking, 'db-obtener-estado', 'INFO', 'Obteniendo estado CREADO')
    const estadoResult = await db
      .prepare(`
        SELECT v.VAL_id
        FROM PAI_VAL_valores v
        JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
        WHERE a.ATR_codigo = 'ESTADO_PROYECTO' AND v.VAL_codigo = 'CREADO'
      `)
      .first()

    if (!estadoResult) {
      registrarError(tracking, 'db-estado-no-encontrado', new Error('Estado CREADO no encontrado'))
      completarTracking(tracking)
      await generarLogJSON(c.env, tracking)
      return c.json({ error: 'Estado CREADO no encontrado' }, 500)
    }
    
    registrarEvento(tracking, 'db-estado-ok', 'INFO', 'Estado CREADO encontrado', {
      estado_id: estadoResult.VAL_id,
    })

    const estadoId = estadoResult.VAL_id as number

    // Insertar proyecto con datos extraídos por IA
    registrarEvento(tracking, 'db-insert-inicio', 'INFO', 'Insertando proyecto en BD')
    const insertResult = await db
      .prepare(`
        INSERT INTO PAI_PRO_proyectos (
          PRO_cii, PRO_titulo, PRO_estado_val_id,
          PRO_portal_nombre, PRO_portal_url, PRO_operacion,
          PRO_tipo_inmueble, PRO_precio, PRO_superficie_construida_m2,
          PRO_ciudad, PRO_barrio_distrito, PRO_direccion,
          PRO_resumen_ejecutivo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        '', // CII se generará después
        datosExtraidos.pro_titulo,
        estadoId,
        datosExtraidos.pro_portal_nombre,
        datosExtraidos.pro_portal_url,
        datosExtraidos.pro_operacion,
        datosExtraidos.pro_tipo_inmueble,
        datosExtraidos.pro_precio,
        datosExtraidos.pro_superficie_construida_m2,
        datosExtraidos.pro_ciudad,
        datosExtraidos.pro_barrio_distrito,
        datosExtraidos.pro_direccion,
        datosExtraidos.pro_resumen_ejecutivo,
      )
      .run()
    
    registrarEvento(tracking, 'db-insert-ok', 'INFO', 'Proyecto insertado en BD', {
      proyecto_id: insertResult.meta.last_row_id,
    })

    const proyectoId = insertResult.meta.last_row_id

    // Generar y actualizar CII
    registrarEvento(tracking, 'generar-cii', 'INFO', 'Generando CII')
    const cii = generateCII(proyectoId)
    await db
      .prepare('UPDATE PAI_PRO_proyectos SET PRO_cii = ?, PRO_ijson = ? WHERE PRO_id = ?')
      .bind(cii, ijson, proyectoId)
      .run()
    
    registrarEvento(tracking, 'cii-generado', 'INFO', 'CII generado y guardado', {
      cii,
    })

    // Registrar eventos de pipeline
    registrarEvento(tracking, 'pipeline-eventos', 'INFO', 'Registrando eventos en pipeline')
    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'crear_proyecto',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_START',
      detalle: 'Iniciando creación de proyecto con IA',
    })

    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'validar_ijson',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: 'IJSON validado correctamente',
    })

    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'extraer_datos_ia',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: 'Datos extraídos con IA: ' + datosExtraidos.pro_titulo,
    })

    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'crear_proyecto',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_COMPLETE',
      detalle: 'Proyecto creado exitosamente con IA',
    })
    
    registrarEvento(tracking, 'pipeline-ok', 'INFO', 'Eventos de pipeline registrados')

    // Generar y guardar log.json
    registrarEvento(tracking, 'generar-log', 'INFO', 'Generando log.json')
    completarTracking(tracking)
    const logJson = await generarLogJSON(c.env, tracking, cii)
    
    registrarEvento(tracking, 'handler-completado', 'INFO', 'Handler completado exitosamente', {
      cii,
      log_saved: true,
    })

    const estadoNombre = await getVALNombre(db, estadoId)

    return c.json({
      proyecto: {
        id: proyectoId,
        cii,
        titulo: datosExtraidos.pro_titulo,
        estado_id: estadoId,
        estado: estadoNombre || 'Desconocido',
        fecha_alta: new Date().toISOString(),
        fecha_ultima_actualizacion: new Date().toISOString(),
      },
      tracking_id: trackingId,
      log_url: `analisis-inmuebles/${cii}/${cii}_log.json`,
    }, 201)
  } catch (error) {
    registrarError(tracking, 'handler-error', error)
    completarTracking(tracking)
    const logJson = await generarLogJSON(c.env, tracking)
    
    console.error('Error al crear proyecto:', error)
    return c.json({ 
      error: 'Error interno del servidor',
      tracking_id: trackingId,
      log: JSON.parse(logJson),
    }, 500)
  }
}

// ============================================================================
// GET /api/pai/proyectos/:id - Obtener Detalles de Proyecto
// ============================================================================

export async function handleObtenerProyecto(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const idParam = c.req.param('id')
  
  if (!idParam) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }
  
  const proyectoId = parseInt(idParam)
  
  if (isNaN(proyectoId)) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }
  
  try {
    // Obtener proyecto
    const proyecto = await db
      .prepare(`
        SELECT
          p.PRO_id as id,
          p.PRO_cii as cii,
          p.PRO_titulo as titulo,
          p.PRO_estado_val_id as estado_id,
          p.PRO_motivo_val_id as motivo_valoracion_id,
          p.PRO_portal_nombre as portal,
          p.PRO_portal_url as url_fuente,
          p.PRO_operacion as operacion,
          p.PRO_tipo_inmueble as tipo_inmueble,
          p.PRO_precio as precio,
          p.PRO_superficie_construida_m2 as superficie_construida_m2,
          p.PRO_ciudad as ciudad,
          p.PRO_barrio_distrito as barrio,
          p.PRO_direccion as direccion,
          p.PRO_fecha_alta as fecha_alta,
          p.PRO_fecha_analisis as fecha_analisis,
          p.PRO_fecha_ultima_actualizacion as fecha_ultima_actualizacion,
          p.PRO_resumen_ejecutivo as resumen_ejecutivo,
          p.PRO_ijson as ijson
        FROM PAI_PRO_proyectos p
        WHERE p.PRO_id = ?
      `)
      .bind(proyectoId)
      .first()
    
    if (!proyecto) {
      return c.json({ error: 'Proyecto no encontrado' }, 404)
    }
    
    const estadoNombre = await getVALNombre(db, proyecto.estado_id as number)
    
    // Obtener artefactos
    const artefactosResult = await db
      .prepare(`
        SELECT 
          a.ART_id as id,
          a.ART_tipo_val_id as tipo_artefacto_id,
          v.VAL_nombre as tipo,
          a.ART_ruta as ruta_r2,
          a.ART_fecha_generacion as fecha_creacion
        FROM PAI_ART_artefactos a
        JOIN PAI_VAL_valores v ON a.ART_tipo_val_id = v.VAL_id
        WHERE a.ART_proyecto_id = ? AND a.ART_activo = 1
        ORDER BY a.ART_fecha_generacion ASC
      `)
      .bind(proyectoId)
      .all()
    
    // Obtener notas
    const notasResult = await db
      .prepare(`
        SELECT 
          n.NOT_id as id,
          n.NOT_tipo_val_id as tipo_nota_id,
          v.VAL_nombre as tipo,
          n.NOT_usuario_alta as autor,
          n.NOT_nota as contenido,
          n.NOT_fecha_alta as fecha_creacion
        FROM PAI_NOT_notas n
        JOIN PAI_VAL_valores v ON n.NOT_tipo_val_id = v.VAL_id
        WHERE n.NOT_proyecto_id = ?
        ORDER BY n.NOT_fecha_alta DESC
      `)
      .bind(proyectoId)
      .all()
    
    return c.json({
      proyecto: {
        ...proyecto,
        estado: estadoNombre || 'Desconocido',
        resumen_ejecutivo: proyecto.resumen_ejecutivo as string | null,
        ijson: proyecto.ijson as string | null,
        datos_basicos: {
          portal: proyecto.portal as string,
          url_fuente: proyecto.url_fuente as string,
          operacion: proyecto.operacion as string,
          tipo_inmueble: proyecto.tipo_inmueble as string,
          precio: proyecto.precio as string,
          precio_por_m2: '0', // Calcular si es necesario
          superficie_total_m2: '0', // Calcular si es necesario
          superficie_construida_m2: proyecto.superficie_construida_m2 as string,
          superficie_util_m2: '0', // Calcular si es necesario
          ciudad: proyecto.ciudad as string,
          provincia: '', // Calcular si es necesario
          barrio: proyecto.barrio as string || '',
          direccion: proyecto.direccion as string || '',
          fecha_alta: proyecto.fecha_alta as string,
          fecha_analisis: proyecto.fecha_analisis as string | null,
        },
      },
      artefactos: artefactosResult.results,
      notas: notasResult.results,
    })
  } catch (error) {
    console.error('Error al obtener proyecto:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}

// ============================================================================
// GET /api/pai/proyectos - Listar Proyectos
// ============================================================================

export async function handleListarProyectos(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  
  try {
    const query = c.req.query()
    const estadoId = query.estado_id ? parseInt(query.estado_id) : null
    const motivoValoracionId = query.motivo_valoracion_id ? parseInt(query.motivo_valoracion_id) : null
    const motivoDescarteId = query.motivo_descarte_id ? parseInt(query.motivo_descarte_id) : null
    const ciudad = query.ciudad || null
    const barrio = query.barrio || null
    const tipoInmueble = query.tipo_inmueble || null
    const fechaDesde = query.fecha_desde || null
    const fechaHasta = query.fecha_hasta || null
    const pagina = Math.max(1, parseInt(query.pagina) || 1)
    const porPagina = Math.min(100, Math.max(1, parseInt(query.por_pagina) || 20))
    const ordenarPor = query.ordenar_por || 'fecha_alta'
    const orden = query.orden?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    
    // Construir WHERE clause
    const condiciones: string[] = []
    const params: unknown[] = []
    
    if (estadoId) {
      condiciones.push('p.PRO_estado_val_id = ?')
      params.push(estadoId)
    }
    if (motivoValoracionId) {
      condiciones.push('p.PRO_motivo_val_id = ?')
      params.push(motivoValoracionId)
    }
    if (motivoDescarteId) {
      condiciones.push('p.PRO_motivo_val_id = ?')
      params.push(motivoDescarteId)
    }
    if (ciudad) {
      condiciones.push('p.PRO_ciudad LIKE ?')
      params.push(`%${ciudad}%`)
    }
    if (barrio) {
      condiciones.push('p.PRO_barrio_distrito LIKE ?')
      params.push(`%${barrio}%`)
    }
    if (tipoInmueble) {
      condiciones.push('p.PRO_tipo_inmueble LIKE ?')
      params.push(`%${tipoInmueble}%`)
    }
    if (fechaDesde) {
      condiciones.push('p.PRO_fecha_alta >= ?')
      params.push(fechaDesde)
    }
    if (fechaHasta) {
      condiciones.push('p.PRO_fecha_alta <= ?')
      params.push(fechaHasta)
    }
    
    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : ''
    
    // Mapear ordenarPor a columna
    const ordenarPorColumna = {
      'fecha_alta': 'p.PRO_fecha_alta',
      'fecha_ultima_actualizacion': 'p.PRO_fecha_ultima_actualizacion',
      'titulo': 'p.PRO_titulo',
      'precio': 'p.PRO_precio',
    }[ordenarPor] || 'p.PRO_fecha_alta'
    
    // Obtener total
    const countResult = await db
      .prepare(`SELECT COUNT(*) as total FROM PAI_PRO_proyectos p ${whereClause}`)
      .bind(...params)
      .first()
    
    const total = countResult ? (countResult.total as number) : 0
    const totalPaginas = Math.ceil(total / porPagina)
    const offset = (pagina - 1) * porPagina
    
    // Obtener proyectos
    const proyectosResult = await db
      .prepare(`
        SELECT 
          p.PRO_id as id,
          p.PRO_cii as cii,
          p.PRO_titulo as titulo,
          p.PRO_estado_val_id as estado_id,
          p.PRO_fecha_alta as fecha_alta,
          p.PRO_fecha_ultima_actualizacion as fecha_ultima_actualizacion
        FROM PAI_PRO_proyectos p
        ${whereClause}
        ORDER BY ${ordenarPorColumna} ${orden}
        LIMIT ? OFFSET ?
      `)
      .bind(...params, porPagina, offset)
      .all()
    
    // Obtener nombres de estados
    const proyectos = await Promise.all(
      proyectosResult.results.map(async (proyecto: Record<string, unknown>) => {
        const estadoNombre = await getVALNombre(db, proyecto.estado_id as number)
        return {
          ...proyecto,
          estado: estadoNombre || 'Desconocido',
        }
      })
    )
    
    return c.json({
      proyectos,
      paginacion: {
        pagina_actual: pagina,
        por_pagina: porPagina,
        total,
        total_paginas: totalPaginas,
      },
    })
  } catch (error) {
    console.error('Error al listar proyectos:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}

// ============================================================================
// POST /api/pai/proyectos/:id/analisis - Ejecutar Análisis Completo
// ============================================================================
// WF-ANALISIS: Reemplaza implementación de simulación con IA real de 7 pasos

export async function handleEjecutarAnalisis(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const r2Bucket = getR2Bucket(c.env)
  const idParam = c.req.param('id')

  if (!idParam) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }

  const proyectoId = parseInt(idParam)

  if (isNaN(proyectoId)) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }

  try {
    const body = await c.req.json<{ forzar_reejecucion?: boolean }>()
    const { forzar_reejecucion = false } = body

    // 1. Verificar que el proyecto existe
    const proyecto = await db
      .prepare(`
        SELECT
          p.PRO_id as id,
          p.PRO_cii as cii,
          p.PRO_estado_val_id as estado_id,
          p.PRO_titulo as titulo
        FROM PAI_PRO_proyectos p
        WHERE p.PRO_id = ?
      `)
      .bind(proyectoId)
      .first()

    if (!proyecto) {
      return c.json({ error: 'Proyecto no encontrado' }, 404)
    }

    // 2. Validar estado del proyecto (debe estar en 1, 2, 3, 4)
    const { validarEstadoParaAnalisis } = await import('../services/ia-analisis-proyectos')
    
    if (!validarEstadoParaAnalisis(proyecto.estado_id as number)) {
      return c.json({
        error: 'El estado actual no permite ejecutar análisis. Estados permitidos: CREADO (1), PROCESANDO_ANALISIS (2), ANALISIS_CON_ERROR (3), ANALISIS_FINALIZADO (4).',
        estado_id: proyecto.estado_id,
      }, 403)
    }

    // 3. Obtener IJSON desde R2 (no desde D1)
    const cii = proyecto.cii as string
    const ijsonKey = `analisis-inmuebles/${cii}/${cii}.json`
    const ijsonObject = await r2Bucket.get(ijsonKey)
    
    let ijson: string
    
    if (!ijsonObject) {
      // Fallback: leer desde D1 si no está en R2
      const ijsonResult = await db
        .prepare('SELECT PRO_ijson FROM PAI_PRO_proyectos WHERE PRO_id = ?')
        .bind(proyectoId)
        .first()
      
      ijson = ijsonResult?.PRO_ijson as string || '{}'
      
      if (ijson === '{}') {
        return c.json({ error: 'IJSON no encontrado' }, 404)
      }
    } else {
      ijson = await ijsonObject.text()
    }

    // 4. Limpiar análisis anterior si existe (solo los 7 MD, no el IJSON)
    if (forzar_reejecucion) {
      const { limpiarAnalisisAnterior } = await import('../services/ia-analisis-proyectos')
      const { iniciarTracking } = await import('../lib/tracking')
      const tracking = iniciarTracking(`analisis-${proyectoId}-${Date.now()}`)
      await limpiarAnalisisAnterior(c.env, cii, tracking)
    }

    // 5. Ejecutar análisis con IA real (7 pasos)
    const { ejecutarAnalisisConIA } = await import('../services/ia-analisis-proyectos')
    
    // Iniciar tracking
    const trackingId = `analisis-${proyectoId}-${Date.now()}`
    const { iniciarTracking } = await import('../lib/tracking')
    const tracking = iniciarTracking(trackingId)

    const resultado = await ejecutarAnalisisConIA(
      c.env,
      db,
      proyectoId,
      cii,
      ijson,
      tracking
    )

    if (!resultado.exito) {
      return c.json({ error: resultado.error_mensaje }, 500)
    }

    // 6. Generar log.json en R2
    const { completarTracking, generarLogJSON } = await import('../lib/tracking')
    completarTracking(tracking)
    await generarLogJSON(c.env, tracking, cii)

    const estadoNombre = await getVALNombre(db, 4)  // ANALISIS_FINALIZADO

    return c.json({
      proyecto: {
        id: proyecto.id as number,
        cii: proyecto.cii as string,
        estado_id: 4,  // ANALISIS_FINALIZADO
        estado: estadoNombre || 'Análisis Finalizado',
        fecha_ultima_actualizacion: new Date().toISOString(),
      },
      artefactos_generados: resultado.artefactos_generados,
    })
  } catch (error) {
    console.error('Error al ejecutar análisis:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}

// ============================================================================
// GET /api/pai/estados-disponibles - Obtener Estados Disponibles para Cambio
// ============================================================================
// G62: Endpoint para obtener estados filtrados correctamente

export async function handleObtenerEstadosDisponibles(c: AppContext): Promise<Response> {
  const db = getDB(c.env)

  try {
    // Obtener estados filtrados según requerimiento G62:
    // - VAL_atr_id = 1 (ESTADO_PROYECTO)
    // - VAL_id > 4 y VAL_id < 9 (solo estados manuales)
    // - VAL_activo = 1
    // - ORDER BY VAL_orden
    const estadosResult = await db
      .prepare(`
        SELECT v.VAL_id, v.VAL_nombre, v.VAL_orden
        FROM PAI_VAL_valores v
        JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
        WHERE a.ATR_codigo = 'ESTADO_PROYECTO'
          AND v.VAL_id > 4
          AND v.VAL_id < 9
          AND v.VAL_activo = 1
        ORDER BY v.VAL_orden
      `)
      .all()

    return c.json({
      estados: estadosResult.results || [],
    })
  } catch (error) {
    console.error('Error al obtener estados disponibles:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}

// ============================================================================
// PUT /api/pai/proyectos/:id/estado - Cambiar Estado Manual
// ============================================================================
// G63: Corregido para aceptar estado_id numérico

export async function handleCambiarEstado(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const idParam = c.req.param('id')

  if (!idParam) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }

  const proyectoId = parseInt(idParam)

  if (isNaN(proyectoId)) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }

  try {
    // G63: Corregido para aceptar estado_id numérico directamente
    const body = await c.req.json<{ estado_id: number; motivo_valoracion_id?: number; motivo_descarte_id?: number }>()
    const { estado_id, motivo_valoracion_id, motivo_descarte_id } = body

    // Validar que estado_id sea numérico y válido
    if (!estado_id || typeof estado_id !== 'number') {
      return c.json({ error: 'estado_id es requerido y debe ser un número' }, 400)
    }

    // Verificar que el proyecto existe
    const proyecto = await db
      .prepare(`
        SELECT
          p.PRO_id as id,
          p.PRO_cii as cii,
          p.PRO_estado_val_id as estado_id
        FROM PAI_PRO_proyectos p
        WHERE p.PRO_id = ?
      `)
      .bind(proyectoId)
      .first()

    if (!proyecto) {
      return c.json({ error: 'Proyecto no encontrado' }, 404)
    }

    // Actualizar estado
    await db
      .prepare(`
        UPDATE PAI_PRO_proyectos
        SET PRO_estado_val_id = ?,
            PRO_motivo_val_id = ?,
            PRO_motivo_descarte_id = ?,
            PRO_fecha_ultima_actualizacion = ?
        WHERE PRO_id = ?
      `)
      .bind(estado_id, motivo_valoracion_id || null, motivo_descarte_id || null, new Date().toISOString(), proyectoId)
      .run()

    // Registrar evento de pipeline
    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'cambiar_estado',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: `Estado cambiado a ${estado_id}`,
    })

    const estadoNombre = await getVALNombre(db, estado_id)

    return c.json({
      proyecto: {
        id: proyecto.id as number,
        cii: proyecto.cii as string,
        estado_id,
        estado: estadoNombre || 'Desconocido',
        motivo_valoracion_id: motivo_valoracion_id || null,
        motivo_descarte_id: motivo_descarte_id || null,
        fecha_ultima_actualizacion: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}

// ============================================================================
// DELETE /api/pai/proyectos/:id - Eliminar Proyecto
// ============================================================================

export async function handleEliminarProyecto(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const r2Bucket = getR2Bucket(c.env)
  const idParam = c.req.param('id')
  
  if (!idParam) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }
  
  const proyectoId = parseInt(idParam)
  
  if (isNaN(proyectoId)) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }
  
  try {
    // Verificar que el proyecto existe
    const proyecto = await db
      .prepare(`
        SELECT 
          p.PRO_id as id,
          p.PRO_cii as cii
        FROM PAI_PRO_proyectos p
        WHERE p.PRO_id = ?
      `)
      .bind(proyectoId)
      .first()
    
    if (!proyecto) {
      return c.json({ error: 'Proyecto no encontrado' }, 404)
    }
    
    const entityId = `proyecto-${proyectoId}`
    const cii = proyecto.cii as string
    
    // Registrar inicio de eliminación
    await insertPipelineEvent(db, {
      entityId,
      paso: 'eliminar_proyecto',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_START',
      detalle: 'Iniciando eliminación de proyecto',
    })
    
    // Eliminar notas
    await db
      .prepare('DELETE FROM PAI_NOT_notas WHERE NOT_proyecto_id = ?')
      .bind(proyectoId)
      .run()
    
    await insertPipelineEvent(db, {
      entityId,
      paso: 'eliminar_notas',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: 'Notas eliminadas',
    })
    
    // Eliminar artefactos
    await db
      .prepare('DELETE FROM PAI_ART_artefactos WHERE ART_proyecto_id = ?')
      .bind(proyectoId)
      .run()
    
    await insertPipelineEvent(db, {
      entityId,
      paso: 'eliminar_artefactos',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: 'Artefactos eliminados',
    })
    
    // Eliminar carpeta en R2
    await deleteProjectFolder(r2Bucket, cii)
    
    // Eliminar proyecto
    await db
      .prepare('DELETE FROM PAI_PRO_proyectos WHERE PRO_id = ?')
      .bind(proyectoId)
      .run()
    
    await insertPipelineEvent(db, {
      entityId,
      paso: 'eliminar_proyecto',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_COMPLETE',
      detalle: 'Proyecto eliminado',
    })
    
    return c.json({
      mensaje: 'Proyecto eliminado exitosamente',
      proyecto_eliminado: {
        id: proyecto.id as number,
        cii: cii,
      },
    })
  } catch (error) {
    console.error('Error al eliminar proyecto:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}

// ============================================================================
// GET /api/pai/proyectos/:id/pipeline - Obtener Historial de Ejecución
// ============================================================================

export async function handleObtenerHistorial(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const idParam = c.req.param('id')
  
  if (!idParam) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }
  
  const proyectoId = parseInt(idParam)
  
  if (isNaN(proyectoId)) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }
  
  try {
    const query = c.req.query()
    const limite = Math.min(1000, Math.max(1, parseInt(query.limite) || 100))
    
    // Verificar que el proyecto existe
    const proyecto = await db
      .prepare('SELECT PRO_id FROM PAI_PRO_proyectos WHERE PRO_id = ?')
      .bind(proyectoId)
      .first()
    
    if (!proyecto) {
      return c.json({ error: 'Proyecto no encontrado' }, 404)
    }
    
    const entityId = `proyecto-${proyectoId}`
    
    // Obtener eventos
    const eventos = await getEntityEvents(db, entityId, { limit: limite })

    return c.json({
      eventos,
    })
  } catch (error) {
    console.error('Error al obtener historial:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}

// ============================================================================
// GET /api/pai/proyectos/:id/artefactos - Obtener Artefactos
// ============================================================================
// P0.2 Corrección Crítica - Implementar endpoint faltante según diagnóstico FASE 2

export async function handleObtenerArtefactos(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const idParam = c.req.param('id')

  if (!idParam) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }

  const proyectoId = parseInt(idParam)

  if (isNaN(proyectoId)) {
    return c.json({ error: 'ID de proyecto inválido' }, 400)
  }

  try {
    // Verificar que el proyecto existe
    const proyecto = await db
      .prepare('SELECT PRO_id FROM PAI_PRO_proyectos WHERE PRO_id = ?')
      .bind(proyectoId)
      .first()

    if (!proyecto) {
      return c.json({ error: 'Proyecto no encontrado' }, 404)
    }

    // Obtener artefactos con información del tipo
    const artefactos = await db
      .prepare(`
        SELECT
          a.ART_id as id,
          a.ART_proyecto_id as proyecto_id,
          a.ART_tipo_val_id as tipo_artefacto_id,
          v.VAL_nombre as tipo,
          a.ART_ruta as ruta_r2,
          a.ART_fecha_generacion as fecha_creacion
        FROM PAI_ART_artefactos a
        LEFT JOIN PAI_VAL_valores v ON a.ART_tipo_val_id = v.VAL_id
        WHERE a.ART_proyecto_id = ?
        ORDER BY a.ART_fecha_generacion ASC
      `)
      .bind(proyectoId)
      .all()

    return c.json({
      artefactos: artefactos.results || [],
    })
  } catch (error) {
    console.error('Error al obtener artefactos:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}

// ============================================================================
// GET /api/pai/proyectos/:id/artefactos/:artefactoId/contenido - Obtener Contenido de Artefacto
// ============================================================================

export async function handleObtenerContenidoArtefacto(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const r2Bucket = getR2Bucket(c.env)
  const idParam = c.req.param('id')
  const artefactoIdParam = c.req.param('artefactoId')

  if (!idParam || !artefactoIdParam) {
    return c.json({ error: 'IDs inválidos' }, 400)
  }

  const proyectoId = parseInt(idParam)
  const artefactoId = parseInt(artefactoIdParam)

  if (isNaN(proyectoId) || isNaN(artefactoId)) {
    return c.json({ error: 'IDs inválidos' }, 400)
  }

  try {
    // Obtener información del artefacto
    const artefacto = await db
      .prepare(`
        SELECT
          a.ART_id as id,
          a.ART_ruta as ruta_r2
        FROM PAI_ART_artefactos a
        WHERE a.ART_proyecto_id = ? AND a.ART_id = ?
      `)
      .bind(proyectoId, artefactoId)
      .first()

    if (!artefacto) {
      return c.json({ error: 'Artefacto no encontrado' }, 404)
    }

    // Obtener contenido desde R2
    const r2Object = await r2Bucket.get(artefacto.ruta_r2 as string)

    if (!r2Object) {
      return c.json({ error: 'Contenido no encontrado en R2' }, 404)
    }

    const contenido = await r2Object.text()

    return c.json({
      contenido: contenido,
    })
  } catch (error) {
    console.error('Error al obtener contenido del artefacto:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}
