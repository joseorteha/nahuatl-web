'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye,
  Book,
  Clock,
  Target,
  Play,
  BookOpen,
  HelpCircle,
  User,
  Calendar,
  Tag,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  Award
} from 'lucide-react';
import ResourceViewer from './ResourceViewer';
import QuizBuilder from './QuizBuilder';

interface Lesson {
  id?: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  categoria: string;
  duracion_estimada: number;
  objetivos: string[];
  palabras_clave: string[];
  recursos: any[];
  quiz: any;
  profesor_id?: string;
  profesor_nombre?: string;
  fecha_creacion?: string;
  estado?: 'borrador' | 'publicado' | 'archivado';
}

interface LessonPreviewProps {
  lesson: Lesson;
  onClose?: () => void;
  onEdit?: () => void;
  className?: string;
  showActions?: boolean;
  isTeacherView?: boolean;
}

export default function LessonPreview({ 
  lesson, 
  onClose, 
  onEdit, 
  className = '', 
  showActions = true,
  isTeacherView = false
}: LessonPreviewProps) {
  const [currentSection, setCurrentSection] = useState<'info' | 'content' | 'resources' | 'quiz'>('info');
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const secciones = [
    { 
      id: 'info', 
      label: 'Información', 
      icon: BookOpen, 
      description: 'Detalles y objetivos de la lección' 
    },
    { 
      id: 'content', 
      label: 'Contenido', 
      icon: Book, 
      description: 'Material de aprendizaje principal' 
    },
    { 
      id: 'resources', 
      label: 'Recursos', 
      icon: Play, 
      description: 'Materiales adicionales y multimedia' 
    },
    { 
      id: 'quiz', 
      label: 'Evaluación', 
      icon: HelpCircle, 
      description: 'Quiz de comprensión' 
    }
  ];

  const markSectionComplete = (sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections(prev => [...prev, sectionId]);
    }
  };

  const getNextSection = () => {
    const currentIndex = secciones.findIndex(s => s.id === currentSection);
    return currentIndex < secciones.length - 1 ? secciones[currentIndex + 1].id : null;
  };

  const getPreviousSection = () => {
    const currentIndex = secciones.findIndex(s => s.id === currentSection);
    return currentIndex > 0 ? secciones[currentIndex - 1].id : null;
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'principiante':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermedio':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'avanzado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'publicado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'borrador':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archivado':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const renderInfoSection = () => (
    <div className="space-y-6">
      {/* Header de la lección */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {lesson.titulo}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNivelColor(lesson.nivel)}`}>
                {lesson.nivel.charAt(0).toUpperCase() + lesson.nivel.slice(1)}
              </span>
              {lesson.estado && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(lesson.estado)}`}>
                  {lesson.estado.charAt(0).toUpperCase() + lesson.estado.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {lesson.descripcion}
        </p>
      </div>

      {/* Información de la lección */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Detalles de la Lección
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Categoría:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{lesson.categoria}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Duración:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{lesson.duracion_estimada} min</span>
            </div>
            {lesson.profesor_nombre && (
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Profesor:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{lesson.profesor_nombre}</span>
              </div>
            )}
            {lesson.fecha_creacion && (
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Creado:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {new Date(lesson.fecha_creacion).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Objetivos de Aprendizaje
          </h3>
          <ul className="space-y-2">
            {lesson.objetivos.map((objetivo, index) => (
              <li key={index} className="flex items-start gap-2">
                <Circle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{objetivo}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Palabras clave */}
      {lesson.palabras_clave.length > 0 && (
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-500" />
            Palabras Clave
          </h3>
          <div className="flex flex-wrap gap-2">
            {lesson.palabras_clave.map((palabra, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm"
              >
                {palabra}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botón para continuar */}
      <div className="text-center pt-4">
        <button
          onClick={() => {
            markSectionComplete('info');
            setCurrentSection('content');
          }}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          Comenzar Lección
        </button>
      </div>
    </div>
  );

  const renderContentSection = () => (
    <div className="space-y-6">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Book className="w-5 h-5 text-blue-500" />
          Contenido de la Lección
        </h3>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div 
            className="text-slate-700 dark:text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: lesson.contenido.replace(/\n/g, '<br>') }}
          />
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentSection('info')}
          className="flex items-center gap-2 px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Anterior
        </button>
        <button
          onClick={() => {
            markSectionComplete('content');
            setCurrentSection('resources');
          }}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
        >
          Siguiente
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderResourcesSection = () => (
    <div className="space-y-6">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-purple-500" />
          Recursos Adicionales
        </h3>
        
        {lesson.recursos && lesson.recursos.length > 0 ? (
          <div className="space-y-4">
            <ResourceViewer recursos={lesson.recursos} />
          </div>
        ) : (
          <div className="text-center py-8">
            <Play className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              No hay recursos adicionales para esta lección.
            </p>
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentSection('content')}
          className="flex items-center gap-2 px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Anterior
        </button>
        <button
          onClick={() => {
            markSectionComplete('resources');
            setCurrentSection('quiz');
          }}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
        >
          Ir al Quiz
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderQuizSection = () => (
    <div className="space-y-6">
      {lesson.quiz && lesson.quiz.preguntas && lesson.quiz.preguntas.length > 0 ? (
        <QuizBuilder 
          initialData={lesson.quiz}
          onSave={() => {}}
          readonly={true}
          className="quiz-preview"
        />
      ) : (
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-8 border border-slate-200/50 dark:border-slate-700/50 text-center">
          <HelpCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No hay quiz disponible
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Esta lección no incluye un quiz de evaluación.
          </p>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentSection('resources')}
          className="flex items-center gap-2 px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Anterior
        </button>
        <button
          onClick={() => {
            markSectionComplete('quiz');
            // Aquí podrías agregar lógica para completar la lección
          }}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
        >
          <CheckCircle size={16} />
          Completar Lección
        </button>
      </div>
    </div>
  );

  const currentSectionData = secciones.find(s => s.id === currentSection);

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header con acciones */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Vista Previa de Lección
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {currentSectionData?.description}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {onEdit && isTeacherView && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Editar
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navegación de secciones */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-4 mb-6 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex flex-wrap gap-2">
          {secciones.map((seccion) => {
            const Icon = seccion.icon;
            const isActive = currentSection === seccion.id;
            const isCompleted = completedSections.includes(seccion.id);
            
            return (
              <button
                key={seccion.id}
                onClick={() => setCurrentSection(seccion.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : isCompleted
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle size={16} />
                ) : (
                  <Icon size={16} />
                )}
                <span className="font-medium">{seccion.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progreso */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-4 mb-6 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Progreso de la lección
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {completedSections.length}/{secciones.length} secciones completadas
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSections.length / secciones.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Contenido de la sección actual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentSection === 'info' && renderInfoSection()}
          {currentSection === 'content' && renderContentSection()}
          {currentSection === 'resources' && renderResourcesSection()}
          {currentSection === 'quiz' && renderQuizSection()}
        </motion.div>
      </AnimatePresence>

      {/* Resumen de completitud */}
      {completedSections.length === secciones.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white text-center mt-6"
        >
          <Award className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">¡Lección Completada!</h3>
          <p>Has terminado exitosamente todos los componentes de esta lección.</p>
        </motion.div>
      )}
    </div>
  );
}

