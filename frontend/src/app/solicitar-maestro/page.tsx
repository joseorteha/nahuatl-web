'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Heart, 
  FileText, 
  Send, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Users,
  GraduationCap,
  Timer
} from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  nombre_completo: string;
  email: string;
  especialidad_id: string;
  especialidad_otra: string;
  experiencia: string;
  motivacion: string;
  propuesta_contenido: string;
  habilidades_especiales: string;
  disponibilidad_horas: string;
}

interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
}

const tiemposDisponibles = [
  '1-2 horas por semana',
  '3-5 horas por semana', 
  '6-10 horas por semana',
  'Más de 10 horas por semana',
  'Tiempo flexible según necesidades'
];

export default function SolicitudMaestroPage() {
  const router = useRouter();
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoadingEspecialidades, setIsLoadingEspecialidades] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    nombre_completo: '',
    email: '',
    especialidad_id: '',
    especialidad_otra: '',
    experiencia: '',
    motivacion: '',
    propuesta_contenido: '',
    habilidades_especiales: '',
    disponibilidad_horas: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [error, setError] = useState<string | null>(null);

  // Cargar especialidades al inicializar
  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/solicitudes-maestros/especialidades`);
      
      if (response.ok) {
        const data = await response.json();
        setEspecialidades(data.especialidades || []);
      } else {
        console.error('Error cargando especialidades');
      }
    } catch (error) {
      console.error('Error en fetchEspecialidades:', error);
    } finally {
      setIsLoadingEspecialidades(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.nombre_completo.trim()) newErrors.nombre_completo = 'El nombre completo es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.especialidad_id) newErrors.especialidad_id = 'Selecciona una especialidad';
    if (!formData.experiencia.trim()) newErrors.experiencia = 'La experiencia es requerida';
    if (!formData.motivacion.trim()) newErrors.motivacion = 'La motivación es requerida';
    if (!formData.propuesta_contenido.trim()) newErrors.propuesta_contenido = 'La propuesta de contenido es requerida';
    if (!formData.disponibilidad_horas) newErrors.disponibilidad_horas = 'Selecciona el tiempo disponible';

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    // Si seleccionó "otro", debe especificar la especialidad
    const especialidadSeleccionada = especialidades.find(e => e.id.toString() === formData.especialidad_id);
    if (especialidadSeleccionada?.nombre === 'otro' && !formData.especialidad_otra.trim()) {
      newErrors.especialidad_otra = 'Especifica tu especialidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Formulario enviado - handleSubmit ejecutado');
    console.log('📝 Datos del formulario:', formData);
    
    if (!validateForm()) {
      console.log('❌ Validación del formulario falló');
      return;
    }
    
    console.log('✅ Validación del formulario exitosa');
    setIsSubmitting(true);
    setError(null); // Limpiar errores previos
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      console.log('🌐 Enviando solicitud pública a:', `${API_URL}/api/solicitudes-maestros`);
      
      const response = await fetch(`${API_URL}/api/solicitudes-maestros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        console.log('✅ Solicitud enviada exitosamente');
        setSubmitStatus('success');
        // Resetear formulario
        setFormData({
          nombre_completo: '',
          email: '',
          especialidad_id: '',
          especialidad_otra: '',
          experiencia: '',
          motivacion: '',
          propuesta_contenido: '',
          habilidades_especiales: '',
          disponibilidad_horas: ''
        });
      } else {
        const errorData = await response.json();
        console.log('❌ Error del servidor:', errorData);
        console.log('📊 Detalles completos del error:', JSON.stringify(errorData, null, 2));
        setError(errorData.error || errorData.message || 'Error al enviar solicitud');
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('💥 Error al enviar solicitud:', error);
      setError('Error de conexión. Intenta nuevamente.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Si se muestra el mensaje de éxito
  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <ConditionalHeader />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="text-white" size={40} />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              ¡Solicitud Enviada!
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Gracias por tu interés en ser parte de nuestra comunidad de maestros. 
              Hemos recibido tu solicitud y la revisaremos cuidadosamente. 
              Te contactaremos pronto a través del email proporcionado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Volver al inicio
              </motion.button>
              
              <motion.button
                onClick={() => router.push('/lecciones')}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explorar lecciones
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <ConditionalHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            <GraduationCap className="mr-2" size={16} />
            Únete como Maestro
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            Solicitar ser <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Maestro</span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Comparte tu conocimiento del náhuatl y ayuda a preservar nuestra lengua ancestral. 
            Completa este formulario para unirte a nuestra comunidad de educadores.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Personal */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-500" />
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre Completo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                    placeholder="Tu nombre completo"
                    className={`w-full p-4 border-2 rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm transition-all duration-200 ${
                      errors.nombre_completo
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-cyan-500'
                    } focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400`}
                  />
                  {errors.nombre_completo && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.nombre_completo}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="tu@email.com"
                    className={`w-full p-4 border-2 rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm transition-all duration-200 ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-cyan-500'
                    } focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Especialidad */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <BookOpen className="text-cyan-500" size={24} />
                Área de Especialidad
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    ¿En qué área te especializas? *
                  </label>
                  {isLoadingEspecialidades ? (
                    <div className="w-full p-4 border rounded-xl bg-white/50 dark:bg-slate-700/50 flex items-center justify-center">
                      <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full mr-2"></div>
                      Cargando especialidades...
                    </div>
                  ) : (
                    <select
                      value={formData.especialidad_id}
                      onChange={(e) => setFormData({...formData, especialidad_id: e.target.value, especialidad_otra: ''})}
                      className={`w-full px-4 py-3 border rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100 ${
                        errors.especialidad_id ? 'border-red-300' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      <option value="">Selecciona tu especialidad</option>
                      {especialidades.map((esp) => (
                        <option key={esp.id} value={esp.id.toString()}>
                          {esp.icono} {esp.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.especialidad_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={16} />
                      {errors.especialidad_id}
                    </p>
                  )}
                </div>

                {/* Campo adicional para "Otro" */}
                {formData.especialidad_id && 
                 especialidades.find(e => e.id.toString() === formData.especialidad_id)?.nombre === 'otro' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Especifica tu especialidad *
                    </label>
                    <input
                      type="text"
                      value={formData.especialidad_otra}
                      onChange={(e) => setFormData({...formData, especialidad_otra: e.target.value})}
                      placeholder="Describe tu área de especialidad"
                      className={`w-full p-4 border-2 rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 ${
                        errors.especialidad_otra
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-200 dark:border-slate-600 focus:border-cyan-500'
                      } focus:outline-none`}
                    />
                    {errors.especialidad_otra && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.especialidad_otra}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Disponibilidad */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Timer className="text-cyan-500" size={24} />
                Disponibilidad
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tiempo disponible *
                </label>
                <select
                  value={formData.disponibilidad_horas}
                    onChange={(e) => setFormData({...formData, disponibilidad_horas: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${
                    errors.disponibilidad_horas ? 'border-red-300' : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <option value="">Selecciona tu disponibilidad</option>
                  {tiemposDisponibles.map((tiempo) => (
                    <option key={tiempo} value={tiempo}>{tiempo}</option>
                  ))}
                </select>
                {errors.disponibilidad_horas && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.disponibilidad_horas}
                  </p>
                )}
              </div>
            </div>

            {/* Experiencia y Motivación */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Heart className="text-cyan-500" size={24} />
                Experiencia y Motivación
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Cuéntanos sobre tu experiencia con el náhuatl *
                  </label>
                  <textarea
                    value={formData.experiencia}
                    onChange={(e) => setFormData({...formData, experiencia: e.target.value})}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none ${
                      errors.experiencia ? 'border-red-300' : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="Describe tu nivel de náhuatl, cómo lo aprendiste, años de experiencia, certificaciones, etc."
                  />
                  {errors.experiencia && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={16} />
                      {errors.experiencia}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    ¿Por qué quieres ser maestro en nuestra plataforma? *
                  </label>
                  <textarea
                    value={formData.motivacion}
                    onChange={(e) => setFormData({...formData, motivacion: e.target.value})}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none ${
                      errors.motivacion ? 'border-red-300' : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="Comparte tu motivación y cómo planeas contribuir a la preservación del náhuatl..."
                  />
                  {errors.motivacion && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={16} />
                      {errors.motivacion}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Habilidades especiales (opcional)
                  </label>
                  <textarea
                    value={formData.habilidades_especiales}
                    onChange={(e) => setFormData({...formData, habilidades_especiales: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Habilidades adicionales que podrían ser útiles para enseñar náhuatl (música, arte, tecnología, etc.)"
                  />
                </div>
              </div>
            </div>

            {/* Propuesta de Contenido */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <FileText className="text-cyan-500" size={24} />
                Propuesta de Contenido
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  ¿Qué tipo de lecciones te gustaría crear? *
                </label>
                <textarea
                  value={formData.propuesta_contenido}
                  onChange={(e) => setFormData({...formData, propuesta_contenido: e.target.value})}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none ${
                    errors.propuesta_contenido ? 'border-red-300' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Describe las lecciones que planeas crear: temática, nivel de dificultad, formato, metodología de enseñanza, recursos que incluirías, etc."
                />
                {errors.propuesta_contenido && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.propuesta_contenido}
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <motion.button
                type="button"
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft size={20} />
                Volver
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Enviar Solicitud
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Error Message */}
        {(submitStatus === 'error' || error) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle size={20} />
              <span className="font-medium">Error al enviar la solicitud</span>
            </div>
            <p className="text-red-500 dark:text-red-300 text-sm mt-2">
              {error || 'Por favor, intenta nuevamente o contacta a soporte si el problema persiste.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}