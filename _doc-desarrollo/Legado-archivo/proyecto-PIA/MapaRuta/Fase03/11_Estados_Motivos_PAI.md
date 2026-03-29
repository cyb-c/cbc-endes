# Especificación de Estados y Motivos de Proyectos PAI

**Fecha:** 27 de marzo de 2026  
**Versión:** 1.0

---

## 1. Introducción

Este documento define los estados y motivos disponibles para proyectos PAI (Proyectos de Análisis Inmobiliario), incluyendo sus relaciones y códigos de estado.

## 2. Estados del Proyecto PAI

| ID | Código | Nombre | Descripción | ¿Permite Re-ejecución? | Color |
|----|-------|-------------|------------------|--------|
| 1 | CREADO | Creado | Estado inicial del proyecto | Sí | 🟢 |
| 2 | EN_ANALISIS | En análisis | El análisis está en progreso | Sí | 🟡 |
| 3 | PENDIENTE_REVISION | Pendiente de revisión | El análisis está completo y espera revisión | Sí | 🟡 |
| 4 | EVALUANDO_VIABILIDAD | Evaluando viabilidad | El proyecto está siendo evaluado para viabilidad | Sí | 🟡 |
| 5 | EVALUANDO_PLAN_NEGOCIO | Evaluando plan de negocio | El proyecto está siendo evaluado para viabilidad de negocio | Sí | 🟡 |
| 6 | SEGUIMIENTO_COMERCIAL | Seguimiento comercial | El proyecto está en seguimiento comercial | Sí | 🟡 |
| 7 | DESCARTADO | Descartado | El proyecto fue descartado | No | 🔲 |
| 8 | APROBADO | Aprobado | El proyecto fue aprobado | Sí | 🟢 |

### Notas sobre Estados:
- **Estados de análisis (2, 3, 4):** Permiten re-ejecución del análisis
- **Estado 5 (PENDIENTE_REVISION):** No permite iniciar nuevo análisis mientras está pendiente revisión
- **Estados 6, 7, 8 (SEGUIMIENTO_COMERCIAL, SEGUIMIENTO_COMERCIAL):** Permiten acciones manuales (cambiar estado, añadir notas, etc.)
- **Estado 8 (APROBADO):** El proyecto está aprobado, no requiere más acciones de negocio

## 3. Motivos de Valoración

| ID | Código | Nombre | Descripción | Aplicable a Estado | Color |
|----|-------|-------------|------------------|--------|
| 1 | MV_SENTIDO_NEGOCIO_REAL | Sentido de negocio real | El activo parece tener sentido de negocio real | Todos | 🟢 |
| 2 | MV_INFRAUTILIZADO | Infrautilizado | El activo se aprecia como infrautilizado o con margen claro de mejora | Todos | 🟢 |
| 3 | MV_USO_ECONOMICO_RAZONABLE | Uso económico razonable | El activo parece sostener un uso económico razonable | Todos | 🟢 |
| 4 | MV_MANTENER | Conviene mantener | La opción más defendible parece ser mantener el activo | Todos | 🟢 |
| 5 | MV_TRANSFORMAR | Conviene transformar | La opción más defendible parece ser transformar el activo | Todos | 🟢 |
| 6 | MD_NO_INFRRAUTILIZADO_NI_MEJORABLE | Sin infrautilización relevante | El activo no parece estar infrautilizado de manera relevante | Todos | 🟢 |
| 7 | MD_NO_CONVIENE_MANTENER | No conviene mantener | La opción de mantener no parece ser la más defendible | Todos | 🟢 |
| 8 | MD_HIPOTESIS_ATRACTIVA_NO_SOSTENIBLE | Hipótesis de valoración no es sostenible según los datos | Los datos no parecen soportar esta hipótesis | Todos | 🟢 |

### Notas sobre Motivos:
- Los motivos de valoración (1-8) se usan para justificar aprobación del proyecto
- Los motivos de descarte (9-16) se usan para documentar por qué se descartó el proyecto
- Los estados y motivos están pre-definidos en la migración `005-pai-mvp-datos-iniciales.sql`
- Los códigos de estado y motivo deben coincidir con los valores en `PAI_VAL_valores`

## 4. Relaciones Estado-Motivo

### Estados que requieren Motivo:

| **DESCARTADO (8):** Requiere motivo de descarte (9-16)
| **APROBADO (7):** Puede tener motivo de valoración (1-8)

### Estados que NO requieren Motivo:

| **CREADO (1)**
- **EN_ANALISIS (2)**
- **PENDIENTE_REVISION (3)**
- **EVALUANDO_VIABILIDAD (4)**
- **EVALUANDO_PLAN_NEGOCIO (5)**
- **SEGUIMIENTO_COMERCIAL (6)**
- **SEGUIMIENTO_COMERCIAL (7)**
- **APROBADO (8)**

---

**Fin del Documento**
