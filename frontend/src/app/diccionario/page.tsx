'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { Search, BookOpen, AlertCircle, Bot, Bookmark, BookmarkCheck, Volume2, Share2 } from 'lucide-react';
import Header from '@/components/Header';

interface DictionaryEntry {
  word: string;
  variants: string[];
  info_gramatical: string;
  definition: string;
  nombre_cientifico?: string;
  examples?: { nahuatl: string; espanol: string }[];
  synonyms?: string[];
  roots?: string[];
  ver_tambien?: string[];
  ortografias_alternativas?: string[];
  notes?: string[];
  id: string;
  score?: number; // Campo para el algoritmo de scoring
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
      const response = await fetch(`${apiUrl}/api/dictionary/search?query=${encodeURIComponent(query)}`);
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
      try {
        const user = JSON.parse(userData);
        console.log('Usuario cargado en diccionario:', user);
        setUserId(user.id);
        fetchSaved(user.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserId(null);
      }
    } else {
      console.log('No hay usuario en localStorage');
      setUserId(null);
    }

    // Verificar si hay parámetro de palabra en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const palabraParam = urlParams.get('palabra');
    if (palabraParam) {
      setSearchTerm(palabraParam);
      // La búsqueda se ejecutará automáticamente por el useEffect del debounce
    }
  }, []);

  const fetchSaved = async (uid: string) => {
    try {
      console.log('Fetching saved words for user:', uid);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com'}/api/dictionary/saved/${uid}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Saved words fetched:', data?.length || 0, 'items');
      setSavedWords(data.map((w: { id: string }) => w.id));
    } catch (error) {
      console.error('Error fetching saved words:', error);
      setSavedWords([]);
    }
  };

  const handleSave = async (diccionario_id: string) => {
    if (!userId) {
      alert('Debes iniciar sesión para guardar palabras.');
      return;
    }
    
    console.log('Attempting to save word:', { userId, diccionario_id });
    setSaving(diccionario_id);
    
    try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com'}/api/dictionary/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: userId, diccionario_id: diccionario_id })
      });
      
      console.log('Save response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Save error response:', errorData);
        
        if (response.status === 400 && errorData.error === 'La palabra ya está guardada') {
          // Si ya está guardada, la quitamos
          await handleUnsave(diccionario_id);
          return;
        }
        throw new Error(errorData.error || 'Error al guardar palabra');
      }
      
      const result = await response.json();
      console.log('Save successful:', result);
      setSavedWords(prev => [...prev, diccionario_id]);
    } catch (error) {
      console.error('Error al guardar palabra:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar palabra');
    } finally {
      setSaving(null);
    }
  };

  const handleUnsave = async (diccionario_id: string) => {
    if (!userId) return alert('Debes iniciar sesión para quitar palabras guardadas.');
    setSaving(diccionario_id);
    try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com'}/api/dictionary/save`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: userId, diccionario_id: diccionario_id })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al quitar palabra guardada');
      }
      
      setSavedWords(prev => prev.filter(id => id !== diccionario_id));
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
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Sugerencias:</span>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Revisa la ortografía</li>
            <li>Intenta con palabras más cortas</li>
            <li>Busca en español o náhuatl</li>
          </ul>
        </div>
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
    // Intentar diferentes enfoques para pronunciación
    
    // 1. Primero intentar con voces del sistema si hay alguna que pueda funcionar
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      
      // Buscar voces que puedan funcionar mejor para náhuatl
      const voices = speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => 
        voice.lang.includes('es') || voice.lang.includes('ES')
      );
      
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      
      // Configurar parámetros para mejor pronunciación
      utterance.rate = 0.7; // Más lento para claridad
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Notificación visual
      mostrarNotificacionAudio(word, 'pronunciando');
      
      utterance.onend = () => {
        console.log(`Pronunciación de "${word}" completada`);
      };
      
      utterance.onerror = (event) => {
        console.error('Error en síntesis de voz:', event.error);
        mostrarNotificacionAudio(word, 'error');
      };
      
      speechSynthesis.speak(utterance);
    } else {
      mostrarNotificacionAudio(word, 'no_disponible');
    }
  };

  const mostrarNotificacionAudio = (word: string, tipo: 'pronunciando' | 'error' | 'no_disponible') => {
    const mensajes = {
      pronunciando: `🔊 Pronunciando "${word}"`,
      error: `⚠️ Audio no disponible para "${word}"`,
      no_disponible: '❌ Audio no soportado en este navegador'
    };
    
    const colores = {
      pronunciando: '#059669',
      error: '#DC2626', 
      no_disponible: '#7C3AED'
    };
    
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed; 
        top: 20px; 
        left: 20px; 
        background: ${colores[tipo]}; 
        color: white; 
        padding: 12px 20px; 
        border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: system-ui;
        animation: slideInLeft 0.3s ease-out;
      ">
        ${mensajes[tipo]}
      </div>
      <style>
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, tipo === 'pronunciando' ? 2000 : 3000);
  };

  const shareWord = (word: string) => {
    const url = `${window.location.origin}/diccionario?palabra=${encodeURIComponent(word)}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${word} - Nawatlajtol`,
        text: `Descubre el significado de "${word}" en náhuatl`,
        url: url
      }).catch(err => {
        console.log('Error al compartir:', err);
        fallbackShare(url, word);
      });
    } else {
      fallbackShare(url, word);
    }
  };

  const fallbackShare = (url: string, word: string) => {
    navigator.clipboard.writeText(url).then(() => {
      // Crear notificación temporal elegante
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed; 
          top: 20px; 
          right: 20px; 
          background: #059669; 
          color: white; 
          padding: 12px 20px; 
          border-radius: 8px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          font-family: system-ui;
          animation: slideIn 0.3s ease-out;
        ">
          🔗 Enlace de "${word}" copiado
        </div>
        <style>
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }).catch(() => {
      prompt('Copia este enlace para compartir:', url);
    });
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-2xl font-bold text-emerald-700">{entry.word}</h2>
                          {/* Badge de relevancia */}
                          {entry.score && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              entry.score >= 95 ? 'bg-green-100 text-green-800' :
                              entry.score >= 85 ? 'bg-blue-100 text-blue-800' :
                              entry.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {entry.score >= 95 ? '🎯 Coincidencia exacta' :
                               entry.score >= 85 ? '✨ Muy relevante' :
                               entry.score >= 70 ? '📝 Relevante' :
                               '🔍 Relacionado'}
                            </span>
                          )}
                          {entry.variants?.length > 0 && (
                            <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              {entry.variants.join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="sm:ml-auto flex items-center gap-2">
                          <span className="text-sm text-gray-500 italic">{entry.info_gramatical}</span>
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
                        {entry.nombre_cientifico && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-semibold">Nombre científico:</span> {entry.nombre_cientifico}
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
                        {(entry.ver_tambien?.length ?? 0) > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="font-semibold text-blue-700">Ver también:</span> {(entry.ver_tambien ?? []).join(', ')}
                          </div>
                        )}
                        {(entry.ortografias_alternativas?.length ?? 0) > 0 && (
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <span className="font-semibold text-purple-700">Otras formas:</span> {(entry.ortografias_alternativas ?? []).join(', ')}
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