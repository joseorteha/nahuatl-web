'use client';

import React from 'react';
import Image from 'next/image';
import { User, CheckCircle, Star } from 'lucide-react';
import { Seguimiento } from '@/hooks/useSocial';

interface UserCardProps {
  user: Seguimiento['seguidor'] | Seguimiento['seguido'];
  showFollowButton?: boolean;
  isFollowing?: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onUserClick?: (userId: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  showFollowButton = false,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onUserClick,
  className = '',
  variant = 'default'
}) => {
  if (!user) return null;

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowing && onUnfollow) {
      onUnfollow(user.id);
    } else if (!isFollowing && onFollow) {
      onFollow(user.id);
    }
  };

  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick(user.id);
    }
  };

  // Función para validar si la URL del avatar es válida
  const isValidAvatarUrl = (url?: string) => {
    if (!url) return false;
    // Verificar que no sea una URL de boring-avatar inválida
    if (url.includes('boring-avatar:id32vt-beam-1:beam')) return false;
    // Verificar que sea una URL válida
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getLevelColor = (nivel?: string) => {
    switch (nivel) {
      case 'principiante':
        return 'text-green-600 bg-green-100';
      case 'contribuidor':
        return 'text-blue-600 bg-blue-100';
      case 'experto':
        return 'text-purple-600 bg-purple-100';
      case 'maestro':
        return 'text-yellow-600 bg-yellow-100';
      case 'leyenda':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${className}`}
        onClick={handleUserClick}
      >
        <div className="relative">
          {isValidAvatarUrl(user.url_avatar) ? (
            <Image
              src={user.url_avatar!}
              alt={user.nombre_completo}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
          )}
          {user.verificado && (
            <CheckCircle className="w-4 h-4 text-blue-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.nombre_completo}
            </p>
            {user.verificado && (
              <CheckCircle className="w-4 h-4 text-blue-500" />
            )}
          </div>
          {user.username && (
            <p className="text-xs text-gray-500">@{user.username}</p>
          )}
        </div>

        {showFollowButton && (
          <button
            onClick={handleFollowClick}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              isFollowing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isFollowing ? 'Siguiendo' : 'Seguir'}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md cursor-pointer transition-shadow ${className}`}
        onClick={handleUserClick}
      >
        <div className="flex items-start space-x-4">
          <div className="relative">
            {isValidAvatarUrl(user.url_avatar) ? (
              <Image
                src={user.url_avatar!}
                alt={user.nombre_completo}
                width={60}
                height={60}
                className="rounded-full"
              />
            ) : (
              <div className="w-15 h-15 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
            )}
            {user.verificado && (
              <CheckCircle className="w-5 h-5 text-blue-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {user.nombre_completo}
              </h3>
              {user.verificado && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
            
            {user.username && (
              <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
            )}

            {user.recompensas_usuario && (
              <div className="flex items-center space-x-4 mb-3">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(user.recompensas_usuario.nivel)}`}>
                  {user.recompensas_usuario.nivel}
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Star className="w-4 h-4" />
                  <span>{user.recompensas_usuario.puntos_totales} puntos</span>
                </div>
              </div>
            )}

            {showFollowButton && (
              <button
                onClick={handleFollowClick}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-shadow ${className}`}
      onClick={handleUserClick}
    >
      <div className="relative">
        {isValidAvatarUrl(user.url_avatar) ? (
          <Image
            src={user.url_avatar!}
            alt={user.nombre_completo}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-500" />
          </div>
        )}
        {user.verificado && (
          <CheckCircle className="w-4 h-4 text-blue-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {user.nombre_completo}
          </h4>
          {user.verificado && (
            <CheckCircle className="w-4 h-4 text-blue-500" />
          )}
        </div>
        {user.username && (
          <p className="text-xs text-gray-500">@{user.username}</p>
        )}
        {user.recompensas_usuario && (
          <div className="flex items-center space-x-2 mt-1">
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(user.recompensas_usuario.nivel)}`}>
              {user.recompensas_usuario.nivel}
            </div>
            <span className="text-xs text-gray-500">
              {user.recompensas_usuario.puntos_totales} pts
            </span>
          </div>
        )}
      </div>

      {showFollowButton && (
        <button
          onClick={handleFollowClick}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            isFollowing
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isFollowing ? 'Siguiendo' : 'Seguir'}
        </button>
      )}
    </div>
  );
};
