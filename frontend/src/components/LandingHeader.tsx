import Link from 'next/link';
import Image from 'next/image';
import { Info, HelpCircle, Menu, X, LogIn } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle, ThemeToggleMobile } from './ThemeToggle';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <>
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-700/60 shadow-lg transition-colors duration-300">
        <div className="container-wide flex items-center justify-between h-16 px-3 sm:px-4 lg:px-6">
          {/* Logo y nombre - Responsive */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative transition-all duration-300 group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="Nawatlahtol Logo" 
                width={28} 
                height={28} 
                className="sm:w-8 sm:h-8 transition-transform duration-500 group-hover:scale-110 rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent group-hover:from-cyan-500 group-hover:to-blue-500 transition-all duration-300">Nawatlahtol</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 tracking-wide hidden sm:block">Tlahtolnemiliztli</span>
            </div>
          </Link>

          {/* Navegación desktop - Responsive */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link 
              href="/nosotros" 
              className="inline-flex items-center px-3 xl:px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 relative group rounded-xl hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 border border-transparent hover:border-cyan-200/50 dark:hover:border-cyan-700/50"
            >
              <Info size={16} className="mr-1 xl:mr-2" />
              <span className="hidden xl:inline">Acerca de</span>
              <span className="xl:hidden">Nosotros</span>
            </Link>
            <Link 
              href="/faq" 
              className="inline-flex items-center px-3 xl:px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 relative group rounded-xl hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 border border-transparent hover:border-cyan-200/50 dark:hover:border-cyan-700/50"
            >
              <HelpCircle size={16} className="mr-1 xl:mr-2" />
              <span className="hidden xl:inline">Preguntas</span>
              <span className="xl:hidden">FAQ</span>
            </Link>

            {/* Theme Toggle */}
            <div className="ml-1 xl:ml-2">
              <ThemeToggle />
            </div>

            <Link 
              href="/login" 
              className="inline-flex items-center px-3 xl:px-6 py-2.5 xl:py-3 ml-2 xl:ml-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="mr-1 xl:mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="hidden xl:inline">Xi Kalaki</span>
              <span className="xl:hidden">Entrar</span>
            </Link>
          </div>

          {/* Menú hamburguesa para móvil - Responsive */}
          <div className="lg:hidden flex items-center gap-2 sm:gap-3">
            <ThemeToggleMobile />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 transition-all duration-200"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil full-screen - COMPLETAMENTE NUEVO */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[9999] bg-slate-900 dark:bg-slate-950"
          style={{ zIndex: 9999 }}
        >
          {/* Header del menú - Responsive */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="Nawatlahtol Logo" 
                  width={16} 
                  height={16} 
                  className="sm:w-5 sm:h-5 rounded-md"
                />
              </div>
              <span className="font-bold text-white text-base sm:text-lg">Nawatlahtol</span>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
              aria-label="Cerrar menú"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Navegación principal - Responsive */}
          <nav className="flex flex-col items-center justify-center h-full px-4 sm:px-6 space-y-6 sm:space-y-8 -mt-16 sm:-mt-20">
            <Link 
              href="/nosotros" 
              className="text-white text-xl sm:text-2xl font-bold hover:text-cyan-400 transition-colors duration-200 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Acerca de
            </Link>
            
            <Link 
              href="/faq" 
              className="text-white text-xl sm:text-2xl font-bold hover:text-cyan-400 transition-colors duration-200 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Preguntas
            </Link>
            
            <Link 
              href="/login" 
              className="text-white text-xl sm:text-2xl font-bold hover:text-cyan-400 text-center bg-gradient-to-r from-cyan-500 to-blue-500 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Xi Kalaki
            </Link>
          </nav>

          {/* Footer - Responsive */}
          <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center">
            <div className="text-slate-400 text-xs sm:text-sm">
              Nawatlahtol © 2024
            </div>
          </div>
        </div>
      )}
    </>
  );
}