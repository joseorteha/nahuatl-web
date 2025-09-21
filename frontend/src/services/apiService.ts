// services/apiService.ts
import { UserProfile, UserStats, FeedbackCompartido, FeedbackGuardado, LikeDado } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

interface FeedbackItem {
  id: string;
  titulo: string;
  contenido: string;
  categoria: string;
  estado: string;
  prioridad: string;
  contador_likes: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_id: string;
  perfiles?: {
    nombre_completo: string;
    username?: string;
    url_avatar?: string;
  };
  retroalimentacion_respuestas?: Array<{
    id: string;
    contenido: string;
    fecha_creacion: string;
    es_respuesta_admin: boolean;
    perfiles?: {
      nombre_completo: string;
      url_avatar?: string;
    };
  }>;
  retroalimentacion_likes?: Array<{
    usuario_id: string;
  }>;
}

interface UserRewards {
  puntos_totales: number;
  nivel: string;
  experiencia: number;
  fecha_actualizacion: string;
}



export class ApiService {
  // ============ FEEDBACK ENDPOINTS ============
  
  static async getFeedbacks(): Promise<ApiResponse<FeedbackItem[]>> {
    try {
      const response = await fetch(`${API_URL}/api/feedback`);
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al cargar feedbacks' };
      }
      
      const data = await response.json();
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async createFeedback(feedbackData: {
    user_id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
  }): Promise<ApiResponse<FeedbackItem>> {
    try {
      // Obtener token del localStorage
      const storedTokens = localStorage.getItem('auth_tokens');
      const tokens = storedTokens ? JSON.parse(storedTokens) : null;
      
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` })
        },
        body: JSON.stringify(feedbackData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Error al enviar feedback' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error creating feedback:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async likeFeedback(data: {
    user_id: string;
    feedback_id: string;
  }): Promise<ApiResponse<{ action: 'liked' | 'unliked' }>> {
    try {
      // Obtener token del localStorage
      const storedTokens = localStorage.getItem('auth_tokens');
      const tokens = storedTokens ? JSON.parse(storedTokens) : null;
      
      const response = await fetch(`${API_URL}/api/feedback/like`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` })
        },
        body: JSON.stringify({
          feedback_id: data.feedback_id
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Error al procesar el voto' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async replyToFeedback(data: {
    user_id: string;
    feedback_id: string;
    content: string;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      // Obtener token del localStorage
      const storedTokens = localStorage.getItem('auth_tokens');
      const tokens = storedTokens ? JSON.parse(storedTokens) : null;
      
      const response = await fetch(`${API_URL}/api/feedback/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` })
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Error al responder' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error replying to feedback:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async deleteFeedback(feedbackId: string, userId: string): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const response = await fetch(`${API_URL}/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Error al eliminar feedback' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async updateFeedback(feedbackId: string, updateData: {
    title?: string;
    content?: string;
    category?: string;
    priority?: string;
    user_id: string;
  }): Promise<ApiResponse<FeedbackItem>> {
    try {
      const response = await fetch(`${API_URL}/api/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Error al actualizar feedback' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating feedback:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  // ============ REWARDS ENDPOINTS ============
  
  static async getUserRewards(userId: string): Promise<ApiResponse<UserRewards>> {
    try {
      const response = await fetch(`${API_URL}/api/recompensas/usuario/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al cargar recompensas' };
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    try {
      // Obtener recompensas básicas
      const rewardsResponse = await this.getUserRewards(userId);
      if (!rewardsResponse.success || !rewardsResponse.data) {
        return { success: false, error: 'Error al cargar estadísticas del usuario' };
      }

      // Por ahora, crear stats básicas desde las recompensas hasta que el backend esté listo
      return {
        success: true,
        data: {
          puntos_totales: rewardsResponse.data.puntos_totales,
          nivel: rewardsResponse.data.nivel,
          contribuciones_aprobadas: 0, // Temporal
          likes_recibidos: 0, // Temporal
          feedbacks_creados: 0, // Temporal
          seguidores: 0, // Temporal
          siguiendo: 0 // Temporal
        }
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      // Obtener token del localStorage
      const storedTokens = localStorage.getItem('auth_tokens');
      const tokens = storedTokens ? JSON.parse(storedTokens) : null;
      
      const response = await fetch(`${API_URL}/api/auth/profile/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` })
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al cargar perfil' };
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async getUserFeedbacks(userId: string): Promise<ApiResponse<FeedbackItem[]>> {
    try {
      const response = await fetch(`${API_URL}/api/feedback/usuario/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al cargar feedbacks del usuario' };
      }
      
      const data = await response.json();
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching user feedbacks:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async getUserSharedFeedbacks(userId: string): Promise<ApiResponse<FeedbackCompartido[]>> {
    try {
      const response = await fetch(`${API_URL}/api/social/feedback/compartidos/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al cargar feedbacks compartidos' };
      }
      
      const data = await response.json();
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching shared feedbacks:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async getUserSavedFeedbacks(userId: string): Promise<ApiResponse<FeedbackGuardado[]>> {
    try {
      const response = await fetch(`${API_URL}/api/social/feedback/guardados/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al cargar feedbacks guardados' };
      }
      
      const data = await response.json();
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching saved feedbacks:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async getUserLikes(userId: string): Promise<ApiResponse<LikeDado[]>> {
    try {
      const response = await fetch(`${API_URL}/api/social/feedback/likes/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al cargar likes dados' };
      }
      
      const data = await response.json();
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching user likes:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }

  static async awardPoints(data: {
    userId: string;
    points: number;
    motivo: string;
    descripcion: string;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const response = await fetch(`${API_URL}/api/recompensas/procesar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.userId,
          accion: data.motivo,
          datos: {
            puntos: data.points,
            descripcion: data.descripcion
          }
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        console.warn('Error awarding points:', result);
        // No fallar silenciosamente para no interrumpir el flujo
        return { success: false, error: result.error || 'Error al otorgar puntos' };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error awarding points:', error);
      // No fallar para no interrumpir el flujo principal
      return { success: false, error: 'Error de conexión al servidor' };
    }
  }
}

export default ApiService;