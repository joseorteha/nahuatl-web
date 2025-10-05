'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award, 
  TrendingUp, 
  Calendar, 
  Clock,
  Gift,
  Crown,
  Sparkles,
  ArrowUp,
  Flame,
  BarChart3,
  History,
  CheckCircle,
  MessageCircle,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RecompensasUsuario {
  puntos_totales: number;
  nivel: 'principiante' | 'contribuidor' | 'experto' | 'maestro' | 'leyenda';
  experiencia: number;
  contribuciones_aprobadas: number;
  likes_recibidos: number;
  racha_dias: number;
  total_contribuciones: number;
}

interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: string;
  fecha_obtenido: string;
}

interface HistorialPunto {
  puntos_ganados: number;
  motivo: string;
  descripcion: string;
  fecha_creacion: string;
}

const nivelesConfig = {
  principiante: { 
    nombre: 'Principiante', 
    color: 'text-emerald-500', 
    bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
    border: 'border-emerald-200 dark:border-emerald-700/50',
    icon: '🌱',
    gradient: 'from-emerald-400 to-emerald-600',
    puntos_necesarios: 0,
    descripcion: '¡Bienvenido! Comienza tu viaje de aprendizaje'
  },
  contribuidor: { 
    nombre: 'Contribuidor', 
    color: 'text-blue-500', 
    bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    border: 'border-blue-200 dark:border-blue-700/50',
    icon: '📚',
    gradient: 'from-blue-400 to-blue-600',
    puntos_necesarios: 100,
    descripcion: 'Estás contribuyendo activamente a la comunidad'
  },
  experto: { 
    nombre: 'Experto', 
    color: 'text-purple-500', 
    bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    border: 'border-purple-200 dark:border-purple-700/50',
    icon: '🎓',
    gradient: 'from-purple-400 to-purple-600',
    puntos_necesarios: 500,
    descripcion: 'Dominas el idioma náhuatl con excelencia'
  },
  maestro: { 
    nombre: 'Maestro', 
    color: 'text-orange-500', 
    bg: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    border: 'border-orange-200 dark:border-orange-700/50',
    icon: '👑',
    gradient: 'from-orange-400 to-orange-600',
    puntos_necesarios: 1000,
    descripcion: 'Eres un maestro del náhuatl, guía a otros'
  },
  leyenda: { 
    nombre: 'Leyenda', 
    color: 'text-red-500', 
    bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
    border: 'border-red-200 dark:border-red-700/50',
    icon: '🏆',
    gradient: 'from-red-400 to-red-600',
    puntos_necesarios: 2500,
    descripcion: '¡Eres una leyenda viviente del náhuatl!'
  }
};

