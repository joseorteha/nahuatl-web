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
import { useAuthBackend } from '@/hooks/useAuthBackend';
import Header from '@/components/Header';
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
  const { user, loading } = useAuthBackend();
  const router = useRouter();
  const params = useParams();
  const temaId = params.id as string;

  const [tema, setTema] = useState<Tema | null>(null);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
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
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      const response = await fetch(`${API_URL}/api/temas/${temaId}`, {
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setTema(null);
          return;
        }
        throw new Error('Error al cargar tema');
      }
      
      const result = await response.json();
      if (result.success) {
        const temaData = result.data;
        setTema({
          id: temaData.id,
          titulo: temaData.titulo,
          descripcion: temaData.descripcion,
          categoria: temaData.categoria,
          estado: temaData.estado,
          creador: {
            id: temaData.creador_id || '',
            nombre_completo: 'Usuario',
            username: 'usuario',
            url_avatar: undefined
          },
          participantes_count: temaData.participantes_count || 1,
          respuestas_count: temaData.respuestas_count || 0,
          ultima_actividad: temaData.ultima_actividad || temaData.fecha_creacion,
          fecha_creacion: temaData.fecha_creacion,
          contador_likes: 0,
          compartido_contador: 0,
          trending_score: 0
        });
        
        setRespuestas(temaData.respuestas || []);
      } else {
        throw new Error(result.error || 'Error al cargar tema');
      }
    } catch (error) {
      console.error('Error fetching tema:', error);
      showNotification('error', 'Error al cargar el tema');
    } finally {
      setIsLoading(false);
    }
  }, [temaId, API_URL]);

  // Submit respuesta
  const handleRespuestaSubmit = async (contenido: string) => {
    if (!user?.id || !tema) return;
    
    setIsSubmittingRespuesta(true);

    try {
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      const response = await fetch(`${API_URL}/api/temas/${tema.id}/respuestas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contenido })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar respuesta');
      }
      
      const result = await response.json();
      if (result.success) {
        const newRespuesta: Respuesta = {
          id: result.data.id,
          contenido: result.data.contenido,
          fecha_creacion: result.data.fecha_creacion,
          es_respuesta_admin: result.data.es_respuesta_admin,
          creador: result.data.creador
        };

        setRespuestas(prev => [...prev, newRespuesta]);
        setTema(prev => prev ? { ...prev, respuestas_count: prev.respuestas_count + 1 } : null);
        
        showNotification('success', '¡Respuesta enviada exitosamente!');
      } else {
        throw new Error(result.error || 'Error al enviar respuesta');
      }
    } catch (error) {
      console.error('Error submitting respuesta:', error);
      showNotification('error', 'Error al enviar respuesta');
    } finally {
      setIsSubmittingRespuesta(false);
    }
  };

  // Like tema
  const handleLikeTema = async () => {
    if (!user?.id || !tema) return;

    try {
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      const response = await fetch(`${API_URL}/api/temas/${tema.id}/like`, {
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
        setTema(prev => prev ? { 
          ...prev, 
          contador_likes: result.data.action === 'liked' 
            ? prev.contador_likes + 1 
            : prev.contador_likes - 1
        } : null);
        
        if (result.data.action === 'liked') {
          showNotification('success', '+1 like ❤️');
        } else {
          showNotification('success', 'Like removido');
        }
      } else {
        throw new Error(result.error || 'Error al procesar like');
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
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      const response = await fetch(`${API_URL}/api/temas/${tema.id}/share`, {
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
        setTema(prev => prev ? { ...prev, compartido_contador: prev.compartido_contador + 1 } : null);
        showNotification('success', 'Tema compartido exitosamente');
      } else {
        throw new Error(result.error || 'Error al compartir tema');
      }
    } catch (error) {
      console.error('Error sharing tema:', error);
      showNotification('error', 'Error al compartir tema');
    }
  };

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchTema();
  }, [user, loading, router, fetchTema]);

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'suggestion':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'question':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'issue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'bug_report':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'feature_request':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
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
            <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando tema...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tema) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Tema no encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              El tema que buscas no existe o ha sido eliminado.
            </p>
            <button
              onClick={() => router.push('/feedback')}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Volver a Temas
            </button>
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
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header del tema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/feedback')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {tema.titulo}
            </h1>
          </div>

          {/* Info del tema */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/60 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getCategoriaColor(tema.categoria)}`}>
                  <Tag className="w-4 h-4" />
                  {getCategoriaLabel(tema.categoria)}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  tema.estado === 'activo' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {tema.estado}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLikeTema}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                >
                  <Heart className="w-4 h-4" />
                  <span className="font-semibold">{tema.contador_likes}</span>
                </button>
                
                <button
                  onClick={handleShareTema}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="font-semibold">{tema.compartido_contador}</span>
                </button>
              </div>
            </div>

            {tema.descripcion && (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {tema.descripcion}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <Link href={`/profile/${tema.creador?.id}`} className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {tema.creador?.nombre_completo || 'Usuario'}
                  </Link>
                  <Link href={`/profile/${tema.creador?.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    @{tema.creador?.username || 'usuario'}
                  </Link>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(tema.fecha_creacion).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-semibold">{tema.respuestas_count}</span>
                  <span>respuestas</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="font-semibold">{tema.participantes_count}</span>
                  <span>participantes</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Respuestas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Respuestas ({respuestas.length})
          </h2>

          {respuestas.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay respuestas aún
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sé el primero en responder a este tema.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {respuestas.map((respuesta, index) => (
                <motion.div
                  key={respuesta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/60 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                      {respuesta.creador?.nombre_completo?.[0] || 'U'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Link href={`/profile/${respuesta.creador?.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {respuesta.creador?.nombre_completo || 'Usuario'}
                        </Link>
                        <Link href={`/profile/${respuesta.creador?.id}`} className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          @{respuesta.creador?.username || 'usuario'}
                        </Link>
                        {respuesta.es_respuesta_admin && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-semibold rounded-full">
                            Admin
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(respuesta.fecha_creacion).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {respuesta.contenido}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Formulario de respuesta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RespuestaForm
            onSubmit={handleRespuestaSubmit}
            isSubmitting={isSubmittingRespuesta}
            placeholder="Escribe tu respuesta a este tema..."
            usuario={user ? {
              nombre_completo: user.nombre_completo || 'Usuario',
              username: user.username || 'usuario',
              url_avatar: user.url_avatar
            } : undefined}
          />
        </motion.div>
      </div>
    </div>
  );
}
