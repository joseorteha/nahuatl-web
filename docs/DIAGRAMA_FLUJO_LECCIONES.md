# 🎨 Diagrama de Flujo - Sistema de Lecciones

## 📊 Flujo Completo del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROFESOR CREA CURSO                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PROFESOR CREA MÓDULO                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Agregar Lección │
                    └─────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │ VINCULAR EXISTENTE    │   │ CREAR EXCLUSIVA       │
    └───────────────────────┘   └───────────────────────┘
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │ Buscar en catálogo    │   │ Formulario completo   │
    │ - Filtros             │   │ - Título              │
    │ - Categoría           │   │ - Contenido           │
    │ - Nivel               │   │ - Recursos            │
    │ - Búsqueda            │   │ - Quiz                │
    └───────────────────────┘   └───────────────────────┘
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │ Seleccionar lección   │   │ Guardar como:         │
    │ Configurar:           │   │ - es_publica = false  │
    │ - Orden               │   │ - es_exclusiva = true │
    │ - Obligatoria         │   │ - modulo_id = X       │
    │ - Puntos requeridos   │   └───────────────────────┘
    └───────────────────────┘               │
                │                           │
                └─────────────┬─────────────┘
                              ▼
                ┌─────────────────────────┐
                │ LECCIÓN EN MÓDULO       │
                │ (modulos_lecciones)     │
                └─────────────────────────┘
```

---

## 👨‍🎓 Flujo del Estudiante

```
┌─────────────────────────────────────────────────────────────────┐
│                  ESTUDIANTE INSCRITO EN CURSO                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Ve el Módulo   │
                    └─────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Lista de Lecciones del Módulo          │
        │                                         │
        │  ✓ Lección 1 (Completada)              │
        │  → Lección 2 (En progreso)             │
        │  🔒 Lección 3 (Bloqueada)              │
        │  📌 Lección 4 (Exclusiva del módulo)   │
        └─────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Click en lección│
                    └─────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  URL: /lecciones/[id]?from=modulo       │
        │       &moduloId=X&cursoId=Y             │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Registrar Progreso:                    │
        │  - contexto_acceso = 'modulo'           │
        │  - modulo_id = X                        │
        │  - curso_id = Y                         │
        │  - estado = 'en_progreso'               │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Estudiante completa la lección         │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Actualizar Progreso:                   │
        │  - estado = 'completada'                │
        │  - fecha_completada = now()             │
        │  - puntuacion_quiz = X                  │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Click "Salir"                          │
        │  → Vuelve al módulo (no a /lecciones)   │
        └─────────────────────────────────────────┘
```

---

## 🔄 Flujo de Progreso Compartido

```
ESCENARIO: Lección "Números 1-10" está en 2 módulos diferentes

┌─────────────────────────────────────────────────────────────────┐
│  MÓDULO A (Curso Básico)                                        │
│  - Lección: "Números 1-10"                                      │
│  - Orden: 3                                                     │
│  - Obligatoria: Sí                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Estudiante completa en Módulo A        │
        │  → Progreso guardado                    │
        └─────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  progreso_lecciones:                                            │
│  - usuario_id: 123                                              │
│  - leccion_id: 456                                              │
│  - estado: 'completada' ✅                                      │
│  - contexto_acceso: 'modulo'                                    │
│  - modulo_id: A                                                 │
│  - curso_id: Básico                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Estudiante se inscribe en Curso        │
        │  Intermedio que también tiene           │
        │  "Números 1-10" en Módulo B             │
        └─────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  MÓDULO B (Curso Intermedio)                                    │
│  - Lección: "Números 1-10"                                      │
│  - Orden: 1                                                     │
│  - Obligatoria: No                                              │
│  - Badge: "✅ Ya completada" ← DETECTA PROGRESO EXISTENTE      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Si accede desde Módulo B:              │
        │  → Actualiza contexto a Módulo B        │
        │  → Mantiene estado 'completada'         │
        │  → Puede revisar contenido              │
        └─────────────────────────────────────────┘
