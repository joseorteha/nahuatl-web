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
        return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'contribuidor':
        return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'experto':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'maestro':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'leyenda':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'text-slate-600 bg-slate-100 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${className}`}
        onClick={handleUserClick}
      >
        <div className="relative">
          {isValidAvatarUrl(user.url_avatar) ? (
            <Image
              src={user.url_avatar!}
              alt={user.nombre_completo}
              width={32}
              height={32}
              className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400" />
            </div>
          )}
          {user.verificado && (
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500 absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-white dark:bg-slate-800 rounded-full" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {user.nombre_completo}
            </p>
            {user.verificado && (
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500" />
            )}
          </div>
          {user.username && (
            <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
          )}
        </div>

        {showFollowButton && (
          <button
            onClick={handleFollowClick}
            className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              isFollowing
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                : 'bg-cyan-500 text-white hover:bg-cyan-600'
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
        className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-6 hover:shadow-md dark:hover:shadow-slate-900/50 cursor-pointer transition-shadow ${className}`}
        onClick={handleUserClick}
      >
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="relative">
            {isValidAvatarUrl(user.url_avatar) ? (
              <Image
                src={user.url_avatar!}
                alt={user.nombre_completo}
                width={48}
                height={48}
                className="rounded-full w-12 h-12 sm:w-15 sm:h-15"
              />
            ) : (
              <div className="w-12 h-12 sm:w-15 sm:h-15 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 dark:text-slate-400" />
              </div>
            )}
            {user.verificado && (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                {user.nombre_completo}
              </h3>
              {user.verificado && (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
              )}
            </div>
            
            {user.username && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">@{user.username}</p>
            )}

            {user.recompensas_usuario && (
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(user.recompensas_usuario.nivel)}`}>
                  {user.recompensas_usuario.nivel}
                </div>
                <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                  <Star className="w-4 h-4" />
                  <span>{user.recompensas_usuario.puntos_totales} puntos</span>
                </div>
              </div>
            )}

            {showFollowButton && (
              <button
                onClick={handleFollowClick}
                className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isFollowing
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    : 'bg-cyan-500 text-white hover:bg-cyan-600'
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
      className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md dark:hover:shadow-slate-900/50 cursor-pointer transition-shadow ${className}`}
      onClick={handleUserClick}
    >
      <div className="relative">
        {isValidAvatarUrl(user.url_avatar) ? (
          <Image
            src={user.url_avatar!}
            alt={user.nombre_completo}
            width={40}
            height={40}
            className="rounded-full w-10 h-10 sm:w-12 sm:h-12"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 dark:text-slate-400" />
          </div>
        )}
        {user.verificado && (
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500 absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-white dark:bg-slate-800 rounded-full" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <h4 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            {user.nombre_completo}
          </h4>
          {user.verificado && (
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500" />
          )}
        </div>
        {user.username && (
          <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
        )}
        {user.recompensas_usuario && (
          <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
            <div className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(user.recompensas_usuario.nivel)}`}>
              {user.recompensas_usuario.nivel}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {user.recompensas_usuario.puntos_totales} pts
            </span>
          </div>
        )}
      </div>

      {showFollowButton && (
        <button
          onClick={handleFollowClick}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-full transition-colors ${
            isFollowing
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              : 'bg-cyan-500 text-white hover:bg-cyan-600'
          }`}
        >
          {isFollowing ? 'Siguiendo' : 'Seguir'}
        </button>
      )}
    </div>
  );
};
