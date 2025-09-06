-- Script para LIMPIAR las tablas de backup (OPCIONAL)
-- Ejecuta esto SOLO cuando estés 100% seguro de que todo funciona

DROP TABLE IF EXISTS backup_profiles;
DROP TABLE IF EXISTS backup_dictionary;
DROP TABLE IF EXISTS backup_saved_words;
DROP TABLE IF EXISTS backup_feedback;
DROP TABLE IF EXISTS backup_feedback_likes;
DROP TABLE IF EXISTS backup_feedback_replies;

-- Verificar que se eliminaron los backups
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'backup_%';
