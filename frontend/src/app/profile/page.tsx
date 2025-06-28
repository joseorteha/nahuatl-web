'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, AtSign, LogOut, LucideIcon, BookmarkCheck, Bookmark, Search, Volume2, Share2, Trash2, BookOpen } from 'lucide-react';
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
  grammar_info?: string;
  examples?: { nahuatl: string; espanol: string }[];
  synonyms?: string[];
  created_at?: string;
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
  const [filteredWords, setFilteredWords] = useState<SavedWord[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

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

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredWords(savedWords);
    } else {
      const filtered = savedWords.filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (word.variants && word.variants.some(variant => 
          variant.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
      setFilteredWords(filtered);
    }
  }, [searchTerm, savedWords]);

  const fetchSaved = async (uid: string) => {
    try {
      const res = await fetch(`https://nahuatl-web.onrender.com/api/dictionary/saved/${uid}`);
      const data = await res.json();
      setSavedWords(data);
      setFilteredWords(data);
    } catch (error) {
      console.error('Error fetching saved words:', error);
    }
  };

  const handleUnsave = async (dictionary_id: string) => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    const user = JSON.parse(userData);
    setRemoving(dictionary_id);
    try {
      const response = await fetch('https://nahuatl-web.onrender.com/api/dictionary/save', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, dictionary_id })
      });
      
      if (!response.ok) {
        throw new Error('Error al quitar palabra guardada');
      }
      
      setSavedWords(prev => prev.filter(w => w.id !== dictionary_id));
    } catch (error) {
      console.error('Error removing saved word:', error);
      alert('Error al quitar palabra guardada');
    } finally {
      setRemoving(null);
    }
  };

  const playAudio = (word: string) => {
    // Implementar lógica de reproducción de audio
    console.log("Reproduciendo pronunciación de:", word);
  };

  const shareWord = (word: string) => {
    if (navigator.share) {
      navigator.share({
        title: `Palabra náhuatl: ${word}`,
        text: `Aprende sobre "${word}" en el diccionario Nawatlajtol`,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(`${word} - ${window.location.href}`);
      alert("¡Enlace copiado al portapapeles!");
    }
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
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
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden mb-12">
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

          {/* Sección de Palabras Guardadas */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-emerald-700 mb-2 flex items-center justify-center gap-3">
                <BookmarkCheck className="inline-block" /> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                  Tlahtoltemachtiani (Palabras Guardadas)
                </span>
              </h3>
              <p className="text-gray-600">Tus palabras favoritas del diccionario náhuatl</p>
            </div>

            {savedWords.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-emerald-100">
                <div className="relative mb-8">
                  <BookOpen size={80} className="text-emerald-500/20 mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Bookmark size={48} className="text-emerald-600" />
                  </div>
                </div>
                <h4 className="text-2xl font-semibold text-gray-800 mb-3">Aún no tienes palabras guardadas</h4>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Ve al diccionario y guarda las palabras que más te interesen para tenerlas siempre a mano.
                </p>
                <button
                  onClick={() => router.push('/diccionario')}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  <BookOpen size={20} />
                  Ir al Diccionario
                </button>
              </div>
            ) : (
              <>
                {/* Barra de búsqueda */}
                <div className="mb-8 relative max-w-md mx-auto">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar en palabras guardadas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-emerald-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="mb-6 text-center">
                  <p className="text-gray-600">
                    {filteredWords.length} de {savedWords.length} palabras guardadas
                    {searchTerm && ` (filtradas por "${searchTerm}")`}
                  </p>
                </div>

                {/* Lista de palabras */}
                <div className="grid gap-6">
                  {filteredWords.map(word => (
                    <motion.div
                      key={word.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="text-2xl font-bold text-emerald-700">{word.word}</h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => playAudio(word.word)}
                                  className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
                                  aria-label="Escuchar pronunciación"
                                >
                                  <Volume2 size={18} />
                                </button>
                                <button
                                  onClick={() => shareWord(word.word)}
                                  className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
                                  aria-label="Compartir palabra"
                                >
                                  <Share2 size={18} />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 mb-3 leading-relaxed">{word.definition}</p>
                            
                            {word.grammar_info && (
                              <p className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block mb-3">
                                {word.grammar_info}
                              </p>
                            )}
                            
                            {word.variants && word.variants.length > 0 && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-gray-600 mr-2">Variantes:</span>
                                <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                  {word.variants.join(', ')}
                                </span>
                              </div>
                            )}

                            {word.synonyms && word.synonyms.length > 0 && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-gray-600 mr-2">Sinónimos:</span>
                                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                  {word.synonyms.join(', ')}
                                </span>
                              </div>
                            )}

                            {word.examples && word.examples.length > 0 && (
                              <div className="mt-4">
                                <button
                                  onClick={() => setExpandedWord(expandedWord === word.id ? null : word.id)}
                                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                  {expandedWord === word.id ? 'Ocultar ejemplos' : 'Ver ejemplos'}
                                </button>
                                
                                {expandedWord === word.id && (
                                  <div className="mt-3 space-y-2">
                                    {word.examples.map((example, index) => (
                                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm font-medium text-emerald-700 mb-1">{example.nahuatl}</p>
                                        <p className="text-sm text-gray-600">{example.espanol}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleUnsave(word.id)}
                            disabled={removing === word.id}
                            className={`flex-shrink-0 p-3 text-red-500 hover:text-white hover:bg-red-500 rounded-full border border-red-200 transition-all duration-200 ${
                              removing === word.id ? 'opacity-50 pointer-events-none' : 'hover:shadow-md'
                            }`}
                            aria-label="Quitar de guardados"
                          >
                            {removing === word.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                            ) : (
                              <Trash2 size={20} />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredWords.length === 0 && searchTerm && (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-emerald-100">
                    <Search size={48} className="text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron resultados</h4>
                    <p className="text-gray-600">
                      No hay palabras guardadas que coincidan con "{searchTerm}"
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
