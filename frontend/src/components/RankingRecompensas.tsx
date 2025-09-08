'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Avatar from 'boring-avatars';
import { Trophy, Star, Award, TrendingUp } from 'lucide-react';

type AvatarVariant = 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';

interface UsuarioRanking {
  id: string;
  nombre_completo?: string;
  username?: string;
  url_avatar?: string;
  puntos_totales: number;
  nivel: 'principiante' | 'contribuidor' | 'experto' | 'maestro' | 'leyenda';
  contribuciones_aprobadas: number;
  likes_recibidos: number;
}

const nivelesConfig = {
  principiante: { 
    nombre: 'Principiante', 
    color: 'text-green-500', 
    bg: 'bg-green-50',
    icon: '🌱'
  },
  contribuidor: { 
    nombre: 'Contribuidor', 
    color: 'text-blue-500', 
    bg: 'bg-blue-50',
    icon: '📚'
  },
  experto: { 
    nombre: 'Experto', 
    color: 'text-purple-500', 
    bg: 'bg-purple-50',
    icon: '🎓'
  },
  maestro: { 
    nombre: 'Maestro', 
    color: 'text-orange-500', 
    bg: 'bg-orange-50',
    icon: '👑'
  },
  leyenda: { 
    nombre: 'Leyenda', 
    color: 'text-red-500', 
    bg: 'bg-red-50',
    icon: '⭐'
  }
};

const renderAvatar = (avatarString: string | undefined, size: number = 48) => {
  if (!avatarString) {
    return (
      <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center">
        <span className="text-emerald-600 font-bold">?</span>
      </div>
    );
  }

  if (avatarString.startsWith('boring-avatar:')) {
    const parts = avatarString.split(':');
    const name = parts[1];
    const variant = parts[2];
    const colors = parts[3].split(',');
    
    return (
      <Avatar
        size={size}
        name={name}
        variant={variant as AvatarVariant}
        colors={colors}
      />
    );
  }

  return (
    <Image 
      src={avatarString} 
      alt="Avatar" 
      width={size}
      height={size}
      className="w-full h-full rounded-full object-cover"
    />
  );
};

export default function RankingRecompensas() {
  const [ranking, setRanking] = useState<UsuarioRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerRanking();
  }, []);

  const obtenerRanking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recompensas/ranking`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el ranking');
      }
      
      const data = await response.json();
      setRanking(data.ranking || []);
    } catch (error) {
      console.error('Error al obtener ranking:', error);
      setError('No se pudo cargar el ranking');
    } finally {
      setLoading(false);
    }
  };

  const getTrofeoIcon = (posicion: number) => {
    switch (posicion) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return posicion;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{error}</p>
        <button 
          onClick={obtenerRanking}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Ranking de Contribuidores</h2>
        </div>
        <p className="text-center text-yellow-100">
          Los usuarios más activos de nuestra comunidad
        </p>
      </div>

      {/* Ranking */}
      <div className="p-6">
        {ranking.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aún no hay usuarios en el ranking</p>
            <p className="text-sm text-gray-400 mt-1">
              ¡Sé el primero en contribuir y aparecer aquí!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ranking.map((usuario, index) => {
              const posicion = index + 1;
              const nivelConfig = nivelesConfig[usuario.nivel];
              
              return (
                <div
                  key={usuario.id}
                  className={`
                    flex items-center p-4 rounded-lg border-2 transition-all hover:shadow-md
                    ${posicion <= 3 
                      ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' 
                      : 'border-gray-200 bg-gray-50'
                    }
                  `}
                >
                  {/* Posición */}
                  <div className="flex items-center justify-center w-12 h-12 mr-4">
                    {posicion <= 3 ? (
                      <span className="text-2xl">{getTrofeoIcon(posicion)}</span>
                    ) : (
                      <span className="text-lg font-bold text-gray-500">#{posicion}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-16 h-16 mr-4 rounded-full overflow-hidden border-2 border-white shadow-md">
                    {renderAvatar(usuario.url_avatar, 64)}
                  </div>

                  {/* Información del usuario */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {usuario.nombre_completo || usuario.username || 'Usuario Anónimo'}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${nivelConfig.bg} ${nivelConfig.color}`}>
                        <span className="mr-1">{nivelConfig.icon}</span>
                        {nivelConfig.nombre}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {usuario.contribuciones_aprobadas} contribuciones
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {usuario.likes_recibidos} likes
                      </span>
                    </div>
                  </div>

                  {/* Puntos */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {usuario.puntos_totales.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">puntos</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        {ranking.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              💡 <strong>¿Quieres aparecer en el ranking?</strong> Contribuye al diccionario, 
              envía feedback y participa en nuestra comunidad para ganar puntos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
