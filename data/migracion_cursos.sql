-- ============================================
-- MIGRACIÓN: Sistema de Cursos-Módulos-Temas
-- ============================================
-- Este script crea las nuevas tablas para el sistema de cursos
-- manteniendo compatibilidad total con lecciones existentes

-- ============================================
-- 1. TABLA CURSOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.cursos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  imagen_portada text,
  nivel text DEFAULT 'principiante' CHECK (nivel IN ('principiante', 'intermedio', 'avanzado')),
  categoria text NOT NULL,
  duracion_total_minutos integer DEFAULT 0,
  profesor_id uuid NOT NULL,
  estado text DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'archivado')),
  
  -- Estadísticas
  estudiantes_inscritos integer DEFAULT 0,
  puntuacion_promedio numeric(3,2) DEFAULT 0.00,
  
  -- Metadatos
  objetivos_curso text[],
  requisitos_previos text[],
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
  CONSTRAINT cursos_profesor_fkey FOREIGN KEY (profesor_id) 
    REFERENCES public.perfiles(id) ON DELETE CASCADE
);

-- Índices para cursos
CREATE INDEX IF NOT EXISTS idx_cursos_profesor ON public.cursos(profesor_id);
CREATE INDEX IF NOT EXISTS idx_cursos_estado ON public.cursos(estado);
CREATE INDEX IF NOT EXISTS idx_cursos_nivel ON public.cursos(nivel);
CREATE INDEX IF NOT EXISTS idx_cursos_categoria ON public.cursos(categoria);
CREATE INDEX IF NOT EXISTS idx_cursos_destacado ON public.cursos(es_destacado) WHERE es_destacado = true;

-- ============================================
-- 2. TABLA MÓDULOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.modulos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  
  -- Orden
  orden_modulo integer NOT NULL DEFAULT 1,
  
  -- Estadísticas (calculadas automáticamente)
  duracion_total_minutos integer DEFAULT 0,
  numero_temas integer DEFAULT 0,
  
  -- Metadatos
  objetivos_modulo text[],
  
  -- Fechas
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  
  CONSTRAINT modulos_pkey PRIMARY KEY (id),
  CONSTRAINT modulos_curso_fkey FOREIGN KEY (curso_id) 
    REFERENCES public.cursos(id) ON DELETE CASCADE,
  CONSTRAINT modulos_orden_unique UNIQUE (curso_id, orden_modulo)
);

-- Índices para módulos
CREATE INDEX IF NOT EXISTS idx_modulos_curso ON public.modulos(curso_id);
CREATE INDEX IF NOT EXISTS idx_modulos_orden ON public.modulos(curso_id, orden_modulo);

-- ============================================
-- 3. EXTENDER TABLA LECCIONES (Compatibilidad)
-- ============================================
-- Agregar campos opcionales para vincular lecciones con módulos
ALTER TABLE public.lecciones 
  ADD COLUMN IF NOT EXISTS modulo_id uuid,
  ADD COLUMN IF NOT EXISTS orden_tema integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS es_obligatorio boolean DEFAULT true;

-- Foreign key para módulos (opcional - permite lecciones independientes)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lecciones_modulo_fkey'
  ) THEN
    ALTER TABLE public.lecciones 
      ADD CONSTRAINT lecciones_modulo_fkey 
      FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Índices para lecciones
CREATE INDEX IF NOT EXISTS idx_lecciones_modulo ON public.lecciones(modulo_id);
CREATE INDEX IF NOT EXISTS idx_lecciones_orden_tema ON public.lecciones(modulo_id, orden_tema);

-- ============================================
-- 4. TABLA INSCRIPCIONES CURSOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.inscripciones_cursos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  curso_id uuid NOT NULL,
  
  -- Estado
  estado text DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'abandonado')),
  progreso_porcentaje numeric(5,2) DEFAULT 0.00,
  
  -- Estadísticas
  temas_completados integer DEFAULT 0,
  tiempo_total_minutos integer DEFAULT 0,
  
  -- Fechas
  fecha_inscripcion timestamp with time zone DEFAULT now(),
  fecha_ultimo_acceso timestamp with time zone,
  fecha_completado timestamp with time zone,
  
  CONSTRAINT inscripciones_cursos_pkey PRIMARY KEY (id),
  CONSTRAINT inscripciones_usuario_fkey FOREIGN KEY (usuario_id) 
    REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT inscripciones_curso_fkey FOREIGN KEY (curso_id) 
    REFERENCES public.cursos(id) ON DELETE CASCADE,
  CONSTRAINT inscripciones_unique UNIQUE (usuario_id, curso_id)
);

