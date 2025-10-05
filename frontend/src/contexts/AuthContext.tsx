'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';

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

// 🔥 SINGLETON GLOBAL - ÚNICA INSTANCIA
let GLOBAL_AUTH_INITIALIZED = false;

/**
 * 🔒 AUTH CONTEXT PROVIDER - IMPLEMENTACIÓN SIMPLE Y REACTIVA
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // ✅ SINGLETON: Solo inicializar una vez
  if (GLOBAL_AUTH_INITIALIZED) {
    // Retornar sin re-renderizar el hook
    return <AuthContextComponent>{children}</AuthContextComponent>;
  }

  GLOBAL_AUTH_INITIALIZED = true;
  console.log('🚀 AuthProvider: Inicializando por primera vez');
  
  return <AuthContextComponent>{children}</AuthContextComponent>;
}

/**
 * 🎯 COMPONENTE DE CONTEXTO INTERNO - CON REACT HOOKS
 */
function AuthContextComponent({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<any>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // 🔥 FUNCIÓN PARA HACER LLAMADAS AUTENTICADAS
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = tokens?.accessToken;
    
    console.log(`🔗 API Call: ${endpoint}`);
    console.log(`🎫 Token: ${token ? `${token.substring(0, 20)}...` : 'AUSENTE'}`);
    console.log(`👤 User: ${user ? user.id : 'NO USER'}`);
    
    return await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    });
  }, [tokens?.accessToken, API_URL, user]);

  // 🔑 FUNCIÓN DE LOGIN
  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login exitoso, guardando datos...', { user: data.user.id });
        
        setUser(data.user);
        setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        });
        
        // Guardar en localStorage para persistencia
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          localStorage.setItem('auth_tokens', JSON.stringify({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn,
          }));
        }
        
        return { success: true, user: data.user };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }, [API_URL]);

  // 📝 FUNCIÓN DE REGISTRO
  const register = useCallback(async (userData: any) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, user: data.user };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }, [API_URL]);

  // 🚪 FUNCIÓN DE LOGOUT
  const signOut = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error en logout:', error);
    }
    
    setUser(null);
    setTokens(null);
    
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_tokens');
    }
  }, [API_URL]);

  // ✏️ FUNCIÓN PARA ACTUALIZAR PERFIL
  const updateProfile = useCallback(async (updateData: Partial<User>) => {
    try {
      const response = await apiCall(`/api/usuarios/profile`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }, [apiCall]);

  // 🔄 INICIALIZACIÓN UNA SOLA VEZ
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔑 AuthProvider: Inicializando autenticación...');
      
      try {
        // Intentar cargar desde localStorage
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('auth_user');
          const savedTokens = localStorage.getItem('auth_tokens');
          
          if (savedUser && savedTokens) {
            console.log('📱 Restaurando sesión desde localStorage...');
            const userData = JSON.parse(savedUser);
            const tokensData = JSON.parse(savedTokens);
            
            setUser(userData);
            setTokens(tokensData);
            setLoading(false);
            return;
          }
        }

        // Solo verificar sesión en servidor si no hay datos locales y no es Vercel
        if (typeof window !== 'undefined' && !window.location.hostname.includes('vercel.app')) {
          console.log('🍪 Verificando sesión en servidor...');
          const response = await fetch(`${API_URL}/api/auth/check-session`, {
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Sesión restaurada desde cookies del servidor');
            setUser(data.user);
            
            // Guardar en localStorage también
            localStorage.setItem('auth_user', JSON.stringify(data.user));
          }
        }
      } catch (error) {
        console.error('❌ Error iniciando sesión:', error);
        
        // En producción, mostrar información útil para debugging
        if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
          console.log('🌍 Entorno de producción detectado');
          console.log('📡 API_URL configurada:', API_URL);
          console.log('🔗 Intentando conectar con backend...');
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Sin dependencias - solo una vez

  const authValue = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    signOut,
    updateProfile,
    apiCall,
  };

  return (
    <AuthContext.Provider value={authValue}>
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