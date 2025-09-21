'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, CheckCircle, User } from 'lucide-react';
import { HashtagList } from './HashtagChip';
import { useSocial } from '@/hooks/useSocial';

interface FeedbackCardProps {
  feedback: {
    id: string;
    titulo: string;
    contenido: string;
    categoria: string;
    contador_likes: number;
    compartido_contador: number;
    guardado_contador: number;
    fecha_creacion: string;
    hashtags?: Array<{
      id: string;
      nombre: string;
      color: string;
    }>;
    perfiles: {
      id: string;
      nombre_completo: string;
      username?: string;
      url_avatar?: string;
      verificado: boolean;
      recompensas_usuario?: {
        nivel: string;
        puntos_totales: number;
      };
    };
    retroalimentacion_respuestas?: Array<{
      id: string;
      contenido: string;
      fecha_creacion: string;
      perfiles: {
        id: string;
        nombre_completo: string;
        username?: string;
        url_avatar?: string;
        verificado: boolean;
      };
    }>;
  };
  total_likes?: number;
  total_respuestas?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: (feedbackId: string) => void;
  onReply?: (feedbackId: string) => void;
  onShare?: (feedbackId: string) => void;
  onSave?: (feedbackId: string) => void;
  onUserClick?: (userId: string) => void;
  onHashtagClick?: (hashtag: { id: string; nombre: string; color: string }) => void;
  className?: string;
  showActions?: boolean;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  total_likes = 0,
  total_respuestas = 0,
  isLiked = false,
  isSaved = false,
  onLike,
  onReply,
  onShare,
  onSave,
  onUserClick,
  onHashtagClick,
  className = '',
  showActions = true
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const { compartirFeedback, guardarFeedback } = useSocial();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'suggestion':
        return 'bg-blue-100 text-blue-800';
      case 'question':
        return 'bg-green-100 text-green-800';
      case 'issue':
        return 'bg-red-100 text-red-800';
      case 'bug_report':
        return 'bg-red-100 text-red-800';
      case 'feature_request':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (categoria: string) => {
    switch (categoria) {
      case 'suggestion':
        return 'Sugerencia';
      case 'question':
        return 'Pregunta';
      case 'issue':
        return 'Problema';
      case 'bug_report':
        return 'Error';
      case 'feature_request':
        return 'Solicitud';
      default:
        return 'General';
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare(feedback.id);
    } else {
      try {
        await compartirFeedback(feedback.id);
      } catch (error) {
        console.error('Error al compartir feedback:', error);
      }
    }
  };

  const handleSave = async () => {
    if (onSave) {
      onSave(feedback.id);
    } else {
      try {
        await guardarFeedback(feedback.id);
      } catch (error) {
        console.error('Error al guardar feedback:', error);
      }
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="relative">
          {feedback.perfiles.url_avatar && !feedback.perfiles.url_avatar.startsWith('boring-avatar:') ? (
            <Image
              src={feedback.perfiles.url_avatar}
              alt={feedback.perfiles.nombre_completo}
              width={48}
              height={48}
              className="rounded-full cursor-pointer"
              onClick={() => onUserClick?.(feedback.perfiles.id)}
            />
          ) : (
            <div 
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => onUserClick?.(feedback.perfiles.id)}
            >
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          {feedback.perfiles.verificado && (
            <CheckCircle className="w-4 h-4 text-blue-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 
              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => onUserClick?.(feedback.perfiles.id)}
            >
              {feedback.perfiles.nombre_completo}
            </h4>
            {feedback.perfiles.verificado && (
              <CheckCircle className="w-4 h-4 text-blue-500" />
            )}
            {feedback.perfiles.username && (
              <span className="text-sm text-gray-500">@{feedback.perfiles.username}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500">{formatTime(feedback.fecha_creacion)}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(feedback.categoria)}`}>
              {getCategoryLabel(feedback.categoria)}
            </span>
            {feedback.perfiles.recompensas_usuario && (
              <span className="text-xs text-gray-500">
                {feedback.perfiles.recompensas_usuario.nivel} • {feedback.perfiles.recompensas_usuario.puntos_totales} pts
              </span>
            )}
          </div>
        </div>

        <button className="p-1 text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{feedback.titulo}</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{feedback.contenido}</p>
      </div>

      {/* Hashtags */}
      {feedback.hashtags && feedback.hashtags.length > 0 && (
        <div className="mb-4">
          <HashtagList
            hashtags={feedback.hashtags.map(hashtag => ({
              ...hashtag,
              uso_contador: (hashtag as Record<string, unknown>).uso_contador as number || 0
            }))}
            onHashtagClick={onHashtagClick}
            size="sm"
          />
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onLike?.(feedback.id)}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{total_likes}</span>
            </button>

            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{total_respuestas}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>{feedback.compartido_contador}</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                isSaved ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{feedback.guardado_contador}</span>
            </button>
          </div>

          <button
            onClick={() => onReply?.(feedback.id)}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Responder
          </button>
        </div>
      )}

      {/* Replies */}
      {showReplies && feedback.retroalimentacion_respuestas && feedback.retroalimentacion_respuestas.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Respuestas</h5>
          <div className="space-y-3">
            {feedback.retroalimentacion_respuestas.map((reply) => (
              <div key={reply.id} className="flex items-start space-x-3">
                <div className="relative">
                  {reply.perfiles.url_avatar && !reply.perfiles.url_avatar.startsWith('boring-avatar:') ? (
                    <Image
                      src={reply.perfiles.url_avatar}
                      alt={reply.perfiles.nombre_completo}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {reply.perfiles.verificado && (
                    <CheckCircle className="w-3 h-3 text-blue-500 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {reply.perfiles.nombre_completo}
                    </span>
                    {reply.perfiles.verificado && (
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTime(reply.fecha_creacion)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{reply.contenido}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
