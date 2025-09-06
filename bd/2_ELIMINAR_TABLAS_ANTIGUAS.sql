-- Script para ELIMINAR las tablas antiguas (en inglés)
-- Ejecuta esto DESPUÉS de hacer el backup

-- Eliminar en orden inverso por las foreign keys
DROP TABLE IF EXISTS public.feedback_replies CASCADE;
DROP TABLE IF EXISTS public.feedback_likes CASCADE;
DROP TABLE IF EXISTS public.saved_words CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.dictionary CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.debug_logs CASCADE;

-- Verificar que las tablas se eliminaron
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'dictionary', 'saved_words', 'feedback', 'feedback_likes', 'feedback_replies', 'debug_logs');
-- Esta consulta debe devolver 0 resultados si todo se eliminó correctamente
