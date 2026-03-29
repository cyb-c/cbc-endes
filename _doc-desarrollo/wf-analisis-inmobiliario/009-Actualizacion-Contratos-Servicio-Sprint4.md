# Actualización de Contratos de Servicio - Sprint 4

## Índice de Contenido

1. [Objetivo](#1-objetivo)
2. [Endpoints Actualizados](#2-endpoints-actualizados)
3. [Contratos Frontend-Backend](#3-contratos-frontend-backend)
4. [Estructura de Datos](#4-estructura-de-datos)
5. [Códigos de Error](#5-códigos-de-error)
6. [Referencias](#6-referencias)

---

## 1. Objetivo

Documentar los contratos de servicio actualizados tras la implementación completa del Workflow de Análisis Inmobiliario con IA Real (Sprints 2-3).

---

## 2. Endpoints Actualizados

### 2.1. POST /api/pai/proyectos/:id/analisis

**Descripción:** Ejecuta análisis completo con IA real de 7 pasos

**Request:**
```http
POST /api/pai/proyectos/:id/analisis
Content-Type: application/json

{
  "forzar_reejecucion": true  // Opcional, default: false
}
```

**Response (200 - Éxito):**
```json
{
  "proyecto": {
    "id": 7,
    "cii": "26030007",
    "estado_id": 4,
    "estado": "análisis finalizado",
    "fecha_ultima_actualizacion": "2026-03-29T19:20:56.172Z"
  },
  "artefactos_generados": [
    {
      "id": 1,
      "tipo": "analisis-fisico",
      "ruta_r2": "analisis-inmuebles/26030007/26030007_01_activo_fisico.md",
      "fecha_generacion": "2026-03-29T19:20:56.172Z"
    }
    // ... 6 artefactos más
  ]
}
```

**Response (403 - Estado inválido):**
```json
{
  "error": "El estado actual no permite ejecutar análisis. Estados permitidos: CREADO (1), PROCESANDO_ANALISIS (2), ANALISIS_CON_ERROR (3), ANALISIS_FINALIZADO (4).",
  "estado_id": 5
}
```

**Response (500 - Error en análisis):**
```json
{
  "error": "Error en paso 3 (Activo Financiero): La IA no generó contenido válido"
}
```

---

## 3. Contratos Frontend-Backend

### 3.1. Hook useEjecutarAnalisis

```typescript
// Frontend: apps/frontend/src/hooks/use-pai.ts
function useEjecutarAnalisis() {
  return {
    ejecutarAnalisis: async (
      id: number,
      options?: { forzar_reejecucion?: boolean }
    ) => Promise<{
      proyecto: { id, cii, estado_id, estado, fecha_ultima_actualizacion };
      artefactos_generados: Array<{ id, tipo, ruta_r2, fecha_generacion }>;
    } | null>,
    loading: boolean,
    error: string | null
  };
}
```

### 3.2. API Client

```typescript
// Frontend: apps/frontend/src/lib/pai-api.ts
async ejecutarAnalisis(
  id: number,
  options?: { forzar_reejecucion?: boolean }
): Promise<ApiResponse<EjecutarAnalisisResponse>>
```

### 3.3. Componente BotonEjecutarAnalisis

```typescript
// Frontend: apps/frontend/src/components/pai/BotonEjecutarAnalisis.tsx
interface BotonEjecutarAnalisisProps {
  proyectoId: number;
  estadoId: number;  // 1-8 según PAI_VAL_valores
  onEjecutar: (proyectoId: number) => Promise<void>;
  onSuccess: () => void;
  onError: (error: string) => void;
}
```

---

## 4. Estructura de Datos

### 4.1. Estados Válidos para Análisis

| VAL_id | VAL_codigo | ¿Permite Análisis? |
|--------|------------|-------------------|
| 1 | `CREADO` | ✅ Sí |
| 2 | `PROCESANDO_ANALISIS` | ✅ Sí (reintentar) |
| 3 | `ANALISIS_CON_ERROR` | ✅ Sí (reintentar) |
| 4 | `ANALISIS_FINALIZADO` | ✅ Sí (re-ejecutar) |
| 5+ | `EVALUANDO_*` o superior | ❌ No |

### 4.2. Artefactos Generados

| Paso | Nombre | Archivo R2 | Tipo |
|------|--------|------------|------|
| 1 | Activo Físico | `{CII}_01_activo_fisico.md` | ANALISIS_FISICO |
| 2 | Activo Estratégico | `{CII}_02_activo_estrategico.md` | ANALISIS_ESTRATEGICO |
| 3 | Activo Financiero | `{CII}_03_activo_financiero.md` | ANALISIS_FINANCIERO |
| 4 | Activo Regulado | `{CII}_04_activo_regulado.md` | ANALISIS_REGULATORIO |
| 5 | Inversor | `{CII}_05_inversor.md` | LECTURA_INVERSOR |
| 6 | Emprendedor Operador | `{CII}_06_emprendedor_operador.md` | LECTURA_OPERADOR |
| 7 | Propietario | `{CII}_07_propietario.md` | LECTURA_PROPIETARIO |

---

## 5. Códigos de Error

| Código | HTTP | Descripción |
|--------|------|-------------|
| `INVALID_PROJECT_ID` | 400 | ID de proyecto inválido |
| `PROJECT_NOT_FOUND` | 404 | Proyecto no existe |
| `INVALID_STATE` | 403 | Estado no permite análisis |
| `IJSON_NOT_FOUND` | 404 | IJSON no encontrado en R2 |
| `PROMPT_NOT_FOUND` | 500 | Prompt no encontrado en R2 |
| `OPENAI_ERROR` | 500 | Error en llamada a OpenAI |
| `EMPTY_RESPONSE` | 500 | IA no generó contenido |
| `DEPENDENCIAS_INCOMPLETAS` | 500 | Faltan análisis base (1-4) |
| `R2_WRITE_ERROR` | 500 | Error escribiendo en R2 |
| `DB_INSERT_ERROR` | 500 | Error insertando en BD |

---

## 6. Referencias

### 6.1. Documentos Relacionados

| Documento | Ruta |
|-----------|------|
| **Concept Brief** | `_doc-desarrollo/wf-analisis-inmobiliario/002-Concept-Brief-Workflow-Analisis-Inmobiliario-v2.md` |
| **Especificación Técnica** | `_doc-desarrollo/wf-analisis-inmobiliario/004-Especificacion-Tecnica-Workflow-Analisis.md` |
| **Integración Frontend** | `_doc-desarrollo/wf-analisis-inmobiliario/005-Especificacion-Integracion-Frontend.md` |

### 6.2. Archivos Implementados

| Archivo | Ruta |
|---------|------|
| **Backend Service** | `apps/worker/src/services/ia-analisis-proyectos.ts` |
| **Backend Handler** | `apps/worker/src/handlers/pai-proyectos.ts` |
| **Frontend Component** | `apps/frontend/src/components/pai/BotonEjecutarAnalisis.tsx` |
| **Frontend Hook** | `apps/frontend/src/hooks/use-pai.ts` |
| **API Client** | `apps/frontend/src/lib/pai-api.ts` |

---

**Documento generado:** 2026-03-29  
**Sprint:** Sprint 4 - Integración, Pruebas y Despliegue  
**Estado:** Completado
