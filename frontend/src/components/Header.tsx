'use client';
import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from 'boring-avatars';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { User as UserIcon, LogOut, LayoutDashboard, Menu as MenuIcon, X, BookOpen, Users, MessageCircle, Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

type AvatarVariant = 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';

interface User {
  id: string;
  email: string;
  nombre_completo?: string;
  rol?: string;
  url_avatar?: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      try {
        const userData = localStorage.getItem('user');
        setUser(userData ? JSON.parse(userData) : null);
      } catch {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderAvatar = (avatarString: string | undefined, size: number = 36) => {
    if (!avatarString) {
      return getInitials(user?.nombre_completo);
    }

    if (avatarString.startsWith('boring-avatar:')) {
      const parts = avatarString.split(':');
      const name = parts[1];
      const variant = parts[2];
      const colors = parts[3].split(',');
      
      return (
        <Avatar
          size={size}
          name={name}
          variant={variant as AvatarVariant}
          colors={colors}
        />
      );
    }

    // Si es una URL normal de imagen
    return (
      <Image 
        src={avatarString} 
        alt="Avatar" 
        width={size} 
        height={size} 
        className="w-full h-full object-cover"
      />
    );
  };

  const navLinks = (
    <>
      <Link href="/diccionario" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
        <BookOpen size={18} />
        <span>Diccionario</span>
      </Link>
      <Link href="/faq" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
        <MessageCircle size={18} />
        <span>FAQ</span>
      </Link>
      <Link href="/nosotros" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
        <Users size={18} />
        <span>Nosotros</span>
      </Link>
      {user && (
        <Link href="/contribuir" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
          <Plus size={18} />
          <span>Contribuir</span>
        </Link>
      )}
      {user?.rol === 'admin' ? (
        <Link href="/admin" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15H12.01M9 12H15M12 3C7 3 3 7 3 12C3 17 7 21 12 21C17 21 21 17 21 12C21 7 17 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Admin</span>
        </Link>
      ) : null}
      <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500 cursor-not-allowed">
        <Users size={18} />
        <span>Lecciones (Próximamente)</span>
      </span>
    </>
  );

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand name */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="Nahuatl Web Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-200"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                NAHUATLAHTOL
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks}
          </nav>

          {/* User menu / Auth */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isLoading ? (
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            ) : user ? (
              <>
                {/* Desktop user menu */}
                <div className="hidden lg:block">
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-transform hover:scale-105 overflow-hidden">
                      {renderAvatar(user.url_avatar, 36)}
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-150"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-100"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-60 origin-top-right bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700 rounded-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none border border-slate-200 dark:border-slate-700">
                        <div className="px-1 py-1">
                          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-sm text-slate-900 dark:text-slate-100 font-medium truncate">{user.nombre_completo || 'Usuario'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                          </div>
                          <Menu.Item>
                            {({ active }) => (
                              <Link href="/profile" className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} group flex rounded-md items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 transition-colors duration-150`}>
                                <UserIcon className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                                Mi Perfil
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link href="/dashboard" className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} group flex rounded-md items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 transition-colors duration-150`}>
                                <LayoutDashboard className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                                Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                        </div>
                        <div className="px-1 py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button 
                                onClick={handleLogout} 
                                className={`${active ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'} group flex rounded-md items-center w-full px-3 py-2 text-sm transition-colors duration-150`}
                              >
                                <LogOut className="mr-2 h-4 w-4" />
                                Cerrar Sesión
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-medium overflow-hidden">
                  {renderAvatar(user.url_avatar, 40)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.nombre_completo || 'Usuario'}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                </div>
              </div>

              {/* Navigation links */}
              <div className="flex flex-col space-y-2">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 px-2 py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon size={18} />
                  <span>Mi Perfil</span>
                </Link>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 px-2 py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                {navLinks}
              </div>

              {/* Logout button */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-2 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 border-t border-slate-200 dark:border-slate-700 pt-4"
              >
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
