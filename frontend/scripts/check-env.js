#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de variables de entorno...\n');

const envPath = path.join(__dirname, '..', '.env.local');
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_LAUNCH_MODE',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_API_URL'
];

// Verificar si existe el archivo .env.local
if (!fs.existsSync(envPath)) {
  console.error('❌ Archivo .env.local no encontrado en:', envPath);
  console.log('\n📝 Crea el archivo .env.local con el siguiente contenido:');
  console.log(`
# Variables para el Cliente (Navegador)
NEXT_PUBLIC_SUPABASE_URL=https://aiqitkcpdwdbdbeavyys.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpcWl0a2NwZHdkYmRiZWF2eXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTg2MjcsImV4cCI6MjA2NjM3NDYyN30.5pJwPbtPGlGejMkmOK3uf9GLiLtVLahbaxaOVr3vQd8
NEXT_PUBLIC_LAUNCH_MODE=preview
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Variables para el Servidor (Mismas claves, pero sin NEXT_PUBLIC_)
SUPABASE_URL=https://aiqitkcpdwdbdbeavyys.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpcWl0a2NwZHdkYmRiZWF2eXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTg2MjcsImV4cCI6MjA2NjM3NDYyN30.5pJwPbtPGlGejMkmOK3uf9GLiLtVLahbaxaOVr3vQd8
  `);
  process.exit(1);
}

// Leer y verificar el contenido del archivo
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key] = valueParts.join('=');
    }
  }
});

console.log('📋 Variables encontradas:');
let allGood = true;

requiredVars.forEach(varName => {
  if (envVars[varName]) {
    console.log(`✅ ${varName}: ${envVars[varName].substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: NO ENCONTRADA`);
    allGood = false;
  }
});

if (allGood) {
  console.log('\n🎉 ¡Todas las variables de entorno están configuradas correctamente!');
  console.log('🚀 Puedes ejecutar "npm run dev" ahora.');
} else {
  console.log('\n⚠️  Algunas variables de entorno están faltando.');
  console.log('📝 Asegúrate de que todas las variables requeridas estén en el archivo .env.local');
  process.exit(1);
} 