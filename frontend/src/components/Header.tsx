'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  full_name: string;
  email: string;
  // Agrega aquí otros campos del perfil que quieras usar
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Esta función se ejecuta solo en el cliente, después de que el componente se monta
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    
    checkUser();

    // Escuchar cambios en el localStorage desde otras pestañas/ventanas
    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="w-full bg-gray-800/50 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-emerald-400">
              NahuatlApp
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/diccionario" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Diccionario</Link>
                <Link href="/feedback" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Sugerencias</Link>
                {/* Esta lógica se puede simplificar o mover si es necesario */}
                <Link href="/lecciones" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Lecciones</Link>
                <Link href="/practica" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Práctica</Link>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm hidden sm:block">{user.full_name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
