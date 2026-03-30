import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleGetMenu } from './handlers/menu';
import {
  handleCrearProyecto,
  handleObtenerProyecto,
  handleListarProyectos,
  handleEjecutarAnalisis,
  handleObtenerArtefactos,
  handleCambiarEstado,
  handleEliminarProyecto,
  handleObtenerHistorial,
  handleObtenerEstadosDisponibles,
  handleObtenerContenidoArtefacto,
  handleObtenerContenidoArtefactoPorTipo,
  handleObtenerMotivosValoracion,
  handleObtenerMotivosDescarte,
} from './handlers/pai-proyectos';
import {
  handleCrearNota,
  handleEditarNota,
  handleEliminarNota,
} from './handlers/pai-notas';

type AppBindings = {
  db_binding_01: D1Database;
  r2_binding_01: R2Bucket;
};

const app = new Hono<{ Bindings: AppBindings }>();

// CORS middleware
// Actualizado: 2026-03-29 - G71 Registrar solo URL de producción
app.use('/api/*', cors({
  origin: [
    'http://localhost:5173', // Desarrollo local
    'https://pg-cbc-endes.pages.dev' // Producción
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'cbc-endes-worker',
    version: '0.0.1'
  });
});

// Test endpoint
app.get('/api/test', (c) => {
  return c.json({
    message: 'Worker endpoint disponible',
    hono: true,
    typescript: true
  });
});

// Menu endpoint
app.get('/api/menu', handleGetMenu);

// ============================================================================
// PAI Proyectos Endpoints
// ============================================================================

// Crear proyecto
app.post('/api/pai/proyectos', handleCrearProyecto);

// Obtener detalles de proyecto
app.get('/api/pai/proyectos/:id', handleObtenerProyecto);

// Listar proyectos
app.get('/api/pai/proyectos', handleListarProyectos);

// Ejecutar análisis completo
app.post('/api/pai/proyectos/:id/analisis', handleEjecutarAnalisis);

// Obtener artefactos de proyecto
app.get('/api/pai/proyectos/:id/artefactos', handleObtenerArtefactos);

// Cambiar estado manual
app.put('/api/pai/proyectos/:id/estado', handleCambiarEstado);

// Eliminar proyecto
app.delete('/api/pai/proyectos/:id', handleEliminarProyecto);

// Obtener historial de ejecución
app.get('/api/pai/proyectos/:id/pipeline', handleObtenerHistorial);

// Obtener estados disponibles para cambio
app.get('/api/pai/estados-disponibles', handleObtenerEstadosDisponibles);

// Obtener contenido de artefacto por tipo (Sprint 3 Corrección)
app.get('/api/pai/proyectos/:id/artefactos/:tipo/contenido', handleObtenerContenidoArtefactoPorTipo);

// Obtener motivos de valoración
app.get('/api/pai/motivos-valoracion', handleObtenerMotivosValoracion);

// Obtener motivos de descarte
app.get('/api/pai/motivos-descarte', handleObtenerMotivosDescarte);

// ============================================================================
// PAI Notas Endpoints
// ============================================================================

// Crear nota
app.post('/api/pai/proyectos/:id/notas', handleCrearNota);

// Editar nota
app.put('/api/pai/proyectos/:id/notas/:notaId', handleEditarNota);

// Eliminar nota - Sprint 2 Día 4
app.delete('/api/pai/proyectos/:id/notas/:notaId', handleEliminarNota);

export default app;

