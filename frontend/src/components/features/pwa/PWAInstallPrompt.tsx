'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Check, X, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function PWAInstallPrompt() {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    installApp
  } = usePWA();

  const [isInstalling, setIsInstalling] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // No mostrar si ya está instalado
  if (isInstalled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              ¡Nawatlahtol instalado! 🎉
            </p>
            <p className="text-sm text-green-600 dark:text-green-300">
              Ya puedes usar la app desde tu escritorio
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // No mostrar si no es instalable o el usuario ya lo cerró
  if (!isInstallable || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ¡Instala Nawatlahtol!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Instala nuestra app para acceso rápido, notificaciones push y uso sin conexión.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Check className="w-4 h-4 text-green-500" />
                Acceso desde escritorio
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Check className="w-4 h-4 text-green-500" />
                Notificaciones push
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Check className="w-4 h-4 text-green-500" />
                Funciona sin internet
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Check className="w-4 h-4 text-green-500" />
                Actualizaciones automáticas
              </div>
            </div>

            {/* Online Status */}
            <div className="flex items-center gap-2 mb-4">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Conectado - Listo para instalar
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-600 dark:text-orange-400">
                    Sin conexión - Función limitada
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isInstalling ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                />
                Instalando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Instalar App
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowPrompt(false)}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Ahora no
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}