'use client';
import { motion } from 'framer-motion';
import { BookOpen, Code, Users, Feather, Mic, Languages } from 'lucide-react';
import LandingHeader from '../components/LandingHeader';
import AnimatedBackground from '../components/AnimatedBackground';

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <LandingHeader />
      <main className="flex-grow bg-gray-50 relative overflow-hidden">
        <AnimatedBackground />
        {/* Hero Section con elementos náhuatl */}
        <motion.section
          className="relative text-center py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-emerald-50 to-white -z-10 opacity-90"></div>
          <motion.div variants={item} className="mb-8">
            <div className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-amber-200">
              <Feather className="inline mr-2" size={16} />
              Tlahtolli - El lenguaje sagrado
            </div>
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight"
            variants={item}
          >
            Aprende <span className="text-amber-600 relative">
              Náhuatl
              <svg className="absolute -bottom-4 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q25,10 50,5 T100,5" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,3" />
              </svg>
            </span> de forma moderna
          </motion.h1>
          <motion.p
            className="mt-8 max-w-2xl mx-auto text-2xl md:text-3xl text-gray-700 font-medium"
            variants={item}
          >
            Revive la lengua de los <span className="font-semibold text-amber-700">Mexihcah</span> con tecnología interactiva.
          </motion.p>
          <motion.div variants={item} className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <motion.a
              href="/login"
              className="inline-flex items-center bg-amber-600 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-lg hover:bg-amber-700 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Mic className="mr-2" />
              ¡Pewaltía! (Empieza)
            </motion.a>
            <motion.a
              href="#features"
              className="inline-flex items-center bg-white text-amber-700 font-bold py-4 px-8 rounded-xl text-xl border-2 border-amber-200 shadow-sm hover:bg-amber-50 transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Languages className="mr-2" />
              Conoce más
            </motion.a>
          </motion.div>
        </motion.section>

        {/* Features Section con iconografía náhuatl */}
        <section id="features" className="py-20 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                <span className="text-amber-600">Tlen tikitakis</span> (Lo que ofrecemos)
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-gray-600">
                Herramientas diseñadas para preservar y difundir nuestra lengua ancestral
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }
                }}
                className="p-8 rounded-2xl bg-gradient-to-b from-amber-50 to-white border border-amber-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 text-amber-100 text-8xl font-bold opacity-20">1</div>
                <BookOpen className="h-14 w-14 mx-auto text-amber-600 mb-6 p-2 bg-amber-100 rounded-full" />
                <h3 className="mt-4 text-2xl font-semibold text-gray-900">Tlahtoltecpantiliztli (Diccionario)</h3>
                <p className="mt-4 text-gray-700">
                  Explora más de 5,000 palabras con pronunciación, ejemplos y etimología.
                </p>
                <div className="mt-6 text-sm text-amber-600 font-medium">
                  Incluye variantes dialectales
                </div>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 } }
                }}
                className="p-8 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 text-emerald-100 text-8xl font-bold opacity-20">2</div>
                <Code className="h-14 w-14 mx-auto text-emerald-600 mb-6 p-2 bg-emerald-100 rounded-full" />
                <h3 className="mt-4 text-2xl font-semibold text-gray-900">Nemachtiliztli (Lecciones)</h3>
                <p className="mt-4 text-gray-700">
                  Aprende con módulos basados en la cosmovisión náhuatl y ejercicios interactivos.
                </p>
                <div className="mt-6 text-sm text-emerald-600 font-medium">
                  Desde básico hasta avanzado
                </div>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.6 } }
                }}
                className="p-8 rounded-2xl bg-gradient-to-b from-blue-50 to-white border border-blue-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 text-blue-100 text-8xl font-bold opacity-20">3</div>
                <Users className="h-14 w-14 mx-auto text-blue-600 mb-6 p-2 bg-blue-100 rounded-full" />
                <h3 className="mt-4 text-2xl font-semibold text-gray-900">Tlakatiliztli (Comunidad)</h3>
                <p className="mt-4 text-gray-700">
                  Conecta con hablantes, maestros y otros aprendices en nuestro espacio cultural.
                </p>
                <div className="mt-6 text-sm text-blue-600 font-medium">
                  Eventos mensuales y talleres
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Sección de Beta con elementos culturales */}
        <section className="py-20 bg-gradient-to-r from-amber-50 to-emerald-50 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('/assets/nahuatl-pattern.svg')] bg-repeat"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={container}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-amber-200 shadow-lg"
            >
              <motion.div variants={item} className="mb-6">
                <div className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium border border-amber-200">
                  <Feather className="mr-2" size={16} />
                  Tlen itech moneki Yankuik (Necesitamos tu ayuda)
                </div>
              </motion.div>
              <motion.h2 className="text-3xl font-bold text-gray-900 mb-4" variants={item}>
                Estamos en <span className="text-amber-600">fase Beta</span>
              </motion.h2>
              <motion.p className="mt-4 text-lg text-gray-600 mb-6" variants={item}>
                Esta plataforma es un <span className="font-semibold text-amber-700">equipo</span> para preservar nuestra <span className="font-semibold">lengua</span>. Tu participación es invaluable.
              </motion.p>
              <motion.div variants={item}>
                <a href="#" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 transition-colors">
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