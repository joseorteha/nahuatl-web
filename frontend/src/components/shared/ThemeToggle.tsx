'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={18} className="text-yellow-500" />;
      case 'dark':
        return <Moon size={18} className="text-blue-400" />;
      case 'system':
        return <Monitor size={18} className="text-gray-600 dark:text-gray-400" />;
      default:
        return <Sun size={18} className="text-yellow-500" />;
    }
  };

  return (
    <motion.button
      onClick={cycleTheme}
      className="
        relative overflow-hidden p-2.5 rounded-xl
        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
        border border-gray-200 dark:border-gray-700
        shadow-lg hover:shadow-xl dark:shadow-gray-900/20
        transition-all duration-300
        group
      "
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : theme === 'dark' ? 'sistema' : 'claro'}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
        initial={false}
        transition={{ duration: 0.3 }}
      />
      
      <motion.div
        key={theme}
        initial={{ rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: 90, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10"
      >
        {getIcon()}
      </motion.div>
      
      {/* Tooltip */}
      <div className="
        absolute -top-12 left-1/2 transform -translate-x-1/2
        bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
        px-3 py-1 rounded-lg text-xs font-medium
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
        pointer-events-none whitespace-nowrap
      ">
        {theme === 'light' ? 'Modo Oscuro' : theme === 'dark' ? 'Modo Sistema' : 'Modo Claro'}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
      </div>
    </motion.button>
  );
}

// Versión compacta para móviles
export function ThemeToggleMobile() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />;
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="
        p-2 rounded-lg
        bg-gray-100 dark:bg-gray-800
        text-gray-600 dark:text-gray-400
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200
      "
      whileTap={{ scale: 0.95 }}
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'light' ? (
          <Moon size={16} />
        ) : (
          <Sun size={16} />
        )}
      </motion.div>
    </motion.button>
  );
}