-- Índices para inscripciones
CREATE INDEX IF NOT EXISTS idx_inscripciones_usuario ON public.inscripciones_cursos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_curso ON public.inscripciones_cursos(curso_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_estado ON public.inscripciones_cursos(estado);

-- ============================================
-- 5. EXTENDER PROGRESO LECCIONES
-- ============================================
-- Vincular progreso de lecciones con inscripciones a cursos
ALTER TABLE public.progreso_lecciones 
  ADD COLUMN IF NOT EXISTS inscripcion_curso_id uuid;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'progreso_inscripcion_fkey'
  ) THEN
    ALTER TABLE public.progreso_lecciones
      ADD CONSTRAINT progreso_inscripcion_fkey
      FOREIGN KEY (inscripcion_curso_id) 
      REFERENCES public.inscripciones_cursos(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_progreso_inscripcion ON public.progreso_lecciones(inscripcion_curso_id);

-- ============================================
-- 6. TABLA CALIFICACIONES CURSOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.calificaciones_cursos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  curso_id uuid NOT NULL,
  calificacion integer NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario text,
  fecha_calificacion timestamp with time zone DEFAULT now(),
  
  CONSTRAINT calificaciones_cursos_pkey PRIMARY KEY (id),
  CONSTRAINT calificaciones_cursos_usuario_fkey FOREIGN KEY (usuario_id) 
    REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT calificaciones_cursos_curso_fkey FOREIGN KEY (curso_id) 
    REFERENCES public.cursos(id) ON DELETE CASCADE,
  CONSTRAINT calificaciones_cursos_unique UNIQUE (usuario_id, curso_id)
);

-- Índices para calificaciones
CREATE INDEX IF NOT EXISTS idx_calificaciones_cursos_usuario ON public.calificaciones_cursos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_cursos_curso ON public.calificaciones_cursos(curso_id);

-- ============================================
-- 7. FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar estadísticas de módulo
CREATE OR REPLACE FUNCTION actualizar_estadisticas_modulo()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.modulos
  SET 
    numero_temas = (
      SELECT COUNT(*) 
      FROM public.lecciones 
      WHERE modulo_id = NEW.modulo_id
    ),
    duracion_total_minutos = (
      SELECT COALESCE(SUM(duracion_estimada), 0)
      FROM public.lecciones
      WHERE modulo_id = NEW.modulo_id
    ),
    fecha_actualizacion = now()
  WHERE id = NEW.modulo_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas cuando se agrega/modifica una lección
DROP TRIGGER IF EXISTS trigger_actualizar_modulo ON public.lecciones;
CREATE TRIGGER trigger_actualizar_modulo
  AFTER INSERT OR UPDATE OF modulo_id, duracion_estimada ON public.lecciones
  FOR EACH ROW
  WHEN (NEW.modulo_id IS NOT NULL)
  EXECUTE FUNCTION actualizar_estadisticas_modulo();

-- Función para actualizar estadísticas de curso
CREATE OR REPLACE FUNCTION actualizar_estadisticas_curso()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.cursos
  SET 
    duracion_total_minutos = (
      SELECT COALESCE(SUM(duracion_total_minutos), 0)
      FROM public.modulos
      WHERE curso_id = NEW.curso_id
    ),
    fecha_actualizacion = now()
  WHERE id = NEW.curso_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas del curso
DROP TRIGGER IF EXISTS trigger_actualizar_curso ON public.modulos;
CREATE TRIGGER trigger_actualizar_curso
  AFTER INSERT OR UPDATE OF duracion_total_minutos ON public.modulos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_estadisticas_curso();

