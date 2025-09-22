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
  Archive
} from 'lucide-react';

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
}

export default function TemaCard({ tema, onLike, onShare }: TemaCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const router = useRouter();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(tema.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShared(!isShared);
    onShare?.(tema.id);
  };

  const handleCardClick = () => {
    router.push(`/feedback/tema/${tema.id}`);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cerrado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'archivado':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <MessageCircle className="w-4 h-4" />;
      case 'cerrado':
        return <Lock className="w-4 h-4" />;
      case 'archivado':
        return <Archive className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'suggestion':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'question':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'issue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'bug_report':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'feature_request':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 dark:border-gray-700/60 overflow-hidden group"
    >
      <div 
        onClick={handleCardClick}
        className="block cursor-pointer"
      >
        <div className="p-6">
          {/* Header del tema */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {tema.titulo}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getEstadoColor(tema.estado)}`}>
                  {getEstadoIcon(tema.estado)}
                  {tema.estado}
                </div>
              </div>
              
              {tema.descripcion && (
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 mb-3">
                  {tema.descripcion}
                </p>
              )}
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0 ml-2" />
          </div>

          {/* Categoría y creador */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getCategoriaColor(tema.categoria)}`}>
              <Tag className="w-3 h-3" />
              {getCategoriaLabel(tema.categoria)}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <User className="w-4 h-4" />
              <Link href={`/profile/${tema.creador.id}`} className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {tema.creador.nombre_completo}
              </Link>
              <Link href={`/profile/${tema.creador.id}`} className="text-xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                @{tema.creador.username}
              </Link>
            </div>
          </div>

          {/* Stats del tema */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span className="font-semibold">{tema.respuestas_count}</span>
                <span>respuestas</span>
              </div>
              
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="font-semibold">{tema.participantes_count}</span>
                <span>participantes</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(tema.ultima_actividad).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleLike(e);
                }}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleShare(e);
                }}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isShared 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                <Share2 className={`w-4 h-4 ${isShared ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
