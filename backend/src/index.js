// index.js - Servidor principal refactorizado
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const session = require('express-session');

// Configuración
const config = require('./config/environment');

// Middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { passport } = require('./config/googleOAuth');

// Rutas
const authRoutes = require('./routes/authRoutes');
const dictionaryRoutes = require('./routes/dictionaryRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const temasRoutes = require('./routes/temas');
const adminRoutes = require('./routes/adminRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const recompensasRoutes = require('./routes/recompensasRoutes');
const socialRoutes = require('./routes/socialRoutes');
const temasStatsRoutes = require('./routes/temas-stats');
const experienciaSocialRoutes = require('./routes/experiencia-social');
const usuariosRoutes = require('./routes/usuarios');
const dashboardRoutes = require('./routes/dashboard');
const leccionesRoutes = require('./routes/lecciones');
const profileRoutes = require('./routes/profileRoutes');
const logrosRoutes = require('./routes/logrosRoutes');
const pushNotificationRoutes = require('./routes/pushNotificationRoutes');
const healthRoutes = require('./routes/healthRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Crear aplicación Express
const app = express();

// ===== MIDDLEWARE GLOBAL =====

// Seguridad
app.use(helmet());

// Rate limiting - Configuración MÁS PERMISIVA para producción inicial
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 500 : 1000, // 500 en prod, 1000 en dev
  message: {
    error: 'Demasiadas peticiones',
    message: 'Has excedido el límite de peticiones. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS - Configuración mejorada
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.CORS_ORIGIN;
    console.log('CORS: Checking origin:', origin);
    console.log('CORS: Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS: Origin no permitido:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Configuración de codificación UTF-8
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// Middleware para asegurar UTF-8 en todas las respuestas
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Configuración de sesiones para OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'nahuatl_web_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

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
    version: '2.2.1', // ✨ INCREMENTADO PARA FORZAR REDESPLIEGUE
    cors_enabled: true,
    credentials_support: true
  });
});

// Ruta de salud con prefijo API (para compatibilidad)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '2.2.1', // ✨ INCREMENTADO PARA FORZAR REDESPLIEGUE
    cors_enabled: true,
    credentials_support: true
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🌸 Nawatlajtol API v2.2.1', // ✨ ACTUALIZADO
    description: 'API para la plataforma de aprendizaje de náhuatl',
    cors_support: 'enabled with credentials',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      dictionary: '/api/dictionary/*',
      // feedback: '/api/feedback/*', // Deshabilitado - usando sistema de temas
      temas: '/api/temas/*',
      admin: '/api/admin/*',
      contributions: '/api/contributions/*',
      recompensas: '/api/recompensas/*',
      social: '/api/social/*',
      profile: '/api/profile/*',
      logros: '/api/logros/*',
      push: '/api/push/*'
    },
    docs: 'https://github.com/joseorteha/nahuatl-web/blob/main/backend/README.md'
  });
});

// Registrar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/dictionary', dictionaryRoutes);
// app.use('/api/feedback', feedbackRoutes); // Deshabilitado - usando sistema de temas
app.use('/api/temas', temasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/contribuciones', contributionRoutes); // Alias en español
app.use('/api/recompensas', recompensasRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/temas-stats', temasStatsRoutes);
app.use('/api/experiencia-social', experienciaSocialRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lecciones', leccionesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/logros', logrosRoutes);
app.use('/api/push', pushNotificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/health', healthRoutes);

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
   - GET  /api/recompensas/usuario/:userId
   - GET  /api/recompensas/ranking
   - POST /api/recompensas/procesar
   - GET  /api/recompensas/historial/:userId
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
