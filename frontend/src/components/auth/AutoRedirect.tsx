'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthPersistence } from '@/hooks/useAuthPersistence';

interface AutoRedirectProps {
  redirectTo?: string;
}

export default function AutoRedirect({ redirectTo = '/dashboard' }: AutoRedirectProps) {
  const router = useRouter();
  const authPersistence = useAuthPersistence();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        setIsChecking(true);
        
        // Solo verificar en la página principal
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          setIsChecking(false);
          return;
        }

        // Pequeño delay para evitar flickering
        await new Promise(resolve => setTimeout(resolve, 300));

        // Verificar si hay datos de autenticación almacenados
        const authData = authPersistence.loadAuthData();
        
        if (authData?.user && authData?.tokens) {
          // Verificar que la sesión no haya expirado usando el timestamp interno
          const tokensData = authData.tokens as any;
          if (tokensData.expiresIn) {
            const expiresAt = parseInt(tokensData.expiresIn);
            const now = Date.now();
            
            if (expiresAt > now) {
              console.log('🔄 Usuario autenticado detectado en landing, redirigiendo a:', redirectTo);
              router.push(redirectTo);
              return;
            } else {
              console.log('⚠️ Token expirado, limpiando datos');
              authPersistence.clearAuthData();
            }
          } else {
            // Si no hay expiresIn, verificar por fecha de último login
            console.log('🔄 Usuario autenticado sin timestamp, redirigiendo a:', redirectTo);
            router.push(redirectTo);
            return;
          }
        }
        
        console.log('ℹ️ No hay sesión activa, mostrando landing');
      } catch (error) {
        console.error('❌ Error verificando autenticación para auto-redirect:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthAndRedirect();
  }, [router, redirectTo, authPersistence]);

  // Mostrar un indicador discreto mientras verifica
  if (isChecking) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-lg px-3 py-2 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">Verificando sesión...</span>
          </div>
        </div>
      </div>
    );
  }

  // Este componente no renderiza nada cuando no está verificando
  return null;
}