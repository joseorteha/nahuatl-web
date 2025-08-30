'use client';

import { Globe, Facebook, Instagram, Heart, Github } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-medium text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-violet-600">Nawatlahtol</h2>
              <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-orange-100 to-violet-100 text-orange-800 rounded-full">Beta</span>
            </div>
            <p className="text-sm text-slate-500 text-center md:text-left">
              Una plataforma para aprender y preservar el idioma Náhuatl
            </p>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 md:mb-0">
            <Link href="/diccionario" className="text-sm text-slate-600 hover:text-orange-600 transition-colors duration-200">
              Diccionario
            </Link>
            <Link href="/nosotros" className="text-sm text-slate-600 hover:text-orange-600 transition-colors duration-200">
              Nosotros
            </Link>
            <Link href="/feedback" className="text-sm text-slate-600 hover:text-orange-600 transition-colors duration-200">
              Comunidad
            </Link>
            <Link href="/faq" className="text-sm text-slate-600 hover:text-orange-600 transition-colors duration-200">
              FAQ
            </Link>
          </nav>
        </div>
        
        <div className="border-t border-slate-200 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} Creado por José Ortega
          </p>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://cybercodigo-seven.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-500 hover:text-orange-500 transition-colors duration-200"
              title="Página personal"
            >
              <Globe size={16} />
            </a>
            <a 
              href="https://www.facebook.com/joseortega.exe1" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-500 hover:text-blue-500 transition-colors duration-200"
              title="Facebook"
            >
              <Facebook size={16} />
            </a>
            <a 
              href="https://www.instagram.com/mr.orteg4/?utm_source=qr&r=nametag" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-500 hover:text-pink-500 transition-colors duration-200"
              title="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a 
              href="https://github.com/JoseEduardoOax/nahuatl-app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-900 transition-colors duration-200"
              title="GitHub Repository"
            >
              <Github size={16} />
            </a>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              Hecho con <Heart size={12} className="text-red-500 fill-red-500" /> en México
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;