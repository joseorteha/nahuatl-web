'use client';
import { useState, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Transition } from '@headlessui/react';
import { 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Menu as MenuIcon, 
  X, 
  BookOpen, 
  Users, 
  MessageCircle, 
  Plus, 
  Trophy,
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuthBackend } from '@/hooks/useAuthBackend';

export default function Header() {
  const { user, loading, signOut } = useAuthBackend();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) {
      const displayName = user?.nombre_completo || user?.email;
      if (!displayName) return 'U';
      return displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    }
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderAvatar = (avatarString: string | undefined, size: number = 40) => {
    const avatarUrl = user?.url_avatar;
    
    if (!avatarString && !avatarUrl) {
      return getInitials(user?.nombre_completo);
    }

    const finalAvatarString = avatarString || avatarUrl;

    if (finalAvatarString?.startsWith('boring-avatar:')) {
      const parts = finalAvatarString.split(':');
      const name = parts[1] || 'Usuario';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      return (
        <div 
          className="rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg"
          style={{ width: size, height: size }}
        >
          {initials}
        </div>
      );
    }

    if (!finalAvatarString) {
      return (
        <div 
          className="rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg"
          style={{ width: size, height: size }}
        >
          U
        </div>
      );
    }
    
    return (
      <Image 
        src={finalAvatarString} 
        alt="Avatar" 
        width={size} 
        height={size} 
        className="rounded-full object-cover shadow-lg"
      />
    );
  };

  const navLinks = (
    <>
      <Link href="/diccionario" className="group flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300">
        <BookOpen size={18} className="group-hover:scale-110 transition-transform duration-300" />
        <span className="font-medium text-sm">Diccionario</span>
      </Link>
      <Link href="/faq" className="group flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
        <MessageCircle size={18} className="group-hover:scale-110 transition-transform duration-300" />
        <span className="font-medium text-sm">FAQ</span>
      </Link>
      <Link href="/nosotros" className="group flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300">
        <Users size={18} className="group-hover:scale-110 transition-transform duration-300" />
        <span className="font-medium text-sm">Nosotros</span>
      </Link>
      {user && (
        <>
          <Link href="/contribuir" className="group flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300">
            <Plus size={18} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium text-sm">Contribuir</span>
          </Link>
          <Link href="/experiencia-social" className="group flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
            <Trophy size={18} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium text-sm">Experiencia Social</span>
          </Link>
        </>
      )}
      {user?.rol === 'admin' && (
        <Link href="/admin" className="group flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300">
          <Settings size={18} className="group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium text-sm">Admin</span>
        </Link>
      )}
      <div className="group flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 dark:text-slate-500 cursor-not-allowed">
        <HelpCircle size={18} />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Lecciones</span>
          <span className="text-xs">(Próximamente)</span>
        </div>
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo y brand minimalista */}
          <Link href={user ? "/dashboard" : "/"} className="group flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Image 
                  src="/logo.png" 
                  alt="Nawatlahtol Logo" 
                  width={24} 
                  height={24} 
                  className="object-contain filter brightness-0 invert"
                  priority
                />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all duration-300">
                NAWATLAHTOL
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Lengua Náhuatl Digital
              </span>
            </div>
          </Link>

          {/* Desktop Navigation mejorado */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks}
          </nav>

          {/* User menu / Auth mejorado */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {loading ? (
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
            ) : user ? (
              <>
                {/* Desktop user menu mejorado */}
                <div className="hidden lg:block">
                  <Menu as="div" className="relative">
                    <Menu.Button className="group flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300">
                      {renderAvatar(user.url_avatar, 36)}
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {user.nombre_completo || 'Usuario'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          @{user.username || 'usuario'}
                        </div>
                      </div>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95 translate-y-2"
                      enterTo="transform opacity-100 scale-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="transform opacity-100 scale-100 translate-y-0"
                      leaveTo="transform opacity-0 scale-95 translate-y-2"
                    >
                      <Menu.Items className="absolute right-0 mt-3 w-72 origin-top-right bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-1 py-2">
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              {renderAvatar(user.url_avatar, 48)}
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.nombre_completo || user.email || 'Usuario'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <Menu.Item>
                            {({ active }) => (
                              <Link href="/profile" className={`${active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'} group flex rounded-xl items-center w-full px-4 py-3 text-sm transition-all duration-200`}>
                                <UserIcon className="mr-3 h-5 w-5" />
                                Mi Perfil
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link href="/dashboard" className={`${active ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'} group flex rounded-xl items-center w-full px-4 py-3 text-sm transition-all duration-200`}>
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
                                onClick={handleLogout} 
                                className={`${active ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'} group flex rounded-xl items-center w-full px-4 py-3 text-sm transition-all duration-200`}
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
                </div>

                {/* Mobile menu button mejorado */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
                >
                  {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu mejorado */}
        {mobileMenuOpen && user && (
          <div className="lg:hidden py-6 border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-2">
              {/* User info mejorado */}
              <div className="flex items-center gap-4 px-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl mb-4">
                {renderAvatar(user.url_avatar, 48)}
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user.nombre_completo || user.email || 'Usuario'}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{user.email}</span>
                </div>
              </div>

              {/* Navigation links mejorados */}
              <div className="flex flex-col space-y-1">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon size={20} />
                  <span className="font-medium">Mi Perfil</span>
                </Link>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={20} />
                  <span className="font-medium">Dashboard</span>
                </Link>
                {navLinks}
              </div>

              {/* Logout button mejorado */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 border-t border-slate-200 dark:border-slate-700 pt-4 rounded-xl"
              >
                <LogOut size={20} />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}