'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  AlertCircle, 
  CheckCircle,
  MessageCircle
} from 'lucide-react';

interface RespuestaFormProps {
  onSubmit: (contenido: string) => void;
  isSubmitting?: boolean;
  placeholder?: string;
  usuario?: {
    nombre_completo: string;
    username: string;
    url_avatar?: string;
  };
}

export default function RespuestaForm({ 
  onSubmit, 
  isSubmitting = false, 
  placeholder = "Escribe tu respuesta...",
  usuario
}: RespuestaFormProps) {
  const [contenido, setContenido] = useState('');
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!contenido.trim()) {
      setError('La respuesta no puede estar vacía');
      return false;
    }
    
    if (contenido.trim().length < 3) {
      setError('La respuesta debe tener al menos 3 caracteres');
      return false;
    }

    if (contenido.trim().length > 1000) {
      setError('La respuesta no puede exceder 1000 caracteres');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(contenido);
      setContenido('');
      setError('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContenido(e.target.value);
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      setError('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6"
    >
      {/* Header del formulario - Responsive */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Responder al tema</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Comparte tu opinión o ayuda a otros</p>
        </div>
      </div>

      {/* Información del usuario - Responsive */}
      {usuario && (
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 p-2.5 sm:p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
            {usuario.nombre_completo[0]}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm">
              {usuario.nombre_completo}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              @{usuario.username}
            </p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3 sm:mb-4">
          <textarea
            value={contenido}
            onChange={handleInputChange}
            placeholder={placeholder}
            rows={3}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all duration-200 resize-none text-sm sm:text-base ${
              error
                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
            } text-slate-900 dark:text-white`}
          />
          
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {error}
            </motion.p>
          )}
          
          <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {contenido.length}/1000 caracteres
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Respuesta pública</span>
              <span className="sm:hidden">Pública</span>
            </div>
          </div>
        </div>

        {/* Botón de envío - Responsive */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !contenido.trim()}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 dark:bg-cyan-500 text-white rounded-xl hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Enviando...</span>
                <span className="sm:hidden">Enviando</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Enviar Respuesta</span>
                <span className="sm:hidden">Enviar</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Consejos - Responsive */}
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-700/50">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <MessageCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-cyan-900 dark:text-cyan-100 mb-1">
              💡 Consejos para una buena respuesta:
            </p>
            <ul className="text-xs text-cyan-800 dark:text-cyan-200 space-y-0.5 sm:space-y-1">
              <li>• Sé respetuoso y constructivo</li>
              <li>• Proporciona información útil y específica</li>
              <li>• Si no estás seguro, pregunta antes de responder</li>
              <li>• Usa ejemplos cuando sea posible</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
