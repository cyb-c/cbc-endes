/**
 * Handlers: PAI Proyectos
 *
 * Handlers para operaciones de proyectos PAI (Proyectos de Análisis Inmobiliario)
 *
 * Following R2: Cero hardcoding - uses environment bindings
 * Following R4: Accesores tipados para bindings
 */

import { Context } from 'hono'
import { getDB, getR2Bucket } from '../env'
import { generateCII } from '../lib/r2-storage'
import { ejecutarAnalisisCompleto, reejecutarAnalisis } from '../services/simulacion-ia'
import { insertPipelineEvent, getEntityEvents } from '../lib/pipeline-events'
import { deleteProjectFolder } from '../lib/r2-storage'
import type { Env } from '../env'

type AppBindings = {
  db_binding_01: D1Database
  r2_binding_01: R2Bucket
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
  
  try {
    const body = await c.req.json<{ ijson: string }>()
    const { ijson } = body
    
    // Validar IJSON
    const validacion = validarIJSON(ijson)
    if (!validacion.valido) {
      return c.json({ error: validacion.error }, 400)
    }
    
    const ijsonParsed = validacion.parsed!
    
    // Obtener estado CREADO (primer estado)
    const estadoResult = await db
      .prepare(`
        SELECT v.VAL_id
        FROM PAI_VAL_valores v
        JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
        WHERE a.ATR_codigo = 'ESTADO_PROYECTO' AND v.VAL_codigo = 'CREADO'
      `)
      .first()
    
    if (!estadoResult) {
      return c.json({ error: 'Estado CREADO no encontrado' }, 500)
    }
    
    const estadoId = estadoResult.VAL_id as number
    
    // Insertar proyecto
    const insertResult = await db
      .prepare(`
        INSERT INTO PAI_PRO_proyectos (
          PRO_cii, PRO_titulo, PRO_estado_val_id,
          PRO_portal_nombre, PRO_portal_url, PRO_operacion,
          PRO_tipo_inmueble, PRO_precio, PRO_superficie_construida_m2,
          PRO_ciudad, PRO_barrio_distrito, PRO_direccion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        '', // CII se generará después
        ijsonParsed.titulo_anuncio as string,
        estadoId,
        ijsonParsed.portal_nombre as string || 'Desconocido',
        ijsonParsed.url_anuncio as string || '',
        ijsonParsed.operacion as string || 'venta',
        ijsonParsed.tipo_inmueble as string,
        ijsonParsed.precio as string,
        ijsonParsed.superficie_construida_m2 as string || '0',
        ijsonParsed.ciudad as string || '',
        ijsonParsed.barrio_distrito as string || null,
        ijsonParsed.direccion as string || null,
      )
      .run()
    
    const proyectoId = insertResult.meta.last_row_id
    
    // Generar y actualizar CII
    const cii = generateCII(proyectoId)
    await db
      .prepare('UPDATE PAI_PRO_proyectos SET PRO_cii = ? WHERE PRO_id = ?')
      .bind(cii, proyectoId)
      .run()
    
    // Registrar eventos de pipeline
    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'crear_proyecto',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_START',
      detalle: 'Iniciando creación de proyecto',
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
      paso: 'crear_proyecto',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_COMPLETE',
      detalle: 'Proyecto creado exitosamente',
    })
    
    const estadoNombre = await getVALNombre(db, estadoId)
    
    return c.json({
      proyecto: {
        id: proyectoId,
        cii,
        titulo: ijsonParsed.titulo_anuncio as string,
        estado_id: estadoId,
        estado: estadoNombre || 'Desconocido',
        fecha_alta: new Date().toISOString(),
        fecha_ultima_actualizacion: new Date().toISOString(),
      },
    }, 201)
  } catch (error) {
    console.error('Error al crear proyecto:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
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
          p.PRO_operacion as tipo_operacion,
          p.PRO_tipo_inmueble as tipo_inmueble,
          p.PRO_precio as precio,
          p.PRO_superficie_construida_m2 as superficie_construida_m2,
          p.PRO_ciudad as ciudad,
          p.PRO_barrio_distrito as barrio,
          p.PRO_direccion as direccion,
          p.PRO_fecha_alta as fecha_alta,
          p.PRO_fecha_ultima_actualizacion as fecha_ultima_actualizacion
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
        datos_basicos: {
          portal: proyecto.portal as string,
          url_fuente: proyecto.url_fuente as string,
          tipo_operacion: proyecto.tipo_operacion as string,
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

export async function handleEjecutarAnalisis(c: AppContext): Promise<Response> {
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
    const body = await c.req.json<{ forzar_reejecucion?: boolean }>()
    const { forzar_reejecucion = false } = body
    
    // Verificar que el proyecto existe
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
    
    // Verificar si ya existe análisis
    const artefactosExistentes = await db
      .prepare('SELECT COUNT(*) as count FROM PAI_ART_artefactos WHERE ART_proyecto_id = ?')
      .bind(proyectoId)
      .first()
    
    const tieneAnalisis = artefactosExistentes && (artefactosExistentes.count as number) > 0
    
    if (tieneAnalisis && !forzar_reejecucion) {
      return c.json({ error: 'Análisis ya existe. Usa forzar_reejecucion=true para re-ejecutar.' }, 409)
    }
    
    // Obtener IJSON del proyecto
    const ijsonResult = await db
      .prepare('SELECT PRO_ijson FROM PAI_PRO_proyectos WHERE PRO_id = ?')
      .bind(proyectoId)
      .first()
    
    // NOTA: Por ahora, asumimos que el IJSON se guarda en una columna o se obtiene de R2
    // En la implementación completa, el IJSON se guardaría en R2 al crear el proyecto
    const ijson = ijsonResult?.PRO_ijson as string || '{}'
    
    // Ejecutar análisis o re-ejecución
    const resultado = tieneAnalisis && forzar_reejecucion
      ? await reejecutarAnalisis(c.env, db, proyectoId, ijson)
      : await ejecutarAnalisisCompleto(c.env, db, proyectoId, ijson)
    
    if (!resultado.exito) {
      return c.json({ error: resultado.error_mensaje }, 500)
    }
    
    const estadoNombre = await getVALNombre(db, proyecto.estado_id as number)
    
    return c.json({
      proyecto: {
        id: proyecto.id as number,
        cii: proyecto.cii as string,
        estado_id: proyecto.estado_id as number,
        estado: estadoNombre || 'Desconocido',
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
// GET /api/pai/proyectos/:id/artefactos - Obtener Artefactos
// ============================================================================

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
    
    return c.json({
      artefactos: artefactosResult.results,
    })
  } catch (error) {
    console.error('Error al obtener artefactos:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}

// ============================================================================
// PUT /api/pai/proyectos/:id/estado - Cambiar Estado Manual
// ============================================================================

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
    const body = await c.req.json<{ estado_id: number; motivo_valoracion_id?: number; motivo_descarte_id?: number }>()
    const { estado_id, motivo_valoracion_id, motivo_descarte_id } = body
    
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
            PRO_fecha_ultima_actualizacion = ?
        WHERE PRO_id = ?
      `)
      .bind(estado_id, motivo_valoracion_id || null, new Date().toISOString(), proyectoId)
      .run()
    
    // Registrar evento de pipeline
    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'cambiar_estado',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: 'Estado cambiado manualmente',
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
