// index.js - Servidor principal refactorizado
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Configuración
const config = require('./config/environment');

// Middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Rutas
const authRoutes = require('./routes/authRoutes');
const dictionaryRoutes = require('./routes/dictionaryRoutes');

// Crear aplicación Express
const app = express();

// ===== MIDDLEWARE GLOBAL =====

// Seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX,
  message: {
    error: 'Demasiadas peticiones',
    message: 'Has excedido el límite de peticiones. Intenta de nuevo en 15 minutos.'
  }
});
app.use(limiter);

// CORS
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

// Parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging en desarrollo
if (config.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ===== RUTAS =====

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '2.2.0'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🌸 Nawatlajtol API v2.2.0',
    description: 'API para la plataforma de aprendizaje de náhuatl',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      dictionary: '/api/dictionary/*'
    },
    docs: 'https://github.com/joseorteha/nahuatl-web/blob/main/backend/README.md'
  });
});

// Registrar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/dictionary', dictionaryRoutes);

// ===== MANEJO DE ERRORES =====

// Middleware para rutas no encontradas
app.use('*', notFoundHandler);

// Middleware global de manejo de errores
app.use(errorHandler);

// ===== INICIAR SERVIDOR =====

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`
🌸 ======================================
   Nawatlajtol API v2.2.0 
🌸 ======================================
✅ Servidor ejecutándose en: http://localhost:${PORT}
🌍 Entorno: ${config.NODE_ENV}
🔒 CORS habilitado para: ${config.CORS_ORIGIN}
📚 Endpoints disponibles:
   - GET  /health
   - POST /api/auth/register
   - POST /api/auth/login
   - GET  /api/auth/profile/:userId
   - PUT  /api/auth/profile/:userId
   - GET  /api/dictionary/search
   - GET  /api/dictionary/saved/:userId
   - POST /api/dictionary/save
   - DEL  /api/dictionary/save
🌸 ======================================
  `);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('❌ Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

module.exports = app;
