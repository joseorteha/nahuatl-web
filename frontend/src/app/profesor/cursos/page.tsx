'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  Star,
  BarChart3,
  ArrowLeft,
  MoreVertical, 
  CheckCircle, 
  Archive, 
  FileText
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_portada?: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  categoria: string;
  estado: 'borrador' | 'publicado' | 'archivado';
  duracion_total_minutos: number;
  estudiantes_inscritos: number;
  puntuacion_promedio: number;
  es_destacado: boolean;
  fecha_creacion: string;
  modulos: { count: number }[];
}

export default function MisCursosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      if (user.rol !== 'profesor' && user.rol !== 'admin') {
        router.push('/');
        return;
      }
      fetchCursos();
    }
  }, [user, loading, filtroEstado]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const fetchCursos = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') 
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
        : null;

      if (!token) return;

      const params = new URLSearchParams();
      if (filtroEstado !== 'todos') params.append('estado', filtroEstado);

      const response = await fetch(`${API_URL}/api/cursos/profesor/mis-cursos?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCursos(data.cursos);
      }
    } catch (error) {
      console.error('Error al obtener cursos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') 
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
        : null;

      const response = await fetch(`${API_URL}/api/cursos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCursos(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error al eliminar curso:', error);
    }
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') 
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
        : null;

      const response = await fetch(`${API_URL}/api/cursos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        // Actualizar el estado local del curso
        setCursos(prev => prev.map(curso => 
          curso.id === id ? { ...curso, estado: nuevoEstado as 'borrador' | 'publicado' | 'archivado' } : curso
        ));
      } else {
        alert('Error al cambiar el estado del curso');
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error de conexión');
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'publicado': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'borrador': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'archivado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading || isLoading) {
    return (
      <>
        <ConditionalHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <ConditionalHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link 
                href="/profesor"
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-500 mb-4"
              >
                <ArrowLeft size={20} />
                Volver al Panel
              </Link>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Mis Cursos
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Gestiona tus cursos y módulos
              </p>
            </div>
            <Link
              href="/profesor/cursos/crear"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Crear Curso
            </Link>
          </div>

          {/* Filtros */}
          <div className="flex gap-3 mb-6">
            {['todos', 'borrador', 'publicado', 'archivado'].map(estado => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroEstado === estado
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </button>
            ))}
          </div>

          {/* Lista de Cursos */}
          {cursos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-12 text-center"
            >
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No tienes cursos aún
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Crea tu primer curso para comenzar a organizar tus lecciones
              </p>
              <Link
                href="/profesor/cursos/crear"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
              >
                <Plus size={20} />
                Crear Primer Curso
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursos.map((curso, index) => (
                <motion.div
                  key={curso.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-slate-700/50"
                >
                  {/* Imagen */}
                  <div className="h-48 bg-gradient-to-br from-cyan-500 to-blue-500 relative">
                    {curso.imagen_portada ? (
                      <img 
                        src={curso.imagen_portada} 
                        alt={curso.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    {curso.es_destacado && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Star size={14} />
                        Destacado
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex-1">
                        {curso.titulo}
                      </h3>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {curso.descripcion}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelColor(curso.nivel)}`}>
                        {curso.nivel}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(curso.estado)}`}>
                        {curso.estado}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                        {curso.categoria}
                      </span>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Módulos</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {curso.modulos?.[0]?.count || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Estudiantes</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {curso.estudiantes_inscritos}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Rating</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
                          <Star size={16} className="text-yellow-500" />
                          {curso.puntuacion_promedio.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Link
                        href={`/profesor/cursos/${curso.id}/modulos`}
                        className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <BookOpen size={16} />
                        Módulos
                      </Link>
                      
                      {/* Dropdown de acciones */}
                      <div className="relative dropdown-container">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === curso.id ? null : curso.id)}
                          className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          title="Más acciones"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {dropdownOpen === curso.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                            {/* Cambiar Estado */}
                            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 px-2">Cambiar Estado</p>
                              <div className="space-y-1">
                                {curso.estado !== 'publicado' && (
                                  <button
                                    onClick={() => {
                                      handleCambiarEstado(curso.id, 'publicado');
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded"
                                  >
                                    <CheckCircle size={14} className="text-green-500" />
                                    Publicar
                                  </button>
                                )}
                                {curso.estado !== 'borrador' && (
                                  <button
                                    onClick={() => {
                                      handleCambiarEstado(curso.id, 'borrador');
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded"
                                  >
                                    <FileText size={14} className="text-gray-500" />
                                    Mover a Borrador
                                  </button>
                                )}
                                {curso.estado !== 'archivado' && (
                                  <button
                                    onClick={() => {
                                      handleCambiarEstado(curso.id, 'archivado');
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded"
                                  >
                                    <Archive size={14} className="text-orange-500" />
                                    Archivar
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {/* Otras acciones */}
                            <div className="p-2">
                              <Link
                                href={`/profesor/cursos/${curso.id}/editar`}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded"
                                onClick={() => setDropdownOpen(null)}
                              >
                                <Edit size={14} />
                                Editar Curso
                              </Link>
                              <button
                                onClick={() => {
                                  handleEliminar(curso.id);
                                  setDropdownOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              >
                                <Trash2 size={14} />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
