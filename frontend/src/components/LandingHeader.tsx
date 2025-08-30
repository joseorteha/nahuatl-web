import Link from 'next/link';
import Image from 'next/image';
import { Info, HelpCircle } from 'lucide-react';

export default function LandingHeader() {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="container-wide flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative overflow-hidden rounded-md transition-all duration-300 group-hover:shadow-md">
            <Image 
              src="/logo.png" 
              alt="Nawatlajtol Logo" 
              width={36} 
              height={36} 
              className="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div>
            <span className="font-medium text-lg text-slate-800 group-hover:text-orange-600 transition-colors duration-200">Nawatlahtol</span>
            <span className="text-xs text-slate-500 block">Tlahtolnemiliztli</span>
          </div>
        </Link>
        <div className="flex items-center gap-5">
          <Link 
            href="/nosotros" 
            className="hidden md:inline-flex items-center px-3 py-2 text-sm text-slate-700 hover:text-orange-600 transition-colors duration-200"
          >
            <Info size={16} className="mr-1.5" />
            Acerca de
          </Link>
          <Link 
            href="/faq" 
            className="hidden md:inline-flex items-center px-3 py-2 text-sm text-slate-700 hover:text-orange-600 transition-colors duration-200"
          >
            <HelpCircle size={16} className="mr-1.5" />
            Preguntas
          </Link>
          <Link 
            href="/login" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm"
          >
            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Xi Kalaki (Acceder)
          </Link>
        </div>
      </div>
    </header>
  );
}