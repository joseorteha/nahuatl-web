'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, AtSign, Settings, Save, X, Edit3, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createAvatar } from '@dicebear/core';
import { personas, initials, thumbs } from '@dicebear/collection';
import Header from '@/components/Header';
import Image from 'next/image';

interface UserData {
  id: string;
  email: string;
  nombre_completo?: string;
  username?: string;
  url_avatar?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [generatedAvatars, setGeneratedAvatars] = useState<string[]>([]);
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
  const [savedWords, setSavedWords] = useState<any[]>([]);
  const [isLoadingSavedWords, setIsLoadingSavedWords] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        nombre_completo: parsedUser.nombre_completo || '',
        username: parsedUser.username || '',
        email: parsedUser.email || ''
      });
      generateAvatars(parsedUser.username || parsedUser.email || 'default');
      loadUserStats(parsedUser.id);
      loadSavedWords(parsedUser.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const generateAvatars = (seed: string) => {
    const avatars: string[] = [];
    
    // Generar 2 avatares con personas (profesional y minimalista)
    for (let i = 0; i < 2; i++) {
      const avatar = createAvatar(personas, {
        seed: `${seed}-personas-${i}`,
        size: 128,
        backgroundColor: ['f0f9ff', 'e0f2fe', 'f0fdf4', 'fefce8', 'fdf2f8'],
      });
      avatars.push(avatar.toDataUri());
    }
    
    // Generar 2 avatares con iniciales (formal y elegante)
    for (let i = 0; i < 2; i++) {
      const avatar = createAvatar(initials, {
        seed: `${seed}-initials-${i}`,
        size: 128,
        backgroundColor: ['3b82f6', '10b981', '8b5cf6', 'f59e0b', 'ef4444'],
      });
      avatars.push(avatar.toDataUri());
    }
    
    // Generar 2 avatares con thumbs (iconos pulgar arriba, positivo)
    for (let i = 0; i < 2; i++) {
      const avatar = createAvatar(thumbs, {
        seed: `${seed}-thumbs-${i}`,
        size: 128,
        backgroundColor: ['dbeafe', 'd1fae5', 'e0e7ff', 'fef3c7', 'fce7f3'],
      });
      avatars.push(avatar.toDataUri());
    }
    
    setGeneratedAvatars(avatars);
  };

  const loadUserStats = async (userId: string) => {
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
      // Mantener valores por defecto en caso de error
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadSavedWords = async (userId: string) => {
    try {
      setIsLoadingSavedWords(true);
      const response = await fetch(`${API_URL}/api/auth/saved-words/${userId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar palabras guardadas');
      }

      const result = await response.json();
      setSavedWords(result.savedWords || []);
    } catch (error) {
      console.error('Error loading saved words:', error);
      // Mantener array vacío en caso de error
    } finally {
      setIsLoadingSavedWords(false);
    }
  };

  const generateNewAvatars = () => {
    const newSeed = Math.random().toString(36).substring(7);
    generateAvatars(newSeed);
  };

  const selectAvatar = (avatarIndex: number) => {
    const selectedAvatar = generatedAvatars[avatarIndex];
    const updatedUser = { ...user!, url_avatar: selectedAvatar };
    setUser(updatedUser);
    // Actualizar localStorage inmediatamente para que el header se actualice
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // Disparar evento storage para que otros componentes se actualicen
    window.dispatchEvent(new Event('storage'));
    setShowAvatarSelector(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          url_avatar: user.url_avatar
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar perfil');
      }

      // Actualizar datos locales
      const updatedUser = { ...user, ...formData, url_avatar: user.url_avatar };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header con avatar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-12">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
                  {user.url_avatar ? (
                    <Image 
                      src={user.url_avatar} 
                      alt="Avatar" 
                      width={128}
                      height={128}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="w-16 h-16 text-emerald-600" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Edit3 className="w-4 h-4 text-emerald-600" />
                </button>
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user.nombre_completo || 'Usuario'}
                </h1>
                <p className="text-emerald-100 text-lg">
                  @{user.username || 'usuario'}
                </p>
                <p className="text-emerald-200 mt-1">
                  {user.email}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-red-500/30 transition-colors"
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
              className={`mb-6 p-4 rounded-xl ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
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
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Perfil</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="@tu_usuario"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
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
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Elige tu Avatar</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={generateNewAvatars}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowAvatarSelector(false)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {generatedAvatars.map((avatar, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden cursor-pointer hover:ring-4 hover:ring-emerald-200 transition-all transform hover:scale-105"
                          onClick={() => selectAvatar(index)}
                        >
                          <Image 
                            src={avatar} 
                            alt={`Avatar ${index + 1}`} 
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          Avatar {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                    <p className="text-sm text-emerald-800 text-center">
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
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Actividad</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Contribuciones con link */}
            <Link href="/contribuir" className="block transform transition-transform hover:scale-105">
              <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-200 hover:border-emerald-300 cursor-pointer">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                  Contribuciones
                  <ExternalLink className="w-4 h-4" />
                </h3>
                {isLoadingStats ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mt-1 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.contributions}</p>
                    <p className="text-sm text-gray-600">palabras enviadas</p>
                  </>
                )}
              </div>
            </Link>

            {/* Feedback con link */}
            <Link href="/feedback" className="block transform transition-transform hover:scale-105">
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 cursor-pointer">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                  Feedback
                  <ExternalLink className="w-4 h-4" />
                </h3>
                {isLoadingStats ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mt-1 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.feedback}</p>
                    <p className="text-sm text-gray-600">mensajes enviados</p>
                  </>
                )}
              </div>
            </Link>

            {/* Palabras guardadas sin link - expansible */}
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AtSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Palabras Guardadas</h3>
              {isLoadingStats ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mt-1 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{stats.savedWords}</p>
                  <p className="text-sm text-gray-600">palabras guardadas</p>
                </>
              )}
            </div>
          </div>

          {/* Lista de palabras guardadas */}
          {stats.savedWords > 0 && (
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
                  {savedWords.slice(0, 10).map((saved: any) => (
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
      </div>
    </div>
  );
}
