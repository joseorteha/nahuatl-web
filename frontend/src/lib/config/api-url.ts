// lib/config/api-url.ts
export const getApiUrl = (): string => {
  // Forzar localhost en desarrollo
  if (typeof window !== 'undefined') {
    // Client side
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  
  // Server side
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

// Export para debugging
export const debugApiUrl = () => {
  const url = getApiUrl();
  console.log('🔗 API URL configurada:', url);
  return url;
};