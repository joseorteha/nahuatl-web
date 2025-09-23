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
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Solicitudes de Unirse ({solicitudesUnion.length})
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Personas que quieren participar en el proyecto
        </p>
      </div>
      
      {solicitudesUnion.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 text-5xl mb-4">🤝</div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            No hay solicitudes pendientes
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            No se han recibido nuevas solicitudes.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {solicitudesUnion.map((solicitud) => (
            <div key={solicitud.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                 onClick={() => onSelectSolicitud(solicitud)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-slate-900 dark:text-white">
                      {solicitud.nombre}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      solicitud.tipo_union === 'maestro' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                        : solicitud.tipo_union === 'traductor'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : solicitud.tipo_union === 'contribuir'
                        ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300'
                        : 'bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-300'
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
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {solicitud.email}
                    {solicitud.telefono && ` • Tel: ${solicitud.telefono}`}
                  </p>
                  {solicitud.motivacion && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 line-clamp-2">
                      Motivación: {solicitud.motivacion}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
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
