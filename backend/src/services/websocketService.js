const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map();    // socketId -> userId
  }

  /**
   * Inicializar el servidor WebSocket
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    console.log('🔌 WebSocket Server inicializado');
  }

  /**
   * Configurar manejadores de eventos
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('👤 Cliente conectado:', socket.id);

      // Autenticación del socket
      socket.on('authenticate', (token) => {
        this.authenticateSocket(socket, token);
      });

      // Desconexión
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Eventos de notificaciones
      socket.on('mark_notification_read', (data) => {
        this.handleMarkNotificationRead(socket, data);
      });

      socket.on('mark_all_notifications_read', () => {
        this.handleMarkAllNotificationsRead(socket);
      });

      // Eventos de presencia
      socket.on('user_typing', (data) => {
        this.handleUserTyping(socket, data);
      });

      socket.on('user_stop_typing', (data) => {
        this.handleUserStopTyping(socket, data);
      });
    });
  }

  /**
   * Autenticar socket con JWT
   */
  authenticateSocket(socket, token) {
    try {
      if (!token) {
        socket.emit('auth_error', { message: 'Token requerido' });
        return;
      }

      // Remover 'Bearer ' si está presente
      const cleanToken = token.replace('Bearer ', '');
      
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Asociar usuario con socket
      this.connectedUsers.set(userId, socket.id);
      this.userSockets.set(socket.id, userId);
      
      // Unir al usuario a su sala personal
      socket.join(`user_${userId}`);
      
      socket.emit('authenticated', { 
        message: 'Autenticado exitosamente',
        userId: userId 
      });
      
      console.log(`✅ Usuario ${userId} autenticado en socket ${socket.id}`);
      
      // Notificar al usuario sobre su estado online
      this.broadcastUserStatus(userId, 'online');
      
    } catch (error) {
      console.error('❌ Error de autenticación WebSocket:', error);
      socket.emit('auth_error', { message: 'Token inválido' });
    }
  }

  /**
   * Manejar desconexión
   */
  handleDisconnect(socket) {
    const userId = this.userSockets.get(socket.id);
    
    if (userId) {
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);
      
      console.log(`👋 Usuario ${userId} desconectado del socket ${socket.id}`);
      
      // Notificar estado offline (con delay para reconexiones rápidas)
      setTimeout(() => {
        if (!this.connectedUsers.has(userId)) {
          this.broadcastUserStatus(userId, 'offline');
        }
      }, 5000);
    }
  }

  /**
   * Enviar notificación en tiempo real a un usuario específico
   */
  sendNotificationToUser(userId, notification) {
    try {
      const socketId = this.connectedUsers.get(userId);
      
      if (socketId) {
        this.io.to(`user_${userId}`).emit('new_notification', {
          notification,
          timestamp: new Date().toISOString()
        });
        
        console.log(`🔔 Notificación enviada a usuario ${userId}:`, notification.tipo_notificacion);
        return true;
      } else {
        console.log(`⚠️ Usuario ${userId} no está conectado via WebSocket`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error enviando notificación WebSocket:', error);
      return false;
    }
  }

  /**
   * Broadcast a múltiples usuarios
   */
  broadcastToUsers(userIds, event, data) {
    userIds.forEach(userId => {
      if (this.connectedUsers.has(userId)) {
        this.io.to(`user_${userId}`).emit(event, data);
      }
    });
  }

  /**
   * Broadcast estado de usuario
   */
  broadcastUserStatus(userId, status) {
    this.io.emit('user_status_change', {
      userId,
      status,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Manejar marcado de notificación como leída
   */
  handleMarkNotificationRead(socket, data) {
    const userId = this.userSockets.get(socket.id);
    if (!userId) return;

    // Broadcast a otros dispositivos del mismo usuario
    socket.to(`user_${userId}`).emit('notification_marked_read', {
      notificationId: data.notificationId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Manejar marcado de todas las notificaciones como leídas
   */
  handleMarkAllNotificationsRead(socket) {
    const userId = this.userSockets.get(socket.id);
    if (!userId) return;

    // Broadcast a otros dispositivos del mismo usuario
    socket.to(`user_${userId}`).emit('all_notifications_marked_read', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Manejar eventos de typing
   */
  handleUserTyping(socket, data) {
    const userId = this.userSockets.get(socket.id);
    if (!userId) return;

    // Broadcast a otros usuarios en el mismo contexto (ej: tema de feedback)
    if (data.context && data.contextId) {
      socket.to(`${data.context}_${data.contextId}`).emit('user_typing', {
        userId,
        context: data.context,
        contextId: data.contextId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Manejar eventos de stop typing
   */
  handleUserStopTyping(socket, data) {
    const userId = this.userSockets.get(socket.id);
    if (!userId) return;

    if (data.context && data.contextId) {
      socket.to(`${data.context}_${data.contextId}`).emit('user_stop_typing', {
        userId,
        context: data.context,
        contextId: data.contextId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener usuarios conectados
   */
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Verificar si un usuario está conectado
   */
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  /**
   * Obtener estadísticas de conexión
   */
  getConnectionStats() {
    return {
      totalConnections: this.io.engine.clientsCount,
      authenticatedUsers: this.connectedUsers.size,
      connectedUsers: Array.from(this.connectedUsers.keys())
    };
  }

  /**
   * Unir usuario a sala específica (ej: tema de feedback)
   */
  joinRoom(userId, roomName) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(roomName);
        console.log(`🏠 Usuario ${userId} se unió a la sala ${roomName}`);
      }
    }
  }

  /**
   * Salir de sala específica
   */
  leaveRoom(userId, roomName) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(roomName);
        console.log(`🚪 Usuario ${userId} salió de la sala ${roomName}`);
      }
    }
  }

  /**
   * Enviar mensaje a sala específica
   */
  emitToRoom(roomName, event, data) {
    this.io.to(roomName).emit(event, data);
  }
}

// Singleton pattern
const websocketService = new WebSocketService();

module.exports = websocketService;