'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  Eye, 
  Clock, 
  User, 
  Tag,
  ChevronRight,
  Lock,
  Archive,
  MoreVertical,
  Edit3,
  Power,
  PowerOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TemaCardProps {
  tema: {
    id: string;
    titulo: string;
    descripcion?: string;
    categoria: string;
    creador: {
      id: string;
      nombre_completo: string;
      username: string;
      url_avatar?: string;
    };
    estado: 'activo' | 'cerrado' | 'archivado';
    participantes_count: number;
    respuestas_count: number;
    ultima_actividad: string;
    fecha_creacion: string;
    contador_likes: number;
    compartido_contador: number;
    trending_score: number;
  };
  onLike?: (temaId: string) => void;
  onShare?: (temaId: string) => void;
  onTemaUpdate?: (temaId: string, updates: any) => void;
}

export default function TemaCard({ tema, onLike, onShare, onTemaUpdate }: TemaCardProps) {
  const router = useRouter();
  const { user, apiCall } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isChangingState, setIsChangingState] = useState(false);

  const handleCardClick = () => {
    router.push(`/comunidad/tema/${tema.id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking || !onLike) return;
    
    setIsLiking(true);
    await onLike(tema.id);
    setIsLiking(false);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing || !onShare) return;
    
    setIsSharing(true);
    await onShare(tema.id);
    setIsSharing(false);
  };

  const handleChangeEstado = async (e: React.MouseEvent, nuevoEstado: 'activo' | 'cerrado' | 'archivado') => {
    e.stopPropagation();
    if (isChangingState) return;

    setIsChangingState(true);
    try {
      const response = await apiCall(`/api/temas/${tema.id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        const result = await response.json();
        if (onTemaUpdate) {
          onTemaUpdate(tema.id, { estado: nuevoEstado });
        }
        setShowOptions(false);
      } else {
        console.error('Error al cambiar estado del tema');
      }
    } catch (error) {
      console.error('Error al cambiar estado del tema:', error);
    } finally {
      setIsChangingState(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cerrado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'archivado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'cerrado':
        return <Lock className="w-3 h-3" />;
      case 'archivado':
        return <Archive className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getCategoriaLabel = (categoria: string) => {
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
        return 'Nueva Funcionalidad';
      default:
        return 'General';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden group"
    >
      <div 
        onClick={handleCardClick}
        className="block cursor-pointer"
      >
        <div className="p-4 sm:p-6">
          {/* Header del tema - Responsive */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-tight">
                  {tema.titulo}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getEstadoColor(tema.estado)}`}>
                  {getEstadoIcon(tema.estado)}
                  {tema.estado.charAt(0).toUpperCase() + tema.estado.slice(1)}
                </div>
              </div>
              
              <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2">
                <div className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 w-fit">
                  <Tag className="w-3 h-3" />
                  {getCategoriaLabel(tema.categoria)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:flex-col lg:items-end lg:gap-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(tema.ultima_actividad)}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors lg:hidden" />
            </div>
          </div>

          {/* Descripción */}
          {tema.descripcion && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
              {tema.descripcion}
            </p>
          )}

          {/* Usuario */}
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
              {tema.creador.nombre_completo.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col xs:flex-row xs:items-center gap-0 xs:gap-2 min-w-0 flex-1">
              <Link 
                href={`/profile/${tema.creador.id}`} 
                className="font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors truncate min-w-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="hidden xs:inline">{tema.creador.nombre_completo}</span>
                <span className="xs:hidden">{tema.creador.nombre_completo.split(' ')[0]}</span>
              </Link>
              <Link 
                href={`/profile/${tema.creador.id}`} 
                className="text-xs hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                @{tema.creador.username}
              </Link>
            </div>
          </div>

          {/* Stats del tema - Responsive */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
            {/* Stats principales - Grid responsivo */}
            <div className="grid grid-cols-2 xs:flex xs:items-center gap-2 xs:gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{tema.respuestas_count}</span>
                <span className="hidden xs:inline">respuestas</span>
                <span className="xs:hidden">resp</span>
              </div>
              
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{tema.participantes_count}</span>
                <span className="hidden xs:inline">participantes</span>
                <span className="xs:hidden">part</span>
              </div>

              {tema.trending_score > 0 && (
                <div className="flex items-center gap-1 col-span-2 xs:col-span-1">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">Trending</span>
                </div>
              )}
            </div>

            {/* Acciones - Responsive */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-all duration-200 disabled:opacity-50 text-xs sm:text-sm"
              >
                <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiking ? 'animate-pulse' : ''}`} />
                <span className="font-semibold">{tema.contador_likes}</span>
              </button>

              <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 disabled:opacity-50 text-xs sm:text-sm"
              >
                <Share2 className={`w-3 h-3 sm:w-4 sm:h-4 ${isSharing ? 'animate-pulse' : ''}`} />
                <span className="font-semibold">{tema.compartido_contador}</span>
              </button>

              {/* Menú de opciones para el creador */}
              {user && user.id === tema.creador.id && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptions(!showOptions);
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showOptions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[160px] z-10"
                    >
                      {tema.estado === 'activo' ? (
                        <>
                          <button
                            onClick={(e) => handleChangeEstado(e, 'cerrado')}
                            disabled={isChangingState}
                            className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-2"
                          >
                            <Lock className="w-4 h-4" />
                            Cerrar tema
                          </button>
                          <button
                            onClick={(e) => handleChangeEstado(e, 'archivado')}
                            disabled={isChangingState}
                            className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <Archive className="w-4 h-4" />
                            Archivar tema
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => handleChangeEstado(e, 'activo')}
                          disabled={isChangingState}
                          className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2"
                        >
                          <Power className="w-4 h-4" />
                          Reactivar tema
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}