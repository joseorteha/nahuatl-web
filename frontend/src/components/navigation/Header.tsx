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
  Sparkles,
  ChevronDown,
  Home,
  Shield
} from 'lucide-react';
import { ThemeToggle } from '../shared/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import NotificationCenter from '../features/notifications/NotificationCenter';

export default function Header() {
  const { user, loading, signOut } = useAuth();
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
          className="rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-slate-500 flex items-center justify-center text-white font-bold shadow-lg"
          style={{ width: size, height: size }}
        >
          {initials}
        </div>
      );
    }

    if (!finalAvatarString) {
      return (
        <div 
          className="rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-slate-500 flex items-center justify-center text-white font-bold shadow-lg"
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

  // Navegación principal organizada
  const mainNavLinks = [
    {
      name: 'Diccionario',
      href: '/diccionario',
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:text-blue-600 dark:hover:text-blue-400',
      bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
    }
  ];

  // Navegación de usuario (solo para logueados)
  const userNavLinks = [
    {
      name: 'Contribuir',
      href: '/contribuir',
      icon: Plus,
      color: 'text-orange-600 dark:text-orange-400',
      hoverColor: 'hover:text-orange-600 dark:hover:text-orange-400',
      bgColor: 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
    },
    {
      name: 'Comunidad',
      href: '/feedback',
      icon: MessageCircle,
      color: 'text-cyan-600 dark:text-cyan-400',
      hoverColor: 'hover:text-cyan-600 dark:hover:text-cyan-400',
      bgColor: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
    }
  ];

  // Navegación de admin (solo para admins)
  const adminNavLinks = [
    {
      name: 'Admin',
      href: '/admin',
      icon: Settings,
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:text-red-600 dark:hover:text-red-400',
      bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/20'
    }
  ];

  // Lecciones (ahora disponible)
  const leccionesLink = {
    name: 'Lecciones',
    href: '/lecciones',
    icon: HelpCircle,
    color: 'text-green-600 dark:text-green-400',
    hoverColor: 'hover:text-green-600 dark:hover:text-green-400',
    bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/20'
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-lg">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 px-3 sm:px-4 lg:px-6">
          {/* Logo y brand - Responsive */}
          <Link href={user ? "/dashboard" : "/"} className="group flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Image 
                src="/logooo.svg" 
                alt="Nawatlahtol Logo" 
                width={48} 
                height={48} 
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain group-hover:scale-105 transition-all duration-300"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 dark:from-cyan-400 dark:via-blue-400 dark:to-sky-400 bg-clip-text text-transparent group-hover:from-cyan-700 group-hover:via-blue-700 group-hover:to-sky-700 transition-all duration-300">
                  NAWATLAHTOL
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm">
                  BETA
                </span>
              </div>
              <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium tracking-wide hidden sm:block">
                TLAHTOLNEMILIZTLI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Responsive */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Navegación principal */}
            {mainNavLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className={`group flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${link.color} ${link.hoverColor} ${link.bgColor} border border-transparent hover:border-cyan-200/50 dark:hover:border-cyan-700/50`}
              >
                <link.icon size={16} className="group-hover:scale-110 transition-transform duration-300" />
                <span>{link.name}</span>
              </Link>
            ))}

            {/* Separador visual */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>

            {/* Navegación de usuario */}
            {user && userNavLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className={`group flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${link.color} ${link.hoverColor} ${link.bgColor} border border-transparent hover:border-cyan-200/50 dark:hover:border-cyan-700/50`}
              >
                <link.icon size={16} className="group-hover:scale-110 transition-transform duration-300" />
                <span>{link.name}</span>
              </Link>
            ))}

            {/* Navegación de admin */}
            {user?.rol === 'admin' && adminNavLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${link.color} ${link.hoverColor} ${link.bgColor} border border-transparent hover:border-cyan-200/50 dark:hover:border-cyan-700/50`}
              >
                <link.icon size={16} className="group-hover:scale-110 transition-transform duration-300" />
                <span>{link.name}</span>
              </Link>
            ))}

            {/* Lecciones */}
            <Link 
              href={leccionesLink.href} 
              className={`group flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${leccionesLink.color} ${leccionesLink.hoverColor} ${leccionesLink.bgColor} border border-transparent hover:border-green-200/50 dark:hover:border-green-700/50`}
            >
              <leccionesLink.icon size={16} className="group-hover:scale-110 transition-transform duration-300" />
              <span>{leccionesLink.name}</span>
            </Link>
          </nav>

          {/* User menu / Auth - Responsive */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            
            {/* Notification Center - Solo para usuarios logueados */}
            {user && <NotificationCenter />}
            
            {loading ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            ) : user ? (
              <>
                {/* Desktop user menu - Responsive */}
                <div className="hidden lg:block">
                  <Menu as="div" className="relative">
                    <Menu.Button className="group flex items-center gap-2 xl:gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 border border-transparent hover:border-cyan-200/50 dark:hover:border-cyan-700/50">
                      {renderAvatar(user.url_avatar, 32)}
                      <div className="text-left hidden xl:block">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                          {user.nombre_completo || 'Usuario'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          @{user.username || 'usuario'}
                        </div>
                      </div>
                      <ChevronDown size={16} className="text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300" />
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
                              <Link href="/profile" className={`${active ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'} group flex rounded-xl items-center w-full px-4 py-3 text-sm transition-all duration-200`}>
                                <UserIcon className="mr-3 h-5 w-5" />
                                Mi Perfil
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

                {/* Mobile menu button - Responsive */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 sm:p-3 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
                >
                  {mobileMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <MenuIcon size={20} className="sm:w-6 sm:h-6" />}
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Iniciar Sesión</span>
                <span className="sm:hidden">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu - Responsive */}
        {mobileMenuOpen && user && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <div className="px-3 sm:px-4 py-4 sm:py-6">
              {/* User info - Responsive */}
              <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl mb-4 sm:mb-6">
                {renderAvatar(user.url_avatar, 40)}
                <div className="flex flex-col flex-1">
                  <span className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">{user.nombre_completo || user.email || 'Usuario'}</span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{user.email}</span>
                </div>
                {/* Notification Center Mobile */}
                <div className="flex-shrink-0">
                  <NotificationCenter />
                </div>
              </div>

              {/* Navigation links - Responsive */}
              <div className="space-y-4 sm:space-y-6">
                {/* Sección Principal */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">PRINCIPAL</h3>
                  <div className="space-y-1">
                <Link 
                  href="/profile" 
                      className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-300 rounded-xl"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserIcon size={18} className="sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">Mi Perfil</span>
                    </Link>
                  </div>
                </div>

                {/* Sección Navegación */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">NAVEGACIÓN</h3>
                  <div className="space-y-1">
                    {mainNavLinks.map((link) => (
                      <Link 
                        key={link.name}
                        href={link.href} 
                        className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon size={18} className="sm:w-5 sm:h-5" />
                        <span className="font-medium text-sm sm:text-base">{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Sección Usuario */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">USUARIO</h3>
                  <div className="space-y-1">
                    {userNavLinks.map((link) => (
                      <Link 
                        key={link.name}
                        href={link.href} 
                        className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon size={18} className="sm:w-5 sm:h-5" />
                        <span className="font-medium text-sm sm:text-base">{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Sección Admin */}
                {user?.rol === 'admin' && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">ADMINISTRACIÓN</h3>
                    <div className="space-y-1">
                      {adminNavLinks.map((link) => (
                        <Link 
                          key={link.name}
                          href={link.href} 
                          className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <link.icon size={18} className="sm:w-5 sm:h-5" />
                          <span className="font-medium text-sm sm:text-base">{link.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lecciones */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">APRENDER</h3>
                  <div className="space-y-1">
                    <Link 
                      href={leccionesLink.href} 
                      className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 rounded-xl`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <leccionesLink.icon size={18} className="sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">{leccionesLink.name}</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Logout button - Responsive */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 sm:mt-6 rounded-xl w-full"
              >
                <LogOut size={18} className="sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
