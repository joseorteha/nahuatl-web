'use client';

import { useState } from 'react';
import { X, Users, Send, CheckCircle, AlertCircle, User, Mail, Phone, Heart } from 'lucide-react';
import { submitJoinRequest, isValidEmail, isValidPhone, type JoinRequest } from '@/services/api/contactService';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  joinType: 'registro' | 'contribuir' | 'comunidad' | 'voluntario' | 'maestro' | 'traductor';
  experienceLevel: 'principiante' | 'intermedio' | 'avanzado' | 'nativo';
  motivation: string;
  skills: string;
  availability: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  joinType?: string;
  motivation?: string;
}

const joinTypeOptions = [
  { value: 'registro', label: 'Registro General', description: 'Crear cuenta y explorar la plataforma' },
  { value: 'contribuir', label: 'Contribuir al Diccionario', description: 'Agregar palabras y traducciones' },
  { value: 'comunidad', label: 'Unirse a la Comunidad', description: 'Participar en eventos y actividades' },
  { value: 'voluntario', label: 'Ser Voluntario', description: 'Ayudar en proyectos y iniciativas' },
  { value: 'maestro', label: 'Enseñar Náhuatl', description: 'Compartir conocimientos como educador' },
  { value: 'traductor', label: 'Traducir Contenido', description: 'Ayudar con traducciones y textos' }
];

const experienceLevelOptions = [
  { value: 'principiante', label: 'Principiante', description: 'Poco o ningún conocimiento' },
  { value: 'intermedio', label: 'Intermedio', description: 'Conocimientos básicos' },
  { value: 'avanzado', label: 'Avanzado', description: 'Buen dominio del idioma' },
  { value: 'nativo', label: 'Hablante Nativo', description: 'Náhuatl como lengua materna' }
];

export default function JoinModal({ isOpen, onClose }: JoinModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    joinType: 'registro',
    experienceLevel: 'principiante',
    motivation: '',
    skills: '',
    availability: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Por favor ingresa un email válido';
    }

    // Validar teléfono (opcional)
    if (formData.phone.trim() && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Por favor ingresa un teléfono válido';
    }

    // Validar tipo de unión
    if (!formData.joinType) {
      newErrors.joinType = 'Por favor selecciona cómo quieres participar';
    }

    // Validar motivación para ciertos tipos
    if (['contribuir', 'voluntario', 'maestro', 'traductor'].includes(formData.joinType) && !formData.motivation.trim()) {
      newErrors.motivation = 'Por favor cuéntanos tu motivación para este tipo de participación';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const joinData: JoinRequest = {
        nombre: formData.name.trim(),
        email: formData.email.trim(),
        telefono: formData.phone.trim() || undefined,
        tipo_union: formData.joinType,
        nivel_experiencia: formData.experienceLevel,
        motivacion: formData.motivation.trim() || undefined,
        habilidades: formData.skills.trim() || undefined,
        disponibilidad: formData.availability.trim() || undefined
      };

      await submitJoinRequest(joinData);
      
      setSubmitStatus('success');
      setSubmitMessage('¡Solicitud enviada correctamente! Te contactaremos pronto para continuar el proceso.');
      
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        joinType: 'registro',
        experienceLevel: 'principiante',
        motivation: '',
        skills: '',
        availability: ''
      });
      
      // Cerrar modal después de 4 segundos
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 4000);

    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(
        error instanceof Error 
          ? error.message 
          : 'Hubo un error al enviar la solicitud. Por favor, intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      joinType: 'registro',
      experienceLevel: 'principiante',
      motivation: '',
      skills: '',
      availability: ''
    });
    setErrors({});
    setSubmitStatus('idle');
    setSubmitMessage('');
    onClose();
  };

  const selectedJoinType = joinTypeOptions.find(option => option.value === formData.joinType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Únete a Nawatlahtol
                </h2>
                <p className="text-sm text-gray-600">
                  Forma parte de nuestra comunidad
                </p>
              </div>
            </div>
            <button
              onClick={resetModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <p className="font-medium">{submitMessage}</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">{submitMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Tu nombre completo"
                  disabled={isSubmitting || submitStatus === 'success'}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                  disabled={isSubmitting || submitStatus === 'success'}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+52 123 456 7890"
                disabled={isSubmitting || submitStatus === 'success'}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Tipo de Participación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              ¿Cómo quieres participar?
            </h3>
            
            <div>
              <label htmlFor="joinType" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de participación *
              </label>
              <select
                id="joinType"
                name="joinType"
                value={formData.joinType}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                  errors.joinType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting || submitStatus === 'success'}
              >
                {joinTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
              {errors.joinType && (
                <p className="mt-1 text-sm text-red-600">{errors.joinType}</p>
              )}
              
              {selectedJoinType && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700">
                    <strong>{selectedJoinType.label}:</strong> {selectedJoinType.description}
                  </p>
                </div>
              )}
            </div>

            {/* Nivel de Experiencia */}
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de experiencia con náhuatl
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                disabled={isSubmitting || submitStatus === 'success'}
              >
                {experienceLevelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Información Adicional
            </h3>
            
            {/* Motivación */}
            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
                Motivación {['contribuir', 'voluntario', 'maestro', 'traductor'].includes(formData.joinType) && '*'}
              </label>
              <textarea
                id="motivation"
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none ${
                  errors.motivation ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Cuéntanos por qué quieres unirte y qué esperas de esta experiencia..."
                disabled={isSubmitting || submitStatus === 'success'}
              />
              {errors.motivation && (
                <p className="mt-1 text-sm text-red-600">{errors.motivation}</p>
              )}
            </div>

            {/* Habilidades */}
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                Habilidades y experiencia (opcional)
              </label>
              <textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
                placeholder="Menciona habilidades relevantes: programación, diseño, lingüística, educación, etc."
                disabled={isSubmitting || submitStatus === 'success'}
              />
            </div>

            {/* Disponibilidad */}
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilidad de tiempo (opcional)
              </label>
              <textarea
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
                placeholder="Cuánto tiempo puedes dedicar semanalmente, horarios preferenciales, etc."
                disabled={isSubmitting || submitStatus === 'success'}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={resetModal}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Enviando solicitud...
                </>
              ) : submitStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Solicitud enviada
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar solicitud
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-500 text-center">
            Al enviar esta solicitud, aceptas que procesemos tu información para evaluar tu participación.
            <br />
            Te contactaremos en un plazo de 3-5 días hábiles para continuar el proceso.
          </p>
        </div>
      </div>
    </div>
  );
}
