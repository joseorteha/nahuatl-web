-- Script para hacer BACKUP de datos antes de la migración
-- Ejecuta esto en Supabase SQL Editor ANTES de eliminar las tablas

-- 1. Backup de perfiles (profiles)
CREATE TABLE backup_profiles AS 
SELECT * FROM profiles;

-- 2. Backup del diccionario (dictionary)
CREATE TABLE backup_dictionary AS 
SELECT * FROM dictionary;

-- 3. Backup de palabras guardadas (saved_words)
CREATE TABLE backup_saved_words AS 
SELECT * FROM saved_words;

-- 4. Backup de retroalimentación (feedback)
CREATE TABLE backup_feedback AS 
SELECT * FROM feedback;

-- 5. Backup de likes de feedback
CREATE TABLE backup_feedback_likes AS 
SELECT * FROM feedback_likes;

-- 6. Backup de respuestas de feedback
CREATE TABLE backup_feedback_replies AS 
SELECT * FROM feedback_replies;

-- VERIFICAR que los backups se crearon correctamente
SELECT 'profiles' as tabla, count(*) as registros FROM backup_profiles
UNION ALL
SELECT 'dictionary' as tabla, count(*) as registros FROM backup_dictionary
UNION ALL
SELECT 'saved_words' as tabla, count(*) as registros FROM backup_saved_words
UNION ALL
SELECT 'feedback' as tabla, count(*) as registros FROM backup_feedback
UNION ALL
SELECT 'feedback_likes' as tabla, count(*) as registros FROM backup_feedback_likes
UNION ALL
SELECT 'feedback_replies' as tabla, count(*) as registros FROM backup_feedback_replies;
