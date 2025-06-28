'use client';

import { Github, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  // Detectar si el usuario está logueado
  let user = null;
  if (typeof window !== 'undefined') {
    try {
      user = localStorage.getItem('user');
    } catch {}
  }
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm text-gray-500 text-center sm:text-left">
          &copy; {new Date().getFullYear()} Creado por José Ortega
        </p>
        <div className="flex space-x-5 mt-4 sm:mt-0">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-5 w-5" />
          </a>
          <a href="https://www.facebook.com/joseortega.exe1" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900" title="Facebook">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="https://www.instagram.com/mr.orteg4/?utm_source=qr&r=nametag" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-700" title="Instagram">
            <Instagram className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;