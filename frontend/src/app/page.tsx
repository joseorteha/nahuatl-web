'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Code, Users } from 'lucide-react';

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
    <main className="flex-grow bg-gray-50">
      {/* Hero Section */}
      <motion.section
        className="relative text-center py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <div className="absolute inset-0 bg-emerald-500/10 -z-10"></div>
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight"
          variants={item}
        >
          El Náhuatl, <span className="text-emerald-600">a tu alcance.</span>
        </motion.h1>
        <motion.p
          className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600"
          variants={item}
        >
          Únete a la beta de Timumachtikan Nawatl: una plataforma moderna para aprender, practicar y preservar una de las lenguas más ricas de nuestra historia.
        </motion.p>
        <motion.div variants={item} className="mt-10">
          <Link href="/login" className="inline-block bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg hover:bg-emerald-700 transition-colors duration-300">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              ¡Empieza a aprender ahora!
            </motion.span>
          </Link>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={container}
            className="grid md:grid-cols-3 gap-10 text-center"
          >
            <motion.div variants={item} className="p-6">
              <BookOpen className="h-12 w-12 mx-auto text-emerald-600" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Diccionario Interactivo</h3>
              <p className="mt-2 text-gray-600">Explora y busca palabras con ejemplos de uso y contexto.</p>
            </motion.div>
            <motion.div variants={item} className="p-6">
              <Code className="h-12 w-12 mx-auto text-emerald-600" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Lecciones y Práctica</h3>
              <p className="mt-2 text-gray-600">Aprende a tu ritmo con módulos y ejercicios interactivos.</p>
            </motion.div>
            <motion.div variants={item} className="p-6">
              <Users className="h-12 w-12 mx-auto text-emerald-600" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Comunidad</h3>
              <p className="mt-2 text-gray-600">Participa, comenta y aprende junto a otros usuarios.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Beta Info Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} variants={container}>
            <motion.h2 className="text-3xl font-bold text-gray-900" variants={item}>
              Estamos en <span className="text-emerald-600">fase Beta</span>
            </motion.h2>
            <motion.p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600" variants={item}>
              La plataforma está en desarrollo activo. Agradecemos tu paciencia y tus sugerencias para mejorar. ¡Tu feedback es fundamental para construir la mejor herramienta para todos!
            </motion.p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}