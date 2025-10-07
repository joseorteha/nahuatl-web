'use client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Trophy, 
  Star, 
  Gift, 
  Plus,
  UserPlus,
  Bell,
  ChevronRight
} from 'lucide-react';
import { Notification } from '@/types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

const NOTIFICATION_ICONS = {
  'like_recibido': Heart,
  'respuesta_recibida': MessageCircle, 
  'mencion': Share2,
  'nuevo_seguidor': UserPlus,
  'logro_obtenido': Trophy,
  'feedback_aprobado': Star,
  'feedback_rechazado': Gift,
  'puntos_ganados': Plus
};

const NOTIFICATION_COLORS = {
  'like_recibido': 'text-red-500 bg-red-50 dark:bg-red-900/20',
  'respuesta_recibida': 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  'mencion': 'text-green-500 bg-green-50 dark:bg-green-900/20',
  'nuevo_seguidor': 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
  'logro_obtenido': 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  'feedback_aprobado': 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  'feedback_rechazado': 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  'puntos_ganados': 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
};

export default function NotificationItem({ notification, onMarkAsRead, onNotificationClick, className = '' }: NotificationItemProps) {
  const IconComponent = NOTIFICATION_ICONS[notification.tipo_notificacion] || Bell;
  const colorClasses = NOTIFICATION_COLORS[notification.tipo_notificacion] || 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';

  const handleClick = () => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (!notification.leida && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className={`group relative p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer border-l-4 ${
        !notification.leida 
          ? 'border-l-cyan-500 bg-cyan-50/30 dark:bg-cyan-900/10' 
          : 'border-l-transparent'
      } ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Icono de la notificación */}
        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${colorClasses}`}>
          <IconComponent size={16} className="sm:w-[18px] sm:h-[18px]" />
        </div>

        {/* Contenido de la notificación */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium leading-snug ${
                !notification.leida 
                  ? 'text-slate-900 dark:text-slate-100' 
                  : 'text-slate-700 dark:text-slate-300'
              }`}>
                {notification.titulo}
              </p>
              <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                !notification.leida 
                  ? 'text-slate-600 dark:text-slate-400' 
                  : 'text-slate-500 dark:text-slate-500'
              }`}>
                {notification.mensaje}
              </p>
            </div>
            
            {/* Indicador de no leído */}
            {!notification.leida && (
              <div className="flex-shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full mt-1 sm:mt-2"></div>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {formatDistanceToNow(new Date(notification.fecha_creacion), {
                addSuffix: true,
                locale: es
              })}
            </p>
            
            {/* Flecha para indicar que es clickeable */}
            <ChevronRight 
              size={12} 
              className="sm:w-[14px] sm:h-[14px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200 opacity-0 group-hover:opacity-100"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}