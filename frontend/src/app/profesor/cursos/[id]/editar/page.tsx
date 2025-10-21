'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, X, BookOpen, Users, Star, Clock, Globe
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_portada?: string;
  nivel: string;
  categoria: string;
  duracion_total_minutos: number;
  profesor_id: string;
  estado: string;
  estudiantes_inscritos: number;
  puntuacion_promedio: number;
  objetivos_curso: string[];
  requisitos_previos: string[];
  palabras_clave: string[];
  orden_visualizacion: number;
  es_destacado: boolean;
  es_gratuito: boolean;
  fecha_creacion: string;
  fecha_publicacion?: string;
  fecha_actualizacion: string;
}

export default function EditarCursoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cursoId = params.id as string;

  const [curso, setCurso] = useState<Curso | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imagen_portada: '',
    nivel: 'principiante',
    categoria: '',
    estado: 'borrador',
    objetivos_curso: [] as string[],
    requisitos_previos: [] as string[],
    palabras_clave: [] as string[],
    es_destacado: false,
    es_gratuito: true
  });

  const [nuevoObjetivo, setNuevoObjetivo] = useState('');
  const [nuevoRequisito, setNuevoRequisito] = useState('');
  const [nuevaPalabraClave, setNuevaPalabraClave] = useState('');

  useEffect(() => {
    if (user && cursoId) {
      fetchCurso();
    }
  }, [user, cursoId]);

  const fetchCurso = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/cursos/${cursoId}`);

      if (response.ok) {
        const data = await response.json();
        const cursoData = data.curso;

        setCurso(cursoData);
        setFormData({
          titulo: cursoData.titulo || '',
          descripcion: cursoData.descripcion || '',
          imagen_portada: cursoData.imagen_portada || '',
          nivel: cursoData.nivel || 'principiante',
          categoria: cursoData.categoria || '',
          estado: cursoData.estado || 'borrador',
          objetivos_curso: cursoData.objetivos_curso || [],
          requisitos_previos: cursoData.requisitos_previos || [],
          palabras_clave: cursoData.palabras_clave || [],
          es_destacado: cursoData.es_destacado || false,
          es_gratuito: cursoData.es_gratuito !== false
        });
      } else if (response.status === 404) {
        alert('Curso no encontrado');
        router.push('/profesor/cursos');
      } else {
        alert('Error al cargar el curso');
      }
    } catch (error) {
      console.error('Error al obtener curso:', error);
      alert('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!formData.titulo.trim() || !formData.categoria.trim()) {
      alert('Título y categoría son requeridos');
      return;
    }

    setIsSaving(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens')
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken
        : null;

      const response = await fetch(`${API_URL}/api/cursos/${cursoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/profesor/cursos');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al actualizar curso');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  const agregarObjetivo = () => {
    if (nuevoObjetivo.trim()) {
      setFormData(prev => ({
        ...prev,
        objetivos_curso: [...prev.objetivos_curso, nuevoObjetivo.trim()]
      }));
      setNuevoObjetivo('');
    }
  };

  const quitarObjetivo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objetivos_curso: prev.objetivos_curso.filter((_, i) => i !== index)
    }));
  };

  const agregarRequisito = () => {
    if (nuevoRequisito.trim()) {
      setFormData(prev => ({
        ...prev,
        requisitos_previos: [...prev.requisitos_previos, nuevoRequisito.trim()]
      }));
      setNuevoRequisito('');
    }
  };

  const quitarRequisito = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requisitos_previos: prev.requisitos_previos.filter((_, i) => i !== index)
    }));
  };

  const agregarPalabraClave = () => {
    if (nuevaPalabraClave.trim()) {
      setFormData(prev => ({
        ...prev,
        palabras_clave: [...prev.palabras_clave, nuevaPalabraClave.trim()]
      }));
      setNuevaPalabraClave('');
    }
  };

  const quitarPalabraClave = (index: number) => {
    setFormData(prev => ({
      ...prev,
      palabras_clave: prev.palabras_clave.filter((_, i) => i !== index)
    }));
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
              href="/profesor/cursos"
              className="text-cyan-500 hover:text-cyan-600"
            >
              Volver a Mis Cursos
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/profesor/cursos"
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-500 mb-4"
            >
              <ArrowLeft size={20} />
              Volver a Mis Cursos
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Editar Curso
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Modifica la información de tu curso
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-8"
          >
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              {/* Información Básica */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                  Información Básica
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Título del Curso *
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                      placeholder="Ej: Náhuatl Básico"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="Idioma">Idioma</option>
                      <option value="Cultura">Cultura</option>
                      <option value="Historia">Historia</option>
                      <option value="Arte">Arte</option>
                      <option value="Ciencia">Ciencia</option>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Describe el contenido del curso..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Nivel
                    </label>
                    <select
                      value={formData.nivel}
                      onChange={(e) => setFormData(prev => ({ ...prev, nivel: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="principiante">Principiante</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="borrador">Borrador</option>
                      <option value="publicado">Publicado</option>
                      <option value="archivado">Archivado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      URL de Imagen
                    </label>
                    <input
                      type="url"
                      value={formData.imagen_portada}
                      onChange={(e) => setFormData(prev => ({ ...prev, imagen_portada: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Objetivos del Curso */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                  Objetivos del Curso
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoObjetivo}
                    onChange={(e) => setNuevoObjetivo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarObjetivo())}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ej: Aprender vocabulario básico de náhuatl"
                  />
                  <button
                    type="button"
                    onClick={agregarObjetivo}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    Agregar
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.objetivos_curso.map((objetivo, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="flex-1 text-slate-900 dark:text-slate-100">{objetivo}</span>
                      <button
                        type="button"
                        onClick={() => quitarObjetivo(index)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requisitos Previos */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                  Requisitos Previos
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoRequisito}
                    onChange={(e) => setNuevoRequisito(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarRequisito())}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ej: Conocimientos básicos de español"
                  />
                  <button
                    type="button"
                    onClick={agregarRequisito}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    Agregar
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.requisitos_previos.map((requisito, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="flex-1 text-slate-900 dark:text-slate-100">{requisito}</span>
                      <button
                        type="button"
                        onClick={() => quitarRequisito(index)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Palabras Clave */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                  Palabras Clave
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevaPalabraClave}
                    onChange={(e) => setNuevaPalabraClave(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarPalabraClave())}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ej: náhuatl, idioma, cultura"
                  />
                  <button
                    type="button"
                    onClick={agregarPalabraClave}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.palabras_clave.map((palabra, index) => (
                    <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm">
                      {palabra}
                      <button
                        type="button"
                        onClick={() => quitarPalabraClave(index)}
                        className="hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Configuración */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                  Configuración
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.es_destacado}
                      onChange={(e) => setFormData(prev => ({ ...prev, es_destacado: e.target.checked }))}
                      className="w-4 h-4 text-cyan-500 bg-slate-100 border-slate-300 rounded focus:ring-cyan-500"
                    />
                    <span className="text-slate-900 dark:text-slate-100">
                      <Star className="inline w-4 h-4 mr-1" />
                      Marcar como curso destacado
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.es_gratuito}
                      onChange={(e) => setFormData(prev => ({ ...prev, es_gratuito: e.target.checked }))}
                      className="w-4 h-4 text-cyan-500 bg-slate-100 border-slate-300 rounded focus:ring-cyan-500"
                    />
                    <span className="text-slate-900 dark:text-slate-100">
                      <Globe className="inline w-4 h-4 mr-1" />
                      Curso gratuito
                    </span>
                  </label>
                </div>
              </div>

              {/* Estadísticas del Curso */}
              {curso && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                    Estadísticas del Curso
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-cyan-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Estudiantes</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {curso.estudiantes_inscritos || 0}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Puntuación</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {curso.puntuacion_promedio ? curso.puntuacion_promedio.toFixed(1) : '0.0'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Duración Total</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {curso.duracion_total_minutos || 0} min
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleGuardar}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>

                <Link
                  href="/profesor/cursos"
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
