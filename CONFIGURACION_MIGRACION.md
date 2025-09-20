# 🔧 Configuración de la Migración de Autenticación

## 📋 **Pasos Completados ✅**

1. ✅ **Backend actualizado** con JWT y middleware de autenticación
2. ✅ **Frontend actualizado** con nuevo hook `useAuthBackend`
3. ✅ **Dependencias instaladas** en el backend
4. ✅ **Backend funcionando** en puerto 3001
5. ✅ **Frontend iniciado** en puerto 3000

## 🚨 **Configuración Requerida**

### **1. Variables de Entorno del Backend**

Crea o actualiza el archivo `backend/.env` con:

```env
# Configuración de la Base de Datos (ya tienes estas)
SUPABASE_URL=tu_supabase_url_actual
SUPABASE_ANON_KEY=tu_supabase_anon_key_actual

# Configuración del Servidor
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# JWT Configuration (NUEVAS - AGREGAR ESTAS)
JWT_SECRET=tu_jwt_secret_muy_seguro_cambiar_en_produccion_123456789
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro_cambiar_en_produccion_987654321
JWT_EXPIRY=7d
```

### **2. Variables de Entorno del Frontend**

Crea o actualiza el archivo `frontend/.env.local` con:

```env
# URL del Backend (NUEVA - AGREGAR ESTA)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Para producción, usar:
# NEXT_PUBLIC_API_URL=https://nahuatl-web.onrender.com
```

## 🧪 **Pruebas a Realizar**

### **1. Probar Registro**
1. Ve a `http://localhost:3000/login`
2. Cambia a "Registrarse"
3. Completa el formulario
4. Verifica que te redirija al dashboard

### **2. Probar Login**
1. Ve a `http://localhost:3000/login`
2. Inicia sesión con las credenciales creadas
3. Verifica que funcione correctamente

### **3. Probar Navegación**
1. Verifica que el Header muestre tu usuario
2. Prueba navegar entre páginas
3. Verifica que el logout funcione

## 🔄 **Migración de Usuarios Existentes**

### **Opción 1: Migración Automática (Recomendada)**
Los usuarios existentes pueden:
1. Intentar hacer login con sus credenciales actuales
2. Si falla, ir a `/migrate` para migrar su cuenta
3. El sistema detectará automáticamente si necesitan migración

### **Opción 2: Migración Manual**
Si tienes muchos usuarios, puedes crear un script de migración:

```javascript
// Script de migración (ejemplo)
const { supabase } = require('./config/database');
const bcrypt = require('bcrypt');

async function migrateUsers() {
  // Obtener usuarios de Supabase Auth
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  
  for (const authUser of authUsers) {
    // Crear usuario en tu tabla de perfiles
    const hashedPassword = await bcrypt.hash('password_temporal', 10);
    
    await supabase
      .from('perfiles')
      .insert({
        email: authUser.email,
        nombre_completo: authUser.user_metadata?.full_name || 'Usuario',
        password: hashedPassword,
        rol: 'usuario'
      });
  }
}
```

## 🚀 **Despliegue en Producción**

### **1. Backend (Render)**
1. Agrega las nuevas variables de entorno en Render:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `JWT_EXPIRY`

2. Redespliega el backend

### **2. Frontend (Vercel)**
1. Agrega la variable de entorno en Vercel:
   - `NEXT_PUBLIC_API_URL=https://nahuatl-web.onrender.com`

2. Redespliega el frontend

## 🎯 **Ventajas del Nuevo Sistema**

- ✅ **Independencia total** de Supabase Auth
- ✅ **Control completo** sobre la autenticación
- ✅ **JWT seguro** con refresh tokens
- ✅ **Fácil personalización** y extensión
- ✅ **Mejor rendimiento** (menos dependencias)
- ✅ **Escalabilidad** mejorada

## 🆘 **Solución de Problemas**

### **Error: "Token inválido"**
- Verifica que `JWT_SECRET` esté configurado
- Comprueba que el token no haya expirado

### **Error: "CORS"**
- Verifica la configuración CORS en el backend
- Comprueba que `NEXT_PUBLIC_API_URL` esté correcta

### **Error: "Usuario no encontrado"**
- Verifica la conexión a la base de datos
- Comprueba que el usuario existe en la tabla `perfiles`

## 📞 **Siguiente Paso**

Una vez que hayas configurado las variables de entorno:

1. **Reinicia el backend** con las nuevas variables
2. **Reinicia el frontend** con la nueva URL de API
3. **Prueba el sistema** completo
4. **Despliega en producción** cuando esté listo

¡La migración está prácticamente completa! 🎉
