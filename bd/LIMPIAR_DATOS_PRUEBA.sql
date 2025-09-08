-- Script para Limpiar Datos de Prueba del Sistema de Recompensas
-- Ejecutar en Supabase SQL Editor para remover todos los datos de prueba

-- ⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de prueba
-- ⚠️  Solo ejecutar si estás seguro de que quieres limpiar la base de datos

DO $$ 
DECLARE 
    usuario_uuid uuid := 'cfbf1b21-de0c-414f-9a47-f3893da09225';  -- UUID usado en datos de prueba
    usuario_email_uuid uuid;
    total_registros_eliminados integer := 0;
BEGIN
    RAISE NOTICE '🧹 Iniciando limpieza de datos de prueba...';
    RAISE NOTICE '================================';
    
    -- Buscar UUID del usuario por email (joseortegahac@gmail.com)
    SELECT id INTO usuario_email_uuid 
    FROM public.perfiles 
    WHERE email = 'joseortegahac@gmail.com';
    
    -- 1. Limpiar historial_puntos para usuario UUID fijo
    DELETE FROM public.historial_puntos WHERE usuario_id = usuario_uuid;
    GET DIAGNOSTICS total_registros_eliminados = ROW_COUNT;
    RAISE NOTICE '✅ Eliminados % registros de historial_puntos (UUID fijo)', total_registros_eliminados;
    
    -- 2. Limpiar logros_usuario para usuario UUID fijo
    DELETE FROM public.logros_usuario WHERE usuario_id = usuario_uuid;
    GET DIAGNOSTICS total_registros_eliminados = ROW_COUNT;
    RAISE NOTICE '✅ Eliminados % registros de logros_usuario (UUID fijo)', total_registros_eliminados;
    
    -- 3. Limpiar recompensas_usuario para usuario UUID fijo
    DELETE FROM public.recompensas_usuario WHERE usuario_id = usuario_uuid;
    GET DIAGNOSTICS total_registros_eliminados = ROW_COUNT;
    RAISE NOTICE '✅ Eliminados % registros de recompensas_usuario (UUID fijo)', total_registros_eliminados;
    
    -- 4. Si existe usuario por email, limpiar sus datos también
    IF usuario_email_uuid IS NOT NULL THEN
        RAISE NOTICE '📧 Usuario encontrado por email: %', usuario_email_uuid;
        
        -- Limpiar historial_puntos para usuario por email
        DELETE FROM public.historial_puntos WHERE usuario_id = usuario_email_uuid;
        GET DIAGNOSTICS total_registros_eliminados = ROW_COUNT;
        RAISE NOTICE '✅ Eliminados % registros de historial_puntos (por email)', total_registros_eliminados;
        
        -- Limpiar logros_usuario para usuario por email
        DELETE FROM public.logros_usuario WHERE usuario_id = usuario_email_uuid;
        GET DIAGNOSTICS total_registros_eliminados = ROW_COUNT;
        RAISE NOTICE '✅ Eliminados % registros de logros_usuario (por email)', total_registros_eliminados;
        
        -- Limpiar recompensas_usuario para usuario por email
        DELETE FROM public.recompensas_usuario WHERE usuario_id = usuario_email_uuid;
        GET DIAGNOSTICS total_registros_eliminados = ROW_COUNT;
        RAISE NOTICE '✅ Eliminados % registros de recompensas_usuario (por email)', total_registros_eliminados;
    ELSE
        RAISE NOTICE '⚠️  Usuario con email joseortegahac@gmail.com no encontrado';
    END IF;
    
    -- 5. Opcional: Limpiar TODOS los datos de recompensas (descomenta si necesario)
    -- RAISE NOTICE '⚠️  Limpiando TODOS los datos de recompensas...';
    -- DELETE FROM public.historial_puntos;
    -- DELETE FROM public.logros_usuario; 
    -- DELETE FROM public.recompensas_usuario;
    -- RAISE NOTICE '✅ Todos los datos de recompensas eliminados';
    
    RAISE NOTICE '================================';
    RAISE NOTICE '🎉 Limpieza de datos de prueba completada exitosamente';
    RAISE NOTICE '================================';
    
    -- 6. Verificación final - mostrar estado actual
    RAISE NOTICE '📊 Estado actual de las tablas:';
    RAISE NOTICE '   - historial_puntos: % registros', (SELECT COUNT(*) FROM public.historial_puntos);
    RAISE NOTICE '   - logros_usuario: % registros', (SELECT COUNT(*) FROM public.logros_usuario);  
    RAISE NOTICE '   - recompensas_usuario: % registros', (SELECT COUNT(*) FROM public.recompensas_usuario);
    RAISE NOTICE '   - logros (no modificado): % registros', (SELECT COUNT(*) FROM public.logros);
    
END $$;

-- Queries de verificación después de la limpieza
-- Descomenta para ejecutar verificaciones:

/*
-- Verificar que no hay datos de prueba restantes
SELECT 'historial_puntos' as tabla, COUNT(*) as registros FROM public.historial_puntos
UNION ALL
SELECT 'logros_usuario' as tabla, COUNT(*) as registros FROM public.logros_usuario  
UNION ALL
SELECT 'recompensas_usuario' as tabla, COUNT(*) as registros FROM public.recompensas_usuario
UNION ALL
SELECT 'logros' as tabla, COUNT(*) as registros FROM public.logros;

-- Verificar que los logros base siguen existiendo
SELECT nombre, descripcion, icono, puntos_otorgados 
FROM public.logros 
ORDER BY puntos_otorgados;
*/

-- INSTRUCCIONES DE USO:
-- 1. Copia y pega este script completo en el SQL Editor de Supabase
-- 2. Ejecuta el script para limpiar los datos de prueba
-- 3. Descomenta las queries de verificación al final si quieres verificar el estado
-- 4. Los logros base (tabla 'logros') NO se eliminan, solo los datos de usuario
-- 5. Si necesitas limpiar TODO, descomenta la sección marcada como "Opcional"
