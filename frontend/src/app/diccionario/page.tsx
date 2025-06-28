'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { Search, BookOpen, AlertCircle, Bot, Bookmark, BookmarkCheck, Volume2, Share2 } from 'lucide-react';
import Header from '@/components/Header';

interface DictionaryEntry {
  word: string;
  variants: string[];
  grammar_info: string;
  definition: string;
  scientific_name?: string;
  examples?: { nahuatl: string; espanol: string }[];
  synonyms?: string[];
  roots?: string[];
  see_also?: string[];
  alt_spellings?: string[];
  notes?: string[];
  id: string;
}

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchResults = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      setHasSearched(query.trim().length > 0);
      return;
    }
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com';
      const response = await fetch(`${apiUrl}/api/dictionary/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('La respuesta de la red no fue correcta');
      const data = await response.json();
      setResults(data);
      if (data.length === 0) {
        setError(`No se encontraron resultados para "${query}".`);
      }
    } catch (err) {
      console.error('Error al obtener datos del diccionario:', err);
      setError('Error al conectar con el diccionario. Inténtalo de nuevo más tarde.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetchResults = useMemo(() => debounce(fetchResults, 350), [fetchResults]);

  useEffect(() => {
    debouncedFetchResults(searchTerm);
    return () => debouncedFetchResults.cancel();
  }, [searchTerm, debouncedFetchResults]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.id);
      fetchSaved(user.id);
    }
  }, []);

  const fetchSaved = async (uid: string) => {
    try {
      const res = await fetch(`https://nahuatl-web.onrender.com/api/dictionary/saved/${uid}`);
      const data = await res.json();
      setSavedWords(data.map((w: { id: string }) => w.id));
    } catch (error) {
      console.error('Error fetching saved words:', error);
    }
  };

  const handleSave = async (dictionary_id: string) => {
    if (!userId) return alert('Debes iniciar sesión para guardar palabras.');
    setSaving(dictionary_id);
    try {
      const response = await fetch('https://nahuatl-web.onrender.com/api/dictionary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, dictionary_id })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'La palabra ya está guardada') {
          // Si ya está guardada, la quitamos
          await handleUnsave(dictionary_id);
          return;
        }
        throw new Error(errorData.error || 'Error al guardar palabra');
      }
      
      setSavedWords(prev => [...prev, dictionary_id]);
    } catch (error) {
      console.error('Error al guardar palabra:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar palabra');
    } finally {
      setSaving(null);
    }
  };

  const handleUnsave = async (dictionary_id: string) => {
    if (!userId) return alert('Debes iniciar sesión para quitar palabras guardadas.');
    setSaving(dictionary_id);
    try {
      const response = await fetch('https://nahuatl-web.onrender.com/api/dictionary/save', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, dictionary_id })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al quitar palabra guardada');
      }
      
      setSavedWords(prev => prev.filter(id => id !== dictionary_id));
    } catch (error) {
      console.error('Error al quitar palabra guardada:', error);
      alert(error instanceof Error ? error.message : 'Error al quitar palabra guardada');
    } finally {
      setSaving(null);
    }
  };

  const renderInitialState = () => (
    <div className="text-center py-16 flex flex-col items-center">
      <div className="relative mb-8">
        <BookOpen size={80} className="text-amber-500/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen size={48} className="text-amber-600" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-3">Tlahtoltecpantiliztli</h2>
      <p className="text-xl text-gray-600 max-w-md mb-6">Diccionario interactivo de náhuatl</p>
      <p className="text-gray-500 max-w-lg">
        Comienza a escribir en náhuatl o español para explorar definiciones, ejemplos y la riqueza de nuestra lengua.
      </p>
    </div>
  );

  const renderNoResults = () => (
    <div className="text-center py-16 flex flex-col items-center">
      <div className="relative mb-8">
        <AlertCircle size={80} className="text-amber-500/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <AlertCircle size={48} className="text-amber-500" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Axcanah tlenon (No encontramos)</h2>
      <p className="text-gray-600 max-w-md mb-4">{error || `No hay resultados para "${searchTerm}"`}</p>
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 max-w-md text-left">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Sugerencias:</span>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Revisa la ortografía</li>
            <li>Intenta con palabras más cortas</li>
            <li>Busca en español o náhuatl</li>
          </ul>
        </p>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="text-center py-16 flex flex-col items-center">
      <div className="animate-pulse mb-8">
        <Bot size={64} className="text-emerald-500" />
      </div>
      <p className="text-xl font-medium text-gray-700 animate-pulse">Tictemoa... (Buscando)</p>
    </div>
  );

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
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(`${word} - ${window.location.href}`);
      alert("¡Enlace copiado al portapapeles!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <Header />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-800 mb-3">
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-emerald-600">
              Tlahtoltecpantiliztli
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Diccionario interactivo del náhuatl de Zongolica
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12 relative max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tictemoznequi... (Busca palabras en náhuatl o español)"
              className="w-full p-5 pl-14 rounded-full border-2 border-amber-200 bg-white text-gray-800 shadow-lg focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all text-lg placeholder-gray-400"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
              <Search className="text-amber-500" size={24} />
            </div>
          </div>
        </div>

        {/* Results */}
        <main className="pb-12">
          {isLoading ? renderLoading() :
            !hasSearched ? renderInitialState() :
            results.length > 0 ? (
              <div className="space-y-6">
                {results.map((entry, index) => (
                  <article 
                    key={index} 
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
                  >
                    <div className="p-6">
                      <header className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold text-emerald-700">{entry.word}</h2>
                          {entry.variants?.length > 0 && (
                            <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              {entry.variants.join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="sm:ml-auto flex items-center gap-2">
                          <span className="text-sm text-gray-500 italic">{entry.grammar_info}</span>
                          <button 
                            onClick={() => playAudio(entry.word)}
                            className="p-2 text-amber-500 hover:text-amber-600 rounded-full hover:bg-amber-50"
                            aria-label="Escuchar pronunciación"
                          >
                            <Volume2 size={18} />
                          </button>
                          <button 
                            onClick={() => shareWord(entry.word)}
                            className="p-2 text-emerald-500 hover:text-emerald-600 rounded-full hover:bg-emerald-50"
                            aria-label="Compartir palabra"
                          >
                            <Share2 size={18} />
                          </button>
                          {userId && (
                            savedWords.includes(entry.id) ? (
                              <button
                                onClick={() => handleUnsave(entry.id)}
                                className={`p-2 text-emerald-600 hover:text-red-500 rounded-full hover:bg-emerald-50 ${saving === entry.id ? 'opacity-50 pointer-events-none' : ''}`}
                                aria-label="Quitar de guardados"
                              >
                                <BookmarkCheck size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSave(entry.id)}
                                className={`p-2 text-blue-500 hover:text-emerald-600 rounded-full hover:bg-blue-50 ${saving === entry.id ? 'opacity-50 pointer-events-none' : ''}`}
                                aria-label="Guardar palabra"
                              >
                                <Bookmark size={18} />
                              </button>
                            )
                          )}
                        </div>
                      </header>

                      <div className="mb-4">
                        <p className="text-lg text-gray-800">{entry.definition}</p>
                        {entry.scientific_name && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-semibold">Nombre científico:</span> {entry.scientific_name}
                          </p>
                        )}
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                        {(entry.synonyms?.length ?? 0) > 0 && (
                          <div className="bg-amber-50 p-3 rounded-lg">
                            <span className="font-semibold text-amber-700">Sinónimos:</span> {(entry.synonyms ?? []).join(', ')}
                          </div>
                        )}
                        {(entry.roots?.length ?? 0) > 0 && (
                          <div className="bg-emerald-50 p-3 rounded-lg">
                            <span className="font-semibold text-emerald-700">Raíces:</span> {(entry.roots ?? []).join(', ')}
                          </div>
                        )}
                        {(entry.see_also?.length ?? 0) > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="font-semibold text-blue-700">Ver también:</span> {(entry.see_also ?? []).join(', ')}
                          </div>
                        )}
                        {(entry.alt_spellings?.length ?? 0) > 0 && (
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <span className="font-semibold text-purple-700">Otras formas:</span> {(entry.alt_spellings ?? []).join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Examples */}
                      {(entry.examples?.length ?? 0) > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Tlahtolli tlenon (Ejemplos)
                          </h4>
                          <ul className="space-y-3">
                            {(entry.examples ?? []).map((ex, i) => (
                              <li key={i} className="bg-emerald-50 p-3 rounded-lg">
                                <span className="text-emerald-700 font-semibold">{ex.nahuatl}</span>
                                <span className="text-gray-600 ml-2">{ex.espanol}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Notes */}
                      {(entry.notes?.length ?? 0) > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-amber-700 mb-2">Notas</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {(entry.notes ?? []).map((note, i) => (
                              <li key={i} className="text-gray-700">{note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : renderNoResults()
          }
        </main>
      </div>
    </div>
  );
}