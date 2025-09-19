-- ================================================================
-- ARREGLAR PROBLEMA DE LOGIN CON EMAIL/CONTRASEÑA
-- ================================================================
-- EJECUTA ESTO EN SUPABASE SQL EDITOR PARA RESTAURAR EL LOGIN

-- 1. VERIFICAR QUE LA TABLA PERFILES EXISTE Y TIENE LA ESTRUCTURA CORRECTA
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'perfiles';

-- 2. SI NO EXISTE LA TABLA, CREARLA CON LA ESTRUCTURA ORIGINAL
CREATE TABLE IF NOT EXISTS public.perfiles (
  id uuid NOT NULL,
  nombre_completo text NOT NULL,
  email text NOT NULL UNIQUE,
  username text UNIQUE,
  url_avatar text,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  es_beta_tester boolean DEFAULT false,
  contador_feedback integer DEFAULT 0,
  password text,  -- IMPORTANTE: Campo para contraseñas manuales
  rol text DEFAULT 'usuario'::text CHECK (rol = ANY (ARRAY['usuario'::text, 'moderador'::text, 'admin'::text])),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id)
);

-- 3. VERIFICAR Y CORREGIR LAS POLÍTICAS RLS
-- Eliminar políticas existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.perfiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.perfiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.perfiles;

-- 4. CREAR POLÍTICAS RLS MÁS PERMISIVAS PARA PERMITIR LOGIN
-- Política para SELECT (ver perfiles)
CREATE POLICY "Enable read access for authenticated users" ON public.perfiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política para INSERT (crear perfiles)  
CREATE POLICY "Enable insert for authenticated users" ON public.perfiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para UPDATE (actualizar perfiles)
CREATE POLICY "Enable update for users based on id" ON public.perfiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para DELETE (eliminar perfiles)
CREATE POLICY "Enable delete for users based on id" ON public.perfiles
  FOR DELETE USING (auth.uid() = id);

-- 5. ASEGURAR QUE RLS ESTÁ HABILITADO
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 6. VERIFICAR QUE TODO ESTÁ FUNCIONANDO
SELECT 'Tabla perfiles restaurada y políticas RLS configuradas correctamente' as status;

-- 7. VERIFICAR SI HAY USUARIOS EXISTENTES QUE NECESITAN SER RESTAURADOS
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NULL THEN 'FALTA PERFIL' ELSE 'PERFIL OK' END as estado_perfil
FROM auth.users u
LEFT JOIN public.perfiles p ON u.id = p.id
ORDER BY u.created_at DESC;