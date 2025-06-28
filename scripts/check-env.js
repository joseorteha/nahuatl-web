// check-env.js

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  // Agrega aquí otras variables que consideres críticas
];

const missing = requiredVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.warn('\x1b[33m[check-env] ADVERTENCIA: Faltan variables de entorno críticas:\x1b[0m');
  missing.forEach((v) => console.warn(`  - ${v}`));
  console.warn('Por favor, revisa tu archivo .env.local antes de iniciar la app.');
  process.exit(0); // No detiene el dev server, solo advierte
} else {
  console.log('[check-env] Todas las variables de entorno críticas están presentes.');
} 