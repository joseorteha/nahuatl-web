// components/features/profile/ComunidadTab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  Share2, 
  TrendingUp, 
  Award, 
  Crown,
  Star,
  ThumbsUp,
  ExternalLink,
  Plus,
  Bookmark,
  History,
  BarChart3,
  UserPlus,
  UserCheck,
  X
} from 'lucide-react';
import Link from 'next/link';

interface ComunidadData {
  experiencia_social: number;
  nivel_comunidad: string;
  siguiente_nivel: string | null;
  puntos_para_siguiente: number;
  progreso_porcentaje: number;
  total_temas: number;
  likes_dados: number;
  likes_recibidos: number;
  respuestas_creadas: number;
  contenido_compartido: number;
  ranking_semanal: number;
  ranking_mensual: number;
  ranking_anual: number;
  logros_comunidad: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    puntos_otorgados: number;
    fecha_obtenido: string;
  }>;
  historial_comunidad: Array<{
    id: string;
    puntos_ganados: number;
    motivo: string;
    descripcion: string;
    fecha_creacion: string;
  }>;
  temas_recientes: Array<{
    id: string;
    titulo: string;
    likes: number;
    compartidos: number;
    fecha_creacion: string;
  }>;
  seguidores: Array<{
    id: string;
    fecha_seguimiento: string;
    seguidor: {
      id: string;
      nombre_completo: string;
      username: string;
      url_avatar: string;
    };
  }>;
  seguidos: Array<{
    id: string;
    fecha_seguimiento: string;
    seguido: {
      id: string;
      nombre_completo: string;
      username: string;
      url_avatar: string;
    };
  }>;
  total_seguidores: number;
  total_seguidos: number;
}

interface ComunidadTabProps {
  userId: string;
}

