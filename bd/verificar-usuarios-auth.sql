-- Verificar usuarios en tabla perfiles
-- Ejecutar en Supabase SQL Editor

-- 1. Ver todos los usuarios en tabla perfiles
SELECT 
    id,
    email,
    nombre_completo,
    username,
    fecha_creacion,
    fecha_actualizacion,
    CASE 
        WHEN password IS NULL THEN 'OAuth/Supabase Auth' 
        ELSE 'Password Legacy' 
    END as tipo_auth,
    CASE 
        WHEN url_avatar LIKE '%googleusercontent%' THEN 'Google'
        WHEN url_avatar LIKE '%github%' THEN 'GitHub'
        WHEN url_avatar LIKE '%facebook%' THEN 'Facebook'
        WHEN url_avatar LIKE 'boring-avatar%' THEN 'Generated'
        WHEN url_avatar IS NULL THEN 'Sin Avatar'
        ELSE 'Otro'
    END as tipo_avatar
FROM perfiles 
ORDER BY fecha_creacion DESC;

-- 2. Estadísticas de usuarios
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN password IS NULL THEN 1 END) as usuarios_oauth,
    COUNT(CASE WHEN password IS NOT NULL THEN 1 END) as usuarios_legacy_password,
    COUNT(CASE WHEN url_avatar IS NOT NULL THEN 1 END) as usuarios_con_avatar
FROM perfiles;

-- 3. Usuarios que probablemente necesitan migración a Supabase Auth
-- (tienen password en la tabla pero podrían no estar en Supabase Auth)
SELECT 
    id,
    email,
    nombre_completo,
    fecha_creacion,
    'Necesita migración a Supabase Auth' as estado
FROM perfiles 
WHERE password IS NOT NULL
ORDER BY fecha_creacion DESC;