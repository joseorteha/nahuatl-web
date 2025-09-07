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
                 onClick={() => onSelectMensaje(mensaje)}>
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
                    onMarkAsRead(mensaje.id);
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
  );
}
