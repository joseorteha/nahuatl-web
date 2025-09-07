'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { obtenerMensajesNoLeidos, obtenerSolicitudesPendientes, marcarContactoComoLeido } from '@/lib/contactService';

interface AdminContribution {
  id: string;
  word: string;
  definition: string;
  info_gramatical: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'publicada';
  fecha_creacion: string;
  fecha_revision?: string;
  razon_contribucion?: string;
  fuente?: string;
  nivel_confianza: string;
  comentarios_admin?: string;
  perfiles: {
    nombre_completo: string;
    email: string;
    username?: string;
  };
  admin_revisor?: {
    nombre_completo: string;
  };
}

interface MensajeContacto {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  tipo_contacto: string;
  estado: string;
  fecha_creacion: string;
  fecha_leido?: string;
  agente_usuario?: string;
  url_referencia?: string;
}

interface SolicitudUnion {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  tipo_union: string;
  nivel_experiencia: string;
  motivacion?: string;
  habilidades?: string;
  disponibilidad?: string;
  estado: string;
  fecha_creacion: string;
}

interface AdminUser {
  id: string;
  email: string;
  rol?: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [contributions, setContributions] = useState<AdminContribution[]>([]);
  const [mensajesContacto, setMensajesContacto] = useState<MensajeContacto[]>([]);
  const [solicitudesUnion, setSolicitudesUnion] = useState<SolicitudUnion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pendiente' | 'todas'>('pendiente');
  const [activeTab, setActiveTab] = useState<'contribuciones' | 'mensajes' | 'solicitudes'>('contribuciones');
  const [selectedContribution, setSelectedContribution] = useState<AdminContribution | null>(null);
  const [selectedMensaje, setSelectedMensaje] = useState<MensajeContacto | null>(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudUnion | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const loadContributions = useCallback(async (adminId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/contributions?adminId=${adminId}`);
      if (response.ok) {
        const data = await response.json();
        setContributions(data);
      } else {
        console.error('Error loading contributions:', await response.json());
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const loadMensajesContacto = useCallback(async () => {
    try {
      const data = await obtenerMensajesNoLeidos();
      setMensajesContacto(data || []);
    } catch (error) {
      console.error('Error loading contact messages:', error);
    }
  }, []);

  const loadSolicitudesUnion = useCallback(async () => {
    try {
      const data = await obtenerSolicitudesPendientes();
      setSolicitudesUnion(data || []);
    } catch (error) {
      console.error('Error loading join requests:', error);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Verificar si es admin/moderador
      if (parsedUser.rol && ['admin', 'moderador'].includes(parsedUser.rol)) {
        loadContributions(parsedUser.id);
        loadMensajesContacto();
        loadSolicitudesUnion();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [loadContributions, loadMensajesContacto, loadSolicitudesUnion]);

  const handleReview = async (contributionId: string, estado: 'aprobada' | 'rechazada') => {
    if (!user?.id) return;

    setReviewing(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/contributions/${contributionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          estado,
          comentarios_admin: reviewComment.trim() || null
        })
      });

      if (response.ok) {
        await loadContributions(user.id);
        setSelectedContribution(null);
        setReviewComment('');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error reviewing contribution:', error);
      alert('Error de conexión');
    } finally {
      setReviewing(false);
    }
  };

  const handleMarkAsRead = async (mensajeId: string) => {
    try {
      await marcarContactoComoLeido(mensajeId);
      await loadMensajesContacto();
      setSelectedMensaje(null);
    } catch (error) {
      console.error('Error marking message as read:', error);
      alert('Error al marcar como leído');
    }
  };

  const getStatusBadge = (estado: string) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      aprobada: 'bg-green-100 text-green-800 border-green-200',
      rechazada: 'bg-red-100 text-red-800 border-red-200',
      publicada: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const labels = {
      pendiente: 'Pendiente',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada',
      publicada: 'Publicada'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[estado as keyof typeof styles] || styles.pendiente}`}>
        {labels[estado as keyof typeof labels] || estado}
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

  const filteredContributions = filter === 'pendiente' 
    ? contributions.filter(c => c.estado === 'pendiente')
    : contributions;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !user.rol || !['admin', 'moderador'].includes(user.rol)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <div className="text-red-400 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600">
              No tienes permisos para acceder al panel de administración.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600">
              Gestionar contribuciones, mensajes de contacto y solicitudes de unirse.
            </p>
          </div>

          {/* Navegación por pestañas */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('contribuciones')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'contribuciones'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Contribuciones
                {contributions.filter(c => c.estado === 'pendiente').length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {contributions.filter(c => c.estado === 'pendiente').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('mensajes')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'mensajes'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Mensajes
                {mensajesContacto.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {mensajesContacto.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('solicitudes')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'solicitudes'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Solicitudes
                {solicitudesUnion.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {solicitudesUnion.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Contenido por pestañas */}
          {activeTab === 'contribuciones' && (
            <>
              {/* Filtros para contribuciones */}
              <div className="mb-6 flex space-x-4">
                <button
                  onClick={() => setFilter('pendiente')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    filter === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pendientes ({contributions.filter(c => c.estado === 'pendiente').length})
                </button>
                <button
                  onClick={() => setFilter('todas')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    filter === 'todas'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Todas ({contributions.length})
                </button>
              </div>

              {/* Lista de contribuciones */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredContributions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {filter === 'pendiente' ? 'No hay contribuciones pendientes' : 'No hay contribuciones'}
                </h3>
                <p className="text-gray-500">
                  {filter === 'pendiente' 
                    ? 'Todas las contribuciones han sido revisadas.' 
                    : 'No se han recibido contribuciones aún.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Palabra
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contribuidor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContributions.map((contribution) => (
                      <tr key={contribution.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {contribution.word}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {contribution.definition}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {contribution.perfiles.nombre_completo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {contribution.perfiles.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(contribution.estado)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(contribution.fecha_creacion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedContribution(contribution)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </>
          )}

          {/* Pestaña de Mensajes de Contacto */}
          {activeTab === 'mensajes' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Mensajes de Contacto ({mensajesContacto.length})
                </h3>
                <p className="text-sm text-gray-600">
                  Mensajes pendientes de respuesta
                </p>
              </div>
              
              {mensajesContacto.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">📨</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No hay mensajes pendientes
                  </h3>
                  <p className="text-gray-500">
                    Todos los mensajes han sido atendidos.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {mensajesContacto.map((mensaje) => (
                    <div key={mensaje.id} className="p-6 hover:bg-gray-50 cursor-pointer"
                         onClick={() => setSelectedMensaje(mensaje)}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {mensaje.asunto}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              mensaje.tipo_contacto === 'chat' 
                                ? 'bg-green-100 text-green-800'
                                : mensaje.tipo_contacto === 'email'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {mensaje.tipo_contacto}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            De: {mensaje.nombre} ({mensaje.email})
                            {mensaje.telefono && ` • Tel: ${mensaje.telefono}`}
                          </p>
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {mensaje.mensaje}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(mensaje.fecha_creacion)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(mensaje.id);
                          }}
                          className="ml-4 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                        >
                          Marcar Leído
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pestaña de Solicitudes de Unirse */}
          {activeTab === 'solicitudes' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Solicitudes de Unirse ({solicitudesUnion.length})
                </h3>
                <p className="text-sm text-gray-600">
                  Personas que quieren participar en el proyecto
                </p>
              </div>
              
              {solicitudesUnion.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">🤝</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No hay solicitudes pendientes
                  </h3>
                  <p className="text-gray-500">
                    No se han recibido nuevas solicitudes.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {solicitudesUnion.map((solicitud) => (
                    <div key={solicitud.id} className="p-6 hover:bg-gray-50 cursor-pointer"
                         onClick={() => setSelectedSolicitud(solicitud)}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {solicitud.nombre}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              solicitud.tipo_union === 'maestro' 
                                ? 'bg-purple-100 text-purple-800'
                                : solicitud.tipo_union === 'traductor'
                                ? 'bg-green-100 text-green-800'
                                : solicitud.tipo_union === 'contribuir'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {solicitud.tipo_union}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              solicitud.nivel_experiencia === 'nativo' 
                                ? 'bg-green-100 text-green-800'
                                : solicitud.nivel_experiencia === 'avanzado'
                                ? 'bg-blue-100 text-blue-800'
                                : solicitud.nivel_experiencia === 'intermedio'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {solicitud.nivel_experiencia}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {solicitud.email}
                            {solicitud.telefono && ` • Tel: ${solicitud.telefono}`}
                          </p>
                          {solicitud.motivacion && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                              Motivación: {solicitud.motivacion}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(solicitud.fecha_creacion)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedContribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Revisar Contribución: {selectedContribution.word}
                </h3>
                <button
                  onClick={() => setSelectedContribution(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Información de la Palabra</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Palabra:</strong> {selectedContribution.word}</div>
                    <div><strong>Definición:</strong> {selectedContribution.definition}</div>
                    {selectedContribution.info_gramatical && (
                      <div><strong>Info Gramatical:</strong> {selectedContribution.info_gramatical}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Información del Contribuidor</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nombre:</strong> {selectedContribution.perfiles.nombre_completo}</div>
                    <div><strong>Email:</strong> {selectedContribution.perfiles.email}</div>
                    <div><strong>Nivel de Confianza:</strong> {selectedContribution.nivel_confianza}</div>
                    <div><strong>Fecha:</strong> {formatDate(selectedContribution.fecha_creacion)}</div>
                  </div>
                </div>
              </div>

              {selectedContribution.razon_contribucion && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Razón de la Contribución</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedContribution.razon_contribucion}
                  </p>
                </div>
              )}

              {selectedContribution.fuente && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Fuente</h4>
                  <p className="text-sm text-gray-600">
                    {selectedContribution.fuente}
                  </p>
                </div>
              )}

              {selectedContribution.estado === 'pendiente' && (
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-700 mb-3">Comentarios de Revisión</h4>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Comentarios opcionales para el contribuidor..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  />

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleReview(selectedContribution.id, 'rechazada')}
                      disabled={reviewing}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {reviewing ? 'Procesando...' : 'Rechazar'}
                    </button>
                    <button
                      onClick={() => handleReview(selectedContribution.id, 'aprobada')}
                      disabled={reviewing}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {reviewing ? 'Procesando...' : 'Aprobar y Publicar'}
                    </button>
                  </div>
                </div>
              )}

              {selectedContribution.estado !== 'pendiente' && selectedContribution.comentarios_admin && (
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-700 mb-2">Comentarios del Moderador</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedContribution.comentarios_admin}
                  </p>
                  {selectedContribution.admin_revisor && (
                    <p className="text-xs text-gray-500 mt-2">
                      — {selectedContribution.admin_revisor.nombre_completo}
                      {selectedContribution.fecha_revision && ` • ${formatDate(selectedContribution.fecha_revision)}`}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de mensaje de contacto */}
      {selectedMensaje && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Mensaje de Contacto
                </h3>
                <button
                  onClick={() => setSelectedMensaje(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-sm text-gray-900">{selectedMensaje.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedMensaje.email}</p>
                  </div>
                  {selectedMensaje.telefono && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="text-sm text-gray-900">{selectedMensaje.telefono}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Contacto</label>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedMensaje.tipo_contacto === 'chat' 
                        ? 'bg-green-100 text-green-800'
                        : selectedMensaje.tipo_contacto === 'email'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedMensaje.tipo_contacto}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Asunto</label>
                  <p className="text-sm text-gray-900 font-medium">{selectedMensaje.asunto}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mensaje</label>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMensaje.mensaje}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedMensaje.fecha_creacion)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedMensaje.estado === 'leido' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedMensaje.estado === 'leido' ? 'Leído' : 'Pendiente'}
                    </span>
                  </div>
                </div>

                {selectedMensaje.agente_usuario && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Navegador</label>
                    <p className="text-xs text-gray-600">{selectedMensaje.agente_usuario}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <div>
                  <a
                    href={`mailto:${selectedMensaje.email}?subject=Re: ${selectedMensaje.asunto}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    📧 Responder por Email
                  </a>
                </div>
                <button
                  onClick={() => handleMarkAsRead(selectedMensaje.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Marcar como Leído
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de solicitud de unirse */}
      {selectedSolicitud && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Solicitud de Unirse
                </h3>
                <button
                  onClick={() => setSelectedSolicitud(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-sm text-gray-900">{selectedSolicitud.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedSolicitud.email}</p>
                  </div>
                  {selectedSolicitud.telefono && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="text-sm text-gray-900">{selectedSolicitud.telefono}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedSolicitud.fecha_creacion)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Participación</label>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      selectedSolicitud.tipo_union === 'maestro' 
                        ? 'bg-purple-100 text-purple-800'
                        : selectedSolicitud.tipo_union === 'traductor'
                        ? 'bg-green-100 text-green-800'
                        : selectedSolicitud.tipo_union === 'contribuir'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedSolicitud.tipo_union === 'voluntario'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedSolicitud.tipo_union === 'registro' && 'Registro'}
                      {selectedSolicitud.tipo_union === 'contribuir' && 'Contribuir'}
                      {selectedSolicitud.tipo_union === 'comunidad' && 'Comunidad'}
                      {selectedSolicitud.tipo_union === 'voluntario' && 'Voluntario'}
                      {selectedSolicitud.tipo_union === 'maestro' && 'Maestro'}
                      {selectedSolicitud.tipo_union === 'traductor' && 'Traductor'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nivel de Experiencia</label>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      selectedSolicitud.nivel_experiencia === 'nativo' 
                        ? 'bg-green-100 text-green-800'
                        : selectedSolicitud.nivel_experiencia === 'avanzado'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedSolicitud.nivel_experiencia === 'intermedio'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedSolicitud.nivel_experiencia === 'principiante' && 'Principiante'}
                      {selectedSolicitud.nivel_experiencia === 'intermedio' && 'Intermedio'}
                      {selectedSolicitud.nivel_experiencia === 'avanzado' && 'Avanzado'}
                      {selectedSolicitud.nivel_experiencia === 'nativo' && 'Hablante Nativo'}
                    </span>
                  </div>
                </div>

                {selectedSolicitud.motivacion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Motivación</label>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedSolicitud.motivacion}</p>
                    </div>
                  </div>
                )}

                {selectedSolicitud.habilidades && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Habilidades</label>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedSolicitud.habilidades}</p>
                    </div>
                  </div>
                )}

                {selectedSolicitud.disponibilidad && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Disponibilidad</label>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedSolicitud.disponibilidad}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <div>
                  <a
                    href={`mailto:${selectedSolicitud.email}?subject=Re: Solicitud de participación en Nawatlajtol`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    📧 Contactar por Email
                  </a>
                </div>
                <div className="space-x-3">
                  <button
                    onClick={() => setSelectedSolicitud(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
