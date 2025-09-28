'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Elementos geométricos flotantes */}
      <motion.div
        className="absolute top-20 left-20 w-20 h-20 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/3 right-32 w-16 h-16 bg-gradient-to-br from-pink-400/15 to-blue-400/15 rounded-lg blur-lg"
        animate={{
          y: [0, 40, 0],
          x: [0, -25, 0],
          rotate: [0, -90, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-md"
        animate={{
          y: [0, -20, 0],
          x: [0, 30, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10
        }}
      />
      
      <motion.div
        className="absolute top-2/3 right-1/4 w-8 h-8 bg-gradient-to-br from-blue-400/25 to-purple-400/25 rounded-sm blur-sm"
        animate={{
          y: [0, 35, 0],
          x: [0, -15, 0],
          rotate: [0, 270, 0]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />

      {/* Líneas conectoras animadas */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="50%" stopColor="rgba(147, 51, 234, 0.1)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.1)" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M100,100 Q400,200 700,150 T1200,300"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
        
        <motion.path
          d="M200,400 Q600,350 1000,450 T1400,200"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
        />
      </svg>
    </div>
  );
};

// Componente de tarjeta con efecto holográfico
export const HolographicCard = ({ 
  children, 
  className = '',
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  [key: string]: unknown;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`
        relative overflow-hidden rounded-3xl backdrop-blur-xl
        bg-gradient-to-br from-white/80 via-white/60 to-white/40
        dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-900/40
        border border-white/30 dark:border-gray-700/30 shadow-2xl
        transition-all duration-300 ease-out
        before:absolute before:inset-0 before:bg-gradient-to-br 
        before:from-blue-500/5 before:via-purple-500/5 before:to-pink-500/5
        dark:before:from-blue-400/10 dark:before:via-purple-400/10 dark:before:to-pink-400/10
        before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
        ${className}
      `}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {/* Efecto iridiscente */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 hover:animate-pulse transition-opacity duration-300" />
      
      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Brillo de borde */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 blur-xl" />
    </div>
  );
};

// Componente para texto con efecto typewriter avanzado
export const TypewriterText = ({ 
  text, 
  className = '', 
  speed = 100,
  startDelay = 0
}: {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
}) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timeout: NodeJS.Timeout = setTimeout(() => {
      let currentIndex = 0;
      const timer = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(timer);
          setShowCursor(false);
        }
      }, speed);

      return () => clearInterval(timer);
    }, startDelay);

    // Cursor blinking effect
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearTimeout(timeout);
      clearInterval(cursorTimer);
    };
  }, [text, speed, startDelay]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && <span className="animate-pulse">|</span>}
    </span>
  );
};
