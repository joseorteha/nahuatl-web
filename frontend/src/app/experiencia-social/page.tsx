'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Heart,
  Share2,
  MessageSquare,
  Award,
  Target,
  BarChart3,
  Crown,
  Medal,
  ExternalLink,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import UserSearch from '@/components/features/social/UserSearch';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ExperienciaSocialData {
  experienciaSocial: number;
  experienciaSocialCalculada: number;
  rankings: {
    semanal: number;
    mensual: number;
    anual: number;
  };
  estadisticas: {
    likesDados: number;
    sharesDados: number;
    likesRecibidos: number;
    sharesRecibidos: number;
    respuestasCreadas: number;
  };
  historialRankings: Array<{
    periodo: string;
    posicion: number;
    experiencia_social: number;
    fecha_actualizacion: string;
  }>;
  rankingGeneral: Array<{
    usuario_id: string;
    experiencia_social: number;
    perfiles: {
      nombre_completo: string;
      username: string;
      url_avatar?: string;
    };
  }>;
}

export default function ExperienciaSocialPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ExperienciaSocialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'personal' | 'ranking'>('general');
  const [rankingPeriodo, setRankingPeriodo] = useState<'semanal' | 'mensual' | 'anual'>('semanal');

  const fetchExperienciaSocial = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/experiencia-social/${user.id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching experiencia social:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!loading && user) {
      fetchExperienciaSocial();
    }
  }, [loading, user, fetchExperienciaSocial]);

  const getNivelExperiencia = (exp: number) => {
    if (exp >= 1000) return { nivel: 'Leyenda Social', color: 'from-purple-600 to-pink-600', icon: '👑', bgColor: 'bg-purple-50 dark:bg-purple-900/20' };
    if (exp >= 500) return { nivel: 'Maestro Social', color: 'from-blue-600 to-purple-600', icon: '🏆', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
    if (exp >= 200) return { nivel: 'Experto Social', color: 'from-green-600 to-blue-600', icon: '⭐', bgColor: 'bg-green-50 dark:bg-green-900/20' };
    if (exp >= 50) return { nivel: 'Contribuidor Social', color: 'from-yellow-600 to-green-600', icon: '🌟', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { nivel: 'Principiante Social', color: 'from-gray-600 to-yellow-600', icon: '🌱', bgColor: 'bg-gray-50 dark:bg-gray-900/20' };
  };

  const getPosicionIcon = (posicion: number) => {
    if (posicion === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (posicion === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (posicion === 3) return <Award className="w-5 h-5 text-orange-500" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{posicion}</span>;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <ConditionalHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <div className="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full"></div>
            </motion.div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando experiencia social...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <ConditionalHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Trophy className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Inicia sesión para ver tu experiencia social
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Necesitas estar logueado para acceder a esta sección
            </p>
          </div>
        </div>
      </div>
    );
  }

  const nivelInfo = data ? getNivelExperiencia(data.experienciaSocial) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <ConditionalHeader /> 
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-6xl">
        {/* Header Section - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 lg:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-slate-600 bg-clip-text text-transparent">
              Experiencia Social
            </h1>
          </div>
          <p className="text-xs sm:text-sm lg:text-base xl:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-3 sm:px-4">
            Compite, interactúa y gana experiencia social en la comunidad. 
            ¡Tu impacto social se refleja en tu ranking!
          </p>
          
          {/* Back to Community Button - Responsive */}
          <div className="mt-4 sm:mt-6">
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Volver a la Comunidad</span>
              <span className="sm:hidden">Comunidad</span>
            </Link>
          </div>
        </motion.div>

        {/* Tabs - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg mb-6 sm:mb-8"
        >
          <div className="border-b border-slate-200/50 dark:border-slate-700/50">
            <nav className="flex flex-col sm:flex-row px-2 sm:px-4 lg:px-6">
              {[
                { id: 'general', label: 'Vista General', icon: BarChart3, shortLabel: 'General' },
                { id: 'personal', label: 'Mi Progreso', icon: Target, shortLabel: 'Progreso' },
                { id: 'ranking', label: 'Ranking', icon: Trophy, shortLabel: 'Ranking' }
              ].map(({ id, label, icon: Icon, shortLabel }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as 'general' | 'personal' | 'ranking')}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3 py-2.5 sm:py-3 lg:py-4 px-2 sm:px-3 lg:px-6 border-b-2 font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    activeTab === id
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{shortLabel}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content - Responsive */}
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
            {activeTab === 'general' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Nivel de experiencia */}
                {nivelInfo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-gradient-to-r ${nivelInfo.color} rounded-2xl p-8 text-white text-center`}
                  >
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <span className="text-4xl">{nivelInfo.icon}</span>
                      <div>
                        <div className="text-3xl font-bold">{nivelInfo.nivel}</div>
                        <div className="text-lg opacity-90">
                          {data?.experienciaSocial || 0} puntos de experiencia social
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div 
                        className="bg-white h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(((data?.experienciaSocial || 0) / 1000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </motion.div>
                )}

                {/* Estadísticas principales - Responsive */}
                {data && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {[
                      { 
                        label: 'Likes Dados', 
                        value: data.estadisticas.likesDados, 
                        icon: Heart, 
                        color: 'from-red-500 to-pink-500',
                        bgColor: 'bg-red-50 dark:bg-red-900/20'
                      },
                      { 
                        label: 'Shares Dados', 
                        value: data.estadisticas.sharesDados, 
                        icon: Share2, 
                        color: 'from-blue-500 to-cyan-500',
                        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
                      },
                      { 
                        label: 'Likes Recibidos', 
                        value: data.estadisticas.likesRecibidos, 
                        icon: Heart, 
                        color: 'from-green-500 to-emerald-500',
                        bgColor: 'bg-green-50 dark:bg-green-900/20'
                      },
                      { 
                        label: 'Respuestas', 
                        value: data.estadisticas.respuestasCreadas, 
                        icon: MessageSquare, 
                        color: 'from-purple-500 to-pink-500',
                        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`${stat.bgColor} rounded-xl p-3 sm:p-4 lg:p-6 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                            <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{stat.label}</span>
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                          {stat.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Rankings del usuario - Responsive */}
                {data && (
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {[
                      { periodo: 'Semanal', valor: data.rankings.semanal, color: 'from-yellow-500 to-orange-500' },
                      { periodo: 'Mensual', valor: data.rankings.mensual, color: 'from-blue-500 to-purple-500' },
                      { periodo: 'Anual', valor: data.rankings.anual, color: 'from-purple-500 to-pink-500' }
                    ].map(({ periodo, valor, color }, index) => (
                      <motion.div
                        key={periodo}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className={`bg-gradient-to-r ${color} rounded-xl p-4 sm:p-6 text-white text-center hover:shadow-lg transition-all duration-300`}
                      >
                        <div className="text-xs sm:text-sm opacity-90 mb-1 sm:mb-2">{periodo}</div>
                        <div className="text-2xl sm:text-3xl font-bold">
                          {valor > 0 ? `#${valor}` : 'N/A'}
                        </div>
                        <div className="text-xs sm:text-sm opacity-75 mt-1">posición</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Solo UserSearch - Responsive */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center mt-6 sm:mt-8"
                  >
                    <UserSearch />
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="space-y-6 sm:space-y-8">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                  Mi Progreso Social
                </h3>
                
                {/* Progreso detallado */}
                {data && (
                  <div className="space-y-6">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
                        Experiencia Social Total
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                        <span className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                          {data.experienciaSocial}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          de 1000 para siguiente nivel
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 sm:h-3">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 sm:h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((data.experienciaSocial / 1000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Historial de rankings */}
                    {data.historialRankings.length > 0 && (
                      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                        <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
                          Historial de Rankings
                        </h4>
                        <div className="space-y-2 sm:space-y-3">
                          {data.historialRankings.slice(0, 5).map((ranking, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                {getPosicionIcon(ranking.posicion)}
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white capitalize text-sm sm:text-base">
                                    {ranking.periodo}
                                  </div>
                                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    {new Date(ranking.fecha_actualizacion).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-cyan-600 dark:text-cyan-400 text-sm sm:text-base">
                                  {ranking.experiencia_social}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">puntos</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Solo UserSearch en sección personal - Responsive */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-center mt-6 sm:mt-8"
                  >
                    <UserSearch />
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'ranking' && (
              <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Ranking de Experiencia Social
                  </h3>
                  <div className="flex gap-1.5 sm:gap-2">
                    {['semanal', 'mensual', 'anual'].map((periodo) => (
                      <button
                        key={periodo}
                        onClick={() => setRankingPeriodo(periodo as 'semanal' | 'mensual' | 'anual')}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${
                          rankingPeriodo === periodo
                            ? 'bg-cyan-500 text-white shadow-lg'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {data && data.rankingGeneral.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {data.rankingGeneral.map((usuario, index) => (
                      <motion.div
                        key={usuario.usuario_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                        onClick={() => router.push(`/profile/${usuario.usuario_id}`)}
                      >
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-bold text-sm sm:text-lg group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg group-hover:scale-110 transition-transform duration-300">
                          {usuario.perfiles.nombre_completo.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                            {usuario.perfiles.nombre_completo}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            @{usuario.perfiles.username}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                            {usuario.experiencia_social.toLocaleString()}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">puntos</div>
                        </div>
                        <div className="text-cyan-500 group-hover:text-cyan-600 transition-colors duration-300">
                          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      No hay datos de ranking disponibles
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                      Los rankings se actualizan periódicamente
                    </p>
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
