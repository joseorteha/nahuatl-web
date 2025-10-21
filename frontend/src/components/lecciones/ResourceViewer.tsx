'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Image as ImageIcon, Music, Link as LinkIcon, ExternalLink, X, Play, Pause } from 'lucide-react';

interface RecursoExterno {
  id: string;
  tipo_recurso: 'video_youtube' | 'imagen_drive' | 'audio_externo' | 'enlace_web' | 'pdf_drive';
  titulo: string;
  descripcion?: string;
  url: string;
  es_opcional: boolean;
  duracion_segundos?: number;
}

interface ResourceViewerProps {
  recursos: RecursoExterno[];
}

export default function ResourceViewer({ recursos }: ResourceViewerProps) {
  const [selectedResource, setSelectedResource] = useState<RecursoExterno | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const getRecursoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video_youtube': return Video;
      case 'imagen_drive': return ImageIcon;
      case 'audio_externo': return Music;
      case 'pdf_drive': return LinkIcon;
      default: return LinkIcon;
    }
  };

  const getEmbedUrl = (recurso: RecursoExterno): string => {
    const url = recurso.url;
    
    switch (recurso.tipo_recurso) {
      case 'video_youtube':
        // Convertir URL de YouTube a embed
        const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
        return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : url;
      
      case 'imagen_drive':
        // Convertir URL de Google Drive a vista previa
        const driveImageId = url.match(/\/d\/([^/]+)/)?.[1];
        return driveImageId ? `https://drive.google.com/uc?export=view&id=${driveImageId}` : url;
      
      case 'pdf_drive':
        // Convertir URL de Google Drive PDF a vista previa
        const drivePdfId = url.match(/\/d\/([^/]+)/)?.[1];
        return drivePdfId ? `https://drive.google.com/file/d/${drivePdfId}/preview` : url;
      
      default:
        return url;
    }
  };

  const renderResourcePreview = (recurso: RecursoExterno) => {
    const embedUrl = getEmbedUrl(recurso);

    switch (recurso.tipo_recurso) {
      case 'video_youtube':
        return (
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );

      case 'imagen_drive':
        return (
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
            <img
              src={embedUrl}
              alt={recurso.titulo}
              className="w-full h-auto object-contain max-h-[600px]"
            />
          </div>
        );

      case 'audio_externo':
        return (
          <div className="w-full p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
            <audio controls className="w-full">
              <source src={recurso.url} />
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
        );

      case 'pdf_drive':
        return (
          <div className="w-full h-[600px] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay"
            />
          </div>
        );

      default:
        return (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-lg">
            <ExternalLink className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Este recurso se abre en una nueva pestaña
            </p>
            <a
              href={recurso.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              Abrir Recurso
            </a>
          </div>
        );
    }
  };

  if (recursos.length === 0) return null;

  return (
    <>
      {/* Resource Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-slate-700/50 mb-6"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
          <Video className="h-6 w-6 text-purple-500" />
          Recursos de Aprendizaje
        </h2>

        <div className="grid gap-4">
          {recursos.map((recurso) => {
            const Icon = getRecursoIcon(recurso.tipo_recurso);
            return (
              <button
                key={recurso.id}
                onClick={() => setSelectedResource(recurso)}
                className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 text-left w-full"
              >
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">{recurso.titulo}</h4>
                  {recurso.descripcion && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{recurso.descripcion}</p>
                  )}
                </div>
                {recurso.es_opcional && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    Opcional
                  </span>
                )}
                <ExternalLink className="h-5 w-5 text-slate-400" />
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Modal Viewer */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl flex items-center justify-between z-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{selectedResource.titulo}</h3>
                {selectedResource.descripcion && (
                  <p className="text-purple-100">{selectedResource.descripcion}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {renderResourcePreview(selectedResource)}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 p-4 rounded-b-2xl border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <a
                href={selectedResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir en nueva pestaña
              </a>
              <button
                onClick={() => setSelectedResource(null)}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
