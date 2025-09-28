import React from 'react';

const AnimatedBackground = () => (
  <div className="pointer-events-none absolute inset-0 w-full h-full z-0 overflow-hidden">
    {/* Patrones de códices */}
    <svg className="absolute left-0 top-0 w-1/3 opacity-5" viewBox="0 0 200 200" preserveAspectRatio="none">
      <path d="M20,100 Q50,20 100,100 T180,100" fill="none" stroke="#f59e0b" strokeWidth="1" />
      <path d="M20,50 Q50,80 100,50 T180,50" fill="none" stroke="#10b981" strokeWidth="1" />
      <path d="M20,150 Q50,120 100,150 T180,150" fill="none" stroke="#60a5fa" strokeWidth="1" />
    </svg>

    {/* Elementos de la naturaleza (náhuatl) */}
    <div className="absolute left-10 top-24 animate-float-slow">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <path d="M32 12 C28 4 12 8 12 16 C12 24 20 28 32 32 C44 28 52 24 52 16 C52 8 36 4 32 12 Z" fill="#fef3c7" opacity="0.4" />
        <path d="M32 12 C36 4 52 8 52 16 C52 24 44 28 32 32 C20 28 12 24 12 16 C12 8 28 4 32 12 Z" fill="#fde68a" opacity="0.3" />
      </svg>
    </div>

    <div className="absolute right-20 top-40 animate-float-medium">
      <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="16" fill="#6ee7b7" opacity="0.2" />
        <path d="M32 16 C40 24 40 40 32 48 C24 40 24 24 32 16 Z" fill="#10b981" opacity="0.15" />
      </svg>
    </div>

    {/* Símbolos náhuatl */}
    <div className="absolute left-1/4 bottom-16 animate-float-slow opacity-10">
      <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
        <path d="M32 8 L40 24 L56 32 L40 40 L32 56 L24 40 L8 32 L24 24 L32 8 Z" fill="none" stroke="#f59e0b" strokeWidth="1" />
      </svg>
    </div>

    <div className="absolute right-1/4 bottom-32 animate-float-medium opacity-10">
      <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
        <rect x="16" y="16" width="32" height="32" rx="16" fill="none" stroke="#60a5fa" strokeWidth="1" />
        <circle cx="32" cy="32" r="12" fill="none" stroke="#10b981" strokeWidth="1" />
        <path d="M32 12 L32 52 M12 32 L52 32" stroke="#f59e0b" strokeWidth="1" />
      </svg>
    </div>

    {/* Ollin (símbolo de movimiento) */}
    <div className="absolute left-1/2 top-1/3 animate-spin-slow opacity-5">
      <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
        <path d="M32 4 L40 12 L32 20 L24 12 L32 4 Z M56 24 L64 32 L56 40 L48 32 L56 24 Z M32 44 L40 52 L32 60 L24 52 L32 44 Z M8 24 L16 32 L8 40 L0 32 L8 24 Z" fill="none" stroke="#f59e0b" strokeWidth="1" />
      </svg>
    </div>
  </div>
);

export default AnimatedBackground;