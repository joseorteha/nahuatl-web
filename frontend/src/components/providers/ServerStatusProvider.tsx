// components/providers/ServerStatusProvider.tsx - Proveedor global del estado del servidor
'use client';
import React, { useEffect, useState } from 'react';
import { useServerStatus } from '@/lib/utils/apiUtils';
import ServerWarmupIndicator from '@/components/ui/ServerWarmupIndicator';

interface ServerStatusProviderProps {
  children: React.ReactNode;
}

export default function ServerStatusProvider({ children }: ServerStatusProviderProps) {
  const status = useServerStatus();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Mostrar indicador cuando esté warming up o haya error
    if (status.isWarmingUp || status.lastError) {
      setShowIndicator(true);
    } else if (status.isOnline && !status.isWarmingUp && !status.lastError) {
      // Auto-ocultar después de 3 segundos cuando esté online
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [status.isWarmingUp, status.isOnline, status.lastError]);

  const handleRetry = () => {
    status.retry();
    // Re-intentar la última operación no es fácil sin contexto adicional
    // Por ahora solo limpiamos el error
  };

  return (
    <>
      {children}
      {showIndicator && (
        <ServerWarmupIndicator
          isWarmingUp={status.isWarmingUp}
          error={status.lastError}
          onRetry={status.lastError ? handleRetry : undefined}
        />
      )}
    </>
  );
}