-- =========================================
-- ARREGLAR EL TRIGGER DE CREACIÓN DE PERFILES
-- =========================================

-- Primero, eliminamos el trigger y la función existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Creamos una función más robusta que maneja casos nulos
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta JSONB;
  nombre TEXT;
  username_val TEXT;
BEGIN
  -- Obtener el metadata del usuario
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  
  -- Extraer nombre completo con fallback
  nombre := COALESCE(meta->>'full_name', 'Usuario Sin Nombre');
  
  -- Extraer username (puede ser null)
  username_val := meta->>'username';
  
  -- Insertar en profiles con manejo de errores
  INSERT INTO profiles (id, full_name, email, username)
  VALUES (
    NEW.id, 
    nombre, 
    NEW.email, 
    CASE 
      WHEN username_val IS NULL OR username_val = '' THEN NULL 
      ELSE username_val 
    END
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay error, al menos intentar insertar con datos mínimos
    INSERT INTO profiles (id, full_name, email)
    VALUES (NEW.id, 'Usuario', NEW.email)
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreamos el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Verificamos que la función existe
SELECT 
  routine_name, 
  routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Verificamos que el trigger existe
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'; 