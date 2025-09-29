'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, AtSign, Settings, Save, X, Edit3, RefreshCw, ExternalLink, Users, Heart, MessageCircle, Share2, CheckCircle, MapPin, Globe, Shield, Bell, Eye, Calendar, Trophy, Star, Target, Award, TrendingUp, Zap, Crown, Sparkles, ArrowUp, Flame, BarChart3, History, Gift, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from 'boring-avatars';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import Recompensas from '@/components/features/rewards/Recompensas';
import ConocimientoTab from '@/components/features/profile/ConocimientoTab';
import ComunidadTab from '@/components/features/profile/ComunidadTab';
import LogrosTab from '@/components/features/profile/LogrosTab';
import Image from 'next/image';
import { useAuthBackend } from '@/hooks/useAuthBackend';
import { useSocial, Seguimiento } from '@/hooks/useSocial';
import { UserCard } from '@/components/features/social/UserCard';


interface AvatarData {
  name: string;
  variant: string;
  colors: string[];
}

export default function ProfilePage() {
  // Hooks de autenticación y social
  const { user, loading, isAuthenticated } = useAuthBackend();
  const { obtenerSeguidores, obtenerSiguiendo } = useSocial();
  const router = useRouter();

  // Estados del componente
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedAvatars, setGeneratedAvatars] = useState<AvatarData[]>([]);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    username: '',
    email: '',
    biografia: '',
    ubicacion: '',
    sitio_web: '',
    privacidad_perfil: 'publico' as 'publico' | 'amigos' | 'privado',
    mostrar_puntos: true,
    mostrar_nivel: true,
    notificaciones_email: true,
    notificaciones_push: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState({
    contributions: 0,
    feedback: 0,
    savedWords: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Estados sociales
  const [seguidores, setSeguidores] = useState<Seguimiento[]>([]);
  const [siguiendo, setSiguiendo] = useState<Seguimiento[]>([]);
  const [isLoadingSocial, setIsLoadingSocial] = useState(true);
  const [activeTab, setActiveTab] = useState<'conocimiento' | 'comunidad' | 'logros'>('conocimiento');
  
  // Nuevos estados para el sistema de contribuciones
  const [contributionsStats, setContributionsStats] = useState({
    totalContributions: 0,
    approvedContributions: 0,
    pendingContributions: 0,
    rejectedContributions: 0,
    totalPoints: 0,
    level: 'principiante',
    experience: 0
  });
  const [isLoadingContributions, setIsLoadingContributions] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Datos combinados del usuario (perfil + auth)
  const userData = user ? {
    id: user.id,
    email: user.email,
    nombre_completo: user.nombre_completo,
    url_avatar: user.url_avatar,
    username: user.username || user.email // Usar username o email como fallback
  } : null;

  // Helper para renderizar avatares
  const renderAvatar = (avatarString: string | null | undefined, size: number = 128) => {
    if (!avatarString) {
      return (
        <div className="w-full h-full rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
          <User className={`w-${size/8} h-${size/8} text-cyan-600 dark:text-cyan-400`} />
        </div>
      );
    }

    if (avatarString.startsWith('boring-avatar:')) {
      // Generar un avatar simple basado en el nombre
      const parts = avatarString.split(':');
      const name = parts[1] || 'Usuario';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      return (
        <div 
          className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg"
          style={{ width: size, height: size }}
        >
          {initials}
        </div>
      );
    }

    // Si es una URL normal de imagen
    return (
      <Image 
        src={avatarString} 
        alt="Avatar" 
        width={size}
        height={size}
        className="w-full h-full rounded-full object-cover shadow-lg"
      />
    );
  };

  const loadUserStats = useCallback(async (userId: string) => {
    try {
      setIsLoadingStats(true);
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      const response = await fetch(`${API_URL}/api/auth/stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }
      
      const result = await response.json();
      setStats(result.stats || { contributions: 0, feedback: 0, savedWords: 0 });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({ contributions: 0, feedback: 0, savedWords: 0 });
    } finally {
      setIsLoadingStats(false);
    }
  }, [API_URL]);

  // Nueva función para cargar estadísticas de contribuciones
  const loadContributionsStats = useCallback(async (userId: string) => {
    try {
      setIsLoadingContributions(true);
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      // Cargar estadísticas de contribuciones
      const contributionsResponse = await fetch(`${API_URL}/api/contribuciones/stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (contributionsResponse.ok) {
        const contributionsData = await contributionsResponse.json();
        setContributionsStats(contributionsData);
      }

      // Cargar datos de recompensas para puntos y nivel
      const rewardsResponse = await fetch(`${API_URL}/api/recompensas/usuario/${userId}`, {
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        setContributionsStats(prev => ({
          ...prev,
          totalPoints: rewardsData.recompensas?.puntos_totales || 0,
          level: rewardsData.recompensas?.nivel || 'principiante',
          experience: rewardsData.recompensas?.experiencia || 0
        }));
      }
    } catch (error) {
      console.error('Error loading contributions stats:', error);
    } finally {
      setIsLoadingContributions(false);
    }
  }, [API_URL]);


  // Cargar datos sociales
  const loadSocialData = useCallback(async (userId: string) => {
    try {
      setIsLoadingSocial(true);
      
      // Cargar seguidores y siguiendo en paralelo
      const [seguidoresRes, siguiendoRes] = await Promise.all([
        obtenerSeguidores(userId),
        obtenerSiguiendo(userId)
      ]);

      if (seguidoresRes && Array.isArray(seguidoresRes)) {
        setSeguidores(seguidoresRes);
      }
      
      if (siguiendoRes && Array.isArray(siguiendoRes)) {
        setSiguiendo(siguiendoRes);
      }
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setIsLoadingSocial(false);
    }
  }, [obtenerSeguidores, obtenerSiguiendo]);

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Configurar datos del formulario cuando el usuario esté disponible
    if (user) {
      setFormData({
        nombre_completo: user.nombre_completo || '',
        username: user.username || user.email || '', // Usar username o email
        email: user.email || '',
        biografia: user.biografia || '',
        ubicacion: user.ubicacion || '',
        sitio_web: user.sitio_web || '',
        privacidad_perfil: user.privacidad_perfil || 'publico',
        mostrar_puntos: user.mostrar_puntos ?? true,
        mostrar_nivel: user.mostrar_nivel ?? true,
        notificaciones_email: user.notificaciones_email ?? true,
        notificaciones_push: user.notificaciones_push ?? true
      });
      generateAvatars(user.email || 'default');
      loadUserStats(user.id);
      loadContributionsStats(user.id);
      loadSocialData(user.id);
    }
  }, [loading, isAuthenticated, user, router, loadUserStats, loadContributionsStats, loadSocialData]);

  const generateAvatars = (seed: string) => {
    const variants = ['marble', 'beam', 'pixel', 'sunset', 'ring', 'bauhaus'];
    const colors = [
      ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'],
      ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
      ['#F1FAEE', '#A8DADC', '#457B9D', '#1D3557', '#F1FAEE'],
      ['#FFE66D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
      ['#FFEAA7', '#DDA0DD', '#98D8C8', '#FF7675', '#74B9FF'],
      ['#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7', '#00B894']
    ];
    
    const avatars: AvatarData[] = [];
    
    variants.forEach((variant, index) => {
      const avatarData = {
        name: `${seed}-${variant}-${index}`,
        variant: variant as 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus',
        colors: colors[index % colors.length],
      };
      avatars.push(avatarData);
    });
    
    setGeneratedAvatars(avatars);
  };

  const generateNewAvatars = () => {
    const newSeed = Math.random().toString(36).substring(7);
    generateAvatars(newSeed);
  };

  const selectAvatar = (avatarIndex: number) => {
    const selectedAvatarData = generatedAvatars[avatarIndex];
    // Crear un identificador único para este avatar que el header pueda usar
    const avatarString = `boring-avatar:${selectedAvatarData.name}:${selectedAvatarData.variant}:${selectedAvatarData.colors.join(',')}`;
    
    // Actualizar el formData para que se guarde cuando el usuario haga save
    setFormData(prev => ({
      ...prev,
      url_avatar: avatarString
    }));
    
    setShowAvatarSelector(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSave = async () => {
    if (!userData) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Obtener token del localStorage
      const storedTokens = localStorage.getItem('auth_tokens');
      const tokens = storedTokens ? JSON.parse(storedTokens) : null;
      
      if (!tokens?.accessToken) {
        throw new Error('No se encontró token de acceso. Por favor, inicia sesión nuevamente.');
      }

      const response = await fetch(`${API_URL}/api/auth/profile/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`
        },
        body: JSON.stringify({
          ...formData,
          url_avatar: userData.url_avatar
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar perfil');
      }

      setMessage({ type: 'success', text: '¡Perfil actualizado exitosamente!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al actualizar perfil' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <ConditionalHeader />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <ConditionalHeader />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl space-y-6 sm:space-y-8">
        {/* Header con avatar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 dark:border-slate-700/60"
        >
          <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-slate-600 dark:from-cyan-600 dark:via-blue-700 dark:to-slate-700 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative overflow-hidden">
            {/* Decorative elements mejorados */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-black/20 dark:to-transparent"></div>
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-white/10 dark:bg-white/5 rounded-full -translate-y-24 sm:-translate-y-36 translate-x-24 sm:translate-x-36 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-56 sm:h-56 bg-white/10 dark:bg-white/5 rounded-full translate-y-20 sm:translate-y-28 -translate-x-20 sm:-translate-x-28 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 dark:bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            <div className="relative flex flex-col lg:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
              {/* Avatar section */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm p-1 shadow-2xl flex items-center justify-center border-2 border-white/40 dark:border-white/20 ring-4 ring-white/20 dark:ring-white/10">
                  {renderAvatar(userData.url_avatar, 120)}
                </div>
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute -bottom-1 -right-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-full p-2 sm:p-2.5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white/30 dark:border-slate-600/50 hover:border-cyan-400 dark:hover:border-cyan-500"
                >
                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400" />
                </button>
              </div>
              
              {/* User info section */}
              <div className="text-center lg:text-left flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg break-words">
                  {userData.nombre_completo || 'Usuario'}
                </h1>
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 flex-wrap">
                    {user?.verificado && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}
                    {user?.es_beta_tester && (
                      <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-500/90 text-white text-xs font-bold rounded-full shadow-lg">
                        BETA
                      </div>
                    )}
                    {user?.rol === 'admin' && (
                      <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500/90 text-white text-xs font-bold rounded-full shadow-lg">
                        ADMIN
                      </div>
                    )}
                    {user?.rol === 'moderador' && (
                      <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-500/90 text-white text-xs font-bold rounded-full shadow-lg">
                        MOD
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-cyan-100 dark:text-cyan-200 text-base sm:text-lg font-semibold mb-1">
                  @{userData.username || 'usuario'}
                </p>
                <p className="text-cyan-200 dark:text-cyan-300 text-sm sm:text-base opacity-90 mb-3">
                  {userData.email}
                </p>
                
                {user?.biografia && (
                  <p className="text-cyan-100 dark:text-cyan-200 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-4">
                    {user.biografia}
                  </p>
                )}
                
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-cyan-200 dark:text-cyan-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Se unió {new Date(user?.fecha_creacion || Date.now()).toLocaleDateString()}</span>
                  </div>
                  {user?.ubicacion && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate max-w-[150px] sm:max-w-[200px]">{user.ubicacion}</span>
                    </div>
                  )}
                  {user?.sitio_web && (
                    <a
                      href={user.sitio_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-white transition-colors truncate max-w-[150px] sm:max-w-[200px]"
                    >
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Website</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/25 dark:bg-white/15 backdrop-blur-sm text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-white/35 dark:hover:bg-white/25 transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{isEditing ? 'Cancelar' : 'Editar'}</span>
                  <span className="sm:hidden">{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/30 dark:bg-red-500/40 backdrop-blur-sm text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-red-500/40 dark:hover:bg-red-500/50 transition-all duration-300 border border-red-400/30 hover:border-red-400/50 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                  <span className="sm:hidden">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pestañas de navegación mejoradas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-slate-700/60 overflow-hidden"
        >
          <div className="flex border-b border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setActiveTab('conocimiento')}
              className={`flex-1 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 text-center font-semibold transition-all duration-300 relative group ${
                activeTab === 'conocimiento'
                  ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3">
                <Target className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${activeTab === 'conocimiento' ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="text-xs sm:text-sm lg:text-base">Mi Conocimiento</span>
                {contributionsStats.totalContributions > 0 && (
                  <span className="bg-cyan-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold shadow-lg">
                    {contributionsStats.totalContributions}
                  </span>
                )}
              </div>
              {activeTab === 'conocimiento' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('comunidad')}
              className={`flex-1 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 text-center font-semibold transition-all duration-300 relative group ${
                activeTab === 'comunidad'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3">
                <Users className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${activeTab === 'comunidad' ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="text-xs sm:text-sm lg:text-base">Mi Comunidad</span>
                {seguidores.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold shadow-lg">
                    {seguidores.length}
                  </span>
                )}
              </div>
              {activeTab === 'comunidad' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('logros')}
              className={`flex-1 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 text-center font-semibold transition-all duration-300 relative group ${
                activeTab === 'logros'
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3">
                <Trophy className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${activeTab === 'logros' ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="text-xs sm:text-sm lg:text-base">Logros</span>
              </div>
              {activeTab === 'logros' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-t-full"></div>
              )}
            </button>
          </div>
        </motion.div>

        {/* Mensajes */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl backdrop-blur-sm border ${
                message.type === 'success' 
                  ? 'bg-green-50/90 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700/50' 
                  : 'bg-red-50/90 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700/50'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario de edición */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-700/50"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Editar Perfil</h2>
              
              {/* Información Básica */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Básica
                </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                    placeholder="@tu_usuario"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Biografía
                    </label>
                    <textarea
                      name="biografia"
                      value={formData.biografia}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 resize-none"
                      placeholder="Cuéntanos sobre ti..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                      placeholder="Ciudad, País"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sitio Web
                    </label>
                    <input
                      type="url"
                      name="sitio_web"
                      value={formData.sitio_web}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                      placeholder="https://tu-sitio.com"
                    />
                  </div>
                </div>
              </div>

              {/* Configuración de Privacidad */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacidad
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Visibilidad del Perfil
                    </label>
                    <select
                      name="privacidad_perfil"
                      value={formData.privacidad_perfil}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                    >
                      <option value="publico">Público - Cualquiera puede ver tu perfil</option>
                      <option value="amigos">Amigos - Solo tus seguidores pueden ver tu perfil</option>
                      <option value="privado">Privado - Solo tú puedes ver tu perfil</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Mostrar Puntos</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Permitir que otros vean tus puntos</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="mostrar_puntos"
                          checked={formData.mostrar_puntos}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Mostrar Nivel</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Permitir que otros vean tu nivel</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="mostrar_nivel"
                          checked={formData.mostrar_nivel}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuración de Notificaciones */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificaciones
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Notificaciones por Email</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recibir notificaciones por correo</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="notificaciones_email"
                        checked={formData.notificaciones_email}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Notificaciones Push</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recibir notificaciones en el navegador</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="notificaciones_push"
                        checked={formData.notificaciones_push}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selector de Avatar */}
        <AnimatePresence>
          {showAvatarSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAvatarSelector(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Elige tu Avatar</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={generateNewAvatars}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all duration-200"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowAvatarSelector(false)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {generatedAvatars.map((avatarData, index) => (
                      <div key={`avatar-${avatarData.name}-${index}`} className="text-center">
                        <div 
                          className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden cursor-pointer hover:ring-4 hover:ring-emerald-200 dark:hover:ring-emerald-400/30 transition-all transform hover:scale-105 flex items-center justify-center bg-gray-100 dark:bg-gray-700"
                          onClick={() => selectAvatar(index)}
                        >
                          <Avatar
                            size={96}
                            name={avatarData.name}
                            variant={avatarData.variant as 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus'}
                            colors={avatarData.colors}
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {avatarData.variant}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-emerald-50/80 dark:bg-emerald-900/30 backdrop-blur-sm rounded-xl border border-emerald-200/50 dark:border-emerald-700/50">
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 text-center">
                      💡 Haz clic en &quot;Generar Nuevos&quot; para crear avatares diferentes con el mismo estilo
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido de las pestañas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/40 dark:border-slate-700/60"
        >
          {/* Pestaña de Conocimiento */}
          {activeTab === 'conocimiento' && (
            <ConocimientoTab userId={userData.id} />
          )}

          {/* Pestaña de Comunidad */}
          {activeTab === 'comunidad' && (
            <ComunidadTab userId={userData.id} />
          )}

          {/* Pestaña de Logros */}
          {activeTab === 'logros' && (
            <LogrosTab userId={userData.id} />
          )}

        </motion.div>
      </div>
    </div>
  );
}
