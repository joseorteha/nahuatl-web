'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  titulo: string;
  descripcion: string;
  imagen_portada: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  categoria: string;
  objetivos_curso: string[];
  requisitos_previos: string[];
  palabras_clave: string[];
  es_destacado: boolean;
  es_gratuito: boolean;
}

export default function CrearCursoPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descripcion: '',
    imagen_portada: '',
    nivel: 'principiante',
    categoria: '',
    objetivos_curso: [],
    requisitos_previos: [],
    palabras_clave: [],
    es_destacado: false,
    es_gratuito: true
  });

  const [newObjetivo, setNewObjetivo] = useState('');
  const [newRequisito, setNewRequisito] = useState('');
  const [newPalabra, setNewPalabra] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addObjetivo = () => {
    if (newObjetivo.trim()) {
      setFormData(prev => ({ ...prev, objetivos_curso: [...prev.objetivos_curso, newObjetivo.trim()] }));
      setNewObjetivo('');
    }
  };

  const removeObjetivo = (index: number) => {
    setFormData(prev => ({ ...prev, objetivos_curso: prev.objetivos_curso.filter((_, i) => i !== index) }));
  };

  const addRequisito = () => {
    if (newRequisito.trim()) {
      setFormData(prev => ({ ...prev, requisitos_previos: [...prev.requisitos_previos, newRequisito.trim()] }));
      setNewRequisito('');
    }
  };

  const removeRequisito = (index: number) => {
    setFormData(prev => ({ ...prev, requisitos_previos: prev.requisitos_previos.filter((_, i) => i !== index) }));
  };

  const addPalabra = () => {
    if (newPalabra.trim()) {
      setFormData(prev => ({ ...prev, palabras_clave: [...prev.palabras_clave, newPalabra.trim()] }));
      setNewPalabra('');
    }
  };

  const removePalabra = (index: number) => {
    setFormData(prev => ({ ...prev, palabras_clave: prev.palabras_clave.filter((_, i) => i !== index) }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.titulo.trim()) newErrors.titulo = 'El título es requerido';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.categoria.trim()) newErrors.categoria = 'La categoría es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') 
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
        : null;

      const response = await fetch(`${API_URL}/api/cursos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/profesor/cursos/${data.curso.id}/modulos`);
      } else {
        alert('Error al crear el curso');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Crear Nuevo Curso
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Completa la información básica del curso
            </p>
          </div>

          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-slate-700/50"
          >
            <div className="space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Título del Curso *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.titulo ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500`}
                  placeholder="Ej: Náhuatl Básico"
                />
                {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.descripcion ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500`}
                  placeholder="Describe de qué trata el curso..."
                />
                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
              </div>

              {/* Nivel y Categoría */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nivel
                  </label>
                  <select
                    value={formData.nivel}
                    onChange={(e) => handleChange('nivel', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Categoría *
                  </label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => handleChange('categoria', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.categoria ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500`}
                    placeholder="Ej: Idioma, Cultura, Historia"
                  />
                  {errors.categoria && <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>}
                </div>
              </div>

              {/* Imagen de Portada */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  URL de Imagen de Portada (opcional)
                </label>
                <input
                  type="url"
                  value={formData.imagen_portada}
                  onChange={(e) => handleChange('imagen_portada', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                  placeholder="https://..."
                />
              </div>

              {/* Objetivos del Curso */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Objetivos del Curso
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.objetivos_curso.map((objetivo, index) => (
                    <span key={index} className="px-3 py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-full text-sm flex items-center gap-2">
                      {objetivo}
                      <button onClick={() => removeObjetivo(index)} className="text-red-500 hover:text-red-700">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newObjetivo}
                    onChange={(e) => setNewObjetivo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addObjetivo()}
                    placeholder="Nuevo objetivo..."
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                  <button onClick={addObjetivo} className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Requisitos Previos */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Requisitos Previos
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.requisitos_previos.map((requisito, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-2">
                      {requisito}
                      <button onClick={() => removeRequisito(index)} className="text-red-500 hover:text-red-700">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequisito}
                    onChange={(e) => setNewRequisito(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRequisito()}
                    placeholder="Nuevo requisito..."
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                  <button onClick={addRequisito} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Palabras Clave */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Palabras Clave
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.palabras_clave.map((palabra, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-2">
                      {palabra}
                      <button onClick={() => removePalabra(index)} className="text-red-500 hover:text-red-700">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPalabra}
                    onChange={(e) => setNewPalabra(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPalabra()}
                    placeholder="Nueva palabra clave..."
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                  <button onClick={addPalabra} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Opciones */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="es_destacado"
                    checked={formData.es_destacado}
                    onChange={(e) => handleChange('es_destacado', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="es_destacado" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Marcar como curso destacado
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="es_gratuito"
                    checked={formData.es_gratuito}
                    onChange={(e) => handleChange('es_gratuito', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="es_gratuito" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Curso gratuito
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6">
                <Link
                  href="/profesor/cursos"
                  className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium text-center"
                >
                  Cancelar
                </Link>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={20} />
                  {isSubmitting ? 'Creando...' : 'Crear Curso'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
