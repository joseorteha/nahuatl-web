-- Script para actualizar los tipos de notificación en Supabase
-- Ejecutar este script en el editor SQL de Supabase

-- 1. Primero eliminamos la restricción CHECK actual
ALTER TABLE public.notificaciones 
DROP CONSTRAINT IF EXISTS notificaciones_tipo_notificacion_check;

-- 2. Agregamos la nueva restricción CHECK con todos los tipos corregidos y nuevos
ALTER TABLE public.notificaciones 
ADD CONSTRAINT notificaciones_tipo_notificacion_check 
CHECK (tipo_notificacion = ANY (ARRAY[
    'like_recibido'::text,
    'respuesta_recibida'::text,
    'tema_compartido'::text,           -- ✅ CORREGIDO (antes era 'contenido_compartido')
    'ranking_actualizado'::text,       -- ✅ AGREGADO
    'mencion'::text,
    'nuevo_seguidor'::text,
    'logro_obtenido'::text,
    'puntos_ganados'::text,
    'contribucion_aprobada'::text,
    'contribucion_rechazada'::text,
    'contribucion_publicada'::text,    -- ✅ AGREGADO
    'tema_nuevo_categoria'::text,
    'mensaje_contacto'::text,
    'solicitud_union'::text
]));

-- 3. Verificar que la tabla tenga la estructura correcta
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notificaciones' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar que la restricción se aplicó correctamente
SELECT conname, pg_get_constraintdef(oid) as definicion_restriccion
FROM pg_constraint 
WHERE conrelid = 'public.notificaciones'::regclass 
AND contype = 'c';

-- 5. Consulta de verificación: mostrar todos los tipos de notificación permitidos
SELECT unnest(ARRAY[
    'like_recibido',
    'respuesta_recibida',
    'tema_compartido',
    'ranking_actualizado',
    'mencion',
    'nuevo_seguidor',
    'logro_obtenido',
    'puntos_ganados',
    'contribucion_aprobada',
    'contribucion_rechazada',
    'contribucion_publicada',
    'tema_nuevo_categoria',
    'mensaje_contacto',
    'solicitud_union'
]) as tipos_permitidos;

-- 6. (OPCIONAL) Si tienes notificaciones existentes con tipos incorrectos, puedes corregirlas:
-- UPDATE public.notificaciones 
-- SET tipo_notificacion = 'tema_compartido' 
-- WHERE tipo_notificacion = 'contenido_compartido';

-- 7. (OPCIONAL) Verificar notificaciones existentes por tipo
-- SELECT tipo_notificacion, COUNT(*) as cantidad
-- FROM public.notificaciones 
-- GROUP BY tipo_notificacion 
-- ORDER BY cantidad DESC;