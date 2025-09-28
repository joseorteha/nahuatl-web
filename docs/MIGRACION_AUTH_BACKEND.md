# 🔄 Migración de Autenticación a Backend Propio

## 📋 Resumen de la Migración

Se ha migrado completamente el sistema de autenticación de Supabase Auth a un sistema propio basado en JWT y el backend de Express.js.

## 🚀 Cambios Implementados

### Backend (Express.js)

#### 1. **Nuevas Dependencias**
```json
{
  "jsonwebtoken": "^9.0.2",
  "express-validator": "^7.0.1"
}
```

#### 2. **Nuevo Middleware de Autenticación**
- **Archivo**: `backend/middleware/auth.js`
- **Funciones**:
  - `authenticateToken`: Verifica JWT tokens
  - `optionalAuth`: Autenticación opcional
  - `requireAdmin`: Verifica roles de administrador
  - `generateToken`: Genera tokens de acceso
  - `generateRefreshToken`: Genera tokens de renovación

#### 3. **Controlador de Autenticación Actualizado**
- **Archivo**: `backend/controllers/authController.js`
- **Nuevas funcionalidades**:
  - Generación de JWT en login/registro
  - Endpoint de renovación de tokens (`/api/auth/refresh`)
  - Endpoint de logout (`/api/auth/logout`)

#### 4. **Rutas Actualizadas**
- **Archivo**: `backend/routes/authRoutes.js`
- **Protección**: Rutas protegidas con middleware JWT
- **Validación**: Middleware de validación mejorado

#### 5. **Variables de Entorno**
```env
JWT_SECRET=tu_jwt_secret_muy_seguro_cambiar_en_produccion
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro_cambiar_en_produccion
JWT_EXPIRY=7d
```

### Frontend (Next.js)

#### 1. **Nuevo Hook de Autenticación**
- **Archivo**: `frontend/src/hooks/useAuthBackend.ts`
- **Funcionalidades**:
  - Login/registro con backend
  - Gestión automática de tokens
  - Renovación automática de tokens
  - Llamadas API con autenticación

#### 2. **Nuevo Formulario de Autenticación**
- **Archivo**: `frontend/src/app/login/auth-form-backend.tsx`
- **Características**:
  - Interfaz idéntica al anterior
  - Integración con backend
  - Validación en tiempo real
  - Manejo de errores mejorado

#### 3. **Componentes Actualizados**
- **Header**: Usa `useAuthBackend` en lugar de `useAuth`
- **Dashboard**: Adaptado al nuevo sistema de usuario
- **Página de Login**: Usa el nuevo formulario

## 🔧 Configuración Requerida

### 1. **Variables de Entorno del Backend**
Agregar a tu archivo `.env` en el backend:
```env
JWT_SECRET=tu_jwt_secret_muy_seguro_cambiar_en_produccion
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro_cambiar_en_produccion
JWT_EXPIRY=7d
```

### 2. **Variables de Entorno del Frontend**
Agregar a tu archivo `.env.local` en el frontend:
```env
NEXT_PUBLIC_API_URL=https://nahuatl-web.onrender.com
```

### 3. **Instalación de Dependencias**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## 🎯 Ventajas del Nuevo Sistema

### ✅ **Independencia Total**
- No depende de Supabase Auth
- Control completo sobre la autenticación
- Personalización ilimitada

### ✅ **Seguridad Mejorada**
- JWT con expiración configurable
- Refresh tokens para sesiones largas
- Validación en cada request

### ✅ **Rendimiento**
- Menos dependencias externas
- Llamadas directas al backend
- Caché local de tokens

### ✅ **Escalabilidad**
- Fácil integración con otros servicios
- Control total sobre la base de datos
- Posibilidad de migrar a otros proveedores

## 🔄 Flujo de Autenticación

### 1. **Registro**
```
Frontend → POST /api/auth/register → Backend
Backend → Hash password → Save to DB → Generate JWT
Backend → Return user + tokens → Frontend
Frontend → Store tokens → Redirect to dashboard
```

### 2. **Login**
```
Frontend → POST /api/auth/login → Backend
Backend → Verify credentials → Generate JWT
Backend → Return user + tokens → Frontend
Frontend → Store tokens → Redirect to dashboard
```

### 3. **Request Autenticado**
```
Frontend → API call with Bearer token → Backend
Backend → Verify JWT → Process request
Backend → Return data → Frontend
```

### 4. **Renovación de Token**
```
Frontend → POST /api/auth/refresh → Backend
Backend → Verify refresh token → Generate new tokens
Backend → Return new tokens → Frontend
Frontend → Update stored tokens
```

## 🚨 Consideraciones Importantes

### 1. **Migración de Usuarios Existentes**
- Los usuarios existentes en Supabase seguirán funcionando
- Se recomienda migrar gradualmente
- Considerar un script de migración masiva

### 2. **Seguridad**
- Cambiar los secrets JWT en producción
- Usar HTTPS en producción
- Considerar implementar blacklist de tokens

### 3. **Monitoreo**
- Implementar logs de autenticación
- Monitorear intentos de login fallidos
- Alertas de seguridad

## 📝 Próximos Pasos

1. **Probar el sistema** en desarrollo
2. **Configurar variables de entorno** en producción
3. **Migrar usuarios existentes** (opcional)
4. **Implementar monitoreo** y logs
5. **Considerar funcionalidades adicionales**:
   - Reset de contraseña
   - Verificación de email
   - 2FA (autenticación de dos factores)

## 🆘 Solución de Problemas

### Error: "Token inválido"
- Verificar que JWT_SECRET esté configurado
- Comprobar que el token no haya expirado
- Verificar formato del token

### Error: "Usuario no encontrado"
- Verificar que el usuario existe en la BD
- Comprobar la conexión a la base de datos
- Verificar permisos de la BD

### Error: "CORS"
- Verificar configuración CORS en el backend
- Comprobar URLs permitidas
- Verificar headers de autenticación

---

¡La migración está completa! 🎉 Ahora tienes un sistema de autenticación completamente independiente y controlado por ti.
