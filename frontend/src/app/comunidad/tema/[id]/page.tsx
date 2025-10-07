'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageCircle, 
  Heart, 
  Share2, 
  Clock, 
  User, 
  Tag,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/navigation/Header';
import RespuestaForm from '../../components/RespuestaForm';

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
  respuestas?: Respuesta[];
}

interface Respuesta {
  id: string;
  contenido: string;
  fecha_creacion: string;
  es_respuesta_admin: boolean;
  creador: {
    id: string;
    nombre_completo: string;
    username: string;
    url_avatar?: string;
  };
}

export default function TemaPage() {
  const { user, loading, apiCall } = useAuth();
  const router = useRouter();
  const params = useParams();
  const temaId = params.id as string;

  const [tema, setTema] = useState<Tema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingRespuesta, setIsSubmittingRespuesta] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Mostrar notificación
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch tema
  const fetchTema = useCallback(async () => {
    try {
      const response = await apiCall(`/api/temas/${temaId}`);

      if (response.ok) {
        const result = await response.json();
        setTema(result.data);
      } else {
        showNotification('error', 'Error al cargar el tema');
      }
    } catch (error) {
      console.error('Error fetching tema:', error);
      showNotification('error', 'Error de conexión');
    }
  }, [temaId, apiCall]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchTema();
      setIsLoading(false);
    };

    if (temaId) {
      loadData();
    }
  }, [temaId, fetchTema]);

  // Handle like
  const handleLikeTema = async () => {
    if (!user || !tema) {
      showNotification('error', 'Debes iniciar sesión para dar like');
      return;
    }

    try {
      const response = await apiCall(`/api/temas/${temaId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        
        setTema(prev => prev ? {
          ...prev,
          contador_likes: result.data.action === 'liked' 
            ? prev.contador_likes + 1 
            : Math.max(0, prev.contador_likes - 1),
          participantes_count: result.data.action === 'liked' 
            ? prev.participantes_count + 1 
            : Math.max(1, prev.participantes_count - 1)
        } : null);
        
        if (result.data.action === 'liked') {
          showNotification('success', '+1 like ❤️');
        } else {
          showNotification('success', 'Like removido');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showNotification('error', 'Error al procesar el voto');
    }
  };

  // Share tema
  const handleShareTema = async () => {
    if (!tema) return;

    try {
      // Compartir usando Web Share API si está disponible
      if (navigator.share) {
        await navigator.share({
          title: tema.titulo,
          text: tema.descripcion || 'Tema de conversación en Nahuatl Web',
          url: window.location.href
        });
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(window.location.href);
        showNotification('success', 'Enlace copiado al portapapeles');
      }

      // Actualizar contador en backend
      if (user) {
        await apiCall(`/api/temas/${temaId}/share`, {
          method: 'POST',
        });

        setTema(prev => prev ? {
          ...prev,
          compartido_contador: prev.compartido_contador + 1
        } : null);
      }

    } catch (error) {
      console.error('Error sharing tema:', error);
      showNotification('error', 'Error al compartir');
    }
  };

  // Handle nueva respuesta
  const handleNuevaRespuesta = async (contenido: string) => {
    if (!user) {
      showNotification('error', 'Debes iniciar sesión para responder');
      return;
    }

    setIsSubmittingRespuesta(true);

    try {
      const response = await apiCall(`/api/temas/${temaId}/respuestas`, {
        method: 'POST',
        body: JSON.stringify({ contenido }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Actualizar tema con nueva respuesta
        setTema(prev => prev ? {
          ...prev,
          respuestas: [...(prev.respuestas || []), result.data],
          respuestas_count: prev.respuestas_count + 1,
          participantes_count: prev.participantes_count + 1
        } : null);

        showNotification('success', 'Respuesta agregada exitosamente');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar respuesta');
      }
    } catch (error) {
      console.error('Error submitting respuesta:', error);
      showNotification('error', 'Error al enviar la respuesta');
    } finally {
      setIsSubmittingRespuesta(false);
    }
  };

  // Helper functions
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cerrado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'archivado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case 'suggestion':
        return 'Sugerencia';
      case 'question':
        return 'Pregunta';
      case 'issue':
        return 'Problema';
      case 'bug_report':
        return 'Error';
      case 'feature_request':
        return 'Nueva Funcionalidad';
      default:
        return 'General';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tema) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Tema no encontrado
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base px-4">
              El tema que buscas no existe o ha sido eliminado.
            </p>
            <button
              onClick={() => router.push('/comunidad')}
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-slate-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Volver a Temas</span>
              <span className="sm:hidden">Volver</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50"
          >
            <div className={`rounded-lg p-4 shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header con botón de retroceso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            {tema.titulo}
          </h1>
        </motion.div>

        {/* Info del tema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/60 p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(tema.estado)}`}>
                  {tema.estado.charAt(0).toUpperCase() + tema.estado.slice(1)}
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  <Tag className="w-3 h-3 inline mr-1" />
                  {getCategoriaLabel(tema.categoria)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLikeTema}
                className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-all duration-200"
              >
                <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-semibold text-sm sm:text-base">{tema.contador_likes}</span>
              </button>
              
              <button
                onClick={handleShareTema}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200"
              >
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-semibold text-sm sm:text-base">{tema.compartido_contador}</span>
              </button>
            </div>
          </div>

          {tema.descripcion && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {tema.descripcion}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <Link 
                  href={`/profile/${tema.creador?.id}`} 
                  className="font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  {tema.creador?.nombre_completo}
                </Link>
                <span className="text-gray-400">@{tema.creador?.username}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>
                  {new Date(tema.fecha_creacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-semibold">{tema.respuestas_count}</span>
                <span className="hidden sm:inline">respuestas</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-semibold">{tema.participantes_count}</span>
                <span className="hidden sm:inline">participantes</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Respuestas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Respuestas ({(tema.respuestas || []).length})
          </h2>

          <div className="space-y-4 sm:space-y-6">
            {(tema.respuestas || []).map((respuesta, index) => (
              <motion.div
                key={respuesta.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border p-4 sm:p-6 ${
                  respuesta.es_respuesta_admin 
                    ? 'border-cyan-200 dark:border-cyan-700 bg-cyan-50/50 dark:bg-cyan-900/10' 
                    : 'border-white/30 dark:border-gray-700/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {respuesta.creador.nombre_completo.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Link 
                        href={`/profile/${respuesta.creador.id}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-sm sm:text-base"
                      >
                        {respuesta.creador.nombre_completo}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>@{respuesta.creador.username}</span>
                        {respuesta.es_respuesta_admin && (
                          <span className="px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded text-xs font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(respuesta.fecha_creacion).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                    {respuesta.contenido}
                  </p>
                </div>
              </motion.div>
            ))}

            {(tema.respuestas || []).length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No hay respuestas aún
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Sé el primero en responder a este tema de conversación
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Formulario de respuesta */}
        {user && tema.estado === 'activo' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RespuestaForm
              onSubmit={handleNuevaRespuesta}
              isSubmitting={isSubmittingRespuesta}
              placeholder="Escribe tu respuesta a este tema de conversación..."
            />
          </motion.div>
        )}

        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-white/30 dark:border-gray-700/60 p-4 sm:p-6 text-center"
          >
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
              Debes iniciar sesión para participar en la conversación
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-slate-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
            >
              Iniciar Sesión
            </Link>
          </motion.div>
        )}

        {tema.estado !== 'activo' && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 sm:p-6 text-center"
          >
            <p className="text-yellow-800 dark:text-yellow-400 text-sm sm:text-base">
              Este tema está {tema.estado} y no acepta nuevas respuestas.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}