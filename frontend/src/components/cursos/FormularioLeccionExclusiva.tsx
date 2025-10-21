'use client';

import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface FormularioLeccionExclusivaProps {
  moduloId: string;
  cursoId: string;
  onLeccionCreada: () => void;
  onCancelar: () => void;
}

export default function FormularioLeccionExclusiva({
  moduloId,
  cursoId,
  onLeccionCreada,
  onCancelar
}: FormularioLeccionExclusivaProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'vocabulario',
    nivel: 'principiante',
    contenido_texto: '',
    contenido_nahuatl: '',
    objetivos_aprendizaje: [''],
    palabras_clave: [''],
    duracion_estimada: 15,
    orden_en_modulo: 1,
    es_obligatoria: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.titulo.trim()) {
      setError('El título es requerido');
      return;
    }
    if (!formData.contenido_texto.trim() || formData.contenido_texto.length < 50) {
      setError('El contenido debe tener al menos 50 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Limpiar arrays vacíos
      const objetivos = formData.objetivos_aprendizaje.filter(o => o.trim());
      const palabras = formData.palabras_clave.filter(p => p.trim());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/modulos/${moduloId}/lecciones/crear`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            objetivos_aprendizaje: objetivos,
            palabras_clave: palabras
          })
        }
      );

      if (response.ok) {
        onLeccionCreada();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear lección');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al crear lección. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const agregarObjetivo = () => {
    setFormData({
      ...formData,
      objetivos_aprendizaje: [...formData.objetivos_aprendizaje, '']
    });
  };

  const actualizarObjetivo = (index: number, valor: string) => {
    const nuevosObjetivos = [...formData.objetivos_aprendizaje];
    nuevosObjetivos[index] = valor;
    setFormData({ ...formData, objetivos_aprendizaje: nuevosObjetivos });
  };

  const eliminarObjetivo = (index: number) => {
    const nuevosObjetivos = formData.objetivos_aprendizaje.filter((_, i) => i !== index);
    setFormData({ ...formData, objetivos_aprendizaje: nuevosObjetivos });
  };

  const agregarPalabra = () => {
    setFormData({
      ...formData,
      palabras_clave: [...formData.palabras_clave, '']
    });
  };

  const actualizarPalabra = (index: number, valor: string) => {
    const nuevasPalabras = [...formData.palabras_clave];
    nuevasPalabras[index] = valor;
    setFormData({ ...formData, palabras_clave: nuevasPalabras });
  };

  const eliminarPalabra = (index: number) => {
    const nuevasPalabras = formData.palabras_clave.filter((_, i) => i !== index);
    setFormData({ ...formData, palabras_clave: nuevasPalabras });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Básica</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ej: Introducción al módulo"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Breve descripción de la lección"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              required
            >
              <option value="vocabulario">Vocabulario</option>
              <option value="numeros">Números</option>
              <option value="colores">Colores</option>
              <option value="familia">Familia</option>
              <option value="naturaleza">Naturaleza</option>
              <option value="gramatica">Gramática</option>
              <option value="cultura">Cultura</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nivel <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.nivel}
              onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              required
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duración (minutos)
            </label>
            <input
              type="number"
              value={formData.duracion_estimada}
              onChange={(e) => setFormData({ ...formData, duracion_estimada: parseInt(e.target.value) })}
              min="5"
              max="180"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contenido</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contenido en Español <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.contenido_texto}
            onChange={(e) => setFormData({ ...formData, contenido_texto: e.target.value })}
            placeholder="Contenido de la lección en español (mínimo 50 caracteres)"
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.contenido_texto.length} caracteres (mínimo 50)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contenido en Náhuatl (opcional)
          </label>
          <textarea
            value={formData.contenido_nahuatl}
            onChange={(e) => setFormData({ ...formData, contenido_nahuatl: e.target.value })}
            placeholder="Contenido de la lección en náhuatl"
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
          />
        </div>
      </div>

      {/* Objetivos de aprendizaje */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Objetivos de Aprendizaje</h3>
          <button
            type="button"
            onClick={agregarObjetivo}
            className="text-sm text-primary hover:text-primary/80"
          >
            + Agregar objetivo
          </button>
        </div>
        
        {formData.objetivos_aprendizaje.map((objetivo, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={objetivo}
              onChange={(e) => actualizarObjetivo(index, e.target.value)}
              placeholder="Ej: Aprender a saludar en náhuatl"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
            />
            {formData.objetivos_aprendizaje.length > 1 && (
              <button
                type="button"
                onClick={() => eliminarObjetivo(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Palabras clave */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Palabras Clave</h3>
          <button
            type="button"
            onClick={agregarPalabra}
            className="text-sm text-primary hover:text-primary/80"
          >
            + Agregar palabra
          </button>
        </div>
        
        {formData.palabras_clave.map((palabra, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={palabra}
              onChange={(e) => actualizarPalabra(index, e.target.value)}
              placeholder="Ej: saludos, náhuatl básico"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
            />
            {formData.palabras_clave.length > 1 && (
              <button
                type="button"
                onClick={() => eliminarPalabra(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Configuración */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración</h3>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="obligatoria"
            checked={formData.es_obligatoria}
            onChange={(e) => setFormData({ ...formData, es_obligatoria: e.target.checked })}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="obligatoria" className="text-sm text-gray-700 dark:text-gray-300">
            Lección obligatoria para completar el módulo
          </label>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            📌 Esta lección será <strong>exclusiva</strong> de este módulo y no aparecerá en el catálogo público.
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancelar}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear Lección Exclusiva'
          )}
        </button>
      </div>
    </form>
  );
}
