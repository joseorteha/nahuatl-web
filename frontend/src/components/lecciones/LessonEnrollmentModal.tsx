'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, Target, CheckCircle, AlertCircle } from 'lucide-react';

interface LessonEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: () => Promise<void>;
  leccion: {
    titulo: string;
    descripcion: string;
    duracion_estimada: number;
    nivel: string;
    objetivos_aprendizaje?: string[];
  };
  isEnrolled: boolean;
}

export default function LessonEnrollmentModal({
  isOpen,
  onClose,
  onEnroll,
  leccion,
  isEnrolled
}: LessonEnrollmentModalProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    setError(null);
    
    try {
      await onEnroll();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al inscribirse en la lección');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-500 p-6 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-8 w-8 text-white" />
                  <h2 className="text-2xl font-bold text-white">
                    {isEnrolled ? 'Ya estás inscrito' : 'Inscríbete a esta lección'}
                  </h2>
                </div>
                <p className="text-cyan-50">
                  {isEnrolled 
                    ? 'Continúa con tu aprendizaje' 
                    : 'Comienza tu viaje de aprendizaje del náhuatl'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Lesson Info */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {leccion.titulo}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {leccion.descripcion}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Duración</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {leccion.duracion_estimada} min
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Nivel</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
                    {leccion.nivel}
                  </p>
                </div>
              </div>
            </div>

            {/* Objetivos */}
            {leccion.objetivos_aprendizaje && leccion.objetivos_aprendizaje.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-500" />
                  Lo que aprenderás:
                </h4>
                <ul className="space-y-2">
                  {leccion.objetivos_aprendizaje.map((objetivo, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{objetivo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Info Box */}
            {!isEnrolled && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Nota:</strong> Al inscribirte, tu profesor podrá ver tu progreso y puntuación. 
                  Podrás acceder a todos los recursos y realizar el quiz de evaluación.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 p-6 rounded-b-2xl border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-600"
              >
                Cancelar
              </button>
              {!isEnrolled && (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isEnrolling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Inscribiendo...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Inscribirme Ahora
                    </>
                  )}
                </button>
              )}
              {isEnrolled && (
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Continuar Lección
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
