# Notas en Proyectos PAI - Extracción de Documentación

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Introducción](#2-introducción)
3. [Modelo de Datos de Notas](#3-modelo-de-datos-de-notas)
4. [API de Notas - Endpoints](#4-api-de-notas---endpoints)
5. [Componentes Frontend](#5-componentes-frontend)
6. [Reglas de Editabilidad](#6-reglas-de-editabilidad)
7. [Estados del Proyecto y Permisos](#7-estados-del-proyecto-y-permisos)
8. [Integración con Pipeline Events](#8-integración-con-pipeline-events)
9. [Estructura Visual](#9-estructura-visual)
10. [Validaciones](#10-validaciones)
11. [Referencias Cruzadas](#11-referencias-cruzadas)

---

## 1. Resumen Ejecutivo

Este documento consolida **toda la información relativa a las notas en proyectos PAI** extraída de la documentación de las Fases 02 y 03 del proyecto.

**Fuentes analizadas:**
- `_doc-desarrollo/Legado-archivo/proyecto-PIA/MapaRuta/Fase02/`
- `_doc-desarrollo/Legado-archivo/proyecto-PIA/MapaRuta/Fase03/`

**Propósito:** Servir como referencia única y completa para la implementación, mantenimiento y evolución del sistema de notas en proyectos PAI.

---

## 2. Introducción

### 2.1. ¿Qué son las Notas PAI?

Las **notas** son observaciones y comentarios que los usuarios pueden agregar a los proyectos de análisis inmobiliario (PAI). Permiten:

- Documentar decisiones durante el proceso de análisis
- Agregar contexto adicional a los proyectos
- Registrar observaciones de diferentes stakeholders
- Mantener un historial de comentarios sobre el proyecto

### 2.2. Objetivos del Sistema de Notas

- **Trazabilidad:** Registrar quién, cuándo y qué se comentó sobre un proyecto
- **Colaboración:** Permitir múltiples usuarios de agregar observaciones
- **Control de Cambios:** Limitar edición/eliminación basado en estado del proyecto
- **Integración:** Conectar con el sistema de Pipeline Events para auditoría

### 2.3. Ubicación en la Interfaz

Las notas se muestran en la **vista de detalle de proyecto** (`/proyectos/:id`), en una sección dedicada llamada "Notas del Proyecto" o "Notas / Historial".

---

## 3. Modelo de Datos de Notas

### 3.1. Tabla de Base de Datos

**Tabla:** `PAI_NOT_notas`

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `NOT_id` | INTEGER | NO | Primary key, autoincrement |
| `NOT_proyecto_id` | INTEGER | NO | Foreign key a `PAI_PRO_proyectos(PRO_id)` |
| `NOT_tipo_val_id` | INTEGER | NO | Foreign key a `PAI_VAL_valores(VAL_id)` - Tipo de nota |
| `NOT_asunto` | TEXT | NO | Asunto/título de la nota |
| `NOT_nota` | TEXT | NO | Contenido de la nota |
| `NOT_estado_val_id` | INTEGER | YES | Foreign key a `PAI_VAL_valores(VAL_id)` - Estado de la nota |
| `NOT_editable` | INTEGER | NO | Flag de editabilidad (1=Sí, 0=No) |
| `NOT_fecha_alta` | TEXT | NO | Fecha de creación (datetime) |
| `NOT_fecha_actualizacion` | TEXT | NO | Fecha de última actualización (datetime) |
| `NOT_usuario_alta` | TEXT | YES | Usuario que creó la nota |
| `NOT_usuario_actualizacion` | TEXT | YES | Usuario que actualizó la nota |

### 3.2. Tipos de Notas (PAI_VAL_valores)

Los tipos de notas están definidos en la tabla `PAI_VAL_valores` con `VAL_atr_id = TIPO_NOTA`:

| VAL_id | VAL_codigo | VAL_nombre | Descripción |
|--------|------------|------------|-------------|
| 25 | COMENTARIO | Comentario | Nota de tipo comentario |
| 26 | VALORACION | Valoración | Nota de tipo valoración |
| 27 | DECISION | Decisión | Nota de tipo decisión |
| 28 | APRENDE_IA | Corrección IA | Nota de tipo corrección para IA |
| 67 | ACTIVO | activo | Nota activa, puede editarse |

### 3.3. Interfaz TypeScript (Frontend)

```typescript
interface Nota {
  id: number;
  proyecto_id: number;
  tipo_nota_id: number;
  tipo: string;
  asunto: string;  // Asunto/título de la nota
  estado_proyecto_creacion: string;  // VAL_nombre del estado al crear la nota (clave para editabilidad)
  autor: string;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  usuario_id?: number;
  esEditable?: boolean;  // Calculado en frontend basado en cambios de estado
  razonNoEditable?: string;  // Razón por la que no es editable (si aplica)
}
```

### 3.4. Response de API

**Crear Nota (201):**
```typescript
interface CrearNotaResponse {
  nota: {
    id: number;
    proyecto_id: number;
    tipo_nota_id: number;
    tipo: string;
    asunto: string;  // Asunto/título de la nota
    estado_proyecto_creacion: string;  // VAL_nombre del estado al crear (ej: "creado", "analisis_finalizado")
    autor: string;
    contenido: string;
    fecha_creacion: string;
  }
}
```

**Editar Nota (200):**
```typescript
interface EditarNotaResponse {
  nota: {
    id: number;
    proyecto_id: number;
    tipo_nota_id: number;
    tipo: string;
    asunto: string;
    estado_proyecto_creacion: string;  // Se mantiene el estado original de creación
    autor: string;
    contenido: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
  }
}
```

**Obtener Notas (en GET /api/pai/proyectos/:id):**
```typescript
{
  "notas": [
    {
      "id": 1,
      "tipo_nota_id": 1,
      "tipo": "Comentario",
      "asunto": "Observación sobre ubicación",
      "estado_proyecto_creacion": "analisis_finalizado",  // Clave para validar editabilidad
      "autor": "Juan Pérez",
      "contenido": "Contenido de la nota",
      "fecha_creacion": "2026-03-27T14:30:00Z",
      "esEditable": true  // Calculado comparando con pipeline_eventos
    }
  ]
}
```

---

## 4. API de Notas - Endpoints

### 4.1. Crear Nota

**Endpoint:** `POST /api/pai/proyectos/:id/notas`

**Descripción:** Crea una nueva nota asociada a un proyecto PAI.

**Parámetros de URL:**
- `id` (number) - ID del proyecto

**Request Body:**
```typescript
interface CrearNotaRequest {
  tipo_nota_id: number;  // ID del tipo de nota (de PAI_VAL_valores)
  autor: string;         // Nombre del autor
  asunto: string;        // Asunto/título de la nota (1-200 caracteres)
  contenido: string;     // Contenido de la nota (1-5000 caracteres)
}
```

**Response Exitoso (201):**
```typescript
{
  "nota": {
    "id": 1,
    "proyecto_id": 42,
    "tipo_nota_id": 1,
    "tipo": "Comentario",
    "asunto": "Observación sobre ubicación",
    "estado_proyecto_creacion": "analisis_finalizado",  // VAL_nombre del estado actual del proyecto
    "autor": "Juan Pérez",
    "contenido": "Esta es una nota de ejemplo",
    "fecha_creacion": "2026-03-27T14:30:00Z"
  }
}
```

**Notas Importantes:**
- `estado_proyecto_creacion` debe guardarse como `PAI_VAL_valores.VAL_nombre` (ej: "creado", "analisis_finalizado"), NO como VAL_id
- Este valor es **crítico** para determinar la editabilidad de la nota posteriormente
- Si el estado del proyecto cambia después de crear la nota, la nota ya no será editable

**Eventos Pipeline a Registrar:**
- `PROCESS_START` - Inicio del proceso de creación de nota
- `STEP_SUCCESS` - Tipo de nota validado
- `STEP_SUCCESS` - Nota insertada en PAI_NOT_notas
- `PROCESS_COMPLETE` - Nota creada exitosamente

**Errores:**
| Código | Descripción |
|--------|-------------|
| `400` | Datos de nota inválidos (contenido vacío, tipo inválido) |
| `404` | Proyecto no encontrado |
| `500` | Error interno del servidor |

---

### 4.2. Editar Nota

**Endpoint:** `PUT /api/pai/proyectos/:id/notas/:notaId`

**Descripción:** Edita una nota existente asociada a un proyecto PAI.

**Parámetros de URL:**
- `id` (number) - ID del proyecto
- `notaId` (number) - ID de la nota

**Request Body:**
```typescript
interface EditarNotaRequest {
  contenido: string;  // Nuevo contenido de la nota
}
```

**Response Exitoso (200):**
```typescript
{
  "nota": {
    "id": 1,
    "proyecto_id": 42,
    "tipo_nota_id": 1,
    "tipo": "Comentario",
    "autor": "Juan Pérez",
    "contenido": "Contenido actualizado",
    "fecha_creacion": "2026-03-27T14:30:00Z",
    "fecha_actualizacion": "2026-03-27T15:45:00Z"
  }
}
```

**Validación de Editabilidad:**
- Una nota solo puede editarse mientras siga vigente el estado con el que fue creada
- El control de editabilidad se contrasta contra la trazabilidad de cambios de estado registrada en `pipeline_eventos`
- Si el estado del proyecto cambió desde la creación de la nota → **Error 403**

**Eventos Pipeline a Registrar:**
- `PROCESS_START` - Inicio del proceso de edición de nota
- `STEP_SUCCESS` - Editabilidad validada contra estado actual
- `STEP_SUCCESS` - Nota actualizada en PAI_NOT_notas
- `PROCESS_COMPLETE` - Nota editada exitosamente

**Errores:**
| Código | Descripción |
|--------|-------------|
| `400` | Contenido inválido (vacío o >5000 caracteres) |
| `403` | Nota no es editable (estado del proyecto cambió) |
| `404` | Proyecto o nota no encontrados |
| `500` | Error interno del servidor |

---

### 4.3. Eliminar Nota

**Endpoint:** `DELETE /api/pai/proyectos/:id/notas/:notaId`

**Descripción:** Elimina una nota existente asociada a un proyecto PAI.

**Parámetros de URL:**
- `id` (number) - ID del proyecto
- `notaId` (number) - ID de la nota

**Response Exitoso (200):**
```typescript
{
  "mensaje": "Nota eliminada correctamente",
  "nota_eliminada": {
    "id": 1,
    "proyecto_id": 42
  }
}
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `403` | Nota no es eliminable (estado del proyecto = descartado) |
| `404` | Proyecto o nota no encontrados |
| `500` | Error interno del servidor |

---

### 4.4. Obtener Notas de Proyecto

**Endpoint:** `GET /api/pai/proyectos/:id` (incluye notas en response)

**Descripción:** Obtiene los detalles completos de un proyecto, incluyendo sus notas.

**Response (extracto de notas):**
```typescript
{
  "proyecto": { ... },
  "artefactos": [ ... ],
  "notas": [
    {
      "id": 1,
      "tipo_nota_id": 1,
      "tipo": "Comentario",
      "autor": "Juan Pérez",
      "contenido": "Contenido de la nota",
      "fecha_creacion": "2026-03-27T14:30:00Z"
    }
  ]
}
```

**Ordenamiento:** Las notas se retornan en orden cronológico inverso (más reciente primero).

---

## 5. Componentes Frontend

### 5.1. Componente ListaNotas

**Archivo:** `apps/frontend/src/components/pai/ListaNotas.tsx`

**Props:**
```typescript
interface ListaNotasProps {
  proyectoId: number;
  estadoProyecto: string;
  onNotaEditada?: (nota: Nota) => void;
  onNotaEliminada?: (notaId: number) => void;
}
```

**Responsabilidades:**
- Mostrar todas las notas del proyecto en orden cronológico inverso
- Controlar permisos de edición/eliminación según estado del proyecto
- Manejar creación de nuevas notas
- Coordinar edición y eliminación

**Estado Interno:**
```typescript
const [notas, setNotas] = useState<Nota[]>([]);
const [mostrarFormulario, setMostrarFormulario] = useState(false);
const [notaEditando, setNotaEditando] = useState<Nota | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

---

### 5.2. Componente FormularioNota (Creación)

**Archivo:** `apps/frontend/src/components/pai/FormularioNota.tsx`

**Props:**
```typescript
interface FormularioNotaProps {
  proyectoId: number;
  onGuardado: (nota: Nota) => void;
  onCancel: () => void;
}
```

**Campos del Formulario:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `tipo_nota_id` | select | ✅ Sí | Tipo de nota (Comentario, Valoración, Decisión, Corrección IA) |
| `autor` | text | ✅ Sí | Nombre del autor |
| `asunto` | text | ✅ Sí | Asunto/título de la nota (1-200 caracteres) |
| `contenido` | textarea | ✅ Sí | Contenido de la nota (1-5000 caracteres) |

**Estado Interno:**
```typescript
const [contenido, setContenido] = useState('');
const [tipoNota, setTipoNota] = useState<number>(1); // Default: Comentario
const [autor, setAutor] = useState('');
const [asunto, setAsunto] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Envío del Formulario:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validar campos
  if (!asunto.trim()) {
    setError('El asunto es obligatorio');
    return;
  }

  if (!contenido.trim()) {
    setError('El contenido es obligatorio');
    return;
  }

  // Enviar al backend
  const response = await apiClient.post<Nota>(
    `/api/pai/proyectos/${proyectoId}/notas`,
    { 
      tipo_nota_id: tipoNota,
      autor,
      asunto,
      contenido 
    }
  );

  if (response.success && response.data) {
    onGuardado(response.data);
  } else {
    setError(response.error?.message || 'Error al crear nota');
  }
};
```

---

### 5.3. Componente FormularioEditarNota (Edición)

**Archivo:** `apps/frontend/src/components/pai/FormularioEditarNota.tsx`

**Props:**
```typescript
interface FormularioEditarNotaProps {
  proyectoId: number;
  nota: Nota;
  onGuardado: (nota: Nota) => void;
  onCancel: () => void;
}
```

**Campos del Formulario:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `contenido` | textarea | ✅ Sí | Contenido actualizado de la nota |

**Estado Interno:**
```typescript
const [contenido, setContenido] = useState(nota.contenido);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

---

## 6. Reglas de Editabilidad

### 6.1. Principio Fundamental

> **Una nota solo puede editarse o eliminarse mientras siga vigente el estado con el que fue creada.**

Esto significa que:
1. Si el estado del proyecto cambió desde la creación de la nota → **Nota NO editable**
2. Si el estado del proyecto cambió desde la creación de la nota → **Nota NO eliminable**
3. El estado se guarda como `VAL_nombre` (ej: "creado", "analisis_finalizado"), NO como `VAL_id`

### 6.2. Implementación de Validación

```typescript
async function validarEditabilidadNota(
  db: D1Database,
  notaId: number,
  proyectoId: number,
): Promise<{ editable: boolean; razon?: string }> {
  // Obtener nota con fecha de creación y estado_proyecto_creacion
  const nota = await db
    .prepare('SELECT * FROM PAI_NOT_notas WHERE id = ?')
    .bind(notaId)
    .first();

  if (!nota) {
    return { editable: false, razon: 'Nota no encontrada' };
  }

  // Obtener estado actual del proyecto
  const proyecto = await db
    .prepare('SELECT estado_id FROM PAI_PRO_proyectos WHERE id = ?')
    .bind(proyectoId)
    .first();

  if (!proyecto) {
    return { editable: false, razon: 'Proyecto no encontrado' };
  }

  // Obtener historial de cambios de estado desde pipeline_eventos
  const eventos = await getEntityEvents(db, `proyecto-${proyectoId}`);

  // Buscar el último cambio de estado DESPUÉS de la creación de la nota
  const cambioEstadoPosterior = eventos.some(e => 
    e.paso === 'cambiar_estado' && 
    new Date(e.created_at) > new Date(nota.fecha_creacion)
  );

  if (cambioEstadoPosterior) {
    return { 
      editable: false, 
      razon: `La nota se creó cuando el proyecto estaba en estado "${nota.estado_proyecto_creacion}". El estado del proyecto cambió desde entonces.` 
    };
  }

  return { editable: true };
}
```

### 6.3. Comportamiento en Frontend

```typescript
// apps/frontend/src/components/pai/ListaNotas.tsx

const puedeAgregarNotas = estadoProyecto !== 'descartado';

// En el render de cada nota:
const mostrarBotones = estadoProyecto !== 'descartado' && nota.esEditable !== false;

{mostrarBotones ? (
  <div className="space-x-2">
    <button onClick={() => setNotaEditando(nota)}>Editar</button>
    <button onClick={() => handleNotaEliminada(nota.id)}>Eliminar</button>
  </div>
) : nota.razonNoEditable ? (
  <span className="text-xs text-gray-500 italic" title={nota.razonNoEditable}>
    🔒 No editable (Estado: {nota.estado_proyecto_creacion})
  </span>
) : null}
```

### 6.4. Ejemplo de Flujo

```
Proyecto creado (estado: "creado")
  ↓
Usuario crea Nota A (estado_proyecto_creacion: "creado")
  ↓
Nota A es EDITABLE y ELIMINABLE ✅
  ↓
Usuario cambia estado a "analisis_finalizado"
  ↓
Nota A ya NO es editable ni eliminable ❌
  ↓
Usuario crea Nota B (estado_proyecto_creacion: "analisis_finalizado")
  ↓
Nota B es EDITABLE y ELIMINABLE ✅ (mientras no cambie el estado)
```

---

## 7. Estados del Proyecto y Permisos

### 7.1. Matriz de Permisos por Estado

| Estado del Proyecto | Puede Agregar Notas | Puede Editar Notas | Puede Eliminar Notas |
|---------------------|---------------------|-------------------|----------------------|
| `creado` | ✅ Sí | ✅ Sí | ✅ Sí |
| `procesando_analisis` | ✅ Sí | ✅ Sí | ✅ Sí |
| `analisis_con_error` | ✅ Sí | ✅ Sí | ✅ Sí |
| `analisis_finalizado` | ✅ Sí | ✅ Sí | ✅ Sí |
| `evaluando_viabilidad` | ✅ Sí | ✅ Sí | ✅ Sí |
| `evaluando_plan_negocio` | ✅ Sí | ✅ Sí | ✅ Sí |
| `seguimiento_comercial` | ✅ Sí | ✅ Sí | ✅ Sí |
| `descartado` | ❌ No | ❌ No | ❌ No |

### 7.2. Implementación de Validación

```typescript
// apps/frontend/src/components/pai/utils.ts

export function puedeGestionarNotas(estadoProyecto: string): boolean {
  const estadosPermitidos = [
    'creado',
    'procesando_analisis',
    'analisis_con_error',
    'analisis_finalizado',
    'evaluando_viabilidad',
    'evaluando_plan_negocio',
    'seguimiento_comercial',
  ];
  return estadosPermitidos.includes(estadoProyecto);
}

export function puedeAgregarNotas(estadoProyecto: string): boolean {
  return estadoProyecto !== 'descartado';
}
```

---

## 8. Integración con Pipeline Events

### 8.1. Eventos a Registrar

| Operación | Tipo Evento | Nivel | Descripción |
|-----------|-------------|--------|-------------|
| Crear nota | `PROCESS_START` | `INFO` | Inicio del proceso de creación de nota |
| Crear nota | `STEP_SUCCESS` | `INFO` | Tipo de nota validado |
| Crear nota | `STEP_SUCCESS` | `INFO` | Nota insertada en PAI_NOT_notas |
| Crear nota | `PROCESS_COMPLETE` | `INFO` | Nota creada exitosamente |
| Editar nota | `PROCESS_START` | `INFO` | Inicio del proceso de edición de nota |
| Editar nota | `STEP_SUCCESS` | `INFO` | Editabilidad validada contra estado actual |
| Editar nota | `STEP_SUCCESS` | `INFO` | Nota actualizada en PAI_NOT_notas |
| Editar nota | `PROCESS_COMPLETE` | `INFO` | Nota editada exitosamente |
| Eliminar nota | `PROCESS_START` | `INFO` | Inicio del proceso de eliminación |
| Eliminar nota | `STEP_SUCCESS` | `INFO` | Nota eliminada de PAI_NOT_notas |
| Eliminar nota | `PROCESS_COMPLETE` | `INFO` | Eliminación completada |

### 8.2. Ejemplo de Implementación

```typescript
// apps/worker/src/handlers/pai-notas.ts - handleCrearNota

export async function handleCrearNota(c: AppContext): Promise<Response> {
  const db = getDB(c.env);
  const idParam = c.req.param('id');
  const proyectoId = parseInt(idParam);

  try {
    const body = await c.req.json<{ 
      tipo_nota_id: number; 
      autor: string; 
      asunto: string;
      contenido: string;
    }>();
    const { tipo_nota_id, autor, asunto, contenido } = body;

    // Validar datos
    if (!tipo_nota_id || !autor || !asunto || !contenido) {
      return c.json({ error: 'Datos de nota inválidos. Se requieren: tipo_nota_id, autor, asunto, contenido' }, 400);
    }

    // Obtener estado actual del proyecto (para guardar como referencia)
    const proyecto = await db
      .prepare(`
        SELECT p.PRO_estado_val_id, v.VAL_nombre as estado_nombre
        FROM PAI_PRO_proyectos p
        JOIN PAI_VAL_valores v ON p.PRO_estado_val_id = v.VAL_id
        WHERE p.PRO_id = ?
      `)
      .bind(proyectoId)
      .first();

    if (!proyecto) {
      return c.json({ error: 'Proyecto no encontrado' }, 404);
    }

    // Registrar evento de inicio
    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'crear_nota',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_START',
      detalle: 'Iniciando creación de nota',
    });

    // Insertar nota con estado_proyecto_creacion
    const insertResult = await db
      .prepare(`
        INSERT INTO PAI_NOT_notas (
          NOT_proyecto_id, NOT_tipo_val_id, NOT_asunto, NOT_nota,
          NOT_estado_val_id,  -- Guarda VAL_id como referencia (nullable)
          NOT_editable, NOT_usuario_alta
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        proyectoId,
        tipo_nota_id,
        asunto,
        contenido,
        proyecto.PRO_estado_val_id,  -- Referencia (nullable)
        1,  -- editable
        autor
      )
      .run();

    const notaId = insertResult.meta.last_row_id;

    // Registrar evento de éxito
    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'crear_nota',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: `Nota creada: ${notaId}, estado_proyecto_creacion: ${proyecto.estado_nombre}`,
    });

    return c.json({
      nota: {
        id: notaId,
        proyecto_id: proyectoId,
        tipo_nota_id,
        tipo: await getVALNombre(db, tipo_nota_id),
        asunto,
        estado_proyecto_creacion: proyecto.estado_nombre,  // VAL_nombre, NO VAL_id
        autor,
        contenido,
        fecha_creacion: new Date().toISOString(),
      },
    }, 201);
  } catch (error) {
    // Registrar evento de error
    await insertPipelineEvent(db, {
      entityId: `proyecto-${proyectoId}`,
      paso: 'crear_nota',
      nivel: 'ERROR',
      tipoEvento: 'PROCESS_FAILED',
      errorCodigo: 'ERROR_CREAR_NOTA',
      detalle: error instanceof Error ? error.message : 'Error desconocido',
    });

    return c.json({ error: 'Error interno del servidor' }, 500);
  }
}
```

**Puntos Clave:**
1. `estado_proyecto_creacion` se guarda como `VAL_nombre` (ej: "creado"), NO como `VAL_id`
2. `NOT_estado_val_id` se guarda como referencia (es nullable según migración 010)
3. El evento de pipeline incluye el estado para trazabilidad

---

## 9. Estructura Visual

### 9.1. Componente ListaNotas

```
┌─────────────────────────────────────────────────────────────┐
│  Notas del Proyecto                                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📝 Observación sobre ubicación                      │   │ ← Asunto
│  │  ─────────────────────────────────────────────────   │   │
│  │  Estado al crear: Análisis Finalizado                │   │ ← estado_proyecto_creacion
│  │  Contenido de la nota...                              │   │
│  │                                                       │   │
│  │  Autor: Juan Pérez                                    │   │
│  │  Creado: 27/03/2026 14:30                             │   │
│  │  Actualizado: 27/03/2026 15:45                        │   │
│  │                                                       │   │
│  │  [Editar] [Eliminar]                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📝 Nota de valoración                               │   │
│  │  ─────────────────────────────────────────────────   │   │
│  │  Estado al crear: Creado                             │   │
│  │  Contenido de la nota...                              │   │
│  │                                                       │   │
│  │  Autor: María García                                  │   │
│  │  Creado: 26/03/2026 10:15                             │   │
│  │                                                       │   │
│  │  🔒 No editable (El estado del proyecto cambió)      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [+ Agregar Nota]                                           │
└─────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
1. **Asunto**: Se muestra como título de cada nota
2. **Estado al crear**: Muestra el `estado_proyecto_creacion` (VAL_nombre) para referencia
3. **Indicador de editabilidad**: 
   - Si `esEditable = true`: Muestra botones [Editar] [Eliminar]
   - Si `esEditable = false`: Muestra 🔒 con razón
4. **Orden**: Cronológico inverso (más reciente primero)

### 9.2. Formulario de Creación

```
┌─────────────────────────────────────────────────────────────┐
│  Nueva Nota                                                  │
├─────────────────────────────────────────────────────────────┤
│  Tipo de Nota: [Comentario        ▼]                        │
│                                                             │
│  Asunto: [___________________________]                      │
│         (1-200 caracteres)                                  │
│                                                             │
│  Autor: [___________________________]                       │
│                                                             │
│  Contenido:                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Escribe tu nota aquí...                            │   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancelar] [Guardar Nota]                                  │
└─────────────────────────────────────────────────────────────┘
```

**Campos del Formulario:**
| Campo | Placeholder | Validación |
|-------|-------------|------------|
| Tipo de Nota | - | Requerido, select |
| Asunto | "Asunto de la nota" | Requerido, 1-200 caracteres |
| Autor | "Nombre del autor" | Requerido, 1-100 caracteres |
| Contenido | "Escribe tu nota aquí..." | Requerido, 1-5000 caracteres |

**Comportamiento al Guardar:**
1. Validar todos los campos
2. Obtener estado actual del proyecto (`estado_proyecto`)
3. Enviar request con `estado_proyecto_creacion = estado_proyecto` (VAL_nombre)
4. Backend guarda el estado como referencia para futura editabilidad

### 9.3. Formulario de Edición

```
┌─────────────────────────────────────────────────────────────┐
│  Editar Nota                                                 │
├─────────────────────────────────────────────────────────────┤
│  ⚠️ Solo puedes editar el contenido. El asunto y el estado  │
│     de creación no se pueden modificar.                     │
│                                                             │
│  Asunto: Observación sobre ubicación (solo lectura)         │
│                                                             │
│  Contenido:                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Contenido existente de la nota...                  │   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancelar] [Guardar Cambios]                               │
└─────────────────────────────────────────────────────────────┘
```

**Restricciones de Edición:**
- ✅ **Editable**: `contenido`
- ❌ **No editable**: `asunto`, `estado_proyecto_creacion`, `autor`, `tipo_nota_id`

**Validación de Editabilidad (Backend):**
```typescript
// Antes de permitir la edición, verificar:
const eventos = await getEntityEvents(db, `proyecto-${proyectoId}`);

// Buscar cambios de estado después de la creación de la nota
const cambioEstadoPosterior = eventos.some(e => 
  e.paso === 'cambiar_estado' && 
  e.created_at > nota.fecha_creacion
);

if (cambioEstadoPosterior) {
  return { 
    editable: false, 
    razon: 'El estado del proyecto cambió desde que se creó la nota' 
  };
}
```

---

## 10. Validaciones

### 10.1. Validaciones de Creación

| Campo | Validación | Mensaje de Error |
|-------|------------|------------------|
| `tipo_nota_id` | Requerido, debe existir en PAI_VAL_valores | "Tipo de nota inválido" |
| `autor` | Requerido, 1-100 caracteres | "El autor es obligatorio" |
| `asunto` | Requerido, 1-200 caracteres | "El asunto es obligatorio" |
| `contenido` | Requerido, 1-5000 caracteres | "El contenido de la nota es obligatorio" |
| `proyecto_id` | Debe existir en PAI_PRO_proyectos | "Proyecto no encontrado" |
| `estado_proyecto_creacion` | Debe ser VAL_nombre válido de ESTADO_PROYECTO | "Estado del proyecto inválido" |

**Validación de Estado al Crear:**
```typescript
// Backend: Al crear la nota, capturar el estado actual del proyecto
const proyecto = await db
  .prepare(`
    SELECT p.PRO_estado_val_id, v.VAL_nombre
    FROM PAI_PRO_proyectos p
    JOIN PAI_VAL_valores v ON p.PRO_estado_val_id = v.VAL_id
    WHERE p.PRO_id = ?
  `)
  .bind(proyectoId)
  .first();

// Guardar VAL_nombre (no VAL_id) para referencia futura
const estadoProyectoCreacion = proyecto.VAL_nombre; // ej: "creado", "analisis_finalizado"

// Insertar nota con estado_proyecto_creacion
await db
  .prepare(`
    INSERT INTO PAI_NOT_notas (
      NOT_proyecto_id, NOT_tipo_val_id, NOT_asunto, NOT_nota,
      NOT_estado_val_id,  -- Se guarda pero es nullable
      NOT_editable, NOT_usuario_alta
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  .bind(
    proyectoId,
    tipo_nota_id,
    asunto,
    contenido,
    proyecto.PRO_estado_val_id,  -- Opcional, para referencia
    1,  -- editable
    autor
  )
  .run();
```

### 10.2. Validaciones de Edición

| Campo | Validación | Mensaje de Error |
|-------|------------|------------------|
| `contenido` | Requerido, 1-5000 caracteres | "El contenido de la nota es obligatorio" |
| Editabilidad | No debe haber cambios de estado desde la creación | "La nota no es editable. El estado del proyecto ha cambiado." |

**Validación de Editabilidad (Backend):**
```typescript
async function validarEditabilidadNota(
  db: D1Database,
  notaId: number,
  proyectoId: number,
): Promise<{ editable: boolean; razon?: string }> {
  // Obtener nota con fecha de creación
  const nota = await db
    .prepare('SELECT * FROM PAI_NOT_notas WHERE id = ?')
    .bind(notaId)
    .first();

  if (!nota) {
    return { editable: false, razon: 'Nota no encontrada' };
  }

  // Obtener historial de cambios de estado desde pipeline_eventos
  const eventos = await getEntityEvents(db, `proyecto-${proyectoId}`);

  // Buscar cambios de estado DESPUÉS de la creación de la nota
  const cambioEstadoPosterior = eventos.some(e => 
    e.paso === 'cambiar_estado' && 
    new Date(e.created_at) > new Date(nota.fecha_creacion)
  );

  if (cambioEstadoPosterior) {
    return { 
      editable: false, 
      razon: `La nota se creó cuando el proyecto estaba en estado "${nota.estado_proyecto_creacion}". Desde entonces, el estado del proyecto ha cambiado.` 
    };
  }

  return { editable: true };
}
```

### 10.3. Validaciones de Eliminación

| Validación | Mensaje de Error |
|------------|------------------|
| Estado del proyecto ≠ descartado | "No se puede eliminar notas de proyectos descartados" |
| Nota debe existir | "Nota no encontrada" |
| No debe haber cambios de estado desde la creación | "La nota no se puede eliminar porque el estado del proyecto ha cambiado" |

**Nota:** La misma regla de editabilidad aplica para eliminación:
- Si el estado del proyecto cambió desde la creación de la nota → **No se puede eliminar**

---

## 11. Referencias Cruzadas

### 11.1. Documentos de Fase02

| Documento | Ruta | Relación con Notas |
|-----------|------|-------------------|
| `Especificacion_API_PAI.md` | `Fase02/` | Define endpoints de API para notas |
| `Integracion_Pipeline_Events_PAI.md` | `Fase02/` | Define eventos de pipeline para notas |

### 11.2. Documentos de Fase03

| Documento | Ruta | Relación con Notas |
|-----------|------|-------------------|
| `09_Componente_Notas.md` | `Fase03/` | Especificación completa de componentes |
| `08_Vista_Detalle_Proyecto.md` | `Fase03/` | Define sección de notas en detalle |
| `10_Componente_Modal_Cambio_Estado.md` | `Fase03/` | Relaciona estados con editabilidad |
| `11_Estados_Motivos_PAI.md` | `Fase03/` | Define estados que afectan permisos |

### 11.3. Archivos de Implementación

| Archivo | Ruta | Propósito |
|---------|------|-----------|
| `ListaNotas.tsx` | `apps/frontend/src/components/pai/` | Componente lista de notas |
| `FormularioNota.tsx` | `apps/frontend/src/components/pai/` | Formulario de creación |
| `FormularioEditarNota.tsx` | `apps/frontend/src/components/pai/` | Formulario de edición |
| `pai-notas.ts` | `apps/worker/src/handlers/` | Handlers de API backend |
| `pai.ts` | `apps/frontend/src/types/` | Tipos TypeScript |

### 11.4. Migraciones de Base de Datos

| Migración | Ruta | Propósito |
|-----------|------|-----------|
| `004-pai-mvp.sql` | `migrations/` | Crea tabla PAI_NOT_notas |
| `005-pai-mvp-datos-iniciales.sql` | `migrations/` | Inserta tipos de nota |
| `010-pai-notas-estado-val-id-nullable.sql` | `migrations/` | Hace nullable NOT_estado_val_id |

---

## 12. Glosario

| Término | Definición |
|---------|------------|
| **Nota PAI** | Observación o comentario asociado a un proyecto de análisis inmobiliario |
| **Asunto** | Título o encabezado de la nota (1-200 caracteres) |
| **Editabilidad** | Capacidad de modificar o eliminar una nota existente |
| **Pipeline Events** | Sistema de auditoría que registra todos los eventos de un proyecto |
| **Tipo de Nota** | Clasificación de la nota (Comentario, Valoración, Decisión, Corrección IA) |
| **Estado del Proyecto** | Estado actual del proyecto que determina permisos de notas |
| **estado_proyecto_creacion** | VAL_nombre del estado del proyecto cuando se creó la nota (clave para editabilidad) |
| **VAL_nombre** | Nombre legible del valor en PAI_VAL_valores (ej: "creado", "analisis_finalizado") |
| **VAL_id** | ID numérico del valor en PAI_VAL_valores (NO usar para editabilidad) |

---

**Documento generado:** 2026-03-29  
**Última corrección:** 2026-03-29 (P03: Agregado campo asunto, estado_proyecto_creacion como VAL_nombre)  
**Fuentes:** Fase02 y Fase03 de `_doc-desarrollo/Legado-archivo/proyecto-PIA/MapaRuta/`  
**Propósito:** Referencia única para implementación del sistema de notas PAI

**Cambios Clave (P03):**
1. ✅ Agregado campo `asunto` a todos los formularios y responses
2. ✅ Agregado `estado_proyecto_creacion` como `VAL_nombre` (NO VAL_id)
3. ✅ Actualizada regla de editabilidad: cambio de estado previene edición/eliminación
4. ✅ Actualizadas estructuras visuales con asunto y estado de creación
5. ✅ Actualizados ejemplos de código backend y frontend
