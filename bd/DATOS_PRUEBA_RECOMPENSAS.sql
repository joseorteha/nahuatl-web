-- Script de Prueba para Sistema de Recompensas
-- Ejecutar después de aplicar SISTEMA_RECOMPENSAS.sql

-- Insertar datos de ejemplo en recompensas_usuario
-- (Reemplaza 'usuario-uuid-ejemplo' con un UUID real de tu tabla perfiles)
INSERT INTO public.recompensas_usuario (usuario_id, puntos_totales, nivel, experiencia, contribuciones_aprobadas, likes_recibidos, racha_dias) VALUES
('usuario-uuid-ejemplo', 150, 'contribuidor', 150, 5, 3, 2) 
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
  'usuario-uuid-ejemplo',
  l.id,
  now() - interval '1 day' * (row_number() OVER ()),
  false
FROM public.logros l 
WHERE l.nombre IN ('Primer Paso', 'Contribuidor Activo', 'Voz de la Comunidad')
ON CONFLICT (usuario_id, logro_id) DO NOTHING;

-- Insertar historial de puntos de ejemplo
INSERT INTO public.historial_puntos (usuario_id, puntos_ganados, motivo, descripcion) VALUES
('usuario-uuid-ejemplo', 10, 'Primera contribución', 'Bienvenido al sistema de recompensas'),
('usuario-uuid-ejemplo', 25, 'Contribución aprobada', 'Tu palabra fue aprobada'),
('usuario-uuid-ejemplo', 25, 'Contribución aprobada', 'Tu palabra fue aprobada'),
('usuario-uuid-ejemplo', 25, 'Contribución aprobada', 'Tu palabra fue aprobada'),
('usuario-uuid-ejemplo', 25, 'Contribución aprobada', 'Tu palabra fue aprobada'),
('usuario-uuid-ejemplo', 25, 'Contribución aprobada', 'Tu palabra fue aprobada'),
('usuario-uuid-ejemplo', 15, 'Feedback enviado', 'Gracias por tu retroalimentación'),
('usuario-uuid-ejemplo', 15, 'Like recibido', 'Alguien le gustó tu contribución')
ON CONFLICT DO NOTHING;

-- Query para verificar datos insertados
SELECT 
  r.puntos_totales,
  r.nivel,
  r.contribuciones_aprobadas,
  r.likes_recibidos,
  (SELECT COUNT(*) FROM logros_usuario lu WHERE lu.usuario_id = r.usuario_id) as logros_obtenidos,
  (SELECT COUNT(*) FROM historial_puntos hp WHERE hp.usuario_id = r.usuario_id) as entradas_historial
FROM recompensas_usuario r 
WHERE r.usuario_id = 'usuario-uuid-ejemplo';

-- Query para ver logros obtenidos
SELECT 
  l.nombre,
  l.descripcion,
  l.icono,
  lu.fecha_obtenido
FROM logros_usuario lu
JOIN logros l ON lu.logro_id = l.id
WHERE lu.usuario_id = 'usuario-uuid-ejemplo'
ORDER BY lu.fecha_obtenido DESC;

-- Query para ver historial
SELECT 
  puntos_ganados,
  motivo,
  descripcion,
  fecha_creacion
FROM historial_puntos 
WHERE usuario_id = 'usuario-uuid-ejemplo'
ORDER BY fecha_creacion DESC;

-- INSTRUCCIONES:
-- 1. Primero ejecutar SISTEMA_RECOMPENSAS.sql
-- 2. Reemplazar 'usuario-uuid-ejemplo' con un UUID real de un usuario en tu base de datos
-- 3. Ejecutar este script
-- 4. Ir al perfil del usuario en el frontend para ver los datos
