// components/admin/ContributionModal.tsx
'use client';

import { useState } from 'react';

interface AdminContribution {
  id: string;
  word: string;
  definition: string;
  info_gramatical: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'publicada';
  fecha_creacion: string;
  fecha_revision?: string;
  razon_contribucion?: string;
  fuente?: string;
  nivel_confianza: string;
  comentarios_admin?: string;
  perfiles: {
    nombre_completo: string;
    email: string;
    username?: string;
  };
  admin_revisor?: {
    nombre_completo: string;
  };
}

interface ContributionModalProps {
  contribution: AdminContribution;
  onClose: () => void;
  onReview: (contributionId: string, estado: 'aprobada' | 'rechazada', comment: string) => void;
  reviewing: boolean;
}

export default function ContributionModal({ contribution, onClose, onReview, reviewing }: ContributionModalProps) {
  const [reviewComment, setReviewComment] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReview = (estado: 'aprobada' | 'rechazada') => {
    onReview(contribution.id, estado, reviewComment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Revisar Contribución: {contribution.word}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Información de la Palabra</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Palabra:</strong> {contribution.word}</div>
                <div><strong>Definición:</strong> {contribution.definition}</div>
                {contribution.info_gramatical && (
                  <div><strong>Info Gramatical:</strong> {contribution.info_gramatical}</div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Información del Contribuidor</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Nombre:</strong> {contribution.perfiles.nombre_completo}</div>
                <div><strong>Email:</strong> {contribution.perfiles.email}</div>
                <div><strong>Nivel de Confianza:</strong> {contribution.nivel_confianza}</div>
                <div><strong>Fecha:</strong> {formatDate(contribution.fecha_creacion)}</div>
              </div>
            </div>
          </div>

          {contribution.razon_contribucion && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Razón de la Contribución</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {contribution.razon_contribucion}
              </p>
            </div>
          )}

          {contribution.fuente && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Fuente</h4>
              <p className="text-sm text-gray-600">
                {contribution.fuente}
              </p>
            </div>
          )}

          {contribution.estado === 'pendiente' && (
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-700 mb-3">Comentarios de Revisión</h4>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Comentarios opcionales para el contribuidor..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleReview('rechazada')}
                  disabled={reviewing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {reviewing ? 'Procesando...' : 'Rechazar'}
                </button>
                <button
                  onClick={() => handleReview('aprobada')}
                  disabled={reviewing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {reviewing ? 'Procesando...' : 'Aprobar y Publicar'}
                </button>
              </div>
            </div>
          )}

          {contribution.estado !== 'pendiente' && contribution.comentarios_admin && (
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-700 mb-2">Comentarios del Moderador</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {contribution.comentarios_admin}
              </p>
              {contribution.admin_revisor && (
                <p className="text-xs text-gray-500 mt-2">
                  — {contribution.admin_revisor.nombre_completo}
                  {contribution.fecha_revision && ` • ${formatDate(contribution.fecha_revision)}`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
