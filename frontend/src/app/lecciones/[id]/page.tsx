'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Clock, BookOpen, Target, Trophy, Star, HelpCircle, Globe, CheckCircle, Home, ChevronRight
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';
import LessonEnrollmentModal from '@/components/lecciones/LessonEnrollmentModal';
import ResourceViewer from '@/components/lecciones/ResourceViewer';
import QuizSection from '@/components/lecciones/QuizSection';
import MarkdownContent from '@/components/lecciones/MarkdownContent';

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  contenido_texto: string;
  contenido_nahuatl?: string;
  objetivos_aprendizaje: string[];
  palabras_clave: string[];
  duracion_estimada: number;
  recursos_externos?: RecursoExterno[];
  quiz_preguntas?: QuizPregunta[];
}

interface RecursoExterno {
  id: string;
  tipo_recurso: 'video_youtube' | 'imagen_drive' | 'audio_externo' | 'enlace_web' | 'pdf_drive';
  titulo: string;
  descripcion?: string;
  url: string;
  es_opcional: boolean;
}

interface QuizPregunta {
  id: string;
  pregunta: string;
  tipo_pregunta: string;
  opciones: any;
  respuesta_correcta: string;
  explicacion?: string;
}

export default function LeccionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const leccionId = params.id as string;

  // 🔄 Parámetros de navegación contextual (REGLA 3 del diagrama)
  const from = searchParams.get('from'); // 'modulo' | 'catalogo'
  const moduloId = searchParams.get('moduloId');
  const cursoId = searchParams.get('cursoId');

  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompletado, setQuizCompletado] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  // 🔄 Función de navegación contextual (REGLA 3)
  const handleSalir = () => {
    if (from === 'modulo' && moduloId && cursoId) {
      // Volver al módulo desde donde vino
      router.push(`/cursos/${cursoId}/modulos/${moduloId}`);
    } else {
      // Volver al catálogo público
      router.push('/lecciones');
    }
  };

  // 📊 Registrar progreso con contexto (REGLA 2)
  const registrarProgreso = async (estado: string, puntuacion_quiz?: number, total_preguntas?: number) => {
    if (!user) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken : null;

      const progresoData: Record<string, any> = {
        contexto_acceso: from || 'catalogo', // REGLA 3: Siempre registrar contexto
        modulo_id: moduloId,
        curso_id: cursoId,
        estado_leccion: estado
      };

      if (puntuacion_quiz !== undefined) {
        progresoData.puntuacion_quiz = puntuacion_quiz;
      }

      if (total_preguntas !== undefined) {
        progresoData.total_preguntas_quiz = total_preguntas;
      }

      const response = await fetch(`${API_URL}/api/lecciones/${leccionId}/progreso`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progresoData)
      });

      if (!response.ok) {
        console.error('Error registrando progreso:', await response.text());
      }
    } catch (error) {
      console.error('Error registrando progreso:', error);
    }
  };

  useEffect(() => {
    if (leccionId && user) {
      checkEnrollment();
    } else if (leccionId && !user) {
      setCheckingEnrollment(false);
      setShowEnrollModal(true);
    }
  }, [leccionId, user]);

  useEffect(() => {
    if (isEnrolled && leccionId) {
      fetchLeccion();
    }
  }, [isEnrolled, leccionId]);

  const checkEnrollment = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken : null;
      
      const response = await fetch(`${API_URL}/api/progreso/verificar/${leccionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsEnrolled(data.inscrito);
        if (!data.inscrito) {
          setShowEnrollModal(true);
          // Cargar información básica de la lección para mostrar en el modal
          await fetchLeccionBasica();
        }
      }
    } catch (error) {
      console.error('Error verificando inscripción:', error);
      setIsLoading(false);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken : null;
      
      const response = await fetch(`${API_URL}/api/progreso/inscribirse/${leccionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al inscribirse');
      }

      const data = await response.json();
      setIsEnrolled(true);
      setShowEnrollModal(false);

      // 📊 Registrar inicio de lección con contexto (REGLA 2)
      await registrarProgreso('en_progreso');
    } catch (error) {
      console.error('Error en inscripción:', error);
      throw error;
    }
  };

  const handleQuizComplete = async (puntuacionFinal: number, totalPreguntas: number) => {
    try {
      // 📊 Registrar completado con contexto (REGLA 2)
      await registrarProgreso('completada', puntuacionFinal, totalPreguntas);
      setQuizCompletado(true);
    } catch (error) {
      console.error('Error actualizando progreso:', error);
    }
  };

  const fetchLeccionBasica = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = user ? localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken : null : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/lecciones/${leccionId}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Error al cargar lección');
      }
      
      const data = await response.json();
      console.log('📖 Información básica de lección recibida:', data);
      setLeccion(data.leccion);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error:', error);
      setIsLoading(false);
    }
  };

  const fetchLeccion = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = user ? localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken : null : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/lecciones/${leccionId}`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ No autorizado para ver esta lección');
          alert('No tienes permisos para ver esta lección');
        } else {
          throw new Error('Error al cargar lección');
        }
        return;
      }
      
      const data = await response.json();
      console.log('📖 Lección completa recibida:', data);
      setLeccion(data.leccion);
    } catch (error) {
      console.error('❌ Error:', error);
      router.push('/lecciones');
    } finally {
      setIsLoading(false);
    }
  };


  // Mostrar spinner solo si está verificando inscripción
  if (checkingEnrollment) {
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

  // Si no está inscrito, mostrar modal de inscripción con la info básica de la lección
  if (!isEnrolled && showEnrollModal && leccion) {
    return (
      <>
        <ConditionalHeader />
        <LessonEnrollmentModal
          isOpen={showEnrollModal}
          onClose={() => handleSalir()} // 🔄 Usar navegación contextual
          onEnroll={handleEnroll}
          leccion={leccion}
          isEnrolled={isEnrolled}
        />
      </>
    );
  }

  // Si está cargando la lección completa después de inscribirse
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

  if (!leccion) {
    return (
      <>
        <ConditionalHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Lección no encontrada</h2>
            <button onClick={handleSalir} className="text-cyan-600 hover:underline">
              {from === 'modulo' ? 'Volver al módulo' : 'Volver a lecciones'}
            </button>
          </div>
        </div>
      </>
    );
  }

  const tieneQuiz = leccion.quiz_preguntas && leccion.quiz_preguntas.length > 0;
  const tieneRecursos = leccion.recursos_externos && leccion.recursos_externos.length > 0;

  return (
    <>
      <ConditionalHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header con navegación contextual */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            {/* Breadcrumbs según contexto (REGLA 3) */}
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
              <button
                onClick={() => router.push('/')}
                className="hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                Inicio
              </button>
              <ChevronRight className="w-4 h-4" />
              
              {from === 'modulo' && cursoId ? (
                <>
                  <button
                    onClick={() => router.push('/cursos')}
                    className="hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Mis Cursos
                  </button>
                  <ChevronRight className="w-4 h-4" />
                  <button
                    onClick={() => router.push(`/cursos/${cursoId}`)}
                    className="hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Curso
                  </button>
                  <ChevronRight className="w-4 h-4" />
                  <button
                    onClick={() => router.push(`/cursos/${cursoId}/modulos/${moduloId}`)}
                    className="hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Módulo
                  </button>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-slate-900 dark:text-slate-100 font-medium">Lección</span>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/lecciones')}
                    className="hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Lecciones
                  </button>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-slate-900 dark:text-slate-100 font-medium">Lección</span>
                </>
              )}
            </div>

            {/* Botón de navegación contextual */}
            <button
              onClick={handleSalir}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              {from === 'modulo' ? 'Volver al módulo' : 'Volver a lecciones'}
            </button>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-slate-700/50">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium">
                      {leccion.categoria}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                      {leccion.nivel}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    {leccion.titulo}
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    {leccion.descripcion}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="h-5 w-5" />
                    <span>{leccion.duracion_estimada} min</span>
                  </div>
                  {tieneQuiz && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <HelpCircle className="h-5 w-5" />
                      <span>{leccion.quiz_preguntas!.length} preguntas</span>
                    </div>
                  )}
                  {tieneRecursos && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Globe className="h-5 w-5" />
                      <span>{leccion.recursos_externos!.length} recursos</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contenido Principal */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-slate-700/50 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-cyan-500" />
              Contenido de la Lección
            </h2>

            <MarkdownContent content={leccion.contenido_texto} />

            {leccion.contenido_nahuatl && (
              <div className="mt-8 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border-l-4 border-cyan-500">
                <h3 className="text-xl font-semibold text-cyan-900 dark:text-cyan-100 mb-4 flex items-center gap-2">
                  🗣️ En Náhuatl
                </h3>
                <MarkdownContent 
                  content={leccion.contenido_nahuatl} 
                  className="text-cyan-800 dark:text-cyan-200"
                />
              </div>
            )}

            {/* Objetivos */}
            {leccion.objetivos_aprendizaje && leccion.objetivos_aprendizaje.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Objetivos de Aprendizaje
                </h3>
                <ul className="space-y-3">
                  {leccion.objetivos_aprendizaje.map((objetivo: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{objetivo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Palabras Clave */}
            {leccion.palabras_clave && leccion.palabras_clave.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  🔑 Palabras Clave
                </h3>
                <div className="flex flex-wrap gap-2">
                  {leccion.palabras_clave.map((palabra: string, idx: number) => (
                    <span key={idx} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      {palabra}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Recursos Externos */}
          {tieneRecursos && (
            <ResourceViewer recursos={leccion.recursos_externos!} />
          )}

          {/* Quiz */}
          {tieneQuiz && !quizCompletado && (
            <QuizSection 
              preguntas={leccion.quiz_preguntas!} 
              onComplete={handleQuizComplete}
            />
          )}

        </div>
      </div>
    </>
  );
}
