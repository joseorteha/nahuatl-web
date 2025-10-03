'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Heart, 
  Share2, 
  MessageSquare, 
  Award, 
  Target, 
  BarChart3, 
  Crown, 
  Medal,
  ArrowLeft,
  ExternalLink,
  Calendar,
  MapPin,
  Mail,
  Users,
  Star,
  TrendingUp
} from 'lucide-react';
import { useAuthBackend } from '@/hooks/useAuthBackend';
import Header from '@/components/navigation/Header';
import { useSocial } from '@/hooks/useSocial';

interface PerfilUsuario {
  id: string;
  nombre_completo: string;
  username: string;
  email: string;
  url_avatar?: string;
  fecha_registro: string;
  ultima_actividad: string;
  biografia?: string;
  ubicacion?: string;
  sitio_web?: string;
  verificado: boolean;
  experiencia_social: number;
  puntos_conocimiento: number;
  nivel_conocimiento: string;
  nivel_social: string;
  configuraciones: {
    privacidad_perfil: string;
    mostrar_puntos: boolean;
    mostrar_nivel: boolean;
    notificaciones_email: boolean;
    notificaciones_push: boolean;
  };
  estadisticas: {
    temas_creados: number;
    respuestas_creadas: number;
    likes_dados: number;
    likes_recibidos: number;
    shares_dados: number;
    shares_recibidos: number;
  };
  rankings: {
    semanal: number;
    mensual: number;
    anual: number;
  };
  logros_recientes: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    fecha_obtenido: string;
  }>;
  temas_recientes: Array<{
    id: string;
    titulo: string;
    categoria: string;
    fecha_creacion: string;
    respuestas_count: number;
    contador_likes: number;
  }>;
}

