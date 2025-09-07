'use client';

import { useState } from 'react';
import { X, Mail, MessageCircle, Phone, User, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { submitContactMessage, isValidEmail, isValidPhone, type ContactMessage } from '@/lib/contactService';

interface ContactModalProps {
  isOpen: boolean;
  type: 'email' | 'chat';
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export default function ContactModal({ isOpen, type, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Validar asunto
    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es obligatorio';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'El asunto debe tener al menos 5 caracteres';
    }

    // Validar mensaje
    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es obligatorio';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
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
      const contactData: ContactMessage = {
        nombre: formData.name.trim(),
        email: formData.email.trim(),
        telefono: formData.phone.trim() || undefined,
        asunto: formData.subject.trim(),
        mensaje: formData.message.trim(),
        tipo_contacto: type
      };

      await submitContactMessage(contactData);
      
      setSubmitStatus('success');
      setSubmitMessage(
        type === 'chat' 
          ? '¡Mensaje enviado! Te contactaremos por chat lo antes posible.' 
          : '¡Mensaje enviado correctamente! Te responderemos por email pronto.'
      );
      
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 3000);

    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(
        error instanceof Error 
          ? error.message 
          : 'Hubo un error al enviar el mensaje. Por favor, intenta de nuevo.'
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
      subject: '',
      message: ''
    });
    setErrors({});
    setSubmitStatus('idle');
    setSubmitMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {type === 'email' ? (
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-amber-600" />
                </div>
              ) : (
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900">
                {type === 'email' ? 'Envíanos un correo' : 'Chatea con nosotros'}
              </h2>
            </div>
            <button
              onClick={resetModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {type === 'email' 
              ? 'Nos pondremos en contacto contigo por email pronto' 
              : 'Inicia una conversación en tiempo real con nuestro equipo'
            }
          </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Nombre completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="tu@email.com"
              disabled={isSubmitting || submitStatus === 'success'}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="+52 123 456 7890"
              disabled={isSubmitting || submitStatus === 'success'}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Asunto */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Asunto *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder={type === 'chat' ? 'Tema de la conversación' : 'Asunto del correo'}
              disabled={isSubmitting || submitStatus === 'success'}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
            )}
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder={
                type === 'chat' 
                  ? 'Describe tu consulta para iniciar la conversación...' 
                  : 'Escribe tu mensaje aquí...'
              }
              disabled={isSubmitting || submitStatus === 'success'}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
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
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                type === 'email'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Enviando...
                </>
              ) : submitStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Enviado
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {type === 'email' ? 'Enviar correo' : 'Iniciar chat'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-500 text-center">
            Al enviar este formulario, aceptas que procesemos tu información para responderte.
            <br />
            Normalmente respondemos en menos de 24 horas.
          </p>
        </div>
      </div>
    </div>
  );
}
