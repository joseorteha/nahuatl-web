'use client';

import React from 'react';
import { Hashtag } from '@/hooks/useSocial';

interface HashtagChipProps {
  hashtag: Hashtag;
  onClick?: (hashtag: Hashtag) => void;
  variant?: 'default' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HashtagChip: React.FC<HashtagChipProps> = ({
  hashtag,
  onClick,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors cursor-pointer';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    solid: 'text-white hover:opacity-90'
  };

  const style = variant === 'solid' ? { backgroundColor: hashtag.color } : {};

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      style={style}
      onClick={() => onClick?.(hashtag)}
    >
      #{hashtag.nombre}
      {hashtag.uso_contador > 0 && (
        <span className="ml-1 text-xs opacity-75">
          ({hashtag.uso_contador})
        </span>
      )}
    </span>
  );
};

interface HashtagListProps {
  hashtags: Hashtag[];
  onHashtagClick?: (hashtag: Hashtag) => void;
  variant?: 'default' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  maxItems?: number;
}

export const HashtagList: React.FC<HashtagListProps> = ({
  hashtags,
  onHashtagClick,
  variant = 'default',
  size = 'md',
  className = '',
  maxItems
}) => {
  const displayHashtags = maxItems ? hashtags.slice(0, maxItems) : hashtags;
  const remainingCount = maxItems && hashtags.length > maxItems ? hashtags.length - maxItems : 0;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayHashtags.map((hashtag) => (
        <HashtagChip
          key={hashtag.id}
          hashtag={hashtag}
          onClick={onHashtagClick}
          variant={variant}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-sm text-gray-500 px-2 py-1">
          +{remainingCount} más
        </span>
      )}
    </div>
  );
};
