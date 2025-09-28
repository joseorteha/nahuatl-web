'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, X, ExternalLink, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserSearchProps {
  className?: string;
}

export default function UserSearch({ className = '' }: UserSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/search?q=${encodeURIComponent(term)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
    setIsOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botón de búsqueda */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
      >
        <Search className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
        <span className="hidden sm:inline">Buscar Usuarios</span>
        <span className="sm:hidden">Buscar</span>
        <Users className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
      </motion.button>

      {/* Modal de búsqueda */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Buscar Usuarios
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                </button>
              </div>

              {/* Barra de búsqueda */}
              <div className="relative mb-4 sm:mb-6">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o username..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm sm:text-base transition-all duration-300"
                  autoFocus
                />
              </div>

              {/* Resultados */}
              <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-600 dark:text-slate-300 font-medium text-sm sm:text-base">Buscando usuarios...</span>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {searchResults.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/20 dark:hover:to-blue-900/20 rounded-xl cursor-pointer transition-all duration-300 group border border-slate-100 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-700"
                        onClick={() => handleUserClick(user.id)}
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg group-hover:scale-110 transition-transform duration-300">
                          {user.nombre_completo?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300 text-sm sm:text-base truncate">
                            {user.nombre_completo || 'Usuario'}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                            @{user.username || 'usuario'}
                          </div>
                          {user.verificado && (
                            <div className="inline-flex items-center gap-1 mt-1">
                              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Verificado</span>
                            </div>
                          )}
                        </div>
                        <div className="text-cyan-500 group-hover:text-cyan-600 transition-colors duration-300 flex-shrink-0">
                          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : searchTerm.length >= 2 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Users className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No se encontraron usuarios
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                      Intenta con un término de búsqueda diferente
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Search className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Busca usuarios
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                      Escribe al menos 2 caracteres para comenzar la búsqueda
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
