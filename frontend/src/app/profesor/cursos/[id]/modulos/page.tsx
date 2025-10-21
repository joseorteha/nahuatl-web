'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Edit, Trash2, BookOpen, GripVertical, Save, X
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';

interface Modulo {
  id: string;
  titulo: string;
  descripcion: string;
  orden_modulo: number;
  numero_temas: number;
  duracion_total_minutos: number;
  temas?: any[];
}

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
}

export default function GestionarModulosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cursoId = params.id as string;

  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    objetivos_modulo: [] as string[]
  });

  useEffect(() => {
    if (user && cursoId) {
      fetchCurso();
      fetchModulos();
    }
  }, [user, cursoId]);

  const fetchCurso = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/cursos/${cursoId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCurso(data.curso);
      }
    } catch (error) {
      console.error('Error al obtener curso:', error);
    }
  };

  const fetchModulos = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/cursos/${cursoId}/modulos`);
      
      if (response.ok) {
        const data = await response.json();
        setModulos(data.modulos);
      }
    } catch (error) {
      console.error('Error al obtener módulos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (modulo?: Modulo) => {
    if (modulo) {
      setEditingModulo(modulo);
      setFormData({
        titulo: modulo.titulo,
        descripcion: modulo.descripcion || '',
        objetivos_modulo: []
      });
    } else {
      setEditingModulo(null);
      setFormData({ titulo: '', descripcion: '', objetivos_modulo: [] });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingModulo(null);
    setFormData({ titulo: '', descripcion: '', objetivos_modulo: [] });
  };

  const handleSaveModulo = async () => {
    if (!formData.titulo.trim()) {
      alert('El título es requerido');
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') 
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
        : null;

      const url = editingModulo 
        ? `${API_URL}/api/modulos/${editingModulo.id}`
        : `${API_URL}/api/cursos/${cursoId}/modulos`;
      
      const method = editingModulo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchModulos();
        handleCloseModal();
      } else {
        alert('Error al guardar el módulo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const handleEliminarModulo = async (id: string) => {
    if (!confirm('¿Eliminar este módulo? Las lecciones se desvincularan pero no se eliminarán.')) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') 
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
        : null;

      const response = await fetch(`${API_URL}/api/modulos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setModulos(prev => prev.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Error al eliminar módulo:', error);
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

  return (
    <>
      <ConditionalHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
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
              {curso?.titulo}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gestiona los módulos y temas del curso
            </p>
          </div>

          {/* Botón Crear Módulo */}
          <div className="mb-6">
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Crear Módulo
            </button>
          </div>

          {/* Lista de Módulos */}
          {modulos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-12 text-center"
            >
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No hay módulos aún
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Crea el primer módulo para organizar las lecciones del curso
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
              >
                <Plus size={20} />
                Crear Primer Módulo
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {modulos.map((modulo, index) => (
                <motion.div
                  key={modulo.id}
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
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium">
                              Módulo {modulo.orden_modulo}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {modulo.titulo}
                          </h3>
                          {modulo.descripcion && (
                            <p className="text-slate-600 dark:text-slate-400 mt-2">
                              {modulo.descripcion}
                            </p>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(modulo)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleEliminarModulo(modulo.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Estadísticas */}
                      <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} />
                          <span>{modulo.numero_temas} temas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>⏱️ {modulo.duracion_total_minutos} min</span>
                        </div>
                      </div>

                      {/* Botones de Gestión */}
                      <div className="flex gap-3">
                        <Link
                          href={`/profesor/cursos/${cursoId}/modulos/${modulo.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          <BookOpen size={16} />
                          Gestionar Lecciones
                        </Link>
                        <Link
                          href={`/profesor/cursos/${cursoId}/modulos/${modulo.id}/temas`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
                        >
                          <BookOpen size={16} />
                          Gestionar Temas ({modulo.numero_temas})
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Módulo */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {editingModulo ? 'Editar Módulo' : 'Crear Módulo'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Título del Módulo *
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                      placeholder="Ej: Saludos y Presentaciones"
                    />
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
                      placeholder="Describe el contenido del módulo..."
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-6 flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveModulo}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    {editingModulo ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
