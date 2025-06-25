"use client";

import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { Search, BookOpen, AlertCircle, Bot, Languages, Sprout, TestTubeDiagonal, BookMarked, HelpingHand, FileText, NotebookText } from 'lucide-react';

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
}

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = async (query: string) => {
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
  };

  const debouncedFetchResults = useCallback(debounce(fetchResults, 350), []);

  useEffect(() => {
    debouncedFetchResults(searchTerm);
    return () => debouncedFetchResults.cancel();
  }, [searchTerm, debouncedFetchResults]);

  const renderInitialState = () => (
    <div className="text-center text-gray-500 mt-16 flex flex-col items-center">
      <BookOpen size={64} className="mb-4 text-gray-600" />
      <h2 className="text-2xl font-semibold text-gray-300">Bienvenido al Diccionario Náhuatl</h2>
      <p className="mt-2 max-w-md">Comienza a escribir en la barra de búsqueda para encontrar palabras en náhuatl o español.</p>
    </div>
  );

  const renderNoResults = () => (
    <div className="text-center text-gray-500 mt-16 flex flex-col items-center">
      <AlertCircle size={64} className="mb-4 text-amber-500" />
      <h2 className="text-2xl font-semibold text-gray-300">Sin Resultados</h2>
      <p className="mt-2 max-w-md">{error || `No hemos encontrado coincidencias para "${searchTerm}".`}</p>
      <p className="text-sm mt-1">Intenta con otra palabra o revisa la ortografía.</p>
    </div>
  );

  const renderLoading = () => (
    <div className="text-center text-emerald-400 mt-16 flex flex-col items-center">
        <Bot size={64} className="mb-4 animate-bounce" />
        <p className="text-xl font-medium">Buscando...</p>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <div className="container mx-auto px-4">
        <div className="py-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-400">Diccionario Náhuatl de Zongolica</h1>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">Una herramienta de búsqueda inteligente para explorar la riqueza del náhuatl de la Sierra de Zongolica.</p>
        </div>

        <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm py-4 mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Busca 'atl' (agua), 'yolotl' (corazón), 'chile'..."
              className="w-full p-4 pl-12 bg-gray-800 border-2 border-gray-700 rounded-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          </div>
        </div>

        <main>
          {isLoading ? renderLoading() :
            !hasSearched ? renderInitialState() :
            results.length > 0 ? (
              <div className="space-y-6 pb-12">
                {results.map((entry, index) => (
                  <article key={index} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg transition-all duration-300 hover:border-emerald-500/70 hover:shadow-emerald-500/10">
                    <header className="border-b border-gray-700 pb-4 mb-4">
                      <div className="flex flex-wrap items-baseline gap-x-4">
                        <h2 className="text-3xl font-bold text-emerald-300">{entry.word}</h2>
                        {entry.variants && entry.variants.length > 0 && (
                          <p className="text-lg text-gray-400">({entry.variants.join(', ')})</p>
                        )}
                      </div>
                      <p className="text-md text-cyan-300 italic mt-1">{entry.grammar_info}</p>
                    </header>

                    <div className="space-y-4">
                      <p className="text-xl text-gray-200 leading-relaxed">{entry.definition}</p>
                      
                      {entry.scientific_name && (
                        <div className="flex items-center gap-2 text-sm text-fuchsia-300/90"><TestTubeDiagonal size={16} /><p><span className="font-semibold">Nombre Científico:</span> {entry.scientific_name}</p></div>
                      )}

                      {entry.examples && entry.examples.length > 0 && (
                        <div className="pt-4">
                          <h4 className="font-semibold text-lg text-emerald-200 mb-2 flex items-center gap-2"><BookMarked size={20} /> Ejemplos:</h4>
                          <ul className="space-y-3 pl-5 list-inside">
                            {entry.examples.map((ex, i) => (
                              <li key={i} className="bg-gray-900/60 p-3 rounded-lg border-l-4 border-emerald-700">
                                <p className="text-gray-300 font-medium">{ex.nahuatl}</p>
                                <p className="text-gray-400 italic">“{ex.espanol}”</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm pt-4 text-gray-400">
                        {entry.synonyms && entry.synonyms.length > 0 && <div className="flex items-start gap-2"><Languages size={16} className="mt-0.5 shrink-0"/><div><strong>Sinónimos:</strong> {entry.synonyms.join(', ')}</div></div>}
                        {entry.roots && entry.roots.length > 0 && <div className="flex items-start gap-2"><Sprout size={16} className="mt-0.5 shrink-0"/><div><strong>Raíces:</strong> {entry.roots.join(', ')}</div></div>}
                        {entry.see_also && entry.see_also.length > 0 && <div className="flex items-start gap-2"><HelpingHand size={16} className="mt-0.5 shrink-0"/><div><strong>Ver también:</strong> {entry.see_also.join(', ')}</div></div>}
                        {entry.alt_spellings && entry.alt_spellings.length > 0 && <div className="flex items-start gap-2"><FileText size={16} className="mt-0.5 shrink-0"/><div><strong>Otras formas:</strong> {entry.alt_spellings.join(', ')}</div></div>}
                      </div>

                      {entry.notes && entry.notes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700/50 text-amber-300/80 text-sm">
                           <div className="flex items-start gap-2"><NotebookText size={16} className="mt-0.5 shrink-0"/><div><strong>Notas:</strong> {entry.notes.join(' ')}</div></div>
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

