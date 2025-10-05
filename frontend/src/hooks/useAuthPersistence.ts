// hooks/useAuthPersistence.ts - Sistema de persistencia de autenticación mejorado
import { useState, useEffect } from 'react';
import { setAuthCookie, removeAuthCookie } from '@/lib/utils/cookies';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  rememberMe?: boolean;
}

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

const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
  LAST_LOGIN: 'last_login'
};

export function useAuthPersistence() {
  const [persistenceType, setPersistenceType] = useState<'localStorage' | 'sessionStorage'>('sessionStorage');

  // Detectar tipo de almacenamiento preferido
  useEffect(() => {
    const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    if (rememberMe === 'true') {
      setPersistenceType('localStorage');
    }
  }, []);

  // Obtener el storage apropiado
  const getStorage = () => {
    if (typeof window === 'undefined') return null;
    return persistenceType === 'localStorage' ? localStorage : sessionStorage;
  };

  // Guardar datos de autenticación
  const saveAuthData = (user: User, tokens: AuthTokens, rememberMe: boolean = false) => {
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      
      // Limpiar el otro storage para evitar conflictos
      otherStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
      otherStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      // Guardar en el storage apropiado
      storage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify({
        ...tokens,
        rememberMe
      }));
      storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      storage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
      
      // Guardar preferencia de "recordarme"
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      }
      
      // 🍪 IMPORTANTE: Establecer cookie para el middleware
      const cookieData = JSON.stringify({
        userId: user.id,
        token: tokens.accessToken,
        timestamp: Date.now()
      });
      setAuthCookie(cookieData, rememberMe);
      
      setPersistenceType(rememberMe ? 'localStorage' : 'sessionStorage');
      
      console.log(`✅ Datos guardados en ${rememberMe ? 'localStorage' : 'sessionStorage'} y cookie`);
      
    } catch (error) {
      console.error('Error guardando datos de autenticación:', error);
    }
  };

  // Cargar datos de autenticación
  const loadAuthData = (): { user: User | null; tokens: AuthTokens | null } => {
    try {
      // Intentar cargar desde localStorage primero (sesión persistente)
      let storage = localStorage;
      let tokens = localStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
      let userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      // Si no hay en localStorage, intentar sessionStorage
      if (!tokens || !userData) {
        storage = sessionStorage;
        tokens = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
        userData = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
      }
      
      if (tokens && userData) {
        const parsedTokens = JSON.parse(tokens);
        const parsedUser = JSON.parse(userData);
        
        // Verificar si la sesión no ha expirado (para localStorage)
        if (storage === localStorage) {
          const lastLogin = storage.getItem(STORAGE_KEYS.LAST_LOGIN);
          if (lastLogin) {
            const daysSinceLogin = (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24);
            // Si han pasado más de 30 días, limpiar sesión
            if (daysSinceLogin > 30) {
              console.log('🔄 Sesión expirada (más de 30 días), limpiando datos');
              clearAuthData();
              return { user: null, tokens: null };
            }
          }
        }
        
        console.log(`✅ Datos cargados desde ${storage === localStorage ? 'localStorage' : 'sessionStorage'}`);
        setPersistenceType(storage === localStorage ? 'localStorage' : 'sessionStorage');
        
        return { 
          user: parsedUser, 
          tokens: parsedTokens 
        };
      }
      
      return { user: null, tokens: null };
      
    } catch (error) {
      console.error('Error cargando datos de autenticación:', error);
      return { user: null, tokens: null };
    }
  };

  // Limpiar datos de autenticación
  const clearAuthData = () => {
    try {
      // Limpiar ambos storages
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
      sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
      sessionStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
      
      // 🍪 IMPORTANTE: Eliminar cookie de autenticación
      removeAuthCookie();
      
      console.log('🧹 Datos de autenticación limpiados (storage + cookie)');
      
    } catch (error) {
      console.error('Error limpiando datos de autenticación:', error);
    }
  };

  // Actualizar timestamp de última actividad
  const updateLastActivity = () => {
    try {
      const storage = getStorage();
      if (storage && storage.getItem(STORAGE_KEYS.AUTH_TOKENS)) {
        storage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
      }
    } catch (error) {
      console.error('Error actualizando última actividad:', error);
    }
  };

  // Verificar si la sesión debe persistir
  const shouldPersistSession = (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
  };

  // Migrar sesión de sessionStorage a localStorage (cuando se activa "Recordarme")
  const persistCurrentSession = () => {
    try {
      const tokens = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
      const userData = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (tokens && userData) {
        const parsedTokens = JSON.parse(tokens);
        const parsedUser = JSON.parse(userData);
        
        // Mover a localStorage
        saveAuthData(parsedUser, parsedTokens, true);
        
        // Limpiar sessionStorage
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
        sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
        sessionStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
        
        console.log('🔄 Sesión migrada a almacenamiento persistente');
      }
    } catch (error) {
      console.error('Error persistiendo sesión actual:', error);
    }
  };

  return {
    saveAuthData,
    loadAuthData,
    clearAuthData,
    updateLastActivity,
    shouldPersistSession,
    persistCurrentSession,
    persistenceType
  };
}

export default useAuthPersistence;