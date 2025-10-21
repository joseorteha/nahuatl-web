-- ============================================
-- CREAR TABLA DE ESPECIALIDADES Y ARREGLAR NOTIFICACIONES
-- Fecha: 9 de octubre de 2025
-- ============================================

-- PASO 1: Crear tabla de especialidades
CREATE TABLE IF NOT EXISTS public.especialidades_maestros (
  id SERIAL PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  descripcion text,
  icono text,
  activa boolean DEFAULT true,
  orden_display integer DEFAULT 1,
  fecha_creacion timestamp with time zone DEFAULT now()
);

-- PASO 2: Insertar especialidades predefinidas
INSERT INTO public.especialidades_maestros (nombre, descripcion, icono, orden_display) VALUES
('números y matemáticas básicas', 'Enseñanza de números y conceptos matemáticos básicos en náhuatl', '🔢', 1),
('colores y naturaleza', 'Colores, plantas, animales y elementos naturales', '🌈', 2),
('familia y relaciones sociales', 'Vínculos familiares y relaciones interpersonales', '👨‍👩‍👧‍👦', 3),
('comida y gastronomía tradicional', 'Alimentos tradicionales y cocina náhuatl', '🌽', 4),
('animales y fauna', 'Nombres de animales y su relación con la cultura', '🦅', 5),
('ceremonias y tradiciones', 'Rituales, celebraciones y tradiciones ancestrales', '🎭', 6),
('gramática y estructura del idioma', 'Reglas gramaticales y estructura lingüística', '📚', 7),
('historia y cultura mexica', 'Historia del pueblo mexica y su legado', '🏛️', 8),
('medicina tradicional', 'Plantas medicinales y prácticas curativas', '🌿', 9),
('arte y artesanías', 'Expresiones artísticas y técnicas artesanales', '🎨', 10),
('música y danza', 'Expresiones musicales y danzas tradicionales', '🎵', 11),
('otro', 'Otra especialidad (especificar en propuesta)', '📝', 12)
ON CONFLICT (nombre) DO NOTHING;

-- PASO 3: Agregar columna de especialidad_id a solicitudes_maestros
ALTER TABLE public.solicitudes_maestros 
ADD COLUMN IF NOT EXISTS especialidad_id integer REFERENCES public.especialidades_maestros(id);

-- PASO 4: Actualizar constraint de notificaciones para incluir solicitud_maestro
ALTER TABLE public.notificaciones 
DROP CONSTRAINT IF EXISTS notificaciones_relacionado_tipo_check;

ALTER TABLE public.notificaciones 
ADD CONSTRAINT notificaciones_relacionado_tipo_check 
CHECK (relacionado_tipo = ANY (ARRAY[
  'tema'::text, 
  'respuesta'::text, 
  'usuario'::text, 
  'logro'::text, 
  'contribucion'::text, 
  'mensaje_contacto'::text, 
  'solicitud_union'::text,
  'solicitud_maestro'::text
]));

-- PASO 5: Crear índices
CREATE INDEX IF NOT EXISTS idx_especialidades_maestros_activa 
ON public.especialidades_maestros(activa);

CREATE INDEX IF NOT EXISTS idx_solicitudes_maestros_especialidad_id 
ON public.solicitudes_maestros(especialidad_id);

-- ============================================
-- VERIFICACIÓN
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla especialidades_maestros creada';
  RAISE NOTICE '✅ Especialidades predefinidas insertadas';
  RAISE NOTICE '✅ Constraint de notificaciones actualizado';
  RAISE NOTICE '✅ Índices creados';
  RAISE NOTICE 'Sistema listo para especialidades catalogadas';
END $$;