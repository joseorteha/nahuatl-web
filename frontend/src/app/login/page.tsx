'use client';

import AuthForm from '@/app/login/auth-form';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, BookOpen, Users, Star, Heart, Sparkles, Shield } from 'lucide-react';

export default function LoginPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      {/* Elementos de fondo decorativos */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/20 dark:bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/15 dark:bg-pink-400/8 rounded-full blur-2xl"></div>
      </div>

      {/* Patrón de grid */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="bg-blue-500/20 dark:bg-blue-400/10 rounded-sm"></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Panel izquierdo - Información y branding */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative"
        >
          {/* Header con logo */}
          <motion.div variants={itemVariants} className="mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group mb-6">
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Volver al inicio</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image 
                  src="/logo.png" 
                  alt="Nawatlajtol Logo" 
                  width={60} 
                  height={60} 
                  className="rounded-2xl shadow-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Nawatlajtol
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tlahtolnemiliztli</p>
              </div>
            </div>
          </motion.div>

          {/* Mensaje principal */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Únete a nuestra <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">comunidad</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Descubre el mundo del náhuatl con herramientas modernas y una comunidad apasionada por preservar nuestra lengua ancestral.
            </p>
          </motion.div>

          {/* Características destacadas */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Diccionario Interactivo</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">500+ palabras con pronunciaciones y ejemplos</p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-purple-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Comunidad Activa</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Conecta con otros estudiantes y expertos</p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-green-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">100% Gratuito</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Acceso completo sin costo alguno</p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-pink-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">En Evolución</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Nuevas funciones cada semana</p>
            </div>
          </motion.div>

          {/* Estadísticas */}
          <motion.div variants={itemVariants} className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>500+ palabras</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>Proyecto colaborativo</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span>Preservando cultura</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Panel derecho - Formulario de autenticación */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center"
        >
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20">
              <AuthForm />
            </div>

            {/* Enlaces públicos */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                ¿Solo quieres explorar? Accede a contenido público:
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/faq" 
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200"
                >
                  <Globe className="h-4 w-4" />
                  FAQ
                </Link>
                <Link 
                  href="/nosotros" 
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 rounded-lg transition-all duration-200"
                >
                  <Users className="h-4 w-4" />
                  Nosotros
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
