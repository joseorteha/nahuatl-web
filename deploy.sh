#!/bin/bash

echo "🚀 Iniciando proceso de deploy de Nawatlahtol..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_message() {
    echo -e "${2}${1}${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_message "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto." $RED
    exit 1
fi

print_message "📁 Directorio actual: $(pwd)" $BLUE

# 1. Build del Frontend
print_message "🔨 Construyendo frontend..." $YELLOW
cd frontend
if npm run build; then
    print_message "✅ Frontend construido exitosamente" $GREEN
else
    print_message "❌ Error al construir el frontend" $RED
    exit 1
fi
cd ..

# 2. Verificar dependencias del Backend
print_message "🔍 Verificando dependencias del backend..." $YELLOW
cd backend
if npm install --production; then
    print_message "✅ Dependencias del backend instaladas" $GREEN
else
    print_message "❌ Error al instalar dependencias del backend" $RED
    exit 1
fi
cd ..

# 3. Crear archivos de configuración para producción
print_message "📝 Creando archivos de configuración..." $YELLOW

# Crear .env.production para frontend
cat > frontend/.env.production << EOF
NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}
NEXT_PUBLIC_GOOGLE_CLIENT_ID=\${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
EOF

# Crear .env.production para backend
cat > backend/.env.production << EOF
NODE_ENV=production
PORT=3001
SUPABASE_URL=\${SUPABASE_URL}
SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
JWT_SECRET=\${JWT_SECRET}
GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=\${GOOGLE_CLIENT_SECRET}
CORS_ORIGIN=\${CORS_ORIGIN}
EOF

print_message "✅ Archivos de configuración creados" $GREEN

# 4. Crear archivo de instrucciones de deploy
print_message "📋 Creando instrucciones de deploy..." $YELLOW

cat > DEPLOY_INSTRUCTIONS.md << EOF
# 🚀 Instrucciones de Deploy - Nawatlahtol

## ✅ Build Completado Exitosamente

### 📁 Archivos Generados:
- \`frontend/.next/\` - Build de producción del frontend
- \`frontend/.env.production\` - Variables de entorno del frontend
- \`backend/.env.production\` - Variables de entorno del backend
- \`.github/workflows/deploy.yml\` - GitHub Actions para CI/CD
- \`vercel.json\` - Configuración de Vercel
- \`backend/render.yaml\` - Configuración de Render

### 🎯 Próximos Pasos:

#### 1. **Deploy del Backend en Render:**
1. Ve a [render.com](https://render.com)
2. Conecta tu repositorio de GitHub
3. Selecciona el directorio \`backend/\`
4. Configura las variables de entorno desde \`backend/.env.production\`
5. Deploy automático

#### 2. **Deploy del Frontend en Vercel:**
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Selecciona el directorio \`frontend/\`
4. Configura las variables de entorno desde \`frontend/.env.production\`
5. Deploy automático

#### 3. **Configurar Base de Datos:**
1. Ejecuta el script \`bd/bd.sql\` en Supabase
2. Configura las políticas de seguridad
3. Verifica que todas las tablas estén creadas

### 🔧 Variables de Entorno Requeridas:

#### Frontend (Vercel):
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- \`NEXT_PUBLIC_API_URL\` (URL del backend en Render)
- \`NEXT_PUBLIC_GOOGLE_CLIENT_ID\`

#### Backend (Render):
- \`SUPABASE_URL\`
- \`SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`
- \`JWT_SECRET\`
- \`GOOGLE_CLIENT_ID\`
- \`GOOGLE_CLIENT_SECRET\`
- \`CORS_ORIGIN\` (URL del frontend en Vercel)

### 📞 Soporte:
Si encuentras problemas durante el deploy, revisa:
1. Los logs de Render/Vercel
2. Las variables de entorno
3. La conectividad entre servicios

¡Deploy completado! 🎉
EOF

print_message "✅ Instrucciones de deploy creadas" $GREEN

# 5. Mostrar resumen
print_message "🎉 ¡Deploy preparado exitosamente!" $GREEN
print_message "📋 Revisa DEPLOY_INSTRUCTIONS.md para los próximos pasos" $BLUE
print_message "🔗 URLs esperadas:" $BLUE
print_message "   Frontend: https://your-app.vercel.app" $BLUE
print_message "   Backend: https://your-backend.onrender.com" $BLUE

print_message "✨ ¡Listo para producción!" $GREEN
