-- =====================================================
-- MIGRACIÓN: Sistema de Lecciones Mejorado
-- Fecha: 2025-10-21
-- Descripción: Agrega soporte para lecciones públicas/privadas
--              y contexto de navegación
-- =====================================================

-- 1. Agregar campos a la tabla lecciones
ALTER TABLE public.lecciones
ADD COLUMN IF NOT EXISTS es_publica boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS es_exclusiva_modulo boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS modulo_exclusivo_id uuid REFERENCES public.modulos(id);

-- 2. Agregar índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_lecciones_es_publica ON public.lecciones(es_publica);
CREATE INDEX IF NOT EXISTS idx_lecciones_modulo_exclusivo ON public.lecciones(modulo_exclusivo_id);

-- 3. Agregar campos a progreso_lecciones para rastrear contexto
ALTER TABLE public.progreso_lecciones
ADD COLUMN IF NOT EXISTS contexto_acceso text DEFAULT 'catalogo' CHECK (contexto_acceso IN ('catalogo', 'modulo', 'curso')),
ADD COLUMN IF NOT EXISTS modulo_id uuid REFERENCES public.modulos(id),
ADD COLUMN IF NOT EXISTS curso_id uuid REFERENCES public.cursos(id);

-- 4. Crear tabla para vincular lecciones con módulos (relación muchos a muchos)
CREATE TABLE IF NOT EXISTS public.modulos_lecciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  modulo_id uuid NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  leccion_id uuid NOT NULL REFERENCES public.lecciones(id) ON DELETE CASCADE,
  orden_en_modulo integer DEFAULT 1,
  es_obligatoria boolean DEFAULT true,
  puntos_requeridos integer DEFAULT 0,
  fecha_agregada timestamp with time zone DEFAULT now(),
  CONSTRAINT modulos_lecciones_pkey PRIMARY KEY (id),
  CONSTRAINT modulos_lecciones_unique UNIQUE (modulo_id, leccion_id)
);

-- 5. Índices para modulos_lecciones
CREATE INDEX IF NOT EXISTS idx_modulos_lecciones_modulo ON public.modulos_lecciones(modulo_id);
CREATE INDEX IF NOT EXISTS idx_modulos_lecciones_leccion ON public.modulos_lecciones(leccion_id);

-- 6. Comentarios para documentación
COMMENT ON COLUMN public.lecciones.es_publica IS 'Si es true, la lección aparece en /lecciones (catálogo público)';
COMMENT ON COLUMN public.lecciones.es_exclusiva_modulo IS 'Si es true, la lección solo existe para un módulo específico';
COMMENT ON COLUMN public.lecciones.modulo_exclusivo_id IS 'ID del módulo al que pertenece exclusivamente (si es_exclusiva_modulo = true)';
COMMENT ON COLUMN public.progreso_lecciones.contexto_acceso IS 'Desde dónde accedió el usuario: catalogo, modulo, o curso';
COMMENT ON COLUMN public.progreso_lecciones.modulo_id IS 'ID del módulo desde el que se accedió (si aplica)';
COMMENT ON COLUMN public.progreso_lecciones.curso_id IS 'ID del curso desde el que se accedió (si aplica)';
COMMENT ON TABLE public.modulos_lecciones IS 'Relación muchos a muchos entre módulos y lecciones';

