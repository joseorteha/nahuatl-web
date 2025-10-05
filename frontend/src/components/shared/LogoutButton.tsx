'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <button 
      onClick={handleSignOut}
      className="bg-gray-700 hover:bg-red-600/50 text-white font-bold py-2 px-4 rounded-lg transition-colors"
    >
      Cerrar Sesión
    </button>
  );
}
