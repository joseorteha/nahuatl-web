// routes/healthRoutes.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const os = require('os');

/**
 * GET /health - Health check básico
 */
router.get('/', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    service: 'Nawatlahtol API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.status(200).json(healthcheck);
});

/**
 * GET /health/detailed - Health check detallado
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('perfiles')
      .select('count(*)')
      .limit(1);
    
    const dbStatus = error ? 'unhealthy' : 'healthy';
    const responseTime = Date.now() - startTime;
    
    const healthcheck = {
      service: 'Nawatlahtol API',
      status: dbStatus === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: dbStatus,
          responseTime: `${responseTime}ms`,
          ...(error && { error: 'Database connection failed' })
        },
        memory: {
          status: 'healthy',
          usage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          free: `${Math.round(os.freemem() / 1024 / 1024)}MB`
        },
        cpu: {
          status: 'healthy',
          load: os.loadavg()
        }
      }
    };
    
    const statusCode = dbStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthcheck);
    
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      service: 'Nawatlahtol API',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * GET /health/ready - Readiness probe (for K8s/Docker)
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if app is ready to serve requests
    const { error } = await supabase
      .from('perfiles')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      return res.status(503).json({
        status: 'not ready',
        message: 'Database not accessible'
      });
    }
    
    res.status(200).json({
      status: 'ready',
      message: 'Service is ready to serve requests'
    });
    
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      message: 'Service initialization failed'
    });
  }
});

module.exports = router;