-- ================================================================
-- ARCHIVO PARA ARREGLAR EL TRIGGER DE SUPABASE
-- ================================================================
-- Ejecuta este SQL en tu Supabase Dashboard → SQL Editor

-- 1. ELIMINAR EL TRIGGER AUTOMÁTICO QUE ESTÁ CAUSANDO PROBLEMAS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. VERIFICAR QUE LA TABLA 'perfiles' EXISTE
-- Si no existe, crear la tabla con la estructura correcta
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
  password text,
  rol text DEFAULT 'usuario'::text CHECK (rol = ANY (ARRAY['usuario'::text, 'moderador'::text, 'admin'::text])),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id)
);

-- 3. HABILITAR RLS (Row Level Security) EN LA TABLA
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS DE SEGURIDAD BÁSICAS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.perfiles;
CREATE POLICY "Users can view their own profile" ON public.perfiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.perfiles;
CREATE POLICY "Users can update their own profile" ON public.perfiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.perfiles;
CREATE POLICY "Users can insert their own profile" ON public.perfiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. CONFIRMAR QUE TODO ESTÁ CONFIGURADO
SELECT 'Trigger eliminado y tabla configurada correctamente' as status;