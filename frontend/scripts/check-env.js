// check-env.js
const fs = require('fs');
const path = require('path');

// Cargar manualmente el archivo .env.local
const envPath = path.join(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = requiredVars.filter((v) => !envVars[v]);

  if (missing.length > 0) {
    console.warn('\x1b[33m[check-env] ADVERTENCIA: Faltan variables de entorno críticas:\x1b[0m');
    missing.forEach((v) => console.warn(`  - ${v}`));
    console.warn('Por favor, revisa tu archivo .env.local antes de iniciar la app.');
  } else {
    console.log('\x1b[32m[check-env] ✓ Todas las variables de entorno críticas están presentes.\x1b[0m');
  }
} else {
  console.warn('\x1b[33m[check-env] ADVERTENCIA: No se encontró el archivo .env.local\x1b[0m');
} 