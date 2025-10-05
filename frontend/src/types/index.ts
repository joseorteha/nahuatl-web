// Tipos compartidos para la aplicación

export interface UserProfile {
  id: string;
  nombre_completo: string;
  username?: string;
  email: string;
  url_avatar?: string;
  verificado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  es_beta_tester: boolean;
  contador_feedback: number;
  rol: 'usuario' | 'moderador' | 'admin';
  biografia?: string;
  ubicacion?: string;
  sitio_web?: string;
  privacidad_perfil: 'publico' | 'amigos' | 'privado';
  mostrar_puntos: boolean;
  mostrar_nivel: boolean;
  notificaciones_email: boolean;
  notificaciones_push: boolean;
  recompensas_usuario?: {
    nivel: string;
    puntos_totales: number;
  };
}

export interface UserStats {
  puntos_totales: number;
  nivel: string;
  contribuciones_aprobadas: number;
  likes_recibidos: number;
  feedbacks_creados: number;
  seguidores: number;
  siguiendo: number;
  posicion_ranking?: number;
}

export interface Feedback {
  id: string;
  titulo: string;
  contenido: string;
  categoria: string;
  contador_likes: number;
  compartido_contador: number;
  guardado_contador: number;
  fecha_creacion: string;
  usuario_id: string;
  usuario?: UserProfile;
  retroalimentacion_likes?: unknown[];
  total_likes: number;
  total_respuestas: number;
  retroalimentacion_respuestas?: unknown[];
}

export interface FeedbackCompartido {
  id: string;
  comentario_compartir?: string;
  fecha_compartido: string;
  retroalimentacion: Feedback;
}

export interface FeedbackGuardado {
  id: string;
  notas_personales?: string;
  fecha_guardado: string;
  retroalimentacion: Feedback;
}

export interface LikeDado {
  id: string;
  fecha_creacion: string;
  retroalimentacion: Feedback;
}

export type TabType = 'temas' | 'respuestas' | 'compartidos' | 'guardados' | 'likes' | 'seguidores' | 'siguiendo';

export interface Seguidor {
  id: string;
  fecha_seguimiento: string;
  seguidor: UserProfile;
}

export interface Siguiendo {
  id: string;
  fecha_seguimiento: string;
  seguido: UserProfile;
}

export interface Notification {
  id: number;
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
