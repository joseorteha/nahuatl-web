'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Trophy, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';

interface Estudiante {
  id: string;
  usuario_id: string;
  estado_leccion: string;
  puntuacion_quiz: number;
  total_preguntas_quiz: number;
  tiempo_total_minutos: number;
  intentos_quiz: number;
  fecha_inicio: string;
  fecha_completada: string | null;
  fecha_ultima_actividad: string;
  estudiante: {
    id: string;
    nombre_completo: string;
    username: string;
    email: string;
    url_avatar: string;
  };
}

interface Estadisticas {
  total: number;
  completados: number;
  enProgreso: number;
  promedioQuiz: number;
}

export default function EstudiantesLeccionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const leccionId = params.leccionId as string;

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (leccionId && user) {
      fetchEstudiantes();
    }
  }, [leccionId, user]);

  const fetchEstudiantes = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') 
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
        : null;

      const response = await fetch(`${API_URL}/api/progreso/estudiantes/${leccionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener estudiantes');
      }

      const data = await response.json();
      setEstudiantes(data.estudiantes);
      setEstadisticas(data.estadisticas);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completada':
        return <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">Completada</span>;
      case 'en_progreso':
        return <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">En Progreso</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">No Iniciada</span>;
    }
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <>
        <ConditionalHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
          <motion.div
            className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <ConditionalHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <button
              onClick={() => router.push('/profesor')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al panel
            </button>

            <div className="flex items-center gap-4 mb-6">
              <Users className="h-8 w-8 text-cyan-500" />
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Estudiantes Inscritos
              </h1>
            </div>
          </motion.div>

          {/* Estadísticas */}
          {estadisticas && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-cyan-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{estadisticas.total}</p>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Completados</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{estadisticas.completados}</p>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">En Progreso</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{estadisticas.enProgreso}</p>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Promedio Quiz</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{estadisticas.promedioQuiz.toFixed(1)}</p>
              </div>
            </motion.div>
          )}

          {/* Lista de Estudiantes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Estudiante</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Puntuación</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Intentos</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Tiempo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Última Actividad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {estudiantes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-600 dark:text-slate-400">
                        No hay estudiantes inscritos en esta lección
                      </td>
                    </tr>
                  ) : (
                    estudiantes.map((estudiante) => (
                      <tr key={estudiante.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                              {estudiante.estudiante.nombre_completo.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {estudiante.estudiante.nombre_completo}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                @{estudiante.estudiante.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getEstadoBadge(estudiante.estado_leccion)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {estudiante.puntuacion_quiz}/{estudiante.total_preguntas_quiz}
                            </span>
                            {estudiante.total_preguntas_quiz > 0 && (
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                ({Math.round((estudiante.puntuacion_quiz / estudiante.total_preguntas_quiz) * 100)}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-900 dark:text-slate-100">
                          {estudiante.intentos_quiz}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-900 dark:text-slate-100">
                              {estudiante.tiempo_total_minutos} min
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {formatFecha(estudiante.fecha_ultima_actividad)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
