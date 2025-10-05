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

// 🔥 SINGLETON SIMPLE PERO EFECTIVO
let GLOBAL_AUTH_INSTANCE: AuthContextType | null = null;

/**
 * 🔒 AUTH CONTEXT PROVIDER - SIMPLE SINGLETON
 */
export function AuthProvider({ children }: AuthProviderProps) {
  console.log(`🔥 AuthProvider ejecutándose...`, new Date().toISOString());
  
  // SIEMPRE crear la instancia local (respeta reglas de hooks)
  const localAuth = useAuthBackend();
  
  // ✅ CORRECCIÓN SIMPLE: Siempre usar la instancia local más reciente
  // Si no existe global O si el local no está loading, usar el local
  if (!GLOBAL_AUTH_INSTANCE) {
    console.log(`✅ Estableciendo instancia global por PRIMERA VEZ`);
    GLOBAL_AUTH_INSTANCE = localAuth;
  } else if (!localAuth.loading && GLOBAL_AUTH_INSTANCE.loading) {
    // Si la instancia local terminó loading pero la global no, actualizar
    console.log(`🔄 Instancia local terminó loading, actualizando global`);
    GLOBAL_AUTH_INSTANCE = localAuth;
  } else {
    console.log(`♻️ Instancia global YA EXISTE - ignorando nueva instancia`);
    console.log(`🔍 Loading states: global=${GLOBAL_AUTH_INSTANCE.loading}, local=${localAuth.loading}`);
  }

  return (
    <AuthContext.Provider value={GLOBAL_AUTH_INSTANCE}>
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