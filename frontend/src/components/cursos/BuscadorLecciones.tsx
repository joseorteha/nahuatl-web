'use client';

import { useState, useEffect } from 'react';
import { Search, Clock, Award, BookOpen, Loader2 } from 'lucide-react';

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  duracion_estimada: number;
  estudiantes_completados: number;
  puntuacion_promedio: number;
  profesor: {
    nombre_completo: string;
  };
}

interface BuscadorLeccionesProps {
  moduloId: string;
  onLeccionVinculada: () => void;
}

export default function BuscadorLecciones({ moduloId, onLeccionVinculada }: BuscadorLeccionesProps) {
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [nivel, setNivel] = useState('todos');
  const [isLoading, setIsLoading] = useState(false);
  const [vinculando, setVinculando] = useState<string | null>(null);

  useEffect(() => {
    fetchLecciones();
  }, [categoria, nivel]);

  const fetchLecciones = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('estado', 'publicada');
      if (categoria !== 'todas') params.append('categoria', categoria);
      if (nivel !== 'todos') params.append('nivel', nivel);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/lecciones?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

  const vincularLeccion = async (leccionId: string) => {
    setVinculando(leccionId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/modulos/${moduloId}/lecciones/vincular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          leccion_id: leccionId,
          orden_en_modulo: 1,
          es_obligatoria: true
        })
      });

      if (response.ok) {
        onLeccionVinculada();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al vincular lección');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al vincular lección');
    } finally {
      setVinculando(null);
    }
  };

  const leccionesFiltradas = lecciones.filter(leccion =>
    leccion.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    leccion.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'principiante': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermedio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'avanzado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar lecciones..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
        >
          <option value="todas">Todas las categorías</option>
          <option value="numeros">Números</option>
          <option value="colores">Colores</option>
          <option value="familia">Familia</option>
          <option value="naturaleza">Naturaleza</option>
          <option value="gramatica">Gramática</option>
          <option value="cultura">Cultura</option>
          <option value="vocabulario">Vocabulario</option>
        </select>
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
        >
          <option value="todos">Todos los niveles</option>
          <option value="principiante">Principiante</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </select>
      </div>

      {/* Lista de lecciones */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : leccionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron lecciones</p>
          </div>
        ) : (
          leccionesFiltradas.map(leccion => (
            <div
              key={leccion.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary transition-colors bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                    {leccion.titulo}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {leccion.descripcion}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
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
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Award className="w-3 h-3" />
                      {leccion.puntuacion_promedio?.toFixed(1) || '0.0'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <BookOpen className="w-3 h-3" />
                      {leccion.estudiantes_completados} completaron
                    </span>
                  </div>

                  {leccion.profesor && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Por: {leccion.profesor.nombre_completo}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => vincularLeccion(leccion.id)}
                  disabled={vinculando === leccion.id}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {vinculando === leccion.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Vinculando...
                    </>
                  ) : (
                    'Vincular'
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
