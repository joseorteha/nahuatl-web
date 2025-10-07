-- =================================================================
-- SCRIPT DE DIAGNÓSTICO COMPLETO PREVIO A LA LIMPIEZA
-- =================================================================
-- Ejecutar ANTES del script de limpieza para identificar TODOS los problemas
-- =================================================================

-- Verificar todos los tipos de notificación existentes
SELECT 'DIAGNÓSTICO: Tipos de notificación' AS categoria,
       tipo_notificacion, 
       COUNT(*) as cantidad
FROM public.notificaciones 
GROUP BY tipo_notificacion
ORDER BY cantidad DESC;

-- Verificar todos los tipos de relacionado_tipo existentes  
SELECT 'DIAGNÓSTICO: Tipos de entidad relacionada' AS categoria,
       relacionado_tipo, 
       COUNT(*) as cantidad
FROM public.notificaciones 
GROUP BY relacionado_tipo
ORDER BY cantidad DESC;

-- Verificar tipos de condición en logros
SELECT 'DIAGNÓSTICO: Tipos de condición en logros' AS categoria,
       condicion_tipo,
       COUNT(*) as cantidad
FROM public.logros 
GROUP BY condicion_tipo
ORDER BY cantidad DESC;

-- Verificar tipos de mención existentes
SELECT 'DIAGNÓSTICO: Tipos de mención' AS categoria,
       tipo_mencion,
       COUNT(*) as cantidad
FROM public.menciones 
GROUP BY tipo_mencion
ORDER BY cantidad DESC;

-- Verificar si existe la columna contador_feedback en perfiles
SELECT 'DIAGNÓSTICO: Columnas en perfiles' AS categoria,
       column_name,
       data_type
FROM information_schema.columns 
WHERE table_name = 'perfiles' 
  AND table_schema = 'public'
  AND column_name IN ('contador_feedback', 'contador_temas')
ORDER BY column_name;

-- ===== PROBLEMAS ESPECÍFICOS =====

-- Verificar notificaciones que serían problemáticas
SELECT 'PROBLEMA: Notificaciones con tipo obsoleto' AS categoria,
       tipo_notificacion,
       relacionado_tipo,
       COUNT(*) as cantidad
FROM public.notificaciones 
WHERE tipo_notificacion IN ('feedback_aprobado', 'feedback_rechazado')
   OR relacionado_tipo IN ('feedback', 'retroalimentacion', 'retroalimentacion_respuesta')
GROUP BY tipo_notificacion, relacionado_tipo
ORDER BY cantidad DESC;

-- Verificar logros con condiciones obsoletas
SELECT 'PROBLEMA: Logros con condiciones obsoletas' AS categoria,
       condicion_tipo,
       COUNT(*) as cantidad
FROM public.logros 
WHERE condicion_tipo = 'feedback_cantidad'
GROUP BY condicion_tipo;

-- Verificar menciones problemáticas
SELECT 'PROBLEMA: Menciones con referencias obsoletas' AS categoria,
       'retroalimentacion_id' as tipo_referencia,
       COUNT(*) as cantidad
FROM public.menciones 
WHERE retroalimentacion_id IS NOT NULL
UNION ALL
SELECT 'PROBLEMA: Menciones con referencias obsoletas' AS categoria,
       'respuesta_id' as tipo_referencia,
       COUNT(*) as cantidad
FROM public.menciones 
WHERE respuesta_id IS NOT NULL;

-- Verificar tipos de mención obsoletos
SELECT 'PROBLEMA: Menciones con tipos obsoletos' AS categoria,
       tipo_mencion,
       COUNT(*) as cantidad
FROM public.menciones 
WHERE tipo_mencion NOT IN ('tema', 'respuesta', 'like')
GROUP BY tipo_mencion;

-- Verificar si existen las tablas que vamos a eliminar
SELECT 'INFO: Tablas existentes' AS categoria,
       schemaname,
       tablename
FROM pg_tables 
WHERE tablename IN (
  'feedback_compartidos',
  'feedback_guardados', 
  'retroalimentacion_hashtags',
  'retroalimentacion_likes',
  'retroalimentacion_respuestas',
  'retroalimentacion'
)
ORDER BY tablename;