'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, History, Users, BookOpen, Sparkles, X, CheckCircle, Star, Gift, Target, Award } from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import Footer from '@/components/navigation/Footer';
import ContributeWordForm from '@/components/features/contributions/ContributeWordForm';
import { getContributionStats, type ContributionStats } from '@/lib/utils/contributionStats';
import { useAuth } from '@/contexts/AuthContext';

interface UserContribution {
  id: string;
  word: string;
  definition: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'publicada';
  comentarios_admin?: string;
  fecha_creacion: string;
  fecha_revision?: string;
  perfiles?: {
    nombre_completo: string;
  };
}

export default function ContributePage() {
  const { user, loading: authLoading } = useAuth();
  const [contributions, setContributions] = useState<UserContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contribute' | 'history'>('contribute');
  const [stats, setStats] = useState<ContributionStats>({
    totalWords: 0,
    totalContributors: 0,
    userContributions: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<UserContribution | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web-xmeo.onrender.com';

  const loadUserContributions = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/contributions/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setContributions(data);
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const loadStats = useCallback(async (userId?: string) => {
    try {
      setStatsLoading(true);
      const statsData = await getContributionStats(userId);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadUserContributions(user.id);
        loadStats(user.id); // Cargar estadísticas con ID del usuario
      } else {
        setLoading(false);
        loadStats(); // Cargar estadísticas sin usuario
      }
    }
  }, [user, authLoading, loadUserContributions, loadStats]);

  // Mostrar modal informativo cada vez que se entra a la página (a menos que se haya cerrado permanentemente)
  useEffect(() => {
    const hasSeenInfo = localStorage.getItem('contribuir-info-seen');
    if (!hasSeenInfo) {
      setShowInfoModal(true);
    }
  }, []);

  const handleCloseInfoModal = () => {
    setShowInfoModal(false);
  };

  const handleClosePermanently = () => {
    setShowInfoModal(false);
    localStorage.setItem('contribuir-info-seen', 'true');
  };

  const handleViewDetails = (contribution: UserContribution) => {
    setSelectedContribution(contribution);
    setShowDetails(true);
  };

  const getStatusBadge = (estado: string) => {
    const styles = {
      pendiente: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
      aprobada: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
      rechazada: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
      publicada: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700'
    };

    const labels = {
      pendiente: 'En Revisión',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada',
      publicada: 'Publicada'
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[estado as keyof typeof styles] || styles.pendiente}`}>
        {labels[estado as keyof typeof labels] || 'Desconocido'}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <ConditionalHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <div className="w-12 h-12 border-4 border-cyan-600/20 border-t-cyan-600 rounded-full"></div>
            </motion.div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Cargando...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <ConditionalHeader />
      
      {/* Modal Informativo */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseInfoModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/40 dark:border-slate-700/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        ¡Contribuye al Náhuatl!
                      </h2>
                      <p className="text-slate-600 dark:text-slate-300">
                        Tu conocimiento es invaluable para nuestra comunidad
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseInfoModal}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-cyan-600" />
                      ¿Qué es Contribuir?
                    </h3>
                    <div className="space-y-3 text-slate-600 dark:text-slate-300">
                      <p>• Agregar nuevas palabras al diccionario</p>
                      <p>• Mejorar definiciones existentes</p>
                      <p>• Proporcionar ejemplos de uso</p>
                      <p>• Compartir variantes regionales</p>
                      <p>• Documentar información gramatical</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-blue-600" />
                      Beneficios para Ti
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl">
                        <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Puntos y Niveles</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">Gana puntos por cada contribución aprobada</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                        <Award className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Reconocimiento</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">Tu nombre aparecerá como contribuidor</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                        <Target className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Impacto Cultural</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">Ayuda a preservar el náhuatl</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-cyan-200/50 dark:border-cyan-700/50">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Proceso de Contribución
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                      <p className="font-medium text-slate-900 dark:text-white">Envía tu contribución</p>
                      <p className="text-slate-600 dark:text-slate-300">Completa el formulario con la información</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                      <p className="font-medium text-slate-900 dark:text-white">Revisión</p>
                      <p className="text-slate-600 dark:text-slate-300">Nuestros expertos revisan tu contribución</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                      <p className="font-medium text-slate-900 dark:text-white">Publicación</p>
                      <p className="text-slate-600 dark:text-slate-300">Si es aprobada, se publica en el diccionario</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={handleClosePermanently}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    No volver a mostrar
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseInfoModal}
                      className="px-6 py-3 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={handleCloseInfoModal}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      ¡Empezar a Contribuir!
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 dark:from-cyan-400/10 dark:to-blue-400/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Contribuir al Diccionario
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Ayuda a preservar y expandir el náhuatl. Tu conocimiento es invaluable para nuestra comunidad.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <BookOpen className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {statsLoading ? (
                    <div className="animate-pulse bg-slate-300 dark:bg-slate-600 h-6 w-16 mx-auto rounded"></div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {stats.totalWords.toLocaleString()}
                    </motion.span>
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Palabras</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {statsLoading ? (
                    <div className="animate-pulse bg-slate-300 dark:bg-slate-600 h-6 w-16 mx-auto rounded"></div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {stats.totalContributors.toLocaleString()}
                    </motion.span>
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Contribuyentes</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <History className="h-6 w-6 text-slate-600 dark:text-slate-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {statsLoading ? (
                    <div className="animate-pulse bg-slate-300 dark:bg-slate-600 h-6 w-16 mx-auto rounded"></div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      {stats.userContributions.toLocaleString()}
                    </motion.span>
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {user ? 'Tus contribuciones' : 'Contribuciones promedio'}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Navigation Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setActiveTab('contribute')}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'contribute'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <Plus className="h-5 w-5" />
                <span>Nueva Contribución</span>
              </button>
              
              {user && (
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'history'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <History className="h-5 w-5" />
                  <span>Mi Historial</span>
                  {contributions.length > 0 && (
                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                      {contributions.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'contribute' && (
              <ContributeWordForm
                userId={user?.id}
                userEmail={user?.email}
                onSuccess={() => {
                  if (user) {
                    loadUserContributions(user.id);
                    loadStats(user.id); // Recargar estadísticas
                  }
                  setActiveTab('history');
                }}
              />
            )}

            {activeTab === 'history' && user && (
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-200/60 dark:border-slate-700/60">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                  Historial de Contribuciones
                </h2>

                {contributions.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="mb-6">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                      No tienes contribuciones aún
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                      Envía tu primera palabra al diccionario para comenzar a contribuir con la preservación del náhuatl.
                    </p>
                    <button
                      onClick={() => setActiveTab('contribute')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5" />
                      Contribuir Ahora
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {contributions.map((contribution, index) => (
                      <motion.div
                        key={contribution.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                              {contribution.word}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                              {contribution.definition}
                            </p>
                          </div>
                          <div className="ml-4 flex flex-col items-end gap-2">
                            {getStatusBadge(contribution.estado)}
                            <button
                              onClick={() => handleViewDetails(contribution)}
                              className="text-xs px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-800/50 transition-colors"
                            >
                              Ver detalles
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
                          <span>
                            Enviada: {formatDate(contribution.fecha_creacion)}
                          </span>
                          {contribution.fecha_revision && (
                            <span>
                              Revisada: {formatDate(contribution.fecha_revision)}
                            </span>
                          )}
                        </div>

                        {contribution.comentarios_admin && (
                          <div className="mt-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border-l-4 border-cyan-200 dark:border-cyan-400">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Comentarios del moderador:
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {contribution.comentarios_admin}
                            </p>
                            {contribution.perfiles && (
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                — {contribution.perfiles.nombre_completo}
                              </p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal de Detalles de Contribución */}
      <AnimatePresence>
        {showDetails && selectedContribution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/40 dark:border-slate-700/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Detalles de Contribución
                      </h2>
                      <p className="text-slate-600 dark:text-slate-300">
                        Información completa de tu contribución
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Información Básica */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-cyan-200/50 dark:border-cyan-700/50">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-cyan-600" />
                      Información Básica
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Palabra</label>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{selectedContribution.word}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Estado</label>
                        <div className="mt-1">
                          {getStatusBadge(selectedContribution.estado)}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Definición</label>
                        <p className="text-slate-900 dark:text-white mt-1">{selectedContribution.definition}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <History className="w-5 h-5 text-slate-600" />
                      Historial
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Fecha de Envío</label>
                        <p className="text-slate-900 dark:text-white">{formatDate(selectedContribution.fecha_creacion)}</p>
                      </div>
                      {selectedContribution.fecha_revision && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Fecha de Revisión</label>
                          <p className="text-slate-900 dark:text-white">{formatDate(selectedContribution.fecha_revision)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comentarios del Admin */}
                  {selectedContribution.comentarios_admin && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Comentarios del Moderador
                      </h3>
                      <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
                        <p className="text-slate-900 dark:text-white mb-3">{selectedContribution.comentarios_admin}</p>
                        {selectedContribution.perfiles && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">
                                {selectedContribution.perfiles.nombre_completo.charAt(0)}
                              </span>
                            </div>
                            <span>— {selectedContribution.perfiles.nombre_completo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Información Adicional */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Información Adicional
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-slate-600 dark:text-slate-300">ID de Contribución</label>
                        <p className="text-slate-900 dark:text-white font-mono text-xs">{selectedContribution.id}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600 dark:text-slate-300">Estado Actual</label>
                        <p className="text-slate-900 dark:text-white capitalize">{selectedContribution.estado}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-6 py-3 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
