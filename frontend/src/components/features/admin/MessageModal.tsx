// components/admin/MessageModal.tsx
'use client';

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

interface MessageModalProps {
  mensaje: MensajeContacto;
  onClose: () => void;
  onMarkAsRead: (mensajeId: string) => void;
}

export default function MessageModal({ mensaje, onClose, onMarkAsRead }: MessageModalProps) {
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
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-slate-200/60 dark:border-slate-700/60 shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-white">
              Mensaje de Contacto
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
                <p className="text-sm sm:text-base text-slate-900 dark:text-white">{mensaje.nombre}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <p className="text-sm sm:text-base text-slate-900 dark:text-white break-all">{mensaje.email}</p>
              </div>
              {mensaje.telefono && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                  <p className="text-sm sm:text-base text-slate-900 dark:text-white">{mensaje.telefono}</p>
                </div>
              )}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Contacto</label>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  mensaje.tipo_contacto === 'chat' 
                    ? 'bg-green-100 text-green-800'
                    : mensaje.tipo_contacto === 'email'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-300'
                }`}>
                  {mensaje.tipo_contacto}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asunto</label>
              <p className="text-sm sm:text-base text-slate-900 dark:text-white font-medium">{mensaje.asunto}</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mensaje</label>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 sm:p-4 rounded-md">
                <p className="text-sm sm:text-base text-slate-900 dark:text-white whitespace-pre-wrap">{mensaje.mensaje}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
                <p className="text-sm sm:text-base text-slate-900 dark:text-white">{formatDate(mensaje.fecha_creacion)}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estado</label>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  mensaje.estado === 'leido' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {mensaje.estado === 'leido' ? 'Leído' : 'Pendiente'}
                </span>
              </div>
            </div>

            {mensaje.agente_usuario && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Navegador</label>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 break-all">{mensaje.agente_usuario}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="w-full sm:w-auto">
              <a
                href={`mailto:${mensaje.email}?subject=Re: ${mensaje.asunto}`}
                className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                📧 Responder por Email
              </a>
            </div>
            <button
              onClick={() => onMarkAsRead(mensaje.id)}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Marcar como Leído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
