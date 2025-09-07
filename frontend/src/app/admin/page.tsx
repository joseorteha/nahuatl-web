'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import ContributionsTab from '@/components/admin/ContributionsTab';
import MessagesTab from '@/components/admin/MessagesTab';
import RequestsTab from '@/components/admin/RequestsTab';
import ContributionModal from '@/components/admin/ContributionModal';
import MessageModal from '@/components/admin/MessageModal';
import RequestModal from '@/components/admin/RequestModal';
import { obtenerMensajesNoLeidos, obtenerSolicitudesPendientes, marcarContactoComoLeido } from '@/lib/contactService';

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

interface AdminUser {
  id: string;
  email: string;
  rol?: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [contributions, setContributions] = useState<AdminContribution[]>([]);
  const [mensajesContacto, setMensajesContacto] = useState<MensajeContacto[]>([]);
  const [solicitudesUnion, setSolicitudesUnion] = useState<SolicitudUnion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contribuciones' | 'mensajes' | 'solicitudes'>('contribuciones');
  const [selectedContribution, setSelectedContribution] = useState<AdminContribution | null>(null);
  const [selectedMensaje, setSelectedMensaje] = useState<MensajeContacto | null>(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudUnion | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const loadContributions = useCallback(async (adminId: string) => {
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
  }, [API_URL]);

  const loadMensajesContacto = useCallback(async () => {
    try {
      const data = await obtenerMensajesNoLeidos();
      setMensajesContacto(data || []);
    } catch (error) {
      console.error('Error loading contact messages:', error);
    }
  }, []);

  const loadSolicitudesUnion = useCallback(async () => {
    try {
      const data = await obtenerSolicitudesPendientes();
      setSolicitudesUnion(data || []);
    } catch (error) {
      console.error('Error loading join requests:', error);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Verificar si es admin/moderador
      if (parsedUser.rol && ['admin', 'moderador'].includes(parsedUser.rol)) {
        loadContributions(parsedUser.id);
        loadMensajesContacto();
        loadSolicitudesUnion();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [loadContributions, loadMensajesContacto, loadSolicitudesUnion]);

  const handleReview = async (contributionId: string, estado: 'aprobada' | 'rechazada', reviewComment: string) => {
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

  const handleMarkAsRead = async (mensajeId: string) => {
    try {
      await marcarContactoComoLeido(mensajeId);
      await loadMensajesContacto();
      setSelectedMensaje(null);
    } catch (error) {
      console.error('Error marking message as read:', error);
      alert('Error al marcar como leído');
    }
  };

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

  if (!user || !user.rol || !['admin', 'moderador'].includes(user.rol)) {
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
              Gestionar contribuciones, mensajes de contacto y solicitudes de unirse.
            </p>
          </div>

          {/* Navegación por pestañas */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('contribuciones')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'contribuciones'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Contribuciones
                {contributions.filter(c => c.estado === 'pendiente').length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {contributions.filter(c => c.estado === 'pendiente').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('mensajes')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'mensajes'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Mensajes
                {mensajesContacto.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {mensajesContacto.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('solicitudes')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'solicitudes'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Solicitudes
                {solicitudesUnion.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {solicitudesUnion.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Contenido por pestañas */}
          {activeTab === 'contribuciones' && (
            <ContributionsTab 
              contributions={contributions}
              onSelectContribution={setSelectedContribution}
            />
          )}

          {activeTab === 'mensajes' && (
            <MessagesTab 
              mensajesContacto={mensajesContacto}
              onSelectMensaje={setSelectedMensaje}
              onMarkAsRead={handleMarkAsRead}
            />
          )}

          {activeTab === 'solicitudes' && (
            <RequestsTab 
              solicitudesUnion={solicitudesUnion}
              onSelectSolicitud={setSelectedSolicitud}
            />
          )}
        </div>
      </div>

      {/* Modales */}
      {selectedContribution && (
        <ContributionModal
          contribution={selectedContribution}
          onClose={() => setSelectedContribution(null)}
          onReview={handleReview}
          reviewing={reviewing}
        />
      )}

      {selectedMensaje && (
        <MessageModal
          mensaje={selectedMensaje}
          onClose={() => setSelectedMensaje(null)}
          onMarkAsRead={handleMarkAsRead}
        />
      )}

      {selectedSolicitud && (
        <RequestModal
          solicitud={selectedSolicitud}
          onClose={() => setSelectedSolicitud(null)}
        />
      )}
    </div>
  );
}
