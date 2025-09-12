import Link from 'next/link';
import Image from 'next/image';
import { Info, HelpCircle, BookOpen, Menu } from 'lucide-react';
import { useState } from 'react';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-blue-50/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100 shadow-sm">
      <div className="container-wide flex items-center justify-between h-20">
        {/* Logo y nombre */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative overflow-hidden rounded-full p-1 bg-white shadow-md transition-all duration-300 group-hover:shadow-lg">
            <Image 
              src="/logo.png" 
              alt="Nawatlajtol Logo" 
              width={42} 
              height={42} 
              className="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-300/20 to-orange-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-blue-700 group-hover:text-orange-500 transition-colors duration-200">Nawatlahtol</span>
            <span className="text-xs text-blue-400 block tracking-wide">Tlahtolnemiliztli</span>
          </div>
        </Link>

        {/* Navegación desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/diccionario" 
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-orange-500 transition-colors duration-200 relative group"
          >
            <BookOpen size={18} className="mr-2" />
            Diccionario
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </Link>
          <Link 
            href="/nosotros" 
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-orange-500 transition-colors duration-200 relative group"
          >
            <Info size={18} className="mr-2" />
            Acerca de
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </Link>
          <Link 
            href="/faq" 
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-orange-500 transition-colors duration-200 relative group"
          >
            <HelpCircle size={18} className="mr-2" />
            Preguntas
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </Link>
          <Link 
            href="/login" 
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-orange-400 hover:to-orange-500 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-md hover:shadow-lg"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Xi Kalaki (Acceder)
          </Link>
        </div>
        
        {/* Botón de menú móvil */}
        <button 
          className="md:hidden inline-flex items-center justify-center p-2 rounded-full text-blue-600 hover:text-orange-500 hover:bg-blue-100 transition-colors duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
        
        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-blue-100 md:hidden z-50">
            <div className="px-4 py-3 space-y-1">
              <Link 
                href="/diccionario" 
                className="flex items-center px-3 py-3 text-base font-medium text-blue-600 hover:text-orange-500 hover:bg-blue-50 rounded-md transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen size={18} className="mr-3" />
                Diccionario
              </Link>
              <Link 
                href="/nosotros" 
                className="flex items-center px-3 py-3 text-base font-medium text-blue-600 hover:text-orange-500 hover:bg-blue-50 rounded-md transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info size={18} className="mr-3" />
                Acerca de
              </Link>
              <Link 
                href="/faq" 
                className="flex items-center px-3 py-3 text-base font-medium text-blue-600 hover:text-orange-500 hover:bg-blue-50 rounded-md transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HelpCircle size={18} className="mr-3" />
                Preguntas
              </Link>
              <Link 
                href="/login" 
                className="flex items-center px-3 py-3 mt-2 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-orange-400 hover:to-orange-500 rounded-md transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Xi Kalaki (Acceder)
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}