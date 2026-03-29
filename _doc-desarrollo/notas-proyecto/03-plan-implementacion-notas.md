# Plan de Implementación: Sistema de Notas PAI

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Objetivos del Plan](#2-objetivos-del-plan)
3. [Alcance del Proyecto](#3-alcance-del-proyecto)
4. [Roadmap por Sprints](#4-roadmap-por-sprints)
5. [Documentación Requerida](#5-documentación-requerida)
6. [Criterios de Aceptación](#6-criterios-de-aceptación)
7. [Riesgos y Mitigación](#7-riesgos-y-mitigación)
8. [Recursos Necesarios](#8-recursos-necesarios)
9. [Definición de Done](#9-definición-de-done)

---

## 1. Resumen Ejecutivo

**Proyecto:** Implementación Completa del Sistema de Notas PAI

**Duración Estimada:** 3 Sprints (9 días laborables)

**Estado Actual:** 60% implementado (según diagnóstico P04)

**Objetivo:** Alcanzar 100% de cumplimiento de la especificación `01-notas-proyectos-pai-extraccion-completa.md`

**Enfoque:** Desarrollo iterativo con ciclos de desarrollo → despliegue → pruebas por sprint

---

## 2. Objetivos del Plan

### 2.1. Objetivo Principal

Completar la implementación del sistema de notas PAI según la especificación documentada, garantizando:

- ✅ Todos los campos requeridos implementados (`asunto`, `estado_proyecto_creacion`)
- ✅ Reglas de editabilidad funcionando correctamente
- ✅ Validaciones completas en frontend y backend
- ✅ Trazabilidad completa con Pipeline Events
- ✅ UX completa y consistente

### 2.2. Objetivos por Sprint

| Sprint | Duración | Objetivo Principal | % Completitud Final |
|--------|----------|-------------------|---------------------|
| **Sprint 1** | 3 días | Corregir campos críticos y tipos | 80% |
| **Sprint 2** | 3 días | Completar validaciones y UX | 95% |
| **Sprint 3** | 3 días | Testing, ajustes y documentación | 100% |

---

## 3. Alcance del Proyecto

### 3.1. Incluye (In-Scope)

| Categoría | Elementos |
|-----------|-----------|
| **Backend** | Handlers de crear, editar, eliminar notas con validaciones completas |
| **Frontend** | Componentes ListaNotas, FormularioNota, FormularioEditarNota |
| **Tipos** | Interfaces TypeScript completas (Nota, CrearNotaRequest, etc.) |
| **Base de Datos** | Migraciones (si necesarias), verificación de schema |
| **Pipeline Events** | Eventos completos con detalles de estado |
| **Documentación** | Actualización de especificaciones, guía de usuario |
| **Testing** | Pruebas manuales, validación de flujos críticos |

### 3.2. No Incluye (Out-of-Scope)

| Elemento | Justificación |
|----------|---------------|
| Autenticación de usuarios | Fuera del alcance de notas |
| Permisos por rol | Todos los usuarios pueden crear notas actualmente |
| Notificaciones push | Feature futura |
| Búsqueda/filtrado de notas | Feature futura |
| Exportación de notas | Feature futura |

---

## 4. Roadmap por Sprints

### Sprint 1: Correcciones Críticas

**Duración:** 3 días  
**Objetivo:** Implementar campos faltantes críticos (`asunto`, `estado_proyecto_creacion`)

#### Día 1: Tipos y Backend

| Hora | Actividad | Archivos | Entregable |
|------|-----------|----------|------------|
| 09:00-10:30 | Actualizar interface `Nota` | `types/pai.ts` | Tipos completos |
| 10:30-12:00 | Backend: Obtener estado del proyecto | `pai-notas.ts` | Función auxiliar |
| 13:00-14:30 | Backend: Guardar `estado_proyecto_creacion` | `pai-notas.ts` | Insert actualizado |
| 14:30-16:00 | Backend: Response con campos completos | `pai-notas.ts` | Response actualizado |
| 16:00-17:00 | Testing local backend | Postman/cURL | Tests passing |

**Criterio de Éxito Día 1:**
- ✅ Interface `Nota` incluye todos los campos
- ✅ Backend guarda `estado_proyecto_creacion` como `VAL_nombre`
- ✅ Response incluye `asunto` y `estado_proyecto_creacion`

---

#### Día 2: Frontend Componentes

| Hora | Actividad | Archivos | Entregable |
|------|-----------|----------|------------|
| 09:00-10:30 | Agregar campo `asunto` en FormularioNota | `FormularioNota.tsx` | Campo funcional |
| 10:30-12:00 | Validaciones de `asunto` | `FormularioNota.tsx` | Validaciones |
| 13:00-14:30 | Mostrar asunto en ListaNotas | `ListaNotas.tsx` | Visualización |
| 14:30-16:00 | Mostrar estado_creacion en ListaNotas | `ListaNotas.tsx` | Visualización |
| 16:00-17:00 | Testing local frontend | Navegador | UI funcional |

**Criterio de Éxito Día 2:**
- ✅ Formulario tiene 4 campos (tipo, autor, asunto, contenido)
- ✅ Lista muestra asunto como título
- ✅ Lista muestra "Estado al crear: {estado}"

---

#### Día 3: Despliegue y Pruebas Sprint 1

| Hora | Actividad | Archivos | Entregable |
|------|-----------|----------|------------|
| 09:00-10:30 | Build y deploy backend | `pai-notas.ts` | Deploy exitoso |
| 10:30-12:00 | Build y deploy frontend | Componentes | Deploy exitoso |
| 13:00-15:00 | Pruebas E2E flujo crear nota | Navegador + DevTools | Tests passing |
| 15:00-16:00 | Verificar DB (estado guardado) | D1 Console | Datos correctos |
| 16:00-17:00 | Bug fixing | Varios | Bugs críticos resueltos |

**Criterio de Éxito Sprint 1:**
- ✅ Deploy en producción completado
- ✅ Crear nota funciona con todos los campos
- ✅ Estado del proyecto se guarda correctamente
- ✅ Lista muestra asunto y estado de creación

---

### Sprint 2: Validaciones y UX

**Duración:** 3 días  
**Objetivo:** Completar validaciones y mejorar UX

#### Día 4: Validación de Eliminación

| Hora | Actividad | Archivos | Entregable |
|------|-----------|----------|------------|
| 09:00-10:30 | Backend: Validar eliminación | `pai-notas.ts` | Validación |
| 10:30-12:00 | Backend: Retornar 403 si no editable | `pai-notas.ts` | Error handling |
| 13:00-14:30 | Frontend: Manejar error 403 | `ListaNotas.tsx` | UX mejorada |
| 14:30-16:00 | Testing validación eliminación | Postman + Navegador | Tests passing |
| 16:00-17:00 | Documentar validaciones | Archivo de validaciones | Doc actualizada |

**Criterio de Éxito Día 4:**
- ✅ Eliminación valida cambios de estado
- ✅ Retorna 403 con mensaje claro
- ✅ Frontend muestra error apropiadamente

---

#### Día 5: Pipeline Events Completos

| Hora | Actividad | Archivos | Entregable |
|------|-----------|----------|------------|
| 09:00-10:30 | Agregar evento PROCESS_COMPLETE (crear) | `pai-notas.ts` | Evento completo |
| 10:30-12:00 | Agregar evento PROCESS_COMPLETE (editar) | `pai-notas.ts` | Evento completo |
| 13:00-14:30 | Incluir estado en detalle de eventos | `pai-notas.ts` | Detalles completos |
| 14:30-16:00 | Verificar eventos en DB | D1 Console | Eventos correctos |
| 16:00-17:00 | Testing de eventos | D1 Console + Logs | Tests passing |

**Criterio de Éxito Día 5:**
- ✅ Todos los eventos PROCESS_COMPLETE existen
- ✅ Detalles incluyen `estado_proyecto_creacion`
- ✅ Trazabilidad completa en pipeline_eventos

---

#### Día 6: Mejoras de UX y Despliegue

| Hora | Actividad | Archivos | Entregable |
|------|-----------|----------|------------|
| 09:00-10:30 | Advertencia en FormularioEditarNota | `FormularioEditarNota.tsx` | UX mejorada |
| 10:30-12:00 | Validación de longitud de campos | `FormularioNota.tsx` | Validaciones |
| 13:00-14:30 | Build y deploy Sprint 2 | Todos | Deploy exitoso |
| 14:30-16:00 | Pruebas E2E completas | Navegador + DevTools | Tests passing |
| 16:00-17:00 | Bug fixing | Varios | Bugs resueltos |

**Criterio de Éxito Sprint 2:**
- ✅ Eliminación valida editabilidad
- ✅ Pipeline events completos
- ✅ UX mejorada con advertencias
- ✅ Deploy en producción completado

---

### Sprint 3: Testing y Documentación

**Duración:** 3 días  
**Objetivo:** Testing exhaustivo y documentación final

#### Día 7: Testing Exhaustivo

| Hora | Actividad | Archivos | Entregable |
|------|-----------|----------|------------|
| 09:00-10:30 | Test Case: Crear nota exitosa | Checklist | Test passing |
| 10:30-12:00 | Test Case: Editar nota (sin cambio estado) | Checklist | Test passing |
| 12:00-13:00 | Test Case: Editar nota (con cambio estado) | Checklist | Test passing |
| 14:00-15:30 | Test Case: Eliminar nota (sin cambio estado) | Checklist | Test passing |
| 15:30-17:00 | Test Case: Eliminar nota (con cambio estado) | Checklist | Test passing |

**Casos de Test:**

```markdown
## TC-001: Crear Nota Exitosa
- [ ] Ir a /proyectos/{id}
- [ ] Click en "Agregar Nota"
- [ ] Completar: Tipo, Autor, Asunto, Contenido
- [ ] Click en "Guardar Nota"
- [ ] Verificar: Nota aparece en lista con asunto y estado

## TC-002: Editar Nota (Sin Cambio Estado)
- [ ] Crear nota en estado "creado"
- [ ] Click en "Editar" (debe estar habilitado)
- [ ] Modificar contenido
- [ ] Click en "Guardar Cambios"
- [ ] Verificar: Nota actualizada, fecha_actualizacion cambia

## TC-003: Editar Nota (Con Cambio Estado)
- [ ] Crear nota en estado "creado"
- [ ] Cambiar estado del proyecto a "analisis_finalizado"
- [ ] Intentar editar nota
- [ ] Verificar: Botón editar deshabilitado o mensaje "No editable"

## TC-004: Eliminar Nota (Sin Cambio Estado)
- [ ] Crear nota en estado "creado"
- [ ] Click en "Eliminar"
- [ ] Confirmar eliminación
- [ ] Verificar: Nota desaparece de lista

## TC-005: Eliminar Nota (Con Cambio Estado)
- [ ] Crear nota en estado "creado"
- [ ] Cambiar estado del proyecto
- [ ] Intentar eliminar nota
- [ ] Verificar: Error 403 o mensaje "No se puede eliminar"
```

**Criterio de Éxito Día 7:**
- ✅ Todos los casos de test passing
- ✅ Bugs documentados y priorizados

---

#### Día 8: Documentación

| Hora | Actividad | Archivos | Entregable |
|------|-----------|----------|------------|
| 09:00-10:30 | Actualizar especificación técnica | `01-notas-proyectos-pai-extraccion-completa.md` | Doc actualizada |
| 10:30-12:00 | Crear guía de usuario | `guia-usuario-notas.md` | Guía creada |
| 13:00-14:30 | Documentar API endpoints | `api-notas-endpoints.md` | Doc API |
| 14:30-16:00 | Actualizar diagnóstico | `02-diagnostico-implementacion-notas.md` | Diagnóstico final |
| 16:00-17:00 | Revisión de documentación | Todos | Doc revisada |

**Documentos a Crear:**

1. **Guía de Usuario de Notas** (`guia-usuario-notas.md`)
   - Cómo crear una nota
   - Cómo editar una nota
   - Por qué una nota no es editable
   - Mejores prácticas

2. **Documentación de API** (`api-notas-endpoints.md`)
   - POST /api/pai/proyectos/:id/notas
   - PUT /api/pai/proyectos/:id/notas/:notaId
   - DELETE /api/pai/proyectos/:id/notas/:notaId
   - Ejemplos de request/response

**Criterio de Éxito Día 8:**
- ✅ Toda la documentación actualizada
- ✅ Guía de usuario clara y completa
- ✅ API documentation con ejemplos

---

#### Día 9: Cierre y Entrega

| Hora | Actividad | Archivos | Entregable |
|------|-----------|----------|------------|
| 09:00-10:30 | Último deploy de verificación | Todos | Deploy final |
| 10:30-12:00 | Pruebas de regresión | Navegador | Tests passing |
| 13:00-14:30 | Limpieza de código | Varios | Code clean |
| 14:30-16:00 | Revisión final con stakeholder | Demo | Aprobación |
| 16:00-17:00 | Cierre de sprint y retrospective | Team | Lessons learned |

**Criterio de Éxito Sprint 3:**
- ✅ Deploy final verificado
- ✅ Documentación completa
- ✅ Stakeholder approval
- ✅ Proyecto marcado como 100% completo

---

## 5. Documentación Requerida

### 5.1. Documentación Técnica

| Documento | Estado | Responsable | Fecha Límite |
|-----------|--------|-------------|--------------|
| `01-notas-proyectos-pai-extraccion-completa.md` | ✅ Existente | - | Sprint 3 Día 8 (actualizar) |
| `02-diagnostico-implementacion-notas.md` | ✅ Existente | - | Sprint 3 Día 8 (actualizar) |
| `03-plan-implementacion-notas.md` | ✅ Este documento | - | Inmediato |
| `api-notas-endpoints.md` | ❌ Por crear | Dev Team | Sprint 3 Día 8 |
| `guia-usuario-notas.md` | ❌ Por crear | Dev Team | Sprint 3 Día 8 |

### 5.2. Documentación de Testing

| Documento | Estado | Responsable | Fecha Límite |
|-----------|--------|-------------|--------------|
| `test-cases-notas.md` | ❌ Por crear | QA | Sprint 3 Día 7 |
| `test-results-sprint1.md` | ❌ Por crear | QA | Sprint 1 Día 3 |
| `test-results-sprint2.md` | ❌ Por crear | QA | Sprint 2 Día 6 |
| `test-results-sprint3.md` | ❌ Por crear | QA | Sprint 3 Día 9 |

### 5.3. Documentación de Cambios

| Documento | Estado | Responsable | Fecha Límite |
|-----------|--------|-------------|--------------|
| `CHANGELOG-notas.md` | ❌ Por crear | Dev Team | Sprint 3 Día 9 |
| `MIGRATION_GUIDE-notas.md` | ❌ Por crear | Dev Team | Sprint 3 Día 9 (si aplica) |

---

## 6. Criterios de Aceptación

### 6.1. Funcionales

| ID | Criterio | Sprint |
|----|----------|--------|
| **CF-001** | Crear nota con todos los campos (tipo, autor, asunto, contenido) | Sprint 1 |
| **CF-002** | Nota guarda `estado_proyecto_creacion` como VAL_nombre | Sprint 1 |
| **CF-003** | Lista de notas muestra asunto y estado de creación | Sprint 1 |
| **CF-004** | Editar nota solo permite modificar contenido | Sprint 2 |
| **CF-005** | Editar nota retorna 403 si estado cambió | Sprint 2 |
| **CF-006** | Eliminar nota valida cambios de estado | Sprint 2 |
| **CF-007** | Pipeline events incluyen PROCESS_COMPLETE | Sprint 2 |
| **CF-008** | Pipeline events incluyen estado en detalles | Sprint 2 |

### 6.2. No Funcionales

| ID | Criterio | Sprint |
|----|----------|--------|
| **CNF-001** | Response time < 500ms para crear nota | Sprint 3 |
| **CNF-002** | Response time < 300ms para obtener notas | Sprint 3 |
| **CNF-003** | UI responsive en desktop y mobile | Sprint 3 |
| **CNF-004** | Validaciones en frontend y backend | Sprint 2 |
| **CNF-005** | Mensajes de error claros para usuario | Sprint 2 |

### 6.3. Documentación

| ID | Criterio | Sprint |
|----|----------|--------|
| **CD-001** | Especificación técnica actualizada | Sprint 3 |
| **CD-002** | Guía de usuario creada | Sprint 3 |
| **CD-003** | API documentation completa | Sprint 3 |
| **CD-004** | Test cases documentados | Sprint 3 |

---

## 7. Riesgos y Mitigación

### 7.1. Riesgos Técnicos

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| **R1:** Migración de DB requerida | ALTO | MEDIA | Verificar schema en Sprint 1 Día 1, crear migración si needed |
| **R2:** API de OpenAI no disponible | BAJO | BAJA | No afecta notas, es feature separada |
| **R3:** Pipeline events no funcionan | MEDIO | BAJA | Testing exhaustivo en Sprint 2 Día 5 |
| **R4:** Cambios de estado no se registran | ALTO | MEDIA | Verificar endpoint de cambio de estado en Sprint 1 |

### 7.2. Riesgos de Recursos

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| **R5:** Disponibilidad del equipo | MEDIO | BAJA | Planificar con anticipación, buffer de tiempo |
| **R6:** Dependencias externas | BAJO | BAJA | No hay dependencias críticas externas |

### 7.3. Riesgos de Testing

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| **R7:** Datos de prueba insuficientes | MEDIO | MEDIA | Crear scripts de seed en Sprint 1 |
| **R8:** Ambiente de testing no disponible | BAJO | BAJA | Usar ambiente dev para testing |

---

## 8. Recursos Necesarios

### 8.1. Humanos

| Rol | Responsabilidades | Dedicación |
|-----|-------------------|------------|
| **Backend Developer** | Handlers, validaciones, pipeline events | 100% (3 sprints) |
| **Frontend Developer** | Componentes, tipos, UX | 100% (3 sprints) |
| **QA Tester** | Test cases, pruebas E2E | 50% (Sprint 3) |
| **Tech Writer** | Documentación de usuario | 25% (Sprint 3) |

### 8.2. Técnicos

| Recurso | Uso | Acceso Requerido |
|---------|-----|------------------|
| **Cloudflare D1** | Base de datos PAI_NOT_notas | ✅ Configurado |
| **Cloudflare Workers** | Backend handlers | ✅ Configurado |
| **Cloudflare Pages** | Frontend deployment | ✅ Configurado |
| **GitHub** | Code repository | ✅ Configurado |
| **Postman/cURL** | API testing | ✅ Disponible |

### 8.3. Herramientas

| Herramienta | Propósito | Estado |
|-------------|-----------|--------|
| **VS Code** | Desarrollo | ✅ Disponible |
| **Wrangler CLI** | Deploy Cloudflare | ✅ Configurado |
| **D1 Console** | Verificación DB | ✅ Disponible |
| **Browser DevTools** | Frontend debugging | ✅ Disponible |

---

## 9. Definición de Done

### 9.1. Por Feature

Una feature se considera **DONE** cuando:

- ✅ Código implementado y revisado
- ✅ Tests passing (unitarios + E2E)
- ✅ Deploy en ambiente de testing
- ✅ Documentación actualizada
- ✅ Aprobación de stakeholder (si aplica)

### 9.2. Por Sprint

Un sprint se considera **DONE** cuando:

- ✅ Todos los criterios de éxito del sprint cumplidos
- ✅ Deploy en producción completado
- ✅ Bugs críticos resueltos
- ✅ Documentación del sprint actualizada
- ✅ Retrospective completada

### 9.3. Por Proyecto

El proyecto se considera **DONE** cuando:

- ✅ 100% de criterios de aceptación cumplidos
- ✅ Documentación completa y aprobada
- ✅ Testing exhaustivo completado
- ✅ Stakeholder approval obtenido
- ✅ Código mergeado a main y desplegado

---

## 10. Anexos

### 10.1. Referencias

| Documento | Ruta | Propósito |
|-----------|------|-----------|
| **Especificación** | `_doc-desarrollo/notas-proyecto/01-notas-proyectos-pai-extraccion-completa.md` | Referencia técnica |
| **Diagnóstico** | `_doc-desarrollo/notas-proyecto/02-diagnostico-implementacion-notas.md` | Estado actual |
| **Reglas Proyecto** | `.governance/reglas_proyecto.md` | Reglas a seguir |
| **Inventario** | `.governance/inventario_recursos.md` | Recursos Cloudflare |

### 10.2. Plantillas

#### Plantilla de Test Case

```markdown
## TC-XXX: [Nombre del Test]

**Objetivo:** [Descripción del objetivo]

**Precondiciones:**
- [ ] [Precondición 1]
- [ ] [Precondición 2]

**Pasos:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado Esperado:**
- [Resultado esperado]

**Resultado Obtenido:**
- [Resultado obtenido]

**Estado:** ✅ PASS / ❌ FAIL

**Notas:**
[Notas adicionales]
```

---

#### Plantilla de Bug Report

```markdown
## Bug-XXX: [Nombre del Bug]

**Severidad:** CRÍTICO / ALTO / MEDIO / BAJO

**Descripción:**
[Descripción del bug]

**Pasos para Reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Comportamiento Esperado:**
[Lo que debería pasar]

**Comportamiento Actual:**
[Lo que está pasando]

**Evidencia:**
[Screenshots, logs, etc.]

**Ambiente:**
- URL: [URL donde ocurre]
- Browser: [Browser y versión]

**Prioridad:** P1 / P2 / P3

**Asignado a:** [Persona]

**Estado:** OPEN / IN PROGRESS / RESOLVED / CLOSED
```

---

**Documento generado:** 2026-03-29  
**Próximo paso:** Iniciar Sprint 1 - Correcciones Críticas  
**Duración total estimada:** 9 días laborables (3 sprints de 3 días)
