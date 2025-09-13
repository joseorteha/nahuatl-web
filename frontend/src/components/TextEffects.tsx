'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const ShimmerText = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      whileHover="hover"
    >
      <motion.div
        className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        variants={{
          hover: {
            x: ["-100%", "200%"],
            transition: { duration: 0.8, ease: "easeInOut" }
          }
        }}
      />
      {children}
    </motion.div>
  );
};

export const GradientText = ({ 
  children, 
  gradient = "from-blue-600 via-purple-600 to-pink-600",
  className = ""
}: {
  children: React.ReactNode;
  gradient?: string;
  className?: string;
}) => {
  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

export const PulsingBadge = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => {
  return (
    <motion.div
      className={`
        relative inline-flex items-center px-6 py-3 rounded-full 
        bg-gradient-to-r from-blue-100 to-purple-100 
        border border-blue-200 text-blue-700 text-sm font-semibold
        ${className}
      `}
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(59, 130, 246, 0.4)",
          "0 0 0 8px rgba(59, 130, 246, 0)",
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative z-10">{children}</span>
    </motion.div>
  );
};

export const MorphingShape = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`absolute ${className}`}>
      <motion.div
        className="w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-2xl"
        animate={{
          borderRadius: [
            "30% 70% 70% 30% / 30% 30% 70% 70%",
            "70% 30% 30% 70% / 70% 70% 30% 30%",
            "50% 50% 50% 50% / 50% 50% 50% 50%",
            "30% 70% 70% 30% / 30% 30% 70% 70%"
          ],
          scale: [1, 1.2, 0.8, 1],
          rotate: [0, 90, 180, 270, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export const FloatingText = ({ 
  text, 
  delay = 0,
  className = ""
}: {
  text: string;
  delay?: number;
  className?: string;
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      whileHover={{
        y: -5,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
    >
      {text}
    </motion.span>
  );
};

export const CountingNumbers = ({ 
  end, 
  duration = 2000,
  prefix = "",
  suffix = "",
  className = ""
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOut));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};
