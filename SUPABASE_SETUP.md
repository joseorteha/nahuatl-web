# 🗄️ Configuración de Supabase para Timumachtikan Nawatl

## 📋 Pasos para Configurar la Base de Datos

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL y la clave anónima (las tienes en tu `.env.local`)

### 2. Ejecutar el SQL de Configuración

1. Ve a tu proyecto de Supabase
2. Navega a **SQL Editor**
3. Copia y pega todo el contenido del siguiente SQL:

```sql
-- =========================================
-- TABLA DE PERFILES DE USUARIOS
-- =========================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_beta_tester BOOLEAN DEFAULT FALSE,
  feedback_count INTEGER DEFAULT 0
);

-- =========================================
-- TABLA DE COMENTARIOS/SUGERENCIAS
-- =========================================
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('suggestion', 'bug_report', 'feature_request', 'general')) DEFAULT 'general',
  status TEXT CHECK (status IN ('pending', 'reviewed', 'implemented', 'declined')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- TABLA DE LIKES EN COMENTARIOS
-- =========================================
CREATE TABLE feedback_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

-- =========================================
-- TABLA DE RESPUESTAS A COMENTARIOS
-- =========================================
CREATE TABLE feedback_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- FUNCIONES Y TRIGGERS
-- =========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_replies_updated_at BEFORE UPDATE ON feedback_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar contador de likes
CREATE OR REPLACE FUNCTION update_feedback_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feedback SET likes_count = likes_count + 1 WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feedback SET likes_count = likes_count - 1 WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para likes
CREATE TRIGGER update_feedback_likes_count_trigger
  AFTER INSERT OR DELETE ON feedback_likes
  FOR EACH ROW EXECUTE FUNCTION update_feedback_likes_count();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =========================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_replies ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para feedback
CREATE POLICY "Anyone can view feedback" ON feedback
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON feedback
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback" ON feedback
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para feedback_likes
CREATE POLICY "Anyone can view likes" ON feedback_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like/unlike" ON feedback_likes
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para feedback_replies
CREATE POLICY "Anyone can view replies" ON feedback_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON feedback_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" ON feedback_replies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" ON feedback_replies
  FOR DELETE USING (auth.uid() = user_id);

-- =========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =========================================
CREATE INDEX idx_feedback_category ON feedback(category);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_likes_feedback_id ON feedback_likes(feedback_id);
CREATE INDEX idx_feedback_replies_feedback_id ON feedback_replies(feedback_id);
```

4. Haz clic en **Run** para ejecutar el SQL

### 3. Configurar Autenticación

1. Ve a **Authentication > Settings**
2. En **Site URL**, agrega: `http://localhost:3000`
3. En **Redirect URLs**, agrega: `http://localhost:3000/auth/callback`
4. Guarda los cambios

### 4. Verificar Configuración

1. Ejecuta el script de verificación:
   ```bash
   cd nahuatl-app/frontend
   npm run check-env
   ```

2. Inicia el servidor:
   ```bash
   npm run dev
   ```

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Usuarios
- Registro con nombre completo, email y contraseña
- Perfiles automáticos creados al registrarse
- Autenticación segura con Supabase Auth

### ✅ Sistema de Feedback
- Crear sugerencias, reportes de errores y solicitudes
- Sistema de likes en comentarios
- Respuestas a comentarios (con soporte para respuestas de admin)
- Categorización por tipo y prioridad
- Estados de seguimiento (pendiente, revisado, implementado, rechazado)

### ✅ Modo Beta
- Solo diccionario disponible
- Página de sugerencias activa
- Lecciones y práctica marcadas como "próximamente"
- Indicadores visuales de estado beta

## 🔧 Configuración Avanzada

### Variables de Entorno Requeridas

```env
# Cliente
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
NEXT_PUBLIC_LAUNCH_MODE=preview
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Servidor
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima
```

### Estructura de la Base de Datos

```
profiles
├── id (UUID, PK)
├── full_name (TEXT, NOT NULL)
├── email (TEXT, UNIQUE, NOT NULL)
├── username (TEXT, UNIQUE)
├── avatar_url (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── is_beta_tester (BOOLEAN)
└── feedback_count (INTEGER)

feedback
├── id (UUID, PK)
├── user_id (UUID, FK)
├── title (TEXT, NOT NULL)
├── content (TEXT, NOT NULL)
├── category (ENUM)
├── status (ENUM)
├── priority (ENUM)
├── likes_count (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

feedback_likes
├── id (UUID, PK)
├── feedback_id (UUID, FK)
├── user_id (UUID, FK)
└── created_at (TIMESTAMP)

feedback_replies
├── id (UUID, PK)
├── feedback_id (UUID, FK)
├── user_id (UUID, FK)
├── content (TEXT, NOT NULL)
├── is_admin_reply (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🚀 Próximos Pasos

1. **Ejecutar el SQL** en tu proyecto de Supabase
2. **Verificar la configuración** con `npm run check-env`
3. **Iniciar el servidor** con `npm run dev`
4. **Probar el registro** de usuarios
5. **Crear sugerencias** en la página de feedback

## 📞 Soporte

Si encuentras problemas:

1. Verifica que el SQL se ejecutó correctamente
2. Revisa los logs de Supabase en la consola
3. Asegúrate de que las variables de entorno estén correctas
4. Verifica que las políticas RLS estén habilitadas 