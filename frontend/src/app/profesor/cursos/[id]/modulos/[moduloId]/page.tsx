'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, BookOpen, Settings } from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';
import { AgregarLeccionModal, LeccionesModulo } from '@/components/cursos';

interface Modulo {
  id: string;
  titulo: string;
  descripcion: string;
  orden_modulo: number;
  objetivos_modulo: string[];
  duracion_total_minutos: number;
}

export default function ModuloDetallePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cursoId = params.id as string;
  const moduloId = params.moduloId as string;

  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (user && moduloId) {
      fetchModulo();
    }
  }, [user, moduloId]);

  const fetchModulo = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/modulos/${moduloId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setModulo(data.modulo);
      } else {
        console.error('Error al obtener módulo');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeccionAgregada = () => {
    // Recargar las lecciones
    fetchModulo();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ConditionalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/profesor/cursos/${cursoId}/modulos`)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Módulos
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : modulo ? (
          <div className="space-y-6">
            {/* Header del Módulo */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {modulo.titulo}
                    </h1>
                  </div>
                  
                  {modulo.descripcion && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {modulo.descripcion}
                    </p>
                  )}

                  {modulo.objetivos_modulo && modulo.objetivos_modulo.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Objetivos del Módulo:
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {modulo.objetivos_modulo.map((objetivo, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                            {objetivo}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push(`/profesor/cursos/${cursoId}/modulos/${moduloId}/editar`)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Editar módulo"
                >
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Sección de Lecciones */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Lecciones del Módulo
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Gestiona las lecciones de este módulo
                  </p>
                </div>
                
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Lección
                </button>
              </div>

              {/* Lista de Lecciones */}
              <LeccionesModulo
                moduloId={moduloId}
                cursoId={cursoId}
                esProfesor={true}
                onActualizar={handleLeccionAgregada}
              />
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                💡 Consejos para gestionar lecciones:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• <strong>Vincular existente:</strong> Reutiliza lecciones del catálogo público</li>
                <li>• <strong>Crear exclusiva:</strong> Crea una lección única para este módulo</li>
                <li>• <strong>Lecciones exclusivas:</strong> Solo aparecen en este módulo y se eliminan con él</li>
                <li>• <strong>Lecciones públicas:</strong> Pueden usarse en múltiples módulos</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Módulo no encontrado</p>
          </div>
        )}
      </main>

      {/* Modal de Agregar Lección */}
      <AgregarLeccionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        moduloId={moduloId}
        cursoId={cursoId}
        onLeccionAgregada={handleLeccionAgregada}
      />
    </div>
  );
}
