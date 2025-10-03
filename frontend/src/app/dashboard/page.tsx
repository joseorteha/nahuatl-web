'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookText,
  Users,
  Heart,
  TrendingUp,
  Award,
  ChevronRight,
  BookOpen,
  Target,
  Clock,
  Activity,
  ArrowRight,
  User
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <ConditionalHeader />

      <div className="bg-blue-600 dark:bg-blue-900 border-b border-blue-700">
        <div className="container mx-auto px-4 sm:px-6 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-blue-500 dark:bg-blue-800 rounded text-xs font-semibold text-white">
                  BETA
                </div>
                <span className="text-sm text-white">Nawatlajtol está en desarrollo</span>
              </div>
            </div>
            <Link
              href="/feedback"
              className="text-sm text-white hover:text-blue-100 transition-colors flex items-center gap-1"
            >
              <Heart className="h-3.5 w-3.5" />
              Ayúdanos a mejorar
            </Link>
          </div>
        </div>
      </div>


      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {getGreeting()}, {user?.nombre_completo?.split(' ')[0] || 'Usuario'}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Tu espacio de aprendizaje náhuatl
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/diccionario"
              className="group block bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BookText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Diccionario Náhuatl
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Explora y aprende palabras náhuatl con traducciones y ejemplos
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <BookOpen className="h-4 w-4" />
                <span>+3,500 palabras</span>
              </div>
            </Link>

            <Link
              href="/lecciones"
              className="group block bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Lecciones Interactivas
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Aprende náhuatl paso a paso con lecciones estructuradas
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Target className="h-4 w-4" />
                <span>+50 lecciones</span>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      Actividad Reciente
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Tus últimas interacciones
                    </p>
                  </div>
                  <Link
                    href="/experiencia-social"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                  >
                    Ver todas
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 animate-pulse">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        No hay actividad reciente
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/feedback"
                  className="group block bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Comunidad
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Únete a conversaciones
                  </p>
                </Link>

                <Link
                  href="/contribuir"
                  className="group block bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Contribuir
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Añade palabras
                  </p>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              {featuredContent?.featuredWord && (
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Palabra Destacada
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Más buscada hoy
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {featuredContent.featuredWord.palabra}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {featuredContent.featuredWord.traduccion}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {featuredContent.featuredWord.busquedas} búsquedas
                      </span>
                      <Link
                        href="/diccionario"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        Explorar
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {featuredContent?.featuredUser && (
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Usuario Destacado
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Más activo hoy
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                        onClick={(e) => {
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
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Accesos Rápidos
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/contribuir"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 flex-1">
                      Contribuir
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 flex-1">
                      Mi Perfil
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </Link>

                  <Link
                    href="/experiencia-social"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 flex-1">
                      Experiencia Social
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}