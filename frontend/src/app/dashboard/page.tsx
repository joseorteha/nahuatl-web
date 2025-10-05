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
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, loading } = useAuth();
  console.log(`🏠 Dashboard render: user=${user?.username}, loading=${loading}, timestamp=${Date.now()}`);
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // SIMPLIFICADO: Timeout de seguridad para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ Dashboard: Timeout de loading alcanzado, forzando carga');
        setIsLoading(false);
      }
    }, 8000); // 8 segundos máximo

    return () => clearTimeout(timeout);
  }, [loading]);

  // Fetch dashboard data with REAL algorithms - MOVER ANTES DE useEffect
  const fetchDashboardData = async () => {
    console.log('📊 Dashboard: Iniciando fetch de datos...');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('📊 Dashboard: API_URL =', API_URL);
      
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

      console.log('✅ Dashboard: Datos cargados exitosamente');

    } catch (error) {
      console.error('❌ Dashboard: Error fetching data:', error);
      
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
      console.log('🏁 Dashboard: Finalizando carga, setIsLoading(false)');
      setIsLoading(false);
    }
  };

  // PRINCIPAL: Manejo unificado de estado de autenticación y carga de datos
  useEffect(() => {
    console.log(`🏠 Dashboard useEffect principal: loading=${loading}, user=${user?.username || 'null'}`);
    
    // Si todavía está cargando, no hacer nada
    if (loading) {
      console.log('🏠 Dashboard: Todavía en loading, esperando...');
      return;
    }
    
    // Si no hay usuario después de cargar, redirigir
    if (!user) {
      console.log('🚨 Dashboard: Sin usuario después de loading, redirigiendo a login');
      window.location.href = '/login';
      return;
    }
    
    // Si hay usuario y no está en loading, cargar datos del dashboard
    console.log('✅ Dashboard: Usuario confirmado, cargando datos del dashboard...');
    fetchDashboardData();
    
  }, [user, loading]); // Dependencias simplificadas

  // Función para obtener el saludo apropiado
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "¡Buenos días";
    } else if (hour < 18) {
      return "¡Buenas tardes";
    } else {
      return "¡Buenas noches";
    }
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

  // RENDERS CONDICIONALES AL FINAL - DESPUÉS DE TODOS LOS HOOKS
  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si no hay usuario
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <ConditionalHeader />

      {/* Hero section con personalidad */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 dark:from-cyan-800 dark:via-blue-800 dark:to-sky-800">
        {/* Elementos orgánicos de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-200/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 text-center text-white">
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight">
              {getGreeting()}, <span className="text-cyan-200">{user?.nombre_completo?.split(' ')[0] || user?.username || 'Amigo'}</span>! 
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100 font-light">
              ¿Listo para otra aventura en náhuatl?
            </p>
          </div>
          
          {/* CTA buttons con personalidad */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/diccionario"
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <BookText className="h-5 w-5" />
              Explorar palabras
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/contribuir"
              className="group bg-cyan-400 hover:bg-cyan-300 text-cyan-900 px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Award className="h-5 w-5" />
              Contribuir
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
        <div className="space-y-12">
          
          {/* Cards principales con diseño orgánico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link
              href="/diccionario"
              className="group relative block bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
            >
              {/* Decoración orgánica */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <BookText className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">3,500+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">palabras</div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Diccionario Náhuatl
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Sumérgete en la riqueza del náhuatl. Cada palabra tiene una historia que contar.
                </p>
                
                <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-semibold">
                  <span>Descubrir</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              href="/lecciones"
              className="group relative block bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
            >
              {/* Decoración orgánica */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">50+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">lecciones</div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Lecciones Interactivas
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Aprende paso a paso. Cada lección te acerca más a dominar este hermoso idioma.
                </p>
                
                <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Empezar</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Layout principal con sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Actividad reciente con diseño humano */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Tu Actividad
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        Lo que has estado haciendo últimamente
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/experiencia-social"
                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2"
                  >
                    Ver todo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 animate-pulse">
                          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
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
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      >
                        <div className="text-2xl w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {activity.title}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        ¡Comienza tu aventura!
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-4">
                        Interactúa con la comunidad y tu actividad aparecerá aquí
                      </p>
                      <Link 
                        href="/contribuir"
                        className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
                      >
                        <Award className="h-4 w-4" />
                        Haz tu primera contribución
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Accesos rápidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link
                  href="/feedback"
                  className="group block bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Comunidad
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Conecta con otros aprendices
                  </p>
                </Link>

                <Link
                  href="/contribuir"
                  className="group block bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Contribuir
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Ayuda a crecer el diccionario
                  </p>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Palabra destacada */}
              {featuredContent?.featuredWord && (
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-3xl p-6 border border-cyan-200 dark:border-cyan-800 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-2xl">👑</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                      Palabra del Día
                    </h3>
                    <p className="text-sm text-cyan-600 dark:text-cyan-400">
                      La más buscada hoy
                    </p>
                  </div>

                  <div className="text-center p-6 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-200/50 dark:border-cyan-700/50 mb-6">
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {featuredContent.featuredWord.palabra}
                    </div>
                    <div className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                      "{featuredContent.featuredWord.traduccion}"
                    </div>
                    <div className="flex items-center justify-center gap-2 text-cyan-600 dark:text-cyan-400">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {featuredContent.featuredWord.busquedas} personas la buscaron
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    href="/diccionario"
                    className="block w-full text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Explorar más palabras
                  </Link>
                </div>
              )}

              {/* Usuario destacado */}
              {featuredContent?.featuredUser && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-6 border border-blue-200 dark:border-blue-800 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                      Usuario Destacado
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      El más activo esta semana
                    </p>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {featuredContent.featuredUser.nombre}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        @{featuredContent.featuredUser.username}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-blue-600 dark:text-blue-400">
                        <span className="text-sm font-medium">
                          {featuredContent.featuredUser.actividad} contribuciones
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href={`/profile/${featuredContent.featuredUser.id}`}
                    className="block w-full text-center bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={(e) => {
                      if (featuredContent.featuredUser?.id === '1') {
                        e.preventDefault();
                        console.log('Usuario destacado con ID de fallback, no navegando');
                      }
                    }}
                  >
                    Ver perfil
                  </Link>
                </div>
              )}

              {/* Accesos rápidos sidebar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span>⚡</span>
                  Accesos Rápidos
                </h3>
                <div className="space-y-3">
                  {[
                    { href: "/profile", icon: Target, label: "Mi Perfil", desc: "Ve tu progreso", color: "blue" },
                    { href: "/experiencia-social", icon: TrendingUp, label: "Experiencia Social", desc: "Tu actividad", color: "green" }
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-[1.02] group"
                    >
                      <div className={`w-10 h-10 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <item.icon className={`h-5 w-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {item.label}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {item.desc}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}