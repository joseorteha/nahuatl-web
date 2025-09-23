'use client';

import { Globe, Facebook, Instagram, Heart, Github, Mail, BookOpen, Users, HelpCircle, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800 border-t border-slate-200 dark:border-gray-700 py-12 transition-colors duration-500">
      <div className="container-wide px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
          <div className="flex flex-col items-center md:items-start col-span-1 md:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative overflow-hidden rounded-lg h-10 w-10">
                <Image 
                  src="/logo.png" 
                  alt="Nawatlahtol Logo" 
                  width={40} 
                  height={40} 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20"></div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-400">Nawatlahtol</h2>
                  <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 text-cyan-800 dark:text-cyan-200 rounded-full font-medium">Beta</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Tlahtolnemiliztli</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 text-center md:text-left mb-4">
              Una plataforma moderna para aprender y preservar el idioma Náhuatl con herramientas interactivas.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a 
                href="mailto:contacto@nawatlajtol.mx" 
                className="text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-1.5 text-sm"
              >
                <Mail size={14} />
                Contáctanos
              </a>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">Explorar</h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/login" className="text-sm text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2">
                <BookOpen size={16} />
                Diccionario
              </Link>
              <span className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-2 cursor-not-allowed">
                <svg className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Lecciones (Próximamente)
              </span>
              <Link href="/nosotros" className="text-sm text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2">
                <Info size={16} />
                Nosotros
              </Link>
              <Link href="/faq" className="text-sm text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2">
                <HelpCircle size={16} />
                FAQ
              </Link>
            </nav>
          </div>
          
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">Comunidad</h3>
            <nav className="flex flex-col space-y-3">
              <span className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-2 cursor-not-allowed">
                <Users size={16} />
                Comunidad (Próximamente)
              </span>
              <Link href="/login" className="text-sm text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Feedback
              </Link>
              <a href="https://github.com/joseorteha/nahuatl-web" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2">
                <Github size={16} />
                Contribuir
              </a>
              <a href="https://cybercodigo-seven.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2">
                <Globe size={16} />
                Sitio del creador
              </a>
            </nav>
          </div>
          
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">Legal</h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/privacy" className="text-sm text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Política de Privacidad
              </Link>
              <Link href="/terms" className="text-sm text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Términos de Servicio
              </Link>
              <Link href="/cookies" className="text-sm text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Política de Cookies
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            © {currentYear} Nawatlahtol | Creado con <Heart size={12} className="inline text-red-500 fill-red-500 mx-1" /> por José Ortega
          </p>
          
          <div className="flex items-center gap-5">
            <a 
              href="https://cybercodigo-seven.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors duration-200 p-2 rounded-full hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
              title="Página personal"
            >
              <Globe size={18} />
            </a>
            <a 
              href="https://www.facebook.com/joseortega.exe1" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a 
              href="https://www.instagram.com/mr.orteg4/?utm_source=qr&r=nametag" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-500 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-200 p-2 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20"
              title="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a 
              href="https://github.com/joseorteha/nahuatl-web" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title="GitHub Repository"
            >
              <Github size={18} />
            </a>
            <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-2 border-l border-slate-200 dark:border-slate-700 pl-4">
              Hecho en México
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;