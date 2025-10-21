'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter,
  Search,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  Heart,
  FileText,
  Timer,
  GraduationCap,
  Award
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';

interface SolicitudMaestro {
  id: string;
  usuario_id?: string;
  nombre_completo: string;
  email: string;
  especialidad_id: number;
  especialidad_otra?: string;
  experiencia: string;
  motivacion: string;
  propuesta_contenido: string;
  habilidades_especiales?: string;
  disponibilidad_horas: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_solicitud: string;
  fecha_revision?: string;
  comentarios_admin?: string;
  admin_revisor_id?: string;
  especialidades_maestros?: {
    nombre: string;
    descripcion: string;
    icono: string;
  };
}

interface ApiResponse {
  solicitudes: SolicitudMaestro[];
  totalCount: number;
  page: number;
  limit: number;
}

export default function AdminSolicitudesMaestroPage() {
  const { refreshUser } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudMaestro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudMaestro | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<'pendiente' | 'aprobada' | 'rechazada'>('pendiente');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const tokenData = localStorage.getItem('auth_tokens');
      const token = tokenData ? JSON.parse(tokenData).accessToken : null;
      
      console.log('🔍 Token Data:', tokenData ? 'Encontrado' : 'No encontrado');
      console.log('🎫 Token:', token ? `${token.substring(0, 20)}...` : 'AUSENTE');
      
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${API_URL}/api/solicitudes-maestros/admin?estado=${estadoFiltro}&page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar solicitudes');
      }
      
      const data = await response.json();
      setSolicitudes(data.solicitudes || []);
      setTotalPages(Math.ceil(data.totalCount / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [estadoFiltro, page]);

  const handleProcesarSolicitud = async (id: string, accion: 'aprobar' | 'rechazar', motivo?: string) => {
    try {
      setProcessing(id);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const tokenData = localStorage.getItem('auth_tokens');
      const token = tokenData ? JSON.parse(tokenData).accessToken : null;
      
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }
      
      const response = await fetch(`${API_URL}/api/solicitudes-maestros/${id}/procesar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accion, comentarios_admin: motivo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar solicitud');
      }

      // Si se aprobó la solicitud, refrescar los datos de todos los usuarios afectados
      if (accion === 'aprobar') {
        console.log('✅ Solicitud aprobada, refrescando datos del usuario...');
        // Refrescar los datos del usuario actual (admin) no es necesario, 
        // pero podríamos implementar un sistema de notificaciones
      }

      // Actualizar la lista
      await fetchSolicitudes();
      setSelectedSolicitud(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar solicitud');
    } finally {
      setProcessing(null);
    }
  };

  const filteredSolicitudes = solicitudes.filter(solicitud =>
    solicitud.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solicitud.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solicitud.especialidades_maestros?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solicitud.especialidad_otra?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'aprobada': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'rechazada': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Clock size={16} />;
      case 'aprobada': return <CheckCircle size={16} />;
      case 'rechazada': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading && solicitudes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <ConditionalHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <ConditionalHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
            <Users className="text-cyan-500" size={32} />
            Solicitudes de Maestro
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestiona las solicitudes de usuarios que quieren convertirse en maestros
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-lg border border-white/20 dark:border-slate-700/50"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Estado Filter */}
            <div className="flex gap-2">
              {(['pendiente', 'aprobada', 'rechazada'] as const).map((estado) => (
                <button
                  key={estado}
                  onClick={() => {
                    setEstadoFiltro(estado);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    estadoFiltro === estado
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {getEstadoIcon(estado)}
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, email o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full lg:w-80"
              />
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <XCircle size={24} className="text-red-500" />
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                {error === 'No hay token de autenticación' ? 'Acceso Restringido' : 'Error'}
              </h3>
            </div>
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error === 'No hay token de autenticación' 
                ? 'Necesitas iniciar sesión como administrador para acceder a esta sección.'
                : error
              }
            </p>
            {error === 'No hay token de autenticación' && (
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Volver al Inicio
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Solicitudes Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lista de Solicitudes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {filteredSolicitudes.length === 0 ? (
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-8 text-center shadow-lg border border-white/20 dark:border-slate-700/50">
                <Users className="mx-auto text-slate-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  No hay solicitudes
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  No se encontraron solicitudes {estadoFiltro}s
                </p>
              </div>
            ) : (
              filteredSolicitudes.map((solicitud) => (
                <motion.div
                  key={solicitud.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50 cursor-pointer transition-all duration-200 hover:shadow-xl ${
                    selectedSolicitud?.id === solicitud.id ? 'ring-2 ring-cyan-500' : ''
                  }`}
                  onClick={() => setSelectedSolicitud(solicitud)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        {solicitud.nombre_completo || 'Usuario sin nombre'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Mail size={14} />
                        {solicitud.email || 'Email no disponible'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getEstadoColor(solicitud.estado)}`}>
                      {getEstadoIcon(solicitud.estado)}
                      {solicitud.estado}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <BookOpen size={14} />
                      <span className="font-medium">Especialidad:</span>
                      {solicitud.especialidades_maestros?.nombre || solicitud.especialidad_otra || 'No especificada'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Timer size={14} />
                      <span className="font-medium">Disponibilidad:</span>
                      {solicitud.disponibilidad_horas}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Calendar size={14} />
                      <span className="font-medium">Solicitud:</span>
                      {formatDate(solicitud.fecha_solicitud)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Click para ver detalles
                    </span>
                    <Eye className="text-cyan-500" size={16} />
                  </div>
                </motion.div>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      page === pageNum
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Detalle de Solicitud */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="sticky top-8"
          >
            {selectedSolicitud ? (
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                      {selectedSolicitud.nombre_completo || 'Usuario sin nombre'}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${getEstadoColor(selectedSolicitud.estado)}`}>
                      {getEstadoIcon(selectedSolicitud.estado)}
                      {selectedSolicitud.estado}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Información de Contacto */}
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Mail className="text-cyan-500" size={20} />
                      Contacto
                    </h3>
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm"><span className="font-medium">Email:</span> {selectedSolicitud.email || 'No disponible'}</p>
                      <p className="text-sm"><span className="font-medium">Disponibilidad:</span> {selectedSolicitud.disponibilidad_horas}</p>
                    </div>
                  </div>

                  {/* Especialidad */}
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <BookOpen className="text-cyan-500" size={20} />
                      Especialidad
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm">{selectedSolicitud.especialidades_maestros?.nombre || selectedSolicitud.especialidad_otra || 'No especificada'}</p>
                      {selectedSolicitud.especialidades_maestros?.descripcion && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {selectedSolicitud.especialidades_maestros.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Experiencia */}
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <GraduationCap className="text-cyan-500" size={20} />
                      Experiencia
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap">{selectedSolicitud.experiencia}</p>
                    </div>
                  </div>

                  {/* Motivación */}
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Heart className="text-cyan-500" size={20} />
                      Motivación
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap">{selectedSolicitud.motivacion}</p>
                    </div>
                  </div>

                  {/* Propuesta de Contenido */}
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <FileText className="text-cyan-500" size={20} />
                      Propuesta de Contenido
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap">{selectedSolicitud.propuesta_contenido}</p>
                    </div>
                  </div>

                  {/* Habilidades Especiales */}
                  {selectedSolicitud.habilidades_especiales && (
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <Award className="text-cyan-500" size={20} />
                        Habilidades Especiales
                      </h3>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <p className="text-sm whitespace-pre-wrap">{selectedSolicitud.habilidades_especiales}</p>
                      </div>
                    </div>
                  )}

                  {/* Fechas */}
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Calendar className="text-cyan-500" size={20} />
                      Fechas
                    </h3>
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm"><span className="font-medium">Solicitud:</span> {formatDate(selectedSolicitud.fecha_solicitud)}</p>
                      {selectedSolicitud.fecha_revision && (
                        <p className="text-sm"><span className="font-medium">Revisión:</span> {formatDate(selectedSolicitud.fecha_revision)}</p>
                      )}
                    </div>
                  </div>

                  {/* Comentarios del Admin */}
                  {selectedSolicitud.comentarios_admin && (
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                        Comentarios del Administrador
                      </h3>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <p className="text-sm whitespace-pre-wrap">{selectedSolicitud.comentarios_admin}</p>
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  {selectedSolicitud.estado === 'pendiente' && (
                    <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <motion.button
                        onClick={() => handleProcesarSolicitud(selectedSolicitud.id, 'aprobar')}
                        disabled={processing === selectedSolicitud.id}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {processing === selectedSolicitud.id ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle size={20} />
                            Aprobar
                          </>
                        )}
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleProcesarSolicitud(selectedSolicitud.id, 'rechazar')}
                        disabled={processing === selectedSolicitud.id}
                        className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium py-3 px-4 rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {processing === selectedSolicitud.id ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <XCircle size={20} />
                            Rechazar
                          </>
                        )}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-8 text-center shadow-lg border border-white/20 dark:border-slate-700/50">
                <Eye className="mx-auto text-slate-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Selecciona una solicitud
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Haz clic en una solicitud de la lista para ver los detalles completos
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}