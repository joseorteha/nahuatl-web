'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, AtSign, Settings, Save, X, Edit3, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from 'boring-avatars';
import Header from '@/components/Header';
import Recompensas from '@/components/Recompensas';
import Image from 'next/image';
import { useAuthBackend } from '@/hooks/useAuthBackend';

interface SavedWord {
  id: string;
  diccionario?: {
    word: string;
    definition: string;
    info_gramatical?: string;
  };
}

interface AvatarData {
  name: string;
  variant: string;
  colors: string[];
}

export default function ProfilePage() {
  const { user: profile, loading, isAuthenticated } = useAuthBackend();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [generatedAvatars, setGeneratedAvatars] = useState<AvatarData[]>([]);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    username: '',
    email: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState({
    contributions: 0,
    feedback: 0,
    savedWords: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [isLoadingSavedWords, setIsLoadingSavedWords] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Datos combinados del usuario (perfil + auth)
  const userData = profile ? {
    id: profile.id,
    email: profile.email,
    nombre_completo: profile.nombre_completo,
    url_avatar: profile.url_avatar,
    username: profile.email // Usar email como fallback para username
  } : null;

  // Helper para renderizar avatares
  const renderAvatar = (avatarString: string | null | undefined, size: number = 128) => {
    if (!avatarString) {
      return (
        <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center">
          <User className={`w-${size/8} h-${size/8} text-emerald-600`} />
        </div>
      );
    }

    if (avatarString.startsWith('boring-avatar:')) {
      const parts = avatarString.split(':');
      const name = parts[1];
      const variant = parts[2];
      const colors = parts[3].split(',');
      
      return (
        <Avatar
          size={size}
          name={name}
          variant={variant as 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus'}
          colors={colors}
        />
      );
    }

    // Si es una URL normal de imagen
    return (
      <Image 
        src={avatarString} 
        alt="Avatar" 
        width={size}
        height={size}
        className="w-full h-full rounded-full object-cover"
      />
    );
  };

  const loadUserStats = useCallback(async (userId: string) => {
    try {
      setIsLoadingStats(true);
      const response = await fetch(`${API_URL}/api/auth/stats/${userId}`);
      
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

  const loadSavedWords = useCallback(async (userId: string) => {
    try {
      setIsLoadingSavedWords(true);
      const response = await fetch(`${API_URL}/api/dictionary/saved/${userId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar palabras guardadas');
      }
      
      const result = await response.json();
      setSavedWords(result.savedWords || []);
    } catch (error) {
      console.error('Error loading saved words:', error);
      setSavedWords([]);
    } finally {
      setIsLoadingSavedWords(false);
    }
  }, [API_URL]);

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Configurar datos del formulario cuando el perfil esté disponible
    if (profile) {
      setFormData({
        nombre_completo: profile.nombre_completo || '',
        username: profile.email || '', // Usar email como username
        email: profile.email || ''
      });
      generateAvatars(profile.email || 'default');
      loadUserStats(profile.id);
      loadSavedWords(profile.id);
    }
  }, [loading, isAuthenticated, profile, router, loadUserStats, loadSavedWords]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!userData) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/profile/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header con avatar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8 border border-white/20 dark:border-gray-700/50"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 px-8 py-12 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm p-2 shadow-lg flex items-center justify-center border border-white/30">
                  {renderAvatar(userData.url_avatar, 120)}
                </div>
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute -bottom-2 -right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-white/20 dark:border-gray-600/50"
                >
                  <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">
                  {userData.nombre_completo || 'Usuario'}
                </h1>
                <p className="text-emerald-100 dark:text-emerald-200 text-lg font-medium">
                  @{userData.username || 'usuario'}
                </p>
                <p className="text-emerald-200 dark:text-emerald-300 mt-1 opacity-90">
                  {userData.email}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/20 dark:bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300 flex items-center gap-2 border border-white/20 hover:border-white/30"
                >
                  <Settings className="w-5 h-5" />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 dark:bg-red-500/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-red-500/30 dark:hover:bg-red-500/40 transition-all duration-300 border border-red-400/20 hover:border-red-400/30"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
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
                      <div key={index} className="text-center">
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

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/50"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mi Actividad</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Contribuciones con link */}
            <Link href="/contribuir" className="block transform transition-transform hover:scale-105">
              <div className="text-center p-6 bg-emerald-50/80 dark:bg-emerald-900/30 backdrop-blur-sm rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 hover:border-emerald-300 dark:hover:border-emerald-600 cursor-pointer transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-shadow">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-1 mb-2">
                  Contribuciones
                  <ExternalLink className="w-4 h-4 opacity-60" />
                </h3>
                {isLoadingStats ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mt-1 mb-1"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.contributions}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">palabras enviadas</p>
                  </>
                )}
              </div>
            </Link>

            {/* Feedback con link */}
            <Link href="/feedback" className="block transform transition-transform hover:scale-105">
              <div className="text-center p-6 bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-700/50 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-1 mb-2">
                  Feedback
                  <ExternalLink className="w-4 h-4 opacity-60" />
                </h3>
                {isLoadingStats ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mt-1 mb-1"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.feedback}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">mensajes enviados</p>
                  </>
                )}
              </div>
            </Link>

            {/* Palabras guardadas sin link - expansible */}
            <div className="text-center p-6 bg-purple-50/80 dark:bg-purple-900/30 backdrop-blur-sm rounded-xl border border-purple-200/50 dark:border-purple-700/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <AtSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Palabras Guardadas</h3>
              {isLoadingStats ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mt-1 mb-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.savedWords}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">palabras guardadas</p>
                </>
              )}
            </div>
          </div>

          {/* Lista de palabras guardadas */}
          {savedWords.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Palabras Guardadas</h3>
              {isLoadingSavedWords ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {savedWords.slice(0, 10).map((saved: SavedWord) => (
                    <div key={saved.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{saved.diccionario?.word}</h4>
                          <p className="text-sm text-gray-600 mt-1">{saved.diccionario?.definition}</p>
                          {saved.diccionario?.info_gramatical && (
                            <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                              {saved.diccionario.info_gramatical}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {savedWords.length > 10 && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Y {savedWords.length - 10} palabras más...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Sistema de Recompensas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {userData && <Recompensas userId={userData.id} />}
        </motion.div>
      </div>
    </div>
  );
}
