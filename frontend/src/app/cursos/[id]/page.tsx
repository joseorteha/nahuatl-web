'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Users, Clock, Star, Play, ChevronRight,
  CheckCircle, User, Calendar, Award, Target, BookMarked
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';

interface Modulo {
  id: string;
  titulo: string;
  descripcion: string;
  orden_modulo: number;
  duracion_total_minutos: number;
  numero_temas: number;
  temas: Tema[];
}

interface Tema {
  id: string;
  titulo: string;
  descripcion: string;
  orden_tema: number;
  es_obligatorio: boolean;
}

interface Calificacion {
  calificacion: number;
  comentario: string;
  fecha_calificacion: string;
  usuario: {
    nombre_completo: string;
    url_avatar?: string;
  };
}

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_portada?: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  categoria: string;
  duracion_total_minutos: number;
  profesor: {
    id: string;
    nombre_completo: string;
    url_avatar?: string;
    biografia?: string;
  };
  estudiantes_inscritos: number;
  puntuacion_promedio: number;
  es_destacado: boolean;
  fecha_creacion: string;
  fecha_publicacion?: string;
  objetivos_curso: string[];
  requisitos_previos: string[];
  palabras_clave: string[];
  modulos: Modulo[];
  calificaciones: Calificacion[];
}

export default function CursoIndividualPage() {
  const { user } = useAuth();
  const params = useParams();
  const cursoId = params.id as string;

  const [curso, setCurso] = useState<Curso | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [estaInscrito, setEstaInscrito] = useState(false);
  const [isInscribiendose, setIsInscribiendose] = useState(false);

  useEffect(() => {
    if (cursoId) {
      fetchCurso();
      if (user) {
        verificarInscripcion();
      }
    }
  }, [cursoId, user]);

  const fetchCurso = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/cursos/${cursoId}`);

      if (response.ok) {
        const data = await response.json();
        setCurso(data.curso);
      } else {
        console.error('Error al obtener curso');
      }
    } catch (error) {
      console.error('Error al obtener curso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verificarInscripcion = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens')
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken
        : null;

      if (!token) return;

      const response = await fetch(`${API_URL}/api/cursos/${cursoId}/verificar-inscripcion`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEstaInscrito(data.inscrito);
      }
    } catch (error) {
      console.error('Error al verificar inscripción:', error);
    }
  };

  const handleInscribirse = async () => {
    if (!user) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login';
      return;
    }

    setIsInscribiendose(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens')
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken
        : null;

      const response = await fetch(`${API_URL}/api/cursos/${cursoId}/inscribir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setEstaInscrito(true);
        // Actualizar contador de estudiantes
        if (curso) {
          setCurso(prev => prev ? { ...prev, estudiantes_inscritos: prev.estudiantes_inscritos + 1 } : null);
        }
        alert('¡Te has inscrito exitosamente en el curso!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al inscribirse en el curso');
      }
    } catch (error) {
      console.error('Error al inscribirse:', error);
      alert('Error de conexión');
    } finally {
      setIsInscribiendose(false);
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'principiante': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermedio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'avanzado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <>
        <ConditionalHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </>
    );
  }

  if (!curso) {
    return (
      <>
        <ConditionalHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Curso no encontrado
            </h2>
            <Link
              href="/cursos"
              className="text-cyan-500 hover:text-cyan-600"
            >
              Volver a Cursos
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ConditionalHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header con navegación */}
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-500 mb-6"
          >
            <ArrowLeft size={20} />
            Volver a Cursos
          </Link>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl mb-8"
          >
            <div className="relative h-96 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600">
              {curso.imagen_portada && (
                <img
                  src={curso.imagen_portada}
                  alt={curso.titulo}
                  className="w-full h-full object-cover mix-blend-overlay"
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30"></div>

              {/* Contenido */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNivelColor(curso.nivel)}`}>
                    {curso.nivel}
                  </span>
                  <span className="px-3 py-1 bg-purple-100/20 text-purple-100 rounded-full text-sm font-medium">
                    {curso.categoria}
                  </span>
                  {curso.es_destacado && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-200 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star size={14} />
                      Destacado
                    </span>
                  )}
                </div>

                <h1 className="text-4xl font-bold mb-4">{curso.titulo}</h1>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <span>{curso.estudiantes_inscritos} estudiantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>{Math.floor(curso.duracion_total_minutos / 60)}h {curso.duracion_total_minutos % 60}m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={18} className="text-yellow-400" />
                    <span>{curso.puntuacion_promedio.toFixed(1)} ({curso.calificaciones.length} reseñas)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} />
                    <span>{curso.modulos.length} módulos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del profesor y botón de inscripción */}
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    {curso.profesor.url_avatar ? (
                      <img
                        src={curso.profesor.url_avatar}
                        alt={curso.profesor.nombre_completo}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-slate-600 dark:text-slate-400">
                        {curso.profesor.nombre_completo.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {curso.profesor.nombre_completo}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">Profesor del curso</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {estaInscrito ? (
                    <div className="flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl font-medium">
                      <CheckCircle size={20} />
                      Inscrito
                    </div>
                  ) : (
                    <button
                      onClick={handleInscribirse}
                      disabled={isInscribiendose}
                      className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isInscribiendose ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Inscribiéndose...
                        </>
                      ) : (
                        <>
                          <Play size={20} />
                          Inscribirme
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Descripción */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Sobre este curso
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {curso.descripcion}
                </p>
              </motion.div>

              {/* Objetivos */}
              {curso.objetivos_curso && curso.objetivos_curso.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8"
                >
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Target size={24} />
                    Objetivos del curso
                  </h2>
                  <ul className="space-y-3">
                    {curso.objetivos_curso.map((objetivo, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400">{objetivo}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Módulos y temas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                  <BookMarked size={24} />
                  Contenido del curso
                </h2>

                {curso.modulos.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-400 text-center py-8">
                    Este curso aún no tiene módulos publicados.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {curso.modulos.map((modulo, moduloIndex) => (
                      <div key={modulo.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                              Módulo {modulo.orden_modulo}: {modulo.titulo}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                              {modulo.descripcion}
                            </p>
                          </div>
                          <div className="text-right text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <BookOpen size={16} />
                              <span>{modulo.numero_temas} temas</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock size={16} />
                              <span>{modulo.duracion_total_minutos} min</span>
                            </div>
                          </div>
                        </div>

                        {/* Temas */}
                        {modulo.temas && modulo.temas.length > 0 && (
                          <div className="space-y-3">
                            {modulo.temas.map((tema, temaIndex) => (
                              <div key={tema.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <span className="w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                    {tema.orden_tema}
                                  </span>
                                  {tema.es_obligatorio && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">Obligatorio</span>}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                    {tema.titulo}
                                  </h4>
                                  {tema.descripcion && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                      {tema.descripcion}
                                    </p>
                                  )}
                                </div>
                                {estaInscrito && (
                                  <Link
                                    href={`/lecciones/${tema.id}`}
                                    className="text-cyan-500 hover:text-cyan-600 text-sm font-medium flex items-center gap-1"
                                  >
                                    Ver lección
                                    <ChevronRight size={14} />
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Reseñas */}
              {curso.calificaciones && curso.calificaciones.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8"
                >
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <Star size={24} />
                    Reseñas de estudiantes
                  </h2>

                  <div className="space-y-6">
                    {curso.calificaciones.slice(0, 5).map((calif, index) => (
                      <div key={index} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 pb-6 last:pb-0">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            {calif.usuario.url_avatar ? (
                              <img
                                src={calif.usuario.url_avatar}
                                alt={calif.usuario.nombre_completo}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {calif.usuario.nombre_completo.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {calif.usuario.nombre_completo}
                              </span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={i < calif.calificacion ? "text-yellow-400 fill-current" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                            </div>
                            {calif.comentario && (
                              <p className="text-slate-600 dark:text-slate-400 mb-2">
                                {calif.comentario}
                              </p>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              {new Date(calif.fecha_calificacion).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Información del profesor */}
              {curso.profesor.biografia && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Sobre el profesor
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {curso.profesor.biografia}
                  </p>
                </motion.div>
              )}

              {/* Requisitos previos */}
              {curso.requisitos_previos && curso.requisitos_previos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Award size={20} />
                    Requisitos previos
                  </h3>
                  <ul className="space-y-2">
                    {curso.requisitos_previos.map((requisito, index) => (
                      <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <span className="text-cyan-500 mt-1">•</span>
                        <span>{requisito}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Palabras clave */}
              {curso.palabras_clave && curso.palabras_clave.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Etiquetas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {curso.palabras_clave.map((palabra, index) => (
                      <span key={index} className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm">
                        {palabra}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
