# 🎓 Diseño: Cursos → Módulos → Temas (Lecciones)

## 📊 Estructura Propuesta

```
CURSO (Náhuatl Básico)
  ├── MÓDULO 1 (Saludos y Presentaciones)
  │   ├── TEMA 1 (Lección: Saludos básicos)
  │   ├── TEMA 2 (Lección: Presentarse)
  │   └── TEMA 3 (Lección: Despedidas)
  │
  ├── MÓDULO 2 (Números y Colores)
  │   ├── TEMA 1 (Lección: Números 1-10)
  │   ├── TEMA 2 (Lección: Números 11-100)
  │   └── TEMA 3 (Lección: Colores básicos)
  │
  └── MÓDULO 3 (Familia y Relaciones)
      ├── TEMA 1 (Lección: Miembros de la familia)
      └── TEMA 2 (Lección: Relaciones sociales)
```

---

## 🗄️ Esquema de Base de Datos

### 1. Tabla `cursos`

```sql
CREATE TABLE public.cursos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  imagen_portada text, -- URL de la imagen
  nivel text DEFAULT 'principiante' CHECK (nivel IN ('principiante', 'intermedio', 'avanzado')),
  categoria text NOT NULL, -- Ej: "Idioma", "Cultura", "Historia"
  duracion_total_minutos integer DEFAULT 0, -- Calculado automáticamente
  profesor_id uuid NOT NULL,
  estado text DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'archivado')),
  
  -- Estadísticas
  estudiantes_inscritos integer DEFAULT 0,
  puntuacion_promedio numeric DEFAULT 0.00,
  
  -- Metadatos
  objetivos_curso text[], -- Array de objetivos generales
  requisitos_previos text[], -- Array de requisitos
  palabras_clave text[],
  
  -- Orden y visibilidad
  orden_visualizacion integer DEFAULT 1,
  es_destacado boolean DEFAULT false,
  es_gratuito boolean DEFAULT true,
  
  -- Fechas
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_publicacion timestamp with time zone,
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  
  CONSTRAINT cursos_pkey PRIMARY KEY (id),
  CONSTRAINT cursos_profesor_fkey FOREIGN KEY (profesor_id) REFERENCES public.perfiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_cursos_profesor ON public.cursos(profesor_id);
CREATE INDEX idx_cursos_estado ON public.cursos(estado);
CREATE INDEX idx_cursos_nivel ON public.cursos(nivel);
```

---

### 2. Tabla `modulos`

```sql
CREATE TABLE public.modulos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  
  -- Orden
  orden_modulo integer NOT NULL DEFAULT 1,
  
  -- Estadísticas (calculadas)
  duracion_total_minutos integer DEFAULT 0,
  numero_temas integer DEFAULT 0,
  
  -- Metadatos
  objetivos_modulo text[],
  
  -- Fechas
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  
  CONSTRAINT modulos_pkey PRIMARY KEY (id),
  CONSTRAINT modulos_curso_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE,
  CONSTRAINT modulos_orden_unique UNIQUE (curso_id, orden_modulo)
);

CREATE INDEX idx_modulos_curso ON public.modulos(curso_id);
CREATE INDEX idx_modulos_orden ON public.modulos(curso_id, orden_modulo);
```

---

### 3. Tabla `temas` (Reemplazo de lecciones independientes)

**Opción A: Migrar lecciones existentes**
```sql
-- Agregar campos a la tabla lecciones existente
ALTER TABLE public.lecciones ADD COLUMN modulo_id uuid;
ALTER TABLE public.lecciones ADD COLUMN orden_tema integer DEFAULT 1;
ALTER TABLE public.lecciones ADD COLUMN es_obligatorio boolean DEFAULT true;

ALTER TABLE public.lecciones 
  ADD CONSTRAINT lecciones_modulo_fkey 
  FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE SET NULL;

CREATE INDEX idx_lecciones_modulo ON public.lecciones(modulo_id);
CREATE INDEX idx_lecciones_orden_tema ON public.lecciones(modulo_id, orden_tema);

-- Las lecciones sin modulo_id serán "lecciones sueltas" (compatibilidad hacia atrás)
```

**Opción B: Nueva tabla temas (más limpio pero requiere migración)**
```sql
CREATE TABLE public.temas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  modulo_id uuid NOT NULL,
  leccion_id uuid NOT NULL, -- Referencia a lección existente
  
  -- Orden y configuración
  orden_tema integer NOT NULL DEFAULT 1,
  es_obligatorio boolean DEFAULT true,
  
  -- Fechas
  fecha_agregado timestamp with time zone DEFAULT now(),
  
  CONSTRAINT temas_pkey PRIMARY KEY (id),
  CONSTRAINT temas_modulo_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE,
  CONSTRAINT temas_leccion_fkey FOREIGN KEY (leccion_id) REFERENCES public.lecciones(id) ON DELETE CASCADE,
  CONSTRAINT temas_orden_unique UNIQUE (modulo_id, orden_tema)
);

CREATE INDEX idx_temas_modulo ON public.temas(modulo_id);
CREATE INDEX idx_temas_leccion ON public.temas(leccion_id);
```

