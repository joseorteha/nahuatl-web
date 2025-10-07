'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function OAuthDebug() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [storageData, setStorageData] = useState<any>({});

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔍 ${message}`);
    setDebugLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 4)]);
  };

  useEffect(() => {
    const checkStorage = () => {
      if (typeof window !== 'undefined') {
        const sessionUser = sessionStorage.getItem('user_data');
        const sessionTokens = sessionStorage.getItem('auth_tokens');
        const localUser = localStorage.getItem('user_data');
        const localTokens = localStorage.getItem('auth_tokens');

        const data = {
          sessionStorage: {
            hasUser: !!sessionUser,
            hasTokens: !!sessionTokens,
            user: sessionUser ? JSON.parse(sessionUser).username : null
          },
          localStorage: {
            hasUser: !!localUser,
            hasTokens: !!localTokens,
            user: localUser ? JSON.parse(localUser).username : null
          },
          authContext: {
            isAuthenticated,
            hasUser: !!user,
            userId: user?.id,
            loading
          }
        };
        
        setStorageData(data);
      }
    };

    checkStorage();
    const interval = setInterval(checkStorage, 2000);
    return () => clearInterval(interval);
  }, [user, loading, isAuthenticated]);

  useEffect(() => {
    addLog(`Estado: Auth=${isAuthenticated} Loading=${loading} User=${user?.username || 'null'}`);
  }, [user, loading, isAuthenticated]);

  // NO redirigir automáticamente - solo observar
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      addLog('⚠️ Usuario no autenticado (no redirigiendo automáticamente)');
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    addLog('Componente de debug montado');
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur border rounded-lg p-3 text-xs max-w-sm shadow-lg">
      <div className="font-bold text-blue-600 dark:text-blue-400 mb-2">🔍 OAuth Debug</div>
      
      <div className="space-y-1 mb-3">
        <div>Loading: {loading ? '🔄' : '✅'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {user ? `${user.username} (${user.id?.substring(0, 8)})` : 'null'}</div>
      </div>

      <div className="mb-2">
        <strong>Storage:</strong>
        <div className="ml-2">
          <div>Session: {storageData.sessionStorage?.hasUser ? '👤' : '❌'} {storageData.sessionStorage?.hasTokens ? '🎫' : '❌'}</div>
          <div>Local: {storageData.localStorage?.hasUser ? '👤' : '❌'} {storageData.localStorage?.hasTokens ? '🎫' : '❌'}</div>
        </div>
      </div>

      <div>
        <strong>Logs:</strong>
        <div className="text-xs text-gray-600 dark:text-gray-400 max-h-16 overflow-y-auto">
          {debugLogs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}