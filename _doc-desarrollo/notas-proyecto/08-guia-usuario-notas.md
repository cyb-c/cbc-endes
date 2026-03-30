# Guía de Usuario - Sistema de Notas PAI

## Índice de Contenido

1. [Introducción](#1-introducción)
2. [¿Qué son las Notas PAI?](#2-qué-son-las-notas-pai)
3. [Crear una Nota](#3-crear-una-nota)
4. [Editar una Nota](#4-editar-una-nota)
5. [Eliminar una Nota](#5-eliminar-una-nota)
6. [¿Por Qué una Nota No es Editable?](#6-por-qué-una-nota-no-es-editable)
7. [Mejores Prácticas](#7-mejores-prácticas)
8. [Preguntas Frecuentes](#8-preguntas-frecuentes)

---

## 1. Introducción

Esta guía explica cómo utilizar el Sistema de Notas PAI (Proyectos de Análisis Inmobiliario) para agregar, editar y eliminar notas en tus proyectos de análisis inmobiliario.

**Público objetivo:** Usuarios del sistema PAI que necesitan documentar observaciones, valoraciones y decisiones sobre proyectos.

---

## 2. ¿Qué son las Notas PAI?

Las **Notas PAI** son comentarios, valoraciones, decisiones o correcciones que puedes asociar a un proyecto de análisis inmobiliario.

### 2.1. Tipos de Notas

| Tipo | Descripción | Cuándo Usar |
|------|-------------|-------------|
| **Comentario** | Observación general sobre el proyecto | Para cualquier observación que quieras registrar |
| **Valoración** | Evaluación o juicio sobre algún aspecto | Para valorar la calidad, viabilidad, etc. |
| **Decisión** | Decisión tomada sobre el proyecto | Para registrar decisiones importantes |
| **Corrección IA** | Corrección para el análisis de IA | Para corregir o mejorar el análisis automático |

### 2.2. Campos de una Nota

| Campo | Descripción | Requerido |
|-------|-------------|-----------|
| **Tipo** | Tipo de nota (Comentario, Valoración, etc.) | ✅ Sí |
| **Autor** | Nombre de quien crea la nota | ✅ Sí |
| **Asunto** | Título o resumen breve | ✅ Sí |
| **Contenido** | Contenido completo de la nota | ✅ Sí |

---

## 3. Crear una Nota

### 3.1. Pasos para Crear una Nota

1. **Navega al proyecto**
   - Ve a `/proyectos/{id}` donde `{id}` es el ID del proyecto

2. **Click en "Agregar Nota"**
   - Se abrirá el formulario de creación

3. **Completa los campos:**

   **Tipo de Nota:**
   - Selecciona el tipo apropiado del dropdown
   - Opciones: Comentario, Valoración, Decisión, Corrección IA

   **Autor:**
   - Escribe tu nombre o identificador
   - Mínimo 2 caracteres, máximo 100 caracteres

   **Asunto:**
   - Escribe un título breve y descriptivo
   - Mínimo 3 caracteres, máximo 200 caracteres
   - Ejemplo: "Revisión estructural", "Observación de ubicación"

   **Contenido:**
   - Escribe el contenido completo de la nota
   - Mínimo 10 caracteres, máximo 5000 caracteres
   - Sé claro y específico

4. **Click en "Guardar Nota"**
   - La nota se guardará y aparecerá en la lista

### 3.2. Ejemplo de Nota

```
Tipo: Comentario
Autor: Juan Pérez
Asunto: Grieta en pared principal
Contenido: Se observa grieta en pared principal de aproximadamente 2mm de ancho, 
           ubicada en la fachada norte. Se recomienda evaluación estructural 
           detallada para determinar causa y solución.
```

### 3.3. Validaciones

El sistema validará automáticamente:

| Campo | Validación | Mensaje de Error |
|-------|------------|------------------|
| Autor | 2-100 caracteres | "El autor debe tener al menos 2 caracteres" |
| Asunto | 3-200 caracteres | "El asunto debe tener al menos 3 caracteres" |
| Contenido | 10-5000 caracteres | "El contenido debe tener al menos 10 caracteres" |

---

## 4. Editar una Nota

### 4.1. Pasos para Editar una Nota

1. **Localiza la nota** en la lista de notas del proyecto

2. **Click en "Editar"**
   - Solo disponible si la nota es editable (ver sección 6)

3. **Modifica el contenido**
   - Solo puedes modificar el contenido
   - El tipo, autor y asunto no se pueden cambiar

4. **Click en "Guardar Cambios"**
   - Los cambios se guardarán
   - Se actualizará la fecha de actualización

### 4.2. ¿Qué se Puede Editar?

| Campo | ¿Editable? | Razón |
|-------|------------|-------|
| Tipo | ❌ No | El tipo define la categoría original |
| Autor | ❌ No | El autor es quien creó la nota originalmente |
| Asunto | ❌ No | El asunto es el título original |
| Contenido | ✅ Sí | El contenido puede actualizarse |

---

## 5. Eliminar una Nota

### 5.1. Pasos para Eliminar una Nota

1. **Localiza la nota** en la lista de notas del proyecto

2. **Click en "Eliminar"**

3. **Confirma la eliminación**
   - Aparecerá un diálogo de confirmación
   - Click en "Aceptar" para confirmar

4. **La nota se eliminará**
   - Desaparecerá de la lista
   - La eliminación es permanente

### 5.2. Restricciones de Eliminación

**IMPORTANTE:** Solo puedes eliminar notas si el estado del proyecto **NO ha cambiado** desde que se creó la nota.

Ver sección 6 para más detalles.

---

## 6. ¿Por Qué una Nota No es Editable?

### 6.1. Regla de Editabilidad

Una nota **SOLO es editable o eliminable** si el estado del proyecto **NO ha cambiado** desde que se creó la nota.

### 6.2. ¿Por Qué Esta Regla?

Esta regla existe para mantener la **integridad del análisis**:

- Las notas se crean en un contexto específico (estado del proyecto)
- Si el estado cambia, el contexto original ya no es válido
- Editar o eliminar notas de un contexto diferente podría distorsionar el análisis

### 6.3. Ejemplo

```
1. Creas nota en estado "creado"
   ✅ Nota es editable

2. Cambias estado del proyecto a "analisis_finalizado"
   ❌ Nota YA NO es editable

3. Intentas editar la nota
   ❌ Error: "La nota no es editable. El estado del proyecto ha cambiado."
```

### 6.4. ¿Qué Hacer Si No Puedes Editar?

Si una nota no es editable:

1. **Crea una nueva nota** con la información actualizada
2. **Referencia la nota original** en el asunto o contenido
3. **Ejemplo:**
   - Asunto: "Actualización: Grieta en pared principal"
   - Contenido: "Actualización de la nota original (ID: X). La grieta ha aumentado a 3mm..."

---

## 7. Mejores Prácticas

### 7.1. Creación de Notas

| Práctica | Descripción |
|----------|-------------|
| **Sé específico en el asunto** | Usa asuntos claros y descriptivos |
| **Incluye fechas en el contenido** | "Observado el 30/03/2026..." |
| **Usa el tipo correcto** | Comentario para observaciones, Decisión para decisiones |
| **Sé conciso pero completo** | Incluye toda la información relevante sin ser redundante |

### 7.2. Edición de Notas

| Práctica | Descripción |
|----------|-------------|
| **Edita pronto** | Edita la nota antes de que el estado cambie |
| **Marca cambios importantes** | Si haces cambios significativos, considera crear una nueva nota |
| **No edites notas antiguas** | Si el estado cambió, crea una nota nueva en lugar de editar |

### 7.3. Eliminación de Notas

| Práctica | Descripción |
|----------|-------------|
| **Confirma antes de eliminar** | La eliminación es permanente |
| **Verifica el estado** | Asegúrate de que el estado no ha cambiado |
| **Considera archivar** | En lugar de eliminar, considera crear una nota de "archivo" |

---

## 8. Preguntas Frecuentes

### 8.1. Preguntas Generales

**P: ¿Puedo crear múltiples notas en un proyecto?**
R: Sí, puedes crear tantas notas como necesites.

**P: ¿Las notas se guardan automáticamente?**
R: No, debes hacer click en "Guardar Nota" para guardar.

**P: ¿Puedo adjuntar archivos a las notas?**
R: No, las notas solo contienen texto.

### 8.2. Preguntas sobre Editabilidad

**P: ¿Por qué no puedo editar mi nota?**
R: Probablemente el estado del proyecto ha cambiado desde que creaste la nota.

**P: ¿Hay forma de forzar la edición?**
R: No, es una restricción del sistema para mantener la integridad.

**P: ¿Puedo eliminar una nota no editable?**
R: No, la misma restricción aplica para eliminación.

### 8.3. Preguntas sobre Tipos de Notas

**P: ¿Qué tipo de nota debo usar?**
R:
- **Comentario**: Para cualquier observación general
- **Valoración**: Para evaluaciones o juicios de valor
- **Decisión**: Para decisiones tomadas
- **Corrección IA**: Para corregir el análisis automático

**P: ¿Puedo cambiar el tipo de nota después de crearla?**
R: No, el tipo no se puede cambiar después de crear la nota.

---

## 9. Soporte

Si tienes problemas o preguntas adicionales:

1. **Revisa esta guía** - La mayoría de las preguntas están respondidas aquí
2. **Contacta al administrador** - Para problemas técnicos
3. **Reporta bugs** - Para errores del sistema

---

**Documento generado:** 2026-03-30  
**Sprint:** Sprint 3 - Testing y Documentación  
**Estado:** ✅ COMPLETADO - Guía de usuario completa  
**Próximo paso:** Actualizar inventario
