'use client';

import React, { createContext, useContext, ReactNode, useRef, useEffect } from 'react';
import { useAuthBackend } from '@/hooks/useAuthBackend';

interface User {
  id: string;
  email: string;
  username?: string;
  nombre_completo: string;
  rol: 'usuario' | 'moderador' | 'admin';
  fecha_creacion: string;
  fecha_actualizacion: string;
  url_avatar?: string;
  es_beta_tester: boolean;
  contador_feedback: number;
  biografia?: string;
  ubicacion?: string;
  sitio_web?: string;
  verificado: boolean;
  privacidad_perfil: 'publico' | 'amigos' | 'privado';
  mostrar_puntos: boolean;
  mostrar_nivel: boolean;
  notificaciones_email: boolean;
  notificaciones_push: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  register: (userData: any) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updateData: Partial<User>) => Promise<any>;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

// Exportar el contexto para uso avanzado (como en ConditionalHeader)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// 🔥 SINGLETON MEJORADO CON CONTROL DE INICIALIZACIÓN
let GLOBAL_AUTH_INSTANCE: AuthContextType | null = null;
let PROVIDER_INITIALIZED = false;
let RENDER_COUNT = 0;

/**
 * 🔒 AUTH CONTEXT PROVIDER - ROBUST SINGLETON
 */
export function AuthProvider({ children }: AuthProviderProps) {
  RENDER_COUNT++;
  
  // ⚠️ DETECTAR LOOPS INFINITOS
  if (RENDER_COUNT > 5) {
    console.warn(`⚠️ AuthProvider rendered ${RENDER_COUNT} times - possible infinite loop`);
  }
  
  const localAuth = useAuthBackend();
  
  // ✅ PREVENIR MULTIPLE INICIALIZACIONES
  if (!PROVIDER_INITIALIZED) {
    console.log(`✅ Inicializando AuthProvider por primera vez (render #${RENDER_COUNT})`);
    GLOBAL_AUTH_INSTANCE = localAuth;
    PROVIDER_INITIALIZED = true;
  } else {
    // Solo actualizar si hay cambios MUY específicos
    const hasSignificantChange = (
      GLOBAL_AUTH_INSTANCE &&
      (
        // Usuario cambió
        (GLOBAL_AUTH_INSTANCE.user?.id !== localAuth.user?.id) ||
        // Se completó la carga inicial  
        (GLOBAL_AUTH_INSTANCE.loading && !localAuth.loading && localAuth.user)
      )
    );

    if (hasSignificantChange) {
      console.log(`🔄 AuthProvider: Cambio significativo detectado (render #${RENDER_COUNT})`);
      GLOBAL_AUTH_INSTANCE = localAuth;
    }
  }

  return (
    <AuthContext.Provider value={GLOBAL_AUTH_INSTANCE || localAuth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  
  return context;
}