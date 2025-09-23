// components/admin/RequestModal.tsx
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

interface RequestModalProps {
  solicitud: SolicitudUnion;
  onClose: () => void;
}

export default function RequestModal({ solicitud, onClose }: RequestModalProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/60 dark:border-slate-700/60 shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
              Solicitud de Unirse
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                <p className="text-sm text-slate-900 dark:text-white">{solicitud.nombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <p className="text-sm text-slate-900 dark:text-white">{solicitud.email}</p>
              </div>
              {solicitud.telefono && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                  <p className="text-sm text-slate-900 dark:text-white">{solicitud.telefono}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
                <p className="text-sm text-slate-900 dark:text-white">{formatDate(solicitud.fecha_creacion)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Participación</label>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  solicitud.tipo_union === 'maestro' 
                    ? 'bg-purple-100 text-purple-800'
                    : solicitud.tipo_union === 'traductor'
                    ? 'bg-green-100 text-green-800'
                    : solicitud.tipo_union === 'contribuir'
                    ? 'bg-blue-100 text-blue-800'
                    : solicitud.tipo_union === 'voluntario'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {solicitud.tipo_union === 'registro' && 'Registro'}
                  {solicitud.tipo_union === 'contribuir' && 'Contribuir'}
                  {solicitud.tipo_union === 'comunidad' && 'Comunidad'}
                  {solicitud.tipo_union === 'voluntario' && 'Voluntario'}
                  {solicitud.tipo_union === 'maestro' && 'Maestro'}
                  {solicitud.tipo_union === 'traductor' && 'Traductor'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nivel de Experiencia</label>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  solicitud.nivel_experiencia === 'nativo' 
                    ? 'bg-green-100 text-green-800'
                    : solicitud.nivel_experiencia === 'avanzado'
                    ? 'bg-blue-100 text-blue-800'
                    : solicitud.nivel_experiencia === 'intermedio'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {solicitud.nivel_experiencia === 'principiante' && 'Principiante'}
                  {solicitud.nivel_experiencia === 'intermedio' && 'Intermedio'}
                  {solicitud.nivel_experiencia === 'avanzado' && 'Avanzado'}
                  {solicitud.nivel_experiencia === 'nativo' && 'Hablante Nativo'}
                </span>
              </div>
            </div>

            {solicitud.motivacion && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Motivación</label>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{solicitud.motivacion}</p>
                </div>
              </div>
            )}

            {solicitud.habilidades && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Habilidades</label>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{solicitud.habilidades}</p>
                </div>
              </div>
            )}

            {solicitud.disponibilidad && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Disponibilidad</label>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{solicitud.disponibilidad}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div>
              <a
                href={`mailto:${solicitud.email}?subject=Re: Solicitud de participación en Nawatlahtol`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                📧 Contactar por Email
              </a>
            </div>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
