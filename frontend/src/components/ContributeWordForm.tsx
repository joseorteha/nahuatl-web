'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw, AlertCircle, CheckCircle2, Info, FileText, Tag, Hash, MessageSquare, Star } from 'lucide-react';

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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center"
      >
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-300 mb-3">
          Inicia sesión para contribuir
        </h3>
        <p className="text-amber-700 dark:text-amber-400 max-w-md mx-auto">
          Necesitas tener una cuenta para enviar nuevas palabras al diccionario.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Contribuir Nueva Palabra
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Ayuda a expandir nuestro diccionario de náhuatl. Tu contribución será revisada por moderadores antes de ser publicada.
        </p>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Campos principales */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Información Básica</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Palabra en Náhuatl <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="word"
                value={formData.word}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Ej: Atl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Información Gramatical
              </label>
              <select
                name="info_gramatical"
                value={formData.info_gramatical}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
              >
                <option value="">Selecciona tipo...</option>
                <optgroup label="Sustantivos">
                  <option value="s.">s. (sustantivo)</option>
                  <option value="s.m.">s.m. (sustantivo masculino)</option>
                  <option value="s.f.">s.f. (sustantivo femenino)</option>
                  <option value="s.anim.">s.anim. (sustantivo animado)</option>
                  <option value="s.inanim.">s.inanim. (sustantivo inanimado)</option>
                </optgroup>
                <optgroup label="Verbos">
                  <option value="v.tr.">v.tr. (verbo transitivo)</option>
                  <option value="v.intr.">v.intr. (verbo intransitivo)</option>
                  <option value="v.ref.">v.ref. (verbo reflexivo)</option>
                  <option value="v.aux.">v.aux. (verbo auxiliar)</option>
                </optgroup>
                <optgroup label="Adjetivos y Adverbios">
                  <option value="adj.">adj. (adjetivo)</option>
                  <option value="adv.">adv. (adverbio)</option>
                  <option value="adv.t.">adv.t. (adverbio de tiempo)</option>
                  <option value="adv.l.">adv.l. (adverbio de lugar)</option>
                </optgroup>
                <optgroup label="Otros">
                  <option value="pron.">pron. (pronombre)</option>
                  <option value="prep.">prep. (preposición)</option>
                  <option value="conj.">conj. (conjunción)</option>
                  <option value="interj.">interj. (interjección)</option>
                  <option value="part.">part. (partícula)</option>
                  <option value="num.">num. (numeral)</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Definición <span className="text-red-500">*</span>
            </label>
            <textarea
              name="definition"
              value={formData.definition}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="Definición de la palabra en español..."
            />
          </div>
        </motion.div>

        {/* Campos adicionales */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Información Adicional</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Variantes
              </label>
              <input
                type="text"
                name="variants"
                value={formData.variants}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Separadas por comas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre Científico
              </label>
              <input
                type="text"
                name="nombre_cientifico"
                value={formData.nombre_cientifico}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Para plantas, animales, etc."
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ejemplos de Uso
            </label>
            <textarea
              name="examples"
              value={formData.examples}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
              placeholder="Un ejemplo por línea. Formato: frase_nahuatl = traducción_español"
            />
            <div className="flex items-center gap-2 mt-2">
              <Info className="h-4 w-4 text-gray-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ejemplo: Nikatl = Soy agua
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sinónimos
              </label>
              <input
                type="text"
                name="synonyms"
                value={formData.synonyms}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Separados por comas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Raíces
              </label>
              <input
                type="text"
                name="roots"
                value={formData.roots}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Separadas por comas"
              />
            </div>
          </div>
        </motion.div>

        {/* Metadatos de contribución */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Información de tu Contribución
            </h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ¿Por qué quieres agregar esta palabra?
              </label>
              <select
                name="razon_contribucion"
                value={formData.razon_contribucion}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
              >
                <option value="">Selecciona motivo...</option>
                <optgroup label="Preservación Cultural">
                  <option value="palabra_comunidad">Es una palabra común en mi comunidad</option>
                  <option value="en_peligro">La palabra está en peligro de perderse</option>
                  <option value="tradicion_familiar">Se usa en tradiciones familiares</option>
                  <option value="ceremonia_ritual">Se usa en ceremonias o rituales</option>
                </optgroup>
                <optgroup label="Completeness">
                  <option value="falta_diccionario">No está en el diccionario actual</option>
                  <option value="definicion_incompleta">La definición actual es incompleta</option>
                  <option value="variante_regional">Es una variante regional importante</option>
                  <option value="uso_moderno">Tiene un uso moderno relevante</option>
                </optgroup>
                <optgroup label="Conocimiento Especializado">
                  <option value="termino_tecnico">Es un término técnico especializado</option>
                  <option value="flora_fauna">Describe flora o fauna local</option>
                  <option value="actividad_tradicional">Relacionado con actividades tradicionales</option>
                  <option value="conocimiento_ancestral">Forma parte del conocimiento ancestral</option>
                </optgroup>
                <optgroup label="Educativo">
                  <option value="enseñanza">Es útil para la enseñanza del náhuatl</option>
                  <option value="literatura">Aparece en literatura náhuatl</option>
                  <option value="estudiante">La necesito como estudiante</option>
                  <option value="investigacion">Para investigación académica</option>
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuente de Información
                </label>
                <select
                  name="fuente"
                  value={formData.fuente}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Selecciona fuente...</option>
                  <optgroup label="Fuentes Primarias">
                    <option value="hablante_nativo">Hablante nativo</option>
                    <option value="comunidad_indigena">Comunidad indígena</option>
                    <option value="anciano_conocedor">Anciano conocedor</option>
                    <option value="familia_tradicion">Familia con tradición</option>
                  </optgroup>
                  <optgroup label="Fuentes Académicas">
                    <option value="diccionario_academico">Diccionario académico</option>
                    <option value="libro_linguistica">Libro de lingüística</option>
                    <option value="investigacion_universitaria">Investigación universitaria</option>
                    <option value="tesis_doctoral">Tesis doctoral</option>
                  </optgroup>
                  <optgroup label="Fuentes Documentales">
                    <option value="codice_historico">Códice histórico</option>
                    <option value="documento_colonial">Documento colonial</option>
                    <option value="manuscrito_antiguo">Manuscrito antiguo</option>
                  </optgroup>
                  <optgroup label="Fuentes Modernas">
                    <option value="material_educativo">Material educativo</option>
                    <option value="curso_nahuatl">Curso de náhuatl</option>
                    <option value="diccionario_popular">Diccionario popular</option>
                    <option value="experiencia_personal">Experiencia personal</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nivel de Confianza
                </label>
                <div className="relative">
                  <select
                    name="nivel_confianza"
                    value={formData.nivel_confianza}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors appearance-none"
                  >
                    <option value="bajo">Bajo - No estoy completamente seguro</option>
                    <option value="medio">Medio - Tengo confianza moderada</option>
                    <option value="alto">Alto - Estoy muy seguro / Soy hablante nativo</option>
                  </select>
                  <Star className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Botones de acción */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-end gap-4 pt-6"
        >
          <button
            type="button"
            onClick={() => setFormData({
              word: '', variants: '', info_gramatical: '', definition: '',
              nombre_cientifico: '', examples: '', synonyms: '', roots: '',
              ver_tambien: '', ortografias_alternativas: '', notes: '',
              razon_contribucion: '', fuente: '', nivel_confianza: 'medio'
            })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            <RotateCcw className="h-5 w-5" />
            Limpiar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Enviar Contribución
              </>
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}
