'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Feather, BookOpen, Heart, Globe, Mic, Users } from 'lucide-react';
import ContactModal from '@/components/ContactModal';
import JoinModal from '@/components/JoinModal';

export default function NosotrosPage() {
  const [contactModal, setContactModal] = useState<{ isOpen: boolean; type: 'email' | 'chat' }>({
    isOpen: false,
    type: 'email'
  });
  const [joinModal, setJoinModal] = useState(false);

  const openContactModal = (type: 'email' | 'chat') => {
    setContactModal({ isOpen: true, type });
  };

  const closeContactModal = () => {
    setContactModal({ isOpen: false, type: 'email' });
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-emerald-50 to-white relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-emerald-50 to-teal-50"></div>
      
      {/* Contenido principal */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Encabezado con elementos decorativos */}
          <div className="text-center mb-16 relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="bg-amber-100 text-amber-600 p-3 rounded-full inline-flex">
                <Feather className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-amber-800 mb-4 relative">
              <span className="relative inline-block">
                To nonemilis
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 200 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,10 100,5 T200,5" fill="none" stroke="#b45309" strokeWidth="2" />
                </svg>
              </span>
              <br />
              <span className="text-emerald-700">Nuestra historia</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              El viaje de reconectar con nuestras raíces a través de la tecnología
            </p>
          </div>

          {/* Contenedor principal con efecto de códice */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-amber-200">
            {/* Barra decorativa superior */}
            <div className="bg-gradient-to-r from-amber-500 to-emerald-600 h-2 w-full"></div>
            
            <div className="p-8 md:p-12">
              {/* Sección de historia con iconos */}
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-3 rounded-full flex-shrink-0 mt-1">
                      <BookOpen className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-800 mb-2">El comienzo</h3>
                      <p className="text-gray-700">
                        Todo gran viaje comienza con una sola palabra. Para nosotros, esa palabra fue &quot;Tlasohkamati&quot; (Gracias). Nawatlajtol nació de una búsqueda personal por reconectar con una herencia que sentíamos lejana pero vibrante.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 p-3 rounded-full flex-shrink-0 mt-1">
                      <Globe className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-emerald-800 mb-2">La visión</h3>
                      <p className="text-gray-700">
                        Vimos una oportunidad única: usar el poder de la tecnología para construir un puente entre el pasado y el futuro. Nawatlajtol fue concebido como una solución moderna a un desafío ancestral.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full flex-shrink-0 mt-1">
                      <Mic className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-800 mb-2">La lengua viva</h3>
                      <p className="text-gray-700">
                        Entendimos que una lengua no vive en los libros, vive en las voces de su gente. Cada lección completada es una contribución a un esfuerzo colectivo: la revitalización de una de las lenguas más importantes de nuestro continente.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-full flex-shrink-0 mt-1">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-800 mb-2">La comunidad</h3>
                      <p className="text-gray-700">
                        Nawatlajtol es un punto de encuentro. &quot;Ma timoixmachtikan&quot; (Conozcámonos). Aprender náhuatl es unirse a una conversación que ha durado siglos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cita destacada */}
              <div className="mt-16 p-6 bg-amber-50 rounded-xl border-l-4 border-amber-500">
                <blockquote className="text-2xl italic text-amber-800 text-center font-medium">
                  &quot;El náhuatl no es solo un idioma, es una forma de ver el mundo. Cada palabra es un universo de significado.&quot;
                </blockquote>
              </div>
            </div>
          </div>

          {/* Sección del fundador */}
          <div className="mt-16 bg-gradient-to-r from-amber-100 to-emerald-100 rounded-3xl p-8 md:p-12 shadow-lg border border-amber-200">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <Image 
                  src="/jose.jpeg" 
                  alt="José Ortega" 
                  width={160} 
                  height={160} 
                  className="rounded-full border-4 border-white shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full">
                  <Heart className="h-5 w-5" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-emerald-800">José Ortega</h2>
                <p className="text-lg text-amber-700 font-medium mb-4">Fundador de Nawatlajtol</p>
                <p className="text-gray-700 max-w-2xl">
                  Apasionado por la tecnología, la cultura y la educación. Mi sueño es que el náhuatl vuelva a escucharse en cada rincón, y que la tecnología sea el puente para lograrlo. <span className="text-emerald-600 font-medium">Tlazocamatin</span> por ser parte de esta comunidad.
                </p>
                <div className="mt-6 flex justify-center md:justify-start gap-4">
                  <button 
                    onClick={() => openContactModal('email')}
                    className="inline-flex items-center px-5 py-2 bg-white text-amber-700 font-medium rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contáctame
                  </button>
                  <button 
                    onClick={() => setJoinModal(true)}
                    className="inline-flex items-center px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Únete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de valores */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-amber-800 mb-12">
              Nuestros <span className="text-emerald-600">valores</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Globe className="h-8 w-8 text-amber-600" />,
                  title: "Identidad",
                  description: "Honramos nuestras raíces y trabajamos para mantener viva la cosmovisión náhuatl."
                },
                {
                  icon: <BookOpen className="h-8 w-8 text-emerald-600" />,
                  title: "Educación",
                  description: "Creemos en el aprendizaje accesible, interactivo y respetuoso con la cultura."
                },
                {
                  icon: <Users className="h-8 w-8 text-blue-600" />,
                  title: "Comunidad",
                  description: "El náhuatl vive en sus hablantes. Fomentamos conexiones significativas."
                }
              ].map((value, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-700 text-center">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ContactModal 
        isOpen={contactModal.isOpen}
        onClose={closeContactModal}
        type={contactModal.type}
      />
      <JoinModal 
        isOpen={joinModal}
        onClose={() => setJoinModal(false)}
      />
    </main>
  );
}