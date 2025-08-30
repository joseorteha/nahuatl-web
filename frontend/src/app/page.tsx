'use client';
import { motion } from 'framer-motion';
import { BookOpen, Code, Users, Feather, Mic, Languages } from 'lucide-react';
import LandingHeader from '../components/LandingHeader';

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

  return (
    <>
      <LandingHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-24 px-4 sm:py-32 bg-gradient-to-b from-slate-50 to-white"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.div variants={item} className="mb-6">
            <div className="inline-block bg-gradient-to-r from-orange-100 to-violet-100 text-orange-800 px-3 py-1 rounded-full text-sm mb-4">
              <Feather className="inline mr-2" size={16} />
              Tlahtolli - El lenguaje sagrado
            </div>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight"
            variants={item}
          >
            Aprende <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-violet-600">Náhuatl</span> de forma moderna
          </motion.h1>
          <motion.p
            className="mt-6 max-w-2xl mx-auto text-xl text-slate-600"
            variants={item}
          >
            Revive la lengua de los <span className="font-medium text-orange-600">Mexihcah</span> con tecnología interactiva.
          </motion.p>
          <motion.div variants={item} className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <motion.a
              href="/login"
              className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium py-3 px-6 rounded-md text-base shadow-md hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(249, 115, 22, 0.1), 0 4px 6px -4px rgba(249, 115, 22, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Mic className="mr-2" size={18} />
              ¡Pewaltía! (Empieza)
            </motion.a>
            <motion.a
              href="#features"
              className="inline-flex items-center justify-center bg-white text-orange-600 font-medium py-3 px-6 rounded-md text-base border border-orange-200 hover:bg-orange-50 transition-all duration-200 shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Languages className="mr-2" size={18} />
              Conoce más
            </motion.a>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-slate-50">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-violet-600">Tlen tikitakis</span> (Lo que ofrecemos)
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-slate-600">
                Herramientas diseñadas para preservar y difundir nuestra lengua ancestral
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } }
                }}
                className="p-6 rounded-lg bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-medium text-slate-900">Tlahtoltecpantiliztli (Diccionario)</h3>
                <p className="mt-3 text-slate-600">
                  Explora más de 5,000 palabras con pronunciación, ejemplos y etimología.
                </p>
                <div className="mt-4 text-sm text-orange-600 font-medium">
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
                className="p-6 rounded-lg bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-medium text-slate-900">Nemachtiliztli (Lecciones)</h3>
                <p className="mt-3 text-slate-600">
                  Aprende con módulos basados en la cosmovisión náhuatl y ejercicios interactivos.
                </p>
                <div className="mt-4 text-sm text-violet-600 font-medium">
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
                className="p-6 rounded-lg bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-medium text-slate-900">Tlakatiliztli (Comunidad)</h3>
                <p className="mt-3 text-slate-600">
                  Conecta con hablantes, maestros y otros aprendices en nuestro espacio cultural.
                </p>
                <div className="mt-4 text-sm text-teal-600 font-medium">
                  Eventos mensuales y talleres
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Sección de Beta */}
        <section className="py-16 bg-white">
          <div className="container-wide max-w-4xl">
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={container}
              className="glass p-8 rounded-lg border border-slate-200 shadow-md bg-white/80 backdrop-blur-sm"
            >
              <motion.div variants={item} className="mb-4">
                <div className="inline-flex items-center bg-gradient-to-r from-orange-100 to-violet-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  <Feather className="mr-2" size={16} />
                  Tlen itech moneki Yankuik
                </div>
              </motion.div>
              <motion.h2 className="text-2xl font-bold text-slate-900 mb-3" variants={item}>
                Estamos en <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-violet-600">fase Beta</span>
              </motion.h2>
              <motion.p className="mt-3 text-slate-600 mb-6" variants={item}>
                Esta plataforma es un <span className="font-medium text-orange-600">equipo</span> para preservar nuestra <span className="font-medium">lengua</span>. Tu participación es invaluable.
              </motion.p>
              <motion.div variants={item}>
                <a href="/feedback" className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md transition-all duration-200 hover:shadow-lg">
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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