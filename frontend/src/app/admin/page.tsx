'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, MessageCircle, FileText, Shield } from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import ContributionsTab from '@/components/features/admin/ContributionsTab';
import MessagesTab from '@/components/features/admin/MessagesTab';
import RequestsTab from '@/components/features/admin/RequestsTab';
import ContributionModal from '@/components/features/admin/ContributionModal';
import MessageModal from '@/components/features/admin/MessageModal';
import RequestModal from '@/components/features/admin/RequestModal';
import { obtenerMensajesNoLeidos, obtenerSolicitudesPendientes, marcarContactoComoLeido } from '@/services/api/contactService';
import { useAuthBackend } from '@/hooks/useAuthBackend';

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

export default function AdminPage() {
  const { user: authUser, loading: authLoading } = useAuthBackend();
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
    if (authLoading) return; // Esperar a que termine de cargar
    
    if (!authUser) {
      setLoading(false);
      return;
    }
    
    // Verificar si es admin/moderador usando el perfil del hook useAuth
    if (authUser.rol && ['admin', 'moderador'].includes(authUser.rol)) {
      loadContributions(authUser.id);
      loadMensajesContacto();
      loadSolicitudesUnion();
    } else {
      setLoading(false);
    }
  }, [authUser, authLoading, loadContributions, loadMensajesContacto, loadSolicitudesUnion]);

  const handleReview = async (contributionId: string, estado: 'aprobada' | 'rechazada', reviewComment: string) => {
    if (!authUser?.id) return;

    setReviewing(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/contributions/${contributionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: authUser.id,
          estado,
          comentarios_admin: reviewComment.trim() || null
        })
      });

      if (response.ok) {
        await loadContributions(authUser.id);
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <ConditionalHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <div className="w-12 h-12 border-4 border-cyan-600/20 border-t-cyan-600 rounded-full"></div>
            </motion.div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Cargando panel de administración...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authUser || !authUser.rol || !['admin', 'moderador'].includes(authUser.rol)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <ConditionalHeader />
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
              Acceso Denegado
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              No tienes permisos para acceder al panel de administración.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <ConditionalHeader />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 dark:from-cyan-400/10 dark:to-blue-400/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Panel de Administración
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Gestiona contribuciones, mensajes de contacto y solicitudes de unión desde un solo lugar.
            </p>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FileText className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {contributions.filter(c => c.estado === 'pendiente').length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Contribuciones Pendientes</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{mensajesContacto.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Mensajes Nuevos</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="h-6 w-6 text-slate-600 dark:text-slate-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{solicitudesUnion.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Solicitudes Pendientes</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setActiveTab('contribuciones')}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'contribuciones'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <FileText className="h-5 w-5" />
                <span>Contribuciones</span>
                {contributions.filter(c => c.estado === 'pendiente').length > 0 && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {contributions.filter(c => c.estado === 'pendiente').length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('mensajes')}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'mensajes'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                <span>Mensajes</span>
                {mensajesContacto.length > 0 && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {mensajesContacto.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('solicitudes')}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'solicitudes'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Solicitudes</span>
                {solicitudesUnion.length > 0 && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {solicitudesUnion.length}
                  </span>
                )}
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
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
