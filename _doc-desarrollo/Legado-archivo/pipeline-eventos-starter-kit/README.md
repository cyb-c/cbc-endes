# Starter Kit: Sistema de Auditoría de Eventos para Cloudflare D1

**Versión:** 1.0  
**Fecha:** 27 de marzo de 2026  
**Propósito:** Sistema de auditoría/tracking de eventos reutilizable para proyectos en Cloudflare D1

---

## Resumen Ejecutivo

Este Starter Kit proporciona un sistema de auditoría de eventos (event stream) implementado en Cloudflare D1 (SQLite) que permite registrar de forma inmutable, estructurada y consultable todos los eventos significativos ocurridos durante el procesamiento en pipelines.

### Características Clave

| Característica | Implementación |
|----------------|----------------|
| **Inmutabilidad** | Tabla append-only — solo INSERT, nunca UPDATE ni DELETE |
| **Estructurada** | Campos tipados para nivel, tipo de evento, origen, duración |
| **Indexada** | 3 índices para consultas eficientes por entity_id, error, paso/nivel |
| **Centralizada** | Todas las escrituras pasan por un único módulo (`lib-pipeline-events.ts`) |
| **Genérica** | Sin acoplamientos a dominios específicos |

### Problemas que Resuelve

| Problema | Solución |
|----------|----------|
| Logs en texto plano no consultables | Eventos estructurados en campos de BD |
| Blob JSON opaco | Campos explícitos: `paso`, `nivel`, `tipo_evento`, `duracion_ms` |
| Sin trazabilidad temporal | `created_at` + `duracion_ms` para auditoría |
| Múltiples fuentes de verdad | Única tabla centralizada para todos los eventos |
| Acoplamiento con dominio | Schema genérico reusable |

### Casos de Uso Típicos

1. **Auditoría de pipeline** — Trazar cada paso del procesamiento
2. **Debug de errores** — Consultar eventos con `nivel='ERROR'` por código de error
3. **Monitorización** — Obtener último evento por proceso para dashboard
4. **Cronología** — Mostrar línea temporal completa de eventos de un proceso
5. **Métricas** — Calcular duración promedio de pasos, tasa de errores por tipo

### Lo que NO es

| No es... | Porque... |
|----------|-----------|
| Un log de aplicación tradicional | No usa formato texto, está estructurada en BD |
| Un sistema de métricas | No está optimizada para agregaciones masivas |
| Un event store completo | No tiene versionado de eventos ni proyecciones |
| Una tabla de estado | El estado debe mantenerse en otra tabla específica del dominio |

---

## Estructura del Starter Kit

```
plans/pipeline-eventos-starter-kit/
├── README.md                          # Este archivo
├── 01-guia-implementacion.md          # Guía paso a paso para incorporar a un proyecto
├── 02-schema-sql.sql                  # Schema SQL genérico
├── 03-types.ts                        # Tipos TypeScript
├── 04-lib-pipeline-events.ts          # Librería de funciones (escritura y lectura)
└── 05-migracion.sql                   # Script de migración desde schema acoplado
```

---

## Requisitos Previos

- Cloudflare D1 (SQLite)
- TypeScript 5.x
- Cloudflare Workers o Workers Pages

---

## Uso Rápido

```typescript
import { insertPipelineEvent, getEntityEvents } from './lib-pipeline-events'

// Registrar un evento de éxito
await insertPipelineEvent(db, {
  entityId: 'process-uuid-123',
  paso: 'PROCESS_DATA',
  nivel: 'INFO',
  tipoEvento: 'STEP_SUCCESS',
  detalle: { records: 150, duration: '2.5s' },
  duracionMs: 2500,
})

// Obtener cronología de eventos
const eventos = await getEntityEvents(db, 'process-uuid-123', {
  order: 'DESC',
  limit: 100,
})
```

---

## Próximos Pasos

1. Lea [`01-guia-implementacion.md`](01-guia-implementacion.md) para incorporar este sistema a su proyecto
2. Revise [`02-schema-sql.sql`](02-schema-sql.sql) para entender el schema de base de datos
3. Copie [`03-types.ts`](03-types.ts) y [`04-lib-pipeline-events.ts`](04-lib-pipeline-events.ts) a su proyecto
4. Si migra desde un schema acoplado, use [`05-migracion.sql`](05-migracion.sql)

---

## Convenciones

### Nombres de Campos

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `entity_id` | Clave de correlación del proceso | `"process-uuid-123"` |
| `entity_ref` | Referencia opcional a entidad principal | `123` |
| `paso` | Nombre del paso/proceso | `"PROCESS_DATA"` |
| `nivel` | Severidad del evento | `"INFO"`, `"ERROR"`, `"WARN"`, `"DEBUG"` |
| `tipo_evento` | Tipo semántico del evento | `"STEP_SUCCESS"`, `"STEP_FAILED"` |

### Niveles de Evento

| Nivel | Uso |
|-------|-----|
| `DEBUG` | Información detallada para desarrollo |
| `INFO` | Eventos de éxito normales |
| `WARN` | Errores no terminales o situaciones anómalas |
| `ERROR` | Errores terminales |

### Tipos de Evento (Sugeridos)

| Tipo | Uso |
|------|-----|
| `PROCESS_START` | Inicio del proceso |
| `PROCESS_COMPLETE` | Proceso completado exitosamente |
| `PROCESS_FAILED` | Proceso falló |
| `STEP_SUCCESS` | Paso completado exitosamente |
| `STEP_FAILED` | Paso falló (con reintento o terminal) |
| `STEP_ERROR` | Error de negocio detectado |

---

## Consideraciones de Escalabilidad

- **Volumen estimado:** ~1000 eventos/día (ajustar según su caso)
- **Crecimiento mensual:** ~30,000 eventos/mes
- **Política de retención:** Se recomienda archivar eventos > 90 días
- **Particionamiento:** Considerar particionamiento por fecha si el volumen supera 1M eventos

---

## Licencia

Este Starter Kit se proporciona tal cual para su uso en proyectos de Cloudflare D1.

---

**Fin del README**
