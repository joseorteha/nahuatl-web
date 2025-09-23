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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-slate-200/60 dark:border-slate-700/60"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Responsive */}
            <div className="p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Nuevo Tema</h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Inicia una nueva conversación</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Form - Responsive */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              {/* Categoría */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
                  Categoría del tema
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {categorias.map((categoria) => {
                    const Icon = categoria.icon;
                    const isSelected = formData.categoria === categoria.value;
                    
                    return (
                      <button
                        key={categoria.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, categoria: categoria.value }))}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : categoria.color}`} />
                          <div>
                            <p className={`font-medium text-xs sm:text-sm ${isSelected ? 'text-cyan-900 dark:text-cyan-100' : 'text-slate-900 dark:text-white'}`}>
                              {categoria.label}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título - Responsive */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
                  Título del tema *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Escribe un título claro y descriptivo..."
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all duration-200 text-sm sm:text-base ${
                    errors.titulo
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                  } text-slate-900 dark:text-white`}
                />
                {errors.titulo && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {errors.titulo}
                  </p>
                )}
              </div>

              {/* Descripción - Responsive */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Explica tu tema con más detalle. Sé específico para que otros puedan ayudarte mejor..."
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all duration-200 resize-none text-sm sm:text-base ${
                    errors.descripcion
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                  } text-slate-900 dark:text-white`}
                />
                {errors.descripcion && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {errors.descripcion}
                  </p>
                )}
                <p className="mt-1.5 sm:mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {formData.descripcion.length}/500 caracteres
                </p>
              </div>

              {/* Categoría seleccionada - Responsive */}
              {selectedCategoria && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <selectedCategoria.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedCategoria.color}`} />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">
                        Categoría seleccionada: {selectedCategoria.label}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
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

              {/* Botones - Responsive */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 dark:bg-cyan-500 text-white rounded-xl hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Creando...</span>
                      <span className="sm:hidden">Creando</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Crear Tema</span>
                      <span className="sm:hidden">Crear</span>
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
