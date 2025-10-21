'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2 } from 'lucide-react';

export interface QuizPregunta {
  id?: string;
  pregunta: string;
  tipo_pregunta: 'multiple_choice' | 'verdadero_falso' | 'completar_texto';
  opciones: any;
  respuesta_correcta: string;
  explicacion?: string;
  puntos: number;
  orden_pregunta?: number;
}

interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pregunta: QuizPregunta) => void;
  pregunta?: QuizPregunta | null;
}

export default function QuizForm({ isOpen, onClose, onSave, pregunta }: QuizFormProps) {
  const [formData, setFormData] = useState<QuizPregunta>({
    pregunta: '',
    tipo_pregunta: 'multiple_choice',
    opciones: { A: '', B: '', C: '', D: '' },
    respuesta_correcta: '',
    explicacion: '',
    puntos: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pregunta) {
      setFormData(pregunta);
    } else {
      setFormData({
        pregunta: '',
        tipo_pregunta: 'multiple_choice',
        opciones: { A: '', B: '', C: '', D: '' },
        respuesta_correcta: '',
        explicacion: '',
        puntos: 1
      });
    }
    setErrors({});
  }, [pregunta, isOpen]);

  const handleChange = (field: keyof QuizPregunta, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOpcionChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      opciones: { ...prev.opciones, [key]: value }
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.pregunta.trim()) {
      newErrors.pregunta = 'La pregunta es requerida';
    }
    
    if (!formData.respuesta_correcta.trim()) {
      newErrors.respuesta_correcta = 'Debes indicar la respuesta correcta';
    }

    if (formData.tipo_pregunta === 'multiple_choice') {
      const opciones = Object.values(formData.opciones);
      if (opciones.some(op => !op || !op.trim())) {
        newErrors.opciones = 'Todas las opciones deben tener contenido';
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
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {pregunta ? '✏️ Editar Pregunta' : '➕ Agregar Pregunta'}
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
                {/* Tipo de pregunta */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Tipo de Pregunta
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'multiple_choice', label: 'Opción Múltiple' },
                      { value: 'verdadero_falso', label: 'Verdadero/Falso' },
                      { value: 'completar_texto', label: 'Completar Texto' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          handleChange('tipo_pregunta', value);
                          if (value === 'verdadero_falso') {
                            handleChange('opciones', { A: 'Verdadero', B: 'Falso' });
                          } else if (value === 'multiple_choice') {
                            handleChange('opciones', { A: '', B: '', C: '', D: '' });
                          }
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          formData.tipo_pregunta === value
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pregunta */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Pregunta *
                  </label>
                  <textarea
                    value={formData.pregunta}
                    onChange={(e) => handleChange('pregunta', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.pregunta 
                        ? 'border-red-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500`}
                    placeholder="Escribe tu pregunta aquí..."
                  />
                  {errors.pregunta && (
                    <p className="text-red-500 text-sm mt-1">{errors.pregunta}</p>
                  )}
                </div>

                {/* Opciones */}
                {formData.tipo_pregunta === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Opciones *
                    </label>
                    <div className="space-y-3">
                      {Object.keys(formData.opciones).map((key) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="w-8 h-8 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-bold">
                            {key}
                          </span>
                          <input
                            type="text"
                            value={formData.opciones[key]}
                            onChange={(e) => handleOpcionChange(key, e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                            placeholder={`Opción ${key}`}
                          />
                        </div>
                      ))}
                    </div>
                    {errors.opciones && (
                      <p className="text-red-500 text-sm mt-2">{errors.opciones}</p>
                    )}
                  </div>
                )}

                {formData.tipo_pregunta === 'verdadero_falso' && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Las opciones son automáticamente: <strong>A: Verdadero</strong> y <strong>B: Falso</strong>
                    </p>
                  </div>
                )}

                {/* Respuesta correcta */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Respuesta Correcta *
                  </label>
                  {formData.tipo_pregunta === 'multiple_choice' || formData.tipo_pregunta === 'verdadero_falso' ? (
                    <select
                      value={formData.respuesta_correcta}
                      onChange={(e) => handleChange('respuesta_correcta', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.respuesta_correcta 
                          ? 'border-red-500' 
                          : 'border-slate-300 dark:border-slate-600'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500`}
                    >
                      <option value="">Selecciona la respuesta correcta</option>
                      {Object.keys(formData.opciones).map(key => (
                        <option key={key} value={key}>
                          {key} - {formData.opciones[key] || '(vacío)'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.respuesta_correcta}
                      onChange={(e) => handleChange('respuesta_correcta', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.respuesta_correcta 
                          ? 'border-red-500' 
                          : 'border-slate-300 dark:border-slate-600'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500`}
                      placeholder="Escribe la respuesta correcta"
                    />
                  )}
                  {errors.respuesta_correcta && (
                    <p className="text-red-500 text-sm mt-1">{errors.respuesta_correcta}</p>
                  )}
                </div>

                {/* Explicación */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Explicación (opcional)
                  </label>
                  <textarea
                    value={formData.explicacion || ''}
                    onChange={(e) => handleChange('explicacion', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                    placeholder="Explica por qué esta es la respuesta correcta..."
                  />
                </div>

                {/* Puntos */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Puntos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.puntos}
                    onChange={(e) => handleChange('puntos', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                  />
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {pregunta ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