export default function Recompensas({ userId }: { userId: string }) {
  const [recompensas, setRecompensas] = useState<RecompensasUsuario | null>(null);
  const [logros, setLogros] = useState<Logro[]>([]);
  const [historial, setHistorial] = useState<HistorialPunto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumen' | 'logros' | 'historial'>('resumen');
  
  type TabKey = 'resumen' | 'logros' | 'historial';
  
  const { } = useAuth();

  const obtenerRecompensas = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      // Obtener datos de contribuciones (mismo endpoint que el perfil)
      const contribucionesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contribuciones/stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (contribucionesResponse.ok) {
        const contribucionesData = await contribucionesResponse.json();
        console.log('Datos de contribuciones (Recompensas):', contribucionesData);
        
        // Mapear datos del sistema de contribuciones al formato esperado
        setRecompensas({
          puntos_totales: contribucionesData.totalPoints || 0,
          nivel: contribucionesData.level || 'principiante',
          experiencia: contribucionesData.experience || 0,
          contribuciones_aprobadas: contribucionesData.approvedContributions || 0,
          likes_recibidos: 0, // Ya no usamos likes del sistema viejo
          racha_dias: 0, // Por ahora no implementado
          total_contribuciones: contribucionesData.totalContributions || 0 // Agregar total de contribuciones
        });
      }

      // Obtener historial de contribuciones (usar el mismo sistema)
      const historialResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contributions/historial/${userId}`, {
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (historialResponse.ok) {
        const historialData = await historialResponse.json();
        console.log('Historial de contribuciones obtenido:', historialData);
        setHistorial(historialData.historial || []);
      } else {
        console.log('No hay historial de contribuciones, usando array vacío');
        setHistorial([]);
      }
      
      // Por ahora, logros vacíos hasta implementar el sistema de logros del nuevo sistema
      setLogros([]);
      
    } catch (error) {
      console.error('Error al obtener recompensas:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    obtenerRecompensas();
  }, [obtenerRecompensas]);

  const calcularProgreso = () => {
    if (!recompensas) return { porcentaje: 0, siguienteNivel: 'contribuidor', puntosNecesarios: 100 };
    
    const puntosActuales = recompensas.puntos_totales;
    
    // Determinar el nivel real basado en los puntos actuales
    let nivelReal: keyof typeof nivelesConfig = 'principiante';
    let siguienteNivel: keyof typeof nivelesConfig | null = 'contribuidor';
    
    if (puntosActuales >= 2500) {
      nivelReal = 'leyenda';
      siguienteNivel = null;
    } else if (puntosActuales >= 1000) {
      nivelReal = 'maestro';
      siguienteNivel = 'leyenda';
    } else if (puntosActuales >= 500) {
      nivelReal = 'experto';
      siguienteNivel = 'maestro';
    } else if (puntosActuales >= 100) {
      nivelReal = 'contribuidor';
      siguienteNivel = 'experto';
    }
    
    // Si ya es el nivel máximo, mostrar 100%
    if (siguienteNivel === null) {
      return { porcentaje: 100, siguienteNivel: null, puntosNecesarios: 0 };
    }
    
    const puntosNivelActual = nivelesConfig[nivelReal as keyof typeof nivelesConfig].puntos_necesarios;
    const puntosSiguienteNivel = nivelesConfig[siguienteNivel as keyof typeof nivelesConfig].puntos_necesarios;
    
    // Calcular el progreso real del usuario
    // Ejemplo: Si tiene 342 puntos, está entre principiante (0) y contribuidor (100)
    // Pero si el sistema dice que es "experto", hay un error en el backend
    const progresoEnNivel = puntosActuales - puntosNivelActual;
    const puntosNecesariosParaSiguiente = puntosSiguienteNivel - puntosNivelActual;
    const porcentaje = (progresoEnNivel / puntosNecesariosParaSiguiente) * 100;
    
    return {
      porcentaje: Math.min(Math.max(porcentaje, 0), 100),
      siguienteNivel,
      puntosNecesarios: Math.max(puntosSiguienteNivel - puntosActuales, 0),
      nivelReal // Agregamos el nivel real calculado
    };
  };

  const getMotivoIcon = (motivo: string) => {
    const motivoLower = motivo.toLowerCase();
    if (motivoLower.includes('feedback')) return <MessageCircle className="w-5 h-5" />;
    if (motivoLower.includes('like')) return <Heart className="w-5 h-5" />;
    if (motivoLower.includes('contribucion')) return <Target className="w-5 h-5" />;
    if (motivoLower.includes('respuesta')) return <Zap className="w-5 h-5" />;
    if (motivoLower.includes('compartir')) return <TrendingUp className="w-5 h-5" />;
    return <Gift className="w-5 h-5" />;
  };

  const getMotivoColor = (motivo: string) => {
    const motivoLower = motivo.toLowerCase();
    if (motivoLower.includes('feedback')) return 'text-blue-500 bg-blue-50 dark:bg-blue-900/30';
    if (motivoLower.includes('like')) return 'text-red-500 bg-red-50 dark:bg-red-900/30';
    if (motivoLower.includes('contribucion')) return 'text-green-500 bg-green-50 dark:bg-green-900/30';
    if (motivoLower.includes('respuesta')) return 'text-purple-500 bg-purple-50 dark:bg-purple-900/30';
    if (motivoLower.includes('compartir')) return 'text-orange-500 bg-orange-50 dark:bg-orange-900/30';
    return 'text-gray-500 bg-gray-50 dark:bg-gray-700/50';
  };

  if (loading) {
    return (
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-slate-200/60 dark:border-slate-700/60">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-4 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-8 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!recompensas) {
    return (
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 text-center border border-slate-200/60 dark:border-slate-700/60">
        <div className="text-slate-500 dark:text-slate-400">
          <Gift className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-sm sm:text-base">No se pudieron cargar las recompensas</p>
        </div>
      </div>
    );
  }

  const nivelConfig = nivelesConfig[recompensas.nivel];
  const progreso = calcularProgreso();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60"
    >
      {/* Header con nivel y puntos */}
      <div className={`bg-gradient-to-r ${nivelConfig.bg} ${nivelConfig.border} border-b-2 p-4 sm:p-6 lg:p-8 relative overflow-hidden`}>
        {/* Efectos decorativos */}
        <div className="absolute inset-0 bg-black/5 dark:bg-white/5"></div>
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 dark:bg-slate-800/20 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 dark:bg-slate-800/20 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12"></div>
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-2">
                Sistema de Recompensas
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${nivelConfig.gradient} rounded-full flex items-center justify-center text-white text-lg sm:text-xl shadow-lg`}>
                    {nivelConfig.icon}
                  </div>
          <div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className={`${nivelConfig.color} font-bold text-lg sm:text-xl lg:text-2xl`}>
                {nivelConfig.nombre}
              </span>
                      <Crown className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${nivelConfig.color}`} />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                      {nivelConfig.descripcion}
                    </p>
                  </div>
                </div>
                
                <div className="text-left sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                    {recompensas.puntos_totales}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    puntos totales
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Badge de racha */}
          {recompensas.racha_dias > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center bg-white/20 dark:bg-slate-800/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 dark:border-slate-700/50"
              >
                <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-1 sm:mb-2" />
                <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                  {recompensas.racha_dias}
              </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  días de racha
            </div>
              </motion.div>
          )}
        </div>

          {/* Barra de progreso mejorada */}
        {progreso.siguienteNivel && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 text-xs sm:text-sm">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Progreso hacia {nivelesConfig[progreso.siguienteNivel as keyof typeof nivelesConfig].nombre}
                </span>
                <span className="text-slate-600 dark:text-slate-400 font-semibold">
                  {progreso.puntosNecesarios} puntos restantes
                </span>
              </div>
              
              {/* Barra de progreso con animación de llenado mejorada */}
              <div className="relative">
                {/* Fondo de la barra mejorado */}
                <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 rounded-full h-4 sm:h-6 shadow-inner border border-slate-300/40 dark:border-slate-600/40 relative overflow-hidden">
                  {/* Barra de progreso animada */}
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progreso.porcentaje}%` }}
                    transition={{ 
                      duration: 2.5, 
                      ease: "easeOut",
                      delay: 0.5 
                    }}
                    className={`bg-gradient-to-r ${nivelConfig.gradient} h-4 sm:h-6 rounded-full shadow-lg relative overflow-hidden`}
                  >
                    {/* Efecto de brillo animado mejorado */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 4,
                        ease: "easeInOut"
                      }}
                    />
                    
                     {/* Partículas flotantes mejoradas */}
                     <div className="absolute inset-0">
                       {[...Array(5)].map((_, i) => (
                         <motion.div
                           key={`particle-${i}`}
                           className="absolute w-1.5 h-1.5 bg-white/70 rounded-full"
                           style={{
                             top: '50%',
                             left: `${15 + i * 20}%`,
                             transform: 'translateY(-50%)'
                           }}
                           animate={{
                             y: [-3, 3, -3],
                             opacity: [0.3, 1, 0.3],
                             scale: [0.8, 1.2, 0.8]
                           }}
                           transition={{
                             duration: 2.5,
                             repeat: Infinity,
                             delay: i * 0.3,
                             ease: "easeInOut"
                           }}
                         />
                       ))}
            </div>
                  </motion.div>
            </div>
                
                {/* Indicador de meta con animación mejorado */}
                <motion.div 
                  className="absolute -top-1 sm:-top-2 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 rounded-full border-2 sm:border-3 border-white dark:border-slate-800 flex items-center justify-center shadow-xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1,
                    rotate: 0
                  }}
                  transition={{ 
                    scale: { delay: 1.5, duration: 0.6, ease: "easeInOut" },
                    rotate: { delay: 1.5, duration: 0.6, ease: "easeInOut" }
                  }}
                >
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-sm" />
                </motion.div>
                
                {/* Porcentaje de progreso mejorado */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-white drop-shadow-lg z-10"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2, type: "spring", stiffness: 200 }}
                >
                  {Math.round(progreso.porcentaje)}%
                </motion.div>
          </div>
              
              {/* Información adicional del progreso */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs text-slate-600 dark:text-slate-400"
              >
                <span>
                  {recompensas.puntos_totales} / {nivelesConfig[progreso.siguienteNivel as keyof typeof nivelesConfig].puntos_necesarios} puntos
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {progreso.puntosNecesarios} para el siguiente nivel
                </span>
              </motion.div>
              
            </motion.div>
          )}
        </div>
      

      {/* Tabs mejoradas */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex">
          {(() => {
            const tabs = [
              { key: 'resumen', label: 'Resumen', icon: BarChart3 },
              { key: 'logros', label: 'Logros', icon: Trophy },
              { key: 'historial', label: 'Historial', icon: History }
            ];
            return tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === tab.key
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-900/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
            ));
          })()}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
        {activeTab === 'resumen' && (
            <motion.div
              key="resumen"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 sm:space-y-6"
            >
              <h4 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white mb-3 sm:mb-4">
                Tu Progreso
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {recompensas?.puntos_totales || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Puntos Totales
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-700/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {logros.length}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Logros Obtenidos
                  </div>
                </motion.div>
              </div>
            </motion.div>
        )}

        {activeTab === 'logros' && (
             <motion.div
               key="logros"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="space-y-4 sm:space-y-6"
             >
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                 <h4 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
                   Tus Logros
                 </h4>
                 <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                   <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                   <span>{logros.length} obtenidos</span>
                 </div>
               </div>
               
            {logros.length === 0 ? (
                 <div className="text-center py-8 sm:py-12">
                   <div className="relative">
                     <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center">
                       <Trophy className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-slate-400 dark:text-slate-500" />
                     </div>
                     <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                       <span className="text-white text-sm sm:text-lg">?</span>
                     </div>
                   </div>
                   <h3 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                     ¡Aún no tienes logros!
                   </h3>
                   <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto text-sm sm:text-base">
                     Comienza a contribuir al diccionario para desbloquear logros increíbles
                   </p>
                   <div className="flex flex-wrap justify-center gap-2">
                     <span className="px-2 sm:px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs rounded-full">Crear contribuciones</span>
                     <span className="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">Ganar puntos</span>
                     <span className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">Subir de nivel</span>
                   </div>
                 </div>
               ) : (
                 <div className="grid gap-3 sm:gap-4">
                   {logros.map((logro, index) => (
                     <motion.div 
                       key={logro.id}
                       initial={{ opacity: 0, y: 20, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       transition={{ delay: index * 0.1 }}
                       whileHover={{ scale: 1.02, y: -2 }}
                       className="group relative overflow-hidden bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-2xl border border-yellow-200/50 dark:border-yellow-700/30 hover:shadow-xl transition-all duration-300"
                     >
                       {/* Efecto de brillo animado */}
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                       
                       <div className="relative p-4 sm:p-6">
                         <div className="flex items-start gap-3 sm:gap-4">
                           {/* Icono del logro mejorado */}
                           <div className="relative">
                             <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                               <span className="text-lg sm:text-xl lg:text-2xl drop-shadow-sm">{logro.icono}</span>
                             </div>
                             {/* Efecto de resplandor */}
                             <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-red-500/30 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                             {/* Badge de completado */}
                             <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                               <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                             </div>
                           </div>
                           
                           {/* Contenido del logro */}
                           <div className="flex-1 min-w-0">
                             <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0 mb-2">
                               <h4 className="font-bold text-slate-800 dark:text-white text-base sm:text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                                 {logro.nombre}
                               </h4>
                               <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                 <Calendar className="w-3 h-3" />
                                 <span>{new Date(logro.fecha_obtenido).toLocaleDateString()}</span>
                               </div>
                             </div>
                             
                             <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-3 leading-relaxed">
                               {logro.descripcion}
                             </p>
                             
                             {/* Categoría del logro */}
                             <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                               <span className="px-2 py-1 bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-800/50 dark:to-orange-800/50 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full">
                                 {logro.categoria}
                               </span>
                               <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                 <Sparkles className="w-3 h-3" />
                                 <span>Logro desbloqueado</span>
                               </div>
                  </div>
                    </div>
                  </div>
                </div>
                     </motion.div>
                   ))}
          </div>
               )}
             </motion.div>
        )}

        {activeTab === 'historial' && (
            <motion.div
              key="historial"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3 sm:space-y-4"
            >
              <h4 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white mb-3 sm:mb-4">
                Historial de Contribuciones
              </h4>
            {historial.length === 0 ? (
                <div className="text-center py-6 sm:py-8 lg:py-12">
                  <History className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base lg:text-lg mb-2">
                    No hay historial de contribuciones
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                    ¡Comienza a contribuir al diccionario para ver tu historial aquí!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                  {historial
                    .filter(entrada => 
                      entrada.motivo === 'contribucion_aprobada' || 
                      entrada.motivo === 'contribucion_rechazada' ||
                      entrada.motivo === 'contribucion_pendiente' ||
                      entrada.motivo === 'Contribución aprobada' ||
                      entrada.motivo === 'Contribución rechazada' ||
                      entrada.motivo === 'Contribución pendiente'
                    )
                    .map((entrada, index) => (
                    <motion.div 
                      key={`${entrada.fecha_creacion}-${entrada.puntos_ganados}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-2.5 sm:p-3 lg:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600/50 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${getMotivoColor(entrada.motivo)}`}>
                          {getMotivoIcon(entrada.motivo)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-slate-800 dark:text-white truncate text-xs sm:text-sm lg:text-base">
                            {entrada.motivo}
                          </h4>
                          {entrada.descripcion && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                              {entrada.descripcion}
                            </p>
                          )}
                          <div className="flex items-center gap-1 sm:gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(entrada.fecha_creacion).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-1 sm:ml-2">
                        <div className={`flex items-center gap-1 font-bold text-sm sm:text-base lg:text-lg ${
                          entrada.puntos_ganados > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{entrada.puntos_ganados > 0 ? '+' : ''}{entrada.puntos_ganados}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          puntos
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
