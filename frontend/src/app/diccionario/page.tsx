"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { Search, BookOpen, AlertCircle, Bot } from 'lucide-react';

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
      <p className="mt-2 max-w-md">{error || `No hemos encontrado coincidencias para &quot;${searchTerm}&quot;.`}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-[#5DADE2]/20 via-white to-[#2ECC71]/10 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-2">Diccionario Náhuatl de Zongolica</h1>
          <p className="text-lg text-[#5DADE2]">Explora la riqueza del náhuatl con una búsqueda inteligente y visual.</p>
        </div>
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Busca palabras en náhuatl o español..."
              className="w-full p-4 pl-12 rounded-full border-2 border-[#2ECC71]/40 bg-white text-[#2C3E50] shadow focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/30 transition text-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5DADE2]" size={24} />
          </div>
        </div>
        <main>
          {isLoading ? renderLoading() :
            !hasSearched ? renderInitialState() :
            results.length > 0 ? (
              <div className="space-y-8 pb-12">
                {results.map((entry, index) => (
                  <article key={index} className="bg-white border border-[#5DADE2]/20 rounded-2xl shadow-md hover:shadow-lg hover:border-[#2ECC71]/60 transition-all p-6">
                    <header className="mb-3 flex flex-col md:flex-row md:items-center gap-2">
                      <h2 className="text-2xl font-bold text-[#2ECC71]">{entry.word}</h2>
                      {entry.variants && entry.variants.length > 0 && (
                        <span className="text-[#5DADE2] text-md">({entry.variants.join(', ')})</span>
                      )}
                      <span className="ml-auto text-[#2C3E50] italic">{entry.grammar_info}</span>
                    </header>
                    <p className="text-lg text-[#2C3E50] mb-2">{entry.definition}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {entry.synonyms && entry.synonyms.length > 0 && <div><span className="font-semibold text-[#5DADE2]">Sinónimos:</span> {entry.synonyms.join(', ')}</div>}
                      {entry.roots && entry.roots.length > 0 && <div><span className="font-semibold text-[#2ECC71]">Raíces:</span> {entry.roots.join(', ')}</div>}
                      {entry.see_also && entry.see_also.length > 0 && <div><span className="font-semibold text-[#F39C12]">Ver también:</span> {entry.see_also.join(', ')}</div>}
                      {entry.alt_spellings && entry.alt_spellings.length > 0 && <div><span className="font-semibold text-[#2C3E50]">Otras formas:</span> {entry.alt_spellings.join(', ')}</div>}
                    </div>
                    {entry.examples && entry.examples.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-[#2ECC71] mb-2">Ejemplos:</h4>
                        <ul className="space-y-2">
                          {entry.examples.map((ex, i) => (
                            <li key={i} className="bg-[#5DADE2]/10 rounded p-2">
                              <span className="text-[#2C3E50]">{ex.nahuatl}</span>
                              <span className="block text-[#5DADE2] italic">&quot;{ex.espanol}&quot;</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {entry.notes && entry.notes.length > 0 && (
                      <div className="mt-4 p-3 rounded bg-[#F39C12]/10 text-[#F39C12] text-sm">
                        <strong>Notas:</strong> {entry.notes.join(' ')}
                      </div>
                    )}
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

