# Especificación del Formulario de Creación de Proyecto

**Fecha:** 27 de marzo de 2026  
**Versión:** 1.0

---

## 1. Introducción

Este documento especifica el formulario de creación de proyectos PAI, permitiendo a los usuarios ingresar la información del inmueble mediante un IJSON (JSON del anuncio inmobiliario).

## 2. Ubicación del Formulario

**Ruta:** `/proyectos/crear` (página dedicada a la creación de proyectos)

**Componente:** Sección de Proyectos PAI en el menú lateral

## 3. Estructura del Formulario

El formulario debe incluir los siguientes secciones:

### 3.1. Cabecera
- Título de la página: "Crear Nuevo Proyecto PAI"
- Descripción breve: "Pegue el IJSON del anuncio para crear un nuevo proyecto de análisis inmobiliario"
- Botón de acción primaria: "Crear Proyecto"

### 3.2. Campo de Entrada de IJSON
- **Tipo:** Área de texto grande (textarea)
- **Etiqueta:** "IJSON del Anuncio"
- **Placeholder:** "Pegue aquí el contenido JSON del anuncio..."
- **Validación:** 
  - Validar que el contenido es un JSON válido
  - Validar campos obligatorios: `titulo_anuncio`, `tipo_inmueble`, `precio`
  - Mostrar error si hay campos faltantes
  - Límite de caracteres: 50,000 caracteres (aproximadamente 1-5MB)

### 3.3. Información Adicional (Opcional)
Los siguientes campos pueden incluirse para mejorar el análisis:

- **Portal del Anuncio:**
  - Campo: `portal_nombre`
  - Tipo: Texto
  - Etiqueta: "Portal"
  - Placeholder: "Idealista, Fotocasa, etc."

- **URL del Anuncio:**
  - Campo: `url_anuncio`
  - Tipo: URL
  - Etiqueta: "URL del Anuncio"
  - Placeholder: "https://..."

- **Tipo de Inmueble:**
  - Campo: `tipo_inmueble`
  - Tipo: Select
  - Etiqueta: "Tipo de Inmueble"
  - Opciones: "Piso", "Casa", "Chalet", "Local", "Oficina", "Nave Industrial", "Otros"

- **Operación:**
  - Campo: `operacion`
  - Tipo: Select
  - Etiqueta: "Operación"
  - Opciones: "Venta", "Alquiler", "Traspaso"

- **Precio:**
  - Campo: `precio`
  - Tipo: Texto o Número
  - Etiqueta: "Precio"
  - Placeholder: "€"

- **Superficie Total (m²):**
  - Campo: `superficie_total_m2`
  - Tipo: Texto o Número
  - Etiqueta: "Superficie Total (m²)"
  - Placeholder: "0"

- **Superficie Construida (m²):**
  - Campo: `superficie_construida_m2`
  - Tipo: Texto o Número
  - Etiqueta: "Superficie Construida (m²)"
  - Placeholder: "0"

- **Ciudad:**
  - Campo: `ciudad`
  - Tipo: Texto
  - Etiqueta: "Ciudad"
  - Placeholder: "Valencia"

- **Barrio/Distrito:**
  - Campo: `barrio_distrito`
  - Tipo: Texto
  - Etiqueta: "Barrio/Distrito"
  - Placeholder: ""

## 4. Validación del Formulario

### 4.1. Validación del IJSON
```typescript
function validarIJSON(ijsonString: string): {
  valido: boolean
  error?: string
  ijson?: Record<string, unknown>
}
```

**Reglas de Validación:**
1. El IJSON debe ser un JSON válido
2. Debe contener al menos los campos obligatorios: `titulo_anuncio`, `tipo_inmueble`, `precio`
3. Los campos opcionales deben tener el tipo correcto
4. El precio debe ser un número o una cadena numérica válida
5. El IJSON no debe exceder 50,000 caracteres

### 4.2. Validación de Campos Obligatorios
```typescript
function validarCamposObligatorios(ijson: Record<string, unknown>): {
  const faltantes: string[] = []
  
  if (!ijson.titulo_anuncio) {
    faltantes.push('Falta el título del anuncio')
  }
  if (!ijson.tipo_inmueble) {
    faltantes.push('Falta el tipo de inmueble')
  }
  if (!ijson.precio) {
    faltantes.push('Falta el precio')
  }
  
  return {
    valido: faltantes.length === 0,
    error: faltantes.length > 0 ? `Faltan campos obligatorios: ${faltantes.join(', ')}` : undefined
  }
}
```

## 5. Comportamiento del Formulario

### 5.1. Estados de Carga
- **Inicial:** Formulario listo para ser completado
- **Enviando:** Mostrar indicador de carga mientras se envía el IJSON al backend
- **Éxito:** Mostrar mensaje de éxito y redirigir a la página de detalle del proyecto
- **Error:** Mostrar mensaje de error con detalles

### 5.2. Indicador de Carga
- Spinner o barra de progreso mientras se valida el IJSON
- Mensaje: "Validando información del inmueble..."
- Mensaje de éxito: "Proyecto creado exitosamente"
- Mensaje de error: "Error al crear el proyecto. Por favor, verifique el IJSON y vuelva a intentarlo."

## 6. Interacción con la API

### 6.1. Endpoint de Creación
- **Método:** `POST /api/pai/proyectos`
- **Request Body:**
```typescript
{
  ijson: string
}
```

### 6.2. Response Esperado
```typescript
{
  proyecto: {
    id: number
    cii: string
    titulo: string
    estado_id: number
    estado: string
    fecha_alta: string
    fecha_ultima_actualizacion: string
  }
}
```

### 6.3. Manejo de Errores
- **Error 400:** IJSON inválido o campos faltantes
  - Mostrar mensaje de error con detalles específicos
  - Mantener el formulario para permitir corrección
- **Error 500:** Error interno del servidor
  - Mostrar mensaje genérico de error
  - Registrar el error en el sistema de logging

## 7. UX Consideraciones

### 7.1. Experiencia de Usuario
- El formulario debe ser simple y fácil de usar
- Los campos deben estar claramente etiquetados
- Proporcionar placeholders claros para cada campo
- Mostrar ejemplos de formato esperado para el IJSON

### 7.2. Accesibilidad
- El formulario debe ser accesible desde dispositivos móviles
- Los campos deben tener tamaño suficiente para ser seleccionados fácilmente
- Considerar autocompletar campos comunes (tipo_inmueble, ciudad)

### 7.3. Feedback Visual
- Validación en tiempo real (al escribir)
- Mensajes de error claros y específicos
- Indicadores visibles de progreso

## 8. Referencias

- **API de PAI:** [`Especificacion_API_PAI.md`](../Especificacion_API_PAI.md)
- **Tipos TypeScript PAI:** [`apps/worker/src/types/pai.ts`](../../apps/worker/src/types/pai.ts)
- **Ejemplo de IJSON:** [`Ejemplo-modelo-info.json`](../../doc-base/Ejemplo-modelo-info.json)

---

**Fin del Documento**