export default function PerfilUsuarioPage() {
  const { user: currentUser, loading } = useAuthBackend();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'conocimiento' | 'comunidad' | 'logros'>('general');

  const fetchPerfilUsuario = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setPerfilUsuario(null);
          return;
        }
        throw new Error('Error al cargar perfil');
      }
      
      const result = await response.json();
      if (result.success) {
        setPerfilUsuario(result.data);
      }
    } catch (error) {
      console.error('Error fetching perfil usuario:', error);
      setPerfilUsuario(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      fetchPerfilUsuario();
    }
  }, [loading, fetchPerfilUsuario]);

  const getNivelColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'leyenda':
        return 'from-purple-600 to-pink-600';
      case 'maestro':
        return 'from-blue-600 to-purple-600';
      case 'experto':
        return 'from-green-600 to-blue-600';
      case 'avanzado':
        return 'from-yellow-600 to-green-600';
      default:
        return 'from-gray-600 to-yellow-600';
    }
  };

  const getNivelIcon = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'leyenda':
        return '👑';
      case 'maestro':
        return '🏆';
      case 'experto':
        return '⭐';
      case 'avanzado':
        return '🌟';
      default:
        return '🌱';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <div className="w-12 h-12 border-4 border-cyan-600/20 border-t-cyan-600 rounded-full"></div>
            </motion.div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!perfilUsuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Usuario no encontrado
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              El perfil que buscas no existe o ha sido eliminado.
            </p>
            <button
              onClick={() => router.push('/feedback')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Volver a la Comunidad
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-6xl">
        {/* Header del perfil mejorado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <div className="flex-1">
              {/* Información principal */}
              <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                  {/* Avatar y info básica */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl lg:text-4xl shadow-2xl">
                        {perfilUsuario.nombre_completo.charAt(0)}
                      </div>
                      {perfilUsuario.verificado && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                          {perfilUsuario.nombre_completo}
                        </h1>
                        {perfilUsuario.verificado && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-lg mb-3">
                        @{perfilUsuario.username}
                      </p>
                      
                      {/* Biografía */}
                      {perfilUsuario.biografia && (
                        <p className="text-slate-700 dark:text-slate-300 mb-3 max-w-2xl">
                          {perfilUsuario.biografia}
                        </p>
                      )}
                      
                      {/* Info adicional */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        {perfilUsuario.ubicacion && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{perfilUsuario.ubicacion}</span>
                          </div>
                        )}
                        {perfilUsuario.sitio_web && (
                          <div className="flex items-center gap-1">
                            <ExternalLink className="w-4 h-4" />
                            <a href={perfilUsuario.sitio_web} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                              Sitio web
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Miembro desde {new Date(perfilUsuario.fecha_registro).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Niveles y puntos */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:gap-4">
                    {perfilUsuario.configuraciones.mostrar_nivel && (
                      <div className="flex gap-2">
                        <div className={`px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r ${getNivelColor(perfilUsuario.nivel_social)} text-white shadow-lg`}>
                          {getNivelIcon(perfilUsuario.nivel_social)} {perfilUsuario.nivel_social}
                        </div>
                        <div className={`px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r ${getNivelColor(perfilUsuario.nivel_conocimiento)} text-white shadow-lg`}>
                          {getNivelIcon(perfilUsuario.nivel_conocimiento)} {perfilUsuario.nivel_conocimiento}
                        </div>
                      </div>
                    )}
                    
                    {perfilUsuario.configuraciones.mostrar_puntos && (
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                            {perfilUsuario.experiencia_social}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Social</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {perfilUsuario.puntos_conocimiento}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Conocimiento</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg mb-6 sm:mb-8"
        >
          <div className="border-b border-slate-200/50 dark:border-slate-700/50">
            <nav className="flex flex-col sm:flex-row px-2 sm:px-4 lg:px-6">
              {[
                { id: 'general', label: 'Vista General', icon: BarChart3, shortLabel: 'General' },
                { id: 'conocimiento', label: 'Conocimiento', icon: Target, shortLabel: 'Conocimiento' },
                { id: 'comunidad', label: 'Comunidad', icon: Users, shortLabel: 'Comunidad' },
                { id: 'logros', label: 'Logros', icon: Trophy, shortLabel: 'Logros' }
              ].map(({ id, label, icon: Icon, shortLabel }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3 py-2.5 sm:py-3 lg:py-4 px-2 sm:px-3 lg:px-6 border-b-2 font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    activeTab === id
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{shortLabel}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
            {activeTab === 'general' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Estadísticas principales mejoradas */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { 
                      label: 'Temas Creados', 
                      value: perfilUsuario.estadisticas.temas_creados, 
                      icon: MessageSquare, 
                      color: 'from-blue-500 to-cyan-500',
                      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
                      textColor: 'text-blue-600 dark:text-blue-400'
                    },
                    { 
                      label: 'Respuestas', 
                      value: perfilUsuario.estadisticas.respuestas_creadas, 
                      icon: MessageSquare, 
                      color: 'from-purple-500 to-pink-500',
                      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
                      textColor: 'text-purple-600 dark:text-purple-400'
                    },
                    { 
                      label: 'Likes Dados', 
                      value: perfilUsuario.estadisticas.likes_dados, 
                      icon: Heart, 
                      color: 'from-red-500 to-pink-500',
                      bgColor: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
                      textColor: 'text-red-600 dark:text-red-400'
                    },
                    { 
                      label: 'Likes Recibidos', 
                      value: perfilUsuario.estadisticas.likes_recibidos, 
                      icon: Heart, 
                      color: 'from-green-500 to-emerald-500',
                      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                      textColor: 'text-green-600 dark:text-green-400'
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${stat.bgColor} rounded-2xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl hover:scale-105 transition-all duration-300 group`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl sm:text-3xl font-bold ${stat.textColor}`}>
                            {stat.value}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Rankings mejorados */}
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    { periodo: 'Semanal', valor: perfilUsuario.rankings.semanal, color: 'from-yellow-500 to-orange-500', icon: '📅' },
                    { periodo: 'Mensual', valor: perfilUsuario.rankings.mensual, color: 'from-blue-500 to-purple-500', icon: '📊' },
                    { periodo: 'Anual', valor: perfilUsuario.rankings.anual, color: 'from-purple-500 to-pink-500', icon: '🏆' }
                  ].map(({ periodo, valor, color, icon }, index) => (
                    <motion.div
                      key={periodo}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 group`}
                    >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                        {icon}
                      </div>
                      <div className="text-sm opacity-90 mb-2 font-medium">{periodo}</div>
                      <div className="text-3xl sm:text-4xl font-bold mb-1">
                        {valor > 0 ? `#${valor}` : 'N/A'}
                      </div>
                      <div className="text-xs opacity-75">posición</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'conocimiento' && (
              <div className="space-y-6 sm:space-y-8">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                  🎓 Conocimiento
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/60 dark:border-purple-700/60 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Puntos de Conocimiento
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Tu progreso en el aprendizaje
                        </p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {perfilUsuario.puntos_conocimiento}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Nivel: <span className="font-semibold">{perfilUsuario.nivel_conocimiento}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200/60 dark:border-blue-700/60 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Progreso
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Hacia el siguiente nivel
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((perfilUsuario.puntos_conocimiento / 1000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {Math.min((perfilUsuario.puntos_conocimiento / 1000) * 100, 100).toFixed(1)}% completado
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comunidad' && (
              <div className="space-y-6 sm:space-y-8">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                  👥 Comunidad
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/60 dark:border-green-700/60 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Experiencia Social
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Tu impacto en la comunidad
                        </p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {perfilUsuario.experiencia_social}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Nivel: <span className="font-semibold">{perfilUsuario.nivel_social}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-orange-200/60 dark:border-orange-700/60 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Rankings
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Tu posición en la comunidad
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Semanal:</span>
                        <span className="font-semibold">#{perfilUsuario.rankings.semanal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Mensual:</span>
                        <span className="font-semibold">#{perfilUsuario.rankings.mensual}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Anual:</span>
                        <span className="font-semibold">#{perfilUsuario.rankings.anual}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logros' && (
              <div className="space-y-6 sm:space-y-8">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                  Logros Recientes
                </h3>
                
                {perfilUsuario.logros_recientes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {perfilUsuario.logros_recientes.map((logro, index) => (
                      <motion.div
                        key={logro.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-lg">{logro.icono}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">{logro.nombre}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(logro.fecha_obtenido).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{logro.descripcion}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Sin logros aún
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                      Este usuario aún no ha obtenido logros
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
