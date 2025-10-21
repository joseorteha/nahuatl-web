-- ============================================
-- ACTUALIZACIÓN: Tabla solicitudes_maestros para solicitudes públicas
-- Fecha: 9 de octubre de 2025
-- ============================================

-- PASO 1: Hacer usuario_id opcional (nullable)
ALTER TABLE public.solicitudes_maestros 
ALTER COLUMN usuario_id DROP NOT NULL;

-- PASO 2: Agregar campos para solicitudes públicas
ALTER TABLE public.solicitudes_maestros 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS nombre_completo text;

-- PASO 3: Crear índice en email para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_solicitudes_maestros_email 
ON public.solicitudes_maestros(email);

-- PASO 4: Agregar comentarios para documentar
COMMENT ON COLUMN public.solicitudes_maestros.email IS 'Email para solicitudes públicas (sin cuenta)';
COMMENT ON COLUMN public.solicitudes_maestros.nombre_completo IS 'Nombre completo para solicitudes públicas (sin cuenta)';
COMMENT ON COLUMN public.solicitudes_maestros.usuario_id IS 'ID del usuario autenticado (opcional para solicitudes públicas)';

-- PASO 5: Actualizar políticas RLS para permitir solicitudes públicas
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propias solicitudes" ON public.solicitudes_maestros;

-- Nueva política para permitir solicitudes públicas
CREATE POLICY "Permitir solicitudes públicas y autenticadas" ON public.solicitudes_maestros
  FOR INSERT WITH CHECK (
    -- Solicitud pública: debe tener email y nombre
    (auth.uid() IS NULL AND email IS NOT NULL AND nombre_completo IS NOT NULL) OR
    -- Solicitud autenticada: debe tener usuario_id
    (auth.uid() IS NOT NULL AND auth.uid() = usuario_id)
  );

-- ============================================
-- VERIFICACIÓN
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla solicitudes_maestros actualizada correctamente';
  RAISE NOTICE '- usuario_id ahora es opcional';
  RAISE NOTICE '- Agregados campos: email, nombre_completo';
  RAISE NOTICE '- Políticas RLS actualizadas para solicitudes públicas';
  RAISE NOTICE 'Sistema listo para solicitudes públicas';
END $$;