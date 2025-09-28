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
  Eye,
  ExternalLink
} from 'lucide-react';
import { useAuthBackend } from '@/hooks/useAuthBackend';
import { useSocial } from '@/hooks/useSocial';
import Header from '@/components/navigation/Header';
import ApiService from '@/services/api/apiService';
import { UserProfile, UserStats, TabType, Seguidor, Siguiendo } from '@/types';
import ExperienciaSocialBadge from '@/components/features/social/ExperienciaSocialBadge';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthBackend();
  const { seguirUsuario, dejarDeSeguir, obtenerSeguidores, obtenerSiguiendo } = useSocial();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [temasStats, setTemasStats] = useState<any>(null);
  const [seguidores, setSeguidores] = useState<Seguidor[]>([]);
  const [siguiendo, setSiguiendo] = useState<Siguiendo[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('temas');
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

  // Cargar estadísticas de temas
  const loadTemasStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/temas-stats/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTemasStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading temas stats:', error);
    }
  }, [userId]);

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
      
      // Cargar estadísticas de temas
      await loadTemasStats();
      
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
  }, [userId, checkFollowingStatus, obtenerSeguidores, obtenerSiguiendo, loadTemasStats]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <div className="w-12 h-12 border-4 border-cyan-600/20 border-t-cyan-600 rounded-full"></div>
            </motion.div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Usuario no encontrado
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm sm:text-base">
              El usuario que buscas no existe o ha sido eliminado.
            </p>
            <button
              onClick={() => router.back()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
        {/* Header del perfil mejorado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/40 dark:border-slate-700/60 mb-6 sm:mb-8 overflow-hidden relative"
        >
          {/* Patrón de fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"></div>
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full -translate-y-24 sm:-translate-y-32 translate-x-24 sm:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-tr from-blue-400/10 to-slate-400/10 rounded-full translate-y-16 sm:translate-y-24 -translate-x-16 sm:-translate-x-24"></div>
          
          <div className="relative z-10">
            {/* Botones de navegación y acción */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
                className="flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 sm:px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50"
            >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Volver</span>
            </button>
            
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={isFollowingUser}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                  isFollowing
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isFollowingUser ? (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isFollowing ? (
                  <>
                      <UserMinus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Dejar de seguir</span>
                      <span className="sm:hidden">Dejar</span>
                  </>
                ) : (
                  <>
                      <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Seguir</span>
                  </>
                )}
              </button>
            )}
          </div>

            {/* Contenido principal del perfil */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6">
              {/* Avatar mejorado */}
            <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-r from-cyan-500 via-blue-600 to-slate-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-2xl ring-4 ring-white/20 dark:ring-slate-700/20">
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
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-slate-800">
                    <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
            </div>

              {/* Información del usuario mejorada */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                  {profile.nombre_completo}
                </h1>
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 flex-wrap">
                    {profile.verificado && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}
                    {profile.es_beta_tester && (
                      <div className="px-2 sm:px-3 py-1 bg-purple-500/90 text-white text-xs sm:text-sm font-semibold rounded-full">
                        BETA
                      </div>
                    )}
                    {profile.rol === 'admin' && (
                      <div className="px-2 sm:px-3 py-1 bg-red-500/90 text-white text-xs sm:text-sm font-semibold rounded-full">
                        ADMIN
                      </div>
                    )}
                    {profile.rol === 'moderador' && (
                      <div className="px-2 sm:px-3 py-1 bg-orange-500/90 text-white text-xs sm:text-sm font-semibold rounded-full">
                        MOD
                      </div>
                    )}
                  </div>
                </div>
                
                {profile.username && (
                  <p className="text-slate-500 dark:text-slate-400 text-lg sm:text-xl font-medium mb-3 sm:mb-4">
                    @{profile.username}
                  </p>
                )}

                {/* Badge de Experiencia Social */}
                <div className="flex justify-center lg:justify-start mb-3 sm:mb-4">
                  <ExperienciaSocialBadge userId={userId} />
              </div>
              
                {profile.biografia && (
                  <p className="text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    {profile.biografia}
                </p>
              )}

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Se unió {new Date(profile.fecha_creacion).toLocaleDateString()}</span>
                  </div>
                  {profile.ubicacion && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="truncate max-w-[200px]">{profile.ubicacion}</span>
                  </div>
                )}
                {profile.sitio_web && (
                  <a
                    href={profile.sitio_web}
                    target="_blank"
                    rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 hover:text-cyan-500 transition-colors truncate max-w-[200px]"
                  >
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="truncate">Website</span>
                  </a>
                )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas mejoradas */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            {profile.mostrar_puntos && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/80 dark:from-yellow-900/30 dark:to-yellow-800/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-200/60 dark:border-yellow-700/60 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
                  <Star className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg sm:text-2xl">{stats.puntos_totales}</span>
                </div>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Puntos</span>
              </div>
            )}
            
            {profile.mostrar_nivel && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-200/60 dark:border-purple-700/60 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-purple-600 dark:text-purple-400 mb-2">
                  <Award className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg sm:text-2xl capitalize">{stats.nivel}</span>
                </div>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Nivel</span>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-pink-50 to-pink-100/80 dark:from-pink-900/30 dark:to-pink-800/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-pink-200/60 dark:border-pink-700/60 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-pink-600 dark:text-pink-400 mb-2">
                <Heart className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-lg sm:text-2xl">{stats.likes_recibidos}</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Likes</span>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/80 dark:from-cyan-900/30 dark:to-cyan-800/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-cyan-200/60 dark:border-cyan-700/60 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-cyan-600 dark:text-cyan-400 mb-2">
                <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-lg sm:text-2xl">{stats.feedbacks_creados}</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Feedbacks</span>
            </div>
          </motion.div>
        )}

        {/* Sistema de pestañas simplificado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-slate-700/60 overflow-hidden"
        >
          {/* Pestañas simplificadas */}
          <div className="border-b border-slate-200/50 dark:border-slate-700/50">
            <nav className="flex overflow-x-auto scrollbar-hide px-3 sm:px-6 pt-4 sm:pt-6">
              <div className="flex space-x-1 sm:space-x-2 min-w-max">
                {[
                  { id: 'temas', label: 'Temas Creados', icon: MessageSquare, count: temasStats?.totalTemasCreados || 0, color: 'cyan' },
                  { id: 'compartidos', label: 'Temas Compartidos', icon: Share2, count: temasStats?.totalSharesRecibidos || 0, color: 'blue' },
                  { id: 'siguiendo', label: 'Siguiendo', icon: UserPlus, count: siguiendo.length, color: 'green' },
                  { id: 'seguidores', label: 'Seguidores', icon: Users, count: seguidores.length, color: 'slate' }
                ].map(({ id, label, icon: Icon, count, color }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as TabType)}
                    className={`flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap rounded-t-xl relative group ${
                    activeTab === id
                        ? `border-${color}-500 text-${color}-600 dark:text-${color}-400 bg-${color}-50/80 dark:bg-${color}-900/30`
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.split(' ')[0]}</span>
                    <span className={`rounded-full px-2 sm:px-3 py-1 text-xs font-bold ${
                      activeTab === id 
                        ? `bg-${color}-500 text-white shadow-lg` 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
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
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Temas Creados */}
            {activeTab === 'temas' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                    <span className="hidden sm:inline">Temas Creados</span>
                    <span className="sm:hidden">Temas</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">({temasStats?.totalTemasCreados || 0})</span>
                </h3>
                  <button
                    onClick={() => router.push('/feedback')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Ver todos los temas</span>
                    <span className="sm:hidden">Ver todos</span>
                  </button>
                </div>

                {!temasStats ? (
                  <div className="text-center py-8 sm:py-12">
                    <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
                      Cargando temas...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {temasStats.temasPopulares && temasStats.temasPopulares.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {temasStats.temasPopulares.map((tema: any, index: number) => (
                      <motion.div
                            key={tema.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/20 rounded-2xl p-4 sm:p-6 border border-cyan-200/60 dark:border-cyan-700/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                            onClick={() => router.push(`/feedback/tema/${tema.id}`)}
                          >
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2">
                                  {tema.titulo}
                          </h4>
                                <p className="text-slate-600 dark:text-slate-300 mb-3 sm:mb-4 line-clamp-3 text-sm sm:text-base">
                                  {tema.contenido || 'Sin descripción disponible'}
                                </p>
                                <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                  <span className="flex items-center gap-1 sm:gap-2 text-red-600 dark:text-red-400">
                                    <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {tema.contador_likes || 0} likes
                                  </span>
                                  <span className="flex items-center gap-1 sm:gap-2 text-blue-600 dark:text-blue-400">
                                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {tema.compartido_contador || 0} shares
                                  </span>
                                  <span className="flex items-center gap-1 sm:gap-2 text-green-600 dark:text-green-400">
                                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {tema.respuestas_count || 0} resp
                          </span>
                        </div>
                              </div>
                          </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                {new Date(tema.fecha_creacion).toLocaleDateString()}
                          </div>
                              <div className="text-xs sm:text-sm text-cyan-500 group-hover:text-cyan-600 transition-colors duration-300 flex items-center gap-1">
                                Ver tema <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 sm:py-16">
                        <MessageSquare className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400 mx-auto mb-4 sm:mb-6" />
                        <h4 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">
                          {isOwnProfile ? 'Aún no has creado ningún tema' : 'Este usuario no ha creado ningún tema'}
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
                          {isOwnProfile ? '¡Crea tu primer tema y comparte tus ideas!' : 'Este usuario aún no ha compartido ningún tema'}
                        </p>
                        {isOwnProfile && (
                          <button
                            onClick={() => router.push('/feedback')}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base lg:text-lg w-full sm:w-auto"
                          >
                            Crear mi primer tema
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Temas Compartidos */}
            {activeTab === 'compartidos' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                    <span className="hidden sm:inline">Temas Compartidos</span>
                    <span className="sm:hidden">Compartidos</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">({temasStats?.totalSharesRecibidos || 0})</span>
                  </h3>
                  <button
                    onClick={() => router.push('/feedback')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Ver todos los temas</span>
                    <span className="sm:hidden">Ver todos</span>
                  </button>
                </div>

                {!temasStats ? (
                  <div className="text-center py-8 sm:py-12">
                    <Share2 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
                      Cargando temas compartidos...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Estadísticas de shares */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-3 sm:p-4 border border-blue-200/60 dark:border-blue-700/60">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Shares Recibidos</span>
                        </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {temasStats.totalSharesRecibidos}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20 rounded-xl p-3 sm:p-4 border border-cyan-200/60 dark:border-cyan-700/60">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
                          <span className="text-xs sm:text-sm font-medium text-cyan-700 dark:text-cyan-300">Shares Dados</span>
                        </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                          {temasStats.totalSharesDados}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-3 sm:p-4 border border-green-200/60 dark:border-green-700/60">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                          <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">En Temas</span>
                        </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900 dark:text-green-100">
                          {temasStats.sharesRecibidosTemas}
                        </div>
                      </div>
                    </div>

                    {/* Temas más compartidos */}
                    {temasStats.temasCompartidos && temasStats.temasCompartidos.length > 0 && (
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
                          Temas Más Compartidos
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          {temasStats.temasCompartidos
                            .filter((tema: any) => (tema.compartido_contador || 0) > 0)
                            .map((tema: any, index: number) => (
                      <motion.div
                              key={tema.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                              className="bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-4 sm:p-6 border border-blue-200/60 dark:border-blue-700/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                              onClick={() => router.push(`/feedback/tema/${tema.id}`)}
                            >
                              <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                                    {tema.titulo}
                          </h4>
                                  <p className="text-slate-600 dark:text-slate-300 mb-3 sm:mb-4 line-clamp-3 text-sm sm:text-base">
                                    {tema.contenido || 'Sin descripción disponible'}
                                  </p>
                                  <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1 sm:gap-2 text-blue-600 dark:text-blue-400">
                                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                      {tema.compartido_contador || 0} shares
                                    </span>
                                    <span className="flex items-center gap-1 sm:gap-2 text-red-600 dark:text-red-400">
                                      <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                                      {tema.contador_likes || 0} likes
                                    </span>
                                    <span className="flex items-center gap-1 sm:gap-2 text-green-600 dark:text-green-400">
                                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                                      {tema.respuestas_count || 0} resp
                          </span>
                        </div>
                          </div>
                          </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                  {new Date(tema.fecha_creacion).toLocaleDateString()}
                          </div>
                                <div className="text-xs sm:text-sm text-blue-500 group-hover:text-blue-600 transition-colors duration-300 flex items-center gap-1">
                                  Ver tema <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
              </div>
            )}

                    {temasStats.totalSharesRecibidos === 0 && (
                      <div className="text-center py-12 sm:py-16">
                        <Share2 className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400 mx-auto mb-4 sm:mb-6" />
                        <h4 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">
                          {isOwnProfile ? 'Aún no has recibido ningún share' : 'Este usuario no ha recibido ningún share'}
                          </h4>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
                          {isOwnProfile ? 'Comparte temas interesantes para recibir más shares' : 'Este usuario no ha recibido ningún share aún'}
                        </p>
                        {isOwnProfile && (
                          <button
                            onClick={() => router.push('/feedback')}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base lg:text-lg w-full sm:w-auto"
                          >
                            Crear temas para compartir
                          </button>
                        )}
                          </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Siguiendo */}
            {activeTab === 'siguiendo' && (
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                    <span className="hidden sm:inline">Siguiendo</span>
                    <span className="sm:hidden">Siguiendo</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">({siguiendo.length})</span>
                </h3>
                </div>

                {siguiendo.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <UserPlus className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400 mx-auto mb-4 sm:mb-6" />
                    <h4 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">
                      {isOwnProfile ? 'Aún no sigues a nadie' : 'Este usuario no sigue a nadie'}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
                      {isOwnProfile ? 'Sigue a otros usuarios para ver sus temas' : 'Este usuario no sigue a nadie aún'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {siguiendo.map((seguimiento, index) => (
                      <motion.div
                        key={seguimiento.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-green-50 to-green-100/80 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl p-4 sm:p-6 border border-green-200/60 dark:border-green-700/60 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                        onClick={() => router.push(`/profile/${seguimiento.seguido?.id}`)}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            {seguimiento.seguido?.nombre_completo?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 text-base sm:text-lg line-clamp-1">
                              {seguimiento.seguido?.nombre_completo || 'Usuario'}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                              @{seguimiento.seguido?.username || 'usuario'}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                              Siguiendo desde {new Date(seguimiento.fecha_seguimiento).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-green-500 group-hover:text-green-600 transition-colors duration-300 flex-shrink-0">
                            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Seguidores */}
            {activeTab === 'seguidores' && (
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                  <span className="hidden sm:inline">Seguidores</span>
                  <span className="sm:hidden">Seguidores</span>
                  <span className="text-slate-500 dark:text-slate-400 font-normal">({seguidores.length})</span>
                </h3>
                </div>

                {seguidores.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <Users className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400 mx-auto mb-4 sm:mb-6" />
                    <h4 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">
                      {isOwnProfile ? 'Aún no tienes seguidores' : 'Este usuario no tiene seguidores'}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
                      {isOwnProfile ? 'Comparte temas interesantes para ganar seguidores' : 'Este usuario no tiene seguidores aún'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {seguidores.map((seguidor, index) => (
                      <motion.div
                        key={seguidor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-900/30 dark:to-slate-800/20 rounded-2xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                        onClick={() => router.push(`/profile/${seguidor.seguidor?.id}`)}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            {seguidor.seguidor?.nombre_completo?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors duration-300 text-base sm:text-lg line-clamp-1">
                              {seguidor.seguidor?.nombre_completo || 'Usuario'}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                              @{seguidor.seguidor?.username || 'usuario'}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                              Se unió {new Date(seguidor.fecha_seguimiento).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-slate-500 group-hover:text-slate-600 transition-colors duration-300 flex-shrink-0">
                            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
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