# 📚 Sistema de Lecciones Mejorado

## 🎯 Objetivo

Crear un sistema flexible de lecciones que soporte:
- Lecciones públicas en el catálogo (`/lecciones`)
- Lecciones exclusivas de módulos
- Reutilización de lecciones entre módulos
- Navegación contextual (saber de dónde viene el usuario)
- Seguimiento de progreso por contexto

---

## 🗄️ Estructura de Base de Datos

### **Tabla: `lecciones`**

```sql
- es_publica (boolean): Si aparece en /lecciones
- es_exclusiva_modulo (boolean): Si es exclusiva de un módulo
- modulo_exclusivo_id (uuid): ID del módulo al que pertenece (si es exclusiva)
```

**Tipos de lecciones:**

| Tipo | es_publica | es_exclusiva_modulo | modulo_exclusivo_id | Descripción |
|------|-----------|---------------------|---------------------|-------------|
| **Pública** | `true` | `false` | `null` | Aparece en `/lecciones` y puede vincularse a módulos |
| **Exclusiva** | `false` | `true` | `uuid` | Solo existe dentro de un módulo específico |
| **Privada** | `false` | `false` | `null` | No aparece en catálogo pero puede vincularse a módulos |

### **Tabla: `modulos_lecciones`** (Relación muchos a muchos)

```sql
- modulo_id (uuid): ID del módulo
- leccion_id (uuid): ID de la lección
- orden_en_modulo (integer): Orden de la lección en el módulo
- es_obligatoria (boolean): Si es obligatoria para completar el módulo
- puntos_requeridos (integer): Puntos necesarios para desbloquear
```

### **Tabla: `progreso_lecciones`** (Mejorada)

```sql
- contexto_acceso (text): 'catalogo' | 'modulo' | 'curso'
- modulo_id (uuid): Desde qué módulo accedió
- curso_id (uuid): Desde qué curso accedió
```

---

## 🔄 Flujos de Usuario

### **Flujo 1: Usuario accede desde `/lecciones`**

```
1. Usuario ve catálogo de lecciones públicas
2. Click en una lección
3. Se registra progreso con contexto_acceso = 'catalogo'
4. Al salir → Vuelve a /lecciones
```

### **Flujo 2: Usuario accede desde un módulo**

```
1. Usuario está inscrito en curso
2. Entra a un módulo
3. Ve lista de lecciones del módulo
4. Click en una lección
5. Se registra progreso con:
   - contexto_acceso = 'modulo'
   - modulo_id = [id del módulo]
   - curso_id = [id del curso]
6. Al salir → Vuelve al módulo
```

### **Flujo 3: Usuario ya completó la lección**

```
Escenario A: Completó desde catálogo, ahora accede desde módulo
- Se actualiza el contexto a 'modulo'
- Se mantiene el estado 'completada'
- Puede revisar el contenido

Escenario B: Completó desde módulo A, ahora accede desde módulo B
- Se crea nuevo registro de progreso para módulo B
- Puede ver que ya la completó antes (badge)
```

---

## 🎨 Interfaz de Usuario

### **Página: `/profesor/cursos/[id]/modulos/[moduloId]/lecciones`**

**Dos opciones:**

1. **➕ Agregar lección existente**
   - Modal con buscador de lecciones públicas
   - Filtros por categoría, nivel
   - Selección múltiple
   - Configurar orden y si es obligatoria

2. **✨ Crear lección exclusiva**
   - Formulario de creación de lección
   - Automáticamente marca `es_exclusiva_modulo = true`
   - Solo visible en este módulo

### **Página: `/cursos/[id]/modulos/[moduloId]`**

```tsx
// Vista del estudiante
<div>
  <h2>Lecciones del Módulo</h2>
  {lecciones.map(leccion => (
    <LeccionCard
      leccion={leccion}
      yaCompletada={leccion.progreso?.estado === 'completada'}
      contexto="modulo"
      moduloId={moduloId}
      cursoId={cursoId}
    />
  ))}
</div>
```

### **Página: `/lecciones/[id]`**

**Detectar contexto de navegación:**

```tsx
// URL: /lecciones/123?from=modulo&moduloId=456&cursoId=789

const { from, moduloId, cursoId } = useSearchParams();

const handleSalir = () => {
  if (from === 'modulo' && moduloId) {
    router.push(`/cursos/${cursoId}/modulos/${moduloId}`);
  } else {
    router.push('/lecciones');
  }
};
```

---

## 🔧 API Endpoints

