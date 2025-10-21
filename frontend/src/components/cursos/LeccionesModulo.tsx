'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, CheckCircle, Lock, MoreVertical, Trash2, Edit, Loader2 } from 'lucide-react';

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  duracion_estimada: number;
  orden_en_modulo: number;
  es_obligatoria: boolean;
  es_exclusiva_modulo: boolean;
  progreso?: {
    estado_leccion: string;
    fecha_completada: string;
  };
  completada?: boolean;
}

interface LeccionesModuloProps {
  moduloId: string;
  cursoId: string;
  esProfesor?: boolean;
  onActualizar?: () => void;
}

export default function LeccionesModulo({ moduloId, cursoId, esProfesor = false, onActualizar }: LeccionesModuloProps) {
  const router = useRouter();
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    fetchLecciones();
  }, [moduloId]);

  const fetchLecciones = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/modulos/${moduloId}/lecciones`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLecciones(data.lecciones || []);
      }
    } catch (error) {
      console.error('Error al obtener lecciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const abrirLeccion = (leccionId: string) => {
    // Navegar con contexto
    router.push(`/lecciones/${leccionId}?from=modulo&moduloId=${moduloId}&cursoId=${cursoId}`);
  };

  const desvincularLeccion = async (leccionId: string) => {
    if (!confirm('¿Estás seguro de desvincular esta lección del módulo?')) return;

    setEliminando(leccionId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/modulos/${moduloId}/lecciones/${leccionId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setLecciones(lecciones.filter(l => l.id !== leccionId));
        onActualizar?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al desvincular lección');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al desvincular lección');
    } finally {
      setEliminando(null);
      setMenuAbierto(null);
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'principiante': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermedio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'avanzado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (lecciones.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No hay lecciones en este módulo
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {esProfesor ? 'Agrega lecciones para comenzar' : 'El profesor aún no ha agregado lecciones'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lecciones.map((leccion, index) => (
        <div
          key={leccion.id}
          className={`relative p-4 border rounded-lg transition-all ${
            leccion.completada
              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary dark:hover:border-primary'
          }`}
        >
          <div className="flex items-start gap-4">
            {/* Número de orden */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              leccion.completada
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {leccion.completada ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>

            {/* Contenido */}
            <div 
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => abrirLeccion(leccion.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {leccion.titulo}
                    {leccion.es_exclusiva_modulo && (
                      <span className="ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded">
                        📌 Exclusiva
                      </span>
                    )}
                    {leccion.completada && (
                      <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded">
                        ✅ Completada
                      </span>
                    )}
                  </h4>
                  
                  {leccion.descripcion && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {leccion.descripcion}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                      {leccion.categoria}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getNivelColor(leccion.nivel)}`}>
                      {leccion.nivel}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {leccion.duracion_estimada} min
                    </span>
                    {leccion.es_obligatoria && (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded">
                        Obligatoria
                      </span>
                    )}
                  </div>
                </div>

                {/* Menú de opciones (solo profesor) */}
                {esProfesor && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuAbierto(menuAbierto === leccion.id ? null : leccion.id);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {menuAbierto === leccion.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            desvincularLeccion(leccion.id);
                          }}
                          disabled={eliminando === leccion.id}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 disabled:opacity-50"
                        >
                          {eliminando === leccion.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Desvinculando...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Desvincular
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
