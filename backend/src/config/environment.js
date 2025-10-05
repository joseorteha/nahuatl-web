// config/environment.js
require('dotenv').config();

const config = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  
  // Push Notifications
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  
  // CORS - Permite múltiples orígenes
  CORS_ORIGIN: process.env.CORS_ORIGIN ? 
    process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
    ['http://localhost:3000', 'https://nahuatl-web.vercel.app'],
  
  // Rate limiting - Usar valores numéricos directos
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // minutos a ms
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100, // requests per window
  
  // File paths
  DICTIONARY_PATH: './data/dictionary.json',
  
  // Pagination
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '30d',
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://nahuatl-web.vercel.app',
  
  // Session Configuration
  SESSION_SECRET: process.env.SESSION_SECRET,
};

// Validar variables críticas en producción
if (process.env.NODE_ENV === 'production') {
  const requiredVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET', 
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'SESSION_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ ERROR: Variables de entorno críticas no configuradas en producción:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    process.exit(1);
  }
}

module.exports = config;
