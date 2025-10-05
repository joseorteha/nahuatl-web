// utils/errorMonitor.ts - Monitor de errores para debugging

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
}

class ErrorMonitor {
  private errors: ErrorInfo[] = [];
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Capturar errores JavaScript globales
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError({
          message: `JavaScript Error: ${event.error?.message || event.message}`,
          stack: event.error?.stack,
          timestamp: new Date(),
          url: window.location.href,
          userAgent: navigator.userAgent
        });
      });

      // Capturar promesas rechazadas
      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          timestamp: new Date(),
          url: window.location.href,
          userAgent: navigator.userAgent
        });
      });

      // Monitor de errores de red
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args);
          if (!response.ok) {
            const url = args[0]?.toString() || '';
            
            // 🔇 Silenciar errores 401 esperados de verificación de sesión
            if (response.status === 401 && url.includes('/api/auth/check-session')) {
              // Este es un error esperado cuando no hay sesión de cookies
              return response;
            }
            
            this.logError({
              message: `Network Error: ${response.status} ${response.statusText} - ${args[0]}`,
              timestamp: new Date(),
              url: window.location.href,
              userAgent: navigator.userAgent
            });
          }
          return response;
        } catch (error) {
          this.logError({
            message: `Fetch Error: ${error instanceof Error ? error.message : String(error)} - ${args[0]}`,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date(),
            url: window.location.href,
            userAgent: navigator.userAgent
          });
          throw error;
        }
      };
    }
  }

  logError(errorInfo: ErrorInfo) {
    this.errors.push(errorInfo);
    
    // En desarrollo, mostrar en consola con formato mejorado
    if (!this.isProduction) {
      console.group('🚨 Error Monitor');
      console.error('Message:', errorInfo.message);
      console.error('Timestamp:', errorInfo.timestamp.toISOString());
      console.error('URL:', errorInfo.url);
      if (errorInfo.stack) {
        console.error('Stack:', errorInfo.stack);
      }
      if (errorInfo.componentStack) {
        console.error('Component Stack:', errorInfo.componentStack);
      }
      console.groupEnd();
    }

    // Mantener solo los últimos 50 errores
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  getRecentErrors(minutes: number = 5): ErrorInfo[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errors.filter(error => error.timestamp >= cutoff);
  }

  clearErrors() {
    this.errors = [];
  }

  // Método para reportar errores de React ErrorBoundary
  reportErrorBoundary(error: Error, errorInfo: any) {
    this.logError({
      message: `React Error Boundary: ${error.message}`,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
    });
  }
}

// Singleton instance
const errorMonitor = new ErrorMonitor();

export default errorMonitor;

// Hook para usar en componentes
export function useErrorMonitor() {
  return {
    errors: errorMonitor.getErrors(),
    recentErrors: errorMonitor.getRecentErrors(),
    clearErrors: () => errorMonitor.clearErrors(),
    reportError: (error: Error, info?: any) => errorMonitor.reportErrorBoundary(error, info)
  };
}