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
        className="group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
      >
        <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
        <span>Buscar Usuarios</span>
        <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Buscar Usuarios
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Barra de búsqueda */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o username..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-all duration-300"
                  autoFocus
                />
              </div>

              {/* Resultados */}
              <div className="max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 dark:text-gray-300 font-medium">Buscando usuarios...</span>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 rounded-xl cursor-pointer transition-all duration-300 group border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700"
                        onClick={() => handleUserClick(user.id)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                          {user.nombre_completo?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 text-lg">
                            {user.nombre_completo || 'Usuario'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username || 'usuario'}
                          </div>
                          {user.verificado && (
                            <div className="inline-flex items-center gap-1 mt-1">
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Verificado</span>
                            </div>
                          )}
                        </div>
                        <div className="text-purple-500 group-hover:text-purple-600 transition-colors duration-300">
                          <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : searchTerm.length >= 2 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No se encontraron usuarios
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">
                      Intenta con un término de búsqueda diferente
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Busca usuarios
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">
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
