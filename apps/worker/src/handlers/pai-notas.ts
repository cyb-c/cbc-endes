/**
 * Handlers: PAI Notas
 *
 * Handlers para operaciones de notas PAI (Proyectos de Análisis Inmobiliario)
 *
 * Following R2: Cero hardcoding - uses environment bindings
 * Following R4: Accesores tipados para bindings
 */

import { Context } from 'hono'
import { getDB } from '../env'
import { insertPipelineEvent, getEntityEvents } from '../lib/pipeline-events'
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
 * Verifica si una nota es editable
 * Una nota es editable si el estado del proyecto no ha cambiado desde que se creó
 */
async function esNotaEditable(db: D1Database, proyectoId: number, notaFechaCreacion: string): Promise<boolean> {
  const entityId = `proyecto-${proyectoId}`
  
  // Obtener eventos de cambio de estado después de la creación de la nota
  const eventos = await getEntityEvents(db, entityId, { limit: 100 })
  
  // Buscar si hay algún cambio de estado después de la creación de la nota
  const notaFecha = new Date(notaFechaCreacion)
  
  for (const evento of eventos) {
    if (evento.paso === 'cambiar_estado' && evento.nivel === 'INFO') {
      const eventoFecha = new Date(evento.createdAt)
      if (eventoFecha > notaFecha) {
        return false // El estado cambió después de crear la nota
      }
    }
  }
  
  return true
}

// ============================================================================
// POST /api/pai/proyectos/:id/notas - Crear Nota
// ============================================================================

export async function handleCrearNota(c: AppContext): Promise<Response> {
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
    const body = await c.req.json<{ tipo_nota_id: number; autor: string; contenido: string }>()
    const { tipo_nota_id, autor, contenido } = body
    
    // Validar datos
    if (!tipo_nota_id || !autor || !contenido) {
      return c.json({ error: 'Datos de nota inválidos. Se requieren: tipo_nota_id, autor, contenido' }, 400)
    }
    
    // Verificar que el proyecto existe
    const proyecto = await db
      .prepare('SELECT PRO_id FROM PAI_PRO_proyectos WHERE PRO_id = ?')
      .bind(proyectoId)
      .first()
    
    if (!proyecto) {
      return c.json({ error: 'Proyecto no encontrado' }, 404)
    }
    
    // Obtener estado de nota ACTIVO (primer estado)
    const estadoResult = await db
      .prepare(`
        SELECT v.VAL_id
        FROM PAI_VAL_valores v
        JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
        WHERE a.ATR_codigo = 'ESTADO_NOTA' AND v.VAL_codigo = 'ACTIVO'
      `)
      .first()
    
    if (!estadoResult) {
      return c.json({ error: 'Estado ACTIVO de nota no encontrado' }, 500)
    }
    
    const estadoId = estadoResult.VAL_id as number
    
    // Insertar nota
    const insertResult = await db
      .prepare(`
        INSERT INTO PAI_NOT_notas (
          NOT_proyecto_id, NOT_tipo_val_id, NOT_asunto, NOT_nota,
          NOT_estado_val_id, NOT_editable, NOT_usuario_alta
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        proyectoId,
        tipo_nota_id,
        autor, // Usamos el autor como asunto por ahora
        contenido,
        estadoId,
        1, // editable
        autor,
      )
      .run()
    
    const notaId = insertResult.meta.last_row_id
    
    // Registrar evento de pipeline
    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'crear_nota',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: `Nota creada: ${notaId}`,
    })
    
    const tipoNombre = await getVALNombre(db, tipo_nota_id)
    
    return c.json({
      nota: {
        id: notaId,
        proyecto_id: proyectoId,
        tipo_nota_id,
        tipo: tipoNombre || 'Desconocido',
        autor,
        contenido,
        fecha_creacion: new Date().toISOString(),
      },
    }, 201)
  } catch (error) {
    console.error('Error al crear nota:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}

// ============================================================================
// PUT /api/pai/proyectos/:id/notas/:notaId - Editar Nota
// ============================================================================

export async function handleEditarNota(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const idParam = c.req.param('id')
  const notaIdParam = c.req.param('notaId')
  
  if (!idParam || !notaIdParam) {
    return c.json({ error: 'IDs de proyecto o nota inválidos' }, 400)
  }
  
  const proyectoId = parseInt(idParam)
  const notaId = parseInt(notaIdParam)
  
  if (isNaN(proyectoId) || isNaN(notaId)) {
    return c.json({ error: 'IDs de proyecto o nota inválidos' }, 400)
  }
  
  try {
    const body = await c.req.json<{ contenido: string }>()
    const { contenido } = body
    
    // Validar datos
    if (!contenido) {
      return c.json({ error: 'Contenido inválido' }, 400)
    }
    
    // Obtener nota
    const nota = await db
      .prepare(`
        SELECT 
          n.NOT_id as id,
          n.NOT_proyecto_id as proyecto_id,
          n.NOT_tipo_val_id as tipo_nota_id,
          n.NOT_nota as contenido,
          n.NOT_usuario_alta as autor,
          n.NOT_fecha_alta as fecha_creacion
        FROM PAI_NOT_notas n
        WHERE n.NOT_id = ? AND n.NOT_proyecto_id = ?
      `)
      .bind(notaId, proyectoId)
      .first()
    
    if (!nota) {
      return c.json({ error: 'Nota no encontrada' }, 404)
    }
    
    // Verificar si la nota es editable
    const editable = await esNotaEditable(db, proyectoId, nota.fecha_creacion as string)
    
    if (!editable) {
      return c.json({ error: 'La nota no es editable. El estado del proyecto ha cambiado.' }, 403)
    }
    
    // Actualizar nota
    await db
      .prepare(`
        UPDATE PAI_NOT_notas
        SET NOT_nota = ?, NOT_fecha_actualizacion = ?
        WHERE NOT_id = ?
      `)
      .bind(contenido, new Date().toISOString(), notaId)
      .run()
    
    // Registrar evento de pipeline
    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'editar_nota',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: `Nota editada: ${notaId}`,
    })
    
    const tipoNombre = await getVALNombre(db, nota.tipo_nota_id as number)
    
    return c.json({
      nota: {
        id: nota.id as number,
        proyecto_id: nota.proyecto_id as number,
        tipo_nota_id: nota.tipo_nota_id as number,
        tipo: tipoNombre || 'Desconocido',
        autor: nota.autor as string,
        contenido,
        fecha_creacion: nota.fecha_creacion as string,
      },
    })
  } catch (error) {
    console.error('Error al editar nota:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}
