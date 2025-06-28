'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, AtSign, LogOut, LucideIcon, BookmarkCheck, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
}

interface SavedWord {
  id: string;
  word: string;
  definition: string;
  variants?: string[];
}

type InfoCardProps = {
  icon: LucideIcon;
  label: string;
  value?: string;
};

const InfoCard = ({ icon: Icon, label, value }: InfoCardProps) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
      <Icon className="w-6 h-6 text-emerald-600" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value || 'No especificado'}</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchSaved(JSON.parse(userData).id);
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const fetchSaved = async (uid: string) => {
    try {
      const res = await fetch(`https://nahuatl-web.onrender.com/api/dictionary/saved/${uid}`);
      const data = await res.json();
      setSavedWords(data);
    } catch {}
  };

  const handleUnsave = async (dictionary_id: string) => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    const user = JSON.parse(userData);
    setRemoving(dictionary_id);
    try {
      await fetch('https://nahuatl-web.onrender.com/api/dictionary/save', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, dictionary_id })
      });
      setSavedWords(prev => prev.filter(w => w.id !== dictionary_id));
    } catch {}
    setRemoving(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Bienvenida y comunidad */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-emerald-700 mb-2">¡Bienvenido/a, {user.full_name || 'Nawatlajtolista'}!</h1>
            <p className="mt-2 text-lg text-gray-600">Eres parte de la comunidad <span className="font-bold text-emerald-600">Nawatlajtol</span>. Aquí puedes ver y gestionar la información de tu cuenta.</p>
          </div>

          {/* Profile Card Mejorada */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
            <div className="p-8 flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-lg">
                {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.full_name}</h2>
              <p className="text-emerald-600 font-medium mb-4">Miembro activo de la comunidad</p>
              <div className="space-y-6 w-full mt-4">
                <InfoCard icon={User} label="Nombre Completo" value={user.full_name} />
                <InfoCard icon={Mail} label="Correo Electrónico" value={user.email} />
                <InfoCard icon={AtSign} label="Nombre de Usuario" value={user.username} />
              </div>
            </div>
            <div className="bg-gray-50 px-8 py-6 border-t border-emerald-100 flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-3">¿Quieres salir de tu cuenta?</p>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <LogOut size={20}/>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {savedWords.length > 0 && (
            <div className="max-w-2xl mx-auto mt-12">
              <h3 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
                <BookmarkCheck className="inline-block" /> Palabras guardadas
              </h3>
              <div className="grid gap-6">
                {savedWords.map(word => (
                  <div key={word.id} className="bg-white rounded-xl shadow border border-emerald-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-emerald-700">{word.word}</h4>
                      <p className="text-gray-700 mb-1">{word.definition}</p>
                      {word.variants && word.variants.length > 0 && (
                        <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-full mr-2">{word.variants.join(', ')}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleUnsave(word.id)}
                      className={`mt-4 sm:mt-0 p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-full border border-red-200 transition-colors ${removing === word.id ? 'opacity-50 pointer-events-none' : ''}`}
                      aria-label="Quitar de guardados"
                    >
                      <Bookmark className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
