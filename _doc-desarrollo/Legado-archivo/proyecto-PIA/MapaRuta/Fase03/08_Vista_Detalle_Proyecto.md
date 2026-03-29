# Especificación de la Vista de Detalle de Proyecto PAI

**Fecha:** 27 de marzo de 2026  
**Versión:** 1.0

---

## 1. Introducción

Este documento especifica la estructura y comportamiento de la vista de detalle de un proyecto PAI abierto en el frontend.

## 2. Ubicación y Ruta

**Ruta:** `/proyectos/:id`  
**Página dedicada:** La vista de detalle es una página dedicada accesible desde la sección "Proyectos" del menú dinámico.

## 3. Estructura de la Página

### 3.1. Cabecera del PAI

```
┌──────────────────────────────────────────────────────┐
│ CII + Título + Estado + Acciones               │
└──────────────────────────────────────────────────────┘
```

**Componentes:**
- **CII:** Identificador único del proyecto (Código de Inmueble)
- **Título:** Título del proyecto (del anuncio)
- **Estado:** Estado actual del proyecto (texto)
- **Acciones:** Botones de acción principal (ejecutar análisis, cambiar estado, etc.)

### 3.2. Datos Básicos del Inmueble

**Sección de solo lectura** - Los datos se muestran en formato legible pero no son editables directamente.

```
┌──────────────────────────────────────────────────────┐
│ Portal: [Nombre del portal]                       │
│ URL Fuente: [Enlace al anuncio]                    │
│ Operación: [Venta/Alquiler]                        │
│ Tipo Inmueble: [Tipo de inmueble]                       │
│ Precio: [Precio]                                   │
│ Superficie Total: [m²]                                │
│ Superficie Construida: [m²]                                │
│ Superficie Útil: [m²]                                 │
│ Ciudad: [Ciudad]                                    │
│ Provincia: [Provincia]                                │
│ Barrio: [Barrio/Distrito]                          │
│ Dirección: [Dirección]                               │
│ Fecha Alta: [Fecha de alta]                            │
│ Fecha Análisis: [Fecha de análisis]                      │
└──────────────────────────────────────────────────────┘
```

## 4. Resumen Ejecutivo

```
┌──────────────────────────────────────────────────────┐
│ 📊 Resumen Ejecutivo                            │
└──────────────────────────────────────────────────────┘
```

**Contenido:**
- Breve descripción del análisis generado por IA
- Puntos clave del análisis
- Estado actual del conjunto de datos

## 5. Resultados del Análisis (Pestañas)

### 5.1. Resumen Ejecutivo
- **Archivo:** `resumen-ejecutivo.md`
- **Contenido:** Resumen de 1-2 páginas con los puntos clave del análisis

### 5.2. Datos Transformados
- **Archivo:** `datos-transformados.md`
- **Contenido:** Datos estructurados y transformados del IJSON

### 5.3. Análisis Físico
- **Archivo:** `analisis-fisico.md`
- **Contenido:** Análisis del estado físico del inmueble

### 5.4. Análisis Estratégico
- **Archivo:** `analisis-estrategico.md`
- **Contenido:** Análisis de la posición estratégica del inmueble

### 5.5. Análisis Financiero
- **Archivo:** `analisis-financiero.md`
- **Contenido:** Análisis de la viabilidad financiera del inmueble

### 5.6. Análisis Regulatorio
- **Archivo:** `analisis-regulatorio.md`
- **Contenido:** Análisis del marco regulatorio aplicable

### 5.7. Lectura Inversor
- **Archivo:** `lectura-inversor.md`
- **Contenido:** Lectura del proyecto desde la perspectiva del inversor

### 5.8. Lectura Operador
- **Archivo:** `lectura-operador.md`
- **Contenido:** Lectura del proyecto desde la perspectiva del operador

### 5.9. Lectura Propietario
- **Archivo:** `lectura-propietario.md`
- **Contenido:** Lectura del proyecto desde la perspectiva del propietario

## 6. Notas

### 6.1. Sección de Notas
```
┌──────────────────────────────────────────────────────┐
│ NOTAS / HISTORIAL                               │
└──────────────────────────────────────────────────────┘
```

**Estructura:**
- Lista de notas agrupadas por estado o tipo
- Cada nota muestra: autor, contenido, fecha de creación
- Las notas más recientes aparecen primero

### 6.2. Formulario de Creación
- Botón "Añadir Nota"
- Campos: Tipo de nota (select), Autor (text), Contenido (textarea)
- Se muestra en modal o en línea en la página de detalle

### 6.3. Formulario de Edición
- Botón "Editar" (icono lápiz)
- Solo visible si el estado del proyecto no ha cambiado desde la creación de la nota
- Campos: Contenido (textarea)

## 7. Historial de Ejecución

### 7.1. Sección de Historial
```
┌──────────────────────────────────────────────────────┐
│ PIPELINE DE EJECUCIÓN                            │
└──────────────────────────────────────────────────────┘
```

**Estructura:**
- Línea de tiempo vertical a la izquierda
- Cada evento muestra: paso, nivel, tipo, timestamp
- Colores por nivel: INFO (verde), WARN (amarillo), ERROR (rojo)
- Los eventos más recientes aparecen arriba

**Eventos típicos:**
1. `cambiar_estado` - Cambio manual de estado
2. `ejecutar_analisis` - Inicio de análisis
3. `analisis_completado` - Análisis finalizado
4. `crear_nota` - Nota creada
5. `editar_nota` - Nota editada
6. `reejecutar_analisis` - Re-ejecución de análisis
7. `eliminar_proyecto` - Proyecto eliminado

## 8. Acciones Disponibles

### 8.1. Desde Cabecera
- **Botón "Ejecutar Análisis"** - Solo visible si el proyecto está en estado que permite análisis
- **Botón "Re-ejecutar Análisis"** - Solo visible si ya existe análisis previo
- **Botón "Cambiar Estado"** - Abre modal de cambio de estado

### 8.2. Desde Resultados
- **Botón "Descargar"** - Descargar archivo Markdown individual
- **Botón "Copiar"** - Copiar contenido al portapapeles

## 9. Comportamiento de Navegación

### 9.1. Navegación Principal
- Desde la cabecera: Botón "Volver a la Lista"
- Desde la sección de resultados: Click en cualquier resultado para ver detalles

### 9.2. Navegación de Resultados
- **Pestañas:** Click para expandir/colapsar una pestaña
- **Filtros:** Barra de búsqueda y filtros para refinar resultados

## 10. Estados y Comportamiento

### 10.1. Estado: Análisis Completo
- Todos los resultados están disponibles
- El resumen ejecutivo está completo
- El estado del proyecto cambia a "PENDIENTE_REVISION"

### 10.2. Estado: En Análisis
- El análisis está en progreso
- Los resultados se van generando uno por uno
- Mostrar indicador de carga

### 10.3. Estado: Con Erro
- Si el análisis falla, se muestra mensaje de error
- Los resultados fallidos no se generan

## 11. Referencias

- **API de PAI:** [`Especificacion_API_PAI.md`](../Especificacion_API_PAI.md)
- **Servicio de IA:** [`Servicio_Simulacion_IA.md`](../Servicio_Simulacion_IA.md)
- **Backend Handlers:** [`apps/worker/src/handlers/pai-proyectos.ts`](../../apps/worker/src/handlers/pai-proyectos.ts)

---

**Fin de la Especificación**
