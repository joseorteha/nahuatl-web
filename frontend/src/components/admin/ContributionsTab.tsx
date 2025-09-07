// components/admin/ContributionsTab.tsx
'use client';

import { useState } from 'react';

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

interface ContributionsTabProps {
  contributions: AdminContribution[];
  onSelectContribution: (contribution: AdminContribution) => void;
}

export default function ContributionsTab({ contributions, onSelectContribution }: ContributionsTabProps) {
  const [filter, setFilter] = useState<'pendiente' | 'todas'>('pendiente');

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

  return (
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
                        onClick={() => onSelectContribution(contribution)}
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
  );
}
