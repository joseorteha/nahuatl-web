-- ================================================================
-- VERIFICAR EL ESTADO DE LA TABLA PERFILES
-- ================================================================
-- Ejecuta esto en Supabase SQL Editor para verificar la tabla

-- 1. VERIFICAR SI LA TABLA EXISTE
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'perfiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. CONTAR USUARIOS EN TABLA PERFILES
SELECT COUNT(*) as total_perfiles FROM public.perfiles;

-- 3. VER TODOS LOS PERFILES (máximo 10)
SELECT id, nombre_completo, email, fecha_creacion, url_avatar 
FROM public.perfiles 
ORDER BY fecha_creacion DESC 
LIMIT 10;

-- 4. VERIFICAR USUARIOS EN AUTH DE SUPABASE
SELECT count(*) as total_auth_users FROM auth.users;

-- 5. VERIFICAR SI HAY USUARIOS EN AUTH PERO NO EN PERFILES
SELECT 
  u.id as auth_id,
  u.email as auth_email,
  u.created_at as auth_created,
  p.id as perfil_id
FROM auth.users u
LEFT JOIN public.perfiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 6. VERIFICAR POLÍTICAS RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'perfiles';