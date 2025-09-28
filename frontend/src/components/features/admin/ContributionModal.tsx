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
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    word: contribution.word,
    definition: contribution.definition,
    info_gramatical: contribution.info_gramatical || '',
    razon_contribucion: contribution.razon_contribucion || '',
    fuente: contribution.fuente || ''
  });

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contributions/${contribution.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Contribución actualizada:', result);
        setIsEditing(false);
        // Aquí podrías actualizar el estado del componente padre si es necesario
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('Error de conexión al guardar');
    }
  };

  const handleCancelEdit = () => {
    setEditedData({
      word: contribution.word,
      definition: contribution.definition,
      info_gramatical: contribution.info_gramatical || '',
      razon_contribucion: contribution.razon_contribucion || '',
      fuente: contribution.fuente || ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 backdrop-blur-xl rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-white/20 dark:border-slate-700/50 shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Revisar Contribución
                </h3>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                  {isEditing ? editedData.word : contribution.word}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {contribution.estado === 'pendiente' && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ✏️ Editar
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-cyan-200/50 dark:border-cyan-700/30 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                  <span className="text-white text-lg">📚</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Información de la Palabra</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Palabra</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.word}
                      onChange={(e) => handleInputChange('word', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-cyan-200 dark:border-cyan-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-800 dark:text-white transition-all duration-200 shadow-sm"
                    />
                  ) : (
                    <div className="text-lg font-medium text-slate-800 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700">{contribution.word}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Definición</label>
                  {isEditing ? (
                    <textarea
                      value={editedData.definition}
                      onChange={(e) => handleInputChange('definition', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-cyan-200 dark:border-cyan-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-800 dark:text-white transition-all duration-200 shadow-sm resize-none"
                    />
                  ) : (
                    <div className="text-base text-slate-800 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[80px]">{contribution.definition}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Info Gramatical</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.info_gramatical}
                      onChange={(e) => handleInputChange('info_gramatical', e.target.value)}
                      placeholder="Ej: s.anim., v.intr., etc."
                      className="w-full px-4 py-3 border-2 border-cyan-200 dark:border-cyan-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-800 dark:text-white transition-all duration-200 shadow-sm"
                    />
                  ) : (
                    <div className="text-base text-slate-800 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      {contribution.info_gramatical || 'No especificado'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/30 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg">
                  <span className="text-white text-lg">👤</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Información del Contribuidor</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">👤</span>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Nombre</div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">{contribution.perfiles.nombre_completo}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">📧</span>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">{contribution.perfiles.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">⭐</span>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Nivel de Confianza</div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 capitalize">{contribution.nivel_confianza}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">📅</span>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Fecha</div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">{formatDate(contribution.fecha_creacion)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                  <span className="text-white text-lg">💭</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Razón de la Contribución</h4>
              </div>
              {isEditing ? (
                <textarea
                  value={editedData.razon_contribucion}
                  onChange={(e) => handleInputChange('razon_contribucion', e.target.value)}
                  placeholder="Razón por la cual se está contribuyendo esta palabra..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white transition-all duration-200 shadow-sm resize-none"
                />
              ) : (
                <div className="text-base text-slate-800 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[80px]">
                  {contribution.razon_contribucion || 'No especificado'}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/30 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                  <span className="text-white text-lg">📖</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Fuente</h4>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.fuente}
                  onChange={(e) => handleInputChange('fuente', e.target.value)}
                  placeholder="Fuente de la información..."
                  className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-800 dark:text-white transition-all duration-200 shadow-sm"
                />
              ) : (
                <div className="text-base text-slate-800 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  {contribution.fuente || 'No especificado'}
                </div>
              )}
            </div>
          </div>

          {contribution.estado === 'pendiente' && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/30 shadow-lg">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ❌ Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    💾 Guardar Cambios
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                        <span className="text-white text-lg">💬</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white">Comentarios de Revisión</h4>
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Comentarios opcionales para el contribuidor..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200 shadow-sm resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <button
                      onClick={() => handleReview('rechazada')}
                      disabled={reviewing}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      {reviewing ? '⏳ Procesando...' : '❌ Rechazar'}
                    </button>
                    <button
                      onClick={() => handleReview('aprobada')}
                      disabled={reviewing}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      {reviewing ? '⏳ Procesando...' : '✅ Aprobar y Publicar'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {contribution.estado !== 'pendiente' && contribution.comentarios_admin && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                  <span className="text-white text-lg">👨‍💼</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Comentarios del Moderador</h4>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                  {contribution.comentarios_admin}
                </p>
                {contribution.admin_revisor && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-medium">Moderador:</span> {contribution.admin_revisor.nombre_completo}
                      {contribution.fecha_revision && (
                        <span className="ml-2">• {formatDate(contribution.fecha_revision)}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
