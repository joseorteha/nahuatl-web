'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Check, CheckCheck, Loader2, RefreshCw, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from './NotificationItem';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // 🔥 Auto-cargar notificaciones cuando se abre
    if (newIsOpen && user) {
      console.log('🔔 NotificationCenter: Abierto, cargando notificaciones...');
      fetchNotifications(true); // Reset y cargar desde cero
      startPolling(); // Iniciar polling automático
    } else if (!newIsOpen) {
      stopPolling(); // Detener polling cuando se cierra
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.leida) {
      await markAsRead(notification.id);
    }
    
    // Opcional: Navegar a la página relacionada
    if (notification.relacionado_tipo && notification.relacionado_id) {
      // TODO: Implementar navegación según el tipo
      console.log('Navegar a:', notification.relacionado_tipo, notification.relacionado_id);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      await fetchNotifications(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    await fetchNotifications(true);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // No mostrar si el usuario no está autenticado
  if (!user) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={handleToggle}
        className={`
          relative p-2 rounded-lg transition-all duration-200 
          ${isOpen 
            ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
          }
        `}
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} no leídas)` : ''}`}
      >
        {unreadCount > 0 ? (
          <Bell className="w-6 h-6" />
        ) : (
          <BellOff className="w-6 h-6" />
        )}
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[1.25rem] h-5 rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                    ({unreadCount} sin leer)
                  </span>
                )}
              </h3>
              
              <div className="flex items-center gap-2">
                {/* Botón de refrescar */}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Refrescar"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>

                {/* Marcar todas como leídas */}
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}

                {/* Cerrar */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Lista de notificaciones */}
            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-500 dark:text-slate-400">
                    Cargando notificaciones...
                  </span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <BellOff className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    No hay notificaciones
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Cuando tengas nuevas notificaciones aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onNotificationClick={() => handleNotificationClick(notification)}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-0 bg-transparent rounded-none"
                    />
                  ))}
                </div>
              )}

              {/* Cargar más */}
              {hasMore && notifications.length > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full py-2 px-4 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Cargando...
                      </span>
                    ) : (
                      'Cargar más notificaciones'
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}