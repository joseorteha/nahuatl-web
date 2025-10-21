'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  Video,
  Image as ImageIcon,
  Globe,
  FileText,
  HelpCircle,
  BookOpen,
  Target,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';

interface RecursoExterno {
  id: string;
  tipo: 'video_youtube' | 'imagen_drive' | 'audio_externo' | 'enlace_web';
  titulo: string;
  descripcion?: string;
  url: string;
  es_opcional: boolean;
  orden: number;
}

interface PreguntaQuiz {
  id: string;
  pregunta: string;
  tipo: 'multiple_choice' | 'verdadero_falso' | 'completar_texto';
  opciones: string[];
  respuesta_correcta: string;
  explicacion?: string;
  orden: number;
}

interface FormData {
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  contenido_texto: string;
  contenido_nahuatl?: string;
  objetivos_aprendizaje: string[];
  palabras_clave: string[];
  duracion_estimada: number;
  recursos_externos: RecursoExterno[];
  quiz_preguntas: PreguntaQuiz[];
}

export default function CrearLeccionPage() {
  const { user, loading, checkAndUpdateTeacherRole } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descripcion: '',
    categoria: '',
    nivel: 'principiante',
    contenido_texto: '',
    contenido_nahuatl: '',
    objetivos_aprendizaje: [],
    palabras_clave: [],
    duracion_estimada: 15,
    recursos_externos: [],
    quiz_preguntas: []
  });

  const [currentSection, setCurrentSection] = useState<'basico' | 'contenido' | 'recursos' | 'quiz' | 'preview'>('basico');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para añadir elementos
  const [newObjetivo, setNewObjetivo] = useState('');
  const [newPalabraClave, setNewPalabraClave] = useState('');
  const [showRecursoModal, setShowRecursoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Estado para nuevo recurso
  const [newRecurso, setNewRecurso] = useState<Partial<RecursoExterno>>({
    tipo: 'video_youtube',
    titulo: '',
    descripcion: '',
    url: '',
    es_opcional: false
  });

  // Estado para nueva pregunta de quiz
  const [newPregunta, setNewPregunta] = useState<Partial<PreguntaQuiz>>({
    tipo: 'multiple_choice',
    pregunta: '',
    opciones: ['', '', '', ''],
    respuesta_correcta: '',
    explicacion: ''
  });

  useEffect(() => {
    // Si el usuario está cargado pero no es profesor, verificar si tiene solicitudes aprobadas
    if (user && user.rol !== 'profesor' && user.rol !== 'admin') {
      console.log('🎓 Usuario no es profesor, verificando solicitudes aprobadas...');
      checkAndUpdateTeacherRole();
    }
  }, [user, checkAndUpdateTeacherRole]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addObjetivo = () => {
    if (newObjetivo.trim()) {
      handleInputChange('objetivos_aprendizaje', [...formData.objetivos_aprendizaje, newObjetivo.trim()]);
      setNewObjetivo('');
    }
  };

  const removeObjetivo = (index: number) => {
    handleInputChange('objetivos_aprendizaje', formData.objetivos_aprendizaje.filter((_, i) => i !== index));
  };

  const addPalabraClave = () => {
    if (newPalabraClave.trim()) {
      handleInputChange('palabras_clave', [...formData.palabras_clave, newPalabraClave.trim()]);
      setNewPalabraClave('');
    }
  };

  const removePalabraClave = (index: number) => {
    handleInputChange('palabras_clave', formData.palabras_clave.filter((_, i) => i !== index));
  };

  const addRecurso = () => {
    if (newRecurso.titulo && newRecurso.url) {
      const recurso: RecursoExterno = {
        id: Date.now().toString(),
        tipo: newRecurso.tipo as any,
        titulo: newRecurso.titulo,
        descripcion: newRecurso.descripcion || '',
        url: newRecurso.url,
        es_opcional: newRecurso.es_opcional || false,
        orden: formData.recursos_externos.length + 1
      };
      
      handleInputChange('recursos_externos', [...formData.recursos_externos, recurso]);
      setNewRecurso({
        tipo: 'video_youtube',
        titulo: '',
        descripcion: '',
        url: '',
        es_opcional: false
      });
      setShowRecursoModal(false);
    }
  };

  const removeRecurso = (id: string) => {
    handleInputChange('recursos_externos', formData.recursos_externos.filter(r => r.id !== id));
  };

  const addPregunta = () => {
    if (newPregunta.pregunta && newPregunta.respuesta_correcta) {
      const pregunta: PreguntaQuiz = {
        id: Date.now().toString(),
        pregunta: newPregunta.pregunta,
        tipo: newPregunta.tipo as any,
        opciones: newPregunta.tipo === 'multiple_choice' ? newPregunta.opciones?.filter(o => o.trim()) || [] : [],
        respuesta_correcta: newPregunta.respuesta_correcta,
        explicacion: newPregunta.explicacion || '',
        orden: formData.quiz_preguntas.length + 1
      };
      
      handleInputChange('quiz_preguntas', [...formData.quiz_preguntas, pregunta]);
      setNewPregunta({
        tipo: 'multiple_choice',
        pregunta: '',
        opciones: ['', '', '', ''],
        respuesta_correcta: '',
        explicacion: ''
      });
      setShowQuizModal(false);
    }
  };

  const removePregunta = (id: string) => {
    handleInputChange('quiz_preguntas', formData.quiz_preguntas.filter(p => p.id !== id));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulo.trim()) newErrors.titulo = 'El título es requerido';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.categoria.trim()) newErrors.categoria = 'La categoría es requerida';
    if (!formData.contenido_texto.trim()) newErrors.contenido_texto = 'El contenido es requerido';
    if (formData.objetivos_aprendizaje.length === 0) newErrors.objetivos_aprendizaje = 'Agrega al menos un objetivo de aprendizaje';
    if (formData.palabras_clave.length === 0) newErrors.palabras_clave = 'Agrega al menos una palabra clave';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken : null;
      
      if (!token) {
        console.error('❌ No hay token de autenticación');
        alert('Debes iniciar sesión para crear lecciones');
        setIsSubmitting(false);
        return;
      }
      
      // Filtrar recursos externos válidos (solo los que tengan título y URL)
      const recursosValidos = formData.recursos_externos.filter(r => 
        r.titulo && r.titulo.trim() && r.url && r.url.trim()
      ).map(r => ({
        tipo_recurso: r.tipo,
        titulo: r.titulo,
        url: r.url,
        descripcion: r.descripcion || '',
        es_opcional: r.es_opcional || false,
        orden_visualizacion: r.orden
      }));
      
      // Filtrar preguntas de quiz válidas (solo las que tengan pregunta y respuesta)
      const preguntasValidas = formData.quiz_preguntas.filter(p => 
        p.pregunta && p.pregunta.trim() && p.respuesta_correcta && p.respuesta_correcta.trim()
      ).map(p => ({
        pregunta: p.pregunta,
        tipo_pregunta: p.tipo,
        opciones: p.tipo === 'multiple_choice' ? 
          p.opciones.reduce((acc, opcion, idx) => {
            if (opcion && opcion.trim()) {
              acc[String.fromCharCode(65 + idx)] = opcion; // A, B, C, D
            }
            return acc;
          }, {} as Record<string, string>) : 
          null,
        respuesta_correcta: p.respuesta_correcta,
        explicacion: p.explicacion || '',
        orden_pregunta: p.orden
      }));
      
      const leccionData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        nivel: formData.nivel,
        contenido_texto: formData.contenido_texto,
        contenido_nahuatl: formData.contenido_nahuatl || '',
        objetivos_aprendizaje: formData.objetivos_aprendizaje,
        palabras_clave: formData.palabras_clave,
        duracion_estimada: formData.duracion_estimada,
        estado: isDraft ? 'borrador' : 'publicada',
        // Solo incluir si hay elementos válidos
        ...(recursosValidos.length > 0 && { recursos_externos: recursosValidos }),
        ...(preguntasValidas.length > 0 && { quiz_preguntas: preguntasValidas })
      };
      
      console.log('📤 Enviando lección:', leccionData);
      
      const response = await fetch(`${API_URL}/api/lecciones`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leccionData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Lección creada exitosamente:', data);
        router.push('/profesor?success=leccion-creada');
      } else {
        const error = await response.json();
        console.error('❌ Error al crear lección:', error);
        alert(`Error: ${error.error || 'No se pudo crear la lección'}`);
      }
    } catch (error) {
      console.error('❌ Error al crear lección:', error);
      alert('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionProgress = () => {
    const sections = ['basico', 'contenido', 'recursos', 'quiz', 'preview'];
    return ((sections.indexOf(currentSection) + 1) / sections.length) * 100;
  };

  const getRecursoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video_youtube': return Video;
      case 'imagen_drive': return ImageIcon;
      case 'audio_externo': return FileText;
      case 'enlace_web': return Globe;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <>
        <ConditionalHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-slate-600 dark:text-slate-400">Cargando editor...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user || user.rol !== 'profesor') {
    router.push('/dashboard');
    return null;
  }

  return (
    <>
      <ConditionalHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/profesor"
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <ArrowLeft size={20} />
                Volver al Panel
              </Link>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  ✨ Crear Nueva Lección
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Comparte tu conocimiento del náhuatl con estudiantes de todo el mundo.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  Guardar Borrador
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                >
                  <Eye size={16} />
                  Publicar Lección
                </button>
              </div>
            </div>
          </motion.div>

          {/* Barra de progreso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Progreso</span>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{Math.round(sectionProgress())}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${sectionProgress()}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Navegación lateral */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 sticky top-8">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Secciones</h3>
                <nav className="space-y-2">
                  {[
                    { id: 'basico', label: 'Información Básica', icon: FileText },
                    { id: 'contenido', label: 'Contenido', icon: BookOpen },
                    { id: 'recursos', label: 'Recursos Externos', icon: Globe },
                    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
                    { id: 'preview', label: 'Vista Previa', icon: Eye }
                  ].map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSection(section.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
                        currentSection === section.id
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <section.icon size={16} />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Contenido principal */}
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
                
                {/* Sección: Información Básica */}
                {currentSection === 'basico' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-purple-500" />
                        Información Básica
                      </h2>
                    </div>

                    {/* Título */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Título de la Lección *
                      </label>
                      <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => handleInputChange('titulo', e.target.value)}
                        placeholder="Ej: Saludos básicos en náhuatl"
                        className={`w-full px-4 py-3 rounded-lg border ${errors.titulo ? 'border-red-300' : 'border-slate-300'} dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                      />
                      {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Descripción *
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        placeholder="Describe brevemente lo que aprenderán los estudiantes..."
                        rows={4}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.descripcion ? 'border-red-300' : 'border-slate-300'} dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
                      />
                      {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Categoría */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Categoría *
                        </label>
                        <select
                          value={formData.categoria}
                          onChange={(e) => handleInputChange('categoria', e.target.value)}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.categoria ? 'border-red-300' : 'border-slate-300'} dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="vocabulario">Vocabulario</option>
                          <option value="gramatica">Gramática</option>
                          <option value="numeros">Números</option>
                          <option value="colores">Colores</option>
                          <option value="familia">Familia</option>
                          <option value="naturaleza">Naturaleza</option>
                          <option value="cultura">Cultura</option>
                        </select>
                        {errors.categoria && <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>}
                      </div>

                      {/* Nivel */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Nivel
                        </label>
                        <select
                          value={formData.nivel}
                          onChange={(e) => handleInputChange('nivel', e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                          <option value="principiante">Principiante</option>
                          <option value="intermedio">Intermedio</option>
                          <option value="avanzado">Avanzado</option>
                        </select>
                      </div>

                      {/* Duración */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Duración (minutos)
                        </label>
                        <input
                          type="number"
                          value={formData.duracion_estimada}
                          onChange={(e) => handleInputChange('duracion_estimada', parseInt(e.target.value) || 15)}
                          min="5"
                          max="120"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Objetivos de aprendizaje */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Objetivos de Aprendizaje *
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newObjetivo}
                          onChange={(e) => setNewObjetivo(e.target.value)}
                          placeholder="Ej: Aprender saludos básicos"
                          onKeyPress={(e) => e.key === 'Enter' && addObjetivo()}
                          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <button
                          onClick={addObjetivo}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      {formData.objetivos_aprendizaje.length > 0 && (
                        <div className="space-y-2">
                          {formData.objetivos_aprendizaje.map((objetivo, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <Target size={16} className="text-purple-500 flex-shrink-0" />
                              <span className="flex-1 text-slate-700 dark:text-slate-300">{objetivo}</span>
                              <button
                                onClick={() => removeObjetivo(index)}
                                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.objetivos_aprendizaje && <p className="text-red-500 text-sm mt-1">{errors.objetivos_aprendizaje}</p>}
                    </div>

                    {/* Palabras clave */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Palabras Clave *
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newPalabraClave}
                          onChange={(e) => setNewPalabraClave(e.target.value)}
                          placeholder="Ej: saludo, náhuatl, básico"
                          onKeyPress={(e) => e.key === 'Enter' && addPalabraClave()}
                          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <button
                          onClick={addPalabraClave}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      {formData.palabras_clave.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.palabras_clave.map((palabra, index) => (
                            <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                              <span>{palabra}</span>
                              <button
                                onClick={() => removePalabraClave(index)}
                                className="p-0.5 text-blue-500 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.palabras_clave && <p className="text-red-500 text-sm mt-1">{errors.palabras_clave}</p>}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => setCurrentSection('contenido')}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Siguiente: Contenido
                        <ArrowLeft className="rotate-180" size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Resto de las secciones... (continuará en la siguiente parte) */}
                {currentSection === 'contenido' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-purple-500" />
                        Contenido de la Lección
                      </h2>
                    </div>

                    {/* Contenido principal */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Contenido Principal *
                      </label>
                      <textarea
                        value={formData.contenido_texto}
                        onChange={(e) => handleInputChange('contenido_texto', e.target.value)}
                        placeholder="Escribe el contenido principal de tu lección aquí. Puedes incluir explicaciones, ejemplos, y cualquier información importante que los estudiantes necesiten saber..."
                        rows={12}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.contenido_texto ? 'border-red-300' : 'border-slate-300'} dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
                      />
                      {errors.contenido_texto && <p className="text-red-500 text-sm mt-1">{errors.contenido_texto}</p>}
                    </div>

                    {/* Contenido en náhuatl */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Contenido en Náhuatl (Opcional)
                      </label>
                      <textarea
                        value={formData.contenido_nahuatl}
                        onChange={(e) => handleInputChange('contenido_nahuatl', e.target.value)}
                        placeholder="Si deseas, incluye parte del contenido en náhuatl para una experiencia más inmersiva..."
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        💡 Consejo: El contenido en náhuatl ayuda a los estudiantes a familiarizarse con el idioma.
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentSection('basico')}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <ArrowLeft size={16} />
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentSection('recursos')}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Siguiente: Recursos
                        <ArrowLeft className="rotate-180" size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Sección: Recursos Externos */}
                {currentSection === 'recursos' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                        <Globe className="w-6 h-6 text-purple-500" />
                        Recursos Externos
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Agrega videos, imágenes, audios o enlaces web para enriquecer tu lección (opcional).
                      </p>
                    </div>

                    {/* Lista de recursos */}
                    {formData.recursos_externos.length > 0 && (
                      <div className="space-y-3">
                        {formData.recursos_externos.map((recurso, index) => {
                          const RecursoIcon = getRecursoIcon(recurso.tipo);
                          return (
                            <div key={recurso.id} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <RecursoIcon className="h-5 w-5 text-purple-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-900 dark:text-slate-100">{recurso.titulo}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{recurso.url}</p>
                              </div>
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                {recurso.tipo.replace('_', ' ')}
                              </span>
                              {recurso.es_opcional && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                  Opcional
                                </span>
                              )}
                              <button
                                onClick={() => removeRecurso(recurso.id)}
                                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Formulario para agregar recurso */}
                    {showRecursoModal && (
                      <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-purple-200 dark:border-purple-700/50">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Agregar Recurso Externo</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Tipo de Recurso
                            </label>
                            <select
                              value={newRecurso.tipo}
                              onChange={(e) => setNewRecurso({ ...newRecurso, tipo: e.target.value as any })}
                              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            >
                              <option value="video_youtube">Video de YouTube</option>
                              <option value="imagen_drive">Imagen de Drive</option>
                              <option value="audio_externo">Audio Externo</option>
                              <option value="enlace_web">Enlace Web</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Título del Recurso
                            </label>
                            <input
                              type="text"
                              value={newRecurso.titulo}
                              onChange={(e) => setNewRecurso({ ...newRecurso, titulo: e.target.value })}
                              placeholder="Ej: Video explicativo de saludos"
                              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              URL del Recurso
                            </label>
                            <input
                              type="url"
                              value={newRecurso.url}
                              onChange={(e) => setNewRecurso({ ...newRecurso, url: e.target.value })}
                              placeholder="https://..."
                              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Descripción (Opcional)
                            </label>
                            <textarea
                              value={newRecurso.descripcion}
                              onChange={(e) => setNewRecurso({ ...newRecurso, descripcion: e.target.value })}
                              placeholder="Breve descripción del recurso..."
                              rows={2}
                              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="es_opcional"
                              checked={newRecurso.es_opcional}
                              onChange={(e) => setNewRecurso({ ...newRecurso, es_opcional: e.target.checked })}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <label htmlFor="es_opcional" className="text-sm text-slate-700 dark:text-slate-300">
                              Este recurso es opcional
                            </label>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={addRecurso}
                              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                              Agregar Recurso
                            </button>
                            <button
                              onClick={() => setShowRecursoModal(false)}
                              className="px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botón para mostrar formulario */}
                    {!showRecursoModal && (
                      <button
                        onClick={() => setShowRecursoModal(true)}
                        className="w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-purple-500 hover:text-purple-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Agregar Recurso Externo
                      </button>
                    )}

                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentSection('contenido')}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <ArrowLeft size={16} />
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentSection('quiz')}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Siguiente: Quiz
                        <ArrowLeft className="rotate-180" size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Sección: Quiz */}
                {currentSection === 'quiz' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                        <HelpCircle className="w-6 h-6 text-purple-500" />
                        Quiz de Evaluación
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Crea preguntas para evaluar el aprendizaje de tus estudiantes (opcional).
                      </p>
                    </div>

                    {/* Lista de preguntas */}
                    {formData.quiz_preguntas.length > 0 && (
                      <div className="space-y-3">
                        {formData.quiz_preguntas.map((pregunta, index) => (
                          <div key={pregunta.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
                                    Pregunta {index + 1}
                                  </span>
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                    {pregunta.tipo.replace('_', ' ')}
                                  </span>
                                </div>
                                <h4 className="font-medium text-slate-900 dark:text-slate-100">{pregunta.pregunta}</h4>
                              </div>
                              <button
                                onClick={() => removePregunta(pregunta.id)}
                                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            {pregunta.tipo === 'multiple_choice' && pregunta.opciones.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {pregunta.opciones.map((opcion, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <div className={`w-4 h-4 rounded-full border-2 ${
                                      opcion === pregunta.respuesta_correcta
                                        ? 'bg-green-500 border-green-500'
                                        : 'border-slate-300 dark:border-slate-600'
                                    }`} />
                                    <span className={opcion === pregunta.respuesta_correcta ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-600 dark:text-slate-400'}>
                                      {opcion}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {pregunta.explicacion && (
                              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 italic">
                                💡 {pregunta.explicacion}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulario para agregar pregunta */}
                    {showQuizModal && (
                      <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-purple-200 dark:border-purple-700/50">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Agregar Pregunta de Quiz</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Tipo de Pregunta
                            </label>
                            <select
                              value={newPregunta.tipo}
                              onChange={(e) => setNewPregunta({ ...newPregunta, tipo: e.target.value as any })}
                              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            >
                              <option value="multiple_choice">Opción Múltiple</option>
                              <option value="verdadero_falso">Verdadero/Falso</option>
                              <option value="completar_texto">Completar Texto</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Pregunta
                            </label>
                            <textarea
                              value={newPregunta.pregunta}
                              onChange={(e) => setNewPregunta({ ...newPregunta, pregunta: e.target.value })}
                              placeholder="Escribe tu pregunta aquí..."
                              rows={3}
                              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none"
                            />
                          </div>

                          {newPregunta.tipo === 'multiple_choice' && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Opciones de Respuesta
                              </label>
                              {newPregunta.opciones?.map((opcion, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={opcion}
                                    onChange={(e) => {
                                      const nuevasOpciones = [...(newPregunta.opciones || [])];
                                      nuevasOpciones[idx] = e.target.value;
                                      setNewPregunta({ ...newPregunta, opciones: nuevasOpciones });
                                    }}
                                    placeholder={`Opción ${idx + 1}`}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Respuesta Correcta
                            </label>
                            {newPregunta.tipo === 'multiple_choice' ? (
                              <select
                                value={newPregunta.respuesta_correcta}
                                onChange={(e) => setNewPregunta({ ...newPregunta, respuesta_correcta: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                              >
                                <option value="">Selecciona la respuesta correcta</option>
                                {newPregunta.opciones?.filter(o => o.trim()).map((opcion, idx) => (
                                  <option key={idx} value={opcion}>{opcion}</option>
                                ))}
                              </select>
                            ) : newPregunta.tipo === 'verdadero_falso' ? (
                              <select
                                value={newPregunta.respuesta_correcta}
                                onChange={(e) => setNewPregunta({ ...newPregunta, respuesta_correcta: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                              >
                                <option value="">Selecciona...</option>
                                <option value="Verdadero">Verdadero</option>
                                <option value="Falso">Falso</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={newPregunta.respuesta_correcta}
                                onChange={(e) => setNewPregunta({ ...newPregunta, respuesta_correcta: e.target.value })}
                                placeholder="Escribe la respuesta correcta"
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                              />
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Explicación (Opcional)
                            </label>
                            <textarea
                              value={newPregunta.explicacion}
                              onChange={(e) => setNewPregunta({ ...newPregunta, explicacion: e.target.value })}
                              placeholder="Explica por qué esta es la respuesta correcta..."
                              rows={2}
                              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={addPregunta}
                              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                              Agregar Pregunta
                            </button>
                            <button
                              onClick={() => setShowQuizModal(false)}
                              className="px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botón para mostrar formulario */}
                    {!showQuizModal && (
                      <button
                        onClick={() => setShowQuizModal(true)}
                        className="w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-purple-500 hover:text-purple-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Agregar Pregunta de Quiz
                      </button>
                    )}

                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentSection('recursos')}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <ArrowLeft size={16} />
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentSection('preview')}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Vista Previa
                        <ArrowLeft className="rotate-180" size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {currentSection === 'preview' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                        <Eye className="w-6 h-6 text-purple-500" />
                        Vista Previa de la Lección
                      </h2>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{formData.titulo || 'Título de la lección'}</h3>
                          <p className="text-slate-600 dark:text-slate-400">{formData.descripcion || 'Descripción de la lección'}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm">
                            {formData.categoria || 'Categoría'}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm">
                            {formData.nivel}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                            <Clock size={14} />
                            {formData.duracion_estimada} min
                          </span>
                        </div>

                        {formData.objetivos_aprendizaje.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Objetivos de Aprendizaje:</h4>
                            <ul className="space-y-1">
                              {formData.objetivos_aprendizaje.map((objetivo, index) => (
                                <li key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                  <Target size={14} className="text-purple-500 flex-shrink-0" />
                                  {objetivo}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {formData.contenido_texto && (
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Contenido:</h4>
                            <div className="prose dark:prose-invert max-w-none">
                              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                {formData.contenido_texto.substring(0, 300)}
                                {formData.contenido_texto.length > 300 && '...'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentSection('quiz')}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <ArrowLeft size={16} />
                        Anterior
                      </button>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSubmit(true)}
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                        >
                          <Save size={16} />
                          Guardar Borrador
                        </button>
                        <button
                          onClick={() => handleSubmit(false)}
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                        >
                          <Sparkles size={16} />
                          {isSubmitting ? 'Publicando...' : 'Publicar Lección'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
