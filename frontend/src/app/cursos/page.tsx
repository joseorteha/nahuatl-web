'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, Users, Clock, Star, Search, Filter, GraduationCap,
  ChevronRight, Play, Award, TrendingUp
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_portada?: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  categoria: string;
  duracion_total_minutos: number;
  profesor: {
    id: string;
    nombre_completo: string;
    url_avatar?: string;
  };
  estudiantes_inscritos: number;
  puntuacion_promedio: number;
  es_destacado: boolean;
  fecha_creacion: string;
  modulos: { count: number }[];
}

export default function CursosPublicosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroNivel, setFiltroNivel] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [ordenarPor, setOrdenarPor] = useState<string>('recientes');

  useEffect(() => {
    fetchCursos();
  }, [filtroNivel, filtroCategoria, ordenarPor]);

  const fetchCursos = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const params = new URLSearchParams();
      params.append('estado', 'publicado');

      if (filtroNivel !== 'todos') params.append('nivel', filtroNivel);
      if (filtroCategoria !== 'todos') params.append('categoria', filtroCategoria);
      // Solo filtrar por destacados si el usuario lo selecciona explícitamente
      // if (ordenarPor === 'destacados') params.append('destacados', 'true');

      const url = `${API_URL}/api/cursos?${params}`;
      console.log('🔍 Fetching cursos from:', url);
      
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Respuesta del servidor:', data);
        console.log('📚 Cursos recibidos:', data.cursos?.length || 0);
        let cursosFiltrados = data.cursos || [];

        // Aplicar búsqueda local
        if (busqueda.trim()) {
          const termino = busqueda.toLowerCase();
          cursosFiltrados = cursosFiltrados.filter((curso: Curso) =>
            curso.titulo.toLowerCase().includes(termino) ||
            curso.descripcion.toLowerCase().includes(termino) ||
            curso.profesor.nombre_completo.toLowerCase().includes(termino)
          );
        }

        // Ordenar
        switch (ordenarPor) {
          case 'destacados':
            cursosFiltrados.sort((a: Curso, b: Curso) => {
              if (a.es_destacado && !b.es_destacado) return -1;
              if (!a.es_destacado && b.es_destacado) return 1;
              return b.puntuacion_promedio - a.puntuacion_promedio;
            });
            break;
          case 'rating':
            cursosFiltrados.sort((a: Curso, b: Curso) => b.puntuacion_promedio - a.puntuacion_promedio);
            break;
          case 'estudiantes':
            cursosFiltrados.sort((a: Curso, b: Curso) => b.estudiantes_inscritos - a.estudiantes_inscritos);
            break;
          case 'recientes':
            cursosFiltrados.sort((a: Curso, b: Curso) =>
              new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
            );
            break;
        }

        console.log('✅ Cursos finales a mostrar:', cursosFiltrados.length);
        setCursos(cursosFiltrados);
      } else {
        console.error('❌ Error en respuesta:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error al obtener cursos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'principiante': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermedio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'avanzado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const categorias = [
    'todos', 'Idioma', 'Cultura', 'Historia', 'Arte', 'Ciencia', 'Tecnología', 'Otro'
  ];

  if (isLoading) {
    return (
      <>
        <ConditionalHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <ConditionalHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <GraduationCap className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-cyan-500" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4 px-4">
                Cursos Disponibles
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
                Explora nuestra colección de cursos en náhuatl y cultura mexicana.
                Aprende a tu ritmo con profesores expertos.
              </p>
            </motion.div>
          </div>

          {/* Estadísticas rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-cyan-500" />
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{cursos.length}</div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Cursos</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {cursos.reduce((acc, curso) => acc + curso.estudiantes_inscritos, 0)}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Estudiantes</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {cursos.length > 0 ? (cursos.reduce((acc, curso) => acc + curso.puntuacion_promedio, 0) / cursos.length).toFixed(1) : '0.0'}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Rating</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-green-500" />
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {cursos.filter(c => c.es_destacado).length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Destacados</div>
            </div>
          </motion.div>

          {/* Filtros y búsqueda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Búsqueda */}
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar cursos, profesores..."
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <select
                  value={filtroNivel}
                  onChange={(e) => setFiltroNivel(e.target.value)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm sm:text-base"
                >
                  <option value="todos">Todos los niveles</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>

                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm sm:text-base"
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'todos' ? 'Todas las categorías' : cat}
                    </option>
                  ))}
                </select>

                <select
                  value={ordenarPor}
                  onChange={(e) => setOrdenarPor(e.target.value)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm sm:text-base"
                >
                  <option value="destacados">Destacados</option>
                  <option value="rating">Mejor calificados</option>
                  <option value="estudiantes">Más estudiantes</option>
                  <option value="recientes">Más recientes</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Lista de cursos */}
          {cursos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No se encontraron cursos
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Intenta cambiar los filtros de búsqueda
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {cursos.map((curso, index) => (
                <motion.div
                  key={curso.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 group"
                >
                  {/* Imagen */}
                  <div className="relative h-40 sm:h-48 bg-gradient-to-br from-cyan-500 to-blue-500 overflow-hidden">
                    {curso.imagen_portada ? (
                      <img
                        src={curso.imagen_portada}
                        alt={curso.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white/50" />
                      </div>
                    )}

                    {/* Badge destacado */}
                    {curso.es_destacado && (
                      <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Star size={14} />
                        Destacado
                      </div>
                    )}

                    {/* Duración */}
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Clock size={14} />
                      {Math.floor(curso.duracion_total_minutos / 60)}h {curso.duracion_total_minutos % 60}m
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4 sm:p-6">
                    {/* Nivel y categoría */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelColor(curso.nivel)}`}>
                        {curso.nivel}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                        {curso.categoria}
                      </span>
                    </div>

                    {/* Título */}
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
                      {curso.titulo}
                    </h3>

                    {/* Descripción */}
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                      {curso.descripcion}
                    </p>

                    {/* Profesor */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        {curso.profesor.url_avatar ? (
                          <img
                            src={curso.profesor.url_avatar}
                            alt={curso.profesor.nombre_completo}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {curso.profesor.nombre_completo.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {curso.profesor.nombre_completo}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Profesor</p>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="flex items-center justify-between mb-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{curso.estudiantes_inscritos} estudiantes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500" />
                        <span>{curso.puntuacion_promedio.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={16} />
                        <span>{curso.modulos[0]?.count || 0} módulos</span>
                      </div>
                    </div>

                    {/* Botón */}
                    <Link
                      href={`/cursos/${curso.id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
                    >
                      Ver Curso
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
