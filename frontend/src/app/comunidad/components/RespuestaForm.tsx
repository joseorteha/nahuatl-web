'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader } from 'lucide-react';

interface RespuestaFormProps {
  onSubmit: (contenido: string) => Promise<void>;
  isSubmitting?: boolean;
  placeholder?: string;
}

export default function RespuestaForm({ 
  onSubmit, 
  isSubmitting = false,
  placeholder = "Escribe tu respuesta..." 
}: RespuestaFormProps) {
  const [contenido, setContenido] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contenido.trim() || isSubmitting) return;

    try {
      await onSubmit(contenido.trim());
      setContenido('');
    } catch (error) {
      console.error('Error submitting respuesta:', error);
    }
  };

  const isDisabled = isSubmitting || !contenido.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/60 p-4 sm:p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Agregar Respuesta
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            rows={4}
            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl resize-none transition-all duration-200 text-sm sm:text-base ${
              isFocused 
                ? 'border-cyan-500 ring-2 ring-cyan-500/20' 
                : 'border-gray-200 dark:border-gray-600'
            } focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white`}
            disabled={isSubmitting}
            maxLength={1000}
          />
          
          {/* Contador de caracteres */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {contenido.length}/1000
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <p>Comparte tu perspectiva de manera respetuosa y constructiva.</p>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base ${
              isDisabled
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-slate-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Enviando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar Respuesta</span>
                <span className="sm:hidden">Enviar</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Indicador visual cuando está enfocado */}
      <motion.div
        initial={false}
        animate={{ 
          height: isFocused ? 'auto' : 0,
          opacity: isFocused ? 1 : 0 
        }}
        className="overflow-hidden"
      >
        <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700/50">
          <div className="flex items-start gap-2 text-xs sm:text-sm text-cyan-700 dark:text-cyan-300">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium mb-1">Consejos para una buena respuesta:</p>
              <ul className="space-y-1 text-cyan-600 dark:text-cyan-400">
                <li>• Sé específico y proporciona ejemplos</li>
                <li>• Mantén un tono respetuoso y constructivo</li>
                <li>• Aporta valor a la conversación</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}