# Diagnóstico: "Análisis Regulatorio" no muestra contenido MD

## Índice de Contenidos
1. [Descripción del Problema](#descripción-del-problema)
2. [Causa Raíz](#causa-raíz)
3. [Archivos Implicados](#archivos-implicados)
4. [Propuesta de Fix](#propuesta-de-fix)
5. [Hallazgo Adicional](#hallazgo-adicional)
6. [Pendientes de Confirmación](#pendientes-de-confirmación)

---

## Descripción del Problema

En la página de detalle de proyecto (`/proyectos/`), la pestaña "Análisis Regulatorio" dentro de "Resultados del Análisis" no muestra el contenido del archivo Markdown correspondiente.

- **Ejemplo:** Para el proyecto ID 14, el archivo existe en R2 como `26030014_04_activo_regulado.md`
- El resto de pestañas (Resumen Ejecutivo, Datos Transformados, etc.) muestran su contenido correctamente

---

## Causa Raíz

**Mismatch de nombres de archivo entre escritura y lectura en el backend.**

| Proceso | Nombre de archivo R2 | Ubicación en código |
|---------|---------------------|---------------------|
| **Escritura** (pipeline de análisis) | `{CII}_04_activo_regulado.md` | `apps/worker/src/types/analisis.ts` → constante `MAPEO_ARCHIVOS` |
| **Lectura** (handler que sirve contenido) | `{CII}_04_activo_regulatorio.md` | `apps/worker/src/handlers/pai-proyectos.ts` línea ~1185 |

### Flujo actual (roto):

```
1. Frontend solicita: GET /api/pai/proyectos/:id/artefactos/analisis-regulatorio/contenido
2. Handler construye clave R2: `${cii}_04_activo_regulatorio.md`  ← TYPO
3. R2 devuelve 404 (el archivo real es `_activo_regulado.md`)
4. Frontend recibe respuesta vacía
```

### Flujo correcto (otras pestañas):

```
1. Frontend solicita: GET /api/pai/proyectos/:id/artefactos/analisis-fisico/contenido
2. Handler construye clave R2: `${cii}_01_activo_fisico.md`  ← COINCIDE
3. R2 devuelve el archivo correctamente
```

---

## Archivos Implicados

| Archivo | Rol | Path Absoluto |
|---------|-----|---------------|
| **MAPEO_ARCHIVOS (fuente de verdad)** | Define nombres de archivo para escritura | `apps/worker/src/types/analisis.ts` |
| **ia-analisis-proyectos.ts** | Usa MAPEO_ARCHIVOS para escribir en R2 | `apps/worker/src/services/ia-analisis-proyectos.ts` |
| **pai-proyectos.ts (BUG aquí)** | Handler HTTP con mapa hardcodeado duplicado | `apps/worker/src/handlers/pai-proyectos.ts` (línea ~1185) |
| **DetalleProyecto.tsx** | Página frontend que renderiza pestañas | `apps/frontend/src/pages/proyectos/DetalleProyecto.tsx` |
| **VisualizadorMarkdown.tsx** | Componente que renderiza el MD | `apps/frontend/src/pages/proyectos/VisualizadorMarkdown.tsx` |
| **index.ts (worker)** | Registro de ruta endpoint | `apps/worker/src/index.ts` (línea 98) |

### Código del Bug (línea ~1185 de `pai-proyectos.ts`):

```typescript
const archivoMap: Record<string, string> = {
  'analisis-fisico': `${cii}_01_activo_fisico.md`,
  'analisis-estrategico': `${cii}_02_activo_estrategico.md`,
  'analisis-financiero': `${cii}_03_activo_financiero.md`,
  'analisis-regulatorio': `${cii}_04_activo_regulatorio.md`,   // ← BUG: debe ser "regulado"
  'inversor': `${cii}_05_inversor.md`,
  'emprendedor-operador': `${cii}_06_emprendedor_operador.md`,
  'propietario': `${cii}_07_propietario.md`,
}
```

### Código de MAPEO_ARCHIVOS (correcto, `analisis.ts`):

```typescript
export const MAPEO_ARCHIVOS: Record<PasoAnalisisClave, string> = {
  'analisis-fisico': '{cii}_01_activo_fisico.md',
  'analisis-estrategico': '{cii}_02_activo_estrategico.md',
  'analisis-financiero': '{cii}_03_activo_financiero.md',
  'analisis-regulatorio': '{cii}_04_activo_regulado.md',       // ← CORRECTO
  'inversor': '{cii}_05_inversor.md',
  'emprendedor-operador': '{cii}_06_emprendedor_operador.md',
  'propietario': '{cii}_07_propietario.md',
}
```

---

## Propuesta de Fix

### Opción A: Quick Fix (1 línea)

Cambiar el typo en `apps/worker/src/handlers/pai-proyectos.ts`:

```diff
- 'analisis-regulatorio': `${cii}_04_activo_regulatorio.md`
+ 'analisis-regulatorio': `${cii}_04_activo_regulado.md`
```

**Pros:** Mínimo cambio, bajo riesgo, resuelve el bug inmediato.
**Contras:** Mantiene duplicación de lógica; futuros cambios en `MAPEO_ARCHIVOS` podrían no reflejarse aquí.

---

### Opción B: Refactor DRY (Recomendada)

Eliminar el mapa `archivoMap` hardcodeado en el handler e importar `MAPEO_ARCHIVOS` desde `apps/worker/src/types/analisis.ts`.

**Cambios:**
1. Importar `MAPEO_ARCHIVOS` en `pai-proyectos.ts`
2. Reemplazar el mapa local con una función que use `MAPEO_ARCHIVOS`
3. Ajustar la clave `'analisis-regulatorio'` al formato `PasoAnalisisClave` si es necesario

**Pros:** Una sola fuente de verdad, sin riesgo de desincronización futura.
**Contras:** Cambio ligeramente mayor, requiere verificar compatibilidad de tipos.

---

## Hallazgo Adicional

### Componente `ResultadosAnalisis.tsx` no se usa

El archivo `apps/frontend/src/components/pai/ResultadosAnalisis.tsx`:
- **No es importado por ningún otro archivo**
- Tiene su propia definición de pestañas con `tipoArtefacto: 'ANALISIS_REGULATORIO'`
- Renderiza contenido placeholder, no datos reales de R2

La página activa que muestra el detalle de proyecto es `DetalleProyecto.tsx`, que tiene su propia lógica de pestañas y funciona correctamente.

**Recomendación:** Eliminar o refactorizar este componente en un PR separado.

---

## Pendientes de Confirmación

1. **¿Opción A (quick fix) u Opción B (refactor DRY)?**
2. **¿Se aborda el componente `ResultadosAnalisis.tsx` muerto en este PR o se deja para después?**

---

*Documento generado: 2026-04-08*
*Estado: Esperando autorización del usuario para ejecutar cambios*
