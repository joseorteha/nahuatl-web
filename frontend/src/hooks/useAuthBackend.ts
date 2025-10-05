import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthPersistence } from './useAuthPersistence';
import { robustApiCall, warmUpServer } from '@/lib/utils/apiUtils';

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

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export function useAuthBackend() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const router = useRouter();
  const authPersistence = useAuthPersistence();
  
  // Ref para evitar múltiples llamadas simultáneas
  const refreshing = useRef(false);

  // URL base de la API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Función para renovar tokens
  const refreshTokens = useCallback(async (): Promise<AuthTokens | null> => {
    if (refreshing.current || !tokens?.refreshToken) {
      return null;
    }

    refreshing.current = true;

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken,
        }),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        const newTokens: AuthTokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        };
        
        setTokens(newTokens);
        localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
        return newTokens;
      } else {
        // Si no se puede renovar, limpiar todo
        signOut();
        return null;
      }
    } catch (error) {
      console.error('Error renovando tokens:', error);
      signOut();
      return null;
    } finally {
      refreshing.current = false;
    }
  }, [tokens?.refreshToken, API_URL]);

  // Función para hacer llamadas a la API con token
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = tokens?.accessToken;
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    // Si el token expiró, intentar renovarlo
    if (response.status === 401 && tokens?.refreshToken) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        // Reintentar la llamada con el nuevo token
        return fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(refreshed.accessToken && { Authorization: `Bearer ${refreshed.accessToken}` }),
            ...options.headers,
          },
        });
      }
    }

    return response;
  }, [tokens, API_URL, refreshTokens]);

  // Función de login
  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setLoading(true);
      
      // Intentar calentar el servidor primero
      console.log('🔥 Preparando conexión con el servidor...');
      await warmUpServer(API_URL);
      
      const response = await robustApiCall(`${API_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        timeout: 30000, // 30 segundos para cold starts
        retries: 3
      });

      if (response.success && response.data) {
        const authTokens: AuthTokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
        };

        setUser(response.data.user);
        setTokens(authTokens);
        
        // Usar el nuevo sistema de persistencia
        authPersistence.saveAuthData(response.data.user, authTokens, rememberMe);
        
        return { success: true, user: response.data.user };
      } else {
        return { 
          success: false, 
          error: response.error || 'Error de autenticación'
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: 'Error de conexión. El servidor puede estar iniciando, intenta de nuevo en unos segundos.'
      };
    } finally {
      setLoading(false);
    }
  }, [API_URL, authPersistence]);

  // Función de registro
  const register = useCallback(async (userData: {
    email: string;
    password: string;
    nombre_completo: string;
    username?: string;
  }) => {
    try {
      setLoading(true);
      
      // Intentar calentar el servidor primero
      console.log('🔥 Preparando conexión con el servidor para registro...');
      await warmUpServer(API_URL);
      
      const response = await robustApiCall(`${API_URL}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(userData),
        timeout: 30000, // 30 segundos para cold starts
        retries: 3
      });

      if (response.success && response.data) {
        const authTokens: AuthTokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
        };

        setUser(response.data.user);
        setTokens(authTokens);
        
        // Usar el nuevo sistema de persistencia (auto-recordar en registro)
        authPersistence.saveAuthData(response.data.user, authTokens, true);
        
        return { success: true, user: response.data.user };
      } else {
        return { 
          success: false, 
          error: response.error || 'Error en el registro'
        };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: 'Error de conexión. El servidor puede estar iniciando, intenta de nuevo en unos segundos.'
      };
    } finally {
      setLoading(false);
    }
  }, [API_URL, authPersistence]);

  // Función de logout
  const signOut = useCallback(async () => {
    try {
      // Llamar al endpoint de logout si hay token
      if (tokens?.accessToken) {
        await apiCall('/api/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local usando el nuevo sistema
      setUser(null);
      setTokens(null);
      authPersistence.clearAuthData();
      router.push('/');
    }
  }, [tokens, router, authPersistence]);

  // Función para actualizar perfil
  const updateProfile = useCallback(async (updateData: Partial<User>) => {
    if (!user) return { success: false, error: 'No hay usuario autenticado' };

    try {
      const response = await robustApiCall(`${API_URL}/api/auth/profile/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: tokens?.accessToken ? { 
          'Authorization': `Bearer ${tokens.accessToken}` 
        } : {},
        timeout: 15000, // 15 segundos suficiente para actualizaciones
        retries: 2
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        
        // Actualizar los datos del usuario manteniendo la persistencia actual
        if (tokens) {
          const rememberMe = authPersistence.shouldPersistSession();
          authPersistence.saveAuthData(response.data.user, tokens, rememberMe);
        }
        
        return { success: true, user: response.data.user };
      } else {
        return { 
          success: false, 
          error: response.error || 'Error actualizando perfil' 
        };
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return { 
        success: false, 
        error: 'Error de conexión al actualizar perfil' 
      };
    }
  }, [user, tokens, API_URL, authPersistence]);

  // Cargar datos de autenticación al inicializar
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        setLoading(true);
        
        // Usar el nuevo sistema de persistencia
        const { user: storedUser, tokens: storedTokens } = authPersistence.loadAuthData();

        if (storedTokens && storedUser) {
          setTokens(storedTokens);
          setUser(storedUser);
          
          // Actualizar timestamp de actividad
          authPersistence.updateLastActivity();

          // Verificar si el token sigue siendo válido (solo si tenemos tokens)
          if (storedTokens?.accessToken) {
            try {
              const response = await fetch(`${API_URL}/api/auth/profile/${storedUser.id}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${storedTokens.accessToken}`,
                },
              });
              
              if (!response.ok) {
                // Token inválido, limpiar datos
                console.log('Token inválido, limpiando datos de autenticación');
                setUser(null);
                setTokens(null);
                authPersistence.clearAuthData();
              }
            } catch (error) {
              console.error('Error verificando token:', error);
              setUser(null);
              setTokens(null);
              authPersistence.clearAuthData();
            }
          }
        }
      } catch (error) {
        console.error('Error cargando datos de autenticación:', error);
        setUser(null);
        setTokens(null);
        authPersistence.clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, [API_URL, authPersistence]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    signOut,
    updateProfile,
    apiCall, // Exponer para llamadas personalizadas
  };
}
