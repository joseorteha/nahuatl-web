'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  hoverEffect?: 'float' | 'spin' | 'pulse' | 'bounce' | 'glow';
  delay?: number;
}

export const AnimatedIcon = ({ 
  icon: Icon, 
  size = 24, 
  className = '', 
  hoverEffect = 'float',
  delay = 0
}: AnimatedIconProps) => {
  
  const getHoverAnimation = () => {
    switch (hoverEffect) {
      case 'float':
        return { y: -8 };
      case 'spin':
        return { rotate: 360 };
      case 'pulse':
        return { scale: 1.2 };
      case 'bounce':
        return { y: -10 };
      case 'glow':
        return { scale: 1.1, filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))" };
      default:
        return { y: -8 };
    }
  };

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      whileHover={getHoverAnimation()}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 20 }}
    >
      <Icon size={size} />
    </motion.div>
  );
};

// Componente para números contadores animados
export const AnimatedCounter = ({ 
  end, 
  duration = 2, 
  prefix = '', 
  suffix = '',
  className = ''
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: duration,
          ease: "easeOut"
        }}
      >
        {prefix}
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: duration * 0.8,
            ease: "easeOut",
            delay: duration * 0.2
          }}
        >
          {end.toLocaleString()}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  );
};

// Botón premium con efectos avanzados
export const PremiumButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  [key: string]: unknown;
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-400/20',
    secondary: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-lg',
    ghost: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-2xl font-semibold
        transition-all duration-300 ease-out
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      whileHover={{ 
        scale: 1.05,
        boxShadow: variant === 'primary' 
          ? '0 20px 40px -12px rgba(59, 130, 246, 0.4)' 
          : '0 10px 30px -8px rgba(0, 0, 0, 0.15)'
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0"
        whileHover={{ opacity: 1, x: ['-100%', '100%'] }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
