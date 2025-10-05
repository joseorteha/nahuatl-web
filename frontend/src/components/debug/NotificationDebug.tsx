'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useErrorMonitor } from '@/utils/errorMonitor';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, User, Bell, AlertTriangle, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function NotificationDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { notifications, unreadCount, loading, error } = useNotifications();
  const { errors, recentErrors, clearErrors } = useErrorMonitor();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors"
        title="Debug Notificaciones"
      >
        {isVisible ? <EyeOff className="w-5 h-5" /> : <Bug className="w-5 h-5" />}
      </button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-4"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Bug className="w-5 h-5 mr-2" />
              Debug: Sistema de Notificaciones
            </h3>

            {/* Estado de Autenticación */}
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <h4 className="font-semibold flex items-center mb-2">
                <User className="w-4 h-4 mr-2" />
                Autenticación
              </h4>
              <div className="text-sm space-y-1">
                <div>Usuario: {user ? '✅ Conectado' : '❌ No conectado'}</div>
                <div>User ID: {user?.id || 'N/A'}</div>
                <div>Auth: {user ? '✅ Autenticado' : '❌ No autenticado'}</div>
                <div>Email: {user?.email || 'N/A'}</div>
              </div>
            </div>

            {/* Estado de Notificaciones */}
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <h4 className="font-semibold flex items-center mb-2">
                <Bell className="w-4 h-4 mr-2" />
                Notificaciones
              </h4>
              <div className="text-sm space-y-1">
                <div>Loading: {loading ? '🔄 Cargando...' : '✅ Listo'}</div>
                <div>Error: {error ? `❌ ${error}` : '✅ Sin errores'}</div>
                <div>Total: {notifications?.length || 0}</div>
                <div>No leídas: {unreadCount || 0}</div>
                <div>Primeras 3:</div>
                <ul className="ml-4 text-xs">
                  {notifications?.slice(0, 3).map((notif, i) => (
                    <li key={i} className="truncate">
                      • {notif.tipo_notificacion}: {notif.mensaje?.substring(0, 30)}...
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Errores Recientes */}
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="font-semibold flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Errores Recientes ({recentErrors.length})
              </h4>
              {recentErrors.length === 0 ? (
                <div className="text-sm text-green-600 dark:text-green-400">
                  ✅ No hay errores recientes
                </div>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {recentErrors.slice(-3).map((error, i) => (
                    <div key={i} className="text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded">
                      <div className="font-medium">{error.message}</div>
                      <div className="text-gray-500">
                        {error.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.length > 0 && (
                <button
                  onClick={clearErrors}
                  className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Limpiar errores
                </button>
              )}
            </div>

            {/* Acciones de Debug */}
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 p-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reload
              </button>
              <button
                onClick={() => console.log('🐛 DEBUG INFO:', { user, notifications, errors })}
                className="flex-1 p-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                Log All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}