'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Check, X, Smartphone, AlertCircle, Settings } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface PushNotificationSettingsProps {
  className?: string;
}

export default function PushNotificationSettings({ className = '' }: PushNotificationSettingsProps) {
  const { 
    pushSupported, 
    pushSubscribed, 
    subscribeToPush, 
    unsubscribeFromPush, 
    sendTestNotification 
  } = usePWA();

  const [isLoading, setIsLoading] = useState(false);
  const [showTestNotification, setShowTestNotification] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleTogglePush = async () => {
    setIsLoading(true);
    try {
      if (pushSubscribed) {
        const success = await unsubscribeFromPush();
        if (success) {
          setShowTestNotification(false);
        }
      } else {
        const success = await subscribeToPush();
        if (success) {
          setPermission('granted');
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!pushSubscribed) return;
    
    setIsLoading(true);
    try {
      const success = await sendTestNotification();
      if (success) {
        setShowTestNotification(true);
        setTimeout(() => setShowTestNotification(false), 3000);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!pushSupported) {
    return (
      <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              Push Notifications No Disponibles
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Tu navegador no soporta push notifications o estás en modo incógnito.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-200">
              Notificaciones Bloqueadas
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Habilita las notificaciones en la configuración de tu navegador para recibir alertas.
            </p>
            <button 
              className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:underline mt-2"
              onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
            >
              <Settings className="w-4 h-4" />
              Abrir configuración
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${pushSubscribed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
            {pushSubscribed ? (
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Push Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {pushSubscribed ? 'Activas - Recibirás notificaciones' : 'Inactivas - No recibirás notificaciones'}
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={pushSubscribed}
            onChange={handleTogglePush}
            disabled={isLoading}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50"></div>
        </label>
      </div>

      {/* Test notification button */}
      <AnimatePresence>
        {pushSubscribed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Probar notificación
                </span>
              </div>
              
              <button
                onClick={handleTestNotification}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                  />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Enviar Prueba
              </button>
            </div>

            {/* Success message */}
            <AnimatePresence>
              {showTestNotification && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
                >
                  <Check className="w-4 h-4" />
                  Notificación de prueba enviada
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Information */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">¿Qué son las Push Notifications?</p>
            <p>
              Recibirás alertas instantáneas sobre nuevos likes, respuestas, logros y actividad en tu cuenta, 
              incluso cuando la aplicación esté cerrada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}