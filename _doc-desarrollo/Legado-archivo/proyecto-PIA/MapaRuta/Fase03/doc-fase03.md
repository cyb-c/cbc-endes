# Documentación Propuesta - FASE 3: Frontend - Interfaz de Usuario

**Fecha:** 27 de marzo de 2026  
**Estado:** PROPUESTA PARA REVISIÓN

---

## Índice

1. [Introducción](#1-introducción)
2. [Documentación Propuesta](#2-documentación-propuesta)

---

## 1. Introducción

Este documento presenta la documentación mínima necesaria para desarrollar correctamente la **FASE 3: Frontend - Interfaz de Usuario** del proyecto PAI.

La FASE 3 se enfoca en implementar la interfaz de usuario para gestionar proyectos PAI, permitiendo a los usuarios:
- Crear nuevos proyectos a partir de IJSON
- Visualizar el detalle de proyectos con sus artefactos y notas
- Ejecutar análisis completos
- Gestionar notas asociadas a proyectos
- Cambiar el estado de proyectos manualmente
- Navegar y filtrar proyectos

---

## 2. Documentación Propuesta

| Nombre del Documento | Descripción | Propósito dentro de FASE 3 | Relación con Documentos Existentes |
|----------------------|-------------|------------------------|----------------------------|
| `03_Migracion_Modulo_Menu.md` | Guía para añadir módulo "Proyectos" al menú dinámico en MOD_modulos_config | Configurar el menú para incluir la sección de Proyectos | `02_SeccionProyectos.md` (referencia en roadmap) |
| `04_Specificacion_API_Frontend.md` | Especificación de cómo el frontend debe consumir los endpoints PAI | Definir estructura de llamadas a API, manejo de estados, errores y validaciones | `Especificacion_API_PAI.md` (backend) |
| `05_Guia_Integracion_API.md` | Guía de integración del frontend con la API de PAI | Explicar patrones de consumo de endpoints, autenticación, y manejo de respuestas | `Especificacion_API_PAI.md` (backend) |
| `06_Formulario_Creacion_Proyecto.md` | Especificación del formulario de creación de proyecto | Definir campos del formulario, validación de IJSON, UX del proceso de creación | `03_SeccionProyectos.md` (referencia en roadmap) |
| `07_Vista_Listado_Proyectos.md` | Especificación de la vista de listado de proyectos | Definir estructura de tabla, filtros, paginación, y comportamiento de navegación | `02_SeccionProyectos.md` (referencia en roadmap) |
| `08_Vista_Detalle_Proyecto.md` | Especificación de la vista de detalle de proyecto PAI | Definir estructura de la página, secciones (cabecera, datos básicos, resumen ejecutivo, resultados del análisis, notas, historial), y comportamiento de navegación | `01_UI.md` (referencia en roadmap) |
| `09_Componente_Notas.md` | Especificación de componentes de notas | Definir estructura de notas, formulario de creación, edición, y comportamiento de editabilidad basado en estado del proyecto | `03_SeccionProyectos.md` (referencia en roadmap) |
| `10_Componente_Modal_Cambio_Estado.md` | Especificación del modal de cambio de estado | Definir estructura del modal, selección de estado, selección de motivo (obligatorio), y comportamiento de confirmación | `03_SeccionProyectos.md` (referencia en roadmap) |
| `11_Estados_Motivos.md` | Especificación de estados y motivos de proyectos | Definir los estados disponibles, motivos de valoración y descarte, y sus relaciones | `004-pai-mvp.sql` y `005-pai-mvp-datos-iniciales.sql` (migraciones) |
| `12_Estructura_Carpetas_Frontend.md` | Guía de estructura de carpetas para el frontend PAI | Definir estructura de carpetas para componentes, hooks, services, y utilidades | `apps/frontend/` (estructura existente) |
| `13_Patrones_Validacion_Formularios.md` | Patrones de validación para formularios PAI | Definir patrones de validación reutilizables para IJSON, campos obligatorios, y formatos | `reglas_proyecto.md` (reglas del proyecto) |

---

## Notas Importantes

### Dependencias con FASE 2
- La FASE 3 depende completamente de que la FASE 2 (Backend - Core Funcional) esté completada.
- Todos los endpoints PAI deben estar implementados y funcionales.
- La base de datos debe tener las tablas PAI creadas con los datos iniciales.

### Consideraciones de Diseño
- El diseño debe seguir los principios establecidos en [`01_UI.md`](../UI_Desglose/01_UI.md)
- Utilizar los componentes existentes del proyecto cuando sea posible.
- Mantener consistencia con el estilo visual actual (Tailwind CSS).

### Próximos Pasos
1. Revisar y aprobar esta documentación propuesta.
2. Crear los documentos especificados.
3. Iniciar el desarrollo de FASE 3.
4. Integrar el frontend con el backend PAI.
5. Ejecutar pruebas end-to-end.

---

**Fin del Documento de Propuesta para FASE 3**
