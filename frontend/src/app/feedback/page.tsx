'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Edit, 
  Trash2, 
  ChevronDown, 
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
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import ApiService from '@/services/apiService';

interface Feedback {
  id: string;
  titulo: string;
  contenido: string;
  categoria: string;
  estado: string;
  prioridad: string;
  contador_likes: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_id: string;
  perfiles?: {
    nombre_completo: string;
    username?: string;
    url_avatar?: string;
  };
  retroalimentacion_respuestas?: Array<{
    id: string;
    contenido: string;
    fecha_creacion: string;
    es_respuesta_admin: boolean;
    perfiles?: {
      nombre_completo: string;
      url_avatar?: string;
    };
  }>;
  retroalimentacion_likes?: Array<{
    usuario_id: string;
  }>;
}

interface UserStats {
  puntos_totales: number;
  nivel: string;
  contribuciones_aprobadas: number;
  likes_recibidos: number;
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

// Helper function para fechas
const formatSafeDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Fecha inválida';
  }
};

export default function FeedbackPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  
  // Estados principales
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
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
    if (!profile?.id) return;
    
    try {
      const response = await ApiService.awardPoints({
        userId: profile.id,
        points,
        motivo: action,
        descripcion: description
      });
      
      if (response.success) {
        // Actualizar stats del usuario
        fetchUserStats();
        return true;
      } else {
        console.error('Error awarding points:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  };

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      const response = await ApiService.getUserStats(profile.id);
      if (response.success && response.data) {
        setUserStats(response.data);
      } else {
        console.error('Error fetching user stats:', response.error);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [profile?.id]);

  // Fetch feedbacks
  const fetchFeedbacks = useCallback(async () => {
    try {
      const response = await ApiService.getFeedbacks();
      if (response.success && response.data) {
        setFeedbacks(response.data);
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

  // Effect para cargar datos
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchFeedbacks();
    fetchUserStats();
  }, [user, loading, router, fetchFeedbacks, fetchUserStats]);

  // Submit feedback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    
    setIsSubmitting(true);

    try {
      const response = await ApiService.createFeedback({
        user_id: profile.id,
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
    if (!profile?.id) return;

    try {
      const response = await ApiService.likeFeedback({
        user_id: profile.id,
        feedback_id: feedbackId
      });

      if (!response.success) {
        throw new Error(response.error || 'Error al procesar el voto');
      }

      // Si dio like (no quitó), otorgar puntos
      if (response.data?.action === 'liked') {
        const pointsAwarded = await awardPoints('like_dado', 2, 'Like dado a feedback');
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

  // Reply to feedback
  const handleReply = async (feedbackId: string) => {
    if (!profile?.id || !replyContent.trim()) return;
    
    try {
      const response = await ApiService.replyToFeedback({
        user_id: profile.id,
        feedback_id: feedbackId,
        content: replyContent
      });

      if (!response.success) {
        throw new Error(response.error || 'Error al responder');
      }

      // Otorgar puntos por responder
      const pointsAwarded = await awardPoints('respuesta_feedback', 5, 'Respuesta a feedback');
      
      setReplyContent('');
      setReplyingTo(null);
      
      if (pointsAwarded) {
        showNotification('success', '¡Respuesta enviada! Has ganado 5 puntos 💬');
      } else {
        showNotification('success', '¡Respuesta enviada exitosamente!');
      }
      
      fetchFeedbacks();
    } catch (error) {
      console.error('Error replying:', error);
      showNotification('error', 'Error al enviar la respuesta');
    }
  };

  // Edit feedback
  const handleEditFeedback = async (feedbackId: string) => {
    if (!profile?.id || !editContent.trim()) return;
    
    try {
      const response = await ApiService.updateFeedback(feedbackId, {
        content: editContent,
        user_id: profile.id
      });

      if (!response.success) {
        throw new Error(response.error || 'Error al editar feedback');
      }

      setEditingId(null);
      setEditContent('');
      showNotification('success', '¡Feedback actualizado exitosamente!');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error editing feedback:', error);
      showNotification('error', 'Error al editar feedback');
    }
  };

  // Delete feedback
  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!profile?.id) return;
    
    try {
      const response = await ApiService.deleteFeedback(feedbackId, profile.id);

      if (!response.success) {
        throw new Error(response.error || 'Error al eliminar feedback');
      }

      showNotification('success', 'Feedback eliminado exitosamente');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      showNotification('error', 'Error al eliminar feedback');
    }
  };

  // Verificar permisos
  const canEdit = (feedback: Feedback) => {
    return profile && (profile.id === feedback.usuario_id || profile.rol === 'admin');
  };

  const canDelete = (feedback: Feedback) => {
    return profile && (profile.id === feedback.usuario_id || profile.rol === 'admin');
  };

  // Filtrar y ordenar feedbacks
  const filteredAndSortedFeedbacks = feedbacks
    .filter(fb => {
      if (filter.category !== 'all' && fb.categoria !== filter.category) return false;
      if (filter.status !== 'all' && fb.estado !== filter.status) return false;
      if (filter.priority !== 'all' && fb.prioridad !== filter.priority) return false;
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
        </motion.div>

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
                    const category = categoryConfig[feedback.categoria as keyof typeof categoryConfig] || categoryConfig.general;
                    const status = statusConfig[feedback.estado as keyof typeof statusConfig] || statusConfig.pending;
                    const priority = priorityConfig[feedback.prioridad as keyof typeof priorityConfig] || priorityConfig.medium;
                    const isLiked = feedback.retroalimentacion_likes?.some(like => like.usuario_id === profile?.id);
                    const isExpanded = expandedFeedback === feedback.id;
                    const StatusIcon = status.icon;

                    return (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              {/* Avatar */}
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {feedback.perfiles?.nombre_completo?.[0] || profile?.nombre_completo?.[0] || 'U'}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                    {feedback.titulo}
                                  </h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.bgColor} ${category.textColor}`}>
                                    {category.icon} {category.label}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <span>
                                    por {feedback.perfiles?.nombre_completo || 'Usuario'}
                                  </span>
                                  <span>•</span>
                                  <span>{formatSafeDate(feedback.fecha_creacion)}</span>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                                    <span className={status.color}>{status.label}</span>
                                  </div>
                                  <span>•</span>
                                  <span className={priority.color}>
                                    Prioridad {priority.label}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            {canEdit(feedback) && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingId(feedback.id);
                                    setEditContent(feedback.contenido);
                                  }}
                                  className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {canDelete(feedback) && (
                                  <button
                                    onClick={() => {
                                      if (confirm('¿Estás seguro de que quieres eliminar este feedback?')) {
                                        handleDeleteFeedback(feedback.id);
                                      }
                                    }}
                                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="mb-4">
                            {editingId === feedback.id ? (
                              <div className="space-y-3">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  rows={4}
                                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                  placeholder="Edita tu feedback..."
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditFeedback(feedback.id)}
                                    disabled={!editContent.trim()}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditContent('');
                                    }}
                                    className="text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-sm"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {feedback.contenido.length > 200 && !isExpanded
                                    ? `${feedback.contenido.substring(0, 200)}...`
                                    : feedback.contenido
                                  }
                                </p>
                                
                                {feedback.contenido.length > 200 && (
                                  <button
                                    onClick={() => setExpandedFeedback(isExpanded ? null : feedback.id)}
                                    className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                                  >
                                    {isExpanded ? 'Ver menos' : 'Ver más'}
                                  </button>
                                )}
                              </>
                            )}
                          </div>

                          {/* Actions Bar */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleLike(feedback.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                                  isLiked
                                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="font-medium">{feedback.contador_likes}</span>
                              </motion.button>

                              <button
                                onClick={() => setReplyingTo(replyingTo === feedback.id ? null : feedback.id)}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span className="font-medium">
                                  {feedback.retroalimentacion_respuestas?.length || 0}
                                </span>
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setExpandedFeedback(isExpanded ? null : feedback.id)}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Reply Form */}
                          <AnimatePresence>
                            {replyingTo === feedback.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {profile?.nombre_completo?.[0] || 'U'}
                                  </div>
                                  <div className="flex-1">
                                    <textarea
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      placeholder="Escribe tu respuesta..."
                                      rows={3}
                                      className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                    />
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => handleReply(feedback.id)}
                                        disabled={!replyContent.trim()}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                      >
                                        Responder (+5 puntos)
                                      </button>
                                      <button
                                        onClick={() => {
                                          setReplyingTo(null);
                                          setReplyContent('');
                                        }}
                                        className="text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-sm"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Replies */}
                          <AnimatePresence>
                            {isExpanded && feedback.retroalimentacion_respuestas && feedback.retroalimentacion_respuestas.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                              >
                                <div className="space-y-4">
                                  {feedback.retroalimentacion_respuestas.map((reply) => (
                                    <div key={reply.id} className="flex gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                                        reply.es_respuesta_admin 
                                          ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                                          : 'bg-gradient-to-br from-gray-500 to-gray-600'
                                      }`}>
                                        {reply.perfiles?.nombre_completo?.[0] || 'U'}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                                            {reply.perfiles?.nombre_completo || 'Usuario'}
                                          </span>
                                          {reply.es_respuesta_admin && (
                                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full font-medium">
                                              Admin
                                            </span>
                                          )}
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatSafeDate(reply.fecha_creacion)}
                                          </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                                          {reply.contenido}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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