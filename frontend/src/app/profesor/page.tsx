'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  BookOpen, 
  Plus, 
  Users, 
  BarChart3, 
  Calendar,
  FileText,
  Video,
  Image,
  Globe,
  Edit,
  Eye,
  Trash2,
  Clock,
  Star,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmModal from '@/components/modals/ConfirmModal';

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  estado: 'borrador' | 'publicada' | 'archivada';
  estudiantes_completados: number;
  puntuacion_promedio: number;
  fecha_creacion: string;
  fecha_publicacion?: string;
  duracion_estimada: number;
}

interface EstadisticasProfesor {
  total_lecciones: number;
  lecciones_publicadas: number;
  estudiantes_totales: number;
  puntuacion_promedio: number;
  lecciones_recientes: Leccion[];
}

export default function PanelProfesorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [estadisticas, setEstadisticas] = useState<EstadisticasProfesor | null>(null);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [leccionesFiltradas, setLeccionesFiltradas] = useState<Leccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'lecciones' | 'estadisticas'>('overview');
  
  // Estados para eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leccionToDelete, setLeccionToDelete] = useState<Leccion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para notificaciones
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todas');
  const [filterNivel, setFilterNivel] = useState<string>('todos');

  useEffect(() => {
    if (!loading && user) {
      fetchDatosProfesor();
    }
  }, [user, loading]);

  useEffect(() => {
    // Aplicar filtros y búsqueda
    let filtered = [...lecciones];
    
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterEstado !== 'todas') {
      filtered = filtered.filter(l => l.estado === filterEstado);
    }
    
    if (filterNivel !== 'todos') {
      filtered = filtered.filter(l => l.nivel === filterNivel);
    }
    
    setLeccionesFiltradas(filtered);
  }, [lecciones, searchTerm, filterEstado, filterNivel]);

  useEffect(() => {
    // Mostrar notificación de éxito si viene de otra página
    const success = searchParams?.get('success');
    if (success === 'leccion-creada') {
      showNotification('success', '✅ Lección creada exitosamente');
    } else if (success === 'leccion-eliminada') {
      showNotification('success', '✅ Lección eliminada exitosamente');
    }
  }, [searchParams]);

  const fetchDatosProfesor = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken : null;
      
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      // Fetch estadísticas del profesor
      const statsResponse = await fetch(`${API_URL}/api/lecciones/profesor/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('📊 Estadísticas recibidas:', statsData);
        setEstadisticas(statsData);
      } else {
        console.error('❌ Error al obtener estadísticas:', statsResponse.status);
      }

      // Fetch lecciones del profesor
      const leccionesResponse = await fetch(`${API_URL}/api/lecciones/profesor/mis-lecciones`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (leccionesResponse.ok) {
        const leccionesData = await leccionesResponse.json();
        console.log('📚 Lecciones recibidas:', leccionesData);
        setLecciones(leccionesData.lecciones || []);
      } else {
        console.error('❌ Error al obtener lecciones:', leccionesResponse.status);
      }
    } catch (error) {
      console.error('Error al cargar datos del profesor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDeleteClick = (leccion: Leccion) => {
    setLeccionToDelete(leccion);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leccionToDelete) return;
    
    setIsDeleting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') 
        ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
        : null;
      
      const response = await fetch(`${API_URL}/api/lecciones/${leccionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Actualizar lista local
        setLecciones(prev => prev.filter(l => l.id !== leccionToDelete.id));
        setShowDeleteModal(false);
        setLeccionToDelete(null);
        showNotification('success', '✅ Lección eliminada exitosamente');
        // Recargar estadísticas
        fetchDatosProfesor();
      } else {
        const error = await response.json();
        showNotification('error', `❌ Error: ${error.error || 'No se pudo eliminar'}`);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      showNotification('error', '❌ Error de conexión');
    } finally {
      setIsDeleting(false);
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'principiante': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermedio': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'avanzado': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'publicada': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'borrador': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archivada': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading || isLoading) {
    return (
      <>
        <ConditionalHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-slate-600 dark:text-slate-400">Cargando panel de profesor...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user || user.rol !== 'profesor') {
    return (
      <>
        <ConditionalHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center p-8"
          >
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Acceso Restringido
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Solo los profesores pueden acceder a este panel. Si deseas ser profesor, solicita acceso desde tu perfil.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
            >
              Volver al Dashboard
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <ConditionalHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header del Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  🎓 Panel de Profesor
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Bienvenido, {user.nombre_completo}. Gestiona tus lecciones y contenido educativo.
                </p>
              </div>
              <Link
                href="/profesor/crear-leccion"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                Nueva Lección
              </Link>
            </div>
          </motion.div>

          {/* Navegación por pestañas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-2 border border-slate-200/50 dark:border-slate-700/50">
              {[
                { id: 'overview', label: 'Vista General', icon: BarChart3 },
                { id: 'lecciones', label: 'Mis Lecciones', icon: BookOpen },
                { id: 'estadisticas', label: 'Estadísticas', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Contenido según pestaña activa */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: BookOpen,
                      label: 'Total Lecciones',
                      value: estadisticas?.total_lecciones || 0,
                      color: 'from-blue-500 to-blue-600',
                      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
                    },
                    {
                      icon: Eye,
                      label: 'Publicadas',
                      value: estadisticas?.lecciones_publicadas || 0,
                      color: 'from-green-500 to-green-600',
                      bgColor: 'bg-green-50 dark:bg-green-900/20'
                    },
                    {
                      icon: Users,
                      label: 'Estudiantes',
                      value: estadisticas?.estudiantes_totales || 0,
                      color: 'from-purple-500 to-purple-600',
                      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
                    },
                    {
                      icon: Star,
                      label: 'Puntuación',
                      value: estadisticas?.puntuacion_promedio?.toFixed(1) || '0.0',
                      color: 'from-yellow-500 to-yellow-600',
                      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`${stat.bgColor} rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {stat.label}
                          </p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Lecciones recientes */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    Lecciones Recientes
                  </h3>
                  
                  {estadisticas?.lecciones_recientes && estadisticas.lecciones_recientes.length > 0 ? (
                    <div className="space-y-4">
                      {estadisticas.lecciones_recientes.slice(0, 3).map((leccion) => (
                        <div key={leccion.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              {leccion.titulo}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {leccion.descripcion?.substring(0, 80)}...
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelColor(leccion.nivel)}`}>
                                {leccion.nivel}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(leccion.estado)}`}>
                                {leccion.estado}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/profesor/estudiantes/${leccion.id}`}
                              className="p-2 text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors"
                              title="Ver estudiantes"
                            >
                              <Users size={16} />
                            </Link>
                            <Link
                              href={`/profesor/editar-leccion/${leccion.id}`}
                              className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">
                        Aún no has creado ninguna lección.
                      </p>
                      <Link
                        href="/profesor/crear-leccion"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        <Plus size={16} />
                        Crear tu primera lección
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'lecciones' && (
              <div className="space-y-6">
                {/* Barra de búsqueda y filtros */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Buscar lecciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={filterEstado}
                      onChange={(e) => setFilterEstado(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="todas">Todos los estados</option>
                      <option value="publicada">Publicadas</option>
                      <option value="borrador">Borradores</option>
                      <option value="archivada">Archivadas</option>
                    </select>
                    <select
                      value={filterNivel}
                      onChange={(e) => setFilterNivel(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="todos">Todos los niveles</option>
                      <option value="principiante">Principiante</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                    Mostrando {leccionesFiltradas.length} de {lecciones.length} lecciones
                  </p>
                </div>

                {leccionesFiltradas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {leccionesFiltradas.map((leccion) => (
                      <motion.div
                        key={leccion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                            {leccion.titulo}
                          </h3>
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/profesor/estudiantes/${leccion.id}`}
                              className="p-2 text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors"
                              title="Ver estudiantes"
                            >
                              <Users size={16} />
                            </Link>
                            <Link
                              href={`/profesor/editar-leccion/${leccion.id}`}
                              className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Editar lección"
                            >
                              <Edit size={16} />
                            </Link>
                            <button 
                              onClick={() => handleDeleteClick(leccion)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Eliminar lección"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {leccion.descripcion}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelColor(leccion.nivel)}`}>
                              {leccion.nivel}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(leccion.estado)}`}>
                              {leccion.estado}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <Users size={16} />
                              {leccion.estudiantes_completados} estudiantes
                            </div>
                            <div className="flex items-center gap-2">
                              <Star size={16} />
                              {leccion.puntuacion_promedio.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      No hay lecciones aún
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Crea tu primera lección para empezar a enseñar náhuatl.
                    </p>
                    <Link
                      href="/profesor/crear-leccion"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
                    >
                      <Plus size={20} />
                      Crear Lección
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'estadisticas' && (
              <div className="space-y-6">
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    Estadísticas Detalladas
                  </h3>
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      Las estadísticas detalladas estarán disponibles próximamente.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Notificación Global */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`px-6 py-4 rounded-lg shadow-2xl border ${
              notification.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300'
            }`}>
              {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setLeccionToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar Lección?"
        message={`Estás a punto de eliminar "${leccionToDelete?.titulo}". Esta acción no se puede deshacer y eliminará todos los recursos, quizzes y progreso de estudiantes asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
