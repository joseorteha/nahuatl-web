// lib/utils/apiUtils.ts - Utilidades para manejo robusto de API con estado global
import { useState, useEffect } from 'react';

// Estado global del servidor para notificaciones
let globalServerStatus = {
  isWarmingUp: false,
  isOnline: false,
  lastError: null as string | null,
  retryCount: 0
};

const statusListeners = new Set<(status: typeof globalServerStatus) => void>();

const notifyStatusChange = () => {
  statusListeners.forEach(listener => listener({ ...globalServerStatus }));
};

export const addStatusListener = (listener: (status: typeof globalServerStatus) => void) => {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
};

const updateServerStatus = (updates: Partial<typeof globalServerStatus>) => {
  globalServerStatus = { ...globalServerStatus, ...updates };
  notifyStatusChange();
};

interface ApiCallOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Función de fetch con reintentos automáticos y mejor manejo de errores
 */
export async function robustApiCall<T = any>(
  url: string, 
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000, // 30 segundos para cold starts
    retries = 3,
    retryDelay = 1000
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 API Call (intento ${attempt}/${retries}): ${method} ${url}`);

      // Actualizar estado: warming up en primer intento
      if (attempt === 1) {
        updateServerStatus({ 
          isWarmingUp: true, 
          lastError: null,
          retryCount: 0 
        });
      }

      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Si la respuesta es exitosa
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API Call exitosa: ${method} ${url}`);
        
        // Actualizar estado: servidor online
        updateServerStatus({ 
          isWarmingUp: false, 
          isOnline: true, 
          lastError: null,
          retryCount: 0 
        });
        
        return {
          success: true,
          data,
          status: response.status
        };
      }

      // Si es un error del servidor que puede ser temporal (5xx)
      if (response.status >= 500 && attempt < retries) {
        console.warn(`⚠️ Error ${response.status}, reintentando en ${retryDelay}ms...`);
        
        updateServerStatus({ 
          isWarmingUp: false, 
          isOnline: false, 
          lastError: `Error ${response.status} del servidor`,
          retryCount: attempt 
        });
        
        await sleep(retryDelay * attempt); // Backoff exponencial
        continue;
      }

      // Si es un error del cliente (4xx) o último intento
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
      
      updateServerStatus({ 
        isWarmingUp: false, 
        isOnline: false, 
        lastError: errorData.message || `Error ${response.status}`,
        retryCount: attempt 
      });
      
      return {
        success: false,
        error: errorData.message || `Error ${response.status}`,
        status: response.status
      };

    } catch (error: any) {
      lastError = error;
      
      if (error.name === 'AbortError') {
        console.warn(`⏱️ Timeout en intento ${attempt}/${retries} (${timeout}ms)`);
      } else {
        console.warn(`🔌 Error de conexión en intento ${attempt}/${retries}:`, error.message);
      }

      // Actualizar estado de error
      updateServerStatus({ 
        isWarmingUp: false, 
        isOnline: false, 
        lastError: error.name === 'AbortError' 
          ? 'Timeout de conexión' 
          : 'Error de conexión',
        retryCount: attempt 
      });

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt - 1); // Backoff exponencial
        console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
        await sleep(delay);
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error(`💥 Todos los intentos fallaron para: ${method} ${url}`);
  
  const finalError = lastError?.name === 'AbortError' 
    ? 'El servidor tardó demasiado en responder. Esto puede deberse a que el servidor esté iniciando.' 
    : 'Error de conexión. Verifica tu conexión a internet.';
    
  updateServerStatus({ 
    isWarmingUp: false, 
    isOnline: false, 
    lastError: finalError,
    retryCount: retries 
  });
  
  return {
    success: false,
    error: finalError,
    status: 0
  };
}

/**
 * Función para hacer ping al servidor y "despertarlo"
 */
export async function warmUpServer(baseUrl: string): Promise<boolean> {
  try {
    console.log('🔥 Calentando servidor...');
    
    updateServerStatus({ 
      isWarmingUp: true, 
      lastError: null 
    });
    
    const response = await robustApiCall(`${baseUrl}/api/health`, {
      timeout: 45000, // 45 segundos para cold start
      retries: 2,
      retryDelay: 2000
    });

    if (response.success) {
      console.log('✅ Servidor listo');
      updateServerStatus({ 
        isWarmingUp: false, 
        isOnline: true, 
        lastError: null 
      });
      return true;
    } else {
      console.warn('⚠️ Servidor no responde correctamente');
      updateServerStatus({ 
        isWarmingUp: false, 
        isOnline: false, 
        lastError: 'Servidor no responde' 
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Error calentando servidor:', error);
    updateServerStatus({ 
      isWarmingUp: false, 
      isOnline: false, 
      lastError: 'Error calentando servidor' 
    });
    return false;
  }
}

/**
 * Hook para manejar el estado de conexión del servidor
 */
export function useServerStatus() {
  const [status, setStatus] = useState(globalServerStatus);

  useEffect(() => {
    const unsubscribe = addStatusListener(setStatus);
    return () => {
      unsubscribe();
    };
  }, []);

  const checkServerStatus = async (baseUrl: string) => {
    return await warmUpServer(baseUrl);
  };

  const retry = () => {
    updateServerStatus({ 
      lastError: null, 
      retryCount: 0 
    });
  };

  return {
    ...status,
    checkServerStatus,
    retry
  };
}

/**
 * Función de sleep para esperas
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Detectar si es probable que el servidor esté en cold start
 */
export function isProbablyColdStart(error: any): boolean {
  return (
    error?.name === 'AbortError' ||
    error?.message?.includes('timeout') ||
    error?.message?.includes('fetch') ||
    error?.status === 0
  );
}

export default robustApiCall;