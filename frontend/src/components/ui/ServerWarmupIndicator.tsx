// components/ui/ServerWarmupIndicator.tsx - Indicador de servidor iniciando
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Server, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface ServerWarmupIndicatorProps {
  isWarmingUp: boolean;
  onRetry?: () => void;
  error?: string | null;
}

export default function ServerWarmupIndicator({ 
  isWarmingUp, 
  onRetry,
  error 
}: ServerWarmupIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isWarmingUp) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 90));
      }, 100);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isWarmingUp]);

  if (!isWarmingUp && !error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 max-w-md w-full mx-4"
      >
        <div className="flex items-center gap-3">
          {isWarmingUp ? (
            <Loader2 className="animate-spin text-blue-500" size={24} />
          ) : error ? (
            <AlertCircle className="text-red-500" size={24} />
          ) : (
            <CheckCircle className="text-green-500" size={24} />
          )}
          
          <div className="flex-1">
            {isWarmingUp ? (
              <>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Iniciando servidor...
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  El servidor estaba dormido, despertándolo ahora
                </p>
              </>
            ) : error ? (
              <>
                <h4 className="font-medium text-red-700 dark:text-red-400">
                  Error de conexión
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {error}
                </p>
              </>
            ) : (
              <>
                <h4 className="font-medium text-green-700 dark:text-green-400">
                  ¡Servidor listo!
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conexión establecida correctamente
                </p>
              </>
            )}
          </div>

          {!isWarmingUp && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Server size={20} />
            </button>
          )}
        </div>

        {/* Barra de progreso */}
        {isWarmingUp && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progreso</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Detalles técnicos */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <Zap size={12} />
                  <span>Los servidores gratuitos se duermen tras 15min de inactividad</span>
                </div>
                <div className="flex items-center gap-2">
                  <Server size={12} />
                  <span>Primer arranque puede tomar 30-60 segundos</span>
                </div>
              </div>
              
              {error && onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                >
                  Reintentar conexión
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-ocultar después de success */}
        {!isWarmingUp && !error && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 3, delay: 2 }}
            className="absolute bottom-0 left-0 h-1 bg-green-500 rounded-b-xl origin-left"
            onAnimationComplete={() => {
              // El componente padre debe manejar el ocultado
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}