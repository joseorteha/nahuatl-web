// lib/config/api.ts
const API_BASE_URL = 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    PROFILE: (userId: string) => `${API_BASE_URL}/api/auth/profile/${userId}`,
    STATS: (userId: string) => `${API_BASE_URL}/api/auth/stats/${userId}`,
  },
  
  // Profile
  PROFILE: {
    CONOCIMIENTO: (userId: string) => `${API_BASE_URL}/api/profile/conocimiento/${userId}`,
    COMUNIDAD: (userId: string) => `${API_BASE_URL}/api/profile/comunidad/${userId}`,
    RESUMEN: (userId: string) => `${API_BASE_URL}/api/profile/resumen/${userId}`,
  },
  
  // Logros
  LOGROS: {
    USUARIO: (userId: string) => `${API_BASE_URL}/api/logros/usuario/${userId}`,
    DISPONIBLES: `${API_BASE_URL}/api/logros/disponibles`,
    INICIALIZAR: `${API_BASE_URL}/api/logros/inicializar`,
    VERIFICAR: (userId: string) => `${API_BASE_URL}/api/logros/verificar/${userId}`,
  },
  
  // Recompensas
  RECOMPENSAS: {
    USUARIO: (userId: string) => `${API_BASE_URL}/api/recompensas/usuario/${userId}`,
  },
  
  // Dictionary
  DICTIONARY: {
    SEARCH: `${API_BASE_URL}/api/dictionary/search`,
    SAVED: (userId: string) => `${API_BASE_URL}/api/dictionary/saved/${userId}`,
    SAVE: `${API_BASE_URL}/api/dictionary/save`,
  },
  
  // Social
  SOCIAL: {
    SEGUIDORES: (userId: string) => `${API_BASE_URL}/api/social/seguidores/${userId}`,
    SIGUIENDO: (userId: string) => `${API_BASE_URL}/api/social/siguiendo/${userId}`,
    SEGUIR: `${API_BASE_URL}/api/social/seguir`,
    DEJAR_SEGUIR: `${API_BASE_URL}/api/social/dejar-seguir`,
  },
  
  
  // Temas
  TEMAS: {
    LIST: `${API_BASE_URL}/api/temas`,
    CREATE: `${API_BASE_URL}/api/temas`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/temas/${id}`,
    RESPONDER: (id: string) => `${API_BASE_URL}/api/temas/${id}/responder`,
    LIKE: (id: string) => `${API_BASE_URL}/api/temas/${id}/like`,
    SHARE: (id: string) => `${API_BASE_URL}/api/temas/${id}/share`,
  },
  
  // Contributions
  CONTRIBUTIONS: {
    CREATE: `${API_BASE_URL}/api/contributions`,
    BY_USER: (userId: string) => `${API_BASE_URL}/api/contributions/usuario/${userId}`,
    APPROVE: (id: string) => `${API_BASE_URL}/api/contributions/${id}/aprobar`,
    REJECT: (id: string) => `${API_BASE_URL}/api/contributions/${id}/rechazar`,
  },

  // Push Notifications
  PUSH: {
    SUBSCRIBE: `${API_BASE_URL}/api/push/subscribe`,
    UNSUBSCRIBE: `${API_BASE_URL}/api/push/unsubscribe`,
    VAPID_KEY: `${API_BASE_URL}/api/push/vapid-public-key`,
    TEST: `${API_BASE_URL}/api/push/test`,
    SEND: `${API_BASE_URL}/api/push/send`,
    STATS: `${API_BASE_URL}/api/push/stats`,
  },
};

export default API_ENDPOINTS;
