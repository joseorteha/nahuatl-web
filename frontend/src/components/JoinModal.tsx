'use client';

import { useState } from 'react';
import { X, Users, Heart, BookOpen, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinModal({ isOpen, onClose }: JoinModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const joinOptions = [
    {
      id: 'register',
      title: 'Crear cuenta',
      description: 'Regístrate para guardar palabras, contribuir y acceder a todas las funciones',
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      action: 'Ir a registro',
      href: '/login'
    },
    {
      id: 'contribute',
      title: 'Contribuir palabras',
      description: 'Ayuda a enriquecer nuestro diccionario con nuevas palabras en náhuatl',
      icon: <BookOpen className="h-6 w-6 text-amber-600" />,
      action: 'Contribuir ahora',
      href: '/contribuir'
    },
    {
      id: 'community',
      title: 'Únete a la comunidad',
      description: 'Participa en discusiones, comparte experiencias y aprende juntos',
      icon: <Heart className="h-6 w-6 text-pink-600" />,
      action: 'Ver comunidad',
      href: '/feedback'
    },
    {
      id: 'volunteer',
      title: 'Ser voluntario',
      description: 'Ayuda como moderador, traductor o creador de contenido',
      icon: <Globe className="h-6 w-6 text-blue-600" />,
      action: 'Contactar',
      href: '#contact'
    }
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    if (optionId === 'volunteer') {
      // Aquí puedes abrir el modal de contacto o manejar la lógica de voluntariado
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setSelectedOption(null);
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">¡Únete a Nawatlajtol!</h2>
                <p className="text-gray-600">Hay muchas formas de ser parte de nuestra comunidad</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {showSuccess ? (
            <div className="text-center py-8">
              <div className="bg-emerald-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Gracias por tu interés!</h3>
              <p className="text-gray-600">
                Nos pondremos en contacto contigo pronto para discutir las oportunidades de voluntariado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-700">
                  Selecciona cómo te gustaría contribuir a la preservación del náhuatl:
                </p>
              </div>

              <div className="grid gap-4">
                {joinOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedOption === option.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-25'
                    }`}
                    onClick={() => handleOptionSelect(option.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm flex-shrink-0">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                        
                        {option.href.startsWith('#') ? (
                          <button
                            className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOptionSelect(option.id);
                            }}
                          >
                            {option.action}
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <Link
                            href={option.href}
                            className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                            }}
                          >
                            {option.action}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-1 rounded-full flex-shrink-0 mt-0.5">
                    <Heart className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900 mb-1">¡Cada contribución cuenta!</h4>
                    <p className="text-amber-800 text-sm">
                      Ya sea con una palabra nueva, un comentario constructivo o simplemente usando la plataforma, 
                      estás ayudando a preservar el náhuatl para futuras generaciones.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
