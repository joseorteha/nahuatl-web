// hooks/useServerStatus.ts - Hook para manejar el estado global del servidor
'use client';
import { useState, useEffect, useCallback } from 'react';

interface ServerStatus {
  isWarmingUp: boolean;
  isOnline: boolean;
  lastError: string | null;
  retryCount: number;
}

// Estado global del servidor
let globalServerStatus: ServerStatus = {
  isWarmingUp: false,
  isOnline: false,
  lastError: null,
  retryCount: 0
};

const listeners = new Set<(status: ServerStatus) => void>();

const notifyListeners = () => {
  listeners.forEach(listener => listener({ ...globalServerStatus }));
};

export function useServerStatus() {
  const [status, setStatus] = useState<ServerStatus>(globalServerStatus);

  useEffect(() => {
    const listener = (newStatus: ServerStatus) => {
      setStatus(newStatus);
    };
    
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateStatus = useCallback((updates: Partial<ServerStatus>) => {
    globalServerStatus = { ...globalServerStatus, ...updates };
    notifyListeners();
  }, []);

  const markAsWarmingUp = useCallback(() => {
    updateStatus({ 
      isWarmingUp: true, 
      isOnline: false, 
      lastError: null 
    });
  }, [updateStatus]);

  const markAsOnline = useCallback(() => {
    updateStatus({ 
      isWarmingUp: false, 
      isOnline: true, 
      lastError: null,
      retryCount: 0
    });
  }, [updateStatus]);

  const markAsError = useCallback((error: string) => {
    updateStatus({ 
      isWarmingUp: false, 
      isOnline: false, 
      lastError: error,
      retryCount: globalServerStatus.retryCount + 1
    });
  }, [updateStatus]);

  const reset = useCallback(() => {
    updateStatus({ 
      isWarmingUp: false, 
      isOnline: false, 
      lastError: null,
      retryCount: 0
    });
  }, [updateStatus]);

  return {
    status,
    markAsWarmingUp,
    markAsOnline,
    markAsError,
    reset
  };
}

// Hook simplificado para componentes que solo necesitan mostrar el estado
export function useServerStatusDisplay() {
  const [status, setStatus] = useState<ServerStatus>(globalServerStatus);

  useEffect(() => {
    const listener = (newStatus: ServerStatus) => {
      setStatus(newStatus);
    };
    
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return status;
}