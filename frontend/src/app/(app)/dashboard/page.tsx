'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, BookText, GraduationCap, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // or redirect, which is already handled in useEffect
  }

  // Animation Variants sin tipado explícito
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
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const cardHover = {
    scale: 1.03,
    transition: { duration: 0.2 }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-12 flex flex-col items-center">
            <Image src="/logo.png" alt="Logo Code Master tik" width={70} height={70} className="mb-4 rounded-lg shadow-md" />
            <h1 className="text-4xl font-bold text-gray-900">Panel de Control</h1>
            <p className="mt-2 text-lg text-gray-600">Explora las secciones disponibles y prepárate para aprender náhuatl.</p>
          </motion.div>

          {/* Beta Notice */}
          <motion.div 
            variants={itemVariants} 
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg mb-12 flex items-center"
          >
            <AlertTriangle className="h-6 w-6 mr-3"/>
            <div>
              <h3 className="font-bold">Estás en la Versión Beta</h3>
              <p className="text-sm">Algunas secciones están en construcción. Agradecemos tu paciencia y <Link href="/feedback" className="underline hover:text-yellow-900">tus sugerencias</Link>.</p>
            </div>
          </motion.div>

          {/* Dashboard Cards */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Card 1: Diccionario */}
            <motion.div variants={itemVariants} whileHover={cardHover}>
              <Link href="/diccionario" className="block p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 h-full">
                <div className="flex items-center text-emerald-600 mb-4">
                  <BookText size={32} className="mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Diccionario</h2>
                </div>
                <p className="text-gray-600">
                  Consulta, busca y descubre el significado de cientos de palabras. ¡Tu aventura empieza aquí!
                </p>
              </Link>
            </motion.div>

            {/* Card 2: Lecciones */}
            <motion.div variants={itemVariants} className="relative">
              <div className="p-8 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 h-full">
                <div className="flex items-center text-gray-400 mb-4">
                  <GraduationCap size={32} className="mr-3" />
                  <h2 className="text-2xl font-bold text-gray-500">Lecciones</h2>
                </div>
                <p className="text-gray-500">
                  Aprende de forma ordenada con nuestros módulos guiados. Desde saludos hasta gramática avanzada.
                </p>
                <div className="absolute top-4 right-4 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                  PRÓXIMAMENTE
                </div>
              </div>
            </motion.div>

            {/* Card 3: Práctica */}
            <motion.div variants={itemVariants} className="relative">
              <div className="p-8 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 h-full">
                <div className="flex items-center text-gray-400 mb-4">
                  <Lightbulb size={32} className="mr-3" />
                  <h2 className="text-2xl font-bold text-gray-500">Práctica</h2>
                </div>
                <p className="text-gray-500">
                  Pon a prueba tu conocimiento con ejercicios y quizzes interactivos para reforzar lo aprendido.
                </p>
                <div className="absolute top-4 right-4 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                  PRÓXIMAMENTE
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}