'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const AdvancedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Partículas flotantes
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() * 60 + 200, // Azules y púrpuras
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = `hsl(${particle.hue}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Conectar partículas cercanas
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha = (100 - distance) / 100 * 0.1;
            ctx.strokeStyle = `hsl(${(particle.hue + otherParticle.hue) / 2}, 50%, 50%)`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.3 }}
      />
      
      {/* Gradientes sofisticados superpuestos */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10" />
        <div className="absolute inset-0 bg-gradient-to-tl from-pink-50/20 via-transparent to-blue-50/20 dark:from-pink-900/5 dark:via-transparent dark:to-blue-900/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-400/10 dark:bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400/5 dark:bg-pink-400/3 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
    </>
  );
};

// Componente para elementos glassmorphism
export const GlassCard = ({ 
  children, 
  className = '', 
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  [key: string]: unknown;
}) => (
  <motion.div
    className={`
      backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/20
      shadow-xl shadow-blue-900/10 dark:shadow-blue-400/5 rounded-2xl
      ${className}
    `}
    whileHover={{ 
      scale: 1.02,
      boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.15)' 
    }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    {...props}
  >
    {children}
  </motion.div>
);

// Hook para scroll parallax sofisticado
export const useParallax = (speed: number = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      element.style.transform = `translateY(${rate}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return ref;
};
