'use client';
import { motion } from 'framer-motion';
import { BookOpen, Code, Users, Feather, Mic, Languages, ChevronDown, Star } from 'lucide-react';
import LandingHeader from '../components/LandingHeader';
import Footer from '../components/Footer';
import Image from 'next/image';

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
      <LandingHeader />
      <main className="flex-grow overflow-hidden">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-28 px-4 sm:py-36 bg-gradient-to-b from-slate-50 to-white overflow-hidden"
          initial="hidden"
          animate="show"
          variants={container}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-200 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -right-24 w-72 h-72 bg-violet-200 rounded-full blur-3xl"></div>
          </div>
          <motion.div variants={item} className="mb-6 relative z-10">
            <div className="inline-block bg-gradient-to-r from-orange-100 to-violet-100 text-orange-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4 shadow-sm">
              <Feather className="inline mr-2" size={16} />
              Tlahtolli - El lenguaje sagrado
            </div>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight max-w-4xl mx-auto relative z-10"
            variants={item}
          >
            Aprende <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-violet-600 relative">
              Náhuatl
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-orange-500/30" viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0,0 Q50,12 100,0" fill="currentColor" />
              </svg>
            </span> de forma moderna
          </motion.h1>
          <motion.p
            className="mt-8 max-w-2xl mx-auto text-xl text-slate-600 leading-relaxed relative z-10"
            variants={item}
          >
            Revive la lengua de los <span className="font-semibold text-orange-600">Mexihcah</span> con tecnología interactiva y métodos de aprendizaje modernos.
          </motion.p>
          <motion.div variants={item} className="mt-12 flex flex-col sm:flex-row justify-center gap-5 relative z-10">
            <motion.a
              href="/login"
              className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium py-3.5 px-8 rounded-lg text-base shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 border border-orange-400/20"
              whileHover={{ scale: 1.03, boxShadow: "0 15px 25px -3px rgba(249, 115, 22, 0.15), 0 8px 10px -6px rgba(249, 115, 22, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Mic className="mr-2.5" size={20} />
              ¡Pewaltía! (Empieza)
            </motion.a>
            <motion.button
              onClick={scrollToFeatures}
              className="inline-flex items-center justify-center bg-white text-orange-600 font-medium py-3.5 px-8 rounded-lg text-base border border-orange-200 hover:bg-orange-50 transition-all duration-200 shadow-md"
              whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(249, 115, 22, 0.1), 0 4px 6px -4px rgba(249, 115, 22, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Languages className="mr-2.5" size={20} />
              Conoce más
            </motion.button>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer hidden md:block"
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
              <span className="text-sm text-slate-500 mb-2">Descubre más</span>
              <ChevronDown className="text-orange-500" size={24} />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="container-wide px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center bg-orange-100/50 text-orange-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Star className="mr-1.5" size={16} fill="currentColor" />
                Características principales
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-violet-600">Tlen tikitakis</span> (Lo que ofrecemos)
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
                Herramientas diseñadas para preservar y difundir nuestra lengua ancestral con métodos innovadores
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } }
                }}
                className="p-8 rounded-xl bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden"
                whileHover={{ y: -5 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100/40 to-transparent rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-6 shadow-md relative z-10">
                  <BookOpen className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 relative z-10">Tlahtoltecpantiliztli (Diccionario)</h3>
                <p className="mt-3 text-slate-600 leading-relaxed relative z-10">
                  Explora más de 5,000 palabras con pronunciación, ejemplos y etimología detallada.
                </p>
                <div className="mt-5 text-sm text-orange-600 font-medium flex items-center gap-1.5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Incluye variantes dialectales
                </div>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.2 } }
                }}
                className="p-8 rounded-xl bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden"
                whileHover={{ y: -5 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-100/40 to-transparent rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center mb-6 shadow-md relative z-10">
                  <Code className="h-8 w-8 text-violet-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 relative z-10">Nemachtiliztli (Lecciones)</h3>
                <p className="mt-3 text-slate-600 leading-relaxed relative z-10">
                  Aprende con módulos basados en la cosmovisión náhuatl y ejercicios interactivos diseñados por expertos.
                </p>
                <div className="mt-5 text-sm text-violet-600 font-medium flex items-center gap-1.5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                  Desde básico hasta avanzado
                </div>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.3 } }
                }}
                className="p-8 rounded-xl bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden"
                whileHover={{ y: -5 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-100/40 to-transparent rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-6 shadow-md relative z-10">
                  <Users className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 relative z-10">Tlakatiliztli (Comunidad)</h3>
                <p className="mt-3 text-slate-600 leading-relaxed relative z-10">
                  Conecta con hablantes nativos, maestros y otros aprendices en nuestro espacio cultural colaborativo.
                </p>
                <div className="mt-5 text-sm text-teal-600 font-medium flex items-center gap-1.5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                  Eventos mensuales y talleres
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Sección de Beta */}
        <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
          <div className="container-wide max-w-4xl px-4 sm:px-6 relative z-10">
            {/* Decorative elements */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-50 z-0"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-100 rounded-full blur-3xl opacity-50 z-0"></div>
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={container}
              className="glass p-10 rounded-2xl border border-slate-200 shadow-xl bg-white/90 backdrop-blur-md relative z-10"
            >
              <motion.div variants={item} className="mb-5">
                <div className="inline-flex items-center bg-gradient-to-r from-orange-100 to-violet-100 text-orange-800 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
                  <Feather className="mr-2" size={16} />
                  Tlen itech moneki Yankuik
                </div>
              </motion.div>
              <motion.h2 className="text-3xl font-bold text-slate-900 mb-4" variants={item}>
                Estamos en <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-violet-600">fase Beta</span>
              </motion.h2>
              <motion.p className="mt-4 text-slate-600 mb-8 text-lg leading-relaxed" variants={item}>
                Esta plataforma es un <span className="font-medium text-orange-600">equipo</span> para preservar nuestra <span className="font-medium">lengua</span>. Tu participación es invaluable.
              </motion.p>
              <motion.div variants={item}>
                <a href="/feedback" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg transition-all duration-200 hover:shadow-xl">
                  <svg className="mr-2.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Danos tu feedback
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}