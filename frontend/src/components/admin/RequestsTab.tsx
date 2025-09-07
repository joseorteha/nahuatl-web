// components/admin/RequestsTab.tsx
'use client';

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

interface RequestsTabProps {
  solicitudesUnion: SolicitudUnion[];
  onSelectSolicitud: (solicitud: SolicitudUnion) => void;
}

export default function RequestsTab({ solicitudesUnion, onSelectSolicitud }: RequestsTabProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
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
                 onClick={() => onSelectSolicitud(solicitud)}>
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
  );
}
