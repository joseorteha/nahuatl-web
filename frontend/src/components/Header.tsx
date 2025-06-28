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
  full_name?: string;
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
      <Link href="/diccionario" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium">
        <BookOpen size={18} />
        <span>Diccionario</span>
      </Link>
      <Link href="/feedback" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium">
        <MessageCircle size={18} />
        <span>Comunidad</span>
      </Link>
      <span className="flex items-center gap-2 text-gray-400 cursor-not-allowed font-medium">
        <Users size={18} />
        <span>Lecciones (Próximamente)</span>
      </span>
    </>
  );

  return (
    <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand name */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="relative">
              <Image src="/logo.png" alt="Nawatlajtol Logo" width={40} height={40} className="rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-200"/>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-amber-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <span className="font-bold text-xl text-gray-800 group-hover:text-emerald-700 transition-colors duration-200">Nawatlahtol</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-medium">
            {navLinks}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-200 to-amber-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <ProfileMenu user={user} onLogout={handleLogout} getInitials={getInitials} />
            ) : (
              <Link href="/login" className="hidden md:inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform hover:scale-105">
                Acceder
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={mobileMenuOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-lg">
          <nav className="container mx-auto px-4 pt-4 pb-6 flex flex-col gap-3">
            {navLinks}
            <hr className="my-2 border-gray-200"/>
            {!user && (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)} 
                className="w-full text-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md"
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
    <Menu.Button className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
      {getInitials(user.full_name)}
    </Menu.Button>
    <Transition
      as={Fragment}
      enter="transition ease-out duration-200"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-150"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute right-0 mt-3 w-64 origin-top-right bg-white/95 backdrop-blur-xl divide-y divide-gray-100 rounded-2xl shadow-xl ring-1 ring-black/5 focus:outline-none border border-gray-200/50">
        <div className="px-1 py-2">
          <div className="px-4 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-900 font-semibold truncate">{user.full_name || 'Usuario'}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          <Menu.Item>
            {({ active }) => (
              <Link href="/profile" className={`${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'} group flex rounded-xl items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200`}>
                <UserIcon className="mr-3 h-5 w-5" />
                Mi Perfil
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link href="/dashboard" className={`${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'} group flex rounded-xl items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200`}>
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            )}
          </Menu.Item>
        </div>
        <div className="px-1 py-2">
          <Menu.Item>
            {({ active }) => (
              <button 
                onClick={onLogout} 
                className={`${active ? 'bg-red-50 text-red-700' : 'text-gray-700'} group flex rounded-xl items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200`}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar Sesión
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
);
