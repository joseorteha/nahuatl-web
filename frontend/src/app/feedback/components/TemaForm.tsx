'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  X, 
  Tag, 
  MessageCircle, 
  AlertCircle, 
  CheckCircle,
  Lightbulb,
  HelpCircle,
  Bug,
  Star
} from 'lucide-react';

interface TemaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tema: {
    titulo: string;
    descripcion: string;
    categoria: string;
  }) => void;
  isSubmitting?: boolean;
}

export default function TemaForm({ isOpen, onClose, onSubmit, isSubmitting = false }: TemaFormProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'general'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categorias = [
    { value: 'suggestion', label: 'Sugerencia', icon: Lightbulb, color: 'text-blue-600' },
    { value: 'question', label: 'Pregunta', icon: HelpCircle, color: 'text-yellow-600' },
    { value: 'issue', label: 'Problema', icon: AlertCircle, color: 'text-red-600' },
    { value: 'bug_report', label: 'Reporte de Error', icon: Bug, color: 'text-purple-600' },
    { value: 'feature_request', label: 'Nueva Funcionalidad', icon: Star, color: 'text-green-600' },
    { value: 'general', label: 'General', icon: MessageCircle, color: 'text-gray-600' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.trim().length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      setFormData({ titulo: '', descripcion: '', categoria: 'general' });
      setErrors({});
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const selectedCategoria = categorias.find(cat => cat.value === formData.categoria);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Tema</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inicia una nueva conversación</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Categoría */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Categoría del tema
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categorias.map((categoria) => {
                    const Icon = categoria.icon;
                    const isSelected = formData.categoria === categoria.value;
                    
                    return (
                      <button
                        key={categoria.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, categoria: categoria.value }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : categoria.color}`} />
                          <div>
                            <p className={`font-medium text-sm ${isSelected ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-900 dark:text-white'}`}>
                              {categoria.label}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Título del tema *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Escribe un título claro y descriptivo..."
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 ${
                    errors.titulo
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-white`}
                />
                {errors.titulo && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.titulo}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Explica tu tema con más detalle. Sé específico para que otros puedan ayudarte mejor..."
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 resize-none ${
                    errors.descripcion
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-white`}
                />
                {errors.descripcion && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.descripcion}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {formData.descripcion.length}/500 caracteres
                </p>
              </div>

              {/* Categoría seleccionada */}
              {selectedCategoria && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <selectedCategoria.icon className={`w-5 h-5 ${selectedCategoria.color}`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Categoría seleccionada: {selectedCategoria.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.categoria === 'suggestion' && 'Comparte una idea para mejorar la plataforma'}
                        {formData.categoria === 'question' && 'Haz una pregunta sobre el náhuatl o la plataforma'}
                        {formData.categoria === 'issue' && 'Reporta un problema que has encontrado'}
                        {formData.categoria === 'bug_report' && 'Reporta un error técnico específico'}
                        {formData.categoria === 'feature_request' && 'Sugiere una nueva funcionalidad'}
                        {formData.categoria === 'general' && 'Tema general de conversación'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Crear Tema
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
