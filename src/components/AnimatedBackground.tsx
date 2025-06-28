import React from 'react';

const AnimatedBackground = () => (
  <div className="pointer-events-none absolute inset-0 w-full h-full z-0 overflow-hidden">
    {/* Hojitas */}
    <svg className="absolute left-10 top-20 w-16 h-16 leaf-float opacity-60" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="32" rx="24" ry="12" fill="#34d399" />
      <path d="M32 32 Q40 24 48 32 Q40 40 32 32 Z" fill="#059669" />
    </svg>
    <svg className="absolute right-20 top-40 w-12 h-12 leaf-float opacity-50" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="32" rx="20" ry="10" fill="#4ade80" />
      <path d="M32 32 Q38 28 44 32 Q38 36 32 32 Z" fill="#10b981" />
    </svg>
    {/* Libritos */}
    <svg className="absolute left-1/3 bottom-16 w-14 h-14 book-float opacity-60" viewBox="0 0 64 64" fill="none">
      <rect x="12" y="20" width="40" height="24" rx="4" fill="#fbbf24" />
      <rect x="16" y="24" width="32" height="16" rx="2" fill="#fef3c7" />
      <path d="M32 24 v16" stroke="#f59e42" strokeWidth="2" />
    </svg>
    <svg className="absolute right-1/4 bottom-32 w-10 h-10 book-float opacity-50" viewBox="0 0 64 64" fill="none">
      <rect x="16" y="28" width="32" height="12" rx="2" fill="#fde68a" />
      <rect x="20" y="32" width="24" height="4" rx="1" fill="#fffde7" />
    </svg>
  </div>
);

export default AnimatedBackground; 