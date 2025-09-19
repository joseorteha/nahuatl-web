-- Verificar usuarios en Supabase Auth vs tabla perfiles
-- Ejecutar en Supabase SQL Editor

-- 1. Ver usuarios en auth.users (Supabase Auth)
SELECT 
    id,
    email,
    created_at,
    confirmed_at,
    app_metadata->>'provider' as provider
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Ver usuarios en tabla perfiles (tu tabla custom)
SELECT 
    id,
    email,
    nombre_completo,
    created_at,
    CASE WHEN password_hash IS NULL THEN 'OAuth' ELSE 'Manual' END as tipo_auth
FROM perfiles 
ORDER BY created_at DESC;

-- 3. Encontrar usuarios que están en perfiles pero NO en auth.users
SELECT p.*
FROM perfiles p
LEFT JOIN auth.users au ON p.email = au.email
WHERE au.email IS NULL
  AND p.password_hash IS NOT NULL; -- Solo usuarios con contraseña (no OAuth)