'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  BookText, 
  Users, 
  MessageCircle, 
  Heart,
  Star,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  Trophy,
  BookOpen,
  Target,
  Clock,
  Zap,
  Crown,
  Activity,
  Eye,
  ThumbsUp,
  Share2,
  Calendar,
  ArrowRight,
  TrendingDown,
  User,
  Bookmark
} from 'lucide-react';
import ConditionalHeader from '@/components/ConditionalHeader';
import { useAuthBackend } from '@/hooks/useAuthBackend';

interface RecentActivity {
  id: string;
  type: 'like' | 'share' | 'comment' | 'word_learned' | 'topic_created';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

interface FeaturedContent {
  featuredWord: {
    palabra: string;
    traduccion: string;
    busquedas: number;
  } | null;
  featuredUser: {
    id: string;
    nombre: string;
    username: string;
    avatar: string;
    actividad: number;
  } | null;
}

export default function Dashboard() {
  const { user } = useAuthBackend();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data with REAL algorithms
  const fetchDashboardData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Fetch real data from multiple endpoints
      const [activityResponse, featuredWordResponse, featuredUserResponse] = await Promise.allSettled([
        // Real recent activity from notifications
        fetch(`${API_URL}/api/experiencia-social/notificaciones/${user?.id}`).catch(() => ({ json: () => ({ data: [] }) })),
        
        // Real most searched word (based on palabras_guardadas table)
        fetch(`${API_URL}/api/dashboard/featured-word`).catch(() => ({ json: () => ({ success: false, data: null }) })),
        
        // Real most active user (based on ranking_social and activity)
        fetch(`${API_URL}/api/dashboard/featured-user`).catch(() => ({ json: () => ({ success: false, data: null }) }))
      ]);

      // Process REAL recent activity
      let activities: RecentActivity[] = [];
      if (activityResponse.status === 'fulfilled') {
        try {
          const activityData = await activityResponse.value.json();
          const activityArray = Array.isArray(activityData.data) ? activityData.data : [];
          activities = activityArray.slice(0, 5).map((notif: any) => ({
            id: notif.id || Math.random().toString(),
            type: notif.tipo_notificacion === 'like_recibido' ? 'like' : 
                  notif.tipo_notificacion === 'share_dado' ? 'share' :
                  notif.tipo_notificacion === 'respuesta_recibida' ? 'comment' : 'like',
            title: notif.titulo || 'Nueva actividad',
            description: notif.mensaje || 'Tienes una nueva notificación',
            timestamp: notif.fecha_creacion || new Date().toISOString(),
            icon: notif.tipo_notificacion === 'like_recibido' ? '❤️' : 
                  notif.tipo_notificacion === 'share_dado' ? '📤' : '💬'
          }));
        } catch (error) {
          console.warn('Error processing activity data:', error);
        }
      }

      setRecentActivity(activities);

      // Process REAL featured word
      let featuredWord = null;
      if (featuredWordResponse.status === 'fulfilled') {
        try {
          const wordData = await featuredWordResponse.value.json();
          if (wordData.success && wordData.data) {
            featuredWord = wordData.data;
          }
        } catch (error) {
          console.warn('Error processing featured word data:', error);
        }
      }

      // Process REAL featured user
      let featuredUser = null;
      if (featuredUserResponse.status === 'fulfilled') {
        try {
          const userData = await featuredUserResponse.value.json();
          if (userData.success && userData.data) {
            featuredUser = userData.data;
          }
        } catch (error) {
          console.warn('Error processing featured user data:', error);
        }
      }

      // Fallback data if real data is not available
      if (!featuredWord) {
        featuredWord = {
          palabra: 'Tlazocamati',
          traduccion: 'Gracias',
          busquedas: 75
        };
      }

      if (!featuredUser) {
        featuredUser = {
          id: '1',
          nombre: 'Usuario Destacado',
          username: 'usuario_activo',
          avatar: '',
          actividad: 35
        };
      }

      setFeaturedContent({ 
        featuredWord, 
        featuredUser 
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Set fallback data
      setRecentActivity([]);
      setFeaturedContent({
        featuredWord: {
          palabra: 'Tlazocamati',
          traduccion: 'Gracias',
          busquedas: 75
        },
        featuredUser: {
          id: '1',
          nombre: 'Usuario Destacado',
          username: 'usuario_activo',
          avatar: '',
          actividad: 35
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  };

  const cardHover = {
    scale: 1.02,
    transition: { duration: 0.2 }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <ConditionalHeader />
      
      {/* Beta Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-4 text-center"
      >
        <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-medium">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/20 text-xs">
            BETA
          </span>
          <span>Nawatlajtol está en versión beta - ¡Ayúdanos a mejorarla!</span>
        </div>
      </motion.div>
      
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Personalized Greeting */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {getGreeting()}, {user?.nombre_completo?.split(' ')[0] || 'Usuario'}!
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Bienvenido a tu espacio de aprendizaje náhuatl
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Grid Layout - Notion Style */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activity Card */}
              <motion.div 
                variants={itemVariants}
                whileHover={cardHover}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Actividad Reciente
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Tus últimas interacciones
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/experiencia-social"
                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm font-medium flex items-center gap-1"
                  >
                    Ver todas
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <motion.div 
                        key={activity.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="text-2xl">{activity.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400">
                        No hay actividad reciente
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <motion.div variants={itemVariants} whileHover={cardHover} className="group">
                  <Link 
                    href="/diccionario" 
                    className="block bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <BookText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Diccionario
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Explora palabras náhuatl
                    </p>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={cardHover} className="group">
                  <Link 
                    href="/feedback" 
                    className="block bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      <ChevronRight className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Comunidad
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Únete a conversaciones
                    </p>
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column - Featured Content */}
            <div className="space-y-6">
              {/* Featured Word */}
              {featuredContent?.featuredWord && (
                <motion.div 
                  variants={itemVariants}
                  whileHover={cardHover}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Palabra Destacada
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Más buscada hoy
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {featuredContent.featuredWord.palabra}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {featuredContent.featuredWord.traduccion}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {featuredContent.featuredWord.busquedas} búsquedas
                      </span>
                      <Link 
                        href="/diccionario"
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center gap-1"
                      >
                        Explorar
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Featured User */}
              {featuredContent?.featuredUser && (
                <motion.div 
                  variants={itemVariants}
                  whileHover={cardHover}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Usuario Destacado
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Más activo hoy
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {featuredContent.featuredUser.nombre}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          @{featuredContent.featuredUser.username}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {featuredContent.featuredUser.actividad} interacciones
                      </span>
                      <Link 
                        href={`/profile/${featuredContent.featuredUser.id}`}
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center gap-1"
                        onClick={(e) => {
                          // Verificar si el ID es válido antes de navegar
                          if (featuredContent.featuredUser?.id === '1') {
                            e.preventDefault();
                            console.log('Usuario destacado con ID de fallback, no navegando');
                          }
                        }}
                      >
                        Ver perfil
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Stats */}
              <motion.div 
                variants={itemVariants}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Accesos Rápidos
                </h3>
                <div className="space-y-3">
                  <Link 
                    href="/contribuir"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <Award className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Contribuir
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform ml-auto" />
                  </Link>
                  
                  <Link 
                    href="/profile"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Mi Perfil
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform ml-auto" />
                  </Link>
                  
                  <Link 
                    href="/experiencia-social"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Experiencia Social
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform ml-auto" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}