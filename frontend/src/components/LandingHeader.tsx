import Link from 'next/link';
import Image from 'next/image';
import { Feather } from 'lucide-react';

export default function LandingHeader() {
  return (
    <header className="bg-gradient-to-r from-amber-50 via-emerald-50 to-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-amber-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Image 
              src="/logo.png" 
              alt="Nawatlajtol Logo" 
              width={48} 
              height={48} 
              className="rounded-lg border-2 border-amber-300 group-hover:border-amber-400 transition-colors"
            />
            <div className="absolute -bottom-2 -right-2 bg-amber-200 text-amber-800 p-1 rounded-full border border-amber-300">
              <Feather size={14} />
            </div>
          </div>
          <div>
            <span className="font-bold text-xl text-amber-700 block leading-tight">Nawatlajtol</span>
            <span className="text-xs text-emerald-600 font-medium">Tlahtolnemiliztli (Vida de la palabra)</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/nosotros" 
            className="hidden md:inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-700 hover:text-amber-600 transition-colors"
          >
            <svg className="mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tlenon (Acerca de)
          </Link>
          <Link 
            href="/faq" 
            className="hidden md:inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-700 hover:text-amber-600 transition-colors"
          >
            <svg className="mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Preguntas
          </Link>
          <Link 
            href="/login" 
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-emerald-500 rounded-lg shadow-md hover:from-amber-600 hover:to-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 group"
          >
            <svg className="mr-2 h-5 w-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Xi Kalaki (Acceder)
          </Link>
        </div>
      </div>
    </header>
  );
}