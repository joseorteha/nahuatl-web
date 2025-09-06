-- Script para RESTAURAR datos en las nuevas tablas (español)
-- Ejecuta esto DESPUÉS de crear las nuevas tablas en español

-- 1. Restaurar perfiles
INSERT INTO perfiles (id, nombre_completo, email, username, url_avatar, fecha_creacion, fecha_actualizacion, es_beta_tester, contador_feedback, password)
SELECT id, full_name, email, username, avatar_url, created_at, updated_at, is_beta_tester, feedback_count, password
FROM backup_profiles;

-- 2. Restaurar diccionario
INSERT INTO diccionario (id, word, variants, info_gramatical, definition, nombre_cientifico, examples, synonyms, roots, ver_tambien, ortografias_alternativas, notes, fecha_creacion, fecha_actualizacion, usuario_id)
SELECT id, word, variants, grammar_info, definition, scientific_name, examples, synonyms, roots, see_also, alt_spellings, notes, created_at, updated_at, user_id
FROM backup_dictionary;

-- 3. Restaurar palabras guardadas
INSERT INTO palabras_guardadas (id, usuario_id, diccionario_id, fecha_creacion)
SELECT id, user_id, dictionary_id, created_at
FROM backup_saved_words;

-- 4. Restaurar retroalimentación
INSERT INTO retroalimentacion (id, usuario_id, titulo, contenido, categoria, estado, prioridad, contador_likes, fecha_creacion, fecha_actualizacion)
SELECT id, user_id, title, content, category, status, priority, likes_count, created_at, updated_at
FROM backup_feedback;

-- 5. Restaurar likes de retroalimentación
INSERT INTO retroalimentacion_likes (id, retroalimentacion_id, usuario_id, fecha_creacion)
SELECT id, feedback_id, user_id, created_at
FROM backup_feedback_likes;

-- 6. Restaurar respuestas de retroalimentación
INSERT INTO retroalimentacion_respuestas (id, retroalimentacion_id, usuario_id, contenido, es_respuesta_admin, fecha_creacion, fecha_actualizacion)
SELECT id, feedback_id, user_id, content, is_admin_reply, created_at, updated_at
FROM backup_feedback_replies;

-- VERIFICAR que los datos se restauraron correctamente
SELECT 'perfiles' as tabla, count(*) as registros FROM perfiles
UNION ALL
SELECT 'diccionario' as tabla, count(*) as registros FROM diccionario
UNION ALL
SELECT 'palabras_guardadas' as tabla, count(*) as registros FROM palabras_guardadas
UNION ALL
SELECT 'retroalimentacion' as tabla, count(*) as registros FROM retroalimentacion
UNION ALL
SELECT 'retroalimentacion_likes' as tabla, count(*) as registros FROM retroalimentacion_likes
UNION ALL
SELECT 'retroalimentacion_respuestas' as tabla, count(*) as registros FROM retroalimentacion_respuestas;
