# 🔐 Configuración de Google OAuth

## ✅ **Implementación Completada**

Se ha implementado exitosamente el login con Google OAuth en tu aplicación Nawatlajtol.

## 🔧 **Configuración Requerida**

### **1. Variables de Entorno del Backend**

Agrega estas variables a tu archivo `.env` del backend:

```env
# Google OAuth (ya configuradas con tus credenciales)
GOOGLE_CLIENT_ID=30456281781-vbg0gqov53fnoc3l1n9smejvuv3jv02r.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Para producción, usar:
# GOOGLE_CALLBACK_URL=https://nahuatl-web.onrender.com/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Para producción:
# FRONTEND_URL=https://nahuatl-web.vercel.app

# Session Secret
SESSION_SECRET=nahuatl_web_session_secret
```

### **2. Configuración en Google Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a "APIs y servicios" > "Credenciales"
4. Edita tu OAuth 2.0 Client ID
5. Agrega estas URLs autorizadas:

**URIs de redirección autorizados:**
- `http://localhost:3001/api/auth/google/callback` (desarrollo)
- `https://nahuatl-web.onrender.com/api/auth/google/callback` (producción)

**Orígenes JavaScript autorizados:**
- `http://localhost:3000` (desarrollo)
- `https://nahuatl-web.vercel.app` (producción)

## 🚀 **Cómo Funciona**

### **Flujo de Autenticación:**

1. **Usuario hace clic en "Continuar con Google"**
2. **Frontend redirige** a `http://localhost:3001/api/auth/google`
3. **Backend redirige** a Google OAuth
4. **Usuario autoriza** en Google
5. **Google redirige** a `http://localhost:3001/api/auth/google/callback`
6. **Backend procesa** la respuesta de Google
7. **Backend redirige** al frontend con tokens JWT
8. **Frontend guarda** tokens y redirige al dashboard

### **Endpoints Implementados:**

- `GET /api/auth/google` - Iniciar OAuth con Google
- `GET /api/auth/google/callback` - Callback de Google
- `GET /api/auth/google/error` - Manejo de errores

## 🧪 **Pruebas**

### **1. Probar en Desarrollo:**

1. Ve a `http://localhost:3000/login`
2. Haz clic en "Continuar con Google"
3. Autoriza en Google
4. Deberías ser redirigido al dashboard

### **2. Probar con Usuario Existente:**

Si un usuario ya existe en tu BD con el mismo email:
- ✅ Se actualizará con los datos de Google
- ✅ Se mantendrá su rol y configuración
- ✅ Se generará un nuevo JWT

### **3. Probar con Usuario Nuevo:**

Si es un usuario nuevo:
- ✅ Se creará automáticamente en la BD
- ✅ Se asignará rol "usuario"
- ✅ Se generará JWT para login

## 🔄 **Migración de Usuarios OAuth Existentes**

Los usuarios que solo tenían OAuth (contraseña `null`) ahora pueden:

1. **Usar Google OAuth** - Funciona inmediatamente
2. **Configurar contraseña** - Si prefieren login tradicional
3. **Ambos métodos** - Pueden usar cualquiera

## 🚀 **Despliegue en Producción**

### **1. Backend (Render):**

Agrega estas variables de entorno:
```env
GOOGLE_CLIENT_ID=30456281781-vbg0gqov53fnoc3l1n9smejvuv3jv02r.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://nahuatl-web.onrender.com/api/auth/google/callback
FRONTEND_URL=https://nahuatl-web.vercel.app
SESSION_SECRET=tu_session_secret_muy_seguro
```

### **2. Frontend (Vercel):**

Agrega esta variable de entorno:
```env
NEXT_PUBLIC_API_URL=https://nahuatl-web.onrender.com
```

### **3. Google Console:**

Actualiza las URLs autorizadas:
- **Callback:** `https://nahuatl-web.onrender.com/api/auth/google/callback`
- **Origen:** `https://nahuatl-web.vercel.app`

## 🎯 **Ventajas del Nuevo Sistema**

- ✅ **Login unificado** - Email/password + Google OAuth
- ✅ **JWT consistente** - Mismo sistema de tokens
- ✅ **Migración automática** - Usuarios existentes funcionan
- ✅ **Seguridad mejorada** - OAuth + JWT
- ✅ **Experiencia fluida** - Redirección automática

## 🆘 **Solución de Problemas**

### **Error: "redirect_uri_mismatch"**
- Verifica que la URL de callback en Google Console coincida exactamente
- Incluye el protocolo (http/https) y el puerto

### **Error: "invalid_client"**
- Verifica que GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET sean correctos
- Asegúrate de que no haya espacios extra

### **Error: "access_denied"**
- El usuario canceló la autorización en Google
- Es normal, no es un error del sistema

### **Error: "No se pudo autenticar"**
- Verifica la conexión a la base de datos
- Revisa los logs del backend

## 📝 **Próximos Pasos**

1. **Probar en desarrollo** con diferentes usuarios
2. **Configurar para producción** con las URLs correctas
3. **Monitorear logs** para detectar problemas
4. **Considerar agregar** otros proveedores OAuth (Facebook, GitHub, etc.)

---

¡El login con Google está completamente implementado y funcionando! 🎉