```

---

## 🎯 Tipos de Lecciones

```
┌─────────────────────────────────────────────────────────────────┐
│                        LECCIÓN PÚBLICA                          │
│                                                                 │
│  es_publica = true                                              │
│  es_exclusiva_modulo = false                                    │
│  modulo_exclusivo_id = null                                     │
│                                                                 │
│  ✅ Aparece en /lecciones                                       │
│  ✅ Puede vincularse a múltiples módulos                        │
│  ✅ Puede completarse independientemente                        │
│  ❌ NO se elimina con el módulo                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      LECCIÓN EXCLUSIVA                          │
│                                                                 │
│  es_publica = false                                             │
│  es_exclusiva_modulo = true                                     │
│  modulo_exclusivo_id = UUID                                     │
│                                                                 │
│  ❌ NO aparece en /lecciones                                    │
│  ❌ NO puede vincularse a otros módulos                         │
│  ✅ Solo visible en su módulo                                   │
│  ✅ Se elimina si se elimina el módulo                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       LECCIÓN PRIVADA                           │
│                                                                 │
│  es_publica = false                                             │
│  es_exclusiva_modulo = false                                    │
│  modulo_exclusivo_id = null                                     │
│                                                                 │
│  ❌ NO aparece en /lecciones                                    │
│  ✅ Puede vincularse a múltiples módulos                        │
│  ✅ Útil para lecciones "borrador" compartidas                  │
│  ❌ NO se elimina con el módulo                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Estructura de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                          LECCIONES                              │
├─────────────────────────────────────────────────────────────────┤
│ id                    uuid                                      │
│ titulo                text                                      │
│ contenido_texto       text                                      │
│ profesor_id           uuid                                      │
│ es_publica            boolean  ← NUEVO                          │
│ es_exclusiva_modulo   boolean  ← NUEVO                          │
│ modulo_exclusivo_id   uuid     ← NUEVO                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ muchos a muchos
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MODULOS_LECCIONES                           │
├─────────────────────────────────────────────────────────────────┤
│ id                    uuid                                      │
│ modulo_id             uuid  ──────┐                             │
│ leccion_id            uuid  ──────┼──→ LECCIONES               │
│ orden_en_modulo       integer     │                             │
│ es_obligatoria        boolean     │                             │
│ puntos_requeridos     integer     │                             │
└───────────────────────────────────┼─────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                          MODULOS                                │
├─────────────────────────────────────────────────────────────────┤
│ id                    uuid                                      │
│ curso_id              uuid                                      │
│ titulo                text                                      │
└─────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROGRESO_LECCIONES                           │
├─────────────────────────────────────────────────────────────────┤
│ id                    uuid                                      │
│ usuario_id            uuid                                      │
│ leccion_id            uuid                                      │
│ estado_leccion        text                                      │
│ contexto_acceso       text     ← NUEVO ('catalogo'|'modulo')   │
│ modulo_id             uuid     ← NUEVO                          │
│ curso_id              uuid     ← NUEVO                          │
│ fecha_completada      timestamp                                 │
│ puntuacion_quiz       integer                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Reglas de Negocio

```
┌─────────────────────────────────────────────────────────────────┐
│  REGLA 1: Lecciones exclusivas                                  │
│                                                                 │
│  IF es_exclusiva_modulo = true THEN                             │
│    - modulo_exclusivo_id MUST NOT BE NULL                       │
│    - es_publica MUST BE false                                   │
│    - NO puede vincularse a otros módulos                        │
│    - Se elimina en CASCADE si se elimina el módulo              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  REGLA 2: Progreso único por usuario-lección                    │
│                                                                 │
│  - Solo UN registro por (usuario_id, leccion_id)                │
│  - Se actualiza el contexto en cada acceso                      │
│  - El estado NO retrocede (completada → en_progreso ❌)         │
│  - Se comparte entre todos los módulos                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  REGLA 3: Navegación contextual                                 │
│                                                                 │
│  - Siempre pasar parámetros: from, moduloId, cursoId            │
│  - Botón "Salir" vuelve al contexto de origen                   │
│  - Breadcrumbs reflejan el contexto actual                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  REGLA 4: Vinculación de lecciones                              │
│                                                                 │
│  - Lecciones públicas: pueden vincularse N veces                │
│  - Lecciones exclusivas: NO pueden vincularse                   │
│  - Lecciones privadas: pueden vincularse N veces                │
│  - UNIQUE constraint: (modulo_id, leccion_id)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Interfaz de Usuario

```
┌─────────────────────────────────────────────────────────────────┐
│  PÁGINA: /profesor/cursos/[id]/modulos/[moduloId]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📚 Módulo 1: Saludos Básicos                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Lecciones del Módulo                    [➕ Agregar]   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  1. 📖 Saludos formales (Pública)           [⋯]        │   │
│  │     15 min • 45 estudiantes completaron                 │   │
│  │                                                         │   │
│  │  2. 📌 Introducción al módulo (Exclusiva)   [⋯]        │   │
│  │     10 min • Solo en este módulo                        │   │
│  │                                                         │   │
│  │  3. 📖 Despedidas (Pública)                 [⋯]        │   │
│  │     12 min • 38 estudiantes completaron                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────┐
│  MODAL: Agregar Lección                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [🔗 Vincular Existente] [✨ Crear Exclusiva]                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔍 Buscar lecciones...                                 │   │
│  │                                                         │   │
│  │  [Categoría ▼] [Nivel ▼]                               │   │
│  │                                                         │   │
│  │  ┌───────────────────────────────────────────────────┐ │   │
│  │  │ 📖 Números del 1 al 10                            │ │   │
│  │  │ Aprende a contar en náhuatl                       │ │   │
│  │  │ [numeros] [principiante] ⏱️ 20 min    [Vincular] │ │   │
│  │  └───────────────────────────────────────────────────┘ │   │
│  │                                                         │   │
│  │  ┌───────────────────────────────────────────────────┐ │   │
│  │  │ 📖 Colores básicos                                │ │   │
│  │  │ Los colores en la naturaleza                      │ │   │
│  │  │ [colores] [principiante] ⏱️ 15 min    [Vincular] │ │   │
│  │  └───────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Resumen Visual

```
ANTES (Problema):
❌ Lecciones solo en catálogo
❌ No se podían reutilizar
❌ Navegación confusa
❌ Progreso se perdía

DESPUÉS (Solución):
✅ Lecciones públicas + exclusivas
✅ Reutilización inteligente
✅ Navegación contextual
✅ Progreso compartido
✅ Sistema escalable
```

---

**¡Sistema completo y listo para implementar!** 🚀
