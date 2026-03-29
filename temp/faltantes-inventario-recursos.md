# Lista de Faltantes para Inventario de Recursos - FASE 4

> **Fecha:** 28 de marzo de 2026  
> **Generado por:** Agente Qwen Code (usando `.agents/inventariador.md` como referencia)  
> **Propósito:** Lista de recursos, archivos y configuraciones que faltan añadir, corregir o actualizar en `.governance/inventario_recursos.md`  
> **Nota:** Este documento NO actualiza el inventario, solo lista lo que necesita actualización

---

## Índice de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Metodología de Análisis](#metodología-de-análisis)
3. [Archivos Nuevos No Documentados](#archivos-nuevos-no-documentados)
4. [Recursos Cloudflare Faltantes](#recursos-cloudflare-faltantes)
5. [Bindings y Configuración](#bindings-y-configuración)
6. [Endpoints de API](#endpoints-de-api)
7. [Variables de Entorno](#variables-de-entorno)
8. [Documentación Técnica](#documentación-técnica)
9. [Historial de Cambios](#historial-de-cambios)
10. [Priorización de Actualizaciones](#priorización-de-actualizaciones)

---

## 1. Resumen Ejecutivo

**Estado del Inventario:** Versión 11.0 (desactualizada respecto al estado real del repositorio)

**Hallazgos principales:**
- ✅ Recursos Cloudflare principales están documentados (Worker, D1, R2, KV)
- ⚠️ Nuevos archivos de librería no están referenciados
- ⚠️ Endpoints de API no están completamente documentados
- ⚠️ Documentación técnica nueva no está indexada
- ⚠️ Historial de cambios necesita actualización con últimos deploys

**Total de ítems pendientes:** 15+ actualizaciones necesarias

---

## 2. Metodología de Análisis

**Fuentes consultadas:**
1. `.governance/inventario_recursos.md` (versión 11.0)
2. `.agents/inventariador.md` (reglas de gestión)
3. Últimos 3 commits del repositorio
4. Archivos creados/modificados en la conversación actual
5. Estructura real del repositorio

**Criterios de verificación:**
- ✅ Verificado: Existe en repositorio Y está documentado
- ⚠️ Pendiente: Existe en repositorio PERO NO está documentado
- ❌ Incorrecto: Documentado PERO NO coincide con realidad

---

## 3. Archivos Nuevos No Documentados

### 3.1. Librerías y Servicios (Backend)

| Archivo | Ruta | Propósito | Estado en Inventario |
|---------|------|-----------|---------------------|
| `openai-client.ts` | `apps/worker/src/lib/` | Cliente OpenAI Responses API | ⚠️ No documentado |
| `ia-creacion-proyectos.ts` | `apps/worker/src/services/` | Servicio de creación con IA | ⚠️ No documentado |
| `tracking.ts` | `apps/worker/src/lib/` | Sistema de tracking y logs | ⚠️ No documentado |

**Acción requerida:** Añadir sección "Archivos de Integración IA" en Sección 11 (Archivos de Configuración)

### 3.2. Documentación Técnica

| Archivo | Ruta | Propósito | Estado en Inventario |
|---------|------|-----------|---------------------|
| `integracion-openai-api.md` | `plans/proyecto-PIA/doc-base/` | Documentación de integración OpenAI | ⚠️ No documentado |
| `tracking-workflow.md` | `plans/proyecto-PIA/doc-base/` | Documentación del sistema de tracking | ⚠️ No documentado |

**Acción requerida:** Añadir sección "Documentación Técnica FASE 4" en Sección 11

### 3.3. Prompts de IA

| Archivo | Ruta | Propósito | Estado en Inventario |
|---------|------|-----------|---------------------|
| `00_CrearProyecto.json` | `_doc-desarrollo/fase01/` (R2: `prompts-ia/`) | Prompt template para creación de proyectos | ⚠️ Parcial (solo mencionado en notas) |

**Acción requerida:** Documentar explícitamente en Sección 4.4 (R2 Buckets) con estructura de carpetas

---

## 4. Recursos Cloudflare Faltantes

### 4.1. KV Namespace

| Recurso | Estado Real | Estado en Inventario | Discrepancia |
|---------|-------------|---------------------|--------------|
| `secretos-cbconsulting` | ✅ Existe (ID: `50eb21ab606d4fd5a409e532347cf686`) | ✅ Documentado | ✅ Sin discrepancias |

**Verificación:** El KV namespace está correctamente documentado con ID y binding.

### 4.2. R2 Bucket - Estructura de Carpetas

| Elemento | Estado Real | Estado en Inventario | Discrepancia |
|----------|-------------|---------------------|--------------|
| `prompts-ia/00_CrearProyecto.json` | ✅ Existe en R2 | ⚠️ Mencionado pero no detallado | ⚠️ Falta detallar estructura |

**Acción requerida:** Detallar estructura completa de carpetas en Sección 4.4:
```
r2-cbconsulting/
├── analisis-inmuebles/{CII}/
│   ├── {CII}.json (IJSON original)
│   ├── {CII}_*.md (Artefactos Markdown)
│   └── {CII}_log.json (Tracking log)
└── prompts-ia/
    └── 00_CrearProyecto.json (Prompt template)
```

---

## 5. Bindings y Configuración

### 5.1. Worker Bindings

| Binding | Tipo | Estado Real | Estado en Inventario | Discrepancia |
|---------|------|-------------|---------------------|--------------|
| `db_binding_01` | D1 | ✅ Configurado | ✅ Documentado | ✅ Sin discrepancias |
| `r2_binding_01` | R2 | ✅ Configurado | ✅ Documentado | ✅ Sin discrepancias |
| `secrets_kv` | KV | ✅ Configurado | ✅ Documentado | ✅ Sin discrepancias |

**Verificación:** Todos los bindings están correctamente documentados.

### 5.2. wrangler.toml

| Sección | Estado Real | Estado en Inventario | Discrepancia |
|---------|-------------|---------------------|--------------|
| `[[kv_namespaces]]` | ✅ `binding = "secrets_kv"`, `id = "50eb21ab..."` | ✅ Documentado | ✅ Sin discrepancias |

---

## 6. Endpoints de API

### 6.1. Endpoints PAI Existentes

| Endpoint | Método | Implementado | Documentado en Inventario | Estado |
|----------|--------|--------------|--------------------------|--------|
| `/api/pai/proyectos` | POST | ✅ Sí | ⚠️ Parcial | ⚠️ Falta detallar request/response |
| `/api/pai/proyectos` | GET | ✅ Sí | ⚠️ Parcial | ⚠️ Falta detallar query params |
| `/api/pai/proyectos/:id` | GET | ✅ Sí | ❌ No | ❌ No documentado |
| `/api/pai/proyectos/:id/analisis` | POST | ✅ Sí | ❌ No | ❌ No documentado |
| `/api/pai/proyectos/:id/artefactos` | GET | ✅ Sí | ❌ No | ❌ No documentado |
| `/api/pai/proyectos/:id/estado` | PUT | ✅ Sí | ❌ No | ❌ No documentado |
| `/api/pai/proyectos/:id` | DELETE | ✅ Sí | ❌ No | ❌ No documentado |
| `/api/pai/proyectos/:id/pipeline` | GET | ✅ Sí | ❌ No | ❌ No documentado |
| `/api/pai/proyectos/:id/notas` | POST | ✅ Sí | ❌ No | ❌ No documentado |
| `/api/pai/proyectos/:id/notas/:notaId` | PUT | ✅ Sí | ❌ No | ❌ No documentado |

**Acción requerida:** Actualizar Sección 8 (Contratos entre Servicios) con todos los endpoints

### 6.2. Esquemas de Request/Response

| Endpoint | Request Schema | Response Schema | Estado |
|----------|---------------|-----------------|--------|
| `POST /api/pai/proyectos` | `{ ijson: string }` | `{ proyecto: {...}, tracking_id: string, log_url: string }` | ⚠️ No documentado |
| `GET /api/pai/proyectos/:id` | - | `{ proyecto: {...}, artefactos: [...], notas: [...] }` | ⚠️ No documentado |

**Acción requerida:** Añadir tabla de esquemas en Sección 8

---

## 7. Variables de Entorno

### 7.1. Backend (`.dev.vars`)

| Variable | Uso | Sensible | Estado Real | Estado en Inventario | Discrepancia |
|----------|-----|----------|-------------|---------------------|--------------|
| `OPENAI_API_KEY` | API Key para OpenAI | Sí | ✅ En KV `secretos-cbconsulting` | ✅ Documentado | ✅ Sin discrepancias |

### 7.2. Frontend (`.env`)

| Variable | Uso | Sensible | Estado Real | Estado en Inventario | Discrepancia |
|----------|-----|----------|-------------|---------------------|--------------|
| `VITE_API_BASE_URL` | URL base del backend | No | ✅ `https://wk-backend-dev.cbconsulting.workers.dev` | ✅ Documentado | ✅ Sin discrepancias |
| `VITE_ENVIRONMENT` | Entorno de ejecución | No | ✅ `production` | ✅ Documentado | ✅ Sin discrepancias |
| `VITE_USE_DYNAMIC_MENU` | Activar menú dinámico | No | ✅ `true` | ⚠️ No documentado | ⚠️ Falta añadir |

**Acción requerida:** Añadir `VITE_USE_DYNAMIC_MENU` en Sección 3.2

---

## 8. Documentación Técnica

### 8.1. Documentación Existente No Indexada

| Documento | Ruta | Propósito | Referenciado en Inventario |
|-----------|------|-----------|---------------------------|
| `integracion-openai-api.md` | `plans/proyecto-PIA/doc-base/` | Integración con OpenAI | ❌ No |
| `tracking-workflow.md` | `plans/proyecto-PIA/doc-base/` | Sistema de tracking | ❌ No |
| `00_CrearProyecto.json` | `_doc-desarrollo/fase01/` | Prompt template | ⚠️ Mencionado |
| `cf-funcion-open-ai-api.md` | `_doc-desarrollo/fase01/` | Función OpenAI en CF | ❌ No |
| `02-especificacion-tecnica-workflow-alta-pai.md` | `_doc-desarrollo/fase01/` | Especificación workflow | ❌ No |

**Acción requerida:** Añadir sección "Documentación Técnica FASE 4" en Sección 11

### 8.2. Reportes de Implementación

| Documento | Ruta | Propósito | Referenciado en Inventario |
|-----------|------|-----------|---------------------------|
| `reporte-implementacion-openai-fase4.md` | `plans/proyecto-PIA/comunicacion/` | Implementación OpenAI | ❌ No |
| `reporte-tracking-fase4.md` | `plans/proyecto-PIA/comunicacion/` | Implementación tracking | ❌ No |
| `reporte-ejecucion-p0-fase4.md` | `plans/proyecto-PIA/comunicacion/` | Correcciones P0 | ❌ No |
| `reporte-despliegue-openai-fase4.md` | `plans/proyecto-PIA/comunicacion/` | Despliegue OpenAI | ❌ No |

**Acción requerida:** Añadir sección "Reportes de Implementación" en Sección 11

---

## 9. Historial de Cambios

### 9.1. Cambios Recientes No Registrados

| Fecha | Cambio | Responsable | Estado en Inventario |
|-------|--------|-------------|---------------------|
| 2026-03-28 | Integración OpenAI DESPLEGADA (v13.0) | inventariador | ⚠️ Parcial (solo v12.0 registrada) |
| 2026-03-28 | Sistema de tracking implementado | inventariador | ❌ No registrado |
| 2026-03-28 | Documentación OpenAI creada | inventariador | ❌ No registrado |
| 2026-03-28 | Documentación tracking creada | inventariador | ❌ No registrado |

**Acción requerida:** Actualizar Sección 13 (Historial de Cambios) con:
```markdown
| 2026-03-28 | Actualización v13.0 - Integración OpenAI DESPLEGADA: KV ID confirmado, worker deployado con IA, prompt en R2 operativo | inventariador | Pendiente |
| 2026-03-28 | Actualización v14.0 - Sistema de tracking implementado: tracking.ts, log.json en R2, wrangler tail operativo | inventariador | Pendiente |
| 2026-03-28 | Actualización v15.0 - Documentación técnica creada: integracion-openai-api.md, tracking-workflow.md | inventariador | Pendiente |
```

---

## 10. Priorización de Actualizaciones

### Prioridad P0 - Crítico

| Ítem | Razón | Impacto |
|------|-------|---------|
| Endpoints de API no documentados | Esenciales para integración frontend-backend | Alto |
| Historial de cambios desactualizado | No hay trazabilidad de últimos cambios | Alto |

### Prioridad P1 - Importante

| Ítem | Razón | Impacto |
|------|-------|---------|
| Archivos de librería (openai-client.ts, tracking.ts) | Necesarios para mantenimiento | Medio |
| Variables de entorno faltantes (`VITE_USE_DYNAMIC_MENU`) | Configuración crítica | Medio |

### Prioridad P2 - Mejora

| Ítem | Razón | Impacto |
|------|-------|---------|
| Documentación técnica indexada | Facilita onboarding | Bajo |
| Reportes de implementación referenciados | Trazabilidad histórica | Bajo |
| Estructura de carpetas R2 detallada | Claridad operativa | Bajo |

---

## Resumen de Acciones Requeridas

| Sección | Acción | Prioridad |
|---------|--------|-----------|
| **Sección 4.4** | Detallar estructura de carpetas en R2 | P2 |
| **Sección 8** | Documentar todos los endpoints PAI con esquemas | P0 |
| **Sección 11** | Añadir archivos de librería (openai-client.ts, tracking.ts, ia-creacion-proyectos.ts) | P1 |
| **Sección 11** | Añadir documentación técnica (integracion-openai-api.md, tracking-workflow.md) | P2 |
| **Sección 11** | Añadir reportes de implementación | P2 |
| **Sección 3.2** | Añadir `VITE_USE_DYNAMIC_MENU` | P1 |
| **Sección 13** | Actualizar historial con v13.0, v14.0, v15.0 | P0 |

---

## Verificación Final

**Antes de actualizar el inventario, verificar:**

- [ ] Todos los archivos listados existen en el repositorio
- [ ] Todos los recursos Cloudflare existen y son accesibles
- [ ] Los IDs de recursos (KV, D1, R2) coinciden con la realidad
- [ ] Los endpoints documentados responden correctamente
- [ ] Las variables de entorno están configuradas correctamente

---

## Notas para el Inventariador

**Importante:**
1. Este documento NO actualiza el inventario, solo lista lo que necesita actualización
2. El inventariador debe verificar cada ítem antes de actualizar `.governance/inventario_recursos.md`
3. Los cambios críticos (recursos Cloudflare) requieren aprobación del usuario
4. La documentación técnica puede actualizarse sin aprobación explícita

**Proceso recomendado:**
1. Revisar esta lista
2. Verificar cada ítem contra el repositorio real
3. Actualizar `.governance/inventario_recursos.md` sección por sección
4. Registrar cada actualización en el historial de cambios
5. Solicitar aprobación para cambios de recursos Cloudflare

---

**Fin del Documento**
