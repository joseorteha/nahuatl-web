// config/environment.js
require('dotenv').config();

const config = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  
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
};

module.exports = config;
