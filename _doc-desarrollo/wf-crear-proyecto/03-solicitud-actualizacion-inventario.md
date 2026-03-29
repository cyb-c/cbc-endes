# Solicitud de Actualización de Inventario

## Información de la Solicitud

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-03-28 |
| **Solicitante** | Agente Cloudflare Deploy |
| **Motivo** | Nuevos recursos para Workflow de Alta de Proyectos PAI |
| **Documento de referencia** | `02-especificacion-tecnica-workflow-alta-pai.md` |

---

## Cambios Requeridos en `inventario_recursos.md`

### 1. Nuevo Recurso: Cloudflare Workflows

| Campo | Valor |
|-------|-------|
| **Tipo** | Cloudflare Workflows |
| **Nombre en CF** | `wf-alta-proyectos-pai` |
| **Binding** | `wf_alta_proyectos_pai` |
| **App/Worker asociado** | `wk-backend` |
| **Clase** | `altaProyectosPai` |
| **Estado** | 🔲 Por crear |
| **Notas** | Workflow para orquestación de alta de proyectos PAI (11 steps) |

**Tabla a actualizar**: Sección 4.6 Workflows

```markdown
### 4.6 Workflows

| Nombre | Binding | Clase | Worker Asociado | Estado |
|--------|---------|-------|-----------------|--------|
| `wf-alta-proyectos-pai` | `wf_alta_proyectos_pai` | `altaProyectosPai` | `wk-backend` | 🔲 Por crear |
```

---

### 2. Nuevo Secret: OPENAI_API_KEY

| Campo | Valor |
|-------|-------|
| **Nombre** | `OPENAI_API_KEY` |
| **Tipo** | Secret (sensible) |
| **Uso** | API de OpenAI para ejecución de prompts |
| **Configuración** | `wrangler secret put OPENAI_API_KEY --env production` |
| **Estado** | 🔲 Pendiente de configurar |

**Tabla a actualizar**: Sección 3.1 Secrets de Desarrollo Local - Backend

```markdown
### 3.1. Backend (`.dev.vars`)

| Variable | Uso | Sensible | Estado |
|----------|-----|----------|--------|
| `OPENAI_API_KEY` | API de OpenAI para prompts IA | Sí | 🔲 Pendiente |
```

---

### 3. Nueva Variable de Entorno: OPENAI_MODEL

| Campo | Valor |
|-------|-------|
| **Nombre** | `OPENAI_MODEL` |
| **Tipo** | Variable de entorno (no sensible) |
| **Uso** | Modelo de OpenAI a utilizar |
| **Valor por defecto** | `gpt-4o-mini` |
| **Estado** | 🔲 Pendiente de configurar |

**Tabla a actualizar**: Sección 5.1 Bindings y Variables de Entorno

```markdown
| Clave o Binding | Tipo | Estado | Ubicación | Observaciones |
|-----------------|------|--------|-----------|---------------|
| `OPENAI_MODEL` | Variable | 🔲 | `apps/worker/wrangler.toml` | Modelo de OpenAI (default: gpt-4o-mini) |
```

---

### 4. Nueva Subcarpeta R2: prompts-ia/

| Campo | Valor |
|-------|-------|
| **Ruta** | `prompts-ia/` |
| **Bucket** | `r2-cbconsulting` |
| **Contenido** | Prompts de IA en formato JSON |
| **Archivos iniciales** | `00_CrearProyecto.json` |
| **Estado** | 🔲 Por crear |

**Tabla a actualizar**: Sección 4.4 Buckets R2 - Notas

```markdown
**Nota**: El bucket R2 de prueba fue eliminado el 2026-03-27. El bucket `r2-cbconsulting` está activo para almacenamiento de archivos PAI.

**Subcarpetas**:
- `prompts-ia/` - Prompts de IA para ejecución contra OpenAI API (🔲 Por crear)
- `analisis-inmuebles/` - Carpetas por CII con resultados de análisis (✅ Existe)
```

---

### 5. Nuevo Contrato de API: POST /api/pai/proyectos (Workflow)

| Campo | Valor |
|-------|-------|
| **Endpoint** | `POST /api/pai/proyectos` |
| **Método** | POST |
| **Descripción** | Inicia workflow de alta de proyecto PAI |
| **Request** | `{ ijson: string }` |
| **Response** | `{ workflow_id: string, message: string }` (202) |
| **Estado** | 🔲 Por implementar |

**Tabla a actualizar**: Sección 8 Contratos entre Servicios

```markdown
| Servicio Origen | Servicio Destino | Endpoint | Método | Request | Response | Estado |
|-----------------|------------------|----------|--------|---------|----------|--------|
| Frontend (Pages) | `wk-backend` | `/api/pai/proyectos` | POST | `{ ijson: string }` | `{ workflow_id, message }` (202) | 🔲 Por implementar |
```

---

### 6. Actualización de Wrangler Configuration

| Campo | Valor |
|-------|-------|
| **Archivo** | `apps/worker/wrangler.toml` |
| **Cambios** | Agregar binding de Workflow |
| **Estado** | 🔲 Por actualizar |

**Tabla a actualizar**: Sección 5.1 Bindings y Variables de Entorno

```markdown
| Clave o Binding | Tipo | Estado | Ubicación | Observaciones |
|-----------------|------|--------|-----------|---------------|
| `wf_alta_proyectos_pai` | Workflow | 🔲 | `apps/worker/wrangler.toml` | Binding para workflow de alta de proyectos |
```

---

## Resumen de Cambios

| Recurso | Tipo | Acción | Estado |
|---------|------|--------|--------|
| `wf-alta-proyectos-pai` | Workflows | Crear | 🔲 Por crear |
| `OPENAI_API_KEY` | Secret | Configurar | 🔲 Pendiente |
| `OPENAI_MODEL` | Variable | Configurar | 🔲 Pendiente |
| `prompts-ia/` | R2 subcarpeta | Crear | 🔲 Por crear |
| `00_CrearProyecto.json` | R2 object | Subir | 🔲 Por subir |
| `wf_alta_proyectos_pai` | Binding | Agregar | 🔲 Por agregar |

---

## Comandos Requeridos

```bash
# 1. Configurar secret
cd /workspaces/cbc-endes/apps/worker
npx wrangler secret put OPENAI_API_KEY

# 2. Crear subcarpeta y subir prompt a R2
npx wrangler r2 object put prompts-ia/00_CrearProyecto.json --file <ruta-local-al-archivo>

# 3. Actualizar wrangler.toml (manual o vía commit)

# 4. Deploy del workflow
npx wrangler deploy

# 5. Verificar workflow creado
npx wrangler workflows list
```

---

## Aprobación

| Campo | Valor |
|-------|-------|
| **Aprobado por** | Pendiente |
| **Fecha de aprobación** | Pendiente |
| **Inventariador asignado** | Pendiente |

---

**Nota para el agente `inventariador`**: Una vez aprobada esta solicitud, actualizar `inventario_recursos.md` con los nuevos recursos y cambiar el estado de 🔲 a ✅ según corresponda.
