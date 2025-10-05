// components/features/profile/ConocimientoTab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Star, 
  BookOpen, 
  Award, 
  Crown,
  TrendingUp, 
  BarChart3, 
  History,
  ExternalLink,
  Plus,
  Bookmark,
  Users,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';

interface ConocimientoData {
  puntos_conocimiento: number;
  nivel_conocimiento: string;
  siguiente_nivel: string | null;
  puntos_para_siguiente: number;
  progreso_porcentaje: number;
  total_contribuciones: number;
  contribuciones_aprobadas: number;
  contribuciones_pendientes: number;
  contribuciones_rechazadas: number;
  palabras_guardadas: number;
  logros_conocimiento: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    puntos_otorgados: number;
    fecha_obtenido: string;
  }>;
  historial_conocimiento: Array<{
    id: string;
    puntos_ganados: number;
    motivo: string;
    descripcion: string;
    fecha_creacion: string;
  }>;
  contribuciones_recientes: Array<{
    id: string;
    word: string;
    definition: string;
    estado: string;
    fecha_creacion: string;
    info_gramatical?: string;
    razon_contribucion?: string;
  }>;
  palabras_guardadas_recientes?: Array<{
    id: string;
    word: string;
    definition: string;
    info_gramatical?: string;
    fecha_guardado: string;
  }>;
  lecciones_completadas?: number;
  evaluaciones_aprobadas?: number;
}

interface ConocimientoTabProps {
  userId: string;
}

export default function ConocimientoTab({ userId }: ConocimientoTabProps) {
  const [data, setData] = useState<ConocimientoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const loadConocimientoData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar token en sessionStorage primero, luego en localStorage
      let token = sessionStorage.getItem('auth_tokens') || localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;

      const response = await fetch(`${API_URL}/api/profile/conocimiento/${userId}`, {
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar datos de conocimiento');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Error al cargar datos');
      }
    } catch (error) {
      console.error('Error loading conocimiento data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [userId, API_URL]);

  useEffect(() => {
    loadConocimientoData();
  }, [loadConocimientoData]);

  const getNivelColor = (nivel: string) => {
    const colors = {
      'principiante': 'from-gray-500 to-gray-600',
      'estudiante': 'from-green-500 to-green-600',
      'conocedor': 'from-blue-500 to-blue-600',
      'maestro': 'from-purple-500 to-purple-600',
      'experto': 'from-yellow-500 to-yellow-600'
    };
    return colors[nivel as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getNivelIcon = (nivel: string) => {
    const icons = {
      'principiante': BookOpen,
      'estudiante': Star,
      'conocedor': Award,
      'maestro': Trophy,
      'experto': Crown
    };
    return icons[nivel as keyof typeof icons] || BookOpen;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Cargando datos de conocimiento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Error al cargar datos
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
        <button
          onClick={loadConocimientoData}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
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
          <Target className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No hay datos disponibles
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          No se pudieron cargar los datos de conocimiento.
        </p>
      </div>
    );
  }

  const NivelIcon = getNivelIcon(data.nivel_conocimiento);

  return (
    <div className="space-y-6">
      {/* Header con nivel y progreso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/20 rounded-2xl p-6 border border-cyan-200/60 dark:border-cyan-700/60"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getNivelColor(data.nivel_conocimiento)} rounded-xl flex items-center justify-center shadow-lg`}>
              <NivelIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white capitalize">
                {data.nivel_conocimiento}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                {data.puntos_conocimiento} puntos de conocimiento
              </p>
            </div>
          </div>
          <Link
            href="/contribuir"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Contribución</span>
            <span className="sm:hidden">Nueva</span>
          </Link>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">
              {data.siguiente_nivel ? `Progreso hacia ${data.siguiente_nivel}` : 'Progreso actual'}
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              {data.progreso_porcentaje.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className={`bg-gradient-to-r ${getNivelColor(data.nivel_conocimiento)} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${Math.max(0, Math.min(100, data.progreso_porcentaje))}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {data.siguiente_nivel 
              ? `${data.puntos_para_siguiente} puntos para el siguiente nivel`
              : '¡Has alcanzado el nivel máximo!'
            }
          </p>
        </div>
      </motion.div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-cyan-50 to-cyan-100/80 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-xl p-3 sm:p-4 border border-cyan-200/60 dark:border-cyan-700/60 text-center"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">
            {data.total_contribuciones}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Total Contribuciones
          </p>
        </motion.div>

        <Link href="/contribuir">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-green-100/80 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-3 sm:p-4 border border-green-200/60 dark:border-green-700/60 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {data.contribuciones_aprobadas}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Aprobadas
            </p>
            <div className="mt-2 flex items-center justify-center gap-1 text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-medium">Ver todas</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </motion.div>
        </Link>

        <Link href="/contribuir">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-yellow-50 to-yellow-100/80 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl p-3 sm:p-4 border border-yellow-200/60 dark:border-yellow-700/60 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {data.contribuciones_pendientes}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Pendientes
            </p>
            <div className="mt-2 flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-medium">Ver estado</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </motion.div>
        </Link>

        <Link href="/diccionario">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-3 sm:p-4 border border-blue-200/60 dark:border-blue-700/60 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.palabras_guardadas}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Palabras Guardadas
            </p>
            <div className="mt-2 flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-medium">Ver diccionario</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Logros de conocimiento */}
      {data.logros_conocimiento.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700/60"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Logros de Conocimiento ({data.logros_conocimiento.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.logros_conocimiento.map((logro, index) => (
              <motion.div
                key={logro.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100/80 dark:from-yellow-900/30 dark:to-yellow-800/20 rounded-lg p-4 border border-yellow-200/60 dark:border-yellow-700/60"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
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

      {/* Contribuciones recientes */}
      {data.contribuciones_recientes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700/60"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-500" />
            Contribuciones Recientes
          </h3>
          <div className="space-y-3">
            {data.contribuciones_recientes.map((contribucion, index) => (
              <Link key={contribucion.id} href="/contribuir">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-cyan-200/60 dark:border-cyan-700/60 cursor-pointer hover:shadow-lg transition-all duration-300 group"
                >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {contribucion.word}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    contribucion.estado === 'aprobada' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : contribucion.estado === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {contribucion.estado}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">
                  {contribucion.definition}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(contribucion.fecha_creacion).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs font-medium">Ver detalles</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Palabras guardadas recientes */}
      {data.palabras_guardadas_recientes && data.palabras_guardadas_recientes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700/60"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-500" />
            Palabras Guardadas Recientes
          </h3>
          <div className="space-y-3">
            {data.palabras_guardadas_recientes.map((palabra, index) => (
              <Link key={palabra.id} href="/diccionario">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200/60 dark:border-blue-700/60 cursor-pointer hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {palabra.word}
                    </h4>
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs font-medium">Ver en diccionario</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">
                    {palabra.definition}
                  </p>
                  {palabra.info_gramatical && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">
                      {palabra.info_gramatical}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Guardada: {new Date(palabra.fecha_guardado).toLocaleDateString()}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Navegación rápida */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Link href="/contribuir" className="block">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-200/60 dark:border-cyan-700/60 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Nueva Contribución
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Contribuye al diccionario
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Agrega nuevas palabras y definiciones al diccionario náhuatl
            </p>
          </div>
        </Link>

        <Link href="/lecciones" className="block">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200/60 dark:border-purple-700/60 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Lecciones
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Aprende náhuatl
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Completa lecciones para ganar más puntos de conocimiento
            </p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
