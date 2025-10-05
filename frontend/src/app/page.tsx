'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import { BookOpen, Code, Users, Feather, Languages, Star, ArrowRight, Play, CheckCircle, Zap, Sparkles } from 'lucide-react';
import LandingHeader from '../components/navigation/LandingHeader';
import { AdvancedBackground } from '@/components/effects/AdvancedBackground';
import { FloatingElements } from '@/components/effects/PremiumEffects';
import PWAInstallPrompt from '@/components/features/pwa/PWAInstallPrompt';
import AutoRedirect from '@/components/auth/AutoRedirect';

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
      <Head>
        {/* SEO Meta Tags */}
        <title>Nawatlahtol - Aprende Náhuatl en la Era Digital</title>
        <meta name="description" content="Aprende náhuatl con tecnología moderna. Diccionario interactivo, lecciones y comunidad para preservar nuestra lengua ancestral. ¡Comienza tu viaje cultural hoy!" />
        <meta name="keywords" content="náhuatl, aprender náhuatl, diccionario náhuatl, lengua indígena, cultura mexicana, tlahtolli, nemachtiliztli" />
        <meta name="author" content="Nawatlahtol" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="es" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Nawatlahtol - Aprende Náhuatl en la Era Digital" />
        <meta property="og:description" content="Conecta con la lengua de los Mexihcah mediante tecnología moderna y aprendizaje interactivo. Más de 3500 palabras disponibles." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nawatlahtol.com" />
        <meta property="og:image" content="https://nawatlahtol.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Nawatlahtol" />
        <meta property="og:locale" content="es_MX" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nawatlahtol - Aprende Náhuatl en la Era Digital" />
        <meta name="twitter:description" content="Conecta con la lengua de los Mexihcah mediante tecnología moderna y aprendizaje interactivo." />
        <meta name="twitter:image" content="https://nawatlahtol.com/og-image.jpg" />
        
        {/* Schema.org Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Nawatlahtol",
            "description": "Plataforma educativa para aprender náhuatl con tecnología moderna",
            "url": "https://nawatlahtol.com",
            "logo": "https://nawatlahtol.com/logo.png",
            "sameAs": [
              "https://twitter.com/nawatlahtol",
              "https://facebook.com/nawatlahtol"
            ],
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "MXN",
              "description": "Acceso gratuito a la plataforma"
            }
          })}
        </script>
        
        {/* Performance Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.nawatlahtol.com" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#06B6D4" />
        <meta name="msapplication-TileColor" content="#06B6D4" />
      </Head>
      
      {/* Auto-redirect para usuarios autenticados */}
      <AutoRedirect />
      
      <AdvancedBackground />
      <FloatingElements />
      <LandingHeader />
      <main className="flex-grow overflow-hidden relative z-0">
        {/* Hero Section - Colores mejorados */}
        <motion.section
          className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden transition-colors duration-500"
          initial="hidden"
          animate="show"
          variants={container}
        >
          {/* Background Elements - Colores cian y azul */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
            {/* Líneas de grid sutiles */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
          </div>

          <div className="container-wide px-6 sm:px-8 relative z-0 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              {/* Left Content - Colores mejorados */}
              <motion.div variants={item} className="text-center lg:text-left lg:order-1">
                {/* Badge minimalista */}
                <motion.div variants={item} className="mb-8">
                  <div className="inline-flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-300/20 dark:border-slate-600/20 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-full text-sm font-medium shadow-sm">
                    <Sparkles className="inline mr-2 text-cyan-500" size={16} />
                    Preservando nuestra herencia cultural
                  </div>
                </motion.div>
                
                {/* Título principal - Colores más suaves */}
                <motion.h1
                  className="text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-8"
                  variants={item}
                >
                  <span className="block">Aprende</span>
                  <span className="relative block mt-2">
                    <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                      Náhuatl
                    </span>
                    <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-80"></div>
                  </span>
                  <span className="block text-2xl lg:text-3xl font-light text-slate-600 dark:text-slate-400 mt-4">
                    en la era digital
                  </span>
                </motion.h1>

                {/* Subtítulo - Color mejorado */}
                <motion.p
                  className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-12 max-w-2xl"
                  variants={item}
                >
                  Conecta con la lengua de los <span className="font-medium text-cyan-600 dark:text-cyan-400">Mexihcah</span> mediante tecnología moderna y aprendizaje interactivo.
                </motion.p>

                {/* CTAs - Micro-interacciones avanzadas */}
                <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mb-16">
                  <motion.a
                    href="/login"
                    className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium py-4 px-8 rounded-xl text-base hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Comenzar a aprender náhuatl"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <Play className="mr-3" size={20} />
                    ¡Pewaltía! (Empieza)
                    <ArrowRight className="ml-2" size={20} />
                  </motion.a>
                  
                  <motion.button
                    onClick={scrollToFeatures}
                    className="inline-flex items-center justify-center bg-transparent text-slate-700 dark:text-slate-300 font-medium py-4 px-8 rounded-xl text-base border-2 border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 hover:bg-cyan-500/5 group"
                    whileHover={{ 
                      scale: 1.02,
                      y: -2
                    }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Ver características de la plataforma"
                  >
                    <motion.div
                      className="mr-3"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Languages size={20} />
                    </motion.div>
                    Conoce más
                  </motion.button>
                </motion.div>

                {/* PWA Install Prompt */}
                <motion.div variants={item} className="mb-8">
                  <PWAInstallPrompt />
                </motion.div>

                {/* Stats - Colores más suaves */}
                <motion.div variants={item} className="grid grid-cols-3 gap-8 max-w-md">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-semibold text-cyan-600 dark:text-cyan-400 mb-1">3.5K+</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Palabras</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-1">Beta</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Lecciones</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-semibold text-cyan-600 dark:text-cyan-400 mb-1">Beta</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Usuarios</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Content - Tarjetas más pequeñas y elegantes */}
              <motion.div 
                variants={item}
                className="relative lg:order-2 mt-16 lg:mt-0"
              >
                <div className="relative mx-auto max-w-md">
                  {/* Main Card - Más compacta con lazy loading */}
                  <motion.div 
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/40 dark:border-slate-700/40 shadow-lg"
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div 
                        className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center"
                        whileHover={{ rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <BookOpen className="text-white" size={20} />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Diccionario Interactivo</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Aprende palabras nuevas</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <motion.div 
                        className="flex items-center justify-between p-2 bg-slate-50/60 dark:bg-slate-700/60 rounded-md"
                        whileHover={{ x: 5, backgroundColor: "rgba(6, 182, 212, 0.05)" }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">Xochitl</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Flor</span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center justify-between p-2 bg-cyan-50/40 dark:bg-cyan-900/20 rounded-md"
                        whileHover={{ x: 5, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">Atl</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Agua</span>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Floating Elements - Más pequeños */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-2 rounded-md shadow-lg">
                    <div className="flex items-center gap-1">
                      <Zap size={12} />
                      <span className="font-bold text-[10px]">¡Nuevo!</span>
                    </div>
                  </div>

                  <div className="absolute -bottom-2 -left-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-2 rounded-md border border-slate-200/40 dark:border-slate-700/40 shadow-lg">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="text-green-500" size={12} />
                      <span className="text-[10px] font-medium text-slate-700 dark:text-slate-200">Completado</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator - Color cian */}
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
              <div className="w-5 h-8 border border-cyan-400/30 rounded-full flex justify-center">
                <div className="w-0.5 h-2 bg-cyan-400 rounded-full mt-2 animate-bounce"></div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Features Section - 3 colores principales: Blanco, Cian, Azul */}
        <section id="features" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-500">
          <div className="container-wide px-6 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 px-6 py-2 rounded-full text-sm font-medium mb-6 border border-cyan-200/50 dark:border-cyan-700/30">
                <Star size={16} className="mr-2" />
                Características principales
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Tlen tikitakis
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400">
                Herramientas modernas para preservar y aprender nuestra lengua ancestral
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Service 1 - Cian con micro-interacciones */}
              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                }}
                className="group"
              >
                <motion.div 
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700/60 hover:border-cyan-300/60 dark:hover:border-cyan-600/60 transition-all duration-300 h-full shadow-sm hover:shadow-md cursor-pointer"
                  whileHover={{ 
                    y: -5,
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  role="button"
                  tabIndex={0}
                  aria-label="Diccionario interactivo de náhuatl"
                >
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4"
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <BookOpen className="text-white" size={24} />
                  </motion.div>
                  
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Tlahtoltecpantiliztli</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    Explora más de 3500 palabras con pronunciación, ejemplos y etimología detallada.
                  </p>
                  
                  <motion.div 
                    className="flex items-center text-cyan-600 dark:text-cyan-400 text-xs font-medium"
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.div>
                    Incluye variantes dialectales
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Service 2 - Azul */}
              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } }
                }}
                className="group"
              >
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300/60 dark:hover:border-blue-600/60 transition-all duration-300 h-full shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Code className="text-white" size={24} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Nemachtiliztli</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    Aprende con módulos basados en la cosmovisión náhuatl y ejercicios interactivos.
                  </p>
                  
                  <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                    Desde básico hasta avanzado
                  </div>
                </div>
              </motion.div>

              {/* Service 3 - Cian/Azul gradient */}
              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }
                }}
                className="group"
              >
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700/60 hover:border-cyan-300/60 dark:hover:border-cyan-600/60 transition-all duration-300 h-full shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <Users className="text-white" size={24} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Tlakatiliztli</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    Conecta con hablantes nativos y otros aprendices en nuestro espacio cultural.
                  </p>
                  
                  <div className="flex items-center text-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 text-xs font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mr-2"></div>
                    Eventos y talleres mensuales
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section - Colores mejorados */}
        <section className="py-20 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
          </div>

          <div className="container-wide max-w-4xl px-6 sm:px-8 relative z-0">
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={container}
              className="text-center text-white"
            >
              <motion.div variants={item} className="mb-6">
                <div className="inline-flex items-center bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 text-cyan-100 px-6 py-2 rounded-full text-sm">
                  <Feather className="mr-2" size={16} />
                  Tlen itech moneki Yankuik
                </div>
              </motion.div>
              
              <motion.h2 className="text-3xl lg:text-4xl font-bold mb-6 text-slate-100" variants={item}>
                Estamos en <span className="text-cyan-300">fase Beta</span>
              </motion.h2>
              
              <motion.p className="text-slate-300 mb-8 max-w-2xl mx-auto text-lg" variants={item}>
                Esta plataforma es un esfuerzo colectivo para preservar nuestra lengua. Tu participación es invaluable.
              </motion.p>
              
              <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <button className="inline-flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Danos tu feedback
                  </button>
                </Link>
                
                <Link href="/login">
                  <button className="inline-flex items-center justify-center bg-transparent text-cyan-100 font-medium py-3 px-6 rounded-lg border border-cyan-400/30 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all duration-300">
                    <Play className="mr-2" size={16} />
                    Comenzar ahora
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}