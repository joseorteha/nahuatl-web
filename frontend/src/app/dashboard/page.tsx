'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookText, 
  Users, 
  GraduationCap, 
  MessageCircle, 
  AlertTriangle, 
  Feather,
  BookOpen,
  Heart,
  Star,
  TrendingUp
} from 'lucide-react';
import Header from '@/components/Header';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    checkUser();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  };

  const cardHover = {
    scale: 1.03,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.3 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <Header />
      
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-5 bg-[url('/assets/nahuatl-pattern.svg')] bg-repeat"></div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Bienvenida personalizada */}
          <motion.div 
            variants={itemVariants} 
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-emerald-100 text-amber-800 px-6 py-3 rounded-full text-sm font-medium mb-6 border border-amber-200 shadow-sm">
              <Feather className="h-4 w-4 mr-2" />
              ¡Bienvenido a tu espacio de aprendizaje!
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-800 mb-4">
              ¡Bienvenido, <span className="text-emerald-700">{user?.full_name || 'Amigo'}!</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Bienvenido a <span className="font-bold text-emerald-600">Nawatlahtol</span>, tu plataforma para aprender y preservar la lengua náhuatl. 
              Explora nuestras herramientas y únete a nuestra comunidad de aprendizaje.
            </p>
          </motion.div>

          {/* Tarjeta de estado beta */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-12 shadow-lg border-l-4 border-blue-500 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="bg-blue-500 p-3 rounded-full flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-blue-900 mb-1">¡Estamos en desarrollo activo!</h3>
              <p className="text-blue-800">
                Esta es una versión beta. Ayúdanos a mejorarla con tus <Link href="/feedback" className="font-semibold underline text-emerald-700 hover:text-emerald-800">comentarios y sugerencias</Link>.
              </p>
            </div>
          </motion.div>

          {/* Sección de tarjetas principales */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          >
            {/* Tarjeta Diccionario */}
            <motion.div 
              variants={itemVariants}
              whileHover={cardHover}
              className="group"
            >
              <Link 
                href="/diccionario" 
                className="block h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-48 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 flex items-center justify-center">
                  <BookText className="h-20 w-20 text-white opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute bottom-4 right-4 bg-white text-emerald-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    DISPONIBLE
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Diccionario Interactivo</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Explora cientos de palabras náhuatl con definiciones, ejemplos, pronunciaciones y notas culturales.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-emerald-600 font-medium">
                      <span>Explorar ahora</span>
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </div>
                    <div className="flex items-center text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm">500+ palabras</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Tarjeta Comunidad */}
            <motion.div 
              variants={itemVariants}
              whileHover={cardHover}
              className="group"
            >
              <Link 
                href="/feedback" 
                className="block h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center">
                  <Users className="h-20 w-20 text-white opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute bottom-4 right-4 bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    DISPONIBLE
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Comunidad</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Únete a la conversación, comparte tus ideas, resuelve dudas y aprende con otros estudiantes.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-600 font-medium">
                      <span>Participar</span>
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </div>
                    <div className="flex items-center text-amber-500">
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm">Comunidad activa</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Tarjeta Lecciones */}
            <motion.div 
              variants={itemVariants}
              className="group relative"
            >
              <div className="h-full bg-white/50 rounded-2xl overflow-hidden shadow-lg border-2 border-dashed border-gray-300">
                <div className="relative h-48 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center">
                  <GraduationCap className="h-20 w-20 text-white opacity-90" />
                  <div className="absolute bottom-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    PRÓXIMAMENTE
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-500 mb-3">Lecciones Interactivas</h2>
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    Pronto podrás acceder a lecciones estructuradas, ejercicios interactivos y evaluaciones para dominar el náhuatl paso a paso.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-400 font-medium">
                      <span>En desarrollo</span>
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <div className="flex items-center text-amber-500">
                      <TrendingUp className="w-4 h-4" />
                      <span className="ml-1 text-sm">Progreso personalizado</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl"></div>
            </motion.div>
          </motion.div>

          {/* Sección de recursos adicionales */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          >
            {/* FAQ */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Preguntas Frecuentes</h3>
                  <p className="text-gray-600 text-sm">Resuelve tus dudas</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Encuentra respuestas a las preguntas más comunes sobre el náhuatl, la plataforma y el aprendizaje.
              </p>
              <Link 
                href="/faq" 
                className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700"
              >
                Ver FAQ
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </motion.div>

            {/* Nosotros */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-emerald-100 p-3 rounded-full mr-4">
                  <Heart className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Sobre Nosotros</h3>
                  <p className="text-gray-600 text-sm">Conoce nuestro proyecto</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Descubre la historia detrás de Nawatlajtol y nuestro compromiso con la preservación de la lengua náhuatl.
              </p>
              <Link 
                href="/nosotros" 
                className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700"
              >
                Conocer más
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* Sección de contacto */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-r from-emerald-50 to-amber-50 rounded-2xl p-8 md:p-12 border border-emerald-100 shadow-lg"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="bg-white p-6 rounded-full shadow-lg flex-shrink-0">
                <MessageCircle className="h-12 w-12 text-emerald-600" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-emerald-800 mb-4">¿Necesitas ayuda?</h2>
                <p className="text-gray-700 mb-6 max-w-2xl text-lg leading-relaxed">
                  Estamos aquí para acompañarte en tu viaje de aprendizaje. Únete a nuestra comunidad, 
                  comparte tus experiencias y resuelve tus dudas con otros estudiantes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link 
                    href="/feedback" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Ir a la comunidad
                  </Link>
                  <Link 
                    href="/faq" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors shadow-lg border border-emerald-200"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Ver FAQ
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}