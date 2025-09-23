// components/admin/MessagesTab.tsx
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

interface MessagesTabProps {
  mensajesContacto: MensajeContacto[];
  onSelectMensaje: (mensaje: MensajeContacto) => void;
  onMarkAsRead: (mensajeId: string) => void;
}

export default function MessagesTab({ mensajesContacto, onSelectMensaje, onMarkAsRead }: MessagesTabProps) {
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
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white">
          Mensajes de Contacto ({mensajesContacto.length})
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Mensajes pendientes de respuesta
        </p>
      </div>
      
      {mensajesContacto.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-slate-400 text-4xl sm:text-5xl mb-3 sm:mb-4">📨</div>
          <h3 className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 px-4">
            No hay mensajes pendientes
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base px-4">
            Todos los mensajes han sido atendidos.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {mensajesContacto.map((mensaje) => (
            <div key={mensaje.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                 onClick={() => onSelectMensaje(mensaje)}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Header con asunto y tipo */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h4 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white">
                      {mensaje.asunto}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full self-start ${
                      mensaje.tipo_contacto === 'chat' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : mensaje.tipo_contacto === 'email'
                        ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300'
                        : 'bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-300'
                    }`}>
                      {mensaje.tipo_contacto}
                    </span>
                  </div>
                  
                  {/* Información del remitente */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    <span className="font-medium">De:</span> {mensaje.nombre} ({mensaje.email})
                    {mensaje.telefono && (
                      <span className="block sm:inline sm:ml-2">
                        <span className="sm:hidden">Tel: </span>
                        <span className="hidden sm:inline">• Tel: </span>
                        {mensaje.telefono}
                      </span>
                    )}
                  </p>
                  
                  {/* Contenido del mensaje */}
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">
                    {mensaje.mensaje}
                  </p>
                  
                  {/* Fecha */}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(mensaje.fecha_creacion)}
                  </p>
                </div>
                
                {/* Botón de acción */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(mensaje.id);
                  }}
                  className="self-start sm:self-auto px-3 py-1.5 text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 rounded-md hover:bg-cyan-200 dark:hover:bg-cyan-800/50 transition-colors font-medium"
                >
                  Marcar Leído
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