export default function ComunidadTab({ userId }: ComunidadTabProps) {
  const [data, setData] = useState<ComunidadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSeguidoresModal, setShowSeguidoresModal] = useState(false);
  const [showSeguidosModal, setShowSeguidosModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const loadComunidadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar token en sessionStorage primero, luego en localStorage
      let token = sessionStorage.getItem('auth_tokens') || localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;

      const response = await fetch(`${API_URL}/api/profile/comunidad/${userId}`, {
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar datos de comunidad');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Error al cargar datos');
      }
    } catch (error) {
      console.error('Error loading comunidad data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [userId, API_URL]);

  useEffect(() => {
    loadComunidadData();
  }, [loadComunidadData]);

  const getNivelColor = (nivel: string) => {
    const colors = {
      'novato': 'from-gray-500 to-gray-600',
      'participante': 'from-green-500 to-green-600',
      'influencer': 'from-blue-500 to-blue-600',
      'lider': 'from-purple-500 to-purple-600',
      'embajador': 'from-yellow-500 to-yellow-600'
    };
    return colors[nivel as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getNivelIcon = (nivel: string) => {
    const icons = {
      'novato': Users,
      'participante': Heart,
      'influencer': Star,
      'lider': Award,
      'embajador': Crown
    };
    return icons[nivel as keyof typeof icons] || Users;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Cargando datos de comunidad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Error al cargar datos
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
        <button
          onClick={loadComunidadData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No hay datos disponibles
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          No se pudieron cargar los datos de comunidad.
        </p>
      </div>
    );
  }

  const NivelIcon = getNivelIcon(data.nivel_comunidad);

  return (
    <div className="space-y-6">
      {/* Header con nivel y progreso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/60 dark:border-blue-700/60"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getNivelColor(data.nivel_comunidad)} rounded-xl flex items-center justify-center shadow-lg`}>
              <NivelIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white capitalize">
                {data.nivel_comunidad}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                {data.experiencia_social} puntos de experiencia social
              </p>
            </div>
          </div>
          <Link
            href="/comunidad"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 sm:px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Tema</span>
            <span className="sm:hidden">Nuevo</span>
          </Link>
        </div>

        {/* Barra de progreso */}
        {data.siguiente_nivel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                Progreso hacia {data.siguiente_nivel}
              </span>
              <span className="text-slate-600 dark:text-slate-300">
                {data.progreso_porcentaje.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className={`bg-gradient-to-r ${getNivelColor(data.nivel_comunidad)} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${data.progreso_porcentaje}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.puntos_para_siguiente} puntos para el siguiente nivel
            </p>
          </div>
        )}
      </motion.div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <Link href="/comunidad">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-3 sm:p-4 border border-blue-200/60 dark:border-blue-700/60 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.total_temas}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Temas Creados
            </p>
            <div className="mt-2 flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-medium">Ver temas</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </motion.div>
        </Link>

        <Link href="/comunidad">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-red-50 to-red-100/80 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-3 sm:p-4 border border-red-200/60 dark:border-red-700/60 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {data.likes_dados}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Likes Dados
            </p>
            <div className="mt-2 flex items-center justify-center gap-1 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-medium">Ver actividad</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </motion.div>
        </Link>

        <Link href="/comunidad">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-green-100/80 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-3 sm:p-4 border border-green-200/60 dark:border-green-700/60 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {data.contenido_compartido}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Temas Compartidos
            </p>
            <div className="mt-2 flex items-center justify-center gap-1 text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-medium">Ver compartidos</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </motion.div>
        </Link>

        <Link href="/comunidad">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-3 sm:p-4 border border-purple-200/60 dark:border-purple-700/60 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
              #{data.ranking_semanal || 'N/A'}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Ranking Semanal
            </p>
            <div className="mt-2 flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-medium">Ver ranking</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </motion.div>
        </Link>

        {/* Tarjeta de Seguidores */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowSeguidoresModal(true)}
          className="bg-gradient-to-br from-orange-50 to-orange-100/80 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-3 sm:p-4 border border-orange-200/60 dark:border-orange-700/60 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
            {data?.total_seguidores || 0}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Seguidores
          </p>
          <div className="mt-2 flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-medium">Ver lista</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </motion.div>

        {/* Tarjeta de Seguidos */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowSeguidosModal(true)}
          className="bg-gradient-to-br from-indigo-50 to-indigo-100/80 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-3 sm:p-4 border border-indigo-200/60 dark:border-indigo-700/60 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {data?.total_seguidos || 0}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Siguiendo
          </p>
          <div className="mt-2 flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-medium">Ver lista</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </motion.div>
      </div>

      {/* Rankings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700/60"
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Rankings de Comunidad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200/60 dark:border-blue-700/60 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              #{data.ranking_semanal || 'N/A'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Semanal
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200/60 dark:border-purple-700/60 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Award className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              #{data.ranking_mensual || 'N/A'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Mensual
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/80 dark:from-yellow-900/30 dark:to-yellow-800/20 rounded-lg p-4 border border-yellow-200/60 dark:border-yellow-700/60 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              #{data.ranking_anual || 'N/A'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Anual
            </p>
          </div>
        </div>
      </motion.div>

      {/* Logros de comunidad */}
      {data.logros_comunidad.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700/60"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Logros de Comunidad ({data.logros_comunidad.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.logros_comunidad.map((logro, index) => (
              <motion.div
                key={logro.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200/60 dark:border-purple-700/60"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {logro.nombre}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      +{logro.puntos_otorgados} puntos
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                  {logro.descripcion}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Obtenido: {new Date(logro.fecha_obtenido).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Temas recientes */}
      {data.temas_recientes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700/60"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            Temas Recientes
          </h3>
          <div className="space-y-3">
            {data.temas_recientes.map((tema, index) => (
              <motion.div
                key={tema.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200/60 dark:border-blue-700/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {tema.titulo}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {tema.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      {tema.compartidos}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(tema.fecha_creacion).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Navegación rápida */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Link href="/comunidad" className="block">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/60 dark:border-blue-700/60 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Nuevo Tema
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Crea un tema de conversación
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparte tus ideas y participa en la comunidad
            </p>
          </div>
        </Link>

        <Link href="/experiencia-social" className="block">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200/60 dark:border-purple-700/60 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Experiencia Social
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Ve tu progreso social
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Revisa tu actividad social y logros
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Modal de Seguidores */}
      {showSeguidoresModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-500" />
                Seguidores ({data?.total_seguidores || 0})
              </h3>
              <button
                onClick={() => setShowSeguidoresModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {data?.seguidores && data.seguidores.length > 0 ? (
                <div className="space-y-3">
                  {data.seguidores.map((seguidor) => (
                    <div key={seguidor.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                        {seguidor.seguidor.url_avatar ? (
                          <img 
                            src={seguidor.seguidor.url_avatar} 
                            alt={seguidor.seguidor.nombre_completo}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {seguidor.seguidor.nombre_completo.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {seguidor.seguidor.nombre_completo}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          @{seguidor.seguidor.username}
                        </p>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(seguidor.fecha_seguimiento).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Aún no tienes seguidores
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Seguidos */}
      {showSeguidosModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                Siguiendo ({data?.total_seguidos || 0})
              </h3>
              <button
                onClick={() => setShowSeguidosModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {data?.seguidos && data.seguidos.length > 0 ? (
                <div className="space-y-3">
                  {data.seguidos.map((seguido) => (
                    <div key={seguido.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                        {seguido.seguido.url_avatar ? (
                          <img 
                            src={seguido.seguido.url_avatar} 
                            alt={seguido.seguido.nombre_completo}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {seguido.seguido.nombre_completo.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {seguido.seguido.nombre_completo}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          @{seguido.seguido.username}
                        </p>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(seguido.fecha_seguimiento).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Aún no sigues a nadie
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
