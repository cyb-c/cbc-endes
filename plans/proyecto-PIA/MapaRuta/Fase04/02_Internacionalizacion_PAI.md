# Internacionalización del Módulo PAI

**Fecha:** 28 de marzo de 2026  
**Fase:** FASE 4 - Integración y Pruebas  
**Versión:** 1.0

---

## Índice

1. [Introducción](#1-introducción)
2. [Estado Actual](#2-estado-actual)
3. [Estructura de i18n](#3-estructura-de-i18n)
4. [Textos del Módulo PAI](#4-textos-del-módulo-pai)
5. [Implementación](#5-implementación)
6. [Próximos Pasos](#6-próximos-pasos)

---

## 1. Introducción

Este documento define todos los textos necesarios para el módulo PAI en español, organizados por componente y funcionalidad.

### Objetivos

- Definir todos los textos necesarios para el módulo PAI
- Organizar los textos por componente y funcionalidad
- Preparar la estructura para soportar múltiples idiomas en el futuro

### Reglas del Proyecto Aplicables

- **R5 (Idioma y estilo)**: Mensajes al usuario (i18n) en español de España
- **R5 (Idioma y estilo)**: Sistema multidioma con `es-ES` por defecto

---

## 2. Estado Actual

### 2.1. Archivo es-ES.ts Existente

El archivo [`apps/frontend/src/i18n/es-ES.ts`](../../../apps/frontend/src/i18n/es-ES.ts:1) actualmente contiene solo textos del menú:

```typescript
export const MENU_TEXTS: Record<string, string> = {
  // Módulos
  'menu.modulos.panel': 'Panel',
  'menu.modulos.facturacion': 'Facturación',
  'menu.modulos.proyectos': 'Proyectos',
  // ... más textos del menú
};
```

### 2.2. Textos Faltantes

No hay textos específicos del módulo PAI para:
- Página de listado de proyectos
- Página de detalle de proyecto
- Componentes de notas
- Modal de cambio de estado
- Formularios de creación/edición
- Mensajes de error y éxito
- Estados y motivos

---

## 3. Estructura de i18n

### 3.1. Organización de Textos

Los textos se organizarán en las siguientes categorías:

| Categoría | Prefijo | Descripción |
|-----------|---------|-------------|
| Módulos | `pai.modulos` | Nombres de módulos |
| Funciones | `pai.funciones` | Nombres de funciones |
| Páginas | `pai.paginas` | Títulos y descripciones de páginas |
| Componentes | `pai.componentes` | Textos de componentes |
| Formularios | `pai.formularios` | Labels y placeholders de formularios |
| Botones | `pai.botones` | Textos de botones |
| Mensajes | `pai.mensajes` | Mensajes de éxito, error, información |
| Estados | `pai.estados` | Nombres de estados |
| Motivos | `pai.motivos` | Nombres de motivos |
| Validaciones | `pai.validaciones` | Mensajes de validación |

### 3.2. Estructura del Archivo

```typescript
// apps/frontend/src/i18n/es-ES.ts

export const MENU_TEXTS: Record<string, string> = {
  // Textos existentes del menú
};

export const PAI_TEXTS: Record<string, string> = {
  // Módulos
  'pai.modulos.proyectos': 'Proyectos',

  // Funciones
  'pai.funciones.listar_proyectos': 'Listar Proyectos',
  'pai.funciones.crear_proyecto': 'Crear Proyecto',
  // ... más textos
};
```

---

## 4. Textos del Módulo PAI

### 4.1. Módulos

| Clave | Texto |
|-------|-------|
| `pai.modulos.proyectos` | Proyectos |

### 4.2. Funciones

| Clave | Texto |
|-------|-------|
| `pai.funciones.listar_proyectos` | Listar Proyectos |
| `pai.funciones.crear_proyecto` | Crear Proyecto |
| `pai.funciones.detalle_proyecto` | Ver Detalle |
| `pai.funciones.ejecutar_analisis` | Ejecutar Análisis |
| `pai.funciones.ver_artefactos` | Ver Artefactos |
| `pai.funciones.cambiar_estado` | Cambiar Estado |
| `pai.funciones.eliminar_proyecto` | Eliminar Proyecto |
| `pai.funciones.ver_historial` | Ver Historial |

### 4.3. Páginas

| Clave | Texto |
|-------|-------|
| `pai.paginas.listar_proyectos.titulo` | Proyectos PAI |
| `pai.paginas.listar_proyectos.descripcion` | Gestión de proyectos de análisis inmobiliario |
| `pai.paginas.detalle_proyecto.titulo` | Detalle del Proyecto |
| `pai.paginas.detalle_proyecto.descripcion` | Información detallada y análisis del inmueble |

### 4.4. Componentes

#### Lista de Proyectos

| Clave | Texto |
|-------|-------|
| `pai.componentes.lista_proyectos.vacio` | No hay proyectos aún. Crea el primero. |
| `pai.componentes.lista_proyectos.cargando` | Cargando proyectos... |
| `pai.componentes.lista_proyectos.error` | Error al cargar proyectos |

#### Tabla de Proyectos

| Clave | Texto |
|-------|-------|
| `pai.componentes.tabla_proyectos.columna.id` | ID |
| `pai.componentes.tabla_proyectos.columna.cii` | CII |
| `pai.componentes.tabla_proyectos.columna.titulo` | Título |
| `pai.componentes.tabla_proyectos.columna.estado` | Estado |
| `pai.componentes.tabla_proyectos.columna.tipo` | Tipo |
| `pai.componentes.tabla_proyectos.columna.ciudad` | Ciudad |
| `pai.componentes.tabla_proyectos.columna.fecha` | Fecha |
| `pai.componentes.tabla_proyectos.columna.acciones` | Acciones |
| `pai.componentes.tabla_proyectos.accion.ver` | Ver |

#### Cabecera del Proyecto

| Clave | Texto |
|-------|-------|
| `pai.componentes.cabecera_proyecto.cii` | CII |
| `pai.componentes.cabecera_proyecto.estado` | Estado |

#### Datos Básicos

| Clave | Texto |
|-------|-------|
| `pai.componentes.datos_basicos.titulo` | Datos Básicos del Inmueble |
| `pai.componentes.datos_basicos.portal` | Portal |
| `pai.componentes.datos_basicos.url_fuente` | URL Fuente |
| `pai.componentes.datos_basicos.tipo_operacion` | Tipo de Operación |
| `pai.componentes.datos_basicos.tipo_inmueble` | Tipo de Inmueble |
| `pai.componentes.datos_basicos.precio` | Precio |
| `pai.componentes.datos_basicos.precio_por_m2` | Precio por m² |
| `pai.componentes.datos_basicos.superficie_total` | Superficie Total |
| `pai.componentes.datos_basicos.superficie_construida` | Superficie Construida |
| `pai.componentes.datos_basicos.superficie_util` | Superficie Útil |
| `pai.componentes.datos_basicos.ciudad` | Ciudad |
| `pai.componentes.datos_basicos.provincia` | Provincia |
| `pai.componentes.datos_basicos.barrio` | Barrio |
| `pai.componentes.datos_basicos.direccion` | Dirección |
| `pai.componentes.datos_basicos.fecha_alta` | Fecha de Alta |
| `pai.componentes.datos_basicos.fecha_ultima_actualizacion` | Última Actualización |

#### Resultados del Análisis

| Clave | Texto |
|-------|-------|
| `pai.componentes.resultados_analisis.titulo` | Resultados del Análisis |
| `pai.componentes.resultados_analisis.pestana.resumen_ejecutivo` | Resumen Ejecutivo |
| `pai.componentes.resultados_analisis.pestana.datos_transformados` | Datos Transformados |
| `pai.componentes.resultados_analisis.pestana.analisis_fisico` | Análisis Físico |
| `pai.componentes.resultados_analisis.pestana.analisis_estrategico` | Análisis Estratégico |
| `pai.componentes.resultados_analisis.pestana.analisis_financiero` | Análisis Financiero |
| `pai.componentes.resultados_analisis.pestana.analisis_regulatorio` | Análisis Regulatorio |
| `pai.componentes.resultados_analisis.pestana.lectura_inversor` | Lectura Inversor |
| `pai.componentes.resultados_analisis.pestana.lectura_operador` | Lectura Operador |
| `pai.componentes.resultados_analisis.pestana.lectura_propietario` | Lectura Propietario |

#### Notas

| Clave | Texto |
|-------|-------|
| `pai.componentes.notas.titulo` | Notas |
| `pai.componentes.notas.sin_notas` | No hay notas para este proyecto |
| `pai.componentes.notas.cargando` | Cargando notas... |
| `pai.componentes.notas.error` | Error al cargar notas |
| `pai.componentes.notas.tipo.comentario` | Comentario |
| `pai.componentes.notas.tipo.valoracion` | Valoración |
| `pai.componentes.notas.tipo.decision` | Decisión |
| `pai.componentes.notas.tipo.correccion_ia` | Corrección IA |
| `pai.componentes.notas.autor` | Autor |
| `pai.componentes.notas.fecha` | Fecha |
| `pai.componentes.notas.contenido` | Contenido |

### 4.5. Formularios

#### Crear Proyecto

| Clave | Texto |
|-------|-------|
| `pai.formularios.crear_proyecto.titulo` | Crear Nuevo Proyecto PAI |
| `pai.formularios.crear_proyecto.descripcion` | Pega el contenido JSON del anuncio inmobiliario para crear un nuevo proyecto |
| `pai.formularios.crear_proyecto.label.ijson` | IJSON del Inmueble |
| `pai.formularios.crear_proyecto.placeholder.ijson` | '{"titulo": "...", ...}' |
| `pai.formularios.crear_proyecto.boton.crear` | Crear Proyecto |
| `pai.formularios.crear_proyecto.boton.cancelar` | Cancelar |

#### Crear Nota

| Clave | Texto |
|-------|-------|
| `pai.formularios.crear_nota.titulo` | Añadir Nota |
| `pai.formularios.crear_nota.label.tipo` | Tipo de Nota |
| `pai.formularios.crear_nota.label.autor` | Autor |
| `pai.formularios.crear_nota.label.contenido` | Contenido |
| `pai.formularios.crear_nota.placeholder.contenido` | Escribe tu nota aquí... |
| `pai.formularios.crear_nota.boton.guardar` | Guardar Nota |
| `pai.formularios.crear_nota.boton.cancelar` | Cancelar |

#### Editar Nota

| Clave | Texto |
|-------|-------|
| `pai.formularios.editar_nota.titulo` | Editar Nota |
| `pai.formularios.editar_nota.label.contenido` | Contenido |
| `pai.formularios.editar_nota.placeholder.contenido` | Escribe tu nota aquí... |
| `pai.formularios.editar_nota.boton.guardar` | Guardar Cambios |
| `pai.formularios.editar_nota.boton.cancelar` | Cancelar |

#### Cambiar Estado

| Clave | Texto |
|-------|-------|
| `pai.formularios.cambiar_estado.titulo` | Cambiar Estado del Proyecto |
| `pai.formularios.cambiar_estado.label.estado` | Nuevo Estado |
| `pai.formularios.cambiar_estado.label.motivo` | Motivo |
| `pai.formularios.cambiar_estado.label.descripcion` | Descripción |
| `pai.formularios.cambiar_estado.placeholder.descripcion` | Describe el motivo del cambio de estado... |
| `pai.formularios.cambiar_estado.boton.cambiar` | Cambiar Estado |
| `pai.formularios.cambiar_estado.boton.cancelar` | Cancelar |

### 4.6. Botones

| Clave | Texto |
|-------|-------|
| `pai.botones.crear_proyecto` | Crear Proyecto |
| `pai.botones.ejecutar_analisis` | Ejecutar Análisis |
| `pai.botones.cambiar_estado` | Cambiar Estado |
| `pai.botones.eliminar_proyecto` | Eliminar Proyecto |
| `pai.botones.ver_historial` | Ver Historial |
| `pai.botones.anadir_nota` | Añadir Nota |
| `pai.botones.editar_nota` | Editar |
| `pai.botones.eliminar_nota` | Eliminar |
| `pai.botones.reintentar` | Reintentar |
| `pai.botones.confirmar` | Confirmar |
| `pai.botones.cancelar` | Cancelar |

### 4.7. Mensajes

#### Éxito

| Clave | Texto |
|-------|-------|
| `pai.mensajes.exito.proyecto_creado` | Proyecto creado correctamente |
| `pai.mensajes.exito.proyecto_actualizado` | Proyecto actualizado correctamente |
| `pai.mensajes.exito.proyecto_eliminado` | Proyecto eliminado correctamente |
| `pai.mensajes.exito.analisis_ejecutado` | Análisis ejecutado correctamente |
| `pai.mensajes.exito.estado_cambiado` | Estado cambiado correctamente |
| `pai.mensajes.exito.nota_creada` | Nota creada correctamente |
| `pai.mensajes.exito.nota_editada` | Nota editada correctamente |
| `pai.mensajes.exito.nota_eliminada` | Nota eliminada correctamente |

#### Error

| Clave | Texto |
|-------|-------|
| `pai.mensajes.error.proyecto_no_creado` | Error al crear el proyecto |
| `pai.mensajes.error.proyecto_no_actualizado` | Error al actualizar el proyecto |
| `pai.mensajes.error.proyecto_no_eliminado` | Error al eliminar el proyecto |
| `pai.mensajes.error.analisis_no_ejecutado` | Error al ejecutar el análisis |
| `pai.mensajes.error.estado_no_cambiado` | Error al cambiar el estado |
| `pai.mensajes.error.nota_no_creada` | Error al crear la nota |
| `pai.mensajes.error.nota_no_editada` | Error al editar la nota |
| `pai.mensajes.error.nota_no_eliminada` | Error al eliminar la nota |
| `pai.mensajes.error.proyecto_no_encontrado` | Proyecto no encontrado |
| `pai.mensajes.error.ijson_invalido` | El IJSON no tiene el formato correcto |
| `pai.mensajes.error.conexion` | Error de conexión con el servidor |

#### Información

| Clave | Texto |
|-------|-------|
| `pai.mensajes.info.nota_no_editable` | Esta nota no se puede editar porque el estado del proyecto ha cambiado |
| `pai.mensajes.info.analisis_en_proceso` | El análisis está en proceso de ejecución |
| `pai.mensajes.info.proyecto_descartado` | Este proyecto ha sido descartado |

#### Confirmación

| Clave | Texto |
|-------|-------|
| `pai.mensajes.confirmacion.eliminar_proyecto` | ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer. |
| `pai.mensajes.confirmacion.eliminar_nota` | ¿Estás seguro de que deseas eliminar esta nota? |

### 4.8. Estados

| Clave | Texto |
|-------|-------|
| `pai.estados.creado` | Creado |
| `pai.estados.en_analisis` | En análisis |
| `pai.estados.pendiente_revision` | Pendiente de revisión |
| `pai.estados.evaluando_viabilidad` | Evaluando viabilidad |
| `pai.estados.evaluando_plan_negocio` | Evaluando Plan de Negocio |
| `pai.estados.seguimiento_comercial` | Seguimiento comercial |
| `pai.estados.descartado` | Descartado |
| `pai.estados.aprobado` | Aprobado |
| `pai.estados.analisis_con_error` | Análisis con error |

### 4.9. Motivos

#### Motivos de Valoración

| Clave | Texto |
|-------|-------|
| `pai.motivos.valoracion.sentido_negocio_real` | Sentido de negocio real |
| `pai.motivos.valoracion.infrautilizado` | Infrautilizado |
| `pai.motivos.valoracion.uso_economico_razonable` | Uso económico razonable |
| `pai.motivos.valoracion.mantener` | Conviene mantener |
| `pai.motivos.valoracion.transformar` | Conviene transformar |
| `pai.motivos.valoracion.reconversion_defendible_valencia` | Reconversión defendible en València |

#### Motivos de Descarte

| Clave | Texto |
|-------|-------|
| `pai.motivos.descarte.sin_sentido_negocio_real` | Sin sentido de negocio real |
| `pai.motivos.descarte.no_infrautilizado_ni_mejorable` | Sin infrautilización relevante |
| `pai.motivos.descarte.sin_uso_economico_razonable` | Sin uso económico razonable |
| `pai.motivos.descarte.no_conviene_mantener` | No conviene mantener |
| `pai.motivos.descarte.no_conviene_transformar` | No conviene transformar |
| `pai.motivos.descarte.reconversion_no_defendible_valencia` | Reconversión no defendible |
| `pai.motivos.descarte.hipotesis_atractiva_no_sostenible` | Hipótesis atractiva no sostenible |
| `pai.motivos.descarte.hipotesis_no_sostenible` | Hipótesis no sostenible |

### 4.10. Validaciones

| Clave | Texto |
|-------|-------|
| `pai.validaciones.ijson_requerido` | El IJSON es obligatorio |
| `pai.validaciones.ijson_invalido` | El IJSON no tiene el formato JSON válido |
| `pai.validaciones.ijson_campos_faltantes` | El IJSON no tiene los campos obligatorios |
| `pai.validaciones.tipo_nota_requerido` | El tipo de nota es obligatorio |
| `pai.validaciones.autor_requerido` | El autor es obligatorio |
| `pai.validaciones.contenido_requerido` | El contenido es obligatorio |
| `pai.validaciones.estado_requerido` | El estado es obligatorio |
| `pai.validaciones.motivo_requerido` | El motivo es obligatorio |

---

## 5. Implementación

### 5.1. Actualización del Archivo es-ES.ts

Actualizar el archivo [`apps/frontend/src/i18n/es-ES.ts`](../../../apps/frontend/src/i18n/es-ES.ts:1) con los textos definidos:

```typescript
// apps/frontend/src/i18n/es-ES.ts

export const MENU_TEXTS: Record<string, string> = {
  // Textos existentes del menú
};

export const PAI_TEXTS: Record<string, string> = {
  // Módulos
  'pai.modulos.proyectos': 'Proyectos',

  // Funciones
  'pai.funciones.listar_proyectos': 'Listar Proyectos',
  'pai.funciones.crear_proyecto': 'Crear Proyecto',
  // ... resto de textos
};
```

### 5.2. Función de Traducción

Crear una función de traducción simple:

```typescript
// apps/frontend/src/i18n/index.ts

import { PAI_TEXTS, MENU_TEXTS } from './es-ES';

export function t(key: string): string {
  // Buscar en PAI_TEXTS primero
  if (key in PAI_TEXTS) {
    return PAI_TEXTS[key];
  }
  
  // Buscar en MENU_TEXTS
  if (key in MENU_TEXTS) {
    return MENU_TEXTS[key];
  }
  
  // Retornar la clave si no se encuentra
  return key;
}
```

### 5.3. Uso en Componentes

```typescript
// apps/frontend/src/pages/proyectos/ListarProyectos.tsx

import { t } from '../../i18n';

export function ListarProyectos() {
  return (
    <div>
      <h1>{t('pai.paginas.listar_proyectos.titulo')}</h1>
      <p>{t('pai.paginas.listar_proyectos.descripcion')}</p>
    </div>
  );
}
```

---

## 6. Próximos Pasos

1. Actualizar el archivo [`apps/frontend/src/i18n/es-ES.ts`](../../../apps/frontend/src/i18n/es-ES.ts:1) con todos los textos definidos
2. Crear la función de traducción en [`apps/frontend/src/i18n/index.ts`](../../../apps/frontend/src/i18n/index.ts:1)
3. Actualizar todos los componentes del módulo PAI para usar la función de traducción
4. Verificar que todos los textos se muestran correctamente en la interfaz

---

## Referencias

- [`es-ES.ts`](../../../apps/frontend/src/i18n/es-ES.ts:1) - Archivo de textos actual
- [`reglas_proyecto.md`](../../../.governance/reglas_proyecto.md:1) - Reglas del proyecto (R5: Idioma y estilo)
- [`04_Specificacion_API_Frontend.md`](../Fase03/04_Specificacion_API_Frontend.md:1) - Especificación de interfaces TypeScript

---

**Fin del Documento - Internacionalización del Módulo PAI**
