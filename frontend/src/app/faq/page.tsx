'use client';
import { ChevronDown, MessageCircle, Book, Users, Feather, Globe } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: '¿Qué es Nawatlajtol?',
    answer: 'Es una plataforma digital para aprender, practicar y preservar el idioma náhuatl de manera moderna, interactiva y gratuita. Usamos tecnología avanzada para hacer accesible nuestra lengua a nuevas generaciones.',
    icon: <Feather className="h-5 w-5 text-amber-600" />
  },
  {
    question: '¿Quién puede usar la plataforma?',
    answer: 'Cualquier persona interesada en el náhuatl: estudiantes, hablantes nativos, curiosos, maestros y público en general. ¡No necesitas conocimientos previos!',
    icon: <Users className="h-5 w-5 text-emerald-600" />
  },
  {
    question: '¿Cómo puedo contribuir o dar sugerencias?',
    answer: 'Puedes enviarnos tus comentarios desde la sección de feedback o contactarnos en nuestras redes sociales. También aceptamos colaboraciones de hablantes y maestros. ¡Tus palabras nos construyen!',
    icon: <MessageCircle className="h-5 w-5 text-blue-600" />
  },
  {
    question: '¿Habrá más recursos y lecciones en el futuro?',
    answer: '¡Siempre! Estamos en desarrollo constante. Pronto agregaremos: módulos avanzados de gramática, historias tradicionales interactivas, recursos para maestros y más variantes dialectales.',
    icon: <Book className="h-5 w-5 text-purple-600" />
  },
  {
    question: '¿Cómo puedo practicar el náhuatl?',
    answer: 'Te recomendamos: usar nuestro diccionario diariamente, completar al menos una lección por semana, unirte a nuestros círculos de conversación y seguir nuestras redes para tips diarios.',
    icon: <Globe className="h-5 w-5 text-amber-600" />
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-emerald-50 to-white relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10 bg-[url('/assets/nahuatl-pattern.svg')] bg-repeat"></div>
      
      {/* Contenido principal */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Encabezado con elementos decorativos */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-amber-200">
            <MessageCircle className="h-4 w-4 mr-2" />
            Tlen titlanantih (Lo que preguntan)
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-800 mb-4">
            Preguntas <span className="text-emerald-700">Frecuentes</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra respuestas a las dudas más comunes sobre nuestra plataforma
          </p>
        </div>

        {/* Acordeón de FAQs */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-amber-50 p-2 rounded-lg flex-shrink-0">
                    {faq.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {faq.question.split(' (')[0]}
                    {faq.question.includes('(') && (
                      <span className="block text-sm font-normal text-gray-500 mt-1">
                        {faq.question.match(/\(([^)]+)\)/)?.[1]}
                      </span>
                    )}
                  </h2>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-amber-600 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}
                />
              </button>
              
              <div 
                className={`px-6 pb-6 pt-0 transition-all duration-300 ${openIndex === idx ? 'block' : 'hidden'}`}
                style={{ marginTop: openIndex === idx ? '0' : '-0.5rem' }}
              >
                <div 
                  className="text-gray-700 prose prose-ul:list-disc prose-ol:list-decimal prose-li:my-1"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sección de contacto adicional */}
        <div className="mt-16 bg-gradient-to-r from-amber-100 to-emerald-100 rounded-2xl p-8 md:p-10 shadow-lg border border-amber-200">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="bg-white p-4 rounded-full shadow-md flex-shrink-0">
              <MessageCircle className="h-10 w-10 text-amber-600" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-emerald-800 mb-2">¿Tienes otra pregunta?</h2>
              <p className="text-gray-700 mb-4">
                No dudes en contactarnos. Estamos aquí para ayudarte en tu viaje de aprendizaje del náhuatl.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <a 
                  href="#" 
                  className="inline-flex items-center justify-center px-5 py-3 bg-white text-amber-700 font-medium rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors shadow-sm"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Envíanos un correo
                </a>
                <a 
                  href="#" 
                  className="inline-flex items-center justify-center px-5 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chatea con nosotros
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}