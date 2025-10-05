'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, BookOpen, Users, Target, Award } from 'lucide-react';
import API_ENDPOINTS from '@/lib/config/api';

interface Logro {
  id: string;
  fecha_obtenido: string;
  notificado: boolean;
  logros: {
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    categoria: string;
    puntos_otorgados: number;
  };
}

interface LogrosDisponibles {
  [categoria: string]: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    categoria: string;
    condicion_tipo: string;
    condicion_valor: number;
    puntos_otorgados: number;
  }>;
}

interface LogrosTabProps {
  userId: string;
}

const getCategoriaIcon = (categoria: string) => {
  switch (categoria) {
    case 'contribucion':
      return <Target className="w-5 h-5" />;
    case 'conocimiento':
      return <BookOpen className="w-5 h-5" />;
    case 'comunidad':
      return <Users className="w-5 h-5" />;
    default:
      return <Award className="w-5 h-5" />;
  }
};

const getCategoriaColor = (categoria: string) => {
  switch (categoria) {
    case 'contribucion':
      return 'from-blue-500 to-cyan-500';
    case 'conocimiento':
      return 'from-green-500 to-emerald-500';
    case 'comunidad':
      return 'from-purple-500 to-pink-500';
    default:
      return 'from-gray-500 to-slate-500';
  }
};

export default function LogrosTab({ userId }: LogrosTabProps) {
  const [logrosObtenidos, setLogrosObtenidos] = useState<Logro[]>([]);
  const [logrosDisponibles, setLogrosDisponibles] = useState<LogrosDisponibles>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'obtenidos' | 'disponibles'>('obtenidos');

  const loadLogrosObtenidos = async () => {
    try {
      // Buscar token en sessionStorage primero, luego en localStorage
      let token = sessionStorage.getItem('auth_tokens') || localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      const authToken = parsedTokens?.accessToken;
      
      if (!authToken) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(API_ENDPOINTS.LOGROS.USUARIO(userId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar logros obtenidos');
      }

      const data = await response.json();
      setLogrosObtenidos(data.data || []);
    } catch (error) {
      console.error('Error loading logros obtenidos:', error);
      setError('Error al cargar logros obtenidos');
    }
  };

  const loadLogrosDisponibles = async () => {
    try {
      // Buscar token en sessionStorage primero, luego en localStorage
      let token = sessionStorage.getItem('auth_tokens') || localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      const authToken = parsedTokens?.accessToken;
      
      if (!authToken) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(API_ENDPOINTS.LOGROS.DISPONIBLES, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar logros disponibles');
      }

      const data = await response.json();
      setLogrosDisponibles(data.data || {});
    } catch (error) {
      console.error('Error loading logros disponibles:', error);
      setError('Error al cargar logros disponibles');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          loadLogrosObtenidos(),
          loadLogrosDisponibles()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con pestañas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Logros y Reconocimientos
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {logrosObtenidos.length} logros obtenidos
          </p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('obtenidos')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'obtenidos'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Obtenidos ({logrosObtenidos.length})
          </button>
          <button
            onClick={() => setActiveTab('disponibles')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'disponibles'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Disponibles
          </button>
        </div>
      </div>

      {/* Contenido de pestañas */}
      {activeTab === 'obtenidos' ? (
        <div className="space-y-4">
          {logrosObtenidos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {logrosObtenidos.map((logro, index) => (
                <motion.div
                  key={logro.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 rounded-xl p-4 border border-amber-200/60 dark:border-amber-700/60 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center text-2xl">
                      {logro.logros.icono}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                        {logro.logros.nombre}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        {logro.logros.descripcion}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          +{logro.logros.puntos_otorgados} puntos
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(logro.fecha_obtenido).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Aún no tienes logros
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                ¡Sigue contribuyendo para obtener tus primeros logros!
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(logrosDisponibles).map(([categoria, logros]) => (
            <div key={categoria} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${getCategoriaColor(categoria)} rounded-lg flex items-center justify-center text-white`}>
                  {getCategoriaIcon(categoria)}
                </div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                  {categoria === 'contribucion' ? 'Contribución' : 
                   categoria === 'conocimiento' ? 'Conocimiento' :
                   categoria === 'comunidad' ? 'Comunidad' : categoria}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {logros.map((logro, index) => {
                  const yaObtenido = logrosObtenidos.some(l => l.logros.id === logro.id);
                  
                  return (
                    <motion.div
                      key={logro.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-xl p-4 border transition-all duration-300 ${
                        yaObtenido
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border-green-200/60 dark:border-green-700/60'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          yaObtenido 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}>
                          {yaObtenido ? logro.icono : '🔒'}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg ${
                            yaObtenido 
                              ? 'text-green-800 dark:text-green-200' 
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {logro.nombre}
                          </h4>
                          <p className={`text-sm mb-2 ${
                            yaObtenido 
                              ? 'text-green-700 dark:text-green-300' 
                              : 'text-slate-500 dark:text-slate-500'
                          }`}>
                            {logro.descripcion}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${
                              yaObtenido 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-slate-400 dark:text-slate-500'
                            }`}>
                              +{logro.puntos_otorgados} puntos
                            </span>
                            {yaObtenido && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                ✓ Obtenido
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
