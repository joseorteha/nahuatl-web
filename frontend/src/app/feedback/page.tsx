'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Check, 
  Plus,
  Filter,
  Star,
  Award,
  Heart,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Bell
} from 'lucide-react';
import { useAuthBackend } from '@/hooks/useAuthBackend';
import { useSocial, Notificacion, Hashtag } from '@/hooks/useSocial';
import Header from '@/components/Header';
import ApiService from '@/services/apiService';
import { UserStats } from '@/types';
import { FeedbackCard } from '@/components/social/FeedbackCard';
import { HashtagList } from '@/components/social/HashtagChip';
import { NotificationList } from '@/components/social/NotificationItem';

interface Feedback {
  id: string;
  titulo: string;
  contenido: string;
  categoria: string;
  estado: string;
  prioridad: string;
  contador_likes: number;
  compartido_contador: number;
  guardado_contador: number;
  trending_score: number;
  visibilidad: string;
  permite_compartir: boolean;
  archivado: boolean;
  hashtags?: Array<{
    id: string;
    nombre: string;
    color: string;
  }>;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_id: string;
  perfiles?: {
    id: string;
    nombre_completo: string;
    username?: string;
    url_avatar?: string;
    verificado: boolean;
    recompensas_usuario?: {
      nivel: string;
      puntos_totales: number;
    };
  };
  retroalimentacion_respuestas?: Array<{
    id: string;
    contenido: string;
    fecha_creacion: string;
    es_respuesta_admin: boolean;
    perfiles?: {
      id: string;
      nombre_completo: string;
      username?: string;
      url_avatar?: string;
      verificado: boolean;
    };
  }>;
  retroalimentacion_likes?: Array<{
    usuario_id: string;
  }>;
  total_likes?: number;
  total_respuestas?: number;
}


// Categorías con iconos y colores
const categoryConfig = {
  suggestion: { 
    label: 'Sugerencia', 
    icon: '💡', 
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300'
  },
  bug_report: { 
    label: 'Reporte de Bug', 
    icon: '🐛', 
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-300'
  },
  feature_request: { 
    label: 'Nueva Funcionalidad', 
    icon: '✨', 
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-300'
  },
  question: { 
    label: 'Pregunta', 
    icon: '❓', 
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-300'
  },
  issue: { 
    label: 'Problema', 
    icon: '⚠️', 
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-700 dark:text-orange-300'
  },
  general: { 
    label: 'General', 
    icon: '💬', 
    color: 'from-gray-500 to-slate-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    textColor: 'text-gray-700 dark:text-gray-300'
  }
};

