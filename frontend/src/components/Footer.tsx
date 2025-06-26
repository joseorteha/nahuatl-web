'use client';

import { Github, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm text-gray-500 text-center sm:text-left">
          &copy; {new Date().getFullYear()} Timumachtikan Nawatl. Todos los derechos reservados.
        </p>
        <div className="flex space-x-5 mt-4 sm:mt-0">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-5 w-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">GitHub</span>
            <Github className="h-5 w-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">YouTube</span>
            <Youtube className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;