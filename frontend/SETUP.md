# 🚀 Configuración del Proyecto NahuatlApp

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (ya configurada)

## 🔧 Configuración de Variables de Entorno

### 1. Crear archivo .env.local

Crea el archivo `.env.local` en el directorio `nahuatl-app/frontend/` con el siguiente contenido:

```env
# Variables para el Cliente (Navegador)
NEXT_PUBLIC_SUPABASE_URL=https://aiqitkcpdwdbdbeavyys.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpcWl0a2NwZHdkYmRiZWF2eXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTg2MjcsImV4cCI6MjA2NjM3NDYyN30.5pJwPbtPGlGejMkmOK3uf9GLiLtVLahbaxaOVr3vQd8
NEXT_PUBLIC_LAUNCH_MODE=preview
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Variables para el Servidor (Mismas claves, pero sin NEXT_PUBLIC_)
SUPABASE_URL=https://aiqitkcpdwdbdbeavyys.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpcWl0a2NwZHdkYmRiZWF2eXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTg2MjcsImV4cCI6MjA2NjM3NDYyN30.5pJwPbtPGlGejMkmOK3uf9GLiLtVLahbaxaOVr3vQd8
```

### 2. Verificar configuración

Ejecuta el script de verificación:

```bash
npm run check-env
```

## 🏃‍♂️ Ejecutar el Proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar el backend (en una terminal separada)

```bash
cd ../backend
npm install
npm start
```

### 3. Iniciar el frontend

```bash
npm run dev
```

El script `predev` verificará automáticamente las variables de entorno antes de iniciar el servidor.

## 🔍 Solución de Problemas

### Error: "either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!"

**Causa:** Las variables de entorno no están configuradas correctamente.

**Solución:**
1. Verifica que el archivo `.env.local` existe en `nahuatl-app/frontend/`
2. Asegúrate de que no hay espacios extra en las variables
3. Reinicia el servidor después de crear/modificar el archivo
4. Limpia la caché: `rm -rf .next` (Linux/Mac) o `Remove-Item -Recurse -Force .next` (Windows)

### Error: "Module not found"

**Causa:** Dependencias no instaladas o caché corrupta.

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Backend connection failed"

**Causa:** El servidor backend no está ejecutándose.

**Solución:**
1. Asegúrate de que el backend esté corriendo en `http://localhost:3001`
2. Verifica que no hay errores en la consola del backend

## 📁 Estructura del Proyecto

```
nahuatl-app/
├── frontend/                 # Aplicación Next.js
│   ├── .env.local           # Variables de entorno (crear manualmente)
│   ├── src/
│   │   ├── app/             # Páginas de la aplicación
│   │   ├── components/      # Componentes React
│   │   └── lib/             # Utilidades y configuración
│   └── scripts/             # Scripts de utilidad
└── backend/                 # API Express
    ├── data/                # Datos JSON
    └── index.js             # Servidor API
```

## 🎯 Características Implementadas

- ✅ Diccionario inteligente con búsqueda en tiempo real
- ✅ Lecciones estructuradas de náhuatl
- ✅ Sistema de práctica con quizzes dinámicos
- ✅ Autenticación con Supabase (configurada pero opcional)
- ✅ Diseño responsive y moderno
- ✅ Manejo robusto de errores

## 🔧 Configuración Avanzada

### Modo Preview

Para habilitar el modo preview (sin autenticación), asegúrate de que:
```env
NEXT_PUBLIC_LAUNCH_MODE=preview
```

### Modo Desarrollo Completo

Para habilitar todas las funcionalidades:
```env
NEXT_PUBLIC_LAUNCH_MODE=development
```

## 📞 Soporte

Si encuentras problemas:

1. Ejecuta `npm run check-env` para verificar la configuración
2. Revisa los logs del servidor para errores específicos
3. Verifica que todas las dependencias estén instaladas
4. Asegúrate de que tanto el frontend como el backend estén ejecutándose 