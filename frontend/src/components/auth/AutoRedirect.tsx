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
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // ⛔ Evitar múltiples verificaciones
    if (hasChecked) return;

    const checkAuthAndRedirect = async () => {
      try {
        setIsChecking(true);
        setHasChecked(true);
        
        // Solo verificar en la página principal
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          setIsChecking(false);
          return;
        }

        // Pequeño delay para evitar flickering
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log('🔍 AutoRedirect: Verificando autenticación...');

        // 1. Primero verificar datos locales (más rápido)
        const authData = authPersistence.loadAuthData();
        
        if (authData?.user && authData?.tokens) {
          const tokensData = authData.tokens as any;
          if (tokensData.expiresIn) {
            const expiresAt = parseInt(tokensData.expiresIn);
            const now = Date.now();
            
            if (expiresAt > now) {
              console.log('🔄 JWT válido encontrado, redirigiendo a:', redirectTo);
              router.push(redirectTo);
              return;
            }
          }
        }

        // 2. También verificar localStorage/sessionStorage básico (usar claves consistentes)
        if (typeof window !== 'undefined') {
          // Buscar en sessionStorage y localStorage (OAuth y login normal)
          const savedUser = sessionStorage.getItem('user_data') || localStorage.getItem('user_data') || localStorage.getItem('auth_user');
          const savedTokens = sessionStorage.getItem('auth_tokens') || localStorage.getItem('auth_tokens');
          
          console.log('🔍 AutoRedirect: Verificando storage...', {
            hasUser: !!savedUser,
            hasTokens: !!savedTokens,
            source: savedUser ? (sessionStorage.getItem('user_data') ? 'sessionStorage' : 'localStorage') : 'none'
          });
          
          if (savedUser && savedTokens) {
            console.log('📱 Usuario encontrado en storage, redirigiendo a:', redirectTo);
            router.push(redirectTo);
            return;
          }
        }

        // 3. Solo si no hay datos locales, verificar sesión de cookies en el servidor
        console.log('🍪 No hay datos locales, verificando sesión de cookies en el servidor...');
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        try {
          const response = await fetch(`${API_URL}/api/auth/check-session`, {
            method: 'GET',
            credentials: 'include', // ✨ INCLUIR COOKIES
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const sessionData = await response.json();
            
            if (sessionData.success && sessionData.user) {
              console.log('🍪 Sesión de cookies válida encontrada, guardando datos y redirigiendo');
              
              // Guardar datos de sesión localmente para futuras verificaciones
              const authTokens = {
                accessToken: sessionData.accessToken,
                refreshToken: sessionData.refreshToken,
                expiresIn: sessionData.expiresIn,
              };
              
              // Determinar si guardar persistente basado en tipo de sesión
              const shouldPersist = sessionData.sessionType === 'oauth' || 
                                  localStorage.getItem('remember_me') === 'true';
              
              authPersistence.saveAuthData(sessionData.user, authTokens, shouldPersist);
              
              console.log('🔄 Datos de sesión guardados, redirigiendo a:', redirectTo);
              router.push(redirectTo);
              return;
            }
          } else {
            console.log('🍪 No hay sesión de cookies válida en el servidor');
          }
        } catch (error) {
          // ⚠️ MANEJO MEJORADO DE ERRORES CORS
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.log('⚠️ Backend no disponible o problemas de CORS (normal durante despliegues)');
            console.log('ℹ️ El usuario puede usar sesiones locales mientras el backend se actualiza');
          } else {
            console.log('⚠️ Error verificando sesión de cookies:', error);
          }
        }
        
        console.log('ℹ️ No hay sesión activa (ni JWT ni cookies), mostrando landing');
      } catch (error) {
        console.error('❌ Error verificando autenticación para auto-redirect:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthAndRedirect();
  }, []); // ⛔ Solo ejecutar una vez al montar

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