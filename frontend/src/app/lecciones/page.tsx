'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Trophy, 
  Target, 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import ConditionalHeader from '@/components/ConditionalHeader';

interface Palabra {
  nahuatl: string;
  espanol: string;
  pronunciacion: string;
  ejemplo: string;
}

interface Ejercicio {
  tipo: string;
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
  explicacion: string;
}

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: string;
  duracion: string;
  categoria: string;
  palabras: Palabra[];
  ejercicios: Ejercicio[];
}

interface LeccionesData {
  lecciones: Leccion[];
}

export default function LeccionesPage() {
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeccion, setSelectedLeccion] = useState<Leccion | null>(null);
  const [currentEjercicio, setCurrentEjercicio] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string>('');
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [ejerciciosCompletados, setEjerciciosCompletados] = useState<boolean[]>([]);

  useEffect(() => {
    fetchLecciones();
  }, []);

  const fetchLecciones = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/lecciones`);
      const data: LeccionesData = await response.json();
      console.log('Datos recibidos:', data);
      setLecciones(data.lecciones || []);
    } catch (error) {
      console.error('Error al cargar lecciones:', error);
      setLecciones([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'principiante': return 'from-green-500 to-emerald-500';
      case 'intermedio': return 'from-blue-500 to-cyan-500';
      case 'avanzado': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'gramatica': return BookOpen;
      case 'numeros': return Target;
      case 'conversacion': return BookOpen;
      default: return BookOpen;
    }
  };

  const handleLeccionSelect = (leccion: Leccion) => {
    setSelectedLeccion(leccion);
    setCurrentEjercicio(0);
    setRespuestaSeleccionada('');
    setMostrarResultado(false);
    setPuntuacion(0);
    setEjerciciosCompletados(new Array(leccion.ejercicios.length).fill(false));
  };

  const handleRespuestaSubmit = () => {
    if (!selectedLeccion) return;
    
    const ejercicio = selectedLeccion.ejercicios[currentEjercicio];
    const esCorrecta = respuestaSeleccionada === ejercicio.respuesta_correcta;
    
    if (esCorrecta) {
      setPuntuacion(prev => prev + 1);
    }
    
    const nuevosCompletados = [...ejerciciosCompletados];
    nuevosCompletados[currentEjercicio] = esCorrecta;
    setEjerciciosCompletados(nuevosCompletados);
    setMostrarResultado(true);
  };

  const handleSiguienteEjercicio = () => {
    if (!selectedLeccion) return;
    
    if (currentEjercicio < selectedLeccion.ejercicios.length - 1) {
      setCurrentEjercicio(prev => prev + 1);
      setRespuestaSeleccionada('');
      setMostrarResultado(false);
    } else {
      setSelectedLeccion(null);
    }
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Lecciones Interactivas - Nawatlahtol</title>
          <meta name="description" content="Aprende náhuatl con lecciones interactivas y ejercicios estructurados. Desde principiante hasta avanzado." />
        </Head>
        <ConditionalHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-slate-600 dark:text-slate-400">Cargando lecciones...</p>
          </div>
        </div>
      </>
    );
  }

  if (selectedLeccion) {
    const ejercicio = selectedLeccion.ejercicios[currentEjercicio];
    const progreso = ((currentEjercicio + 1) / selectedLeccion.ejercicios.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <ConditionalHeader />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <button
              onClick={() => setSelectedLeccion(null)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a lecciones
            </button>
            
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {selectedLeccion.titulo}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedLeccion.descripcion}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    {selectedLeccion.duracion}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Trophy className="h-4 w-4" />
                    {puntuacion}/{selectedLeccion.ejercicios.length}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progreso}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Ejercicio {currentEjercicio + 1} de {selectedLeccion.ejercicios.length}
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-slate-700/50"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
              {ejercicio.pregunta}
            </h2>
            
            <div className="space-y-3 mb-6">
              {ejercicio.opciones.map((opcion, index) => (
                <button
                  key={index}
                  onClick={() => !mostrarResultado && setRespuestaSeleccionada(opcion)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    respuestaSeleccionada === opcion
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  } ${
                    mostrarResultado
                      ? opcion === ejercicio.respuesta_correcta
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : respuestaSeleccionada === opcion
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : ''
                      : ''
                  }`}
                  disabled={mostrarResultado}
                >
                  <div className="flex items-center gap-3">
                    {mostrarResultado && (
                      <>
                        {opcion === ejercicio.respuesta_correcta ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : respuestaSeleccionada === opcion ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : null}
                      </>
                    )}
                    <span className="text-slate-900 dark:text-slate-100">{opcion}</span>
                  </div>
                </button>
              ))}
            </div>

            {mostrarResultado && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6"
              >
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Explicación:</strong> {ejercicio.explicacion}
                </p>
              </motion.div>
            )}

            <div className="flex justify-between">
              {!mostrarResultado ? (
                <button
                  onClick={handleRespuestaSubmit}
                  disabled={!respuestaSeleccionada}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Verificar respuesta
                </button>
              ) : (
                <button
                  onClick={handleSiguienteEjercicio}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2"
                >
                  {currentEjercicio < selectedLeccion.ejercicios.length - 1 ? 'Siguiente' : 'Completar lección'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Lecciones Interactivas - Nawatlahtol</title>
        <meta name="description" content="Aprende náhuatl con lecciones interactivas y ejercicios estructurados. Desde principiante hasta avanzado." />
        <meta name="keywords" content="lecciones náhuatl, aprender náhuatl, ejercicios náhuatl, curso náhuatl" />
      </Head>
      
      <ConditionalHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        {/* Hero Section */}
        <motion.section
          className="relative py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden"
          initial="hidden"
          animate="show"
        >
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 sm:px-8 relative z-0 max-w-7xl">
            <motion.div className="text-center mb-16">
              {/* Badge */}
              <motion.div className="mb-8">
                <div className="inline-flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-300/20 dark:border-slate-600/20 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-full text-sm font-medium shadow-sm">
                  <Sparkles className="inline mr-2 text-cyan-500" size={16} />
                  Nemachtiliztli - Aprendizaje Estructurado
                </div>
              </motion.div>
              
              {/* Título principal */}
              <motion.h1
                className="text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-8"
              >
                <span className="block">Lecciones</span>
                <span className="relative block mt-2">
                  <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Interactivas
                  </span>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-80"></div>
                </span>
                <span className="block text-2xl lg:text-3xl font-light text-slate-600 dark:text-slate-400 mt-4">
                  Aprende náhuatl paso a paso
                </span>
              </motion.h1>

              {/* Subtítulo */}
              <motion.p
                className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-12 max-w-3xl mx-auto"
              >
                Domina la lengua de los <span className="font-medium text-cyan-600 dark:text-cyan-400">Mexihcah</span> con ejercicios estructurados, 
                desde conceptos básicos hasta expresiones avanzadas.
              </motion.p>

              {/* Stats */}
              <motion.div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-cyan-600 dark:text-cyan-400 mb-1">{lecciones.length}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Lecciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    {lecciones.reduce((total, leccion) => total + leccion.ejercicios.length, 0)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Ejercicios</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
                    {lecciones.reduce((total, leccion) => total + leccion.palabras.length, 0)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Palabras</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Lecciones Grid */}
        <section className="py-20 bg-white dark:bg-slate-950 transition-colors duration-500">
          <div className="container mx-auto px-6 sm:px-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 px-6 py-2 rounded-full text-sm font-medium mb-6 border border-cyan-200/50 dark:border-cyan-700/30">
                <Star size={16} className="mr-2" />
                Selecciona tu lección
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Tlen tikitakis
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400">
                Cada lección está diseñada para construir tu conocimiento paso a paso
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lecciones.map((leccion, index) => {
                const CategoriaIcon = getCategoriaIcon(leccion.categoria);
                
                return (
                  <motion.div
                    key={leccion.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -10,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group cursor-pointer"
                    onClick={() => handleLeccionSelect(leccion)}
                  >
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-8 border border-slate-200/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden">
                      {/* Efecto de brillo */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      {/* Header de la tarjeta */}
                      <div className="flex items-center justify-between mb-6">
                        <motion.div 
                          className={`w-16 h-16 bg-gradient-to-br ${getNivelColor(leccion.nivel)} rounded-2xl flex items-center justify-center shadow-lg`}
                          whileHover={{ rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <CategoriaIcon className="h-8 w-8 text-white" />
                        </motion.div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                        {leccion.titulo}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        {leccion.descripcion}
                      </p>
                      
                      {/* Stats de la lección */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          {leccion.duracion}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <BookOpen className="h-4 w-4" />
                          {leccion.palabras.length} palabras
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Target className="h-4 w-4" />
                          {leccion.ejercicios.length} ejercicios
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Trophy className="h-4 w-4" />
                          {leccion.nivel}
                        </div>
                      </div>
                      
                      {/* Footer de la tarjeta */}
                      <div className="flex items-center justify-between">
                        <span className="px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium border border-cyan-200/50 dark:border-cyan-700/30">
                          {leccion.nivel}
                        </span>
                        <motion.div
                          className="flex items-center text-cyan-600 dark:text-cyan-400 font-medium"
                          whileHover={{ x: 5 }}
                        >
                          Comenzar
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
