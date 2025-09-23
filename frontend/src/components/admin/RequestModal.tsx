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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-slate-200/60 dark:border-slate-700/60 shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-white">
              Solicitud de Unirse
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xl sm:text-2xl p-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                <p className="text-sm sm:text-base text-slate-900 dark:text-white">{solicitud.nombre}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <p className="text-sm sm:text-base text-slate-900 dark:text-white break-all">{solicitud.email}</p>
              </div>
              {solicitud.telefono && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                  <p className="text-sm sm:text-base text-slate-900 dark:text-white">{solicitud.telefono}</p>
                </div>
              )}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
                <p className="text-sm sm:text-base text-slate-900 dark:text-white">{formatDate(solicitud.fecha_creacion)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Participación</label>
                <span className={`inline-block px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full ${
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
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nivel de Experiencia</label>
                <span className={`inline-block px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full ${
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
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Motivación</label>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 sm:p-4 rounded-md">
                  <p className="text-sm sm:text-base text-slate-900 dark:text-white whitespace-pre-wrap">{solicitud.motivacion}</p>
                </div>
              </div>
            )}

            {solicitud.habilidades && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Habilidades</label>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 sm:p-4 rounded-md">
                  <p className="text-sm sm:text-base text-slate-900 dark:text-white whitespace-pre-wrap">{solicitud.habilidades}</p>
                </div>
              </div>
            )}

            {solicitud.disponibilidad && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Disponibilidad</label>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 sm:p-4 rounded-md">
                  <p className="text-sm sm:text-base text-slate-900 dark:text-white whitespace-pre-wrap">{solicitud.disponibilidad}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="w-full sm:w-auto">
              <a
                href={`mailto:${solicitud.email}?subject=Re: Solicitud de participación en Nawatlahtol`}
                className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                📧 Contactar por Email
              </a>
            </div>
            <div className="w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors"
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
