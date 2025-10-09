'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp,
  MessageCircle,
  Clock,
  Star,
  RefreshCw,
  Grid,
  List,
  ChevronDown,
  X,
  Users,
  Heart,
  Share2,
  Eye,
  Zap,
  Sparkles,
  Globe,
  BookOpen,
  Coffee,
  Lightbulb,
  AlertCircle,
  Bug,
  Settings,
  Target,
  Award,
  Activity,
  ArrowRight,
  Layers,
  Flame
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/navigation/Header';
import TemaCard from './components/TemaCard';
import CreateTemaModal from './components/CreateTemaModal';

interface Tema {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria: string;
  creador: {
    id: string;
    nombre_completo: string;
    username: string;
    url_avatar?: string;
  };
  estado: 'activo' | 'cerrado' | 'archivado';
  participantes_count: number;
  respuestas_count: number;
  ultima_actividad: string;
  fecha_creacion: string;
  contador_likes: number;
  compartido_contador: number;
  trending_score: number;
}

type SortType = 'trending' | 'newest' | 'oldest' | 'most_liked' | 'most_responses';
type ViewType = 'grid' | 'list';
type FilterType = 'all' | 'suggestion' | 'question' | 'issue' | 'bug_report' | 'feature_request';

export default function ComunidadPage() {
  const { user, loading, apiCall, refreshTokenFix } = useAuth();
  const router = useRouter();

  const [temas, setTemas] = useState<Tema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('trending');
  const [filterBy, setFilterBy] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Mostrar notificación
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch temas
  const fetchTemas = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiCall(`/api/temas?sort=${sortBy}&filter=${filterBy}&search=${encodeURIComponent(searchTerm)}`);

      if (response.ok) {
        const result = await response.json();
        setTemas(result.data || []);
      } else {
        showNotification('error', 'Error al cargar los temas de conversación');
      }
    } catch (error) {
      console.error('Error fetching temas:', error);
      showNotification('error', 'Error de conexión al cargar los temas');
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, filterBy, searchTerm, apiCall]);

  // Effects
  useEffect(() => {
    fetchTemas();
  }, [fetchTemas]);

  // Handle like
  const handleLike = async (temaId: string) => {
    if (!user) {
      showNotification('error', 'Debes iniciar sesión para dar like');
      return;
    }

    try {
      const response = await apiCall(`/api/temas/${temaId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        
        // Actualizar el tema en la lista
        setTemas(prev => prev.map(tema => 
          tema.id === temaId 
            ? { 
                ...tema, 
                contador_likes: result.data.action === 'liked' 
                  ? tema.contador_likes + 1 
                  : Math.max(0, tema.contador_likes - 1)
              } 
            : tema
        ));
        
        if (result.data.action === 'liked') {
          showNotification('success', '+1 like ❤️');
        } else {
          showNotification('success', 'Like removido');
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showNotification('error', 'Error al procesar el voto');
    }
  };

  // Handle share
  const handleShare = async (temaId: string) => {
    if (!user) {
      showNotification('error', 'Debes iniciar sesión para compartir');
      return;
    }

    try {
      const tema = temas.find(t => t.id === temaId);
      if (!tema) return;

      // Compartir usando Web Share API si está disponible
      if (navigator.share) {
        await navigator.share({
          title: tema.titulo,
          text: tema.descripcion || 'Tema de conversación en Nahuatl Web',
          url: `${window.location.origin}/comunidad/tema/${temaId}`
        });
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(`${window.location.origin}/comunidad/tema/${temaId}`);
        showNotification('success', 'Enlace copiado al portapapeles');
      }

      // Actualizar contador en backend
      await apiCall(`/api/temas/${temaId}/share`, {
        method: 'POST',
      });

      // Actualizar contador localmente
      setTemas(prev => prev.map(tema => 
        tema.id === temaId 
          ? { ...tema, compartido_contador: tema.compartido_contador + 1 }
          : tema
      ));

    } catch (error) {
      console.error('Error sharing tema:', error);
      showNotification('error', 'Error al compartir');
    }
  };

  // Handle tema update
  const handleTemaUpdate = (temaId: string, updates: any) => {
    setTemas(prev => prev.map(tema => 
      tema.id === temaId 
        ? { ...tema, ...updates }
        : tema
    ));
  };

  // Handle create tema success
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchTemas();
    showNotification('success', 'Tema de conversación creado exitosamente');
  };

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/20 dark:from-blue-900/10 dark:to-purple-900/10"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10 animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10 animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10 animate-pulse" style={{animationDuration: '8s', animationDelay: '4s'}}></div>
        
        <Header />
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-8">
            {/* Hero Skeleton */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl w-2/3 mx-auto"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/2 mx-auto"></div>
                <div className="h-12 bg-gradient-to-r from-cyan-200 to-blue-200 dark:from-cyan-800 dark:to-blue-800 rounded-xl w-40 mx-auto"></div>
              </div>
            </motion.div>

            {/* Controls Skeleton */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-700/20 shadow-2xl"
            >
              <div className="animate-pulse space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                  <div className="h-12 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                  <div className="h-12 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                </div>
              </div>
            </motion.div>

            {/* Stats Skeleton */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/20 shadow-xl"
                >
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-gradient-to-r from-cyan-200 to-blue-200 dark:from-cyan-700 dark:to-blue-700 rounded-lg"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Temas Skeleton */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-700/20 shadow-2xl h-80"
                >
                  <div className="animate-pulse space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3"></div>
                      <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/5"></div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-16"></div>
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
                    </div>
                    <div className="flex justify-between pt-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const filteredTemas = temas.filter(tema => {
    const matchesSearch = tema.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tema.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || tema.categoria === filterBy;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Background Effects Modernos */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 via-transparent to-blue-50/30"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" 
           style={{ 
             backgroundColor: 'var(--color-primary)',
             animationDuration: '8s'
           }}></div>
      <div className="absolute top-0 -left-4 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" 
           style={{ 
             backgroundColor: 'var(--color-secondary)',
             animationDuration: '12s', 
             animationDelay: '2s'
           }}></div>
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" 
           style={{ 
             backgroundColor: 'var(--color-accent)',
             animationDuration: '10s', 
             animationDelay: '4s'
           }}></div>
      
      <Header />
      
      {/* Enhanced Notification System */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-20 right-4 z-50"
          >
            <div className={`card relative p-4 shadow-xl backdrop-blur-xl ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`} style={{
              backgroundColor: notification.type === 'success' 
                ? 'var(--color-success)' + '20'
                : 'var(--color-error)' + '20',
              borderColor: notification.type === 'success' 
                ? 'var(--color-success)'
                : 'var(--color-error)',
              color: notification.type === 'success' 
                ? 'var(--color-success)'
                : 'var(--color-error)'
            }}>
              <div className="flex items-center gap-3">
                {notification.type === 'success' ? (
                  <Sparkles className="w-5 h-5 animate-spin" />
                ) : (
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                )}
                <span className="font-medium">{notification.message}</span>
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/10 to-transparent opacity-50 pointer-events-none"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section with Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Badge moderno */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center px-4 py-2 rounded-full mb-8"
              style={{ 
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
                border: `1px solid var(--color-primary)`
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">Comunidad Activa • {temas.length} Temas</span>
            </motion.div>

            <h1 className="title-xl mb-6 leading-tight">
              <span style={{ color: 'var(--color-text)' }}>Conecta y Comparte en la </span>
              <span 
                className="bg-gradient-to-r bg-clip-text text-transparent font-bold"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent))`
                }}
              >
                Comunidad Náhuatl
              </span>
            </h1>
            
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-24 h-1 rounded-full"
                 style={{ backgroundColor: 'var(--color-accent)' }}></div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="subtitle mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Un espacio para hacer preguntas, compartir ideas y colaborar en la preservación 
            del náhuatl. Únete a la conversación y ayuda a que nuestra lengua florezca.
          </motion.p>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => setShowCreateModal(true)}
            className="button-primary text-lg px-10 py-4 rounded-xl shadow-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Plus className="w-5 h-5 mr-2 inline relative z-10" />
            <span className="relative z-10">Crear Nuevo Tema</span>
          </motion.button>
        </motion.div>

        {/* Advanced Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="card p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Enhanced Search */}
              <div className="flex-1 relative group">
                <div className="absolute inset-0 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ backgroundColor: 'var(--color-primary-light)' }}></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300" 
                          style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Buscar temas, palabras clave, categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-modern w-full pl-12 pr-12 py-4 text-base"
                  />
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Enhanced Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Smart Sort */}
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortType)}
                    className="input-modern appearance-none pr-10 min-w-[200px] cursor-pointer text-base"
                  >
                    <option value="trending">🔥 Tendencias</option>
                    <option value="newest">⏰ Más Recientes</option>
                    <option value="oldest">📚 Clásicos</option>
                    <option value="most_liked">❤️ Más Valorados</option>
                    <option value="most_responses">💬 Más Discutidos</option>
                  </select>
                  <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300" 
                             style={{ color: 'var(--color-text-secondary)' }} />
                </div>

                {/* Advanced Filter Button */}
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-3 ${
                    showFilters ? 'button-primary' : 'button-secondary'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  <span>Filtros</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* View Toggle with Icons */}
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                  <motion.button
                    onClick={() => setViewType('grid')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-3 transition-all duration-300 flex items-center gap-2 border-0 ${
                      viewType === 'grid' ? 'button-primary' : 'button-secondary'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                    <span className="hidden sm:inline">Grid</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setViewType('list')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-3 transition-all duration-300 flex items-center gap-2 border-0 ${
                      viewType === 'list' ? 'button-primary' : 'button-secondary'
                    }`}
                  >
                    <List className="w-5 h-5" />
                    <span className="hidden sm:inline">Lista</span>
                  </motion.button>
                </div>

                {/* Refresh with Animation */}
                <motion.button
                  onClick={fetchTemas}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="button-secondary px-4 py-3 disabled:opacity-50 group"
                >
                  <RefreshCw className={`w-5 h-5 transition-all duration-300 ${
                    isLoading ? 'animate-spin' : 'group-hover:rotate-180'
                  }`} style={{ color: 'var(--color-text-secondary)' }} />
                </motion.button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-6 border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Layers className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                      <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Categorías</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'all', label: 'Todos', icon: Globe },
                        { value: 'suggestion', label: 'Sugerencias', icon: Lightbulb },
                        { value: 'question', label: 'Preguntas', icon: BookOpen },
                        { value: 'issue', label: 'Problemas', icon: AlertCircle },
                        { value: 'bug_report', label: 'Errores', icon: Bug },
                        { value: 'feature_request', label: 'Funcionalidades', icon: Settings },
                      ].map((filter) => {
                        const IconComponent = filter.icon;
                        const isActive = filterBy === filter.value;
                        return (
                          <motion.button
                            key={filter.value}
                            onClick={() => setFilterBy(filter.value as FilterType)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                              isActive ? 'button-primary' : 'tag hover:opacity-80'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span>{filter.label}</span>
                            {isActive && <Sparkles className="w-3 h-3 animate-pulse" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Enhanced Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { 
              value: filteredTemas.length, 
              label: 'Temas Activos', 
              icon: Flame, 
              color: 'from-red-500 to-orange-500',
              bgColor: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'
            },
            { 
              value: filteredTemas.reduce((sum, tema) => sum + tema.respuestas_count, 0), 
              label: 'Respuestas', 
              icon: MessageCircle, 
              color: 'from-blue-500 to-cyan-500',
              bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
            },
            { 
              value: filteredTemas.reduce((sum, tema) => sum + tema.contador_likes, 0), 
              label: 'Likes', 
              icon: Heart, 
              color: 'from-pink-500 to-rose-500',
              bgColor: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20'
            },
            { 
              value: filteredTemas.reduce((sum, tema) => sum + tema.participantes_count, 0), 
              label: 'Participantes', 
              icon: Users, 
              color: 'from-purple-500 to-indigo-500',
              bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/20 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value.toLocaleString()}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                {stat.label}
              </p>
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Temas Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-700/20 shadow-2xl h-80"
                >
                  <div className="animate-pulse space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3"></div>
                      <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/5"></div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-16"></div>
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
                    </div>
                    <div className="flex justify-between pt-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredTemas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-12 border border-white/20 dark:border-slate-700/20 shadow-2xl max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  No hay temas de conversación
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
                  {searchTerm || filterBy !== 'all'
                    ? 'No se encontraron temas con los filtros aplicados'
                    : 'Sé el primero en crear un tema de conversación sobre náhuatl'
                  }
                </p>
                {(searchTerm || filterBy !== 'all') ? (
                  <motion.button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterBy('all');
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Limpiar filtros
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => setShowCreateModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-3 text-lg mx-auto"
                  >
                    <Plus className="w-6 h-6" />
                    Crear mi primer tema
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className={
              viewType === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-6'
            }>
              <AnimatePresence mode="wait">
                {filteredTemas.map((tema, index) => (
                  <motion.div
                    key={tema.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <TemaCard
                      tema={tema}
                      onLike={handleLike}
                      onShare={handleShare}
                      onTemaUpdate={handleTemaUpdate}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Tema Modal */}
      <CreateTemaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}