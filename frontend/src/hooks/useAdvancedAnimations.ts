'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

// Hook para reveal progresivo con diferentes direcciones
export const useRevealAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up', delay = 0) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const directions = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { y: 0, x: 50 },
    right: { y: 0, x: -50 }
  };

  return {
    ref,
    initial: { 
      opacity: 0, 
      ...directions[direction] 
    },
    animate: inView ? { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: { 
        duration: 0.8, 
        delay,
        ease: [0.25, 0.25, 0.25, 0.75]
      }
    } : { 
      opacity: 0, 
      ...directions[direction] 
    }
  };
};

// Hook para animaciones staggered (escalonadas)
export const useStaggerAnimation = (itemCount: number, staggerDelay = 0.1) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return {
    ref,
    containerVariants: variants,
    childVariants,
    animate: inView ? 'visible' : 'hidden'
  };
};

// Hook para typing effect
export const useTypingEffect = (text: string, speed = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
};

// Hook para mouse parallax
export const useMouseParallax = (strength = 10) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / strength;
      const deltaY = (e.clientY - centerY) / strength;

      element.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translate3d(0, 0, 0)';
    };

    window.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
};

// Hook para morfing numbers con formato
export const useMorphingNumber = (
  target: number, 
  duration = 2000, 
  format: 'default' | 'currency' | 'percentage' = 'default'
) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const formatNumber = (num: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(num);
      case 'percentage':
        return `${num.toFixed(1)}%`;
      default:
        return num.toLocaleString();
    }
  };

  const start = () => {
    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = current;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = startValue + (target - startValue) * eased;

      setCurrent(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setCurrent(target);
      }
    };

    animate();
  };

  return {
    value: formatNumber(current),
    start,
    isAnimating
  };
};
