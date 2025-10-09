'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CreateTemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTemaModal({ isOpen, onClose, onSuccess }: CreateTemaModalProps) {
  const { user, apiCall } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'suggestion'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        titulo: '',
        descripcion: '',
        categoria: 'suggestion'
      });
      setNotification(null);
    }
  }, [isOpen]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showNotification('error', 'Debes iniciar sesión para crear un tema');
      return;
    }

    if (!formData.titulo.trim()) {
      showNotification('error', 'El título es obligatorio');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiCall('/api/temas', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showNotification('success', 'Tema creado exitosamente');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el tema');
      }
    } catch (error) {
      console.error('Error creating tema:', error);
      showNotification('error', 'Error al crear el tema');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categorias = [
    { value: 'suggestion', label: 'Sugerencia', description: 'Propuesta de mejora o nueva idea' },
    { value: 'question', label: 'Pregunta', description: 'Consulta o duda sobre el náhuatl' },
    { value: 'issue', label: 'Problema', description: 'Reportar un problema o dificultad' },
    { value: 'bug_report', label: 'Error', description: 'Reportar un error técnico' },
    { value: 'feature_request', label: 'Nueva Funcionalidad', description: 'Solicitar una nueva característica' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="title-sm" style={{ color: 'var(--color-text)' }}>
              Crear Nuevo Tema
            </h2>
            <button
              onClick={onClose}
              className="button-text p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-6 mt-4"
              >
                <div className={`rounded-lg p-4 flex items-center gap-3 ${
                  notification.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                }`}>
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    notification.type === 'success' 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {notification.message}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Título */}
            <div>
              <label className="label-modern">
                Título del Tema *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Escribe un título claro y descriptivo..."
                className="input-modern"
                maxLength={200}
                disabled={isSubmitting}
                required
              />
              <div className="mt-1 text-xs text-right" style={{ color: 'var(--color-text-muted)' }}>
                {formData.titulo.length}/200
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="label-modern">
                Descripción (Opcional)
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Proporciona más detalles sobre tu tema..."
                rows={4}
                className="input-modern resize-none"
                maxLength={1000}
                disabled={isSubmitting}
              />
              <div className="mt-1 text-xs text-right" style={{ color: 'var(--color-text-muted)' }}>
                {formData.descripcion.length}/1000
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="label-modern">
                Categoría *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categorias.map((categoria) => (
                  <label
                    key={categoria.value}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.categoria === categoria.value
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="categoria"
                      value={categoria.value}
                      checked={formData.categoria === categoria.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {categoria.label}
                      </span>
                      {formData.categoria === categoria.value && (
                        <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {categoria.description}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* Guías */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
                Consejos para un buen tema:
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Usa un título claro y específico</li>
                <li>• Proporciona contexto en la descripción</li>
                <li>• Elige la categoría más apropiada</li>
                <li>• Sé respetuoso y constructivo</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="button-secondary flex-1 py-3 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.titulo.trim()}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSubmitting || !formData.titulo.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : 'button-primary shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Crear Tema
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}