'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, Book, Users, Feather, Globe, HelpCircle, Lightbulb, ArrowRight, Star, CheckCircle, Zap, Heart } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import Footer from '@/components/navigation/Footer';

const faqs = [
  {
    question: '¿Qué es Nawatlahtol?',
    answer: 'Nawatlahtol es una plataforma digital educativa dedicada a la preservación, enseñanza y promoción de la lengua náhuatl. Utilizamos tecnología moderna para hacer accesible esta hermosa lengua ancestral a estudiantes de todo el mundo, combinando métodos pedagógicos efectivos con respeto por la tradición cultural.',
    icon: <Feather className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
    category: 'general'
  },
  {
    question: '¿Es completamente gratuito?',
    answer: 'Sí, Nawatlahtol es 100% gratuito. Creemos que el acceso al conocimiento de las lenguas originarias debe ser universal. Todos nuestros recursos, lecciones, diccionario y herramientas están disponibles sin costo alguno para cualquier persona interesada en aprender náhuatl.',
    icon: <Star className="h-5 w-5 text-green-600 dark:text-green-400" />,
    category: 'general'
  },
  {
    question: '¿Quién puede usar la plataforma?',
    answer: 'Nawatlahtol está diseñado para todo tipo de estudiantes: desde principiantes sin conocimiento previo hasta hablantes nativos que desean fortalecer sus habilidades. Es ideal para estudiantes, profesores, investigadores, y cualquier persona curious about esta rica tradición lingüística.',
    icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    category: 'usuarios'
  },
  {
    question: '¿Qué recursos de aprendizaje ofrecen?',
    answer: 'Ofrecemos un diccionario interactivo con más de 3,500 palabras, lecciones estructuradas por niveles, ejercicios de pronunciación, evaluaciones de progreso, contenido cultural, y herramientas de práctica. Constantemente agregamos nuevo contenido basado en feedback de nuestra comunidad.',
    icon: <Book className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
    category: 'contenido'
  },
  {
    question: '¿Cómo puedo empezar a aprender?',
    answer: 'Es muy sencillo: crea una cuenta gratuita, completa tu perfil de aprendizaje, y comienza con nuestras lecciones básicas. Te recomendamos dedicar al menos 15-20 minutos diarios y usar nuestro diccionario para reforzar vocabulario. El progreso se guarda automáticamente.',
    icon: <ArrowRight className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
    category: 'comenzar'
  },
  {
    question: '¿Puedo contribuir con contenido?',
    answer: 'Absolutamente. Valoramos mucho las contribuciones de hablantes nativos, maestros y estudiantes avanzados. Puedes colaborar sugiriendo traducciones, compartiendo conocimiento cultural, reportando errores, o ayudando con contenido audio. Contactanos através de nuestro formulario de feedback.',
    icon: <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
    category: 'contribuir'
  },
  {
    question: '¿Qué variante del náhuatl enseñan?',
    answer: 'Actualmente nos enfocamos en el náhuatl clásico y variantes centrales más ampliamente habladas, pero nuestro objetivo es expandir gradualmente para incluir otras variantes regionales. Reconocemos la riqueza dialectal del náhuatl y trabajamos con hablantes de diferentes comunidades.',
    icon: <Globe className="h-5 w-5 text-red-600 dark:text-red-400" />,
    category: 'contenido'
  },
  {
    question: '¿Habrá más funcionalidades en el futuro?',
    answer: 'Definitivamente. Nuestro roadmap incluye: módulos avanzados de gramática, historias tradicionales interactivas, comunidad de práctica, certificaciones, recursos para educadores, aplicación móvil, y expansión a más variantes dialectales. Estamos en desarrollo constante.',
    icon: <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
    category: 'futuro'
  }
];

const categories = [
  { id: 'todos', label: 'Todas las preguntas', icon: HelpCircle },
  { id: 'general', label: 'General', icon: Feather },
  { id: 'usuarios', label: 'Para usuarios', icon: Users },
  { id: 'contenido', label: 'Contenido', icon: Book },
  { id: 'comenzar', label: 'Comenzar', icon: ArrowRight },
  { id: 'contribuir', label: 'Contribuir', icon: MessageCircle },
  { id: 'futuro', label: 'Futuro', icon: Lightbulb }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('todos');

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = activeCategory === 'todos' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <>
      <ConditionalHeader />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-slate-500/10 dark:from-cyan-400/5 dark:via-blue-400/5 dark:to-slate-400/5"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-3 bg-cyan-50 dark:bg-cyan-900/30 px-6 py-3 rounded-full mb-8">
                <HelpCircle className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                <span className="text-cyan-800 dark:text-cyan-200 font-medium">Preguntas Frecuentes</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                ¿Tienes preguntas sobre
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">
                  Nawatlahtol?
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Encuentra respuestas a las preguntas más comunes sobre nuestra plataforma, 
                el aprendizaje del náhuatl y cómo puedes formar parte de nuestra comunidad.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-cyan-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-600">
                        {faq.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {faq.question}
                      </h3>
                    </div>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-6 pt-2">
                          <div className="border-l-4 border-cyan-600 pl-6">
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* José Ortega Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-cyan-200 dark:border-slate-700">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="flex flex-col lg:flex-row items-center gap-12"
              >
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-cyan-500 shadow-xl">
                    <Image 
                      src="/jose.jpeg" 
                      alt="José Ortega - Fundador de Nawatlahtol"
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-3 rounded-full shadow-lg">
                    <MessageCircle className="h-5 w-5 fill-current" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-cyan-800 dark:text-cyan-300 mb-2">
                    José Ortega
                  </h2>
                  <p className="text-lg text-blue-700 dark:text-blue-400 font-semibold mb-4">
                    Fundador de Nawatlahtol
                  </p>
                  
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                    ¿Tienes otra pregunta? No dudes en contactarme directamente. 
                    Estoy aquí para ayudarte en tu viaje de aprendizaje del náhuatl.
                  </p>

                  {/* Contact Button */}
                  <a
                    href="mailto:joseortegahac@gmail.com?subject=Pregunta sobre Nawatlahtol - FAQ&body=Hola José,%0D%0A%0D%0ATengo una pregunta sobre Nawatlahtol:%0D%0A%0D%0A[Escribe tu pregunta aquí]%0D%0A%0D%0AGracias por tu tiempo.%0D%0A%0D%0ASaludos,"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Envíame tu pregunta
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}