### **GET `/api/lecciones`**
```json
// Lecciones públicas del catálogo
{
  "lecciones": [
    {
      "id": "uuid",
      "titulo": "Saludos en Náhuatl",
      "es_publica": true,
      "es_exclusiva_modulo": false
    }
  ]
}
```

### **GET `/api/modulos/:moduloId/lecciones`**
```json
// Lecciones de un módulo específico
{
  "lecciones": [
    {
      "id": "uuid",
      "titulo": "Lección 1",
      "orden_en_modulo": 1,
      "es_obligatoria": true,
      "es_exclusiva": false,
      "progreso": {
        "estado": "completada",
        "fecha_completada": "2025-10-20"
      }
    }
  ]
}
```

### **POST `/api/modulos/:moduloId/lecciones/vincular`**
```json
// Vincular lección existente
{
  "leccion_id": "uuid",
  "orden_en_modulo": 2,
  "es_obligatoria": true
}
```

### **POST `/api/modulos/:moduloId/lecciones/crear`**
```json
// Crear lección exclusiva
{
  "titulo": "Introducción al módulo",
  "descripcion": "...",
  "contenido_texto": "...",
  "es_exclusiva_modulo": true
}
```

### **POST `/api/lecciones/:id/progreso`**
```json
// Registrar progreso con contexto
{
  "contexto_acceso": "modulo",
  "modulo_id": "uuid",
  "curso_id": "uuid",
  "estado_leccion": "en_progreso"
}
```

---

## 📊 Casos de Uso

### **Caso 1: Profesor crea curso de Náhuatl Básico**

```
1. Crea módulo "Saludos"
2. Opción A: Vincula lección pública "Saludos básicos"
3. Opción B: Crea lección exclusiva "Saludos en mi comunidad"
4. La lección exclusiva solo aparece en este módulo
5. La lección pública puede reutilizarse en otros cursos
```

### **Caso 2: Estudiante completa lección desde catálogo**

```
1. Usuario ve /lecciones
2. Completa "Saludos básicos" → progreso guardado
3. Luego se inscribe en curso "Náhuatl Básico"
4. Ve el módulo "Saludos" con la lección "Saludos básicos"
5. Aparece badge "✅ Ya completada"
6. Puede revisarla de nuevo si quiere
```

### **Caso 3: Lección aparece en múltiples módulos**

```
Lección: "Números del 1 al 10"

Módulo A (Curso Básico): Lección obligatoria, orden 3
Módulo B (Curso Intermedio): Lección opcional, orden 1

Progreso:
- Usuario completa en Módulo A → Marca completada
- Usuario accede desde Módulo B → Ve que ya la completó
- Progreso se comparte entre módulos
```

---

## 🎯 Reglas de Negocio

1. **Lecciones exclusivas:**
   - Solo pueden pertenecer a UN módulo
   - No aparecen en `/lecciones`
   - No pueden vincularse a otros módulos
   - Se eliminan si se elimina el módulo

2. **Lecciones públicas:**
   - Aparecen en `/lecciones`
   - Pueden vincularse a múltiples módulos
   - Pueden completarse independientemente

3. **Progreso:**
   - Se guarda por usuario + lección (único)
   - Se actualiza el contexto en cada acceso
   - Estado se mantiene entre contextos

4. **Navegación:**
   - Siempre volver al contexto de origen
   - Mostrar breadcrumbs según contexto
   - Indicar si ya completó la lección

---

## 🚀 Implementación

### **Paso 1: Ejecutar migración**
```bash
# En Supabase SQL Editor
\i migracion_lecciones_mejoradas.sql
```

### **Paso 2: Crear controladores backend**
- `leccionesController.js`
- `modulosLeccionesController.js`

### **Paso 3: Crear componentes frontend**
- `AgregarLeccionModal.tsx`
- `CrearLeccionExclusiva.tsx`
- `LeccionCard.tsx` (con contexto)

### **Paso 4: Actualizar rutas**
- `/lecciones/[id]` → Agregar parámetros de contexto
- `/cursos/[id]/modulos/[moduloId]` → Mostrar lecciones

---

## ✅ Checklist de Implementación

- [ ] Ejecutar migración SQL
- [ ] Crear API endpoints
- [ ] Crear componentes UI
- [ ] Implementar navegación contextual
- [ ] Agregar badges de progreso
- [ ] Testing de flujos
- [ ] Documentar para usuarios

---

## 📝 Notas Adicionales

- **Performance:** Usar índices en `modulos_lecciones`
- **UX:** Mostrar claramente si una lección es exclusiva
- **Analytics:** Rastrear desde qué contexto se completan más lecciones
- **Futuro:** Permitir duplicar lecciones exclusivas a públicas
