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
  Bell,
  TrendingUp,
  Users,
  Tag
} from 'lucide-react';
import { useAuthBackend } from '@/hooks/useAuthBackend';
import { useSocial, Notificacion, Hashtag } from '@/hooks/useSocial';
import Header from '@/components/Header';
import ApiService from '@/services/apiService';
import { UserStats } from '@/types';
import { HashtagList } from '@/components/social/HashtagChip';
import { NotificationList } from '@/components/social/NotificationItem';
import TemaCard from './components/TemaCard';
import TemaForm from './components/TemaForm';

interface Tema {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria: string;
  estado: 'activo' | 'cerrado' | 'archivado';
  creador: {
    id: string;
    nombre_completo: string;
    username: string;
    url_avatar?: string;
  };
  participantes_count: number;
  respuestas_count: number;
  ultima_actividad: string;
  fecha_creacion: string;
  contador_likes: number;
  compartido_contador: number;
  trending_score: number;
  hashtags?: Array<{
    id: string;
    nombre: string;
    color: string;
  }>;
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
  const [temas, setTemas] = useState<Tema[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados sociales
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Estados del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados de interacción
  const [filter, setFilter] = useState({ category: 'all', estado: 'all' });
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  
  // Estados de UI
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  // Función para mapear datos del backend a Tema
  const mapBackendToTema = (item: unknown): Tema => {
    const temaItem = item as Record<string, unknown>;
    const creador = temaItem.creador as Record<string, unknown> || {};
    return {
      id: temaItem.id as string,
      titulo: temaItem.titulo as string,
      descripcion: temaItem.descripcion as string,
      categoria: temaItem.categoria as string,
      estado: (temaItem.estado as 'activo' | 'cerrado' | 'archivado') || 'activo',
      creador: {
        id: creador.id as string || temaItem.creador_id as string || '',
        nombre_completo: creador.nombre_completo as string || 'Usuario',
        username: creador.username as string || 'usuario',
        url_avatar: creador.url_avatar as string || undefined
      },
      participantes_count: (temaItem.participantes_count as number) || 1,
      respuestas_count: (temaItem.respuestas_count as number) || 0,
      ultima_actividad: temaItem.ultima_actividad as string || temaItem.fecha_creacion as string,
      fecha_creacion: temaItem.fecha_creacion as string,
      contador_likes: 0, // Por ahora usamos 0 ya que la columna no existe
      compartido_contador: 0, // Por ahora usamos 0 ya que la columna no existe
      trending_score: 0, // Por ahora usamos 0 ya que la columna no existe
      hashtags: [] // Por ahora vacío
    };
  };

  // Fetch temas
  const fetchTemas = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      const response = await fetch(`${API_URL}/api/temas?categoria=${filter.category}&estado=${filter.estado}&sortBy=${sortBy}`, {
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar temas');
      }
      
      const result = await response.json();
      if (result.success) {
        const mappedTemas = result.data.map(mapBackendToTema);
        setTemas(mappedTemas);
      } else {
        throw new Error(result.error || 'Error al cargar temas');
      }
    } catch (error) {
      console.error('Error fetching temas:', error);
      showNotification('error', 'Error al cargar los temas');
    } finally {
      setIsLoading(false);
    }
  }, [filter.category, filter.estado, sortBy, API_URL]);

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
    
    fetchTemas();
    fetchUserStats();
    fetchNotifications();
    fetchHashtags();
  }, [user, loading, router, fetchTemas, fetchUserStats, fetchNotifications, fetchHashtags]);

  // Submit tema
  const handleTemaSubmit = async (tema: { titulo: string; descripcion: string; categoria: string }) => {
    if (!user?.id) return;
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      console.log('🔑 Token encontrado:', !!parsedTokens?.accessToken);
      console.log('👤 Usuario:', user?.id);
      
      const response = await fetch(`${API_URL}/api/temas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tema)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear tema');
      }
      
      const result = await response.json();
      if (result.success) {
        const newTema = mapBackendToTema(result.data);
        setTemas(prev => [newTema, ...prev]);
        setShowForm(false);
        
        // Otorgar puntos por crear tema
        const pointsAwarded = await awardPoints('tema_creado', 15, `Tema creado: ${tema.titulo}`);
        
        if (pointsAwarded) {
          showNotification('success', '¡Tema creado! Has ganado 15 puntos 🎉');
        } else {
          showNotification('success', '¡Tema creado exitosamente!');
        }
      } else {
        throw new Error(result.error || 'Error al crear tema');
      }
    } catch (error) {
      console.error('Error creating tema:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al crear tema');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Like tema
  const handleLikeTema = async (temaId: string) => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      const response = await fetch(`${API_URL}/api/temas/${temaId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar like');
      }
      
      const result = await response.json();
      if (result.success) {
        // Actualizar el tema en la lista
        setTemas(prev => prev.map(tema => 
          tema.id === temaId 
            ? { 
                ...tema, 
                contador_likes: result.data.action === 'liked' 
                  ? tema.contador_likes + 1 
                  : tema.contador_likes - 1
              }
            : tema
        ));

        // Otorgar puntos por dar like
        if (result.data.action === 'liked') {
          const pointsAwarded = await awardPoints('like_dado', 2, 'Like dado a tema');
          if (pointsAwarded) {
            showNotification('success', '+2 puntos por dar like! ❤️');
          }
        }
      } else {
        throw new Error(result.error || 'Error al procesar like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showNotification('error', 'Error al procesar el voto');
    }
  };


  // Handlers para acciones sociales
  const handleShareTema = async (temaId: string) => {
    try {
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      const response = await fetch(`${API_URL}/api/temas/${temaId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al compartir tema');
      }
      
      const result = await response.json();
      if (result.success) {
        // Actualizar el tema en la lista
        setTemas(prev => prev.map(tema => 
          tema.id === temaId 
            ? { ...tema, compartido_contador: tema.compartido_contador + 1 }
            : tema
        ));

        showNotification('success', 'Tema compartido exitosamente');
      } else {
        throw new Error(result.error || 'Error al compartir tema');
      }
    } catch (error) {
      console.error('Error sharing tema:', error);
      showNotification('error', 'Error al compartir tema');
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


  // Filtrar y ordenar temas
  const filteredAndSortedTemas = temas
    .filter((tema) => {
      if (filter.category !== 'all' && tema.categoria !== filter.category) return false;
      if (filter.estado !== 'all' && tema.estado !== filter.estado) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.contador_likes - a.contador_likes;
        case 'trending':
          return b.trending_score - a.trending_score;
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
              Temas de Conversación
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Participa en conversaciones, haz preguntas y comparte ideas sobre el náhuatl. 
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
              {/* Nuevo Tema Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(!showForm)}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Tema
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

                  {/* Estado Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Estado
                    </label>
                    <select
                      value={filter.estado}
                      onChange={(e) => setFilter(prev => ({ ...prev, estado: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">Todos</option>
                      <option value="activo">Activo</option>
                      <option value="cerrado">Cerrado</option>
                      <option value="archivado">Archivado</option>
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
                    { key: 'trending', label: 'Trending', icon: TrendingUp }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSortBy(key as 'recent' | 'popular' | 'trending')}
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
            {/* New Tema Form */}
            <TemaForm
              isOpen={showForm}
              onClose={() => setShowForm(false)}
              onSubmit={handleTemaSubmit}
              isSubmitting={isSubmitting}
            />

            {/* Temas List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Temas ({filteredAndSortedTemas.length})
                </h2>
              </div>

              {filteredAndSortedTemas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No hay temas para mostrar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Sé el primero en iniciar una conversación sobre el náhuatl.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Crear primer tema
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedTemas.map((tema, index) => (
                    <motion.div
                      key={tema.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TemaCard
                        tema={tema}
                        onLike={handleLikeTema}
                        onShare={handleShareTema}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}