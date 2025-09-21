'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Award, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark,
  Users,
  UserPlus,
  UserMinus,
  CheckCircle,
  Star,
  ThumbsUp,
  MapPin,
  Globe,
} from 'lucide-react';
import { useAuthBackend } from '@/hooks/useAuthBackend';
import { useSocial } from '@/hooks/useSocial';
import Header from '@/components/Header';
import ApiService from '@/services/apiService';
import { UserProfile, UserStats, Feedback, FeedbackCompartido, FeedbackGuardado, LikeDado, TabType, Seguidor, Siguiendo } from '@/types';





export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthBackend();
  const { seguirUsuario, dejarDeSeguir, obtenerSeguidores, obtenerSiguiendo } = useSocial();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [compartidos, setCompartidos] = useState<FeedbackCompartido[]>([]);
  const [guardados, setGuardados] = useState<FeedbackGuardado[]>([]);
  const [likesDados, setLikesDados] = useState<LikeDado[]>([]);
  const [seguidores, setSeguidores] = useState<Seguidor[]>([]);
  const [siguiendo, setSiguiendo] = useState<Siguiendo[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('feedbacks');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowingUser, setIsFollowingUser] = useState(false);

  const userId = params.userId as string;

  // Verificar si el usuario actual sigue a este usuario
  const checkFollowingStatus = useCallback(async () => {
    if (!currentUser || !userId) return;
    
    try {
      const response = await obtenerSiguiendo(currentUser.id, 1, 100);
      if (response && Array.isArray(response)) {
        const isFollowing = response.some((follow: {seguido?: {id: string}}) => follow.seguido?.id === userId);
        setIsFollowing(isFollowing);
      }
    } catch (error) {
      console.error('Error checking following status:', error);
    }
  }, [currentUser, userId, obtenerSiguiendo]);

  // Cargar perfil del usuario
  const loadProfile = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Cargar perfil básico
      const profileResponse = await ApiService.getUserProfile(userId);
      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data);
      }
      
      // Cargar estadísticas
      const statsResponse = await ApiService.getUserStats(userId);
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      // Cargar feedbacks del usuario
      const feedbacksResponse = await ApiService.getUserFeedbacks(userId);
      if (feedbacksResponse.success && feedbacksResponse.data) {
        // Mapear FeedbackItem a Feedback
        const mappedFeedbacks = feedbacksResponse.data.map((item) => ({
          id: item.id,
          titulo: item.titulo,
          contenido: item.contenido,
          categoria: item.categoria,
          contador_likes: item.contador_likes || 0,
          compartido_contador: 0, // FeedbackItem no tiene esta propiedad
          guardado_contador: 0, // FeedbackItem no tiene esta propiedad
          fecha_creacion: item.fecha_creacion,
          usuario_id: item.usuario_id,
          usuario: item.perfiles ? {
            id: item.usuario_id,
            nombre_completo: item.perfiles.nombre_completo,
            username: item.perfiles.username,
            email: '', // No disponible en FeedbackItem
            verificado: false, // No disponible en FeedbackItem
            fecha_creacion: '', // No disponible en FeedbackItem
            fecha_actualizacion: '',
            es_beta_tester: false,
            contador_feedback: 0,
            rol: 'usuario' as const,
            biografia: undefined,
            ubicacion: undefined,
            sitio_web: undefined,
            privacidad_perfil: 'publico' as const,
            mostrar_puntos: true,
            mostrar_nivel: true,
            notificaciones_email: true,
            notificaciones_push: true,
            url_avatar: item.perfiles.url_avatar
          } : undefined,
          retroalimentacion_likes: item.retroalimentacion_likes || [],
          total_likes: item.contador_likes || 0,
          total_respuestas: item.retroalimentacion_respuestas?.length || 0
        }));
        setFeedbacks(mappedFeedbacks);
      }
      
      // Cargar feedbacks compartidos
      const compartidosResponse = await ApiService.getUserSharedFeedbacks(userId);
      if (compartidosResponse.success && compartidosResponse.data) {
        setCompartidos(compartidosResponse.data);
      }
      
      // Cargar feedbacks guardados
      const guardadosResponse = await ApiService.getUserSavedFeedbacks(userId);
      if (guardadosResponse.success && guardadosResponse.data) {
        setGuardados(guardadosResponse.data);
      }
      
      // Cargar likes dados
      const likesResponse = await ApiService.getUserLikes(userId);
      if (likesResponse.success && likesResponse.data) {
        setLikesDados(likesResponse.data);
      }
      
      // Cargar seguidores
      const seguidoresResponse = await obtenerSeguidores(userId, 1, 50);
      if (seguidoresResponse && Array.isArray(seguidoresResponse)) {
        setSeguidores(seguidoresResponse);
      }
      
      // Cargar siguiendo
      const siguiendoResponse = await obtenerSiguiendo(userId, 1, 50);
      if (siguiendoResponse && Array.isArray(siguiendoResponse)) {
        setSiguiendo(siguiendoResponse);
      }
      
      // Verificar estado de seguimiento
      await checkFollowingStatus();
      
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, checkFollowingStatus, obtenerSeguidores, obtenerSiguiendo]);

  // Manejar seguir/dejar de seguir
  const handleFollowToggle = async () => {
    if (!currentUser || !userId) return;
    
    try {
      setIsFollowingUser(true);
      
      if (isFollowing) {
        await dejarDeSeguir(userId);
        setIsFollowing(false);
      } else {
        await seguirUsuario(userId);
        setIsFollowing(true);
      }
      
      // Recargar estadísticas
      await loadProfile();
      
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsFollowingUser(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
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
            <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Usuario no encontrado
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              El usuario que buscas no existe o ha sido eliminado.
            </p>
            <button
              onClick={() => router.back()}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header del perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/30 dark:border-gray-700/60 mb-6 lg:mb-8 overflow-hidden"
        >
          {/* Botones de navegación y acción */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Volver</span>
            </button>
            
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={isFollowingUser}
                className={`px-3 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-sm sm:text-base ${
                  isFollowing
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowingUser ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    <span className="hidden sm:inline">Dejar de seguir</span>
                    <span className="sm:hidden">Dejar</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Seguir</span>
                    <span className="sm:hidden">Seguir</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Contenido principal del perfil */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative mx-auto sm:mx-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                {profile.url_avatar ? (
                  <img
                    src={profile.url_avatar}
                    alt={profile.nombre_completo}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile.nombre_completo.charAt(0).toUpperCase()
                )}
              </div>
              {profile.verificado && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </div>
              )}
            </div>

            {/* Información del usuario */}
            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
                  {profile.nombre_completo}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  {profile.verificado && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  )}
                  {profile.es_beta_tester && (
                    <div className="px-2 py-1 bg-purple-500/80 text-white text-xs font-semibold rounded-full">
                      BETA
                    </div>
                  )}
                  {profile.rol === 'admin' && (
                    <div className="px-2 py-1 bg-red-500/80 text-white text-xs font-semibold rounded-full">
                      ADMIN
                    </div>
                  )}
                  {profile.rol === 'moderador' && (
                    <div className="px-2 py-1 bg-orange-500/80 text-white text-xs font-semibold rounded-full">
                      MOD
                    </div>
                  )}
                </div>
              </div>
              
              {profile.username && (
                <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-medium mb-2 sm:mb-3">
                  @{profile.username}
                </p>
              )}
              
              {profile.biografia && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto sm:mx-0">
                  {profile.biografia}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Se unió {new Date(profile.fecha_creacion).toLocaleDateString()}</span>
                </div>
                {profile.ubicacion && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{profile.ubicacion}</span>
                  </div>
                )}
                {profile.sitio_web && (
                  <a
                    href={profile.sitio_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors truncate max-w-[200px]"
                  >
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8"
          >
            {profile.mostrar_puntos && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/80 dark:from-yellow-900/30 dark:to-yellow-800/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-yellow-200/60 dark:border-yellow-700/60 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
                  <Star className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg sm:text-xl">{stats.puntos_totales}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Puntos</span>
              </div>
            )}
            
            {profile.mostrar_nivel && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-purple-200/60 dark:border-purple-700/60 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                  <Award className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg sm:text-xl capitalize">{stats.nivel}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Nivel</span>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-pink-50 to-pink-100/80 dark:from-pink-900/30 dark:to-pink-800/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-pink-200/60 dark:border-pink-700/60 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-center gap-2 text-pink-600 dark:text-pink-400 mb-2">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-lg sm:text-xl">{stats.likes_recibidos}</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Likes</span>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-blue-200/60 dark:border-blue-700/60 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-lg sm:text-xl">{stats.feedbacks_creados}</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Feedbacks</span>
            </div>
          </motion.div>
        )}

        {/* Sistema de pestañas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/60 overflow-hidden"
        >
          {/* Pestañas */}
          <div className="border-b border-gray-200/50 dark:border-gray-700/50">
            <nav className="flex overflow-x-auto scrollbar-hide px-2 sm:px-6 pt-4 sm:pt-6">
              <div className="flex space-x-1 sm:space-x-2 min-w-max">
                {[
                  { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare, count: feedbacks.length, color: 'blue' },
                  { id: 'compartidos', label: 'Compartidos', icon: Share2, count: compartidos.length, color: 'green' },
                  { id: 'guardados', label: 'Guardados', icon: Bookmark, count: guardados.length, color: 'purple' },
                  { id: 'likes', label: 'Likes', icon: ThumbsUp, count: likesDados.length, color: 'pink' },
                  { id: 'seguidores', label: 'Seguidores', icon: Users, count: seguidores.length, color: 'indigo' },
                  { id: 'siguiendo', label: 'Siguiendo', icon: UserPlus, count: siguiendo.length, color: 'emerald' }
                ].map(({ id, label, icon: Icon, count, color }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as TabType)}
                    className={`flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap rounded-t-xl relative group ${
                      activeTab === id
                        ? `border-${color}-500 text-${color}-600 dark:text-${color}-400 bg-${color}-50/80 dark:bg-${color}-900/30`
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.substring(0, 4)}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                      activeTab === id 
                        ? `bg-${color}-500 text-white shadow-lg` 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {count}
                    </span>
                    {activeTab === id && (
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-t-full`}></div>
                    )}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6 sm:p-8">
            {activeTab === 'feedbacks' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Feedbacks creados
                </h3>
                {feedbacks.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? 'Aún no has creado ningún feedback' : 'Este usuario no ha creado ningún feedback'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {feedbacks.map((feedback, index) => (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-blue-50 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-5 sm:p-6 border border-blue-200/60 dark:border-blue-700/60 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl break-words group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {feedback.titulo}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                            {new Date(feedback.fecha_creacion).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4 line-clamp-3 leading-relaxed">
                          {feedback.contenido}
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="font-semibold">{feedback.contador_likes || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-green-500" />
                            <span className="font-semibold">{feedback.compartido_contador || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bookmark className="w-4 h-4 text-purple-500" />
                            <span className="font-semibold">{feedback.guardado_contador || 0}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'compartidos' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Feedbacks compartidos
                </h3>
                {compartidos.length === 0 ? (
                  <div className="text-center py-8">
                    <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? 'Aún no has compartido ningún feedback' : 'Este usuario no ha compartido ningún feedback'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {compartidos.map((compartido, index) => (
                      <motion.div
                        key={compartido.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-4 border border-white/20 dark:border-gray-600/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {compartido.retroalimentacion.titulo}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Compartido {new Date(compartido.fecha_compartido).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                          {compartido.retroalimentacion.contenido}
                        </p>
                        
                        {compartido.comentario_compartir && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              &quot;{compartido.comentario_compartir}&quot;
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{compartido.retroalimentacion.contador_likes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            <span>{compartido.retroalimentacion.compartido_contador || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bookmark className="w-4 h-4" />
                            <span>{compartido.retroalimentacion.guardado_contador || 0}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'guardados' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Feedbacks guardados
                </h3>
                {guardados.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? 'Aún no has guardado ningún feedback' : 'Este usuario no ha guardado ningún feedback'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {guardados.map((guardado, index) => (
                      <motion.div
                        key={guardado.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-4 border border-white/20 dark:border-gray-600/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {guardado.retroalimentacion.titulo}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Guardado {new Date(guardado.fecha_guardado).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                          {guardado.retroalimentacion.contenido}
                        </p>
                        
                        {guardado.notas_personales && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mb-3">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              <strong>Nota personal:</strong> {guardado.notas_personales}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{guardado.retroalimentacion.contador_likes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            <span>{guardado.retroalimentacion.compartido_contador || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bookmark className="w-4 h-4" />
                            <span>{guardado.retroalimentacion.guardado_contador || 0}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'likes' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Feedbacks que le gustaron
                </h3>
                {likesDados.length === 0 ? (
                  <div className="text-center py-8">
                    <ThumbsUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? 'Aún no has dado like a ningún feedback' : 'Este usuario no ha dado like a ningún feedback'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {likesDados.map((like, index) => (
                      <motion.div
                        key={like.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-4 border border-white/20 dark:border-gray-600/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {like.retroalimentacion.titulo}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Like dado {new Date(like.fecha_creacion).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                          {like.retroalimentacion.contenido}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{like.retroalimentacion.contador_likes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            <span>{like.retroalimentacion.compartido_contador || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bookmark className="w-4 h-4" />
                            <span>{like.retroalimentacion.guardado_contador || 0}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'seguidores' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Seguidores ({seguidores.length})
                </h3>
                {seguidores.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? 'Aún no tienes seguidores' : 'Este usuario no tiene seguidores'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {seguidores.map((seguidor, index) => (
                      <motion.div
                        key={seguidor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-4 border border-white/20 dark:border-gray-600/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {seguidor.seguidor?.nombre_completo?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {seguidor.seguidor?.nombre_completo || 'Usuario'}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Se unió {new Date(seguidor.fecha_seguimiento).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'siguiendo' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Siguiendo ({siguiendo.length})
                </h3>
                {siguiendo.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? 'Aún no sigues a nadie' : 'Este usuario no sigue a nadie'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {siguiendo.map((seguimiento, index) => (
                      <motion.div
                        key={seguimiento.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-4 border border-white/20 dark:border-gray-600/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {seguimiento.seguido?.nombre_completo?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {seguimiento.seguido?.nombre_completo || 'Usuario'}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Siguiendo desde {new Date(seguimiento.fecha_seguimiento).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
