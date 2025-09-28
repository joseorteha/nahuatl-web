// Tipos y interfaces para el backend
// Este archivo puede ser expandido con definiciones de tipos

module.exports = {
  // Tipos de usuario
  UserTypes: {
    USER: 'user',
    MODERATOR: 'moderator', 
    ADMIN: 'admin'
  },
  
  // Estados de contribución
  ContributionStatus: {
    PENDING: 'pendiente',
    APPROVED: 'aprobada',
    REJECTED: 'rechazada',
    PUBLISHED: 'publicada'
  },
  
  // Niveles de confianza
  ConfidenceLevels: {
    HIGH: 'alto',
    MEDIUM: 'medio',
    LOW: 'bajo'
  }
};
