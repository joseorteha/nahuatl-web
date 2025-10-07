'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

interface UseWebSocketOptions {
  enabled?: boolean;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

interface WebSocketEvents {
  onNewNotification?: (notification: any) => void;
  onNotificationMarkedRead?: (data: { notificationId: string; timestamp: string }) => void;
  onAllNotificationsMarkedRead?: (data: { timestamp: string }) => void;
  onUserStatusChange?: (data: { userId: string; status: 'online' | 'offline'; timestamp: string }) => void;
  onUserTyping?: (data: { userId: string; context: string; contextId: string; timestamp: string }) => void;
  onUserStopTyping?: (data: { userId: string; context: string; contextId: string; timestamp: string }) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onAuthError?: (error: { message: string }) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}, events: WebSocketEvents = {}) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const {
    enabled = true,
    reconnect = true,
    maxReconnectAttempts = 3, // Reducido de 5 a 3
    reconnectDelay = 10000 // Aumentado de 5000 a 10000ms (10 segundos)
  } = options;

  const {
    onNewNotification,
    onNotificationMarkedRead,
    onAllNotificationsMarkedRead,
    onUserStatusChange,
    onUserTyping,
    onUserStopTyping,
    onConnected,
    onDisconnected,
    onAuthError
  } = events;

  const connect = useCallback(() => {
    if (!enabled || !user || socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log('🔌 Conectando WebSocket a:', API_URL);

    const socket = io(API_URL, {
      transports: ['polling', 'websocket'], // Cambiar orden: polling primero
      timeout: 15000, // Aumentar timeout
      reconnection: false, // Manejamos la reconexión manualmente
      forceNew: false, // Cambiar a false para reutilizar conexiones
      upgrade: true, // Permitir upgrade de polling a websocket
      rememberUpgrade: false // No recordar upgrade para evitar problemas
    });

    socketRef.current = socket;

    // Evento de conexión
    socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', socket.id);
      setIsConnected(true);
      setIsConnecting(false);
      setReconnectAttempts(0);
      setConnectionError(null);

      // Autenticar con el token
      const tokens = localStorage.getItem('auth_tokens');
      if (tokens) {
        try {
          const parsedTokens = JSON.parse(tokens);
          if (parsedTokens?.accessToken) {
            socket.emit('authenticate', parsedTokens.accessToken);
          }
        } catch (error) {
          console.error('❌ Error parsing tokens for WebSocket auth:', error);
        }
      }

      onConnected?.();
    });

    // Evento de autenticación exitosa
    socket.on('authenticated', (data) => {
      console.log('🔐 WebSocket autenticado para usuario:', data.userId);
    });

    // Evento de error de autenticación
    socket.on('auth_error', (error) => {
      console.error('❌ Error de autenticación WebSocket:', error);
      setConnectionError('Error de autenticación');
      onAuthError?.(error);
    });

    // Evento de desconexión
    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason);
      setIsConnected(false);
      setIsConnecting(false);
      onDisconnected?.();

      // Intentar reconectar si está habilitado y no fue desconexión manual
      if (reconnect && reconnectAttempts < maxReconnectAttempts && reason !== 'io client disconnect') {
        const delay = reconnectDelay * Math.pow(2, reconnectAttempts); // Backoff exponencial
        console.log(`🔄 Intentando reconectar en ${delay}ms... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connect();
        }, delay);
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        setConnectionError('Máximo de intentos de reconexión alcanzado');
      }
    });

    // Evento de error de conexión
    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
      setIsConnecting(false);
      setConnectionError('Error de conexión');
      
      // Intentar reconectar con delay exponencial
      if (reconnect && reconnectAttempts < maxReconnectAttempts) {
        const delay = reconnectDelay * Math.pow(2, reconnectAttempts);
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connect();
        }, reconnectDelay);
      }
    });

    // ===== EVENTOS DE NOTIFICACIONES =====
    
    socket.on('new_notification', (data) => {
      console.log('🔔 Nueva notificación recibida:', data);
      onNewNotification?.(data.notification);
    });

    socket.on('notification_marked_read', (data) => {
      console.log('✅ Notificación marcada como leída:', data);
      onNotificationMarkedRead?.(data);
    });

    socket.on('all_notifications_marked_read', (data) => {
      console.log('✅ Todas las notificaciones marcadas como leídas:', data);
      onAllNotificationsMarkedRead?.(data);
    });

    // ===== EVENTOS SOCIALES =====
    
    socket.on('user_status_change', (data) => {
      console.log('👤 Cambio de estado de usuario:', data);
      onUserStatusChange?.(data);
    });

    socket.on('user_typing', (data) => {
      console.log('⌨️ Usuario escribiendo:', data);
      onUserTyping?.(data);
    });

    socket.on('user_stop_typing', (data) => {
      console.log('⌨️ Usuario dejó de escribir:', data);
      onUserStopTyping?.(data);
    });

  }, [enabled, user, reconnect, maxReconnectAttempts, reconnectDelay, reconnectAttempts, onNewNotification, onNotificationMarkedRead, onAllNotificationsMarkedRead, onUserStatusChange, onUserTyping, onUserStopTyping, onConnected, onDisconnected, onAuthError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempts(0);
    setConnectionError(null);
  }, []);

  const manualReconnect = useCallback(() => {
    disconnect();
    setReconnectAttempts(0);
    setTimeout(() => connect(), 1000);
  }, [disconnect, connect]);

  // ===== FUNCIONES DE EMISIÓN =====

  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_notification_read', { notificationId });
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_all_notifications_read');
    }
  }, []);

  const emitUserTyping = useCallback((context: string, contextId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user_typing', { context, contextId });
    }
  }, []);

  const emitUserStopTyping = useCallback((context: string, contextId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user_stop_typing', { context, contextId });
    }
  }, []);

  // ===== EFECTOS =====

  useEffect(() => {
    if (enabled && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, user, connect, disconnect]);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connectionError,
    reconnectAttempts,
    maxReconnectAttempts,
    connect: manualReconnect,
    disconnect,
    
    // Funciones de emisión
    markNotificationAsRead,
    markAllNotificationsAsRead,
    emitUserTyping,
    emitUserStopTyping
  };
}