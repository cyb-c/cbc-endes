# Especificación de Patrones de Validación para Formularios PAI

**Fecha:** 27 de marzo de 2026  
**Versión:** 1.0

---

## 1. Introducción

Este documento define los patrones de validación reutilizables para los formularios del sistema PAI (Proyectos de Análisis Inmobiliario), especialmente para la validación del IJSON (JSON del anuncio inmobiliario).

## 2. Patrones de Validación

### 2.1. Validación de IJSON

#### Objetivo
Validar que el IJSON proporcionado por el usuario es un JSON válido antes de procesarlo y enviar al backend.

#### Reglas de Validación

**R1 - Formato JSON**
- El IJSON debe ser un string JSON válido (parseable)
- No debe contener caracteres inválidos o malformados
- Debe contener al menos los campos obligatorios: `titulo_anuncio`, `tipo_inmueble`, `precio`

**R2 - Campos Obligatorios**
```typescript
interface IJSONCamposObligatorios {
  titulo_anuncio: string      // Título del anuncio
  tipo_inmueble: string        // Tipo de inmueble (piso, chalet, local, etc.)
  precio: string              // Precio (número o string numérica)
}
```

**R3 - Validación de Tipos de Inmueble**
- El campo `tipo_inmueble` debe ser uno de los tipos válidos:
  - "piso" (Piso)
  - "chalet" (Chalet)
  - "local" (Local)
  - "oficina" (Oficina)
  - "nave industrial" (Nave Industrial)
  - "nave comercial" (Nave Comercial)
  - "otro" (Otro)

**R4 - Validación de Precio**
- El campo `precio` debe ser:
  - Un número entero positivo
- O una cadena numérica válida (ej: "150000", "150000,00")
  - No debe estar vacío

### 2.2. Validación de URL de Anuncio

#### Objetivo
Validar que la URL del anuncio es accesible antes de procesarla.

#### Reglas de Validación
- La URL debe ser un string válido (no vacía)
- La URL debe comenzar con `http://` o `https://`
- La URL no debe contener caracteres inválidos en el path
- La URL debe ser un formato válido (ej: `https://www.ejemplo.com/inmueble/123456`)

### 2.3. Validación de Operación

#### Objetivo
Validar que el campo `operacion` es uno de los valores válidos.

#### Reglas de Validación
- El campo `operacion` debe ser uno de:
  - "venta"
  - "alquiler"
  - "traspaso"
  - "permuta"
  - "otro"

## 3. Funciones de Validación

### 3.1. validarIJSON(ijson: string): IJSONValidacion

```typescript
function validarIJSON(ijson: string): IJSONValidacion {
  try {
    const parsed = JSON.parse(ijson)
    
    // Validar campos obligatorios
    if (!parsed.titulo_anuncio) {
      return { valido: false, error: 'Falta campo obligatorio: titulo_anuncio' }
    }
    
    if (!parsed.tipo_inmueble) {
      return { valido: false, error: 'Falta campo obligatorio: tipo_inmueble' }
    }
    
    if (!parsed.precio) {
      return { valido: false, error: 'Falta campo obligatorio: precio' }
    }
    
    // Validar tipos de inmueble
    const tiposValidos = ['piso', 'chalet', 'local', 'oficina', 'nave industrial', 'nave comercial', 'otro']
    if (!tiposValidos.includes(parsed.tipo_inmueble)) {
      return { valido: false, error: `Tipo de inmueble no válido. Debe ser uno de: ' + tiposValidos.join(', ') + "'" }
    }
    
    // Validar operación
    const operacionesValidas = ['venta', 'alquiler', 'traspaso', 'permuta', 'otro']
    if (!operacionesValidas.includes(parsed.operacion)) {
      return { valido: false, error: 'Operación no válida. Debe ser una de: ' + operacionesValidas.join(', ') + "'" }
    }
    
    // Validar precio
    const precioStr = String(parsed.precio)
    const precioNum = parseFloat(precioStr.replace(/[^0-9.,]/g, ''))
    
    if (isNaN(precioNum) || precioNum <= 0) {
      return { valido: false, error: 'El precio debe ser un número positivo mayor a cero' }
    }
    
    return { valido: true }
}
```

### 3.2. validarURLAnuncio(url: string): IJSONValidacion

```typescript
function validarURLAnuncio(url: string): IJSONValidacion {
  try {
    const urlObj = new URL(url)
    
    // Validar protocolo
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valido: false, error: 'La URL debe comenzar con http:// o https://' }
    }
    
    // Validar formato
    if (!urlObj.hostname) {
      return { valido: false, error: 'La URL no tiene un hostname válido' }
    }
    
    // Validar que no está vacía
    if (url.trim() === '') {
      return { valido: false, error: 'La URL no puede estar vacía' }
    
    return { valido: true }
}
```

### 3.3. validarOperacion(operacion: string): IJSONValidacion

```typescript
function validarOperacion(operacion: string): IJSONValidacion {
  const operacionesValidas = ['venta', 'alquiler', 'traspaso', 'permuta', 'otro']
  
  if (!operacionesValidas.includes(operacion)) {
    return { valido: false, error: 'Operación no válida. Debe ser una de: ' + operacionesValidas.join(', ') + "'" }
  }
  
  return { valido: true }
}
```

## 4. Tipos de Error

| Código | Mensaje |
|---------|--------|
| `INVALID_IJSON` | El IJSON no tiene el formato correcto o falta campos obligatorios |
| `INVALID_TIPO_INMUEBLE` | El tipo de inmueble no es válido |
| `INVALID_PRECIO` | El precio no es un número válido |
| `INVALID_OPERACION` | La operación no es válida |
| `INVALID_URL_ANUNCIO` | La URL del anuncio no es válida |

## 5. Referencias

- **Ejemplo de IJSON:** [`Ejemplo-modelo-info.json`](../../doc-base/Ejemplo-modelo-info.json)
- **Tipos de Inmueble:** Definidos en el esquema de base de datos (ver migración `005-pai-mvp-datos-iniciales.sql`)

---

**Fin del Documento**
