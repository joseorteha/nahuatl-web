-- Verificar estructura de la tabla perfiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'perfiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar las políticas RLS de la tabla perfiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'perfiles';

-- Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  relforcerowsecurity
FROM pg_tables 
JOIN pg_class ON pg_tables.tablename = pg_class.relname
WHERE tablename = 'perfiles';