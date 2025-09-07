-- Script de Prueba para Sistema de Recompensas
-- Ejecutar después de aplicar SISTEMA_RECOMPENSAS.sql

-- Obtener el UUID del usuario joseortegahac@gmail.com
DO $$ 
DECLARE 
    usuario_uuid uuid;
BEGIN
    -- Buscar el UUID del usuario por email
    SELECT id INTO usuario_uuid 
    FROM public.perfiles 
    WHERE email = 'joseortegahac@gmail.com';
    
    -- Si no se encuentra el usuario, mostrar mensaje
    IF usuario_uuid IS NULL THEN
        RAISE NOTICE 'Usuario con email joseortegahac@gmail.com no encontrado. Asegúrate de que el usuario existe en la tabla perfiles.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usuario encontrado con UUID: %', usuario_uuid;
    
    -- Insertar datos de ejemplo en recompensas_usuario
    INSERT INTO public.recompensas_usuario (usuario_id, puntos_totales, nivel, experiencia, contribuciones_aprobadas, likes_recibidos, racha_dias) VALUES
    (usuario_uuid, 350, 'experto', 350, 15, 8, 5) 
    ON CONFLICT (usuario_id) DO UPDATE SET
      puntos_totales = EXCLUDED.puntos_totales,
      nivel = EXCLUDED.nivel,
      experiencia = EXCLUDED.experiencia,
      contribuciones_aprobadas = EXCLUDED.contribuciones_aprobadas,
      likes_recibidos = EXCLUDED.likes_recibidos,
      racha_dias = EXCLUDED.racha_dias;

    -- Insertar algunos logros obtenidos de ejemplo
    INSERT INTO public.logros_usuario (usuario_id, logro_id, fecha_obtenido, notificado) 
    SELECT 
      usuario_uuid,
      l.id,
      now() - interval '1 day' * (row_number() OVER ()),
      false
    FROM public.logros l 
    WHERE l.nombre IN ('Primer Paso', 'Contribuidor Activo', 'Voz de la Comunidad', 'Experto Lingüista', 'Querido por Todos')
    ON CONFLICT (usuario_id, logro_id) DO NOTHING;

    -- Insertar historial de puntos de ejemplo
    INSERT INTO public.historial_puntos (usuario_id, puntos_ganados, motivo, descripcion) VALUES
    (usuario_uuid, 10, 'Primera contribución', 'Bienvenido al sistema de recompensas'),
    (usuario_uuid, 25, 'Contribución aprobada', 'Palabra "tepoztli" agregada al diccionario'),
    (usuario_uuid, 25, 'Contribución aprobada', 'Palabra "xochitl" agregada al diccionario'),
    (usuario_uuid, 25, 'Contribución aprobada', 'Palabra "calli" agregada al diccionario'),
    (usuario_uuid, 25, 'Contribución aprobada', 'Palabra "atl" agregada al diccionario'),
    (usuario_uuid, 25, 'Contribución aprobada', 'Palabra "tonalli" agregada al diccionario'),
    (usuario_uuid, 25, 'Contribución aprobada', 'Palabra "tlakatl" agregada al diccionario'),
    (usuario_uuid, 25, 'Contribución aprobada', 'Palabra "kualli" agregada al diccionario'),
    (usuario_uuid, 25, 'Contribución aprobada', 'Palabra "itztli" agregada al diccionario'),
    (usuario_uuid, 25, 'Contribución aprobada', 'Palabra "koatl" agregada al diccionario'),
    (usuario_uuid, 25, 'Contribución aprobada', 'Palabra "malinalli" agregada al diccionario'),
    (usuario_uuid, 15, 'Feedback enviado', 'Sugerencia sobre interfaz de usuario'),
    (usuario_uuid, 15, 'Feedback enviado', 'Reporte de error corregido'),
    (usuario_uuid, 10, 'Like recibido', 'Tu contribución "xochitl" fue valorada'),
    (usuario_uuid, 10, 'Like recibido', 'Tu contribución "calli" fue valorada'),
    (usuario_uuid, 10, 'Like recibido', 'Tu contribución "atl" fue valorada'),
    (usuario_uuid, 10, 'Like recibido', 'Tu contribución "tepoztli" fue valorada'),
    (usuario_uuid, 10, 'Like recibido', 'Tu contribución "tonalli" fue valorada'),
    (usuario_uuid, 10, 'Like recibido', 'Tu contribución "tlakatl" fue valorada'),
    (usuario_uuid, 10, 'Like recibido', 'Tu contribución "kualli" fue valorada'),
    (usuario_uuid, 10, 'Like recibido', 'Tu contribución "itztli" fue valorada'),
    (usuario_uuid, 50, 'Logro obtenido', 'Has alcanzado el nivel Experto Lingüista')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Datos de prueba insertados correctamente para el usuario joseortegahac@gmail.com';
    
END $$;

    RAISE NOTICE 'Datos de prueba insertados correctamente para el usuario joseortegahac@gmail.com';
    
END $$;

-- Queries de verificación para el usuario joseortegahac@gmail.com
SELECT 
  p.email,
  r.puntos_totales,
  r.nivel,
  r.contribuciones_aprobadas,
  r.likes_recibidos,
  r.racha_dias,
  (SELECT COUNT(*) FROM logros_usuario lu WHERE lu.usuario_id = r.usuario_id) as logros_obtenidos,
  (SELECT COUNT(*) FROM historial_puntos hp WHERE hp.usuario_id = r.usuario_id) as entradas_historial
FROM recompensas_usuario r 
JOIN perfiles p ON r.usuario_id = p.id
WHERE p.email = 'joseortegahac@gmail.com';

-- Query para ver logros obtenidos
SELECT 
  p.email,
  l.nombre,
  l.descripcion,
  l.icono,
  l.puntos_otorgados,
  lu.fecha_obtenido
FROM logros_usuario lu
JOIN logros l ON lu.logro_id = l.id
JOIN perfiles p ON lu.usuario_id = p.id
WHERE p.email = 'joseortegahac@gmail.com'
ORDER BY lu.fecha_obtenido DESC;

-- Query para ver historial de puntos
SELECT 
  p.email,
  hp.puntos_ganados,
  hp.motivo,
  hp.descripcion,
  hp.fecha_creacion
FROM historial_puntos hp
JOIN perfiles p ON hp.usuario_id = p.id
WHERE p.email = 'joseortegahac@gmail.com'
ORDER BY hp.fecha_creacion DESC;

-- INSTRUCCIONES:
-- 1. Primero ejecutar SISTEMA_RECOMPENSAS.sql en Supabase
-- 2. Asegúrate de que el usuario joseortegahac@gmail.com existe en la tabla perfiles
-- 3. Ejecutar este script completo en el SQL Editor de Supabase
-- 4. Verificar los resultados con las queries de verificación
-- 5. Ir al perfil en el frontend para ver los datos del sistema de recompensas
