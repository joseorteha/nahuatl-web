// components/debug/AuthDebug.tsx - Componente temporal para debugging
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthPersistence } from '@/hooks/useAuthPersistence';

export default function AuthDebug() {
  const { user, loading, isAuthenticated } = useAuth();
  const authPersistence = useAuthPersistence();
  
  const checkStoredData = () => {
    const { user: storedUser, tokens: storedTokens } = authPersistence.loadAuthData();
    console.log('🔍 Datos almacenados:', { storedUser, storedTokens });
    
    // Verificar localStorage
    const localData = localStorage.getItem('auth_data');
    const sessionData = sessionStorage.getItem('auth_data');
    console.log('💾 localStorage:', localData);
    console.log('💾 sessionStorage:', sessionData);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="mb-2 font-bold">🐛 Auth Debug</div>
      <div>Loading: {loading ? '✅' : '❌'}</div>
      <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
      <div>User: {user ? `✅ ${user.nombre_completo || user.email}` : '❌'}</div>
      <div>User ID: {user?.id || 'N/A'}</div>
      <button 
        onClick={checkStoredData}
        className="mt-2 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
      >
        Check Storage
      </button>
    </div>
  );
}