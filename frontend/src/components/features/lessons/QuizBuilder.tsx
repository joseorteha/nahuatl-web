'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle,
  Plus,
  X,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  Award
} from 'lucide-react';

interface PreguntaQuiz {
  id: string;
  pregunta: string;
  tipo: 'multiple_choice' | 'verdadero_falso' | 'completar_texto';
  opciones: string[];
  respuesta_correcta: string;
  explicacion?: string;
  orden: number;
  puntos?: number;
}

interface QuizData {
  preguntas: PreguntaQuiz[];
  duracion_minutos?: number;
  puntuacion_minima?: number;
  instrucciones?: string;
}

interface QuizBuilderProps {
  initialData?: QuizData;
  onSave: (quizData: QuizData) => void;
  onCancel?: () => void;
  readonly?: boolean;
  className?: string;
}

export default function QuizBuilder({ 
  initialData, 
  onSave, 
  onCancel, 
  readonly = false, 
  className = '' 
}: QuizBuilderProps) {
  const [quizData, setQuizData] = useState<QuizData>(initialData || {
    preguntas: [],
    duracion_minutos: 10,
    puntuacion_minima: 70,
    instrucciones: 'Responde todas las preguntas para completar el quiz.'
  });

  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<PreguntaQuiz>>({
    tipo: 'multiple_choice',
    pregunta: '',
    opciones: ['', '', '', ''],
    respuesta_correcta: '',
    explicacion: '',
    puntos: 1
  });
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const tiposPreguntas = [
    { value: 'multiple_choice', label: 'Opción múltiple', icon: '📝' },
    { value: 'verdadero_falso', label: 'Verdadero/Falso', icon: '✅' },
    { value: 'completar_texto', label: 'Completar texto', icon: '📋' }
  ];

  const addQuestion = () => {
    if (!newQuestion.pregunta || !newQuestion.respuesta_correcta) return;

    const pregunta: PreguntaQuiz = {
      id: Date.now().toString(),
      pregunta: newQuestion.pregunta,
      tipo: newQuestion.tipo as any,
      opciones: newQuestion.tipo === 'multiple_choice' ? 
        newQuestion.opciones?.filter(o => o.trim()) || [] : 
        newQuestion.tipo === 'verdadero_falso' ? 
        ['Verdadero', 'Falso'] : [],
      respuesta_correcta: newQuestion.respuesta_correcta,
      explicacion: newQuestion.explicacion || '',
      orden: quizData.preguntas.length + 1,
      puntos: newQuestion.puntos || 1
    };

    setQuizData(prev => ({
      ...prev,
      preguntas: [...prev.preguntas, pregunta]
    }));

    // Reset form
    setNewQuestion({
      tipo: 'multiple_choice',
      pregunta: '',
      opciones: ['', '', '', ''],
      respuesta_correcta: '',
      explicacion: '',
      puntos: 1
    });
    setShowNewQuestionForm(false);
  };

  const updateQuestion = (id: string, updates: Partial<PreguntaQuiz>) => {
    setQuizData(prev => ({
      ...prev,
      preguntas: prev.preguntas.map(p => 
        p.id === id ? { ...p, ...updates } : p
      )
    }));
  };

  const deleteQuestion = (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) return;
    
    setQuizData(prev => ({
      ...prev,
      preguntas: prev.preguntas.filter(p => p.id !== id)
    }));
  };

  const reorderQuestions = (fromIndex: number, toIndex: number) => {
    const newPreguntas = [...quizData.preguntas];
    const [removed] = newPreguntas.splice(fromIndex, 1);
    newPreguntas.splice(toIndex, 0, removed);
    
    // Actualizar el orden
    const updatedPreguntas = newPreguntas.map((p, index) => ({
      ...p,
      orden: index + 1
    }));

    setQuizData(prev => ({
      ...prev,
      preguntas: updatedPreguntas
    }));
  };

  const getTipoIcon = (tipo: string) => {
    const tipoData = tiposPreguntas.find(t => t.value === tipo);
    return tipoData?.icon || '❓';
  };

  const renderQuestionEditor = (pregunta: PreguntaQuiz) => {
    const isEditing = editingQuestion === pregunta.id;
    
    if (!isEditing) {
      return (
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getTipoIcon(pregunta.tipo)}</span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                  {tiposPreguntas.find(t => t.value === pregunta.tipo)?.label}
                </span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                  {pregunta.puntos} pt{pregunta.puntos !== 1 ? 's' : ''}
                </span>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {pregunta.pregunta}
              </h4>
              
              {pregunta.tipo === 'multiple_choice' && (
                <div className="space-y-1 mb-3">
                  {pregunta.opciones.map((opcion, index) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded-lg text-sm ${
                        opcion === pregunta.respuesta_correcta 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 font-medium' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}. {opcion}
                      {opcion === pregunta.respuesta_correcta && (
                        <Check className="inline-block w-4 h-4 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {pregunta.tipo === 'verdadero_falso' && (
                <div className="mb-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Respuesta correcta: <strong className="text-green-600 dark:text-green-400">{pregunta.respuesta_correcta}</strong>
                  </span>
                </div>
              )}

              {pregunta.tipo === 'completar_texto' && (
                <div className="mb-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Respuesta: <strong className="text-green-600 dark:text-green-400">{pregunta.respuesta_correcta}</strong>
                  </span>
                </div>
              )}

              {pregunta.explicacion && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Explicación:</strong> {pregunta.explicacion}
                  </p>
                </div>
              )}
            </div>
            
            {!readonly && (
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setEditingQuestion(pregunta.id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteQuestion(pregunta.id)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Editor mode
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Pregunta
            </label>
            <textarea
              value={pregunta.pregunta}
              onChange={(e) => updateQuestion(pregunta.id, { pregunta: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {pregunta.tipo === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Opciones
              </label>
              <div className="space-y-2">
                {pregunta.opciones.map((opcion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <input
                      type="text"
                      value={opcion}
                      onChange={(e) => {
                        const newOpciones = [...pregunta.opciones];
                        newOpciones[index] = e.target.value;
                        updateQuestion(pregunta.id, { opciones: newOpciones });
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={() => updateQuestion(pregunta.id, { respuesta_correcta: opcion })}
                      className={`p-2 rounded-lg transition-colors ${
                        opcion === pregunta.respuesta_correcta
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                      }`}
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pregunta.tipo === 'verdadero_falso' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Respuesta correcta
              </label>
              <div className="flex gap-2">
                {['Verdadero', 'Falso'].map((opcion) => (
                  <button
                    key={opcion}
                    onClick={() => updateQuestion(pregunta.id, { respuesta_correcta: opcion })}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pregunta.respuesta_correcta === opcion
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                    }`}
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {pregunta.tipo === 'completar_texto' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Respuesta correcta
              </label>
              <input
                type="text"
                value={pregunta.respuesta_correcta}
                onChange={(e) => updateQuestion(pregunta.id, { respuesta_correcta: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Explicación (opcional)
            </label>
            <textarea
              value={pregunta.explicacion}
              onChange={(e) => updateQuestion(pregunta.id, { explicacion: e.target.value })}
              rows={2}
              placeholder="Explica por qué esta es la respuesta correcta..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingQuestion(null)}
              className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setEditingQuestion(null)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const totalPuntos = quizData.preguntas.reduce((sum, p) => sum + (p.puntos || 1), 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header del quiz */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Quiz de Evaluación</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {quizData.preguntas.length} pregunta{quizData.preguntas.length !== 1 ? 's' : ''} • {totalPuntos} punto{totalPuntos !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        {/* Configuración del quiz */}
        {!readonly && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Duración (minutos)
              </label>
              <input
                type="number"
                value={quizData.duracion_minutos}
                onChange={(e) => setQuizData(prev => ({ ...prev, duracion_minutos: parseInt(e.target.value) || 10 }))}
                min="1"
                max="60"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Puntuación mínima (%)
              </label>
              <input
                type="number"
                value={quizData.puntuacion_minima}
                onChange={(e) => setQuizData(prev => ({ ...prev, puntuacion_minima: parseInt(e.target.value) || 70 }))}
                min="0"
                max="100"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-end">
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalPuntos}</div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Puntos totales</div>
              </div>
            </div>
          </div>
        )}

        {!readonly && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Instrucciones
            </label>
            <textarea
              value={quizData.instrucciones}
              onChange={(e) => setQuizData(prev => ({ ...prev, instrucciones: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        )}
      </div>

      {/* Lista de preguntas */}
      <div className="space-y-4">
        <AnimatePresence>
          {quizData.preguntas.map((pregunta, index) => (
            <motion.div
              key={pregunta.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200/50 dark:border-slate-600/50">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    Pregunta {index + 1}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({tiposPreguntas.find(t => t.value === pregunta.tipo)?.label})
                  </span>
                </div>
                
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === pregunta.id ? null : pregunta.id)}
                  className="p-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  {expandedQuestion === pregunta.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              
              <AnimatePresence>
                {(expandedQuestion === pregunta.id || editingQuestion === pregunta.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderQuestionEditor(pregunta)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Agregar nueva pregunta */}
      {!readonly && (
        <div>
          {!showNewQuestionForm ? (
            <button
              onClick={() => setShowNewQuestionForm(true)}
              className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Agregar nueva pregunta
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50"
            >
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Nueva Pregunta</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tipo de pregunta
                  </label>
                  <select
                    value={newQuestion.tipo}
                    onChange={(e) => setNewQuestion(prev => ({ 
                      ...prev, 
                      tipo: e.target.value as any,
                      opciones: e.target.value === 'multiple_choice' ? ['', '', '', ''] : []
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {tiposPreguntas.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.icon} {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pregunta
                  </label>
                  <textarea
                    value={newQuestion.pregunta}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, pregunta: e.target.value }))}
                    rows={3}
                    placeholder="Escribe tu pregunta aquí..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {newQuestion.tipo === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Opciones
                    </label>
                    <div className="space-y-2">
                      {newQuestion.opciones?.map((opcion, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <input
                            type="text"
                            value={opcion}
                            onChange={(e) => {
                              const newOpciones = [...(newQuestion.opciones || [])];
                              newOpciones[index] = e.target.value;
                              setNewQuestion(prev => ({ ...prev, opciones: newOpciones }));
                            }}
                            placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                          <button
                            onClick={() => setNewQuestion(prev => ({ ...prev, respuesta_correcta: opcion }))}
                            className={`p-2 rounded-lg transition-colors ${
                              opcion === newQuestion.respuesta_correcta
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                            }`}
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {newQuestion.tipo === 'verdadero_falso' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Respuesta correcta
                    </label>
                    <div className="flex gap-2">
                      {['Verdadero', 'Falso'].map((opcion) => (
                        <button
                          key={opcion}
                          onClick={() => setNewQuestion(prev => ({ ...prev, respuesta_correcta: opcion }))}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            newQuestion.respuesta_correcta === opcion
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                          }`}
                        >
                          {opcion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {newQuestion.tipo === 'completar_texto' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Respuesta correcta
                    </label>
                    <input
                      type="text"
                      value={newQuestion.respuesta_correcta}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, respuesta_correcta: e.target.value }))}
                      placeholder="Respuesta correcta..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Explicación (opcional)
                  </label>
                  <textarea
                    value={newQuestion.explicacion}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, explicacion: e.target.value }))}
                    rows={2}
                    placeholder="Explica por qué esta es la respuesta correcta..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowNewQuestionForm(false);
                      setNewQuestion({
                        tipo: 'multiple_choice',
                        pregunta: '',
                        opciones: ['', '', '', ''],
                        respuesta_correcta: '',
                        explicacion: '',
                        puntos: 1
                      });
                    }}
                    className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={addQuestion}
                    disabled={!newQuestion.pregunta || !newQuestion.respuesta_correcta}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Agregar Pregunta
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Botones de acción */}
      {!readonly && (
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={() => onSave(quizData)}
            disabled={quizData.preguntas.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar Quiz
          </button>
        </div>
      )}

      {/* Resumen del quiz */}
      {quizData.preguntas.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-purple-900 dark:text-purple-100">Resumen del Quiz</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-purple-700 dark:text-purple-300">{quizData.preguntas.length}</div>
              <div className="text-purple-600 dark:text-purple-400">Preguntas</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-700 dark:text-purple-300">{totalPuntos}</div>
              <div className="text-purple-600 dark:text-purple-400">Puntos totales</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-700 dark:text-purple-300">{quizData.duracion_minutos}</div>
              <div className="text-purple-600 dark:text-purple-400">Minutos</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-700 dark:text-purple-300">{quizData.puntuacion_minima}%</div>
              <div className="text-purple-600 dark:text-purple-400">Para aprobar</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

