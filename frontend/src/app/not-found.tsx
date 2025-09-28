'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <ConditionalHeader />
      
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-8xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Página no encontrada
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            La página que buscas no existe o ha sido movida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Home className="mr-2" size={20} />
              Ir al inicio
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="mr-2" size={20} />
              Volver atrás
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
