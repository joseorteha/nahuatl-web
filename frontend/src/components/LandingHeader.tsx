import Link from 'next/link';
import Image from 'next/image';
import { Info, HelpCircle, BookOpen, Menu } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle, ThemeToggleMobile } from './ThemeToggle';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="container-wide flex items-center justify-between h-20">
        {/* Logo y nombre */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative transition-all duration-300 group-hover:scale-105">
            <Image 
              src="/logo.png" 
              alt="Nawatlajtol Logo" 
              width={40} 
              height={40} 
              className="transition-transform duration-500 group-hover:scale-110 rounded-lg"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">Nawatlajtol</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 block tracking-wide">Tlahtolnemiliztli</span>
          </div>
        </Link>

        {/* Navegación desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Link 
            href="/nosotros" 
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 relative group rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Info size={16} className="mr-2" />
            Acerca de
          </Link>
          <Link 
            href="/faq" 
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 relative group rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <HelpCircle size={16} className="mr-2" />
            Preguntas
          </Link>

          {/* Theme Toggle */}
          <div className="ml-2">
            <ThemeToggle />
          </div>

          <Link 
            href="/login" 
            className="inline-flex items-center px-6 py-3 ml-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Xi Kalaki
          </Link>
        </div>
        {/* Menú hamburguesa para móvil */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggleMobile />
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
          <nav className="container-wide py-4 space-y-2">
            <Link 
              href="/diccionario" 
              className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen size={18} className="mr-3" />
              Diccionario
            </Link>
            <Link 
              href="/nosotros" 
              className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Info size={18} className="mr-3" />
              Acerca de
            </Link>
            <Link 
              href="/faq" 
              className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle size={18} className="mr-3" />
              Preguntas
            </Link>
            <Link 
              href="/login" 
              className="flex items-center px-4 py-3 mt-4 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Xi Kalaki
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}