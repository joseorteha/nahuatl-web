// services/apiService.ts
import { UserProfile, UserStats, TemaCompartido, TemaGuardado, LikeDado } from '../../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

interface TemaItem {
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
  temas_respuestas?: Array<{
    id: string;
    contenido: string;
    fecha_creacion: string;
    es_respuesta_admin: boolean;
    perfiles?: {
      nombre_completo: string;
      url_avatar?: string;
    };
  }>;
  temas_likes?: Array<{
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
          temas_creados: 0, // Temporal
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