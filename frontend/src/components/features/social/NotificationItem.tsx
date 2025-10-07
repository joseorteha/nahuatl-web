'use client';

import React from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Award, CheckCircle, XCircle, Star } from 'lucide-react';

// Usar la interfaz del hook de notificaciones
export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo_notificacion: 'like_recibido' | 'respuesta_recibida' | 'mencion' | 'nuevo_seguidor' | 'logro_obtenido' | 'contribucion_aprobada' | 'contribucion_rechazada' | 'contribucion_publicada' | 'puntos_ganados';
  titulo: string;
  mensaje: string;
  relacionado_id?: string;
  relacionado_tipo?: 'feedback' | 'respuesta' | 'usuario' | 'logro' | 'tema';
  fecha_creacion: string;
  leida: boolean;
  fecha_leida?: string;
}

interface NotificationItemProps {
  notification: Notificacion;
  onMarkAsRead?: (notificationId: string) => void;
  onNotificationClick?: (notification: Notificacion) => void;
  className?: string;
}

const getNotificationIcon = (tipo: string) => {
  switch (tipo) {
    case 'like_recibido':
      return <Heart className="w-5 h-5 text-red-500" />;
    case 'respuesta_recibida':
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case 'mencion':
      return <Bell className="w-5 h-5 text-yellow-500" />;
    case 'nuevo_seguidor':
      return <UserPlus className="w-5 h-5 text-green-500" />;
    case 'logro_obtenido':
      return <Award className="w-5 h-5 text-purple-500" />;
    case 'contribucion_aprobada':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'contribucion_rechazada':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'contribucion_publicada':
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case 'puntos_ganados':
      return <Star className="w-5 h-5 text-yellow-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getNotificationColor = (tipo: string) => {
  switch (tipo) {
    case 'like_recibido':
      return 'border-l-red-500 bg-red-50';
    case 'respuesta_recibida':
      return 'border-l-blue-500 bg-blue-50';
    case 'mencion':
      return 'border-l-yellow-500 bg-yellow-50';
    case 'nuevo_seguidor':
      return 'border-l-green-500 bg-green-50';
    case 'logro_obtenido':
      return 'border-l-purple-500 bg-purple-50';
    case 'contribucion_aprobada':
      return 'border-l-green-500 bg-green-50';
    case 'contribucion_rechazada':
      return 'border-l-red-500 bg-red-50';
    case 'contribucion_publicada':
      return 'border-l-emerald-500 bg-emerald-50';
    case 'puntos_ganados':
      return 'border-l-yellow-500 bg-yellow-50';
    default:
      return 'border-l-gray-500 bg-gray-50';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onNotificationClick,
  className = ''
}) => {
  const handleClick = () => {
    if (!notification.leida && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`
        border-l-4 p-4 rounded-r-lg transition-all duration-200 cursor-pointer
        ${notification.leida ? 'opacity-60' : 'opacity-100'}
        ${getNotificationColor(notification.tipo_notificacion)}
        hover:shadow-md
        ${className}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.tipo_notificacion)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${notification.leida ? 'text-gray-600' : 'text-gray-900'}`}>
              {notification.titulo}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {formatTime(notification.fecha_creacion)}
              </span>
              {!notification.leida && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          
          <p className={`text-sm mt-1 ${notification.leida ? 'text-gray-500' : 'text-gray-700'}`}>
            {notification.mensaje}
          </p>
        </div>
      </div>
    </div>
  );
};

interface NotificationListProps {
  notifications: Notificacion[];
  onMarkAsRead?: (notificationId: string) => void;
  onNotificationClick?: (notification: Notificacion) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
  showMarkAllButton?: boolean;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onNotificationClick,
  onMarkAllAsRead,
  className = '',
  showMarkAllButton = true
}) => {
  const unreadCount = notifications.filter(n => !n.leida).length;

  return (
    <div className={className}>
      {showMarkAllButton && unreadCount > 0 && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Marcar todas como leídas
          </button>
        </div>
      )}
      
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No tienes notificaciones</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onNotificationClick={onNotificationClick}
            />
          ))
        )}
      </div>
    </div>
  );
};
