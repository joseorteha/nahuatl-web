'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Trophy, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface QuizPregunta {
  id: string;
  pregunta: string;
  tipo_pregunta: string;
  opciones: any;
  respuesta_correcta: string;
  explicacion?: string;
}

interface QuizSectionProps {
  preguntas: QuizPregunta[];
  onComplete: (puntuacion: number, totalPreguntas: number) => void;
}

export default function QuizSection({ preguntas, onComplete }: QuizSectionProps) {
  const [currentPregunta, setCurrentPregunta] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string>('');
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [quizCompletado, setQuizCompletado] = useState(false);

  const getOpcionesArray = (opciones: any): string[] => {
    if (!opciones) return [];
    if (Array.isArray(opciones)) return opciones;
    if (typeof opciones === 'object') return Object.values(opciones);
    return [];
  };

  // Obtener la clave de una opción (para objetos tipo {A: "valor", B: "valor"})
  const getOpcionKey = (opcion: string, opciones: any): string => {
    if (!opciones || Array.isArray(opciones)) return opcion;
    if (typeof opciones === 'object') {
      const entry = Object.entries(opciones).find(([_, value]) => value === opcion);
      return entry ? entry[0] : opcion;
    }
    return opcion;
  };

  const handleRespuestaSubmit = () => {
    if (!respuestaSeleccionada) return;

    const pregunta = preguntas[currentPregunta];
    // Obtener la clave de la opción seleccionada
    const respuestaKey = getOpcionKey(respuestaSeleccionada, pregunta.opciones);
    const esCorrecta = respuestaKey === pregunta.respuesta_correcta;

    if (esCorrecta) {
      setPuntuacion(prev => prev + 1);
    }

    setMostrarResultado(true);
  };

  const handleSiguientePregunta = () => {
    if (currentPregunta < preguntas.length - 1) {
      setCurrentPregunta(prev => prev + 1);
      setRespuestaSeleccionada('');
      setMostrarResultado(false);
    } else {
      setQuizCompletado(true);
      onComplete(puntuacion + (respuestaSeleccionada === preguntas[currentPregunta].respuesta_correcta ? 1 : 0), preguntas.length);
    }
  };

  if (preguntas.length === 0) return null;

  const preguntaActual = preguntas[currentPregunta];
  const opcionesArray = getOpcionesArray(preguntaActual.opciones);
  const progreso = ((currentPregunta + 1) / preguntas.length) * 100;

  if (quizCompletado) {
    const puntuacionFinal = puntuacion + (respuestaSeleccionada === preguntaActual.respuesta_correcta ? 1 : 0);
    const porcentaje = Math.round((puntuacionFinal / preguntas.length) * 100);
    const aprobado = porcentaje >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-r ${aprobado ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-red-500'} rounded-2xl p-8 shadow-lg text-center text-white`}
      >
        <Trophy className="h-16 w-16 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">
          {aprobado ? '¡Felicidades! Quiz Completado' : 'Quiz Completado'}
        </h2>
        <p className="text-xl mb-6">
          Puntuación: {puntuacionFinal}/{preguntas.length} ({porcentaje}%)
        </p>
        {aprobado ? (
          <p className="text-lg opacity-90">
            ¡Excelente trabajo! Has demostrado un gran dominio del tema.
          </p>
        ) : (
          <p className="text-lg opacity-90">
            Sigue practicando. Puedes volver a intentarlo para mejorar tu puntuación.
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-slate-700/50 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-cyan-500" />
          Quiz de Evaluación
        </h2>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Trophy className="h-5 w-5" />
          <span>{puntuacion}/{preguntas.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
          <span>Pregunta {currentPregunta + 1} de {preguntas.length}</span>
          <span>{Math.round(progreso)}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
        {preguntaActual.pregunta}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {opcionesArray.map((opcion: string, index: number) => {
          const isSelected = respuestaSeleccionada === opcion;
          // Comparar usando la clave de la opción
          const opcionKey = getOpcionKey(opcion, preguntaActual.opciones);
          const isCorrect = opcionKey === preguntaActual.respuesta_correcta;
          const showResult = mostrarResultado;
          
          // Determinar clases basadas en el estado
          let borderClass = 'border-slate-200 dark:border-slate-700';
          let bgClass = 'bg-white dark:bg-slate-800';
          let hoverClass = 'hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50';
          
          if (!showResult && isSelected) {
            // Seleccionado pero aún no verificado - azul neutro
            borderClass = 'border-blue-400 dark:border-blue-500';
            bgClass = 'bg-blue-50 dark:bg-blue-900/20';
            hoverClass = '';
          } else if (showResult) {
            if (isCorrect) {
              // Respuesta correcta - verde
              borderClass = 'border-green-500';
              bgClass = 'bg-green-50 dark:bg-green-900/20';
              hoverClass = '';
            } else if (isSelected && !isCorrect) {
              // Respuesta incorrecta seleccionada - rojo
              borderClass = 'border-red-500';
              bgClass = 'bg-red-50 dark:bg-red-900/20';
              hoverClass = '';
            } else {
              // Otras opciones después de verificar - gris neutro
              borderClass = 'border-slate-200 dark:border-slate-700';
              bgClass = 'bg-slate-50 dark:bg-slate-700/30';
              hoverClass = '';
            }
          }
          
          return (
            <button
              key={index}
              onClick={() => !showResult && setRespuestaSeleccionada(opcion)}
              disabled={showResult}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${borderClass} ${bgClass} ${hoverClass} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                {/* Indicador visual solo después de verificar */}
                {showResult && (
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : isSelected ? (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <div className="h-5 w-5" />
                    )}
                  </div>
                )}
                
                {/* Indicador de selección antes de verificar */}
                {!showResult && isSelected && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                )}
                
                <span className={`flex-1 ${
                  showResult && isCorrect 
                    ? 'text-green-900 dark:text-green-100 font-medium' 
                    : showResult && isSelected && !isCorrect
                    ? 'text-red-900 dark:text-red-100'
                    : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {opcion}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {mostrarResultado && preguntaActual.explicacion && (
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
          <p className="text-slate-700 dark:text-slate-300">
            <strong>Explicación:</strong> {preguntaActual.explicacion}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        {!mostrarResultado ? (
          <button
            onClick={handleRespuestaSubmit}
            disabled={!respuestaSeleccionada}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 transition-all"
          >
            Verificar Respuesta
          </button>
        ) : (
          <button
            onClick={handleSiguientePregunta}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2"
          >
            {currentPregunta < preguntas.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Quiz'}
            <ArrowLeft className="rotate-180 h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
