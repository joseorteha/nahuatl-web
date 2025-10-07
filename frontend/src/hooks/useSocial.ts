import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Interfaces para las funcionalidades sociales
export interface Hashtag {
  id: string;
  nombre: string;
  color: string;
  descripcion?: string;
  uso_contador: number;
}

export interface Seguimiento {
  id: string;
  fecha_seguimiento: string;
  seguidor?: {
    id: string;
    nombre_completo: string;
    username?: string;
    url_avatar?: string;
    verificado: boolean;
    recompensas_usuario?: {
      nivel: string;
      puntos_totales: number;
    };
  };
  seguido?: {
    id: string;
    nombre_completo: string;
    username?: string;
    url_avatar?: string;
    verificado: boolean;
    recompensas_usuario?: {
      nivel: string;
      puntos_totales: number;
    };
  };
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo_notificacion: 'like_recibido' | 'respuesta_recibida' | 'mencion' | 'nuevo_seguidor' | 'logro_obtenido' | 'feedback_aprobado' | 'feedback_rechazado' | 'puntos_ganados';
  titulo: string;
  mensaje: string;
  relacionado_id?: string;
  relacionado_tipo?: 'feedback' | 'respuesta' | 'usuario' | 'logro' | 'tema';
  fecha_creacion: string;
  leida: boolean;
  fecha_leida?: string;
}

export interface FeedbackGuardado {
  id: string;
  fecha_guardado: string;
  notas_personales?: string;
  retroalimentacion: {
    id: string;
    titulo: string;
    contenido: string;
    categoria: string;
    contador_likes: number;
    compartido_contador: number;
    guardado_contador: number;
    fecha_creacion: string;
    usuario: {
      id: string;
      nombre_completo: string;
      username?: string;
      url_avatar?: string;
      verificado: boolean;
    };
  };
}

export interface FeedbackCompartido {
  id: string;
  fecha_compartido: string;
  comentario_compartir?: string;
  retroalimentacion: {
    id: string;
    titulo: string;
    contenido: string;
    usuario: {
      id: string;
      nombre_completo: string;
      username?: string;
      url_avatar?: string;
      verificado: boolean;
    };
  };
}


export const useSocial = () => {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==============================================
  // SEGUIMIENTOS
  // ==============================================

  const seguirUsuario = useCallback(async (usuarioId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/social/seguir/${usuarioId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al seguir usuario');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al seguir usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const dejarDeSeguir = useCallback(async (usuarioId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/social/seguir/${usuarioId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al dejar de seguir usuario');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al dejar de seguir usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const obtenerSeguidores = useCallback(async (usuarioId: string, page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/social/seguidores/${usuarioId}?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener seguidores');
      }
      
      const data = await response.json();
      return data.data || data; // Asegurar que devolvemos los datos correctos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener seguidores';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const obtenerSiguiendo = useCallback(async (usuarioId: string, page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/social/siguiendo/${usuarioId}?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener siguiendo');
      }
      
      const data = await response.json();
      return data.data || data; // Asegurar que devolvemos los datos correctos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener siguiendo';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // ==============================================
  // HASHTAGS
  // ==============================================

  const crearHashtag = useCallback(async (nombre: string, descripcion?: string, color?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall('/api/social/hashtags', {
        method: 'POST',
        body: JSON.stringify({
          nombre,
          descripcion,
          color
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear hashtag');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear hashtag';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const obtenerHashtagsPopulares = useCallback(async (limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/social/hashtags/populares?limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener hashtags');
      }
      
      const data = await response.json();
      return data.data || data; // Asegurar que devolvemos los datos correctos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener hashtags';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // ==============================================
  // COMPARTIR Y GUARDAR FEEDBACK
  // ==============================================

  const compartirFeedback = useCallback(async (feedbackId: string, comentario?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/social/feedback/${feedbackId}/compartir`, {
        method: 'POST',
        body: JSON.stringify({
          comentario
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al compartir feedback');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al compartir feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const guardarFeedback = useCallback(async (feedbackId: string, notas?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/social/feedback/${feedbackId}/guardar`, {
        method: 'POST',
        body: JSON.stringify({
          notas
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar feedback');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const obtenerFeedbackGuardado = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/social/feedback/guardado?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener feedback guardado');
      }
      
      const data = await response.json();
      return data.data || data; // Asegurar que devolvemos los datos correctos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener feedback guardado';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // ==============================================
  // NOTIFICACIONES
  // ==============================================

  const obtenerNotificaciones = useCallback(async (page = 1, limit = 20, soloNoLeidas = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/social/notificaciones?page=${page}&limit=${limit}&soloNoLeidas=${soloNoLeidas}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener notificaciones');
      }
      
      const data = await response.json();
      return data.data || data; // Asegurar que devolvemos los datos correctos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener notificaciones';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const marcarNotificacionLeida = useCallback(async (notificacionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/social/notificaciones/${notificacionId}/leer`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al marcar notificación');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al marcar notificación';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const marcarTodasLeidas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall('/api/social/notificaciones/leer-todas', {
        method: 'PUT'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al marcar todas las notificaciones');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al marcar todas las notificaciones';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return {
    // Estado
    loading,
    error,
    
    // Seguimientos
    seguirUsuario,
    dejarDeSeguir,
    obtenerSeguidores,
    obtenerSiguiendo,
    
    // Hashtags
    crearHashtag,
    obtenerHashtagsPopulares,
    
    // Compartir y guardar
    compartirFeedback,
    guardarFeedback,
    obtenerFeedbackGuardado,
    
    // Notificaciones
    obtenerNotificaciones,
    marcarNotificacionLeida,
    marcarTodasLeidas
  };
};
