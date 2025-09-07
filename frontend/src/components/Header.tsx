'use client';
import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { User as UserIcon, LogOut, LayoutDashboard, Menu as MenuIcon, X, BookOpen, Users, MessageCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  nombre_completo?: string;
  rol?: string;
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

  const navLinks = (
    <>
      <Link href="/diccionario" className="flex items-center gap-2 text-slate-700 hover:text-orange-600 transition-colors duration-200">
        <BookOpen size={18} />
        <span>Diccionario</span>
      </Link>
      <Link href="/contribuir" className="flex items-center gap-2 text-slate-700 hover:text-orange-600 transition-colors duration-200">
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Contribuir</span>
      </Link>
      <Link href="/feedback" className="flex items-center gap-2 text-slate-700 hover:text-orange-600 transition-colors duration-200">
        <MessageCircle size={18} />
        <span>Comunidad</span>
      </Link>
      {user?.rol === 'admin' || user?.rol === 'moderador' ? (
        <Link href="/admin" className="flex items-center gap-2 text-red-700 hover:text-red-600 transition-colors duration-200">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15H12.01M9 12H15M12 3C7 3 3 7 3 12C3 17 7 21 12 21C17 21 21 17 21 12C21 7 17 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Admin</span>
        </Link>
      ) : null}
      <span className="flex items-center gap-2 text-slate-400 cursor-not-allowed">
        <Users size={18} />
        <span>Lecciones (Próximamente)</span>
      </span>
    </>
  );

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand name */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="Nawatlajtol Logo" 
                width={36} 
                height={36} 
                className="rounded-md transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="font-medium text-lg text-slate-800 group-hover:text-orange-600 transition-colors duration-200">
              Nawatlahtol
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-9 h-9 bg-slate-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <ProfileMenu user={user} onLogout={handleLogout} getInitials={getInitials} />
            ) : (
              <Link 
                href="/login" 
                className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm"
              >
                Acceder
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
            >
              {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={mobileMenuOpen}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <div className="md:hidden bg-white border-t border-slate-200">
          <nav className="container-wide pt-3 pb-4 flex flex-col gap-3">
            {navLinks}
            <hr className="my-2 border-slate-200"/>
            {!user && (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)} 
                className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors duration-200"
              >
                Acceder
              </Link>
            )}
          </nav>
        </div>
      </Transition>
    </header>
  );
}

interface ProfileMenuProps {
  user: User;
  onLogout: () => void;
  getInitials: (name?: string) => string;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, onLogout, getInitials }) => (
  <Menu as="div" className="relative">
    <Menu.Button className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-orange-500 to-violet-600 text-white rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-transform hover:scale-105">
      {getInitials(user.nombre_completo)}
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
      <Menu.Items className="absolute right-0 mt-2 w-60 origin-top-right bg-white divide-y divide-slate-100 rounded-md shadow-lg ring-1 ring-black/5 focus:outline-none border border-slate-200">
        <div className="px-1 py-1">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-sm text-slate-900 font-medium truncate">{user.nombre_completo || 'Usuario'}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <Menu.Item>
            {({ active }) => (
              <Link href="/profile" className={`${active ? 'bg-slate-100' : ''} group flex rounded-md items-center w-full px-3 py-2 text-sm transition-colors duration-150`}>
                <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
                Mi Perfil
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link href="/dashboard" className={`${active ? 'bg-slate-100' : ''} group flex rounded-md items-center w-full px-3 py-2 text-sm transition-colors duration-150`}>
                <LayoutDashboard className="mr-2 h-4 w-4 text-slate-500" />
                Dashboard
              </Link>
            )}
          </Menu.Item>
        </div>
        <div className="px-1 py-1">
          <Menu.Item>
            {({ active }) => (
              <button 
                onClick={onLogout} 
                className={`${active ? 'bg-red-50 text-red-600' : 'text-slate-700'} group flex rounded-md items-center w-full px-3 py-2 text-sm transition-colors duration-150`}
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
);
