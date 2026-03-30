# Casos de Test - Sistema de Notas PAI

## Índice de Contenido

1. [Objetivo del Documento](#1-objetivo-del-documento)
2. [Casos de Test del Día 7](#2-casos-de-test-del-día-7)
3. [Resultados de Sprint 1](#3-resultados-de-sprint-1)
4. [Resultados de Sprint 2](#4-resultados-de-sprint-2)
5. [Resultados de Sprint 3](#5-resultados-de-sprint-3)
6. [Bugs Documentados](#6-bugs-documentados)
7. [Referencias](#7-referencias)

---

## 1. Objetivo del Documento

Este documento contiene todos los casos de test para validar el funcionamiento del Sistema de Notas PAI, incluyendo:
- Tests de Sprint 1 (Creación de notas)
- Tests de Sprint 2 (Edición y eliminación con validaciones)
- Tests de Sprint 3 (Testing exhaustivo)

---

## 2. Casos de Test del Día 7

### TC-001: Crear Nota Exitosa

**Descripción:** Validar que se puede crear una nota correctamente con todos los campos requeridos.

**Precondiciones:**
- Proyecto existe en estado "creado" (estado_id = 1)
- Usuario navega a `/proyectos/{id}`

**Pasos:**
1. Ir a `/proyectos/{id}`
2. Click en "Agregar Nota"
3. Completar campos:
   - Tipo: Comentario
   - Autor: "Juan Pérez"
   - Asunto: "Revisión estructural"
   - Contenido: "Se observa grieta en pared principal de aproximadamente 2mm."
4. Click en "Guardar Nota"

**Resultado Esperado:**
- ✅ Nota aparece en la lista
- ✅ Muestra asunto como título
- ✅ Muestra "Estado al crear: creado"
- ✅ Muestra autor y fecha de creación
- ✅ Botones Editar/Eliminar disponibles

**Estado:** ✅ PASS

---

### TC-002: Editar Nota (Sin Cambio Estado)

**Descripción:** Validar que se puede editar una nota cuando el estado del proyecto no ha cambiado.

**Precondiciones:**
- Nota creada en estado "creado" (estado_id = 1)
- Estado del proyecto sigue siendo "creado"

**Pasos:**
1. Ir a `/proyectos/{id}`
2. Localizar nota creada
3. Click en "Editar"
4. Modificar contenido: "Se observa grieta en pared principal de aproximadamente 3mm (actualizado)."
5. Click en "Guardar Cambios"

**Resultado Esperado:**
- ✅ Nota se actualiza correctamente
- ✅ `fecha_actualizacion` cambia
- ✅ Mensaje de éxito mostrado

**Estado:** ✅ PASS

---

### TC-003: Editar Nota (Con Cambio Estado)

**Descripción:** Validar que NO se puede editar una nota cuando el estado del proyecto ha cambiado.

**Precondiciones:**
- Nota creada en estado "creado" (estado_id = 1)
- Estado del proyecto cambia a "analisis_finalizado" (estado_id = 4)

**Pasos:**
1. Crear nota en estado "creado"
2. Cambiar estado del proyecto a "analisis_finalizado"
3. Intentar editar nota
4. Click en "Editar"

**Resultado Esperado:**
- ✅ Botón "Editar" deshabilitado O mensaje "No editable"
- ✅ Nota muestra candado o indicador de no editable
- ✅ Sistema previene edición

**Estado:** ✅ PASS

---

### TC-004: Eliminar Nota (Sin Cambio Estado)

**Descripción:** Validar que se puede eliminar una nota cuando el estado del proyecto no ha cambiado.

**Precondiciones:**
- Nota creada en estado "creado" (estado_id = 1)
- Estado del proyecto sigue siendo "creado"

**Pasos:**
1. Ir a `/proyectos/{id}`
2. Localizar nota creada
3. Click en "Eliminar"
4. Confirmar eliminación en diálogo

**Resultado Esperado:**
- ✅ Nota desaparece de la lista
- ✅ Mensaje de éxito mostrado
- ✅ Nota eliminada de la base de datos

**Estado:** ✅ PASS

---

### TC-005: Eliminar Nota (Con Cambio Estado)

**Descripción:** Validar que NO se puede eliminar una nota cuando el estado del proyecto ha cambiado.

**Precondiciones:**
- Nota creada en estado "creado" (estado_id = 1)
- Estado del proyecto cambia a "analisis_finalizado" (estado_id = 4)

**Pasos:**
1. Crear nota en estado "creado"
2. Cambiar estado del proyecto a "analisis_finalizado"
3. Intentar eliminar nota
4. Click en "Eliminar"
5. Confirmar eliminación

**Resultado Esperado:**
- ✅ Error 403 retornado del backend
- ✅ Mensaje: "La nota no se puede eliminar. El estado del proyecto ha cambiado desde su creación."
- ✅ Nota permanece en la lista

**Estado:** ✅ PASS

---

## 3. Resultados de Sprint 1

| Test Case | Descripción | Estado | Observaciones |
|-----------|-------------|--------|---------------|
| TC-S1-01 | Crear nota con campos básicos | ✅ PASS | Tipo, autor, contenido |
| TC-S1-02 | Crear nota con asunto | ✅ PASS | Campo asunto funcional |
| TC-S1-03 | Validar campos requeridos | ✅ PASS | Error si faltan campos |
| TC-S1-04 | Mostrar estado_proyecto_creacion | ✅ PASS | Muestra "Estado al crear: {estado}" |
| TC-S1-05 | Deploy backend | ✅ PASS | Version: ver inventario |
| TC-S1-06 | Deploy frontend | ✅ PASS | URL: ver inventario |

---

## 4. Resultados de Sprint 2

| Test Case | Descripción | Estado | Observaciones |
|-----------|-------------|--------|---------------|
| TC-S2-01 | Eliminar nota (estado igual) | ✅ PASS | Funciona correctamente |
| TC-S2-02 | Eliminar nota (estado cambiado) | ✅ PASS | Retorna 403 |
| TC-S2-03 | Error 403 con mensaje claro | ✅ PASS | `NOTA_NO_EDITABLE` |
| TC-S2-04 | Evento PROCESS_COMPLETE (crear) | ✅ PASS | Pipeline events |
| TC-S2-05 | Evento PROCESS_COMPLETE (editar) | ✅ PASS | Pipeline events |
| TC-S2-06 | Evento PROCESS_COMPLETE (eliminar) | ✅ PASS | Pipeline events |
| TC-S2-07 | Validación longitud asunto (3-200) | ✅ PASS | Frontend validation |
| TC-S2-08 | Validación longitud autor (2-100) | ✅ PASS | Frontend validation |
| TC-S2-09 | Validación longitud contenido (10-5000) | ✅ PASS | Frontend validation |
| TC-S2-10 | Deploy Sprint 2 | ✅ PASS | Version: ver inventario |

---

## 5. Resultados de Sprint 3

| Test Case | Descripción | Estado | Observaciones |
|-----------|-------------|--------|---------------|
| TC-001 | Crear Nota Exitosa | ✅ PASS | Todos los campos |
| TC-002 | Editar Nota (Sin Cambio Estado) | ✅ PASS | Edición permitida |
| TC-003 | Editar Nota (Con Cambio Estado) | ✅ PASS | Edición bloqueada |
| TC-004 | Eliminar Nota (Sin Cambio Estado) | ✅ PASS | Eliminación permitida |
| TC-005 | Eliminar Nota (Con Cambio Estado) | ✅ PASS | Eliminación bloqueada |
| TC-S3-01 | Deploy final | ✅ PASS | Version: ver inventario |
| TC-S3-02 | Pruebas de regresión | ✅ PASS | Sin regresiones |

---

## 6. Bugs Documentados

### Bug-001: [SPRINT 1] Campo asunto no se guardaba

**Severidad:** ALTO

**Descripción:** El campo `asunto` no se estaba guardando en la base de datos.

**Pasos para Reproducir:**
1. Crear nota con asunto "Test"
2. Recargar página
3. Verificar asunto

**Comportamiento Esperado:** Asunto debería mostrarse

**Comportamiento Actual:** Asunto no se mostraba

**Estado:** ✅ RESUELTO (Sprint 1)

**Solución:** Actualizar backend para guardar `NOT_asunto`

---

### Bug-002: [SPRINT 1] estado_proyecto_creacion no se mostraba

**Severidad:** ALTO

**Descripción:** El estado del proyecto al crear la nota no se mostraba en la lista.

**Estado:** ✅ RESUELTO (Sprint 1)

**Solución:** Actualizar frontend para mostrar `estado_proyecto_creacion`

---

### Bug-003: [SPRINT 2] handleEliminarNota no estaba exportada

**Severidad:** CRÍTICO

**Descripción:** La función `handleEliminarNota` no estaba importada en `index.ts`.

**Error:** `Uncaught ReferenceError: handleEliminarNota is not defined`

**Estado:** ✅ RESUELTO (Sprint 2)

**Solución:** Añadir import en `index.ts`:
```typescript
import {
  handleCrearNota,
  handleEditarNota,
  handleEliminarNota,
} from './handlers/pai-notas';
```

---

## 7. Referencias

### 7.1. Documentos Relacionados

| Documento | Ruta |
|-----------|------|
| **ROADMAP** | `_doc-desarrollo/notas-proyecto/03-plan-implementacion-notas.md` |
| **Especificación Técnica** | `_doc-desarrollo/notas-proyecto/01-notas-proyectos-pai-extraccion-completa.md` |
| **Diagnóstico** | `_doc-desarrollo/notas-proyecto/02-diagnostico-implementacion-notas.md` |

### 7.2. Archivos de Test

| Archivo | Ruta |
|---------|------|
| Test Cases | `_doc-desarrollo/notas-proyecto/06-test-cases-notas.md` (este documento) |
| Resultados Sprint 1 | `_doc-desarrollo/notas-proyecto/07-test-results-sprint1.md` |
| Resultados Sprint 2 | `_doc-desarrollo/notas-proyecto/08-test-results-sprint2.md` |
| Resultados Sprint 3 | `_doc-desarrollo/notas-proyecto/09-test-results-sprint3.md` |

---

**Documento generado:** 2026-03-30  
**Sprint:** Sprint 3 - Testing y Documentación  
**Estado:** ✅ COMPLETADO - Todos los tests passing  
**Próximo paso:** Crear guía de usuario y API docs
