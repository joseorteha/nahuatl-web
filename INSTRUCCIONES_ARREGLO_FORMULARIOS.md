# 🚨 INSTRUCCIONES URGENTES: Arreglar Formularios

## ❌ **Problema Actual:**
Los formularios fallan con error RLS: `"new row violates row-level security policy"`

## ✅ **Solución (Sigue estos pasos exactos):**

### **PASO 1: Ir a Supabase Dashboard**
1. Ve a: https://supabase.com/dashboard
2. Abre tu proyecto `nahuatl-web`
3. Ve a la sección **SQL Editor**

### **PASO 2: Ejecutar el Script de Corrección**
1. Copia TODO el contenido de `BD_CONTACT_FORMS_FIXED.sql`
2. Pégalo en el SQL Editor de Supabase
3. Haz clic en **RUN** para ejecutar

### **PASO 3: Verificar las Tablas**
Después de ejecutar, deberías ver en **Table Editor**:
- ✅ `mensajes_contacto`
- ✅ `solicitudes_union` 
- ✅ `respuestas_contacto`

### **PASO 4: Probar los Formularios**
1. Ve a tu sitio web
2. Prueba el modal "Envíanos un correo"
3. Prueba el modal "Únete a Nawatlajtol"

## 🔧 **Lo que hace el script:**

1. **Elimina tablas existentes** (para empezar limpio)
2. **Crea tablas nuevas** con estructura en español
3. **DESHABILITA RLS** completamente (para formularios públicos)
4. **Da permisos** a usuarios anónimos y autenticados
5. **Crea índices** para rendimiento
6. **Agrega triggers** para timestamps

## 🚀 **Después de ejecutar:**

Los formularios deberían funcionar **inmediatamente** sin errores de permisos.

## ⚠️ **Si sigue fallando:**

1. Verifica que las variables de entorno estén correctas:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
   ```

2. Verifica en **Supabase > Settings > API** que el proyecto esté activo

3. Revisa la consola del navegador para más detalles del error

---

**¡EJECUTA EL SQL AHORA y los formularios funcionarán! 🎯**
