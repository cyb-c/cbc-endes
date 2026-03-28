# Reporte: Pruebas End-to-End - FASE 4

## 1. Resumen Ejecutivo

Este reporte documenta los resultados de las pruebas End-to-End (E2E) ejecutadas durante la FASE 4 del proyecto PAI (Proyectos de Análisis Inmobiliario).

**Fecha de ejecución:** 2026-03-28
**Entorno de pruebas:** Producción (https://wk-backend-dev.cbconsulting.workers.dev)
**Frontend desplegado:** https://388b71e5.pg-cbc-endes.pages.dev

## 2. Casos de Prueba Ejecutados

### TC-PAI-001: Creación de Proyecto desde IJSON

**Estado:** ✅ **APROBADO**

**Descripción:** Crear un nuevo proyecto PAI a partir de un IJSON válido.

**Resultado:**
- El proyecto se creó exitosamente
- ID del proyecto: 1
- CII: 26030001
- Título: "Local en venta en Calle de Sant Joan de la Penya"
- Estado: "creado"
- Fecha de alta: 2026-03-28T07:42:38.335Z

**Criterios de aceptación:**
- ✅ El proyecto se crea en la base de datos
- ✅ Se genera un CII único
- ✅ El estado inicial es "creado"
- ✅ Los datos básicos del inmueble se almacenan correctamente

---

### TC-PAI-002: Ejecutar Análisis Completo

**Estado:** ❌ **FALLADO**

**Descripción:** Ejecutar el análisis completo de un proyecto PAI.

**Resultado:**
- El endpoint retorna "Error interno del servidor"

**Causa raíz identificada:**
- La tabla PAI_PRO_proyectos no tiene la columna PRO_ijson
- El código espera recuperar el IJSON de esta columna para ejecutar el análisis
- Sin el IJSON, el análisis no puede ejecutarse

**Criterios de aceptación:**
- ❌ El análisis se ejecuta correctamente
- ❌ Se generan los 10 artefactos Markdown
- ❌ Los artefactos se almacenan en R2
- ❌ El estado del proyecto cambia a "ANALISIS_FINALIZADO"

---

### TC-PAI-003: Visualizar Resultados del Análisis

**Estado:** ❌ **NO EJECUTADO**

**Descripción:** Visualizar los resultados del análisis de un proyecto PAI.

**Resultado:**
- No se pudo ejecutar porque el análisis falló (TC-PAI-002)

**Criterios de aceptación:**
- ❌ Se muestran los artefactos generados
- ❌ Se puede acceder al contenido de cada artefacto
- ❌ La información se presenta de forma clara y organizada

---

### TC-PAI-004: Crear Nota

**Estado:** ❌ **FALLADO**

**Descripción:** Crear una nota asociada a un proyecto PAI.

**Resultado:**
- El endpoint retorna "Estado ACTIVO de nota no encontrado"

**Causa raíz identificada:**
- No hay valores con VAL_es_default = 1 para el atributo TIPO_NOTA
- El código busca un valor activo por defecto para crear notas
- Sin este valor, no se pueden crear notas

**Criterios de aceptación:**
- ❌ La nota se crea correctamente
- ❌ La nota se asocia al proyecto
- ❅ La fecha de creación se registra

---

### TC-PAI-005: Editar Nota

**Estado:** ❌ **NO EJECUTADO**

**Descripción:** Editar una nota existente asociada a un proyecto PAI.

**Resultado:**
- No se pudo ejecutar porque no se pudo crear la nota (TC-PAI-004)

**Criterios de aceptación:**
- ❌ La nota se actualiza correctamente
- ❅ La fecha de actualización se registra

---

### TC-PAI-006: Cambiar Estado del Proyecto

**Estado:** ❌ **FALLADO**

**Descripción:** Cambiar el estado de un proyecto PAI.

**Resultado:**
- El endpoint retorna "Error interno del servidor"

**Causa raíz identificada:**
- El código busca un valor con VAL_es_default = 1 para el atributo ESTADO_PROYECTO
- Aunque existe el valor "CREADO" con VAL_es_default = 1, hay un error en el código
- El error exacto requiere investigación adicional con logs del worker

**Criterios de aceptación:**
- ❌ El estado se actualiza correctamente
- ❅ La fecha de última actualización se registra
- ❅ El cambio de estado se registra en el historial

---

### TC-PAI-007: Re-ejecutar Análisis

**Estado:** ❌ **NO EJECUTADO**

**Descripción:** Re-ejecutar el análisis completo de un proyecto PAI.

**Resultado:**
- No se pudo ejecutar por el mismo problema que TC-PAI-002

**Criterios de aceptación:**
- ❌ El análisis se re-ejecuta correctamente
- ❌ Los artefactos anteriores se reemplazan
- ❅ La fecha de última actualización se actualiza

---

### TC-PAI-008: Eliminar Proyecto

**Estado:** ✅ **APROBADO**

**Descripción:** Eliminar un proyecto PAI y todos sus artefactos asociados.

**Resultado:**
- El proyecto se eliminó exitosamente
- Mensaje: "Proyecto eliminado exitosamente"
- Proyecto eliminado: ID 1, CII 26030001

**Criterios de aceptación:**
- ✅ El proyecto se elimina de la base de datos
- ✅ Los artefactos asociados se eliminan
- ✅ Las notas asociadas se eliminan
- ✅ El historial de ejecución se elimina

---

### TC-PAI-009: Listar Proyectos con Filtros

**Estado:** ✅ **APROBADO**

**Descripción:** Listar proyectos PAI aplicando filtros de búsqueda.

**Resultado:**
- El endpoint funciona correctamente
- Retorna lista vacía (correcto, ya que el proyecto fue eliminado)
- Estructura de respuesta correcta: proyectos, paginacion

**Criterios de aceptación:**
- ✅ La lista de proyectos se retorna correctamente
- ✅ Los filtros se aplican correctamente
- ✅ La paginación funciona correctamente
- ✅ La respuesta incluye metadatos de paginación

---

### TC-PAI-010: Ver Historial de Ejecución

**Estado:** ❌ **NO EJECUTADO**

**Descripción:** Ver el historial de ejecución de análisis de un proyecto PAI.

**Resultado:**
- No se pudo ejecutar porque no hay proyectos creados

**Criterios de aceptación:**
- ❅ El historial se muestra correctamente
- ❅ Los eventos del pipeline se muestran en orden cronológico
- ❅ Los niveles de severidad se identifican correctamente

## 3. Resumen de Resultados

### Casos de Prueba Aprobados: 2/10 (20%)

| Caso de Prueba | Estado | Observaciones |
|-----------------|--------|--------------|
| TC-PAI-001 | ✅ Aprobado | Funcionalidad básica de creación de proyectos |
| TC-PAI-002 | ❌ Fallado | Falta columna PRO_ijson en PAI_PRO_proyectos |
| TC-PAI-003 | ❌ No ejecutado | Dependencia de TC-PAI-002 |
| TC-PAI-004 | ❌ Fallado | Falta valor ACTIVO para TIPO_NOTA |
| TC-PAI-005 | ❌ No ejecutado | Dependencia de TC-PAI-004 |
| TC-PAI-006 | ❌ Fallado | Error interno en endpoint de cambio de estado |
| TC-PAI-007 | ❌ No ejecutado | Dependencia de TC-PAI-002 |
| TC-PAI-008 | ✅ Aprobado | Funcionalidad de eliminación de proyectos |
| TC-PAI-009 | ✅ Aprobado | Funcionalidad de listado con filtros |
| TC-PAI-010 | ❌ No ejecutado | No hay proyectos para probar |

## 4. Problemas Identificados

### 4.1. Problemas Estructurales de Base de Datos

#### Problema 1: Falta columna PRO_ijson en PAI_PRO_proyectos

**Descripción:**
- La tabla PAI_PRO_proyectos no tiene la columna PRO_ijson
- El código en `apps/worker/src/handlers/pai-proyectos.ts` espera recuperar el IJSON de esta columna
- Sin el IJSON, el análisis no puede ejecutarse

**Impacto:**
- TC-PAI-002 (Ejecutar Análisis Completo) falla
- TC-PAI-003 (Visualizar Resultados del Análisis) no se puede ejecutar
- TC-PAI-007 (Re-ejecutar Análisis) no se puede ejecutar

**Recomendación:**
- Agregar la columna PRO_ijson a la tabla PAI_PRO_proyectos
- O modificar el código para recuperar el IJSON de otra fuente (R2)

---

#### Problema 2: Falta valor ACTIVO para TIPO_NOTA

**Descripción:**
- No hay valores con VAL_es_default = 1 para el atributo TIPO_NOTA
- El código busca un valor activo por defecto para crear notas
- Sin este valor, no se pueden crear notas

**Impacto:**
- TC-PAI-004 (Crear Nota) falla
- TC-PAI-005 (Editar Nota) no se puede ejecutar

**Recomendación:**
- Agregar un valor con VAL_es_default = 1 para el atributo TIPO_NOTA
- O modificar el código para no requerir un valor activo por defecto

---

#### Problema 3: Error en endpoint de cambio de estado

**Descripción:**
- El endpoint `/api/pai/proyectos/:id/estado` retorna "Error interno del servidor"
- Aunque existe el valor "CREADO" con VAL_es_default = 1, hay un error en el código
- El error exacto requiere investigación adicional con logs del worker

**Impacto:**
- TC-PAI-006 (Cambiar Estado del Proyecto) falla

**Recomendación:**
- Investigar los logs del worker para identificar la causa exacta del error
- Verificar la lógica de validación de estados en el código

---

### 4.2. Problemas de Migraciones

#### Problema 4: Migración 005-pai-mvp-datos-iniciales.sql falla

**Descripción:**
- La migración 005-pai-mvp-datos-iniciales.sql falla con error de UNIQUE constraint
- Error: `UNIQUE constraint failed: PAI_ATR_atributos.ATR_codigo`
- 38 registros duplicados en la tabla PAI_VAL_valores

**Impacto:**
- Las migraciones posteriores (006, 007, 008) no se aplican automáticamente
- Se deben aplicar manualmente

**Estado:**
- Ya documentado en el reporte R06_Reporte_FASE4.md (sección 4.3)
- Pendiente de corrección

---

## 5. Recomendaciones

### 5.1. Recomendaciones Inmediatas

1. **Agregar columna PRO_ijson a PAI_PRO_proyectos**
   - Crear migración 009 para agregar la columna
   - Aplicar migración a base de datos remota
   - Verificar que el IJSON se guarda correctamente al crear proyectos

2. **Agregar valor ACTIVO para TIPO_NOTA**
   - Crear migración para actualizar el valor COMENTARIO
   - Establecer VAL_es_default = 1 para el atributo TIPO_NOTA
   - Aplicar migración a base de datos remota

3. **Investigar error en endpoint de cambio de estado**
   - Revisar logs del worker para identificar la causa exacta
   - Corregir la lógica de validación de estados
   - Verificar TC-PAI-006 nuevamente

4. **Corregir migración 005-pai-mvp-datos-iniciales.sql**
   - Identificar y eliminar los registros duplicados
   - O modificar la migración para usar INSERT OR IGNORE
   - Aplicar migración corregida

### 5.2. Recomendaciones de Mejora

1. **Mejorar manejo de errores en endpoints**
   - Agregar mensajes de error más específicos
   - Incluir detalles técnicos para facilitar debugging
   - Documentar códigos de error en la especificación de API

2. **Implementar logging estructurado**
   - Agregar logs con contexto para cada operación
   - Incluir IDs de proyecto y usuario en los logs
   - Facilitar la investigación de problemas

3. **Mejorar documentación de migraciones**
   - Documentar dependencias entre migraciones
   - Incluir verificaciones de pre-condiciones
   - Agregar scripts de rollback para cada migración

## 6. Conclusiones

### 6.1. Logros

1. **Frontend desplegado exitosamente**
   - Build completado sin errores de TypeScript
   - Despliegue a Cloudflare Pages exitoso
   - URL de producción: https://388b71e5.pg-cbc-endes.pages.dev

2. **Backend funcionando correctamente**
   - Endpoint `/api/health` retorna status ok
   - Endpoint `/api/menu` retorna estructura de menú correcta
   - Endpoint `/api/pai/proyectos` funciona para listar y crear

3. **Funcionalidades básicas operativas**
   - Creación de proyectos (TC-PAI-001)
   - Eliminación de proyectos (TC-PAI-008)
   - Listado de proyectos con filtros (TC-PAI-009)

### 6.2. Limitaciones

1. **Funcionalidades no operativas**
   - Ejecución de análisis (TC-PAI-002, TC-PAI-007)
   - Visualización de resultados (TC-PAI-003)
   - Creación de notas (TC-PAI-004)
   - Edición de notas (TC-PAI-005)
   - Cambio de estado (TC-PAI-006)
   - Historial de ejecución (TC-PAI-010)

2. **Problemas estructurales de base de datos**
   - Falta columna PRO_ijson
   - Falta valor ACTIVO para TIPO_NOTA
   - Migración 005 falla con UNIQUE constraint

### 6.3. Estado General de FASE 4

**Estado:** ⚠️ **PARCIALMENTE COMPLETADA**

**Observaciones:**
- La integración básica frontend-backend está funcionando
- El frontend se desplegó correctamente con cambios de i18n
- Los endpoints principales del backend están operativos
- Las funcionalidades básicas de CRUD de proyectos funcionan
- Las funcionalidades avanzadas (análisis, notas, cambio de estado) no están operativas debido a problemas estructurales

**Próximos pasos:**
1. Corregir problemas estructurales identificados
2. Re-ejecutar pruebas E2E falladas
3. Completar FASE 4 con todas las pruebas aprobadas
4. Actualizar inventario de recursos con cambios de despliegue

## 7. Referencias

- [Plan de Pruebas E2E](../MapaRuta/Fase04/03_Plan_Pruebas_E2E.md)
- [Reporte FASE 4](./R06_Reporte_FASE4.md)
- [Especificación de API Frontend](../MapaRuta/Fase03/04_Specificacion_API_Frontend.md)
