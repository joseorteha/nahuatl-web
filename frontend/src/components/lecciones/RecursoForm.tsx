'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Image, Music, Link as LinkIcon, Save } from 'lucide-react';

export interface RecursoExterno {
  id?: string;
  tipo_recurso: 'video_youtube' | 'imagen_drive' | 'audio_externo' | 'enlace_web';
  titulo: string;
  descripcion?: string;
  url: string;
  es_opcional: boolean;
  duracion_segundos?: number;
  orden_visualizacion?: number;
}

interface RecursoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recurso: RecursoExterno) => void;
  recurso?: RecursoExterno | null;
}

export default function RecursoForm({ isOpen, onClose, onSave, recurso }: RecursoFormProps) {
  const [formData, setFormData] = useState<RecursoExterno>({
    tipo_recurso: 'video_youtube',
    titulo: '',
    descripcion: '',
    url: '',
    es_opcional: false,
    duracion_segundos: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (recurso) {
      setFormData(recurso);
    } else {
      setFormData({
        tipo_recurso: 'video_youtube',
        titulo: '',
        descripcion: '',
        url: '',
        es_opcional: false,
        duracion_segundos: undefined
      });
    }
    setErrors({});
  }, [recurso, isOpen]);

  const handleChange = (field: keyof RecursoExterno, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'La URL es requerida';
    } else {
      // Validación básica de URL
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'URL no válida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video_youtube': return Youtube;
      case 'imagen_drive': return Image;
      case 'audio_externo': return Music;
      case 'enlace_web': return LinkIcon;
      default: return LinkIcon;
    }
  };

  const tiposRecurso = [
    { value: 'video_youtube', label: 'Video YouTube', icon: Youtube },
    { value: 'imagen_drive', label: 'Imagen Drive', icon: Image },
    { value: 'audio_externo', label: 'Audio Externo', icon: Music },
    { value: 'enlace_web', label: 'Enlace Web', icon: LinkIcon }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
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
                  {recurso ? '✏️ Editar Recurso' : '➕ Agregar Recurso'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Tipo de recurso */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Tipo de Recurso
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {tiposRecurso.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleChange('tipo_recurso', value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.tipo_recurso === value
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`h-6 w-6 mx-auto mb-2 ${
                          formData.tipo_recurso === value ? 'text-cyan-500' : 'text-slate-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          formData.tipo_recurso === value 
                            ? 'text-cyan-700 dark:text-cyan-300' 
                            : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => handleChange('titulo', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.titulo 
                        ? 'border-red-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500`}
                    placeholder="Ej: Tutorial de pronunciación"
                  />
                  {errors.titulo && (
                    <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
                  )}
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleChange('url', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.url 
                        ? 'border-red-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500`}
                    placeholder="https://..."
                  />
                  {errors.url && (
                    <p className="text-red-500 text-sm mt-1">{errors.url}</p>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={formData.descripcion || ''}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Breve descripción del recurso..."
                  />
                </div>

                {/* Duración (solo para video/audio) */}
                {(formData.tipo_recurso === 'video_youtube' || formData.tipo_recurso === 'audio_externo') && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Duración (segundos)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.duracion_segundos || ''}
                      onChange={(e) => handleChange('duracion_segundos', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                      placeholder="Ej: 300 (5 minutos)"
                    />
                  </div>
                )}

                {/* Es opcional */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="es_opcional"
                    checked={formData.es_opcional}
                    onChange={(e) => handleChange('es_opcional', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="es_opcional" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Este recurso es opcional
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {recurso ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
