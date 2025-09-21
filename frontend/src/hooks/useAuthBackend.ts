import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username?: string;
  nombre_completo: string;
  rol: string;
  fecha_creacion: string;
  url_avatar?: string;
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
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const authTokens: AuthTokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        };

        setUser(data.user);
        setTokens(authTokens);
        localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Error de autenticación' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Función de registro
  const register = useCallback(async (userData: {
    email: string;
    password: string;
    nombre_completo: string;
    username?: string;
  }) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        const authTokens: AuthTokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        };

        setUser(data.user);
        setTokens(authTokens);
        localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Error de registro' };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

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
      // Limpiar estado local
      setUser(null);
      setTokens(null);
      localStorage.removeItem('auth_tokens');
      localStorage.removeItem('user');
      router.push('/');
    }
  }, [tokens, router]);

  // Función para actualizar perfil
  const updateProfile = useCallback(async (updateData: Partial<User>) => {
    if (!user) return { success: false, error: 'No hay usuario autenticado' };

    try {
      const response = await apiCall(`/api/auth/profile/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Error actualizando perfil' };
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }, [user]);

  // Cargar datos de autenticación al inicializar
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        const storedUser = localStorage.getItem('user');

        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens);
          const parsedUser = JSON.parse(storedUser);

          setTokens(parsedTokens);
          setUser(parsedUser);

          // Verificar si el token sigue siendo válido (solo si tenemos tokens)
          if (parsedTokens?.accessToken) {
            try {
              const response = await fetch(`${API_URL}/api/auth/profile/${parsedUser.id}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${parsedTokens.accessToken}`,
                },
              });
              
              if (!response.ok) {
                // Token inválido, limpiar datos
                console.log('Token inválido, limpiando datos de autenticación');
                setUser(null);
                setTokens(null);
                localStorage.removeItem('auth_tokens');
                localStorage.removeItem('user');
              }
            } catch (error) {
              console.error('Error verificando token:', error);
              setUser(null);
              setTokens(null);
              localStorage.removeItem('auth_tokens');
              localStorage.removeItem('user');
            }
          }
        }
      } catch (error) {
        console.error('Error cargando datos de autenticación:', error);
        setUser(null);
        setTokens(null);
        localStorage.removeItem('auth_tokens');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, [API_URL]);

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
