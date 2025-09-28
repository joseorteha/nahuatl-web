'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookText, Users, GraduationCap } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-blue-100 dark:border-gray-700 shadow-lg sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
              Nawatlahtol
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Lecciones - Próximamente */}
            <div className="relative group">
              <div className="flex items-center px-4 py-2 text-gray-400 dark:text-gray-500 rounded-lg cursor-not-allowed">
                <GraduationCap className="h-4 w-4 mr-2" />
                <span className="font-medium">Lecciones</span>
                <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
                  Próximamente
                </span>
              </div>
            </div>

            {/* Práctica - Próximamente */}
            <div className="relative group">
              <div className="flex items-center px-4 py-2 text-gray-400 dark:text-gray-500 rounded-lg cursor-not-allowed">
                <Users className="h-4 w-4 mr-2" />
                <span className="font-medium">Práctica</span>
                <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
                  Próximamente
                </span>
              </div>
            </div>

            {/* Diccionario - Disponible */}
            <Link 
              href="/diccionario" 
              className="group flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
            >
              <BookText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Diccionario</span>
              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                Disponible
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden border-t border-blue-100 dark:border-gray-700 py-4">
          <div className="flex flex-col space-y-2">
            {/* Diccionario - Mobile */}
            <Link 
              href="/diccionario" 
              className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300"
            >
              <BookText className="h-5 w-5 mr-3" />
              <span className="font-medium">Diccionario</span>
              <span className="ml-auto text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                Disponible
              </span>
            </Link>
            
            {/* Lecciones - Mobile */}
            <div className="flex items-center px-4 py-3 text-gray-400 dark:text-gray-500 rounded-lg">
              <GraduationCap className="h-5 w-5 mr-3" />
              <span className="font-medium">Lecciones</span>
              <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
                Próximamente
              </span>
            </div>
            
            {/* Práctica - Mobile */}
            <div className="flex items-center px-4 py-3 text-gray-400 dark:text-gray-500 rounded-lg">
              <Users className="h-5 w-5 mr-3" />
              <span className="font-medium">Práctica</span>
              <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
                Próximamente
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
