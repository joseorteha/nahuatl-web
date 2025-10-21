'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Youtube, Image, Music, Link as LinkIcon, Clock } from 'lucide-react';
import RecursoForm, { RecursoExterno } from './RecursoForm';

interface RecursosListProps {
  recursos: RecursoExterno[];
  onAdd: (recurso: RecursoExterno) => void;
  onUpdate: (id: string, recurso: RecursoExterno) => void;
  onDelete: (id: string) => void;
}

export default function RecursosList({ recursos, onAdd, onUpdate, onDelete }: RecursosListProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<RecursoExterno | null>(null);

  const handleSave = (recurso: RecursoExterno) => {
    if (editingRecurso && editingRecurso.id) {
      onUpdate(editingRecurso.id, recurso);
    } else {
      onAdd({ ...recurso, id: `temp-${Date.now()}` });
    }
    setEditingRecurso(null);
  };

  const handleEdit = (recurso: RecursoExterno) => {
    setEditingRecurso(recurso);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingRecurso(null);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video_youtube': return Youtube;
      case 'imagen_drive': return Image;
      case 'audio_externo': return Music;
      case 'enlace_web': return LinkIcon;
      default: return LinkIcon;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'video_youtube': return 'Video YouTube';
      case 'imagen_drive': return 'Imagen Drive';
      case 'audio_externo': return 'Audio';
      case 'enlace_web': return 'Enlace Web';
      default: return tipo;
    }
  };

  const formatDuracion = (segundos?: number) => {
    if (!segundos) return null;
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            📦 Recursos Externos
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {recursos.length} recurso{recursos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRecurso(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg"
        >
          <Plus size={20} />
          Agregar
        </button>
      </div>

      {/* Lista */}
      {recursos.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <LinkIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hay recursos agregados</p>
          <p className="text-sm mt-1">Haz click en "Agregar" para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recursos.map((recurso, index) => {
            const Icon = getTipoIcon(recurso.tipo_recurso);
            return (
              <motion.div
                key={recurso.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:shadow-md transition-shadow"
              >
                {/* Icono */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {recurso.titulo}
                      </h4>
                      {recurso.descripcion && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {recurso.descripcion}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full">
                          {getTipoLabel(recurso.tipo_recurso)}
                        </span>
                        {recurso.es_opcional && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                            Opcional
                          </span>
                        )}
                        {recurso.duracion_segundos && (
                          <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full flex items-center gap-1">
                            <Clock size={12} />
                            {formatDuracion(recurso.duracion_segundos)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(recurso)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => recurso.id && onDelete(recurso.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <RecursoForm
        isOpen={showModal}
        onClose={handleClose}
        onSave={handleSave}
        recurso={editingRecurso}
      />
    </div>
  );
}
