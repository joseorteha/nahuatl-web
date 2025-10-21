-- Migración para hacer las solicitudes de maestro públicas
-- ============================================

-- 1. Agregar campos para solicitudes públicas
ALTER TABLE public.solicitudes_maestros 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS nombre_completo text;

-- 2. Hacer usuario_id opcional (para solicitudes públicas)
ALTER TABLE public.solicitudes_maestros 
ALTER COLUMN usuario_id DROP NOT NULL;

-- 3. Agregar constraint para asegurar que tenemos email O usuario_id
ALTER TABLE public.solicitudes_maestros 
ADD CONSTRAINT check_solicitud_identity 
CHECK (
  (usuario_id IS NOT NULL) OR 
  (email IS NOT NULL AND nombre_completo IS NOT NULL)
);

-- 4. Crear índice para email
CREATE INDEX IF NOT EXISTS idx_solicitudes_maestros_email 
ON public.solicitudes_maestros(email);

-- 5. Comentarios para documentar los cambios
COMMENT ON COLUMN public.solicitudes_maestros.email IS 'Email para solicitudes públicas (sin cuenta)';
COMMENT ON COLUMN public.solicitudes_maestros.nombre_completo IS 'Nombre completo para solicitudes públicas (sin cuenta)';
COMMENT ON COLUMN public.solicitudes_maestros.usuario_id IS 'ID del usuario autenticado (opcional para solicitudes públicas)';