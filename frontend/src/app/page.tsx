'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Code, Users, Feather, Languages, Star, ArrowRight, Play, CheckCircle, Zap } from 'lucide-react';
import LandingHeader from '../components/LandingHeader';
import { AdvancedBackground } from '@/components/AdvancedBackground';
import { AnimatedIcon, AnimatedCounter, PremiumButton } from '@/components/PremiumComponents';
import { FloatingElements, HolographicCard } from '@/components/PremiumEffects';

export default function LandingPage() {
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <AdvancedBackground />
      <FloatingElements />
      <LandingHeader />
      <main className="flex-grow overflow-hidden relative z-10">
        {/* Hero Section */}
        <motion.section
          className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 overflow-hidden transition-colors duration-500"
          initial="hidden"
          animate="show"
          variants={container}
        >
          {/* Geometric Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/30 dark:bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/30 dark:bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/20 dark:bg-pink-400/10 rounded-full blur-2xl"></div>
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div className="grid grid-cols-12 gap-4 h-full">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-gray-400 dark:border-gray-600"></div>
              ))}
            </div>
          </div>

          <div className="container-wide px-4 sm:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <motion.div variants={item} className="text-center lg:text-left lg:order-1">
                <motion.div variants={item} className="mb-6">
                  <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/50 dark:to-purple-900/50 border border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
                    <Feather className="inline mr-2" size={16} />
                    Tlahtolli - El lenguaje sagrado
                  </div>
                </motion.div>
                
                <motion.h1
                  className="text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 dark:text-white leading-tight mb-6"
                  variants={item}
                >
                  Aprende{' '}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                      Náhuatl
                    </span>
                    <div className="absolute -bottom-2 left-0 w-full h-4 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-400/50 dark:to-purple-400/50 opacity-30 rounded-full transform -skew-x-12"></div>
                  </span>{' '}
                  de forma moderna
                </motion.h1>

                <motion.p
                  className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-2xl lg:max-w-none"
                  variants={item}
                >
                  Revive la lengua de los <span className="font-semibold text-blue-600 dark:text-blue-400">Mexihcah</span> con tecnología interactiva y métodos de aprendizaje modernos.
                </motion.p>

                <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mb-12">
                  <motion.a
                    href="/login"
                    className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white font-semibold py-4 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="mr-3" size={20} fill="currentColor" />
                    ¡Pewaltía! (Empieza)
                    <ArrowRight className="ml-2" size={20} />
                  </motion.a>
                  
                  <motion.button
                    onClick={scrollToFeatures}
                    className="inline-flex items-center justify-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold py-4 px-8 rounded-2xl text-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Languages className="mr-3" size={20} />
                    Conoce más
                  </motion.button>
                </motion.div>

                {/* Stats */}
                <motion.div variants={item} className="grid grid-cols-3 gap-6 max-w-md lg:max-w-none">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3500+</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Palabras</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Beta</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Lecciones</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">Beta</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Usuarios</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Content - Hero Image/Illustration */}
              <motion.div 
                variants={item}
                className="relative lg:order-2 mt-12 lg:mt-0"
              >
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Main Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 transform rotate-1 lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="text-white" size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">Diccionario Interactivo</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aprende palabras nuevas</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Xochitl</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Flor</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/50 rounded-xl">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Atl</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Agua</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Cards - Ajustados para móvil */}
                  <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 sm:p-4 rounded-2xl shadow-lg transform rotate-6 lg:rotate-12 hover:rotate-3 lg:hover:rotate-6 transition-transform duration-300">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="sm:w-5 sm:h-5" />
                      <span className="font-semibold text-sm">¡Nuevo!</span>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform -rotate-3 lg:-rotate-6 hover:-rotate-1 lg:hover:-rotate-3 transition-transform duration-300">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">¡Lección completada!</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer hidden lg:block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            onClick={scrollToFeatures}
          >
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex flex-col items-center"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Descubre más</span>
              <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mt-2 animate-bounce"></div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
          <div className="container-wide px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-sm">
                <Star size={16} fill="currentColor" className="mr-2 text-yellow-500" />
                Nuestros mejores servicios
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Tlen tikitakis</span> (Lo que ofrecemos)
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Herramientas diseñadas para preservar y difundir nuestra lengua ancestral con métodos innovadores
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Service 1 - Dictionary */}
              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }
                }}
                className="group relative"
              >
                <HolographicCard className="p-8 h-full">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 dark:from-blue-900/30 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  {/* Icon */}
                  <div className="relative z-10 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <AnimatedIcon 
                        icon={BookOpen} 
                        size={32} 
                        className="text-white" 
                        hoverEffect="float"
                      />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Tlahtoltecpantiliztli</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Explora más de 3500 palabras con pronunciación, ejemplos y etimología detallada. Nuestro diccionario crece constantemente.
                    </p>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      Incluye variantes dialectales
                    </div>
                  </div>
                </HolographicCard>
              </motion.div>

              {/* Service 2 - Lessons */}
              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }
                }}
                className="group relative"
              >
                <HolographicCard className="p-8 h-full">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-50 dark:from-purple-900/30 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  {/* Icon */}
                  <div className="relative z-10 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <AnimatedIcon 
                        icon={Code} 
                        size={32} 
                        className="text-white" 
                        hoverEffect="spin"
                      />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Nemachtiliztli</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Aprende con módulos basados en la cosmovisión náhuatl y ejercicios interactivos diseñados por expertos.
                    </p>
                    <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium text-sm">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                      Desde básico hasta avanzado
                    </div>
                  </div>
                </HolographicCard>
              </motion.div>

              {/* Service 3 - Community */}
              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.3 } }
                }}
                className="group relative md:col-span-2 lg:col-span-1"
              >
                <HolographicCard className="p-8 h-full">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-50 dark:from-pink-900/30 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  {/* Icon */}
                  <div className="relative z-10 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <AnimatedIcon 
                        icon={Users} 
                        size={32} 
                        className="text-white" 
                        hoverEffect="glow"
                      />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Tlakatiliztli</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Conecta con hablantes nativos, maestros y otros aprendices en nuestro espacio cultural colaborativo.
                    </p>
                    <div className="flex items-center text-pink-600 dark:text-pink-400 font-medium text-sm">
                      <div className="w-2 h-2 rounded-full bg-pink-500 mr-2"></div>
                      Eventos mensuales y talleres
                    </div>
                  </div>
                </HolographicCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 relative overflow-hidden transition-colors duration-500">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-20 dark:opacity-30">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 dark:bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-white/10 dark:bg-white/5 rounded-full blur-3xl"></div>
            </div>
          </div>

          <div className="container-wide max-w-4xl px-4 sm:px-6 relative z-10">
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={container}
              className="text-center text-white"
            >
              <motion.div variants={item} className="mb-6">
                <div className="inline-flex items-center bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
                  <Feather className="mr-2" size={16} />
                  Tlen itech moneki Yankuik
                </div>
              </motion.div>
              
              <motion.h2 className="text-4xl lg:text-5xl font-black mb-6" variants={item}>
                Estamos en <span className="text-yellow-300 dark:text-yellow-400">fase Beta</span>
              </motion.h2>
              
              <motion.p className="text-xl lg:text-2xl mb-8 text-white/90 dark:text-gray-100/80 leading-relaxed max-w-3xl mx-auto" variants={item}>
                Esta plataforma es un <span className="font-semibold text-yellow-300 dark:text-yellow-400">equipo</span> para preservar nuestra <span className="font-semibold">lengua</span>. Tu participación es invaluable.
              </motion.p>
              
              <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <PremiumButton 
                    variant="secondary" 
                    size="lg"
                    className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                  >
                    <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Danos tu feedback
                  </PremiumButton>
                </Link>
                
                <Link href="/login">
                  <PremiumButton 
                    variant="ghost" 
                    size="lg"
                    className="border-2 border-white dark:border-gray-300 text-white dark:text-gray-100 hover:bg-white hover:text-blue-600 dark:hover:bg-gray-100 dark:hover:text-blue-700"
                  >
                    <AnimatedIcon 
                      icon={Play} 
                      size={20} 
                      className="mr-3" 
                      hoverEffect="pulse"
                    />
                    Comenzar ahora
                  </PremiumButton>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, staggerChildren: 0.1 }}
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-3xl font-bold text-yellow-300 dark:text-yellow-400">
                    <AnimatedCounter end={3_500} suffix="+" />
                  </div>
                  <div className="text-sm text-white/80 dark:text-gray-200/70">Palabras disponibles</div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-3xl font-bold text-yellow-300 dark:text-yellow-400">
                    <AnimatedCounter end={100} suffix="%" />
                  </div>
                  <div className="text-sm text-white/80 dark:text-gray-200/70">Gratuito</div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-3xl font-bold text-yellow-300 dark:text-yellow-400">24/7</div>
                  <div className="text-sm text-white/80 dark:text-gray-200/70">Acceso disponible</div>
                </motion.div>
                <div>
                  <div className="text-3xl font-bold text-yellow-300 dark:text-yellow-400">∞</div>
                  <div className="text-sm text-white/80 dark:text-gray-200/70">Recursos ilimitados</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}