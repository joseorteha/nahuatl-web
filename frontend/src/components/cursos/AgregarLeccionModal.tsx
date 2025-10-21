'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import BuscadorLecciones from '@/components/cursos/BuscadorLecciones';
import FormularioLeccionExclusiva from '@/components/cursos/FormularioLeccionExclusiva';

interface AgregarLeccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduloId: string;
  cursoId: string;
  onLeccionAgregada: () => void;
}

export default function AgregarLeccionModal({
  isOpen,
  onClose,
  moduloId,
  cursoId,
  onLeccionAgregada
}: AgregarLeccionModalProps) {
  const [activeTab, setActiveTab] = useState<'vincular' | 'crear'>('vincular');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agregar Lección al Módulo
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('vincular')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'vincular'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              🔗 Vincular Lección Existente
            </button>
            <button
              onClick={() => setActiveTab('crear')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'crear'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              ✨ Crear Lección Exclusiva
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'vincular' ? (
            <BuscadorLecciones
              moduloId={moduloId}
              onLeccionVinculada={() => {
                onLeccionAgregada();
                onClose();
              }}
            />
          ) : (
            <FormularioLeccionExclusiva
              moduloId={moduloId}
              cursoId={cursoId}
              onLeccionCreada={() => {
                onLeccionAgregada();
                onClose();
              }}
              onCancelar={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
