
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Trash2,
  Edit,
  Clock,
  Users,
  Star,
  AlertCircle,
  CheckCircle,
  Plus
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';
import RecursosList from '@/components/lecciones/RecursosList';
import QuizList from '@/components/lecciones/QuizList';
import { RecursoExterno } from '@/components/lecciones/RecursoForm';
import { QuizPregunta } from '@/components/lecciones/QuizForm';

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  contenido_texto: string;
  contenido_nahuatl?: string;
  objetivos_aprendizaje: string[];
  palabras_clave: string[];
  duracion_estimada: number;
  estado: 'borrador' | 'publicada' | 'archivada';
  estudiantes_completados: number;
  puntuacion_promedio: number;
  fecha_creacion: string;
  fecha_publicacion?: string;
  fecha_actualizacion: string;
}

export default function EditarLeccionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const leccionId = params.id as string;
  
  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editData, setEditData] = useState<Partial<Leccion>>({});
  const [newObjetivo, setNewObjetivo] = useState('');
  const [newPalabra, setNewPalabra] = useState('');
  
  // Estados para recursos y quiz
  const [recursos, setRecursos] = useState<RecursoExterno[]>([]);
  const [quizPreguntas, setQuizPreguntas] = useState<QuizPregunta[]>([]);

  useEffect(() => {
    if (!loading && user && leccionId) {
      fetchLeccion();
    }
  }, [user, loading, leccionId]);

  const fetchLeccion = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken : null;
      
      if (!token) return;

      const response = await fetch(`${API_URL}/api/lecciones/${leccionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeccion(data.leccion);
        setEditData(data.leccion);
        // Cargar recursos y quiz
        setRecursos(data.leccion.recursos_externos || []);
        setQuizPreguntas(data.leccion.quiz_preguntas || []);
      } else {
        router.push('/profesor');
      }
    } catch (error) {
      router.push('/profesor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Leccion, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addObjetivo = () => {
    if (newObjetivo.trim()) {
      const objetivos = editData.objetivos_aprendizaje || leccion?.objetivos_aprendizaje || [];
      setEditData(prev => ({ ...prev, objetivos_aprendizaje: [...objetivos, newObjetivo.trim()] }));
      setNewObjetivo('');
    }
  };

  const removeObjetivo = (index: number) => {
    const objetivos = editData.objetivos_aprendizaje || leccion?.objetivos_aprendizaje || [];
    setEditData(prev => ({ ...prev, objetivos_aprendizaje: objetivos.filter((_, i) => i !== index) }));
  };

  const addPalabra = () => {
    if (newPalabra.trim()) {
      const palabras = editData.palabras_clave || leccion?.palabras_clave || [];
      setEditData(prev => ({ ...prev, palabras_clave: [...palabras, newPalabra.trim()] }));
      setNewPalabra('');
    }
  };

  const removePalabra = (index: number) => {
    const palabras = editData.palabras_clave || leccion?.palabras_clave || [];
    setEditData(prev => ({ ...prev, palabras_clave: palabras.filter((_, i) => i !== index) }));
  };

  // Handlers para recursos
  const handleAddRecurso = (recurso: RecursoExterno) => {
    setRecursos(prev => [...prev, recurso]);
  };

  const handleUpdateRecurso = (id: string, updated: RecursoExterno) => {
    setRecursos(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  };

  const handleDeleteRecurso = (id: string) => {
    setRecursos(prev => prev.filter(r => r.id !== id));
  };

  // Handlers para quiz
  const handleAddPregunta = (pregunta: QuizPregunta) => {
    setQuizPreguntas(prev => [...prev, pregunta]);
  };

  const handleUpdatePregunta = (id: string, updated: QuizPregunta) => {
    setQuizPreguntas(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const handleDeletePregunta = (id: string) => {
    setQuizPreguntas(prev => prev.filter(p => p.id !== id));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!editData.titulo?.trim()) newErrors.titulo = 'El título es requerido';
    if (!editData.descripcion?.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!editData.contenido_texto?.trim()) newErrors.contenido_texto = 'El contenido es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setErrorMessage('Por favor corrige los errores');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken : null;
      
      // Incluir recursos y quiz en el payload
      const payload = {
        ...editData,
        recursos_externos: recursos,
        quiz_preguntas: quizPreguntas
      };
      
      const response = await fetch(`${API_URL}/api/lecciones/${leccionId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        setLeccion(updatedData.leccion);
        setEditData(updatedData.leccion);
        // Actualizar recursos y quiz con los datos del servidor
        setRecursos(updatedData.leccion.recursos_externos || []);
        setQuizPreguntas(updatedData.leccion.quiz_preguntas || []);
        setIsEditing(false);
        setSuccessMessage('✅ Lección actualizada exitosamente');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      setErrorMessage('❌ Error de conexión');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmacion = window.prompt(`⚠️ Escribe "ELIMINAR" para confirmar:`);
    if (confirmacion !== 'ELIMINAR') return;

    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken : null;
      
      const response = await fetch(`${API_URL}/api/lecciones/${leccionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('✅ Lección eliminada');
        router.push('/profesor');
      }
    } catch (error) {
      alert('❌ Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeEstado = async (nuevoEstado: 'borrador' | 'publicada' | 'archivada') => {
    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken : null;
      
      const response = await fetch(`${API_URL}/api/lecciones/${leccionId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        setLeccion(updatedData.data);
        setEditData(updatedData.data);
        setSuccessMessage(`✅ Estado: ${nuevoEstado}`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      setErrorMessage('❌ Error');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'principiante': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermedio': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'avanzado': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'publicada': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'borrador': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archivada': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || isLoading) {
    return (
      <>
        <ConditionalHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <motion.div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Cargando...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user || user.rol !== 'profesor') {
    router.push('/dashboard');
    return null;
  }

  if (!leccion) {
    return (
      <>
        <ConditionalHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md text-center p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Lección no encontrada</h2>
            <Link href="/profesor" className="px-6 py-3 bg-purple-500 text-white rounded-lg">Volver</Link>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <ConditionalHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link href="/profesor" className="flex items-center gap-2 text-slate-600 mb-6">
              <ArrowLeft size={20} /> Volver
            </Link>
            
            {successMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 bg-green-100 border border-green-500 rounded-lg text-green-800">
                {successMessage}
              </motion.div>
            )}
            {errorMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 bg-red-100 border border-red-500 rounded-lg text-red-800">
                {errorMessage}
              </motion.div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">📝 {leccion.titulo}</h1>
                <p className="text-slate-600 dark:text-slate-400">Edita tu lección</p>
              </div>
              
              <div className="flex items-center gap-3">
                {!isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg">
                      <Edit size={16} /> Editar
                    </button>
                    <button onClick={handleDelete} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg">
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setIsEditing(false); setEditData(leccion); }} className="px-4 py-2 bg-slate-500 text-white rounded-lg">
                      Cancelar
                    </button>
                    <button onClick={handleSave} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg">
                      <Save size={16} /> {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 sticky top-8">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Información</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Estado</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(leccion.estado)} mb-3`}>
                      {leccion.estado}
                    </span>
                    
                    <div className="mt-3 space-y-2">
                      {leccion.estado !== 'publicada' && (
                        <button onClick={() => handleChangeEstado('publicada')} disabled={isSubmitting} className="w-full text-sm px-3 py-2 bg-green-500 text-white rounded-lg">
                          📢 Publicar
                        </button>
                      )}
                      {leccion.estado !== 'borrador' && (
                        <button onClick={() => handleChangeEstado('borrador')} disabled={isSubmitting} className="w-full text-sm px-3 py-2 bg-yellow-500 text-white rounded-lg">
                          📝 Borrador
                        </button>
                      )}
                      {leccion.estado !== 'archivada' && (
                        <button onClick={() => handleChangeEstado('archivada')} disabled={isSubmitting} className="w-full text-sm px-3 py-2 bg-gray-500 text-white rounded-lg">
                          📦 Archivar
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Nivel</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getNivelColor(leccion.nivel)}`}>
                      {leccion.nivel}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
                    <p className="text-slate-900 dark:text-slate-100 capitalize">{leccion.categoria}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Duración</label>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{leccion.duracion_estimada} min</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Estudiantes</label>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{leccion.estudiantes_completados}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Puntuación</label>
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-yellow-500" />
                      <span>{leccion.puntuacion_promedio.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título {isEditing && <span className="text-red-500">*</span>}</label>
                    {isEditing ? (
                      <>
                        <input type="text" value={editData.titulo || ''} onChange={(e) => handleInputChange('titulo', e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${errors.titulo ? 'border-red-500' : 'border-slate-300'} bg-white dark:bg-slate-700`} />
                        {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
                      </>
                    ) : (
                      <h2 className="text-2xl font-bold">{leccion.titulo}</h2>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Descripción {isEditing && <span className="text-red-500">*</span>}</label>
                    {isEditing ? (
                      <>
                        <textarea value={editData.descripcion || ''} onChange={(e) => handleInputChange('descripcion', e.target.value)} rows={3} className={`w-full px-4 py-3 rounded-lg border ${errors.descripcion ? 'border-red-500' : 'border-slate-300'} bg-white dark:bg-slate-700`} />
                        {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
                      </>
                    ) : (
                      <p>{leccion.descripcion}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Objetivos de Aprendizaje</label>
                    <div className="space-y-2">
                      {(editData.objetivos_aprendizaje || leccion.objetivos_aprendizaje).map((objetivo, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <CheckCircle size={16} className="text-purple-500" />
                          <span className="flex-1">{objetivo}</span>
                          {isEditing && (
                            <button onClick={() => removeObjetivo(index)} className="text-red-500">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <div className="flex gap-2">
                          <input type="text" value={newObjetivo} onChange={(e) => setNewObjetivo(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addObjetivo()} placeholder="Nuevo objetivo..." className="flex-1 px-4 py-2 rounded-lg border bg-white dark:bg-slate-700" />
                          <button onClick={addObjetivo} className="px-4 py-2 bg-purple-500 text-white rounded-lg">
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Palabras Clave</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(editData.palabras_clave || leccion.palabras_clave).map((palabra, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-2">
                          {palabra}
                          {isEditing && (
                            <button onClick={() => removePalabra(index)} className="text-red-500">×</button>
                          )}
                        </span>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <input type="text" value={newPalabra} onChange={(e) => setNewPalabra(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addPalabra()} placeholder="Nueva palabra..." className="flex-1 px-4 py-2 rounded-lg border bg-white dark:bg-slate-700" />
                        <button onClick={addPalabra} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Contenido Principal {isEditing && <span className="text-red-500">*</span>}</label>
                    {isEditing ? (
                      <>
                        <textarea value={editData.contenido_texto || ''} onChange={(e) => handleInputChange('contenido_texto', e.target.value)} rows={12} className={`w-full px-4 py-3 rounded-lg border ${errors.contenido_texto ? 'border-red-500' : 'border-slate-300'} bg-white dark:bg-slate-700`} />
                        {errors.contenido_texto && <p className="text-red-500 text-sm mt-1">{errors.contenido_texto}</p>}
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{leccion.contenido_texto}</p>
                    )}
                  </div>

                  {(leccion.contenido_nahuatl || isEditing) && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Contenido en Náhuatl</label>
                      {isEditing ? (
                        <textarea value={editData.contenido_nahuatl || ''} onChange={(e) => handleInputChange('contenido_nahuatl', e.target.value)} rows={6} placeholder="Opcional..." className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-700" />
                      ) : (
                        <p className="whitespace-pre-wrap italic">{leccion.contenido_nahuatl}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recursos Externos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RecursosList
                recursos={recursos}
                onAdd={handleAddRecurso}
                onUpdate={handleUpdateRecurso}
                onDelete={handleDeleteRecurso}
              />
            </motion.div>

            {/* Quiz */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <QuizList
                preguntas={quizPreguntas}
                onAdd={handleAddPregunta}
                onUpdate={handleUpdatePregunta}
                onDelete={handleDeletePregunta}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
