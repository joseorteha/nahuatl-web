import React from 'react';

const faqs = [
  {
    question: '¿Qué es Timumachtikan Nawatl?',
    answer: 'Es una plataforma web para aprender, practicar y preservar el idioma náhuatl de manera moderna e interactiva.'
  },
  {
    question: '¿Es gratis usar la plataforma?',
    answer: 'Sí, el acceso a las lecciones, diccionario y ejercicios es completamente gratuito.'
  },
  {
    question: '¿Puedo contribuir con contenido o sugerencias?',
    answer: '¡Por supuesto! Tu feedback es muy valioso. Puedes contactarnos desde la sección de feedback o en nuestras redes sociales.'
  },
  {
    question: '¿Habrá más lenguas indígenas en el futuro?',
    answer: 'Nos encantaría expandirnos a otras lenguas originarias. ¡Sigue nuestras redes para estar al tanto de novedades!'
  }
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center py-16 px-4">
      <h1 className="text-4xl font-bold text-emerald-700 mb-8">Preguntas Frecuentes</h1>
      <div className="max-w-2xl w-full space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-gray-50 rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{faq.question}</h2>
            <p className="text-gray-700 text-base">{faq.answer}</p>
          </div>
        ))}
      </div>
    </main>
  );
} 