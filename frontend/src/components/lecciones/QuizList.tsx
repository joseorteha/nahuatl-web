'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, HelpCircle, Award } from 'lucide-react';
import QuizForm, { QuizPregunta } from './QuizForm';

interface QuizListProps {
  preguntas: QuizPregunta[];
  onAdd: (pregunta: QuizPregunta) => void;
  onUpdate: (id: string, pregunta: QuizPregunta) => void;
  onDelete: (id: string) => void;
}

export default function QuizList({ preguntas, onAdd, onUpdate, onDelete }: QuizListProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingPregunta, setEditingPregunta] = useState<QuizPregunta | null>(null);

  const handleSave = (pregunta: QuizPregunta) => {
    if (editingPregunta && editingPregunta.id) {
      onUpdate(editingPregunta.id, pregunta);
    } else {
      onAdd({ ...pregunta, id: `temp-${Date.now()}` });
    }
    setEditingPregunta(null);
  };

  const handleEdit = (pregunta: QuizPregunta) => {
    setEditingPregunta(pregunta);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingPregunta(null);
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'multiple_choice': return 'Opción Múltiple';
      case 'verdadero_falso': return 'Verdadero/Falso';
      case 'completar_texto': return 'Completar Texto';
      default: return tipo;
    }
  };

  const totalPuntos = preguntas.reduce((sum, p) => sum + (p.puntos || 1), 0);

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            ❓ Preguntas de Quiz
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {preguntas.length} pregunta{preguntas.length !== 1 ? 's' : ''} • {totalPuntos} puntos totales
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPregunta(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg"
        >
          <Plus size={20} />
          Agregar
        </button>
      </div>

      {/* Lista */}
      {preguntas.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hay preguntas agregadas</p>
          <p className="text-sm mt-1">Haz click en "Agregar" para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {preguntas.map((pregunta, index) => (
            <motion.div
              key={pregunta.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Número */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  {index + 1}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {pregunta.pregunta}
                      </h4>
                      
                      {/* Opciones (solo para multiple choice) */}
                      {pregunta.tipo_pregunta === 'multiple_choice' && pregunta.opciones && (
                        <div className="mt-3 space-y-1">
                          {Object.entries(pregunta.opciones).map(([key, value]) => (
                            <div 
                              key={key} 
                              className={`text-sm flex items-center gap-2 ${
                                key === pregunta.respuesta_correcta 
                                  ? 'text-green-700 dark:text-green-400 font-medium' 
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                                key === pregunta.respuesta_correcta
                                  ? 'bg-green-100 dark:bg-green-900/30'
                                  : 'bg-slate-200 dark:bg-slate-600'
                              }`}>
                                {key}
                              </span>
                              {String(value)}
                              {key === pregunta.respuesta_correcta && ' ✓'}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Respuesta correcta (para otros tipos) */}
                      {pregunta.tipo_pregunta !== 'multiple_choice' && (
                        <div className="mt-2 text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Respuesta: </span>
                          <span className="text-green-700 dark:text-green-400 font-medium">
                            {pregunta.respuesta_correcta}
                          </span>
                        </div>
                      )}

                      {/* Explicación */}
                      {pregunta.explicacion && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
                          💡 {pregunta.explicacion}
                        </div>
                      )}

                      {/* Metadatos */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                          {getTipoLabel(pregunta.tipo_pregunta)}
                        </span>
                        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full flex items-center gap-1">
                          <Award size={12} />
                          {pregunta.puntos} punto{pregunta.puntos !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(pregunta)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => pregunta.id && onDelete(pregunta.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <QuizForm
        isOpen={showModal}
        onClose={handleClose}
        onSave={handleSave}
        pregunta={editingPregunta}
      />
    </div>
  );
}
