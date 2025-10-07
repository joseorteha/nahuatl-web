'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl'
};

const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40
};

export default function Avatar({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className = '',
  showFallback = true 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const shouldShowImage = src && !imageError && src.trim() !== '';

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 ${sizeClasses[size]} ${className}`}>
      {shouldShowImage ? (
        <>
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {!imageLoaded && showFallback && (
            <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
              {getInitials(name)}
            </div>
          )}
        </>
      ) : (
        showFallback && (
          <div className="flex items-center justify-center text-white font-semibold w-full h-full">
            {name ? (
              getInitials(name)
            ) : (
              <User size={iconSizes[size]} />
            )}
          </div>
        )
      )}
    </div>
  );
}