// Estados con iconos y colores
const statusConfig = {
  pending: { label: 'Pendiente', icon: Clock, color: 'text-yellow-600 dark:text-yellow-400' },
  reviewed: { label: 'Revisado', icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400' },
  implemented: { label: 'Implementado', icon: Check, color: 'text-green-600 dark:text-green-400' },
  declined: { label: 'Rechazado', icon: XCircle, color: 'text-red-600 dark:text-red-400' }
};

// Prioridades
const priorityConfig = {
  low: { label: 'Baja', color: 'text-green-600 dark:text-green-400' },
  medium: { label: 'Media', color: 'text-yellow-600 dark:text-yellow-400' },
  high: { label: 'Alta', color: 'text-orange-600 dark:text-orange-400' },
  critical: { label: 'Crítica', color: 'text-red-600 dark:text-red-400' }
};


export default function FeedbackPage() {
  const { user, loading } = useAuthBackend();
  const { 
    obtenerNotificaciones, 
    marcarNotificacionLeida, 
    marcarTodasLeidas,
    obtenerHashtagsPopulares,
    compartirFeedback,
    guardarFeedback
  } = useSocial();
  const router = useRouter();
  
  // Estados principales
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados sociales
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    type: 'suggestion',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados de interacción
  const [filter, setFilter] = useState({ category: 'all', status: 'all', priority: 'all' });
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'priority'>('recent');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  // Estados de UI
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Mostrar notificación
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Otorgar puntos al usuario
  const awardPoints = async (action: string, points: number, description: string) => {
    if (!user?.id) return false;
    
    try {
      const response = await ApiService.awardPoints({
        userId: user.id,
        points,
        motivo: action,
        descripcion: description
      });
      
      if (response.success) {
        // Actualizar stats del usuario
        fetchUserStats();
        return true;
      } else {
        console.warn('No se pudieron otorgar puntos:', response.error);
        return false; // No fallar, solo avisar
      }
    } catch (error) {
      console.warn('Error awarding points:', error);
      return false; // No fallar, solo avisar
    }
  };

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await ApiService.getUserStats(user.id);
      if (response.success && response.data) {
        setUserStats(response.data);
      } else {
        console.error('Error fetching user stats:', response.error);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [user?.id]);

  // Función para mapear FeedbackItem a Feedback
  const mapFeedbackItemToFeedback = (item: unknown): Feedback => {
    const feedbackItem = item as Record<string, unknown>;
    return {
      id: feedbackItem.id as string,
      titulo: feedbackItem.titulo as string,
      contenido: feedbackItem.contenido as string,
      categoria: feedbackItem.categoria as string,
      estado: feedbackItem.estado as string,
      prioridad: feedbackItem.prioridad as string,
      contador_likes: (feedbackItem.total_likes as number) || (feedbackItem.contador_likes as number) || 0,
      compartido_contador: (feedbackItem.compartido_contador as number) || 0,
      guardado_contador: (feedbackItem.guardado_contador as number) || 0,
      trending_score: (feedbackItem.trending_score as number) || 0,
      visibilidad: (feedbackItem.visibilidad as string) || 'publico',
      permite_compartir: (feedbackItem.permite_compartir as boolean) || true,
      archivado: (feedbackItem.archivado as boolean) || false,
      hashtags: ((feedbackItem.hashtags as { id: string; nombre: string; color: string; }[]) || []).map(hashtag => ({
        ...hashtag,
        uso_contador: 0 // Add default uso_contador
      })),
      fecha_creacion: feedbackItem.fecha_creacion as string,
      fecha_actualizacion: feedbackItem.fecha_actualizacion as string,
      usuario_id: feedbackItem.usuario_id as string,
      perfiles: feedbackItem.perfiles as Feedback['perfiles'],
      retroalimentacion_respuestas: ((feedbackItem.retroalimentacion_respuestas as unknown[]) || []).map(respuesta => {
        const respuestaData = respuesta as Record<string, unknown>;
        return {
          id: respuestaData.id as string,
          contenido: respuestaData.contenido as string,
          fecha_creacion: respuestaData.fecha_creacion as string,
          es_respuesta_admin: respuestaData.es_respuesta_admin as boolean,
          usuario: {
            id: (respuestaData.perfiles as Record<string, unknown>)?.id as string || '',
            nombre_completo: (respuestaData.perfiles as Record<string, unknown>)?.nombre_completo as string || '',
            username: (respuestaData.perfiles as Record<string, unknown>)?.username as string,
            url_avatar: (respuestaData.perfiles as Record<string, unknown>)?.url_avatar as string,
            verificado: (respuestaData.perfiles as Record<string, unknown>)?.verificado as boolean || false
          }
        };
      }),
      retroalimentacion_likes: feedbackItem.retroalimentacion_likes as Feedback['retroalimentacion_likes'],
      total_likes: (feedbackItem.total_likes as number) || (feedbackItem.contador_likes as number) || 0,
      total_respuestas: (feedbackItem.total_respuestas as number) || (feedbackItem.retroalimentacion_respuestas as unknown[])?.length || 0
    };
  };

  // Fetch feedbacks
  const fetchFeedbacks = useCallback(async () => {
    try {
      const response = await ApiService.getFeedbacks();
      if (response.success && response.data) {
        console.log('📊 Datos del backend:', response.data[0]); // Debug: primer feedback
        const mappedFeedbacks = response.data.map(mapFeedbackItemToFeedback);
        console.log('📊 Datos mapeados:', mappedFeedbacks[0]); // Debug: primer feedback mapeado
        setFeedbacks(mappedFeedbacks);
      } else {
        showNotification('error', response.error || 'Error al cargar los feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      showNotification('error', 'Error al cargar los feedbacks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await obtenerNotificaciones(1, 10, true);
      if (response && Array.isArray(response)) {
        setNotifications(response as Notificacion[]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [obtenerNotificaciones]);

  // Fetch hashtags
  const fetchHashtags = useCallback(async () => {
    try {
      const response = await obtenerHashtagsPopulares(20);
      if (response && Array.isArray(response)) {
        // Add missing uso_contador property with default value
        const hashtagsWithCounter = response.map((hashtag: unknown) => {
          const hashtagData = hashtag as Record<string, unknown>;
          return {
            ...hashtagData,
            uso_contador: (hashtagData.uso_contador as number) || 0
          };
        });
        setHashtags(hashtagsWithCounter as Hashtag[]);
      }
    } catch (error) {
      console.error('Error fetching hashtags:', error);
    }
  }, [obtenerHashtagsPopulares]);

  // Effect para cargar datos
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchFeedbacks();
    fetchUserStats();
    fetchNotifications();
    fetchHashtags();
  }, [user, loading, router, fetchFeedbacks, fetchUserStats, fetchNotifications, fetchHashtags]);

  // Submit feedback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsSubmitting(true);

    try {
      const response = await ApiService.createFeedback({
        user_id: user.id,
        title: formData.subject,
        content: formData.message,
        category: formData.type,
        priority: formData.priority
      });

      if (!response.success) {
        throw new Error(response.error || 'Error al enviar feedback');
      }

      // Otorgar puntos por crear feedback
      const pointsAwarded = await awardPoints('feedback_enviado', 10, `Feedback enviado: ${formData.subject}`);
      
      setFormData({ subject: '', message: '', type: 'suggestion', priority: 'medium' });
      setShowForm(false);
      
      if (pointsAwarded) {
        showNotification('success', '¡Feedback enviado! Has ganado 10 puntos 🎉');
      } else {
        showNotification('success', '¡Feedback enviado exitosamente!');
      }
      
      fetchFeedbacks();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al enviar feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Like feedback
  const handleLike = async (feedbackId: string) => {
    if (!user?.id) return;

    try {
      const response = await ApiService.likeFeedback({
        user_id: user.id,
        feedback_id: feedbackId
      });

      if (!response.success) {
        throw new Error(response.error || 'Error al procesar el voto');
      }

      // Si dio like (no quitó), otorgar puntos
      if (response.data?.action === 'liked') {
        const pointsAwarded = await awardPoints('like_recibido', 2, 'Like dado a feedback');
        if (pointsAwarded) {
          showNotification('success', '+2 puntos por dar like! ❤️');
        }
      }

      fetchFeedbacks();
    } catch (error) {
      console.error('Error toggling like:', error);
      showNotification('error', 'Error al procesar el voto');
    }
  };


  // Handlers para acciones sociales
  const handleShareFeedback = async (feedbackId: string) => {
    try {
      await compartirFeedback(feedbackId);
      showNotification('success', 'Feedback compartido exitosamente');
      fetchFeedbacks(); // Recargar para actualizar contadores
    } catch (error) {
      console.error('Error sharing feedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al compartir feedback';
      
      // Si ya se compartió, mostrar mensaje informativo en lugar de error
      if (errorMessage.includes('Ya has compartido este feedback')) {
        showNotification('success', 'Este feedback ya fue compartido anteriormente');
      } else {
        showNotification('error', errorMessage);
      }
    }
  };

  const handleSaveFeedback = async (feedbackId: string) => {
    try {
      await guardarFeedback(feedbackId);
      showNotification('success', 'Feedback guardado exitosamente');
      fetchFeedbacks(); // Recargar para actualizar contadores
    } catch (error) {
      console.error('Error saving feedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar feedback';
      
      // Si ya se guardó, mostrar mensaje informativo en lugar de error
      if (errorMessage.includes('Ya has guardado este feedback')) {
        showNotification('success', 'Este feedback ya fue guardado anteriormente');
      } else {
        showNotification('error', errorMessage);
      }
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await marcarNotificacionLeida(notificationId);
      fetchNotifications(); // Recargar notificaciones
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await marcarTodasLeidas();
      fetchNotifications(); // Recargar notificaciones
      showNotification('success', 'Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showNotification('error', 'Error al marcar notificaciones');
    }
  };

  // Handler para enviar respuesta
  const handleReplySubmit = async (feedbackId: string) => {
    if (!user?.id || !replyContent.trim()) return;
    
    setIsSubmittingReply(true);
    
    try {
      const response = await ApiService.replyToFeedback({
        user_id: user.id,
        feedback_id: feedbackId,
        content: replyContent.trim()
      });

      if (!response.success) {
        throw new Error(response.error || 'Error al enviar respuesta');
      }

      // Otorgar puntos por responder
      const pointsAwarded = await awardPoints('respuesta_enviada', 5, 'Respuesta enviada a feedback');
      
      setReplyContent('');
      setReplyingTo(null);
      
      if (pointsAwarded) {
        showNotification('success', '¡Respuesta enviada! Has ganado 5 puntos 🎉');
      } else {
        showNotification('success', '¡Respuesta enviada exitosamente!');
      }
      
      fetchFeedbacks(); // Recargar para mostrar la nueva respuesta
    } catch (error) {
      console.error('Error submitting reply:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al enviar respuesta');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Filtrar y ordenar feedbacks
  const filteredAndSortedFeedbacks = feedbacks
    .filter((feedback) => {
      if (filter.category !== 'all' && feedback.categoria !== filter.category) return false;
      if (filter.status !== 'all' && feedback.estado !== filter.status) return false;
      if (filter.priority !== 'all' && feedback.prioridad !== filter.priority) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.contador_likes - a.contador_likes;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.prioridad as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.prioridad as keyof typeof priorityOrder] || 0);
        case 'recent':
        default:
          return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime();
      }
    });

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full"></div>
            </motion.div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <Header />
      
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-20 right-4 z-50"
          >
            <div className={`px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm border ${
              notification.type === 'success' 
                ? 'bg-green-500/90 border-green-400 text-white' 
                : 'bg-red-500/90 border-red-400 text-white'
            }`}>
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Centro de Feedback
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comparte tus ideas, reporta problemas y ayúdanos a mejorar la plataforma. 
            ¡Gana puntos por cada contribución!
          </p>
          
          {/* User Stats */}
          {userStats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-6 mt-6 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 max-w-md mx-auto"
            >
              <div className="text-center">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4" />
                  <span className="font-bold">{userStats.puntos_totales}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Puntos</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-purple-500">
                  <Award className="w-4 h-4" />
                  <span className="font-bold capitalize">{userStats.nivel}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Nivel</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-pink-500">
                  <Heart className="w-4 h-4" />
                  <span className="font-bold">{userStats.likes_recibidos}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Likes</span>
              </div>
            </motion.div>
          )}

          {/* Notifications and Hashtags */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {/* Notifications Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/20 hover:shadow-md transition-all duration-200"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notificaciones</span>
              {notifications.filter((n) => !n.leida).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.filter((n) => !n.leida).length}
                </span>
              )}
            </motion.button>

            {/* Hashtags */}
            {hashtags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Trending:</span>
                <HashtagList
                  hashtags={hashtags.slice(0, 3)}
                  size="sm"
                  variant="outline"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20">
                <NotificationList
                  notifications={notifications}
                  onMarkAsRead={handleMarkNotificationAsRead}
                  onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                  showMarkAllButton={true}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Nuevo Feedback Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(!showForm)}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Feedback
              </motion.button>

              {/* Filters */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Filtros</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Categoría
                    </label>
                    <select
                      value={filter.category}
                      onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">Todas</option>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Estado
                    </label>
                    <select
                      value={filter.status}
                      onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">Todos</option>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Prioridad
                    </label>
                    <select
                      value={filter.priority}
                      onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">Todas</option>
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Ordenar por</h3>
                <div className="space-y-2">
                  {[
                    { key: 'recent', label: 'Más recientes', icon: Clock },
                    { key: 'popular', label: 'Más populares', icon: Heart },
                    { key: 'priority', label: 'Prioridad', icon: Zap }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSortBy(key as 'recent' | 'popular' | 'priority')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        sortBy === key
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* New Feedback Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Nuevo Feedback
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Categoría
                          </label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                          >
                            {Object.entries(categoryConfig).map(([key, config]) => (
                              <option key={key} value={key}>
                                {config.icon} {config.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Prioridad
                          </label>
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                          >
                            {Object.entries(priorityConfig).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Título
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Resumen breve de tu feedback..."
                          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Descripción
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Describe tu sugerencia, problema o pregunta en detalle..."
                          rows={4}
                          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          required
                        />
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Enviar Feedback (+10 puntos)
                            </>
                          )}
                        </motion.button>
                        
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Feedback ({filteredAndSortedFeedbacks.length})
                </h2>
              </div>

              {filteredAndSortedFeedbacks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No hay feedback para mostrar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Sé el primero en compartir tus ideas y ayudarnos a mejorar.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Crear primer feedback
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedFeedbacks.map((feedback, index) => {
                    const isLiked = feedback.retroalimentacion_likes?.some((like) => like.usuario_id === user?.id);
                    const isSaved = false; // TODO: Implementar lógica de guardado

                    return (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div>
                          <FeedbackCard
                            feedback={{
                              ...feedback,
                              perfiles: feedback.perfiles || {
                                id: feedback.usuario_id,
                                nombre_completo: 'Usuario',
                                username: undefined,
                                url_avatar: undefined,
                                verificado: false
                              },
                              retroalimentacion_respuestas: feedback.retroalimentacion_respuestas?.map(respuesta => ({
                                ...respuesta,
                                perfiles: respuesta.perfiles || {
                                  id: 'unknown',
                                  nombre_completo: 'Usuario',
                                  username: undefined,
                                  url_avatar: undefined,
                                  verificado: false
                                }
                              }))
                            }}
                            total_likes={feedback.total_likes || feedback.contador_likes}
                            total_respuestas={feedback.total_respuestas || feedback.retroalimentacion_respuestas?.length || 0}
                            isLiked={isLiked}
                            isSaved={isSaved}
                            onLike={handleLike}
                            onReply={(feedbackId) => setReplyingTo(replyingTo === feedbackId ? null : feedbackId)}
                            onShare={handleShareFeedback}
                            onSave={handleSaveFeedback}
                            onUserClick={(userId) => {
                              router.push(`/profile/${userId}`);
                            }}
                            onHashtagClick={(hashtag) => {
                              // TODO: Filtrar por hashtag
                              console.log('Filter by hashtag:', hashtag);
                            }}
                            showActions={true}
                          />
                          
                          {/* Formulario de respuesta */}
                          {replyingTo === feedback.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                  <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Escribe tu respuesta..."
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={3}
                                    disabled={isSubmittingReply}
                                  />
                                  <div className="flex justify-end gap-2 mt-3">
                                    <button
                                      onClick={() => {
                                        setReplyingTo(null);
                                        setReplyContent('');
                                      }}
                                      className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                      disabled={isSubmittingReply}
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      onClick={() => handleReplySubmit(feedback.id)}
                                      disabled={!replyContent.trim() || isSubmittingReply}
                                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                                    >
                                      {isSubmittingReply ? (
                                        <div className="flex items-center gap-2">
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          Enviando...
                                        </div>
                                      ) : (
                                        'Responder'
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}