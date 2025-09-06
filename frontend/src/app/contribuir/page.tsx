'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContributeWordForm from '@/components/ContributeWordForm';

interface UserContribution {
  id: string;
  word: string;
  definition: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'publicada';
  comentarios_admin?: string;
  fecha_creacion: string;
  fecha_revision?: string;
  perfiles?: {
    nombre_completo: string;
  };
}

export default function ContributePage() {
  const [user, setUser] = useState<any>(null);
  const [contributions, setContributions] = useState<UserContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contribute' | 'history'>('contribute');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com';

  useEffect(() => {
    // Obtener usuario del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadUserContributions(parsedUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserContributions = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/contributions/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setContributions(data);
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      aprobada: 'bg-green-100 text-green-800 border-green-200',
      rechazada: 'bg-red-100 text-red-800 border-red-200',
      publicada: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const labels = {
      pendiente: 'En Revisión',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada',
      publicada: 'Publicada'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[estado as keyof typeof styles] || styles.pendiente}`}>
        {labels[estado as keyof typeof labels] || estado}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Contribuir al Diccionario
            </h1>
            <p className="text-gray-600">
              Ayuda a expandir nuestro diccionario de náhuatl enviando nuevas palabras.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('contribute')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'contribute'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Nueva Contribución
                </button>
                
                {user && (
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'history'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Mis Contribuciones ({contributions.length})
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'contribute' && (
            <ContributeWordForm
              userId={user?.id}
              userEmail={user?.email}
              onSuccess={() => {
                if (user) loadUserContributions(user.id);
                setActiveTab('history');
              }}
            />
          )}

          {activeTab === 'history' && user && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Historial de Contribuciones
              </h2>

              {contributions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-5xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No tienes contribuciones aún
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Envía tu primera palabra al diccionario para comenzar.
                  </p>
                  <button
                    onClick={() => setActiveTab('contribute')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Contribuir Ahora
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {contributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {contribution.word}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {contribution.definition}
                          </p>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(contribution.estado)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>
                          Enviada: {formatDate(contribution.fecha_creacion)}
                        </span>
                        {contribution.fecha_revision && (
                          <span>
                            Revisada: {formatDate(contribution.fecha_revision)}
                          </span>
                        )}
                      </div>

                      {contribution.comentarios_admin && (
                        <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-200">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Comentarios del moderador:
                          </p>
                          <p className="text-sm text-gray-600">
                            {contribution.comentarios_admin}
                          </p>
                          {contribution.perfiles && (
                            <p className="text-xs text-gray-500 mt-1">
                              — {contribution.perfiles.nombre_completo}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
