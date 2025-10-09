'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { robustApiCall } from '@/lib/utils/apiUtils';

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo_notificacion: 'like_recibido' | 'respuesta_recibida' | 'mencion' | 'nuevo_seguidor' | 'logro_obtenido' | 'contribucion_aprobada' | 'contribucion_rechazada' | 'contribucion_publicada' | 'puntos_ganados';
  titulo: string;
  mensaje: string;
  relacionado_id?: string;
  relacionado_tipo?: 'tema' | 'respuesta' | 'usuario' | 'logro' | 'contribucion';
  fecha_creacion: string;
  leida: boolean;
  fecha_leida?: string;
}

interface NotificationsData {
  notificaciones: Notificacion[];
  total_no_leidas: number;
  limite: number;
  offset: number;
}

interface UseNotificationsReturn {
  notifications: Notificacion[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  // Actions
  fetchNotifications: (reset?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createTestNotification: () => Promise<void>;
  // Real-time
  startPolling: () => void;
  stopPolling: () => void;
}

const POLLING_INTERVAL = 60000; // 60 segundos (reducido de 30)
const NOTIFICATIONS_PER_PAGE = 20;

export function useNotifications(): UseNotificationsReturn {
  const { user, loading: authLoading, apiCall } = useAuth();
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  // Referencias para polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // ✅ Verificación mejorada de autenticación
  const isUserReady = !authLoading && user && user.id && apiCall;

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  /**
   * Obtener notificaciones del servidor
   */
  const fetchNotifications = useCallback(async (reset = false) => {
    // ✅ Verificación más estricta
    if (!isUserReady) {
      console.log('🔔 useNotifications: Usuario no listo aún', { authLoading, hasUser: !!user, userId: user?.id, hasApiCall: !!apiCall });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      console.log(`🔔 Obteniendo notificaciones: offset=${currentOffset}, limite=${NOTIFICATIONS_PER_PAGE}`);

      // 🔥 USAR APICALL DEL CONTEXTO (con token)
      const response = await apiCall(`/api/notifications?limite=${NOTIFICATIONS_PER_PAGE}&offset=${currentOffset}`, {
        method: 'GET',
      });

      if (response.ok) {
        const result = await response.json();
        
        // 🔍 Manejar la estructura de respuesta del backend
        const data = result.success ? result.data : result;
        const newNotifications = data.notificaciones || [];
        
        if (!mountedRef.current) return;

        if (reset) {
          setNotifications(newNotifications);
          setOffset(NOTIFICATIONS_PER_PAGE);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
          setOffset(prev => prev + NOTIFICATIONS_PER_PAGE);
        }

        setUnreadCount(data.total_no_leidas || 0);
        setHasMore(newNotifications.length === NOTIFICATIONS_PER_PAGE);

        console.log(`✅ Notificaciones cargadas: ${newNotifications.length}, No leídas: ${data.total_no_leidas}`);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error de conexión' }));
        throw new Error(errorData.message || 'Error obteniendo notificaciones');
      }
    } catch (err) {
      console.error('❌ Error en fetchNotifications:', err);
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        // ✅ No mostrar error 401 como error visible al usuario
        if (!errorMessage.includes('401') && !errorMessage.includes('iniciar sesión')) {
          setError(errorMessage);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [isUserReady, authLoading, user, offset, apiCall]);

  /**
   * Marcar notificación como leída
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isUserReady) return;

    try {
      console.log(`🔔 Marcando notificación como leída: ${notificationId}`);

      const response = await apiCall(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        if (!mountedRef.current) return;

        // Actualizar localmente
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, leida: true, fecha_leida: new Date().toISOString() }
              : notif
          )
        );

        // Decrementar contador si no estaba leída
        setUnreadCount(prev => {
          const notification = notifications.find(n => n.id === notificationId);
          return notification && !notification.leida ? Math.max(0, prev - 1) : prev;
        });

        console.log(`✅ Notificación marcada como leída: ${notificationId}`);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error marcando como leída' }));
        throw new Error(errorData.message || 'Error marcando como leída');
      }
    } catch (err) {
      console.error('❌ Error en markAsRead:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error marcando como leída';
      if (!errorMessage.includes('401') && !errorMessage.includes('iniciar sesión')) {
        setError(errorMessage);
      }
    }
  }, [isUserReady, notifications, apiCall]);

  /**
   * Marcar todas las notificaciones como leídas
   */
  const markAllAsRead = useCallback(async () => {
    if (!isUserReady) return;

    try {
      console.log('🔔 Marcando todas las notificaciones como leídas');

      const response = await apiCall(`/api/notifications/read-all`, {
        method: 'PUT',
      });

      if (response.ok) {
        if (!mountedRef.current) return;

        // Marcar todas como leídas localmente
        setNotifications(prev => 
          prev.map(notif => 
            notif.leida ? notif : { ...notif, leida: true, fecha_leida: new Date().toISOString() }
          )
        );

        setUnreadCount(0);
        console.log('✅ Todas las notificaciones marcadas como leídas');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error marcando todas como leídas' }));
        throw new Error(errorData.message || 'Error marcando todas como leídas');
      }
    } catch (err) {
      console.error('❌ Error en markAllAsRead:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error marcando todas como leídas';
      if (!errorMessage.includes('401') && !errorMessage.includes('iniciar sesión')) {
        setError(errorMessage);
      }
    }
  }, [isUserReady, apiCall]);

  /**
   * Crear notificación de prueba (solo desarrollo)
   */
  const createTestNotification = useCallback(async () => {
    if (!isUserReady) return;

    try {
      console.log('🔔 Creando notificación de prueba');

      const testData = {
        tipo: 'like_recibido',
        titulo: 'Nueva notificación de prueba',
        mensaje: `Notificación de prueba creada a las ${new Date().toLocaleTimeString()}`,
        relacionado_tipo: 'feedback'
      };

      const response = await apiCall(`/api/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        console.log('✅ Notificación de prueba creada');
        // Refresh notifications para mostrar la nueva
        await fetchNotifications(true);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error creando notificación de prueba' }));
        throw new Error(errorData.message || 'Error creando notificación de prueba');
      }
    } catch (err) {
      console.error('❌ Error en createTestNotification:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error creando notificación de prueba';
      if (!errorMessage.includes('401') && !errorMessage.includes('iniciar sesión')) {
        setError(errorMessage);
      }
    }
  }, [isUserReady, fetchNotifications, apiCall]);

  /**
   * Iniciar polling automático
   */
  const startPolling = useCallback(() => {
    if (!isUserReady) {
      console.log('🔔 No se puede iniciar polling: usuario no listo');
      return;
    }

    if (pollingRef.current) {
      console.log('🔔 Polling ya está activo');
      return;
    }

    console.log('🔔 Iniciando polling de notificaciones cada 30s');
    
    // Fetch inicial
    fetchNotifications(true);
    
    // Configurar intervalo
    pollingRef.current = setInterval(() => {
      if (!mountedRef.current || !isUserReady) {
        console.log('🔔 Deteniendo polling: componente desmontado o usuario no listo');
        stopPolling();
        return;
      }
      
      console.log('🔔 Polling: obteniendo notificaciones...');
      fetchNotifications(true);
    }, POLLING_INTERVAL);
  }, [isUserReady, fetchNotifications]);

  /**
   * Detener polling automático
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      console.log('🔔 Deteniendo polling de notificaciones');
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // ✅ Efecto para manejar polling basado en autenticación (SIN auto-inicio)
  useEffect(() => {
    if (!isUserReady) {
      console.log('🔔 Usuario no listo, deteniendo polling');
      stopPolling();
      // Limpiar estado cuando no hay usuario
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setOffset(0);
      setHasMore(true);
    }
    // ❌ NO iniciar polling automáticamente
    // Dejamos que lo haga manualmente el NotificationCenter cuando se abra

    return () => {
      stopPolling();
    };
  }, [isUserReady, stopPolling]); // ❌ Removido startPolling de dependencias

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createTestNotification,
    startPolling,
    stopPolling
  };
}