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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Mensaje de Contacto
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <p className="text-sm text-gray-900">{mensaje.nombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{mensaje.email}</p>
              </div>
              {mensaje.telefono && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <p className="text-sm text-gray-900">{mensaje.telefono}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Contacto</label>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  mensaje.tipo_contacto === 'chat' 
                    ? 'bg-green-100 text-green-800'
                    : mensaje.tipo_contacto === 'email'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {mensaje.tipo_contacto}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Asunto</label>
              <p className="text-sm text-gray-900 font-medium">{mensaje.asunto}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mensaje</label>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{mensaje.mensaje}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <p className="text-sm text-gray-900">{formatDate(mensaje.fecha_creacion)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
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
                <label className="block text-sm font-medium text-gray-700">Navegador</label>
                <p className="text-xs text-gray-600">{mensaje.agente_usuario}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div>
              <a
                href={`mailto:${mensaje.email}?subject=Re: ${mensaje.asunto}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                📧 Responder por Email
              </a>
            </div>
            <button
              onClick={() => onMarkAsRead(mensaje.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Marcar como Leído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
