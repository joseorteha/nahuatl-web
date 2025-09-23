'use client';

import { useState, useEffect } from 'react';
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

export default function ExperienciaSocialTab() {
  const { user } = useAuthBackend();
  const [data, setData] = useState<ExperienciaSocialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'progreso' | 'ranking'>('general');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadExperienciaSocial();
    }
  }, [user]);

  const loadExperienciaSocial = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/experiencia-social/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setData(data);
      }
    } catch (error) {
      console.error('Error cargando experiencia social:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNivelExperiencia = (puntos: number) => {
    if (puntos < 100) return { nivel: 'Principiante', emoji: '🌱', color: 'text-green-600' };
    if (puntos < 500) return { nivel: 'Aprendiz', emoji: '📚', color: 'text-blue-600' };
    if (puntos < 1000) return { nivel: 'Intermedio', emoji: '🎯', color: 'text-purple-600' };
    if (puntos < 2000) return { nivel: 'Avanzado', emoji: '⭐', color: 'text-orange-600' };
    return { nivel: 'Experto', emoji: '👑', color: 'text-yellow-600' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-cyan-600/20 border-t-cyan-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-5xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
          No hay datos de experiencia social
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Comienza a participar en la comunidad para ganar puntos.
        </p>
      </div>
    );
  }

  const nivelInfo = getNivelExperiencia(data.experienciaSocial);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Experiencia Social
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Gana puntos participando en la comunidad y compite con otros usuarios.
        </p>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-2 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          {[
            { id: 'general', label: 'Vista General', icon: BarChart3 },
            { id: 'progreso', label: 'Mi Progreso', icon: Target },
            { id: 'ranking', label: 'Ranking', icon: Crown }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'general' | 'progreso' | 'ranking')}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
      >
        {activeTab === 'general' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
                <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                  {data.experienciaSocial}
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">Puntos Totales</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {nivelInfo.emoji}
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">{nivelInfo.nivel}</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-slate-600 dark:text-slate-400 mb-2">
                  #{data.rankings.semanal}
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">Ranking Semanal</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/profile/${user?.id}`}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium text-center hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Ver Mi Perfil Completo
              </Link>
              <button
                onClick={() => setActiveTab('ranking')}
                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
              >
                Ver Ranking Completo
              </button>
            </div>
          </div>
        )}

        {activeTab === 'progreso' && (
          <div className="space-y-8">
            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Actividad Social</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300">Likes dados</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{data.estadisticas.likesDados}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300">Shares dados</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{data.estadisticas.sharesDados}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300">Respuestas creadas</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{data.estadisticas.respuestasCreadas}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Reconocimiento</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300">Likes recibidos</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{data.estadisticas.likesRecibidos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300">Shares recibidos</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{data.estadisticas.sharesRecibidos}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Rankings */}
            {data.historialRankings.length > 0 && (
              <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Historial de Rankings</h3>
                <div className="space-y-2">
                  {data.historialRankings.map((ranking, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">{ranking.periodo}</span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2">#{ranking.posicion}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        {ranking.experiencia_social} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Link
                href={`/profile/${user?.id}`}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Ver Mi Perfil Completo
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-8">
            {/* Current Rankings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                  #{data.rankings.semanal}
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">Semanal</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  #{data.rankings.mensual}
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">Mensual</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-2">
                  #{data.rankings.anual}
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">Anual</div>
              </div>
            </div>

            {/* Global Ranking */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top 10 Global</h3>
              <div className="space-y-3">
                {data.rankingGeneral.map((usuario, index) => (
                  <div key={usuario.usuario_id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{usuario.perfiles.nombre_completo}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">@{usuario.perfiles.username}</div>
                      </div>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 font-semibold">
                      {usuario.experiencia_social} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Search */}
            <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Buscar Usuarios</h3>
              <UserSearch />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
