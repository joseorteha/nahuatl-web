-- Script para Reset Completo del Sistema de Recompensas
-- ⚠️  PELIGRO: Este script eliminará TODO el sistema de recompensas
-- ⚠️  Solo usar para reset completo en desarrollo

-- OPCIÓN 1: Solo limpiar datos de usuarios (mantener estructura)
-- Descomenta si solo quieres limpiar datos pero mantener las tablas y logros

/*
DO $$ 
BEGIN
    RAISE NOTICE '🧹 Limpiando solo datos de usuarios...';
    
    -- Eliminar todos los datos de usuarios pero mantener logros base
    DELETE FROM public.historial_puntos;
    DELETE FROM public.logros_usuario;
    DELETE FROM public.recompensas_usuario;
    
    RAISE NOTICE '✅ Datos de usuarios eliminados. Logros base mantenidos.';
    RAISE NOTICE 'Logros disponibles: %', (SELECT COUNT(*) FROM public.logros);
END $$;
*/

-- OPCIÓN 2: Reset completo (eliminar tablas y recrear)
-- ⚠️  SOLO para desarrollo - eliminará TODO el sistema

DO $$ 
BEGIN
    RAISE NOTICE '💥 RESET COMPLETO del sistema de recompensas...';
    RAISE NOTICE '⚠️  Esto eliminará TODAS las tablas y datos relacionados';
    
    -- Eliminar triggers primero
    DROP TRIGGER IF EXISTS actualizar_fecha_modificacion_recompensas ON public.recompensas_usuario;
    DROP TRIGGER IF EXISTS actualizar_fecha_modificacion_logros_usuario ON public.logros_usuario;
    
    -- Eliminar funciones
    DROP FUNCTION IF EXISTS public.actualizar_fecha_modificacion();
    DROP FUNCTION IF EXISTS public.calcular_nivel_usuario(integer);
    DROP FUNCTION IF EXISTS public.verificar_logros_usuario(uuid);
    DROP FUNCTION IF EXISTS public.procesar_puntos_usuario(uuid, integer, text, text);
    
    -- Eliminar índices
    DROP INDEX IF EXISTS idx_recompensas_usuario_puntos;
    DROP INDEX IF EXISTS idx_recompensas_usuario_nivel;
    DROP INDEX IF EXISTS idx_logros_usuario_fecha;
    DROP INDEX IF EXISTS idx_historial_puntos_fecha;
    DROP INDEX IF EXISTS idx_historial_puntos_motivo;
    
    -- Eliminar tablas (en orden correcto por dependencias)
    DROP TABLE IF EXISTS public.historial_puntos CASCADE;
    DROP TABLE IF EXISTS public.logros_usuario CASCADE;
    DROP TABLE IF EXISTS public.recompensas_usuario CASCADE;
    DROP TABLE IF EXISTS public.logros CASCADE;
    
    -- Eliminar tipos personalizados
    DROP TYPE IF EXISTS nivel_usuario CASCADE;
    DROP TYPE IF EXISTS motivo_puntos CASCADE;
    
    RAISE NOTICE '💥 Sistema de recompensas eliminado completamente';
    RAISE NOTICE '🔄 Para reinstalar, ejecuta SISTEMA_RECOMPENSAS.sql';
    
END $$;

-- INSTRUCCIONES:
-- 1. OPCIÓN 1: Descomenta la primera sección para solo limpiar datos de usuarios
-- 2. OPCIÓN 2: La segunda sección hace reset completo (por defecto)
-- 3. Después del reset completo, debes ejecutar SISTEMA_RECOMPENSAS.sql nuevamente
-- 4. SOLO usar en desarrollo - NUNCA en producción

-- Verificación después del reset
SELECT 
    schemaname, 
    tablename 
FROM pg_tables 
WHERE tablename IN ('recompensas_usuario', 'logros_usuario', 'historial_puntos', 'logros')
    AND schemaname = 'public';
