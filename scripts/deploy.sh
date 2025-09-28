#!/bin/bash
# Script de despliegue del proyecto Nawatlahtol

echo "🚀 Desplegando Nawatlahtol..."

# Build del frontend
echo "📱 Construyendo frontend..."
cd frontend
npm run build
cd ..

# Verificar que el backend esté funcionando
echo "🔧 Verificando backend..."
cd backend
npm test
cd ..

echo "✅ Despliegue completado!"
echo "🌐 Frontend: https://nahuatl-web.vercel.app"
echo "🔧 Backend: https://nahuatl-web.onrender.com"
