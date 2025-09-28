#!/bin/bash
# Script de configuración inicial del proyecto Nawatlahtol

echo "🌸 Configurando Nawatlahtol..."

# Instalar dependencias del frontend
echo "📱 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

# Instalar dependencias del backend
echo "🔧 Instalando dependencias del backend..."
cd backend
npm install
cd ..

# Copiar archivos de configuración
echo "⚙️ Configurando variables de entorno..."
cp config/development.env frontend/.env.local
cp config/development.env backend/.env

echo "✅ Configuración completada!"
echo "🚀 Para iniciar el desarrollo:"
echo "   Frontend: cd frontend && npm run dev"
echo "   Backend: cd backend && npm run dev"
