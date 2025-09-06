'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';

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

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [contributions, setContributions] = useState<AdminContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pendiente' | 'todas'>('pendiente');
  const [selectedContribution, setSelectedContribution] = useState<AdminContribution | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Verificar si es admin/moderador
      if (parsedUser.rol && ['admin', 'moderador'].includes(parsedUser.rol)) {
        loadContributions(parsedUser.id);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const loadContributions = async (adminId: string) => {
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
  };

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

  if (!user || !['admin', 'moderador'].includes(user.rol)) {
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
              Revisar y moderar contribuciones al diccionario.
            </p>
          </div>

          {/* Filtros */}
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

    </div>
  );
}
