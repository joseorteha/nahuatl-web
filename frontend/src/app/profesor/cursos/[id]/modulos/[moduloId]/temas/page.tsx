'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, BookOpen, Clock, GripVertical, X, Check, Search
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string;
  duracion_estimada: number;
  nivel: string;
  categoria: string;
  orden_tema?: number;
  es_obligatorio?: boolean;
}

interface Modulo {
  id: string;
  titulo: string;
  descripcion: string;
  orden_modulo: number;
  curso_id: string;
}

export default function GestionarTemasPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cursoId = params.id as string;
  const moduloId = params.moduloId as string;

  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [temasActuales, setTemasActuales] = useState<Leccion[]>([]);
  const [leccionesDisponibles, setLeccionesDisponibles] = useState<Leccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && moduloId) {
      fetchModulo();
      fetchTemasActuales();
      fetchLeccionesDisponibles();
    }
  }, [user, moduloId]);

  const fetchModulo = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/modulos/${moduloId}`);
      
      if (response.ok) {
        const data = await response.json();
        setModulo(data.modulo);
      }
    } catch (error) {
      console.error('Error al obtener módulo:', error);
    }
  };

  const fetchTemasActuales = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/modulos/${moduloId}`);
      
      if (response.ok) {
        const data = await response.json();
        setTemasActuales(data.modulo.temas || []);
      }
    } catch (error) {
      console.error('Error al obtener temas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeccionesDisponibles = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') 
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
        : null;

      const response = await fetch(`${API_URL}/api/lecciones/profesor/mis-lecciones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filtrar lecciones que NO están en este módulo (pueden estar en otros módulos o ser independientes)
        const leccionesDisponibles = data.lecciones.filter((l: Leccion) => 
          !temasActuales.some(t => t.id === l.id)
        );
        setLeccionesDisponibles(leccionesDisponibles);
      }
    } catch (error) {
      console.error('Error al obtener lecciones:', error);
    }
  };

  const handleAgregarTema = async (leccionId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') 
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
        : null;

      const response = await fetch(`${API_URL}/api/modulos/${moduloId}/temas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leccion_id: leccionId })
      });

      if (response.ok) {
        fetchTemasActuales();
        fetchLeccionesDisponibles();
        setShowModal(false);
      } else {
        alert('Error al agregar tema');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const handleQuitarTema = async (leccionId: string) => {
    if (!confirm('¿Quitar este tema del módulo? La lección no se eliminará.')) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') 
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
        : null;

      const response = await fetch(`${API_URL}/api/modulos/${moduloId}/temas/${leccionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchTemasActuales();
        fetchLeccionesDisponibles();
      }
    } catch (error) {
      console.error('Error al quitar tema:', error);
    }
  };

  const leccionesFiltradas = leccionesDisponibles.filter(leccion =>
    leccion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leccion.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <>
      <ConditionalHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={`/profesor/cursos/${cursoId}/modulos`}
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-500 mb-4"
            >
              <ArrowLeft size={20} />
              Volver a Módulos
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              {modulo?.titulo}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gestiona los temas (lecciones) de este módulo
            </p>
          </div>

          {/* Botón Agregar Tema */}
          <div className="mb-6">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Agregar Tema
            </button>
          </div>

          {/* Lista de Temas Actuales */}
          {temasActuales.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-12 text-center"
            >
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No hay temas en este módulo
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Agrega lecciones existentes como temas de este módulo
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
              >
                <Plus size={20} />
                Agregar Primer Tema
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {temasActuales.map((tema, index) => (
                <motion.div
                  key={tema.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50"
                >
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="cursor-move text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 pt-1">
                      <GripVertical size={20} />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium">
                              Tema {tema.orden_tema || index + 1}
                            </span>
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">
                              {tema.categoria}
                            </span>
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                              {tema.nivel}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            {tema.titulo}
                          </h3>
                          {tema.descripcion && (
                            <p className="text-slate-600 dark:text-slate-400 mb-3">
                              {tema.descripcion}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Clock size={16} />
                            <span>{tema.duracion_estimada} min</span>
                          </div>
                        </div>

                        {/* Botón Quitar */}
                        <button
                          onClick={() => handleQuitarTema(tema.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Quitar del módulo"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Agregar Tema */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Agregar Tema al Módulo
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar lecciones..."
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {leccionesFiltradas.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600 dark:text-slate-400">
                        No hay lecciones disponibles para agregar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leccionesFiltradas.map((leccion) => (
                        <div
                          key={leccion.id}
                          className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">
                                  {leccion.categoria}
                                </span>
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                                  {leccion.nivel}
                                </span>
                              </div>
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                {leccion.titulo}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Clock size={14} />
                                <span>{leccion.duracion_estimada} min</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAgregarTema(leccion.id)}
                              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2"
                            >
                              <Check size={16} />
                              Agregar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
