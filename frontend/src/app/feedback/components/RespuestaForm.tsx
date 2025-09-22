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
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/60 p-6"
    >
      {/* Header del formulario */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Responder al tema</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Comparte tu opinión o ayuda a otros</p>
        </div>
      </div>

      {/* Información del usuario */}
      {usuario && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {usuario.nombre_completo[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {usuario.nombre_completo}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              @{usuario.username}
            </p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={contenido}
            onChange={handleInputChange}
            placeholder={placeholder}
            rows={4}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 resize-none ${
              error
                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
            } text-gray-900 dark:text-white`}
          />
          
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.p>
          )}
          
          <div className="mt-2 flex justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {contenido.length}/1000 caracteres
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-3 h-3" />
              <span>Respuesta pública</span>
            </div>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !contenido.trim()}
            className="px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Respuesta
              </>
            )}
          </button>
        </div>
      </form>

      {/* Consejos */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700/50">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <MessageCircle className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              💡 Consejos para una buena respuesta:
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
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