---

### 4. Tabla `inscripciones_cursos`

```sql
CREATE TABLE public.inscripciones_cursos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  curso_id uuid NOT NULL,
  
  -- Estado
  estado text DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'abandonado')),
  progreso_porcentaje numeric DEFAULT 0.00,
  
  -- Estadísticas
  temas_completados integer DEFAULT 0,
  tiempo_total_minutos integer DEFAULT 0,
  
  -- Fechas
  fecha_inscripcion timestamp with time zone DEFAULT now(),
  fecha_ultimo_acceso timestamp with time zone,
  fecha_completado timestamp with time zone,
  
  CONSTRAINT inscripciones_cursos_pkey PRIMARY KEY (id),
  CONSTRAINT inscripciones_usuario_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT inscripciones_curso_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE,
  CONSTRAINT inscripciones_unique UNIQUE (usuario_id, curso_id)
);

CREATE INDEX idx_inscripciones_usuario ON public.inscripciones_cursos(usuario_id);
CREATE INDEX idx_inscripciones_curso ON public.inscripciones_cursos(curso_id);
```

---

### 5. Tabla `progreso_temas` (Extensión de progreso_lecciones)

```sql
-- Agregar campo a progreso_lecciones existente
ALTER TABLE public.progreso_lecciones ADD COLUMN inscripcion_curso_id uuid;

ALTER TABLE public.progreso_lecciones
  ADD CONSTRAINT progreso_inscripcion_fkey
  FOREIGN KEY (inscripcion_curso_id) REFERENCES public.inscripciones_cursos(id) ON DELETE CASCADE;

CREATE INDEX idx_progreso_inscripcion ON public.progreso_lecciones(inscripcion_curso_id);
```

---

### 6. Tabla `calificaciones_cursos`

```sql
CREATE TABLE public.calificaciones_cursos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  curso_id uuid NOT NULL,
  calificacion integer NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario text,
  fecha_calificacion timestamp with time zone DEFAULT now(),
  
  CONSTRAINT calificaciones_cursos_pkey PRIMARY KEY (id),
  CONSTRAINT calificaciones_cursos_usuario_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT calificaciones_cursos_curso_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE,
  CONSTRAINT calificaciones_cursos_unique UNIQUE (usuario_id, curso_id)
);

CREATE INDEX idx_calificaciones_cursos_usuario ON public.calificaciones_cursos(usuario_id);
CREATE INDEX idx_calificaciones_cursos_curso ON public.calificaciones_cursos(curso_id);
```

---

## 🔄 Estrategia de Migración

### Fase 1: Crear nuevas tablas (sin romper nada)
1. Crear `cursos`
2. Crear `modulos`
3. Agregar campos opcionales a `lecciones` (modulo_id, orden_tema)
4. Crear `inscripciones_cursos`
5. Crear `calificaciones_cursos`

### Fase 2: Mantener compatibilidad
- Las lecciones sin `modulo_id` seguirán funcionando como "lecciones sueltas"
- El sistema actual de lecciones NO se rompe
- Los profesores pueden seguir creando lecciones independientes

### Fase 3: Migración gradual
- Los profesores pueden crear cursos y asignar lecciones existentes a módulos
- Las lecciones pueden pertenecer a un módulo O ser independientes
- Opcionalmente, migrar lecciones existentes a un curso "Lecciones Generales"

---

## 🎯 Ventajas de este Diseño

### ✅ Compatibilidad hacia atrás
- Las lecciones actuales siguen funcionando
- No se rompe nada existente
- Migración gradual y opcional

### ✅ Flexibilidad
- Una lección puede estar en un módulo O ser independiente
- Los profesores eligen cómo organizar su contenido
- Fácil reorganización (cambiar orden, mover entre módulos)

### ✅ Escalabilidad
- Estructura clara: Curso → Módulo → Tema (Lección)
- Fácil agregar más niveles si es necesario
- Estadísticas y progreso por curso, módulo y tema

### ✅ UX Mejorada
- Estudiantes ven cursos estructurados
- Progreso visual por módulo
- Recomendaciones de "siguiente tema"
- Certificados por curso completado

---

## 📋 Recomendación

**Usar Opción A (Agregar campos a lecciones)**

**Razones:**
1. ✅ No requiere migración de datos
2. ✅ Mantiene compatibilidad total
3. ✅ Más simple de implementar
4. ✅ Las lecciones pueden ser independientes O parte de un módulo
5. ✅ Menos complejidad en queries

---

## 🚀 Siguiente Paso

¿Quieres que:
1. **Genere el SQL completo** para crear las tablas?
2. **Implemente el backend** (controllers, routes) para cursos?
3. **Creemos la UI** para gestión de cursos primero?

Dime por dónde prefieres empezar.