-- 7. Función para obtener lecciones públicas
CREATE OR REPLACE FUNCTION obtener_lecciones_publicas()
RETURNS TABLE (
  id uuid,
  titulo text,
  descripcion text,
  categoria text,
  nivel text,
  duracion_estimada integer,
  estudiantes_completados integer,
  puntuacion_promedio numeric,
  profesor_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.titulo,
    l.descripcion,
    l.categoria,
    l.nivel,
    l.duracion_estimada,
    l.estudiantes_completados,
    l.puntuacion_promedio,
    l.profesor_id
  FROM public.lecciones l
  WHERE l.es_publica = true 
    AND l.estado = 'publicada'
    AND l.es_exclusiva_modulo = false
  ORDER BY l.fecha_publicacion DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. Función para obtener lecciones de un módulo
CREATE OR REPLACE FUNCTION obtener_lecciones_modulo(p_modulo_id uuid)
RETURNS TABLE (
  id uuid,
  titulo text,
  descripcion text,
  categoria text,
  nivel text,
  duracion_estimada integer,
  orden_en_modulo integer,
  es_obligatoria boolean,
  es_exclusiva boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.titulo,
    l.descripcion,
    l.categoria,
    l.nivel,
    l.duracion_estimada,
    ml.orden_en_modulo,
    ml.es_obligatoria,
    l.es_exclusiva_modulo
  FROM public.lecciones l
  INNER JOIN public.modulos_lecciones ml ON l.id = ml.leccion_id
  WHERE ml.modulo_id = p_modulo_id
    AND l.estado = 'publicada'
  ORDER BY ml.orden_en_modulo ASC;
END;
$$ LANGUAGE plpgsql;

-- 9. Función para registrar progreso con contexto
CREATE OR REPLACE FUNCTION registrar_progreso_leccion(
  p_usuario_id uuid,
  p_leccion_id uuid,
  p_contexto text,
  p_modulo_id uuid DEFAULT NULL,
  p_curso_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_progreso_id uuid;
BEGIN
  -- Buscar progreso existente
  SELECT id INTO v_progreso_id
  FROM public.progreso_lecciones
  WHERE usuario_id = p_usuario_id 
    AND leccion_id = p_leccion_id;
  
  IF v_progreso_id IS NULL THEN
    -- Crear nuevo progreso
    INSERT INTO public.progreso_lecciones (
      usuario_id,
      leccion_id,
      contexto_acceso,
      modulo_id,
      curso_id,
      estado_leccion,
      fecha_inicio
    ) VALUES (
      p_usuario_id,
      p_leccion_id,
      p_contexto,
      p_modulo_id,
      p_curso_id,
      'en_progreso',
      now()
    )
    RETURNING id INTO v_progreso_id;
  ELSE
    -- Actualizar progreso existente
    UPDATE public.progreso_lecciones
    SET 
      fecha_ultima_actividad = now(),
      contexto_acceso = p_contexto,
      modulo_id = COALESCE(p_modulo_id, modulo_id),
      curso_id = COALESCE(p_curso_id, curso_id)
    WHERE id = v_progreso_id;
  END IF;
  
  RETURN v_progreso_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Migrar datos existentes (marcar todas las lecciones actuales como públicas)
UPDATE public.lecciones
SET 
  es_publica = true,
  es_exclusiva_modulo = false
WHERE es_publica IS NULL;

-- 11. Trigger para validar lecciones exclusivas
CREATE OR REPLACE FUNCTION validar_leccion_exclusiva()
RETURNS TRIGGER AS $$
BEGIN
  -- Si es exclusiva de módulo, debe tener modulo_exclusivo_id
  IF NEW.es_exclusiva_modulo = true AND NEW.modulo_exclusivo_id IS NULL THEN
    RAISE EXCEPTION 'Una lección exclusiva de módulo debe tener modulo_exclusivo_id';
  END IF;
  
  -- Si es exclusiva de módulo, no puede ser pública
  IF NEW.es_exclusiva_modulo = true AND NEW.es_publica = true THEN
    NEW.es_publica = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_leccion_exclusiva
  BEFORE INSERT OR UPDATE ON public.lecciones
  FOR EACH ROW
  EXECUTE FUNCTION validar_leccion_exclusiva();

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================

-- Verificación
SELECT 
  'Lecciones públicas' as tipo,
  COUNT(*) as total
FROM public.lecciones
WHERE es_publica = true AND estado = 'publicada'
UNION ALL
SELECT 
  'Lecciones exclusivas' as tipo,
  COUNT(*) as total
FROM public.lecciones
WHERE es_exclusiva_modulo = true;
