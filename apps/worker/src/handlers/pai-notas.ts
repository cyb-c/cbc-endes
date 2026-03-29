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
    const body = await c.req.json<{ tipo_nota_id: number; autor: string; asunto: string; contenido: string }>()
    const { tipo_nota_id, autor, asunto, contenido } = body

    // Validar datos
    if (!tipo_nota_id || !autor || !asunto || !contenido) {
      return c.json({ error: 'Datos de nota inválidos. Se requieren: tipo_nota_id, autor, asunto, contenido' }, 400)
    }

    // Verificar que el proyecto existe y obtener su estado actual
    const proyecto = await db
      .prepare(`
        SELECT 
          p.PRO_id,
          p.PRO_estado_val_id,
          v.VAL_nombre as estado_nombre
        FROM PAI_PRO_proyectos p
        JOIN PAI_VAL_valores v ON p.PRO_estado_val_id = v.VAL_id
        WHERE p.PRO_id = ?
      `)
      .bind(proyectoId)
      .first()

    if (!proyecto) {
      return c.json({ error: 'Proyecto no encontrado' }, 404)
    }

    // Insertar nota con asunto y estado_proyecto_creacion
    const insertResult = await db
      .prepare(`
        INSERT INTO PAI_NOT_notas (
          NOT_proyecto_id, NOT_tipo_val_id, NOT_asunto, NOT_nota,
          NOT_estado_val_id,  -- Guarda VAL_id como referencia (nullable según migración 010)
          NOT_editable, NOT_usuario_alta
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        proyectoId,
        tipo_nota_id,
        asunto,  // ✅ Ahora usa el asunto real
        contenido,
        proyecto.PRO_estado_val_id,  // ✅ Guarda estado como referencia
        1,  // editable
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
      detalle: `Nota creada: ${notaId}, estado_proyecto_creacion: ${proyecto.estado_nombre}`,
    })

    const tipoNombre = await getVALNombre(db, tipo_nota_id)

    return c.json({
      nota: {
        id: notaId,
        proyecto_id: proyectoId,
        tipo_nota_id,
        tipo: tipoNombre || 'Desconocido',
        asunto,  // ✅ Incluye asunto
        estado_proyecto_creacion: proyecto.estado_nombre,  // ✅ Incluye estado como VAL_nombre
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
