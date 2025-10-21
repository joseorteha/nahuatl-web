'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video,
  Image as ImageIcon,
  Globe,
  FileText,
  ExternalLink,
  Eye,
  EyeOff,
  Play,
  Pause
} from 'lucide-react';

interface RecursoExterno {
  id: string;
  tipo: 'video_youtube' | 'imagen_drive' | 'audio_externo' | 'enlace_web';
  titulo: string;
  descripcion?: string;
  url: string;
  es_opcional: boolean;
  orden: number;
  duracion_segundos?: number;
}

interface ResourceViewerProps {
  recursos: RecursoExterno[];
  onResourceComplete?: (resourceId: string) => void;
  className?: string;
}

export default function ResourceViewer({ recursos, onResourceComplete, className = '' }: ResourceViewerProps) {
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const [completedResources, setCompletedResources] = useState<string[]>([]);

  const getResourceIcon = (tipo: string) => {
    switch (tipo) {
      case 'video_youtube': return Video;
      case 'imagen_drive': return ImageIcon;
      case 'audio_externo': return FileText;
      case 'enlace_web': return Globe;
      default: return FileText;
    }
  };

  const getResourceColor = (tipo: string) => {
    switch (tipo) {
      case 'video_youtube': return 'from-red-500 to-red-600';
      case 'imagen_drive': return 'from-blue-500 to-blue-600';
      case 'audio_externo': return 'from-purple-500 to-purple-600';
      case 'enlace_web': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleResourceClick = (recurso: RecursoExterno) => {
    if (recurso.tipo === 'enlace_web') {
      window.open(recurso.url, '_blank');
    } else {
      setActiveResource(activeResource === recurso.id ? null : recurso.id);
    }
    
    if (!completedResources.includes(recurso.id)) {
      setCompletedResources(prev => [...prev, recurso.id]);
      onResourceComplete?.(recurso.id);
    }
  };

  const renderResourceViewer = (recurso: RecursoExterno) => {
    if (activeResource !== recurso.id) return null;

    switch (recurso.tipo) {
      case 'video_youtube':
        const videoId = getYouTubeVideoId(recurso.url);
        if (!videoId) return <p className="text-red-500">URL de YouTube inválida</p>;
        
        return (
          <div className="mt-4 aspect-video w-full bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={recurso.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        );

      case 'imagen_drive':
        // Para Google Drive, necesitamos convertir la URL de compartir a URL de vista directa
        const driveId = recurso.url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
        const imageUrl = driveId ? `https://drive.google.com/uc?id=${driveId}` : recurso.url;
        
        return (
          <div className="mt-4">
            <img 
              src={imageUrl}
              alt={recurso.titulo}
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
              }}
            />
          </div>
        );

      case 'audio_externo':
        return (
          <div className="mt-4">
            <audio 
              controls 
              className="w-full max-w-md mx-auto"
              preload="metadata"
            >
              <source src={recurso.url} type="audio/mpeg" />
              <source src={recurso.url} type="audio/wav" />
              <source src={recurso.url} type="audio/ogg" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
        );

      default:
        return (
          <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <p className="text-slate-600 dark:text-slate-400">
              Tipo de recurso no soportado para vista previa.
            </p>
            <a 
              href={recurso.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ExternalLink size={16} />
              Abrir enlace externo
            </a>
          </div>
        );
    }
  };

  if (!recursos.length) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          No hay recursos externos disponibles para esta lección.
        </p>
      </div>
    );
  }

  // Separar recursos obligatorios y opcionales
  const recursosObligatorios = recursos.filter(r => !r.es_opcional).sort((a, b) => a.orden - b.orden);
  const recursosOpcionales = recursos.filter(r => r.es_opcional).sort((a, b) => a.orden - b.orden);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Recursos obligatorios */}
      {recursosObligatorios.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Recursos Requeridos
          </h3>
          <div className="space-y-4">
            {recursosObligatorios.map((recurso, index) => {
              const IconComponent = getResourceIcon(recurso.tipo);
              const isCompleted = completedResources.includes(recurso.id);
              const isActive = activeResource === recurso.id;
              
              return (
                <motion.div
                  key={recurso.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
                >
                  <button
                    onClick={() => handleResourceClick(recurso)}
                    className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${getResourceColor(recurso.tipo)} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                            {recurso.titulo}
                          </h4>
                          {recurso.descripcion && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {recurso.descripcion}
                            </p>
                          )}
                          {recurso.duracion_segundos && (
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              Duración: {Math.ceil(recurso.duracion_segundos / 60)} min
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Eye className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {recurso.tipo === 'enlace_web' ? (
                          <ExternalLink className="w-5 h-5 text-slate-400" />
                        ) : (
                          <div className="w-5 h-5 text-slate-400">
                            {isActive ? <EyeOff /> : <Eye />}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {renderResourceViewer(recurso)}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recursos opcionales */}
      {recursosOpcionales.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Recursos Adicionales
          </h3>
          <div className="space-y-4">
            {recursosOpcionales.map((recurso, index) => {
              const IconComponent = getResourceIcon(recurso.tipo);
              const isCompleted = completedResources.includes(recurso.id);
              const isActive = activeResource === recurso.id;
              
              return (
                <motion.div
                  key={recurso.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
                >
                  <button
                    onClick={() => handleResourceClick(recurso)}
                    className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${getResourceColor(recurso.tipo)} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              {recurso.titulo}
                            </h4>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                              Opcional
                            </span>
                          </div>
                          {recurso.descripcion && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {recurso.descripcion}
                            </p>
                          )}
                          {recurso.duracion_segundos && (
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              Duración: {Math.ceil(recurso.duracion_segundos / 60)} min
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Eye className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {recurso.tipo === 'enlace_web' ? (
                          <ExternalLink className="w-5 h-5 text-slate-400" />
                        ) : (
                          <div className="w-5 h-5 text-slate-400">
                            {isActive ? <EyeOff /> : <Eye />}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {renderResourceViewer(recurso)}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}