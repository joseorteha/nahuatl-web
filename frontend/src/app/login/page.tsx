'use client';

import AuthFormBackend from '@/app/login/auth-form-backend';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, BookOpen, Users, Star, Heart, Sparkles, Shield, CheckCircle, Zap, Languages } from 'lucide-react';
import { Suspense } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Elementos de fondo sutiles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        {/* Líneas de grid sutiles */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
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
            <Link href="/" className="inline-flex items-center gap-3 group mb-6 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Volver al inicio</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image 
                  src="/logooo.png" 
                  alt="Nawatlahtol Logo" 
                  width={60} 
                  height={60} 
                  className="rounded-2xl shadow-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Nawatlahtol
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tlahtolnemiliztli</p>
              </div>
            </div>
          </motion.div>

          {/* Mensaje principal */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Únete a nuestra <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">comunidad</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Descubre el mundo del náhuatl con herramientas modernas y una comunidad apasionada por preservar nuestra lengua ancestral.
            </p>
          </motion.div>

          {/* Características destacadas */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 hover:border-cyan-300/60 dark:hover:border-cyan-600/60 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Diccionario Interactivo</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">3,500+ palabras con pronunciaciones y ejemplos</p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300/60 dark:hover:border-blue-600/60 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Comunidad Activa</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Conecta con otros estudiantes y expertos</p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 hover:border-green-300/60 dark:hover:border-green-600/60 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">100% Gratuito</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Acceso completo sin costo alguno</p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 hover:border-cyan-300/60 dark:hover:border-cyan-600/60 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">En Evolución</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Nuevas funciones cada semana</p>
            </div>
          </motion.div>

          {/* Estadísticas */}
          <motion.div variants={itemVariants} className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>3,500+ palabras</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>Proyecto colaborativo</span>
            </div>
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-cyan-500" />
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
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-slate-200/40 dark:border-slate-700/40">
              <Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                </div>
              }>
                <AuthFormBackend />
              </Suspense>
            </div>

            {/* Enlaces públicos */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                ¿Solo quieres explorar? Accede a contenido público:
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/faq" 
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-all duration-200"
                >
                  <Globe className="h-4 w-4" />
                  FAQ
                </Link>
                <Link 
                  href="/nosotros" 
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
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
