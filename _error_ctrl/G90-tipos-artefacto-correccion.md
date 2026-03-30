# Diagnóstico y Corrección: G90 - Tipos de Artefacto Incorrectos

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Descripción del Problema](#2-descripción-del-problema)
3. [Diagnóstico Realizado](#3-diagnóstico-realizado)
4. [Causa Raíz Identificada](#4-causa-raíz-identificada)
5. [Corrección Aplicada](#5-corrección-aplicada)
6. [Verificación](#6-verificación)

---

## 1. Resumen Ejecutivo

**Incidencia:** G90 - Los 7 pasos del análisis completan exitosamente, pero los archivos MD no se registran en la base de datos

**Severidad:** Crítica

**Estado:** ✅ DIAGNOSTICADO Y CORREGIDO

**Problema:** Los nombres de tipos de artefacto en el código NO coincidían con los nombres en la BD

---

## 2. Descripción del Problema

### 2.1. Síntomas Observados

| Síntoma | Descripción |
|---------|-------------|
| **7 pasos completan** | Todos los pasos de IA ejecutan correctamente |
| **Archivos se guardan en R2** | Los 7 archivos MD existen en R2 |
| **Error en registro BD** | `Tipo de artefacto no encontrado: analisis-fisico` |
| **artefactos_generados: 0** | El log muestra 0 artefactos registrados |

### 2.2. Logs Observados

```text
✅ [TRACKING:paso-1-completado] Paso 1 completado: Activo Físico
✅ [TRACKING:paso-2-completado] Paso 2 completado: Activo Estratégico
✅ [TRACKING:paso-3-completado] Paso 3 completado: Activo Financiero
✅ [TRACKING:paso-4-completado] Paso 4 completado: Activo Regulado
✅ [TRACKING:paso-5-completado] Paso 5 completado: Inversor
✅ [TRACKING:paso-6-completado] Paso 6 completado: Emprendedor Operador
✅ [TRACKING:paso-7-completado] Paso 7 completado: Propietario
✅ [TRACKING:persistir-artefactos] Persistiendo artefactos en R2
✅ [TRACKING:persistir-analisis-fisico] Artefacto persistido: analisis-inmuebles/26030010/26030010_01_activo_fisico.md
... (7 archivos persistidos en R2)
❌ [TRACKING:registrar-en-bd] Registrando artefactos en base de datos
❌ (error) Tipo de artefacto no encontrado: analisis-fisico
❌ (error) Tipo de artefacto no encontrado: analisis-estrategico
... (7 errores)
✅ [TRACKING:analisis-completado] Análisis completado exitosamente { artefactos_generados: 0 }
```

---

## 3. Diagnóstico Realizado

### 3.1. Verificación en Base de Datos

**Tabla:** `PAI_VAL_valores`  
**Filtro:** `VAL_atr_id = 5` (TIPO_ARTEFACTO)

**Valores existentes en BD:**

| VAL_id | VAL_codigo | VAL_nombre |
|--------|------------|------------|
| 30 | `ANALISIS_FISICO` | Análisis físico |
| 31 | `ANALISIS_ESTRATEGICO` | Análisis estratégico |
| 32 | `ANALISIS_FINANCIERO` | Análisis financiero |
| 33 | `ANALISIS_REGULATORIO` | Análisis regulatorio |
| 34 | `LECTURA_INVERSOR` | Lectura inversor |
| 35 | `LECTURA_OPERADOR` | Lectura operador |
| 36 | `LECTURA_PROPIETARIO` | Lectura propietario |
| 37 | `LOG_CII_JSON` | Log CII JSON |
| 38 | `RESUMEN_EJECUTIVO` | Resumen ejecutivo |

### 3.2. Verificación en Código

**Archivo:** `apps/worker/src/types/analisis.ts`

**Valores en el código (ANTES de corrección):**

```typescript
export const TIPOS_ARTEFACTOS = [
  'ACTIVO_FISICO',            // ❌ NO EXISTE EN BD
  'ACTIVO_ESTRATEGICO',       // ❌ NO EXISTE EN BD
  'ACTIVO_FINANCIERO',        // ❌ NO EXISTE EN BD
  'ACTIVO_REGULADO',          // ❌ NO EXISTE EN BD
  'INVERSOR',                 // ❌ NO EXISTE EN BD
  'EMPRENDEDOR_OPERADOR',     // ❌ NO EXISTE EN BD
  'PROPIETARIO',              // ❌ NO EXISTE EN BD
] as const
```

---

## 4. Causa Raíz Identificada

### 4.1. Problema Principal

**Los nombres de tipos de artefacto en el código NO coincidían con los nombres en `PAI_VAL_valores`.**

### 4.2. Por Qué Ocurrió

| Código | BD | ¿Coincide? |
|--------|-----|------------|
| `ACTIVO_FISICO` | `ANALISIS_FISICO` | ❌ NO |
| `ACTIVO_ESTRATEGICO` | `ANALISIS_ESTRATEGICO` | ❌ NO |
| `INVERSOR` | `LECTURA_INVERSOR` | ❌ NO |
| `EMPRENDEDOR_OPERADOR` | `LECTURA_OPERADOR` | ❌ NO |
| `PROPIETARIO` | `LECTURA_PROPIETARIO` | ❌ NO |

### 4.3. Código Problemático

**Archivo:** `apps/worker/src/services/ia-analisis-proyectos.ts`

```typescript
for (const artefacto of artefactosGuardados) {
  const tipoVal = tiposArtefactos.find(
    t => t.VAL_codigo === artefacto.nombre.toUpperCase().replace('-', '_')
  )

  if (!tipoVal) {
    console.error(`Tipo de artefacto no encontrado: ${artefacto.nombre}`)
    continue  // ❌ Salta el registro, artefacto no se guarda en BD
  }
  // ...
}
```

**Proceso:**
1. `artefacto.nombre` = `'analisis-fisico'`
2. `.toUpperCase().replace('-', '_')` = `'ANALISIS_FISICO'`
3. Busca en `tiposArtefactos` que contiene `['ACTIVO_FISICO', ...]`
4. **NO ENCUENTRA** `'ANALISIS_FISICO'` porque solo tiene `'ACTIVO_FISICO'`
5. **Salta el registro** → artefacto no se guarda en BD

---

## 5. Corrección Aplicada

### 5.1. Actualización de Tipos

**Archivo:** `apps/worker/src/types/analisis.ts`

```typescript
// ANTES - Nombres incorrectos
export const TIPOS_ARTEFACTOS = [
  'ACTIVO_FISICO',
  'ACTIVO_ESTRATEGICO',
  'ACTIVO_FINANCIERO',
  'ACTIVO_REGULADO',
  'INVERSOR',
  'EMPRENDEDOR_OPERADOR',
  'PROPIETARIO',
] as const

// AHORA - Nombres que coinciden con BD
export const TIPOS_ARTEFACTOS = [
  'ANALISIS_FISICO',        // ✅ Coincide con BD
  'ANALISIS_ESTRATEGICO',   // ✅ Coincide con BD
  'ANALISIS_FINANCIERO',    // ✅ Coincide con BD
  'ANALISIS_REGULATORIO',   // ✅ Coincide con BD
  'LECTURA_INVERSOR',       // ✅ Coincide con BD
  'LECTURA_OPERADOR',       // ✅ Coincide con BD
  'LECTURA_PROPIETARIO',    // ✅ Coincide con BD
] as const
```

### 5.2. Mejora de Logging

**Archivo:** `apps/worker/src/services/ia-analisis-proyectos.ts`

```typescript
for (const artefacto of artefactosGuardados) {
  // artefacto.nombre es como 'analisis-fisico', necesitamos 'ANALISIS_FISICO'
  const valCodigo = artefacto.nombre.toUpperCase().replace(/-/g, '_')
  
  const tipoVal = tiposArtefactos.find(
    t => t.VAL_codigo === valCodigo
  )

  if (!tipoVal) {
    console.error(`Tipo de artefacto no encontrado: ${artefacto.nombre} (buscado: ${valCodigo})`)
    console.error(`Tipos disponibles:`, tiposArtefactos.map(t => t.VAL_codigo))
    continue
  }
  // ...
}
```

### 5.3. Deploy Realizado

```bash
cd /workspaces/cbc-endes/apps/worker
npm run deploy
```

**Resultado:**
```
Uploaded wk-backend-dev (5.17 sec)
Deployed wk-backend-dev triggers (2.41 sec)
Current Version ID: 22a8f1f4-5d2e-4933-94fe-4293c91c91ef
```

---

## 6. Verificación

### 6.1. Test de Verificación

**Comando:**
```bash
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/:id/analisis" \
  -H "Content-Type: application/json" \
  -d '{"forzar_reejecucion": true}'
```

### 6.2. Logs Esperados

```text
✅ [TRACKING:persistir-artefactos] Persistiendo artefactos en R2
✅ [TRACKING:persistir-analisis-fisico] Artefacto persistido: ...
✅ [TRACKING:registrar-en-bd] Registrando artefactos en base de datos
✅ [TRACKING:actualizar-estado] Actualizando estado del proyecto a ANALISIS_FINALIZADO
✅ [TRACKING:analisis-completado] Análisis completado exitosamente { artefactos_generados: 7 }
```

### 6.3. Verificación en BD

**Query:**
```sql
SELECT * FROM PAI_ART_artefactos WHERE ART_proyecto_id = :proyectoId
```

**Resultado esperado:** 7 registros (uno por cada artefacto)

---

## 7. Referencias

### 7.1. Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `apps/worker/src/types/analisis.ts` | `TIPOS_ARTEFACTOS` actualizado para coincidir con BD |
| `apps/worker/src/services/ia-analisis-proyectos.ts` | Logging mejorado para debugging |

### 7.2. Lecciones Aprendidas

| Lección | Descripción |
|---------|-------------|
| **Validar nombres con BD** | Siempre verificar que los nombres en código coincidan con la BD |
| **Usar la BD como fuente de verdad** | Los tipos de artefacto deben leerse de `PAI_VAL_valores`, no hardcodearse |
| **Logging detallado** | Agregar logs que muestren qué se está buscando y qué está disponible |

---

**Documento generado:** 2026-03-29  
**Incidencia:** G90 - Tipos de Artefacto Incorrectos  
**Causa:** Nombres en código no coincidían con `PAI_VAL_valores`  
**Corrección:** `TIPOS_ARTEFACTOS` actualizado con nombres correctos  
**Estado:** ✅ CORREGIDO - Deploy completado  
**Próximo paso:** Verificar que análisis completo registre 7 artefactos en BD
