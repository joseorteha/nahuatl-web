-- Eliminar policies existentes para evitar conflictos
DROP POLICY IF EXISTS "Users can read own profile" ON perfiles;
DROP POLICY IF EXISTS "Users can update own profile" ON perfiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON perfiles;

-- Deshabilitar RLS temporalmente para limpieza
ALTER TABLE perfiles DISABLE ROW LEVEL SECURITY;

-- Habilitar RLS
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los usuarios leer su propio perfil
CREATE POLICY "Users can read own profile" ON perfiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Política para permitir a los usuarios insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON perfiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Política para permitir a los usuarios actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON perfiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'perfiles';