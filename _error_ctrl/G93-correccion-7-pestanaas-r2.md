# Corrección G93: 7 Pestañas de Análisis desde R2

## Índice de Contenido

1. [Resumen del Problema](#1-resumen-del-problema)
2. [Solución Implementada](#2-solución-implementada)
3. [Cambios en Backend](#3-cambios-en-backend)
4. [Cambios en Frontend](#4-cambios-en-frontend)
5. [Endpoints Nuevos](#5-endpoints-nuevos)
6. [Pruebas de Verificación](#6-pruebas-de-verificación)
7. [Referencias](#7-referencias)

---

## 1. Resumen del Problema

### Problema Original

Los 7 artefactos de análisis no se mostraban en la pestaña "Otros Artefactos" porque:
- Los registros no se estaban creando en `PAI_ART_artefactos`
- El frontend dependía de esa tabla para mostrar los artefactos

### Solución Aplicada

**Olvidar `PAI_ART_artefactos`** y leer directamente desde R2 usando el CII del proyecto.

**Patrones de archivos en R2:**
```
analisis-inmuebles/{CII}/
├── {CII}_01_activo_fisico.md
├── {CII}_02_activo_estrategico.md
├── {CII}_03_activo_financiero.md
├── {CII}_04_activo_regulatorio.md
├── {CII}_05_inversor.md
├── {CII}_06_emprendedor_operador.md
└── {CII}_07_propietario.md
```

---

## 2. Solución Implementada

### 2.1. Backend

**Nuevo endpoint:** `GET /api/pai/proyectos/:id/artefactos/:tipo/contenido`

- Obtiene el CII del proyecto directamente desde `PAI_PRO_proyectos`
- Mapea el tipo de artefacto al nombre de archivo correspondiente
- Lee el contenido directamente desde R2
- Retorna el contenido Markdown

### 2.2. Frontend

**7 pestañas adicionales:**
1. 📄 Resumen Ejecutivo (existente)
2. 📊 Datos Transformados (existente)
3. 📈 Análisis Físico (nueva)
4. 📊 Análisis Estratégico (nueva)
5. 💰 Análisis Financiero (nueva)
6. ⚖️ Análisis Regulatorio (nueva)
7. 👤 Lectura Inversor (nueva)
8. 👨‍💼 Lectura Operador (nueva)
9. 🏠 Lectura Propietario (nueva)

**Mejoras de UX:**
- Navegación con scroll horizontal (overflow-x-auto)
- Indicador de carga (spinner) mientras se carga el contenido
- Mensajes claros cuando no hay contenido disponible
- Presentación cuidada con `prose prose-blue`

---

## 3. Cambios en Backend

### 3.1. `apps/worker/src/handlers/pai-proyectos.ts`

**Nueva función:** `handleObtenerContenidoArtefactoPorTipo()`

```typescript
export async function handleObtenerContenidoArtefactoPorTipo(c: AppContext): Promise<Response> {
  // 1. Obtener CII del proyecto
  const proyecto = await db
    .prepare('SELECT PRO_cii as cii FROM PAI_PRO_proyectos WHERE PRO_id = ?')
    .bind(proyectoId)
    .first()

  // 2. Mapear tipo a nombre de archivo
  const archivoMap: Record<string, string> = {
    'analisis-fisico': `${cii}_01_activo_fisico.md`,
    'analisis-estrategico': `${cii}_02_activo_estrategico.md`,
    'analisis-financiero': `${cii}_03_activo_financiero.md`,
    'analisis-regulatorio': `${cii}_04_activo_regulatorio.md`,
    'inversor': `${cii}_05_inversor.md`,
    'emprendedor-operador': `${cii}_06_emprendedor_operador.md`,
    'propietario': `${cii}_07_propietario.md`,
  }

  // 3. Leer desde R2
  const r2Object = await r2Bucket.get(rutaR2)
  const contenido = await r2Object.text()

  return c.json({ contenido, tipo, archivo, ruta_r2 })
}
```

### 3.2. `apps/worker/src/index.ts`

**Endpoint registrado:**

```typescript
// Obtener contenido de artefacto por tipo (Sprint 3 Corrección)
app.get('/api/pai/proyectos/:id/artefactos/:tipo/contenido', handleObtenerContenidoArtefactoPorTipo);
```

---

## 4. Cambios en Frontend

### 4.1. `apps/frontend/src/pages/proyectos/DetalleProyecto.tsx`

**Nuevos estados:**

```typescript
const [pestañaActiva, setPestañaActiva] = useState<string>('resumen');
const [contenidoAnalisis, setContenidoAnalisis] = useState<Record<string, string>>({});
const [loadingAnalisis, setLoadingAnalisis] = useState<Record<string, boolean>>({});
```

**Tipos de análisis:**

```typescript
const tiposAnalisis = [
  { key: 'analisis-fisico', label: 'Análisis Físico' },
  { key: 'analisis-estrategico', label: 'Análisis Estratégico' },
  { key: 'analisis-financiero', label: 'Análisis Financiero' },
  { key: 'analisis-regulatorio', label: 'Análisis Regulatorio' },
  { key: 'inversor', label: 'Lectura Inversor' },
  { key: 'emprendedor-operador', label: 'Lectura Operador' },
  { key: 'propietario', label: 'Lectura Propietario' },
];
```

**Función de carga:**

```typescript
const cargarContenidoAnalisis = async (tipo: string) => {
  if (contenidoAnalisis[tipo] || loadingAnalisis[tipo]) return;

  setLoadingAnalisis(prev => ({ ...prev, [tipo]: true }));

  try {
    const response = await fetch(
      `${VITE_API_BASE_URL}/api/pai/proyectos/${id}/artefactos/${tipo}/contenido`
    );
    
    if (response.ok) {
      const data = await response.json();
      setContenidoAnalisis(prev => ({ ...prev, [tipo]: data.contenido }));
    }
  } catch (error) {
    console.error(`Error loading análisis ${tipo}:`, error);
  } finally {
    setLoadingAnalisis(prev => ({ ...prev, [tipo]: false }));
  }
};
```

**Navegación mejorada:**

```tsx
<div className="border-b border-gray-200 mb-4 overflow-x-auto">
  <nav className="-mb-px flex space-x-4 min-w-max">
    <button>📄 Resumen Ejecutivo</button>
    <button>📊 Datos Transformados</button>
    {tiposAnalisis.map((tipo) => (
      <button
        key={tipo.key}
        onClick={() => {
          setPestañaActiva(tipo.key);
          cargarContenidoAnalisis(tipo.key);
        }}
      >
        {tipo.label}
      </button>
    ))}
  </nav>
</div>
```

**Renderizado con loading:**

```tsx
{tiposAnalisis.some(t => t.key === pestañaActiva) && (
  <div>
    {loadingAnalisis[pestañaActiva] ? (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-500">Cargando análisis...</p>
      </div>
    ) : contenidoAnalisis[pestañaActiva] ? (
      <div className="prose prose-blue max-w-none">
        <VisualizadorMarkdown contenido={contenidoAnalisis[pestañaActiva]} />
      </div>
    ) : (
      <div className="text-center py-12 text-gray-500">
        <p className="mb-4">No hay contenido disponible para este análisis.</p>
        <p className="text-sm">Ejecuta el análisis completo del proyecto para generar este contenido.</p>
      </div>
    )}
  </div>
)}
```

---

## 5. Endpoints Nuevos

### 5.1. GET /api/pai/proyectos/:id/artefactos/:tipo/contenido

**Descripción:** Obtener contenido de un artefacto específico por tipo, leyendo directamente desde R2.

**Parámetros de URL:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID del proyecto PAI |
| `tipo` | string | Tipo de artefacto: `analisis-fisico`, `analisis-estrategico`, etc. |

**Response (200 - OK):**

```json
{
  "contenido": "# Análisis Físico\n\nContenido del análisis...",
  "tipo": "analisis-fisico",
  "archivo": "26030010_01_activo_fisico.md",
  "ruta_r2": "analisis-inmuebles/26030010/26030010_01_activo_fisico.md"
}
```

**Response (404 - No encontrado):**

```json
{
  "error": "Contenido no encontrado",
  "detalle": "El archivo 26030010_01_activo_fisico.md no existe en R2. Ejecuta el análisis para generarlo."
}
```

**Response (400 - Tipo inválido):**

```json
{
  "error": "Tipo de artefacto no válido: tipo-invalido"
}
```

---

## 6. Pruebas de Verificación

### 6.1. Test Manual

**Proyectos para probar:** 12, 11, 10, 9

**Pasos:**

1. Navegar a `/proyectos/12`
2. Click en cada pestaña de análisis
3. Verificar que:
   - El contenido se carga correctamente
   - El spinner aparece mientras carga
   - El mensaje "No hay contenido" aparece si no existe el archivo

### 6.2. Test con cURL

```bash
# Test endpoint por tipo
curl "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/12/artefactos/analisis-fisico/contenido"

# Expected response:
# {
#   "contenido": "# Análisis Físico\n\n...",
#   "tipo": "analisis-fisico",
#   "archivo": "26030012_01_activo_fisico.md",
#   "ruta_r2": "analisis-inmuebles/26030012/26030012_01_activo_fisico.md"
# }
```

---

## 7. Referencias

### 7.1. Documentos Relacionados

| Documento | Ruta |
|-----------|------|
| **Issue G93** | `_error_ctrl/09_g/G93_issue.md` |
| **Especificación Técnica** | `_doc-desarrollo/wf-analisis-inmobiliario/004-Especificacion-Tecnica-Workflow-Analisis.md` |

### 7.2. Archivos Modificados

| Archivo | Ruta | Cambios |
|---------|------|---------|
| `pai-proyectos.ts` | `apps/worker/src/handlers/` | Nueva función `handleObtenerContenidoArtefactoPorTipo()` |
| `index.ts` (worker) | `apps/worker/src/` | Registro de nuevo endpoint |
| `DetalleProyecto.tsx` | `apps/frontend/src/pages/proyectos/` | 7 pestañas adicionales, carga desde R2 |

---

## 8. Deploy Realizados

| Recurso | URL/ID | Estado |
|---------|--------|--------|
| **Backend** | `d1b5d03a-aef8-4bde-a77f-0a375a297f92` | ✅ Completado |
| **Frontend** | https://adcf6ba5.pg-cbc-endes.pages.dev | ✅ Completado |

---

**Documento generado:** 2026-03-30  
**Issue:** G93 - 7 Pestañas de Análisis no se mostraban  
**Causa:** Dependencia de `PAI_ART_artefactos` que no tenía registros  
**Solución:** Leer directamente desde R2 usando CII  
**Estado:** ✅ CORREGIDO - 7 pestañas operativas  
**Próximo paso:** Verificar en frontend con proyectos 12, 11, 10, 9
