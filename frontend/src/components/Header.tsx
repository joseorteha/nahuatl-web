'use client';
import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { User as UserIcon, LogOut, LayoutDashboard, Menu as MenuIcon, X } from 'lucide-react';

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
      <Link href="/diccionario" className="text-gray-600 hover:text-emerald-600 transition-colors">Diccionario</Link>
      <span className="text-gray-400 cursor-not-allowed">Lecciones (Próximamente)</span>
      <span className="text-gray-400 cursor-not-allowed">Práctica (Próximamente)</span>
    </>
  );

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand name */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <Image src="/logo.png" alt="Nawatlajtol Logo" width={40} height={40} className="rounded-lg"/>
            <span className="font-bold text-xl text-gray-800">Nawatlajtol</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 font-medium">
            {navLinks}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <ProfileMenu user={user} onLogout={handleLogout} getInitials={getInitials} />
            ) : (
              <Link href="/login" className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                Acceder
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="container mx-auto px-4 pt-4 pb-6 flex flex-col gap-4">
            {navLinks}
            <hr/>
            {!user && (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                Acceder
              </Link>
            )}
          </nav>
        </div>
      )}
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
    <Menu.Button className="flex items-center justify-center w-10 h-10 bg-emerald-500 text-white rounded-full font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
      {getInitials(user.full_name)}
    </Menu.Button>
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="px-1 py-1">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm text-gray-900 font-semibold truncate">{user.full_name || 'Usuario'}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          <Menu.Item>
            {({ active }) => (
              <Link href="/profile" className={`${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'} group flex rounded-md items-center w-full px-3 py-2 text-sm font-medium`}>
                <UserIcon className="mr-2 h-5 w-5" />Mi Perfil
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link href="/dashboard" className={`${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'} group flex rounded-md items-center w-full px-3 py-2 text-sm font-medium`}>
                <LayoutDashboard className="mr-2 h-5 w-5" />Dashboard
              </Link>
            )}
          </Menu.Item>
        </div>
        <div className="px-1 py-1">
          <Menu.Item>
            {({ active }) => (
              <button onClick={onLogout} className={`${active ? 'bg-red-50 text-red-700' : 'text-gray-700'} group flex rounded-md items-center w-full px-3 py-2 text-sm font-medium`}>
                <LogOut className="mr-2 h-5 w-5" />Cerrar Sesión
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
);
