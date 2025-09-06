'use client';

import { useState } from 'react';

interface ContributionFormData {
  word: string;
  variants: string;
  info_gramatical: string;
  definition: string;
  nombre_cientifico: string;
  examples: string;
  synonyms: string;
  roots: string;
  ver_tambien: string;
  ortografias_alternativas: string;
  notes: string;
  razon_contribucion: string;
  fuente: string;
  nivel_confianza: 'bajo' | 'medio' | 'alto';
}

interface ContributeWordFormProps {
  userId?: string;
  userEmail?: string;
  onSuccess?: () => void;
}

export default function ContributeWordForm({ userId, userEmail, onSuccess }: ContributeWordFormProps) {
  const [formData, setFormData] = useState<ContributionFormData>({
    word: '',
    variants: '',
    info_gramatical: '',
    definition: '',
    nombre_cientifico: '',
    examples: '',
    synonyms: '',
    roots: '',
    ver_tambien: '',
    ortografias_alternativas: '',
    notes: '',
    razon_contribucion: '',
    fuente: '',
    nivel_confianza: 'medio'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !userEmail) {
      setMessage({ type: 'error', text: 'Debes iniciar sesión para contribuir con palabras.' });
      return;
    }

    if (!formData.word.trim() || !formData.definition.trim()) {
      setMessage({ type: 'error', text: 'La palabra y definición son campos obligatorios.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        usuario_id: userId,
        usuario_email: userEmail,
        word: formData.word.trim(),
        variants: formData.variants ? formData.variants.split(',').map(v => v.trim()).filter(v => v) : null,
        info_gramatical: formData.info_gramatical.trim() || null,
        definition: formData.definition.trim(),
        nombre_cientifico: formData.nombre_cientifico.trim() || null,
        examples: formData.examples.trim() ? 
          JSON.parse(`[${formData.examples.split('\n').map(line => {
            const [nahuatl, espanol] = line.split('=').map(s => s.trim());
            return `{"nahuatl": "${nahuatl || ''}", "espanol": "${espanol || ''}"}`;
          }).join(',')}]`) : null,
        synonyms: formData.synonyms ? formData.synonyms.split(',').map(s => s.trim()).filter(s => s) : null,
        roots: formData.roots ? formData.roots.split(',').map(r => r.trim()).filter(r => r) : null,
        ver_tambien: formData.ver_tambien ? formData.ver_tambien.split(',').map(v => v.trim()).filter(v => v) : null,
        ortografias_alternativas: formData.ortografias_alternativas ? 
          formData.ortografias_alternativas.split(',').map(o => o.trim()).filter(o => o) : null,
        notes: formData.notes ? formData.notes.split('\n').map(n => n.trim()).filter(n => n) : null,
        razon_contribucion: formData.razon_contribucion.trim() || null,
        fuente: formData.fuente.trim() || null,
        nivel_confianza: formData.nivel_confianza
      };

      const response = await fetch(`${API_URL}/api/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Palabra enviada exitosamente. Será revisada por nuestros moderadores.' 
        });
        
        // Limpiar formulario
        setFormData({
          word: '',
          variants: '',
          info_gramatical: '',
          definition: '',
          nombre_cientifico: '',
          examples: '',
          synonyms: '',
          roots: '',
          ver_tambien: '',
          ortografias_alternativas: '',
          notes: '',
          razon_contribucion: '',
          fuente: '',
          nivel_confianza: 'medio'
        });

        if (onSuccess) onSuccess();
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al enviar la palabra.' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Inicia sesión para contribuir
        </h3>
        <p className="text-yellow-700">
          Necesitas tener una cuenta para enviar nuevas palabras al diccionario.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Contribuir Nueva Palabra
        </h2>
        <p className="text-gray-600">
          Ayuda a expandir nuestro diccionario de náhuatl. Tu contribución será revisada por moderadores antes de ser publicada.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Palabra en Náhuatl <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="word"
              value={formData.word}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Atl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Información Gramatical
            </label>
            <input
              type="text"
              name="info_gramatical"
              value={formData.info_gramatical}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: s. (sustantivo)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Definición <span className="text-red-500">*</span>
          </label>
          <textarea
            name="definition"
            value={formData.definition}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Definición de la palabra en español..."
          />
        </div>

        {/* Campos opcionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variantes
            </label>
            <input
              type="text"
              name="variants"
              value={formData.variants}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Separadas por comas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Científico
            </label>
            <input
              type="text"
              name="nombre_cientifico"
              value={formData.nombre_cientifico}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Para plantas, animales, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ejemplos de Uso
          </label>
          <textarea
            name="examples"
            value={formData.examples}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Un ejemplo por línea. Formato: frase_nahuatl = traducción_español"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ejemplo: Nikatl = Soy agua
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sinónimos
            </label>
            <input
              type="text"
              name="synonyms"
              value={formData.synonyms}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Separados por comas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raíces
            </label>
            <input
              type="text"
              name="roots"
              value={formData.roots}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Separadas por comas"
            />
          </div>
        </div>

        {/* Metadatos de contribución */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Información de tu Contribución
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Por qué quieres agregar esta palabra?
              </label>
              <textarea
                name="razon_contribucion"
                value={formData.razon_contribucion}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Es una palabra común en mi comunidad que no está en el diccionario"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuente de Información
                </label>
                <input
                  type="text"
                  name="fuente"
                  value={formData.fuente}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Hablante nativo, libro, diccionario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Confianza
                </label>
                <select
                  name="nivel_confianza"
                  value={formData.nivel_confianza}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bajo">Bajo - No estoy completamente seguro</option>
                  <option value="medio">Medio - Tengo confianza moderada</option>
                  <option value="alto">Alto - Estoy muy seguro / Soy hablante nativo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setFormData({
              word: '', variants: '', info_gramatical: '', definition: '',
              nombre_cientifico: '', examples: '', synonyms: '', roots: '',
              ver_tambien: '', ortografias_alternativas: '', notes: '',
              razon_contribucion: '', fuente: '', nivel_confianza: 'medio'
            })}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Limpiar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Contribución'}
          </button>
        </div>
      </form>
    </div>
  );
}