-- Función para actualizar progreso de inscripción
CREATE OR REPLACE FUNCTION actualizar_progreso_inscripcion()
RETURNS TRIGGER AS $$
DECLARE
  total_temas integer;
  temas_completados integer;
BEGIN
  IF NEW.inscripcion_curso_id IS NOT NULL THEN
    -- Contar temas totales del curso
    SELECT COUNT(l.id) INTO total_temas
    FROM public.lecciones l
    INNER JOIN public.modulos m ON l.modulo_id = m.id
    INNER JOIN public.inscripciones_cursos ic ON m.curso_id = ic.curso_id
    WHERE ic.id = NEW.inscripcion_curso_id;
    
    -- Contar temas completados (estado_leccion = 'completada')
    SELECT COUNT(*) INTO temas_completados
    FROM public.progreso_lecciones
    WHERE inscripcion_curso_id = NEW.inscripcion_curso_id
      AND estado_leccion = 'completada';
    
    -- Actualizar inscripción
    UPDATE public.inscripciones_cursos
    SET 
      temas_completados = temas_completados,
      progreso_porcentaje = CASE 
        WHEN total_temas > 0 THEN (temas_completados::numeric / total_temas * 100)
        ELSE 0
      END,
      fecha_ultimo_acceso = now(),
      estado = CASE
        WHEN temas_completados >= total_temas AND total_temas > 0 THEN 'completado'
        ELSE estado
      END,
      fecha_completado = CASE
        WHEN temas_completados >= total_temas AND total_temas > 0 AND fecha_completado IS NULL 
        THEN now()
        ELSE fecha_completado
      END
    WHERE id = NEW.inscripcion_curso_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar progreso
DROP TRIGGER IF EXISTS trigger_actualizar_progreso ON public.progreso_lecciones;
CREATE TRIGGER trigger_actualizar_progreso
  AFTER INSERT OR UPDATE OF estado_leccion ON public.progreso_lecciones
  FOR EACH ROW
  WHEN (NEW.inscripcion_curso_id IS NOT NULL)
  EXECUTE FUNCTION actualizar_progreso_inscripcion();

-- ============================================
-- 8. COMENTARIOS
-- ============================================
COMMENT ON TABLE public.cursos IS 'Cursos estructurados con módulos y temas';
COMMENT ON TABLE public.modulos IS 'Módulos que agrupan temas (lecciones) dentro de un curso';
COMMENT ON TABLE public.inscripciones_cursos IS 'Registro de estudiantes inscritos en cursos';
COMMENT ON TABLE public.calificaciones_cursos IS 'Calificaciones y reseñas de cursos';

COMMENT ON COLUMN public.lecciones.modulo_id IS 'Módulo al que pertenece (NULL = lección independiente)';
COMMENT ON COLUMN public.lecciones.orden_tema IS 'Orden dentro del módulo';
COMMENT ON COLUMN public.lecciones.es_obligatorio IS 'Si el tema es obligatorio para completar el curso';

-- ============================================
-- 9. DATOS DE EJEMPLO (OPCIONAL)
-- ============================================
-- Descomentar para crear un curso de ejemplo

/*
-- Insertar curso de ejemplo
INSERT INTO public.cursos (
  titulo, descripcion, nivel, categoria, profesor_id, estado, es_destacado
) VALUES (
  'Náhuatl Básico',
  'Aprende los fundamentos del idioma náhuatl desde cero',
  'principiante',
  'Idioma',
  (SELECT id FROM public.perfiles WHERE rol = 'profesor' LIMIT 1),
  'publicado',
  true
) RETURNING id;

-- Insertar módulos de ejemplo (usar el ID del curso creado)
INSERT INTO public.modulos (curso_id, titulo, descripcion, orden_modulo) VALUES
  ('<CURSO_ID>', 'Saludos y Presentaciones', 'Aprende a saludar y presentarte en náhuatl', 1),
  ('<CURSO_ID>', 'Números y Colores', 'Números básicos y colores en náhuatl', 2),
  ('<CURSO_ID>', 'Familia y Relaciones', 'Vocabulario sobre familia y relaciones sociales', 3);
*/

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
