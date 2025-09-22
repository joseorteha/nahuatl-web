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
import { useAuthBackend } from '@/hooks/useAuthBackend';
import Header from '@/components/Header';
import UserSearch from '@/components/UserSearch';
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
  const { user, loading } = useAuthBackend();
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        <Header />
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        <Header />
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Experiencia Social
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Compite, interactúa y gana experiencia social en la comunidad. 
            ¡Tu impacto social se refleja en tu ranking!
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 mb-8"
        >
          <div className="border-b border-gray-200/50 dark:border-gray-700/50">
            <nav className="flex px-6">
              {[
                { id: 'general', label: 'Vista General', icon: BarChart3 },
                { id: 'personal', label: 'Mi Progreso', icon: Target },
                { id: 'ranking', label: 'Ranking', icon: Trophy }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as 'general' | 'personal' | 'ranking')}
                  className={`flex items-center gap-3 py-4 px-6 border-b-2 font-semibold text-sm transition-all duration-300 ${
                    activeTab === id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'general' && (
              <div className="space-y-8">
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

                {/* Estadísticas principales */}
                {data && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                        className={`${stat.bgColor} rounded-xl p-6 border border-gray-200/60 dark:border-gray-700/60`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                            <stat.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Rankings del usuario */}
                {data && (
                  <div className="grid grid-cols-3 gap-6">
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
                        className={`bg-gradient-to-r ${color} rounded-xl p-6 text-white text-center`}
                      >
                        <div className="text-sm opacity-90 mb-2">{periodo}</div>
                        <div className="text-3xl font-bold">
                          {valor > 0 ? `#${valor}` : 'N/A'}
                        </div>
                        <div className="text-sm opacity-75 mt-1">posición</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Botones de navegación */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
                  >
                    <button
                      onClick={() => router.push(`/profile/${user.id}`)}
                      className="group bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-3"
                    >
                      <User className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                      <span>Ver Mi Perfil Completo</span>
                      <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                    
                    <UserSearch />
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Mi Progreso Social
                </h3>
                
                {/* Progreso detallado */}
                {data && (
                  <div className="space-y-6">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Experiencia Social Total
                      </h4>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {data.experienciaSocial}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          de 1000 para siguiente nivel
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((data.experienciaSocial / 1000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Historial de rankings */}
                    {data.historialRankings.length > 0 && (
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Historial de Rankings
                        </h4>
                        <div className="space-y-3">
                          {data.historialRankings.slice(0, 5).map((ranking, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {getPosicionIcon(ranking.posicion)}
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white capitalize">
                                    {ranking.periodo}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(ranking.fecha_actualizacion).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-purple-600 dark:text-purple-400">
                                  {ranking.experiencia_social}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">puntos</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Botones de navegación en sección personal */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
                  >
                    <button
                      onClick={() => router.push(`/profile/${user.id}`)}
                      className="group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-3"
                    >
                      <Target className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                      <span>Ver Mi Progreso Completo</span>
                      <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                    
                    <UserSearch />
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'ranking' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Ranking de Experiencia Social
                  </h3>
                  <div className="flex gap-2">
                    {['semanal', 'mensual', 'anual'].map((periodo) => (
                      <button
                        key={periodo}
                        onClick={() => setRankingPeriodo(periodo as 'semanal' | 'mensual' | 'anual')}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                          rankingPeriodo === periodo
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {data && data.rankingGeneral.length > 0 ? (
                  <div className="space-y-4">
                    {data.rankingGeneral.map((usuario, index) => (
                      <motion.div
                        key={usuario.usuario_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                        onClick={() => router.push(`/profile/${usuario.usuario_id}`)}
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                          {usuario.perfiles.nombre_completo.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {usuario.perfiles.nombre_completo}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{usuario.perfiles.username}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {usuario.experiencia_social.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">puntos</div>
                        </div>
                        <div className="text-purple-500 group-hover:text-purple-600 transition-colors duration-300">
                          <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No hay datos de ranking disponibles
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">
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
