-- Script de Prueba para Sistema de Recompensas - Usuario Actual
-- Ejecutar después de aplicar SISTEMA_RECOMPENSAS.sql

-- Usar el UUID del usuario actual
DO $$ 
DECLARE 
    usuario_uuid uuid := 'cfbf1b21-de0c-414f-9a47-f3893da09225';
    logro_primer_paso_id uuid;
    logro_contribuidor_activo_id uuid;
    logro_explorador_id uuid;
BEGIN
    RAISE NOTICE 'Configurando datos de prueba para usuario UUID: %', usuario_uuid;
    
    -- Obtener IDs de logros
    SELECT id INTO logro_primer_paso_id FROM public.logros WHERE nombre = 'Primer Paso';
    SELECT id INTO logro_contribuidor_activo_id FROM public.logros WHERE nombre = 'Contribuidor Activo';
    SELECT id INTO logro_explorador_id FROM public.logros WHERE nombre = 'Explorador de Palabras';
    
    -- Limpiar datos existentes del usuario (por si ya existen)
    DELETE FROM public.historial_puntos WHERE usuario_id = usuario_uuid;
    DELETE FROM public.logros_usuario WHERE usuario_id = usuario_uuid;
    DELETE FROM public.recompensas_usuario WHERE usuario_id = usuario_uuid;
    
    -- Insertar datos de ejemplo en recompensas_usuario
    INSERT INTO public.recompensas_usuario (usuario_id, puntos_totales, nivel, experiencia, contribuciones_aprobadas, likes_recibidos, racha_dias) VALUES
    (usuario_uuid, 350, 'experto', 350, 15, 8, 5);
    
    -- Insertar historial de puntos de ejemplo
    INSERT INTO public.historial_puntos (usuario_id, puntos_ganados, motivo, descripcion, fecha_creacion) VALUES
    (usuario_uuid, 10, 'contribucion_diccionario', 'Nueva palabra contribuida: "cualli"', NOW() - INTERVAL '3 days'),
    (usuario_uuid, 5, 'contribucion_aprobada', 'Contribución aprobada por moderador', NOW() - INTERVAL '2 days'),
    (usuario_uuid, 2, 'like_recibido', 'Like recibido en contribución', NOW() - INTERVAL '1 day'),
    (usuario_uuid, 3, 'feedback_comunidad', 'Feedback enviado sobre la aplicación', NOW() - INTERVAL '5 hours'),
    (usuario_uuid, 1, 'palabra_guardada', 'Nueva palabra guardada', NOW() - INTERVAL '1 hour');
    
    -- Insertar logros obtenidos (usando UUIDs reales)
    IF logro_primer_paso_id IS NOT NULL THEN
        INSERT INTO public.logros_usuario (usuario_id, logro_id, fecha_obtenido) VALUES
        (usuario_uuid, logro_primer_paso_id, NOW() - INTERVAL '2 days');
    END IF;
    
    IF logro_contribuidor_activo_id IS NOT NULL THEN
        INSERT INTO public.logros_usuario (usuario_id, logro_id, fecha_obtenido) VALUES
        (usuario_uuid, logro_contribuidor_activo_id, NOW() - INTERVAL '1 day');
    END IF;
    
    IF logro_explorador_id IS NOT NULL THEN
        INSERT INTO public.logros_usuario (usuario_id, logro_id, fecha_obtenido) VALUES
        (usuario_uuid, logro_explorador_id, NOW() - INTERVAL '3 hours');
    END IF;
    
    RAISE NOTICE 'Datos de prueba insertados exitosamente para el usuario %', usuario_uuid;
END $$;
